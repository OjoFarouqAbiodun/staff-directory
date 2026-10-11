/*
 * Tasks — the administrator-only task management view.
 *
 * The view is reached only through the application router while a live
 * administrator session exists, so this module never renders for a visitor.
 * All task writes go through the protected /api/tasks endpoints; the browser
 * is a convenience layer and the backend remains the authority on access and
 * validation.
 */

(function () {
  'use strict';

  const VIEW = 'tasks';

  const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
  const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];

  const DEFAULT_PRIORITY = 'Medium';

  const TITLE_MAX = 200;
  const DESCRIPTION_MAX = 2000;
  const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  const LOAD_MESSAGE = 'Unable to load tasks right now.';
  const LOAD_DETAIL = 'Please try again.';
  const ACTION_FALLBACK = 'Unable to complete that action right now. Please try again.';
  const OPTIONS_MESSAGE = 'Unable to load the staff list right now.';
  const SESSION_MESSAGE = 'Your session has expired. Sign in again to manage tasks.';

  const IDLE_LABELS = { create: 'Create task', edit: 'Save changes' };
  const BUSY_LABELS = { create: 'Creating task…', edit: 'Saving changes…' };
  const DELETE_IDLE_LABEL = 'Delete task';
  const DELETE_BUSY_LABEL = 'Deleting…';

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

  const FORM_FIELDS = [
    { key: 'title', inputId: 'task-title', errorId: 'task-title-error' },
    { key: 'staffId', inputId: 'task-staff', errorId: 'task-staff-error' },
    { key: 'priority', inputId: 'task-priority', errorId: 'task-priority-error' },
    { key: 'description', inputId: 'task-description', errorId: 'task-description-error' },
    { key: 'dueDate', inputId: 'task-due', errorId: 'task-due-error' }
  ];

  const FIELD_KEYS = FORM_FIELDS.map(function (field) {
    return field.key;
  });

  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let api = null;
  let started = false;

  const filters = {
    staffId: '',
    status: '',
    priority: ''
  };

  let staffOptions = [];
  let staffState = 'idle';
  let tasks = [];

  /* A staff filter requested through the URL while the staff options have not
     loaded yet; applied once the options are filled in. */
  let pendingStaffId = null;

  let loadToken = 0;
  const statusBusy = new Set();
  let submitting = false;
  let deleting = false;

  let modalMode = null;
  let modalTask = null;
  let modalTrigger = null;
  let deleteTask = null;
  let deleteTrigger = null;

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

  function setText(element, value) {
    if (element) {
      element.textContent = value;
    }
  }

  function readText(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function valueOf(id) {
    const element = byId(id);

    return element && typeof element.value === 'string' ? element.value.trim() : '';
  }

  function readFieldValue(field) {
    return (field && typeof field.value === 'string' ? field.value : '').trim();
  }

  function messageForError(error, fallback) {
    return error && typeof error.message === 'string' && error.message
      ? error.message
      : fallback;
  }

  function shouldLogError(error) {
    return !(error && typeof error.status === 'number' && error.status >= 400 && error.status < 500);
  }

  function announce(message) {
    if (!els.announce) {
      return;
    }

    els.announce.textContent = '';
    void els.announce.offsetWidth;
    els.announce.textContent = message;
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    if (typeof text === 'string') {
      element.textContent = text;
    }

    return element;
  }

  function buildOption(value, label, selected) {
    const option = document.createElement('option');

    option.value = value;
    option.textContent = label;
    option.selected = Boolean(selected);

    return option;
  }

  function buildBadge(label, className) {
    return createElement('span', BADGE_BASE + ' ' + (className || NEUTRAL_BADGE_CLASSES), label);
  }

  function formatDate(value) {
    if (!value) {
      return '';
    }

    const date = new Date(String(value) + 'T00:00:00Z');

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function formatDateTime(value) {
    if (!value) {
      return '';
    }

    const parts = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(value));

    if (!parts) {
      return String(value);
    }

    const date = new Date(
      Date.UTC(
        Number(parts[1]),
        Number(parts[2]) - 1,
        Number(parts[3]),
        Number(parts[4]),
        Number(parts[5]),
        parts[6] ? Number(parts[6]) : 0
      )
    );

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return (
      date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' +
      date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    );
  }

  function metaRow(labelText, valueText) {
    const row = createElement('div', 'flex items-center gap-1');

    row.appendChild(createElement('dt', 'text-stone-400', labelText));
    row.appendChild(createElement('dd', 'text-stone-600', valueText));

    return row;
  }

  /*
   * State helpers for the main task list area.
   */
  function showTaskLoading() {
    hide(els.empty);
    hide(els.error);
    hide(els.list);
    show(els.loading);
  }

  function hideTaskLoading() {
    hide(els.loading);
  }

  function showTaskEmpty() {
    hide(els.list);
    show(els.empty);
  }

  function showTaskList() {
    hide(els.empty);
    show(els.list);
  }

  function hideTaskError() {
    hide(els.error);
  }

  function showTaskError(message, detail) {
    setText(els.errorMessage, message);
    setText(els.errorDetail, detail);
    show(els.error);
  }

  function updateTaskCount() {
    const count = tasks.length;

    setText(els.count, count === 1 ? '1 task' : count + ' tasks');
  }

  /*
   * Feedback banners for completed actions.
   */
  function showSuccessBanner(message) {
    setText(els.statusMessage, message);
    show(els.status);
  }

  function hideSuccessBanner() {
    setText(els.statusMessage, '');
    hide(els.status);
  }

  function showActionError(message) {
    setText(els.actionErrorMessage, message);
    show(els.actionError);
  }

  function hideActionError() {
    setText(els.actionErrorMessage, '');
    hide(els.actionError);
  }

  function focusViewHeading() {
    if (els.viewHeading) {
      els.viewHeading.focus({ preventScroll: true });
    }
  }

  function handleSessionExpired() {
    closeAllDialogStates();

    const auth = window.StaffDirectoryAuth;

    if (auth && typeof auth.handleSessionExpired === 'function') {
      auth.handleSessionExpired(SESSION_MESSAGE);
      return;
    }

    showActionError(SESSION_MESSAGE);
  }

  /*
   * Staff options shared by the filter select and the assignment select.
   */
  function staffName(staffMember) {
    const member = staffMember || {};
    const firstName = readText(member.first_name);
    const lastName = readText(member.last_name);

    return (
      readText(member.full_name) ||
      [firstName, lastName].filter(Boolean).join(' ') ||
      'Staff #' + member.id
    );
  }

  function fillStaffFilter() {
    const select = els.filterStaff;

    if (!select) {
      return;
    }

    const current = select.value;

    if (staffState === 'loading') {
      select.replaceChildren(buildOption('', 'Loading staff…'));
      select.disabled = true;
      hide(els.staffWarning);
      return;
    }

    if (staffState === 'error') {
      select.replaceChildren(buildOption('', 'Staff list unavailable'));
      select.disabled = true;
      show(els.staffWarning);
      return;
    }

    hide(els.staffWarning);

    if (staffOptions.length === 0) {
      select.replaceChildren(buildOption('', 'No staff yet'));
      select.disabled = true;
      return;
    }

    const options = [buildOption('', 'All staff')];

    staffOptions.forEach(function (staffMember) {
      options.push(buildOption(String(staffMember.id), staffName(staffMember)));
    });

    select.replaceChildren.apply(select, options);
    select.disabled = false;

    if (pendingStaffId !== null) {
      if (options.some(function (option) { return option.value === pendingStaffId; })) {
        filters.staffId = pendingStaffId;
      }

      pendingStaffId = null;
    }

    if (options.some(function (option) { return option.value === filters.staffId; })) {
      select.value = filters.staffId;
    } else if (options.some(function (option) { return option.value === current; })) {
      select.value = current;
    } else {
      select.value = '';
    }
  }

  function fillFormStaffSelect() {
    const select = els.formStaff;

    if (!select) {
      return;
    }

    const current = select.value;

    if (staffState === 'loading') {
      select.replaceChildren(buildOption('', 'Loading staff…'));
      select.disabled = true;
      return;
    }

    if (staffState === 'error') {
      select.replaceChildren(buildOption('', 'Staff list unavailable'));
      select.disabled = true;
      return;
    }

    if (staffOptions.length === 0) {
      select.replaceChildren(buildOption('', 'No staff available yet'));
      select.disabled = true;
      return;
    }

    const options = [buildOption('', 'Choose a staff member')];

    staffOptions.forEach(function (staffMember) {
      options.push(buildOption(String(staffMember.id), staffName(staffMember)));
    });

    select.replaceChildren.apply(select, options);
    select.disabled = false;

    if (options.some(function (option) { return option.value === current; })) {
      select.value = current;
    } else if (modalTask && options.some(function (option) { return option.value === String(modalTask.staff_id); })) {
      select.value = String(modalTask.staff_id);
    } else {
      select.value = '';
    }
  }

  function fillStaffSelects() {
    fillStaffFilter();
    fillFormStaffSelect();
  }

  async function loadStaffOptions() {
    if (staffState === 'loading') {
      return;
    }

    staffState = 'loading';
    fillStaffSelects();

    try {
      const staff = await api.getStaff();
      staffState = 'ready';
      staffOptions = Array.isArray(staff) ? staff : [];
      fillStaffSelects();
    } catch (error) {
      staffState = 'error';
      fillStaffSelects();

      if (shouldLogError(error)) {
        console.error('Staff Directory failed to load the staff list for tasks:', (error && error.message) || error);
      }
    }
  }

  function ensureStaffOptions() {
    if (staffState === 'loading' || staffState === 'ready') {
      return;
    }

    loadStaffOptions();
  }

  /*
   * Task list rendering.
   */
  function renderTaskCard(task) {
    const item = createElement('li');
    const article = createElement(
      'article',
      'flex h-full flex-col rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition-colors duration-200'
    );

    article.dataset.taskId = String(task.id);

    const header = createElement('div', 'flex flex-wrap items-start justify-between gap-3');
    const titleGroup = createElement('div', 'min-w-0 flex-1');

    titleGroup.appendChild(createElement('h3', 'text-sm font-semibold text-stone-900', task.title));

    const staffMember = task.staff || {};
    const assignedName = staffName(staffMember);
    const staffRow = createElement('p', 'mt-1 text-sm text-stone-500');

    if (staffMember.id != null && staffMember.id >= 1) {
      const staffButton = createElement(
        'button',
        'inline-flex min-h-[44px] -my-1.5 items-start rounded font-medium text-stone-700 underline-offset-2 hover:underline',
        assignedName
      );

      staffButton.type = 'button';
      staffButton.dataset.taskStaff = '';
      staffButton.dataset.staffId = String(staffMember.id);
      staffRow.appendChild(staffButton);
    } else {
      staffRow.textContent = assignedName;
    }

    const jobTitle = readText(staffMember.job_title);

    if (jobTitle) {
      staffRow.appendChild(createElement('span', 'text-stone-400', ' · ' + jobTitle));
    }

    titleGroup.appendChild(staffRow);
    header.appendChild(titleGroup);

    const badges = createElement('div', 'flex flex-wrap gap-1.5');

    badges.appendChild(buildBadge(readText(task.priority) || DEFAULT_PRIORITY, PRIORITY_BADGE_CLASSES[task.priority]));
    badges.appendChild(buildBadge(readText(task.status) || 'Pending', STATUS_BADGE_CLASSES[task.status]));
    header.appendChild(badges);
    article.appendChild(header);

    const description = readText(task.description);

    if (description) {
      article.appendChild(createElement('p', 'mt-3 text-sm leading-relaxed text-stone-600', description));
    }

    const meta = createElement('dl', 'mt-4 grid grid-cols-1 gap-2 text-xs text-stone-500 sm:grid-cols-2');

    meta.appendChild(metaRow('Due', formatDate(task.due_date) || 'No due date'));
    meta.appendChild(metaRow('Updated', formatDateTime(task.updated_at) || 'Not yet'));
    article.appendChild(meta);

    const actions = createElement('div', 'mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4');
    const statusLabel = createElement('label', 'sr-only', 'Change status for ' + task.title);
    const statusSelect = createElement(
      'select',
      'min-h-[48px] min-w-[10rem] flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none'
    );

    statusLabel.htmlFor = 'task-status-' + task.id;
    statusSelect.id = 'task-status-' + task.id;
    statusSelect.dataset.taskStatus = '';

    STATUS_OPTIONS.forEach(function (status) {
      statusSelect.appendChild(buildOption(status, status, status === (task.status || 'Pending')));
    });

    actions.appendChild(statusLabel);
    actions.appendChild(statusSelect);

    const buttonGroup = createElement('div', 'flex gap-2');
    const editButton = createElement(
      'button',
      'min-h-[48px] rounded-md border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors duration-200 hover:bg-stone-50',
      'Edit'
    );

    editButton.type = 'button';
    editButton.dataset.taskEdit = '';
    buttonGroup.appendChild(editButton);

    const deleteButton = createElement(
      'button',
      'min-h-[48px] rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-colors duration-200 hover:bg-red-50',
      'Delete'
    );

    deleteButton.type = 'button';
    deleteButton.dataset.taskDelete = '';
    buttonGroup.appendChild(deleteButton);

    actions.appendChild(buttonGroup);
    article.appendChild(actions);
    item.appendChild(article);

    return item;
  }

  function renderTaskList() {
    if (!els.list) {
      return;
    }

    const fragment = document.createDocumentFragment();

    tasks.forEach(function (task) {
      fragment.appendChild(renderTaskCard(task));
    });

    els.list.replaceChildren(fragment);
  }

  function findTask(idValue) {
    const id = Number(idValue);

    return tasks.find(function (task) {
      return Number(task.id) === id;
    }) || null;
  }

  /*
   * Loading tasks.
   */
  async function loadTasks() {
    const token = ++loadToken;

    hideActionError();
    setText(els.count, 'Loading…');
    showTaskLoading();

    try {
      const data = await api.getTasks({
        staff_id: filters.staffId,
        status: filters.status,
        priority: filters.priority
      });

      if (token !== loadToken) {
        return;
      }

      tasks = Array.isArray(data) ? data : [];
      renderTaskList();
      updateTaskCount();
      hideTaskLoading();

      if (tasks.length === 0) {
        showTaskEmpty();
      } else {
        showTaskList();
      }
    } catch (error) {
      if (token !== loadToken) {
        return;
      }

      hideTaskLoading();
      hide(els.list);

      if (error && error.status === 401) {
        handleSessionExpired();
        return;
      }

      if (shouldLogError(error)) {
        console.error('Staff Directory failed to load tasks:', (error && error.message) || error);
      }

      updateTaskCount();
      showTaskError(messageForError(error, LOAD_MESSAGE), LOAD_DETAIL);
    }
  }

  /*
   * Filtering.
   */
  function handleFilterChange(event) {
    const target = event.target;

    if (!target || typeof target.value !== 'string') {
      return;
    }

    if (target.id === 'tasks-filter-staff') {
      filters.staffId = target.value;
    } else if (target.id === 'tasks-filter-status') {
      filters.status = target.value;
    } else if (target.id === 'tasks-filter-priority') {
      filters.priority = target.value;
    } else {
      return;
    }

    loadTasks();
  }

  function clearFilters() {
    filters.staffId = '';
    filters.status = '';
    filters.priority = '';

    if (els.filterStaff) {
      els.filterStaff.value = '';
    }

    if (els.filterStatus) {
      els.filterStatus.value = '';
    }

    if (els.filterPriority) {
      els.filterPriority.value = '';
    }

    loadTasks();
  }

  /*
   * Links from the dashboard carry a filter intent in the fragment query
   * (for example `#tasks?status=Pending` or `#tasks?staff_id=4`). When the
   * view is entered with one, only that intent is applied — a plain `#tasks`
   * keeps whatever filters were last chosen. Anything not recognised is
   * ignored and the URL is restored to a clean `#tasks`.
   */
  function applyQueryIntent() {
    const queryIndex = window.location.hash.indexOf('?');

    if (queryIndex === -1) {
      return false;
    }

    let params;

    try {
      params = new URLSearchParams(window.location.hash.slice(queryIndex + 1));
    } catch (error) {
      return false;
    }

    const status = readText(params.get('status'));
    const priority = readText(params.get('priority'));
    const staffId = readText(params.get('staff_id'));

    const statusValid = Boolean(status && STATUS_OPTIONS.indexOf(status) !== -1);
    const priorityValid = Boolean(priority && PRIORITY_OPTIONS.indexOf(priority) !== -1);
    const staffValid = Boolean(staffId && /^\d+$/.test(staffId));

    if (!statusValid && !priorityValid && !staffValid) {
      /* An unrecognised query (or none at all) leaves the current filters
         alone, so a plain `#tasks` never resets what the user chose. */
      return false;
    }

    /*
     * A link from the dashboard is a complete filter command: anything not
     * part of the link is reset first, so arriving with `#tasks?status=Pending`
     * never inherits an old staff or priority choice.
     */
    filters.staffId = '';
    filters.status = '';
    filters.priority = '';
    pendingStaffId = null;

    if (els.filterStaff) {
      els.filterStaff.value = '';
    }

    if (els.filterStatus) {
      els.filterStatus.value = '';
    }

    if (els.filterPriority) {
      els.filterPriority.value = '';
    }

    if (statusValid) {
      filters.status = status;

      if (els.filterStatus) {
        els.filterStatus.value = status;
      }
    }

    if (priorityValid) {
      filters.priority = priority;

      if (els.filterPriority) {
        els.filterPriority.value = priority;
      }
    }

    if (staffValid) {
      if (staffState === 'ready' && staffOptions.some(function (member) { return String(member.id) === staffId; })) {
        filters.staffId = staffId;

        if (els.filterStaff) {
          els.filterStaff.value = staffId;
        }
      } else {
        /* The options are not ready yet; the staff filter is re-validated and
           applied by fillStaffFilter() once they load. An unknown staff id is
           dropped there rather than turning the view into an error state. */
        pendingStaffId = staffId;
      }
    }

    history.replaceState(null, '', '#tasks');
    return true;
  }

  /*
   * Status changes (the only path that edits a task's status).
   */
  async function handleStatusChange(taskId, status) {
    if (!taskId || statusBusy.has(taskId)) {
      return;
    }

    const article = els.list ? els.list.querySelector('article[data-task-id="' + taskId + '"]') : null;
    const select = article ? article.querySelector('[data-task-status]') : null;

    if (select) {
      select.disabled = true;
    }

    statusBusy.add(taskId);

    try {
      await api.updateTaskStatus(taskId, status);
      announce('Status updated to ' + status + '.');
      showSuccessBanner('Status updated to ' + status + '.');
      await loadTasks();
      focusViewHeading();
    } catch (error) {
      if (error && error.status === 401) {
        handleSessionExpired();
        return;
      }

      if (shouldLogError(error)) {
        console.error('Staff Directory failed to update the task status:', (error && error.message) || error);
      }

      const task = findTask(taskId);

      if (select) {
        if (task) {
          select.value = task.status;
        }

        select.disabled = false;
      }

      showActionError(messageForError(error, ACTION_FALLBACK));
    } finally {
      statusBusy.delete(taskId);
    }
  }

  /*
   * Dialogs.
   */
  function isTaskDialogOpen() {
    if (els.deleteModal && !els.deleteModal.classList.contains('hidden')) {
      return els.deleteModal;
    }

    if (els.modal && !els.modal.classList.contains('hidden')) {
      return els.modal;
    }

    return null;
  }

  function openDialog(element, focusElement) {
    if (!element) {
      return;
    }

    element.classList.remove('hidden');
    element.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');

    void element.offsetWidth;

    element.classList.add('is-open');

    const target = focusElement || element.querySelector(FOCUSABLE_SELECTOR);

    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  }

  function closeDialog(element, trigger) {
    if (!element || element.classList.contains('hidden')) {
      return;
    }

    element.classList.remove('is-open');
    element.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');

    if (trigger && typeof trigger.focus === 'function' && document.body.contains(trigger)) {
      trigger.focus();
    }

    const finish = function () {
      if (element.classList.contains('is-open')) {
        return;
      }

      element.classList.add('hidden');
    };

    element.addEventListener('transitionend', finish, { once: true });
    window.setTimeout(finish, 240);
  }

  function closeAllDialogStates() {
    closeDialog(els.modal, null);
    closeDialog(els.deleteModal, null);
  }

  function setSubmitting(active) {
    submitting = active;

    if (els.form) {
      els.form.setAttribute('aria-busy', active ? 'true' : 'false');
    }

    if (els.submit) {
      els.submit.disabled = active;
    }

    if (els.submitLabel) {
      const mode = modalMode === 'edit' ? 'edit' : 'create';

      setText(els.submitLabel, active ? BUSY_LABELS[mode] : IDLE_LABELS[mode]);
    }

    if (els.formCancel) {
      els.formCancel.disabled = active;
    }

    if (els.modalClose) {
      els.modalClose.disabled = active;
    }
  }

  function setDeleting(active) {
    deleting = active;

    if (els.deleteConfirm) {
      els.deleteConfirm.disabled = active;
    }

    if (els.deleteConfirmLabel) {
      setText(els.deleteConfirmLabel, active ? DELETE_BUSY_LABEL : DELETE_IDLE_LABEL);
    }

    if (els.deleteCancel) {
      els.deleteCancel.disabled = active;
    }

    if (els.deleteClose) {
      els.deleteClose.disabled = active;
    }
  }

  function openTaskModal(mode, task, trigger) {
    if (submitting) {
      return;
    }

    closeDialog(els.deleteModal, null);

    modalMode = mode;
    modalTask = task || null;
    modalTrigger = trigger || document.activeElement;

    clearFormError();
    clearAllFieldErrors();
    fillFormStaffSelect();
    setSubmitting(false);

    setText(els.modalTitle, mode === 'edit' ? 'Edit task' : 'Create task');

    const titleInput = byId('task-title');
    const descriptionInput = byId('task-description');
    const dueInput = byId('task-due');
    const prioritySelect = byId('task-priority');
    const staffSelect = els.formStaff;

    if (mode === 'edit' && task) {
      titleInput.value = readText(task.title);
      descriptionInput.value = readText(task.description);
      dueInput.value = readText(task.due_date);
      prioritySelect.value = readText(task.priority) || DEFAULT_PRIORITY;

      if (staffSelect) {
        staffSelect.value = String(task.staff_id);
      }
    } else {
      titleInput.value = '';
      descriptionInput.value = '';
      dueInput.value = '';
      prioritySelect.value = DEFAULT_PRIORITY;

      if (staffSelect) {
        staffSelect.value = '';
      }
    }

    openDialog(els.modal, titleInput);
  }

  function closeTaskModal() {
    const trigger = modalTrigger;

    modalTrigger = null;
    modalTask = null;
    modalMode = null;

    closeDialog(els.modal, trigger);
  }

  function openDeleteModal(task, trigger) {
    if (deleting) {
      return;
    }

    closeDialog(els.modal, null);

    deleteTask = task;
    deleteTrigger = trigger || document.activeElement;

    setText(els.deleteMessage, 'Delete “' + task.title + '”? This cannot be undone.');
    setDeleting(false);

    openDialog(els.deleteModal, els.deleteCancel);
  }

  function closeDeleteModal() {
    const trigger = deleteTrigger;

    deleteTrigger = null;
    deleteTask = null;

    closeDialog(els.deleteModal, trigger);
  }

  /*
   * Interactive elements inside the task list.
   */
  function handleTaskListClick(event) {
    const target = event.target;

    if (!target || typeof target.closest !== 'function') {
      return;
    }

    const editButton = target.closest('[data-task-edit]');

    if (editButton) {
      const article = editButton.closest('article[data-task-id]');
      const task = findTask(article && article.dataset.taskId);

      if (task) {
        openTaskModal('edit', task, editButton);
      }

      return;
    }

    const deleteButton = target.closest('[data-task-delete]');

    if (deleteButton) {
      const article = deleteButton.closest('article[data-task-id]');
      const task = findTask(article && article.dataset.taskId);

      if (task) {
        openDeleteModal(task, deleteButton);
      }

      return;
    }

    const staffButton = target.closest('[data-task-staff]');

    if (staffButton) {
      const modal = window.StaffDirectoryModal;

      if (modal && typeof modal.openProfile === 'function') {
        /*
         * A mouse click focuses the staff link before the click is handled,
         * but keyboard and programmatic activation may not, so focus it
         * explicitly — it doubles as the modal's focus-return target and
         * keeps the trigger reference consistent with a real mouse click.
         */
        staffButton.focus({ preventScroll: true });
        modal.openProfile(staffButton.dataset.staffId);
      }
    }
  }

  function handleTaskStatusChange(event) {
    const select = event.target;

    if (!select || !select.hasAttribute('data-task-status')) {
      return;
    }

    const article = select.closest('article[data-task-id]');

    if (!article) {
      return;
    }

    const taskId = article.dataset.taskId;
    const status = select.value;

    if (STATUS_OPTIONS.indexOf(status) === -1) {
      const task = findTask(taskId);

      if (task) {
        select.value = task.status;
      }

      return;
    }

    handleStatusChange(taskId, status);
  }

  /*
   * Task form.
   */
  function matchField(inputId) {
    return (
      FORM_FIELDS.find(function (field) {
        return field.inputId === inputId;
      }) || null
    );
  }

  function clearFieldError(key) {
    const field = FORM_FIELDS.find(function (item) {
      return item.key === key;
    });

    if (!field) {
      return;
    }

    const input = byId(field.inputId);
    const error = byId(field.errorId);

    if (input) {
      input.setAttribute('aria-invalid', 'false');
    }

    if (error) {
      error.textContent = '';
      hide(error);
    }
  }

  function clearAllFieldErrors() {
    FIELD_KEYS.forEach(clearFieldError);
  }

  function applyFieldErrors(errors) {
    let firstInvalid = null;

    FORM_FIELDS.forEach(function (field) {
      const message = errors[field.key];
      const input = byId(field.inputId);
      const error = byId(field.errorId);

      if (message) {
        if (input) {
          input.setAttribute('aria-invalid', 'true');
        }

        if (error) {
          error.textContent = message;
          show(error);
        }

        if (!firstInvalid && input) {
          firstInvalid = input;
        }
      } else {
        clearFieldError(field.key);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
    }
  }

  function showFormError(message) {
    setText(els.formError, message);
    show(els.formError);
  }

  function clearFormError() {
    setText(els.formError, '');
    hide(els.formError);
  }

  function validateTaskForm() {
    const errors = {};
    const title = valueOf('task-title');
    const staffId = readFieldValue(els.formStaff);
    const priority = readFieldValue(els.formPriority);
    const description = valueOf('task-description');
    const dueDate = valueOf('task-due');

    if (!title) {
      errors.title = 'Enter a title.';
    } else if (title.length > TITLE_MAX) {
      errors.title = 'Use 200 characters or fewer.';
    }

    if (!staffId) {
      errors.staffId = 'Choose a staff member.';
    }

    if (priority && PRIORITY_OPTIONS.indexOf(priority) === -1) {
      errors.priority = 'Choose a valid priority.';
    }

    if (description.length > DESCRIPTION_MAX) {
      errors.description = 'Use 2000 characters or fewer.';
    }

    if (dueDate && !DATE_PATTERN.test(dueDate)) {
      errors.dueDate = 'Enter a date in YYYY-MM-DD format.';
    }

    return errors;
  }

  function readTaskPayload() {
    return {
      title: valueOf('task-title'),
      staffId: readFieldValue(els.formStaff),
      priority: readFieldValue(els.formPriority) || DEFAULT_PRIORITY,
      description: valueOf('task-description'),
      dueDate: readFieldValue(byId('task-due'))
    };
  }

  async function handleTaskFormSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    clearFormError();

    const errors = validateTaskForm();

    if (Object.keys(errors).length > 0) {
      applyFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const payload = readTaskPayload();

      if (modalMode === 'edit') {
        await api.updateTask(modalTask.id, payload);
        announce('Task updated.');
        showSuccessBanner('Task updated.');
      } else {
        await api.createTask(payload);
        announce('Task created.');
        showSuccessBanner('Task created.');
      }

      closeTaskModal();
      await loadTasks();
      focusViewHeading();
    } catch (error) {
      if (error && error.status === 401) {
        handleSessionExpired();
        return;
      }

      if (shouldLogError(error)) {
        console.error('Staff Directory failed to save the task:', (error && error.message) || error);
      }

      showFormError(messageForError(error, ACTION_FALLBACK));
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Delete confirmation.
   */
  async function confirmDelete() {
    if (deleting || !deleteTask) {
      return;
    }

    setDeleting(true);

    try {
      await api.deleteTask(deleteTask.id);
      closeDeleteModal();
      announce('Task deleted.');
      showSuccessBanner('Task deleted.');
      await loadTasks();
      focusViewHeading();
    } catch (error) {
      if (error && error.status === 401) {
        handleSessionExpired();
        return;
      }

      if (shouldLogError(error)) {
        console.error('Staff Directory failed to delete the task:', (error && error.message) || error);
      }

      showActionError(messageForError(error, ACTION_FALLBACK));
    } finally {
      setDeleting(false);
    }
  }

  /*
   * Keyboard handling for the task dialogs.
   */
  function handleKeyDown(event) {
    const dialog = isTaskDialogOpen();

    if (!dialog) {
      return;
    }

    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();

      if (dialog === els.deleteModal) {
        if (!deleting) {
          closeDeleteModal();
        }
      } else if (!submitting) {
        closeTaskModal();
      }

      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = dialog.querySelectorAll(FOCUSABLE_SELECTOR);

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === document.body)) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /*
   * Wiring.
   */
  function cacheElements() {
    els.viewHeading = byId('tasks-title');
    els.newButton = byId('tasks-new-button');
    els.status = byId('tasks-status');
    els.statusMessage = byId('tasks-status-message');
    els.statusDismiss = byId('tasks-status-dismiss');
    els.actionError = byId('tasks-action-error');
    els.actionErrorMessage = byId('tasks-action-error-message');
    els.filterStaff = byId('tasks-filter-staff');
    els.filterStatus = byId('tasks-filter-status');
    els.filterPriority = byId('tasks-filter-priority');
    els.clearFilters = byId('tasks-clear-filters');
    els.staffWarning = byId('tasks-staff-warning');
    els.staffRetry = byId('tasks-staff-retry');
    els.count = byId('tasks-count');
    els.loading = byId('tasks-loading');
    els.empty = byId('tasks-empty');
    els.error = byId('tasks-error');
    els.errorMessage = byId('tasks-error-message');
    els.errorDetail = byId('tasks-error-detail');
    els.retry = byId('tasks-retry');
    els.list = byId('tasks-list');
    els.announce = byId('tasks-announce');

    els.modal = byId('task-modal');
    els.modalBackdrop = byId('task-modal-backdrop');
    els.modalClose = byId('task-modal-close');
    els.modalTitle = byId('task-modal-title');
    els.form = byId('task-form');
    els.formError = byId('task-form-error');
    els.formStaff = byId('task-staff');
    els.formPriority = byId('task-priority');
    els.submit = byId('task-submit');
    els.submitLabel = els.submit ? els.submit.querySelector('span') : null;
    els.formCancel = byId('task-cancel');

    els.deleteModal = byId('task-delete-modal');
    els.deleteModalBackdrop = byId('task-delete-modal-backdrop');
    els.deleteClose = byId('task-delete-close');
    els.deleteMessage = byId('task-delete-message');
    els.deleteConfirm = byId('task-delete-confirm');
    els.deleteConfirmLabel = els.deleteConfirm ? els.deleteConfirm.querySelector('span') : null;
    els.deleteCancel = byId('task-delete-cancel');
  }

  function bindEvents() {
    if (els.newButton) {
      els.newButton.addEventListener('click', function () {
        openTaskModal('create', null);
      });
    }

    if (els.filterStaff) {
      els.filterStaff.addEventListener('change', handleFilterChange);
    }

    if (els.filterStatus) {
      els.filterStatus.addEventListener('change', handleFilterChange);
    }

    if (els.filterPriority) {
      els.filterPriority.addEventListener('change', handleFilterChange);
    }

    if (els.clearFilters) {
      els.clearFilters.addEventListener('click', clearFilters);
    }

    if (els.staffRetry) {
      els.staffRetry.addEventListener('click', function () {
        loadStaffOptions();
      });
    }

    if (els.list) {
      els.list.addEventListener('click', handleTaskListClick);
      els.list.addEventListener('change', handleTaskStatusChange);
    }

    if (els.retry) {
      els.retry.addEventListener('click', function () {
        loadTasks();
      });
    }

    if (els.statusDismiss) {
      els.statusDismiss.addEventListener('click', hideSuccessBanner);
    }

    if (els.modal) {
      els.modal.addEventListener('click', function (event) {
        if (!submitting && (event.target === els.modal || event.target === els.modalBackdrop)) {
          closeTaskModal();
        }
      });

      els.modal.addEventListener('input', function (event) {
        const field = matchField(event.target && event.target.id);

        if (field) {
          clearFieldError(field.key);
        }

        if (els.form) {
          clearFormError();
        }
      });
    }

    if (els.modalClose) {
      els.modalClose.addEventListener('click', closeTaskModal);
    }

    if (els.form) {
      els.form.addEventListener('submit', handleTaskFormSubmit);
    }

    if (els.formCancel) {
      els.formCancel.addEventListener('click', closeTaskModal);
    }

    if (els.deleteModal) {
      els.deleteModal.addEventListener('click', function (event) {
        if (!deleting && (event.target === els.deleteModal || event.target === els.deleteModalBackdrop)) {
          closeDeleteModal();
        }
      });
    }

    if (els.deleteClose) {
      els.deleteClose.addEventListener('click', closeDeleteModal);
    }

    if (els.deleteCancel) {
      els.deleteCancel.addEventListener('click', closeDeleteModal);
    }

    if (els.deleteConfirm) {
      els.deleteConfirm.addEventListener('click', confirmDelete);
    }

    document.addEventListener('keydown', handleKeyDown);

    document.addEventListener('staffdirectory:view', function (event) {
      const detail = event && event.detail;

      if (detail && detail.view === VIEW) {
        handleViewEnter();
      }
    });
  }

  function handleViewEnter() {
    hideActionError();
    hideSuccessBanner();
    ensureStaffOptions();
    applyQueryIntent();
    loadTasks();
  }

  function init() {
    if (started) {
      return;
    }

    api = window.StaffDirectoryApi;

    if (!api || typeof api.getTasks !== 'function') {
      console.error('Staff Directory Tasks module could not start: the API layer is missing.');
      return;
    }

    started = true;
    cacheElements();
    bindEvents();
  }

  window.StaffDirectoryTasks = {
    init
  };
})();