/*
 * Dashboard — the administrator-only overview view.
 *
 * The view is reached only through the application router while a live
 * administrator session exists, so this module never renders for a visitor.
 * Every number comes from GET /api/admin/dashboard, which recalculates the
 * counts from the database at request time; nothing here is cached or shown
 * from memory once the view is re-entered.
 */

(function () {
  'use strict';

  const VIEW = 'dashboard';

  const EMPLOYMENT_STATUS_ORDER = ['Active', 'On Leave', 'Inactive'];
  const TASK_STATUS_ORDER = ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

  const LOAD_MESSAGE = 'Unable to load the dashboard right now.';
  const LOAD_DETAIL = 'Please try again.';
  const SESSION_MESSAGE = 'Your session has expired. Sign in again to view the dashboard.';

  const BADGE_BASE = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';

  const STATUS_BADGE_CLASSES = {
    Pending: 'bg-stone-100 text-stone-600',
    'In Progress': 'bg-sky-50 text-sky-700',
    Completed: 'bg-emerald-50 text-emerald-700',
    'On Hold': 'bg-amber-50 text-amber-700',
    Cancelled: 'bg-red-50 text-red-600'
  };

  const PRIORITY_BADGE_CLASSES = {
    Low: 'bg-stone-100 text-stone-600',
    Medium: 'bg-teal-50 text-teal-700',
    High: 'bg-amber-50 text-amber-700',
    Urgent: 'bg-red-50 text-red-600'
  };

  const NEUTRAL_BADGE_CLASSES = 'bg-stone-100 text-stone-600';

  const STATUS_LINK_CLASSES =
    'flex min-h-[48px] items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-stone-50';

  const PANEL_EMPTY_CLASSES = 'mt-4 hidden text-sm text-stone-500';

  let api = null;
  let started = false;

  let loadToken = 0;

  const els = {};

  function byId(id) {
    return document.getElementById(id);
  }

  function show(element) {
    if (element) {
      element.classList.remove('hidden');
    }
  }

  function hide(element) {
    if (element) {
      element.classList.add('hidden');
    }
  }

  function setText(element, text) {
    if (element) {
      element.textContent = text === null || text === undefined ? '' : String(text);
    }
  }

  function readText(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function readCount(map, key) {
    if (map && typeof map === 'object' && typeof map[key] === 'number') {
      return map[key];
    }

    return 0;
  }

  function cacheElements() {
    els.viewHeading = byId('dashboard-title');
    els.announce = byId('dashboard-announce');
    els.loading = byId('dashboard-loading');
    els.error = byId('dashboard-error');
    els.errorMessage = byId('dashboard-error-message');
    els.errorDetail = byId('dashboard-error-detail');
    els.retry = byId('dashboard-retry');
    els.content = byId('dashboard-content');
    els.staffTotal = byId('dashboard-staff-total');
    els.staffActive = byId('dashboard-staff-active');
    els.tasksTotal = byId('dashboard-tasks-total');
    els.tasksOverdue = byId('dashboard-tasks-overdue');
    els.staffStatuses = byId('dashboard-staff-statuses');
    els.taskStatuses = byId('dashboard-task-statuses');
    els.overdueList = byId('dashboard-overdue-list');
    els.overdueEmpty = byId('dashboard-overdue-empty');
    els.topStaffList = byId('dashboard-top-staff-list');
    els.topStaffEmpty = byId('dashboard-top-staff-empty');
    els.recentList = byId('dashboard-recent-list');
    els.recentEmpty = byId('dashboard-recent-empty');
  }

  function bindEvents() {
    if (els.retry) {
      els.retry.addEventListener('click', loadDashboard);
    }

    document.addEventListener('staffdirectory:view', function (event) {
      const detail = event && event.detail;

      if (detail && detail.view === VIEW) {
        loadDashboard();
      }
    });
  }

  function handleSessionExpired() {
    const auth = window.StaffDirectoryAuth;

    if (auth && typeof auth.handleSessionExpired === 'function') {
      auth.handleSessionExpired(SESSION_MESSAGE);
      return;
    }

    showError(SESSION_MESSAGE, 'Please try again.');
  }

  function showLoading() {
    show(els.loading);
    hide(els.error);
    hide(els.content);
  }

  function showError(message, detail) {
    hide(els.loading);
    hide(els.content);

    if (els.errorMessage && message) {
      els.errorMessage.textContent = message;
    }

    if (els.errorDetail && detail) {
      els.errorDetail.textContent = detail;
    }

    show(els.error);
  }

  function showContent() {
    hide(els.loading);
    hide(els.error);
    show(els.content);
  }

  /**
   * A small, purely decorative proportion bar. The visible text beside it
   * carries the actual number, so the bar never needs a colour to make sense.
   */
  function buildProportionBar(percentage) {
    const track = document.createElement('span');
    track.className = 'relative h-1.5 w-16 overflow-hidden rounded-full bg-stone-100';
    track.setAttribute('aria-hidden', 'true');

    const fill = document.createElement('span');
    fill.className = 'absolute inset-y-0 left-0 rounded-full bg-teal-600';
    fill.style.width = percentage + '%';

    track.appendChild(fill);
    return track;
  }

  /**
   * One row per known label (zero counts included). Each row is a link that
   * takes the owner to the relevant view with that filter already applied.
   */
  function renderStatusList(list, labels, counts, total, buildHref, emptyText) {
    list.textContent = '';

    const hasAny = labels.some(function (name) {
      return readCount(counts, name) > 0;
    });

    if (!hasAny && total === 0 && emptyText) {
      const li = document.createElement('li');
      const p = document.createElement('p');
      p.className = 'py-2 text-sm text-stone-500';
      p.textContent = emptyText;
      li.appendChild(p);
      list.appendChild(li);
      return;
    }

    labels.forEach(function (name) {
      const count = readCount(counts, name);
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

      const li = document.createElement('li');

      const link = document.createElement('a');
      link.href = buildHref(name);
      link.className = STATUS_LINK_CLASSES;

      const left = document.createElement('span');
      left.className = 'flex min-w-0 items-center gap-3';
      left.appendChild(document.createTextNode(name));
      left.appendChild(buildProportionBar(percentage));

      const countLabel = document.createElement('span');
      countLabel.className = 'text-sm font-medium text-stone-900';
      countLabel.textContent = String(count);

      link.appendChild(left);
      link.appendChild(countLabel);

      li.appendChild(link);
      list.appendChild(li);
    });
  }

  function buildTaskRow(task) {
    const source = task && typeof task === 'object' ? task : {};

    const li = document.createElement('li');
    li.className = 'py-3';

    const row = document.createElement('div');
    row.className = 'flex flex-wrap items-start justify-between gap-x-3 gap-y-1';

    const info = document.createElement('div');
    info.className = 'min-w-0';

    const title = document.createElement('p');
    title.className = 'min-w-0 truncate text-sm font-medium text-stone-900';
    title.textContent = readText(source.title) || 'Untitled task';
    title.title = readText(source.title) || 'Untitled task';

    const meta = document.createElement('p');
    meta.className = 'mt-0.5 text-xs text-stone-500';
    meta.textContent =
      'Assigned to ' +
      (readText(source.staff_full_name) || 'Staff #' + source.staff_id) +
      (source.due_date ? ' · Due ' + source.due_date : '') +
      (source.priority ? ' · ' + source.priority + ' priority' : '');

    info.appendChild(title);
    info.appendChild(meta);

    const statusBadge = document.createElement('span');
    statusBadge.className =
      BADGE_BASE + ' ' + (STATUS_BADGE_CLASSES[source.status] || NEUTRAL_BADGE_CLASSES);
    statusBadge.textContent = source.status || '—';

    row.appendChild(info);
    row.appendChild(statusBadge);

    li.appendChild(row);
    return li;
  }

  function renderSummary(data) {
    const staff = (data && data.staff) || {};
    const tasks = (data && data.tasks) || {};

    setText(els.staffTotal, readCount(staff, 'total'));
    setText(els.staffActive, readCount(staff.by_status, 'Active'));
    setText(els.tasksTotal, readCount(tasks, 'total'));
    setText(els.tasksOverdue, readCount(tasks, 'overdue'));
  }

  function renderStaffStatuses(data) {
    const staff = (data && data.staff) || {};
    const total = readCount(staff, 'total');

    renderStatusList(
      els.staffStatuses,
      EMPLOYMENT_STATUS_ORDER,
      staff.by_status,
      total,
      function (name) {
        return '#directory?status=' + encodeURIComponent(name);
      },
      'No staff members recorded yet.'
    );
  }

  function renderTaskStatuses(data) {
    const tasks = (data && data.tasks) || {};
    const total = readCount(tasks, 'total');

    renderStatusList(
      els.taskStatuses,
      TASK_STATUS_ORDER,
      tasks.by_status,
      total,
      function (name) {
        return '#tasks?status=' + encodeURIComponent(name);
      },
      'No tasks recorded yet.'
    );
  }

  function renderOverdue(data) {
    const tasks = (data && data.tasks) || {};
    const list = Array.isArray(tasks.overdue_tasks) ? tasks.overdue_tasks : [];

    els.overdueList.textContent = '';

    if (list.length === 0) {
      hide(els.overdueList);
      show(els.overdueEmpty);
      return;
    }

    hide(els.overdueEmpty);
    show(els.overdueList);

    list.forEach(function (task) {
      els.overdueList.appendChild(buildTaskRow(task));
    });
  }

  function renderTopStaff(data) {
    const tasks = (data && data.tasks) || {};
    const list = Array.isArray(tasks.top_open_staff) ? tasks.top_open_staff : [];

    els.topStaffList.textContent = '';

    if (list.length === 0) {
      hide(els.topStaffList);
      show(els.topStaffEmpty);
      return;
    }

    hide(els.topStaffEmpty);
    show(els.topStaffList);

    list.forEach(function (member) {
      const li = document.createElement('li');

      const link = document.createElement('a');
      link.href = '#tasks?staff_id=' + encodeURIComponent(member.staff_id);
      link.className = STATUS_LINK_CLASSES;

      const name = document.createElement('span');
      name.className = 'min-w-0 text-sm font-medium text-stone-700';
      name.textContent = readText(member.full_name) || 'Staff #' + member.staff_id;
      name.title = readText(member.full_name) || ('Staff #' + member.staff_id);

      const count = document.createElement('span');
      count.className = 'text-sm text-stone-500';
      count.textContent = String(member.open_tasks) + ' open task' + (member.open_tasks === 1 ? '' : 's');

      link.appendChild(name);
      link.appendChild(count);

      li.appendChild(link);
      els.topStaffList.appendChild(li);
    });
  }

  function renderRecent(data) {
    const tasks = (data && data.tasks) || {};
    const list = Array.isArray(tasks.recent_tasks) ? tasks.recent_tasks : [];

    els.recentList.textContent = '';

    if (list.length === 0) {
      hide(els.recentList);
      show(els.recentEmpty);
      return;
    }

    hide(els.recentEmpty);
    show(els.recentList);

    list.forEach(function (task) {
      els.recentList.appendChild(buildTaskRow(task));
    });
  }

  function announce(data) {
    if (!els.announce) {
      return;
    }

    const staff = (data && data.staff) || {};
    const tasks = (data && data.tasks) || {};

    setText(
      els.announce,
      'Dashboard loaded. ' +
        readCount(staff, 'total') +
        ' staff and ' +
        readCount(tasks, 'total') +
        ' tasks.'
    );
  }

  function renderDashboard(data) {
    renderSummary(data);
    renderStaffStatuses(data);
    renderTaskStatuses(data);
    renderOverdue(data);
    renderTopStaff(data);
    renderRecent(data);
    announce(data);
    showContent();
  }

  async function loadDashboard() {
    const token = ++loadToken;

    showLoading();

    try {
      const data = await api.getDashboard();

      if (token !== loadToken) {
        return;
      }

      renderDashboard(data);
    } catch (error) {
      if (token !== loadToken) {
        return;
      }

      if (error && error.status === 401) {
        handleSessionExpired();
        return;
      }

      showError(LOAD_MESSAGE, LOAD_DETAIL);
    }
  }

  function init() {
    if (started) {
      return;
    }

    api = window.StaffDirectoryApi;

    if (!api || typeof api.getDashboard !== 'function') {
      console.error('Staff Directory Dashboard module could not start: the API layer is missing.');
      return;
    }

    started = true;
    cacheElements();
    bindEvents();
  }

  window.StaffDirectoryDashboard = {
    init
  };
})();