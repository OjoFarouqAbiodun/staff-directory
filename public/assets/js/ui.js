
(function () {
  'use strict';

  const STAFF_GRID_ID = 'staff-grid';
  const STAFF_COUNT_ID = 'staff-count';
  const DEPARTMENT_SELECT_ID = 'filter-department';
  const ROLE_SELECT_ID = 'filter-role';
  const LOADING_STATE_ID = 'loading-state';
  const EMPTY_STATE_ID = 'empty-state';
  const ERROR_STATE_ID = 'error-state';
  const ERROR_MESSAGE_ID = 'error-state-message';
  const ERROR_DETAIL_ID = 'error-state-detail';
  const HIDDEN_CLASS = 'hidden';

  const FALLBACK_AVATAR = '/assets/images/placeholders/avatar.svg';

  const STATUS_BADGE_CLASSES = {
    Active: 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700',
    'On Leave': 'rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700',
    Inactive: 'rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600'
  };
  const DEFAULT_BADGE_CLASSES = 'rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600';

  const CARD_CLASSES =
    'group flex h-full w-full flex-col rounded-lg border border-stone-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md';
  const CARD_HEADER_CLASSES = 'flex items-start justify-between gap-3';
  const CARD_NAME_CLASSES = 'mt-4 text-sm font-semibold text-stone-900';
  const CARD_TITLE_CLASSES = 'mt-0.5 text-sm text-stone-500';
  const CARD_META_CLASSES = 'mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500';
  const CARD_DEPARTMENT_CLASSES = 'text-stone-600';
  const CARD_LOCATION_CLASSES = 'mt-2 text-xs text-stone-400';
  const AVATAR_CLASSES = 'h-11 w-11 rounded-full';
  const AVATAR_INITIALS_CLASSES =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-600';

  function readText(value) {
    return typeof value === 'string' ? value.trim() : '';
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

  function buildInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';

    return (first + last).toUpperCase() || '?';
  }

  function buildAvatar(staffMember) {
    const avatarUrl = readText(staffMember.avatar_url);

    if (avatarUrl) {
      const image = createElement('img', AVATAR_CLASSES);
      image.setAttribute('src', avatarUrl);
      image.setAttribute('alt', '');
      image.setAttribute('width', '44');
      image.setAttribute('height', '44');
      image.setAttribute('loading', 'lazy');
      image.setAttribute('decoding', 'async');
      return image;
    }

    const initials = createElement(
      'span',
      AVATAR_INITIALS_CLASSES,
      buildInitials(readText(staffMember.first_name), readText(staffMember.last_name))
    );
    initials.setAttribute('aria-hidden', 'true');

    return initials;
  }

  function buildStatusBadge(status) {
    const label = readText(status);
    const badge = createElement('span', STATUS_BADGE_CLASSES[label] || DEFAULT_BADGE_CLASSES, label);

    return badge;
  }

  function renderStaffCard(staffMember) {
    const member = staffMember || {};
    const item = document.createElement('li');

    const button = createElement('button', CARD_CLASSES);
    button.setAttribute('type', 'button');
    button.setAttribute('data-staff-id', String(member.id == null ? '' : member.id));

    const header = createElement('div', CARD_HEADER_CLASSES);
    header.appendChild(buildAvatar(member));
    header.appendChild(buildStatusBadge(member.employment_status));
    button.appendChild(header);

    const name = readText(member.full_name) || [readText(member.first_name), readText(member.last_name)].filter(Boolean).join(' ');
    button.appendChild(createElement('p', CARD_NAME_CLASSES, name || 'Unnamed staff member'));

    const jobTitle = readText(member.job_title);
    if (jobTitle) {
      button.appendChild(createElement('p', CARD_TITLE_CLASSES, jobTitle));
    }

    const department = readText(member.department);
    const role = readText(member.role);

    if (department || role) {
      const meta = createElement('div', CARD_META_CLASSES);

      if (department) {
        meta.appendChild(createElement('span', CARD_DEPARTMENT_CLASSES, department));
      }

      if (department && role) {
        const separator = createElement('span', 'text-stone-300', '·');
        separator.setAttribute('aria-hidden', 'true');
        meta.appendChild(separator);
      }

      if (role) {
        meta.appendChild(createElement('span', '', role));
      }

      button.appendChild(meta);
    }

    const location = readText(member.location);
    if (location) {
      button.appendChild(createElement('p', CARD_LOCATION_CLASSES, location));
    }

    item.appendChild(button);

    return item;
  }

  function renderStaffList(staff) {
    const grid = document.getElementById(STAFF_GRID_ID);

    if (!grid || !Array.isArray(staff)) {
      return;
    }

    const fragment = document.createDocumentFragment();

    for (const staffMember of staff) {
      fragment.appendChild(renderStaffCard(staffMember));
    }

    grid.replaceChildren(fragment);
  }

  function updateStaffCount(count) {
    const element = document.getElementById(STAFF_COUNT_ID);

    if (!element) {
      return;
    }

    const total = Number(count);

    if (!Number.isFinite(total) || total < 0) {
      return;
    }

    element.textContent = total === 1 ? '1 person' : total + ' people';
  }

  function setContainerVisible(id, visible) {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    element.classList.toggle(HIDDEN_CLASS, !visible);
  }

  function showLoading() {
    setContainerVisible(EMPTY_STATE_ID, false);
    setContainerVisible(ERROR_STATE_ID, false);
    setGridVisible(false);

    const loading = document.getElementById(LOADING_STATE_ID);

    if (loading) {
      loading.classList.remove(HIDDEN_CLASS);

      loading.setAttribute('aria-busy', 'true');
    }
  }

  function hideLoading() {
    const loading = document.getElementById(LOADING_STATE_ID);

    if (!loading) {
      return;
    }

    loading.classList.add(HIDDEN_CLASS);
    loading.setAttribute('aria-busy', 'false');
  }

  function showEmpty() {
    hideLoading();
    setContainerVisible(ERROR_STATE_ID, false);
    setGridVisible(false);
    setContainerVisible(EMPTY_STATE_ID, true);
  }

  function hideEmpty() {
    setContainerVisible(EMPTY_STATE_ID, false);
  }

  function showError(message, detail) {
    hideLoading();
    setContainerVisible(EMPTY_STATE_ID, false);

    const heading = document.getElementById(ERROR_MESSAGE_ID);
    const description = document.getElementById(ERROR_DETAIL_ID);

    if (heading && typeof message === 'string' && message.trim()) {
      heading.textContent = message;
    }

    if (description && typeof detail === 'string' && detail.trim()) {
      description.textContent = detail;
    }

    setContainerVisible(ERROR_STATE_ID, true);
  }

  function hideError() {
    setContainerVisible(ERROR_STATE_ID, false);
  }

  function setGridVisible(visible) {
    const grid = document.getElementById(STAFF_GRID_ID);

    if (!grid) {
      return;
    }

    grid.classList.toggle(HIDDEN_CLASS, !visible);
  }

  function setStaffCountText(text) {
    const element = document.getElementById(STAFF_COUNT_ID);

    if (element && typeof text === 'string') {
      element.textContent = text;
    }
  }

  function populateSelect(selectId, records) {
    const select = document.getElementById(selectId);

    if (!select || !Array.isArray(records)) {
      return;
    }

    const defaultOption = select.querySelector('option[value=""]');
    const fragment = document.createDocumentFragment();

    for (const record of records) {
      if (!record) {
        continue;
      }

      const name = readText(record.name);

      if (!name) {
        continue;
      }

      const option = document.createElement('option');
      option.setAttribute('value', name);
      option.textContent = name;
      option.setAttribute('data-id', String(record.id == null ? '' : record.id));
      fragment.appendChild(option);
    }

    if (defaultOption) {
      fragment.insertBefore(defaultOption, fragment.firstChild);
    }

    select.replaceChildren(fragment);
  }

  function renderDepartments(departments) {
    populateSelect(DEPARTMENT_SELECT_ID, departments);
  }

  function renderRoles(roles) {
    populateSelect(ROLE_SELECT_ID, roles);
  }

  window.StaffDirectoryUi = {
    renderStaffList,
    renderStaffCard,
    updateStaffCount,
    setStaffCountText,
    renderDepartments,
    renderRoles,
    showLoading,
    hideLoading,
    showEmpty,
    hideEmpty,
    showError,
    hideError,
    setGridVisible
  };
})();
