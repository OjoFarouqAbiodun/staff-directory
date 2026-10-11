
/*
 * Add Staff — the administrator-only staff creation view.
 *
 * This module owns the #add-staff view and nothing else. It reads the session
 * from StaffDirectoryAuth, posts through StaffDirectoryApi and asks
 * StaffDirectoryFilters to refresh the staff data that already exists, so the
 * directory is never duplicated here. It never touches the HTTP-only session
 * cookie.
 */

(function () {
  'use strict';

  const VIEW = 'add-staff';

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  /* Site-relative paths are allowed because the directory also uses them. */
  const AVATAR_PATTERN = /^(https?:\/\/|\/\/|\/)/i;

  const IDLE_LABEL = 'Add staff';
  const BUSY_LABEL = 'Adding staff…';

  const FALLBACK_MESSAGE = 'Unable to add the staff member right now. Please try again.';
  const OPTIONS_FALLBACK_MESSAGE = 'Unable to load departments and roles right now.';
  const SESSION_MESSAGE = 'Your session has expired. Sign in again to add staff.';

  const NONE_LABELS = {
    department: 'No department',
    role: 'No role'
  };

  const EMPTY_LABELS = {
    department: 'No departments available yet',
    role: 'No roles available yet'
  };

  /*
   * Only fields the form validates itself are listed. The backend validates
   * everything again and its message is shown as-is for anything the browser
   * could not catch first.
   */
  const FIELDS = {
    firstName: { inputId: 'addstaff-firstname', errorId: 'addstaff-firstname-error' },
    lastName: { inputId: 'addstaff-lastname', errorId: 'addstaff-lastname-error' },
    email: { inputId: 'addstaff-email', errorId: 'addstaff-email-error' },
    status: { inputId: 'addstaff-status', errorId: 'addstaff-status-error' },
    avatarUrl: { inputId: 'addstaff-avatar', errorId: 'addstaff-avatar-error' }
  };

  const FIELD_KEYS = Object.keys(FIELDS);

  let api = null;
  let started = false;
  let submitting = false;

  /* idle -> loading -> ready | error. Error retries when the view is reopened. */
  let optionsState = 'idle';

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

  function valueOf(id) {
    const element = byId(id);
    return element && typeof element.value === 'string' ? element.value.trim() : '';
  }

  function messageForError(error, fallback) {
    if (error && typeof error.message === 'string' && error.message.trim()) {
      return error.message.trim();
    }

    return fallback;
  }

  function shouldLogError(error) {
    if (!error || typeof error.status !== 'number') {
      return true;
    }

    return error.status === 0 || error.status >= 500;
  }

  function cacheElements() {
    els.form = byId('addstaff-form');
    els.formError = byId('addstaff-form-error');
    els.submit = byId('addstaff-submit');
    els.submitLabel = els.submit ? els.submit.querySelector('span') : null;

    els.department = byId('addstaff-department');
    els.role = byId('addstaff-role');
    els.status = byId('addstaff-status');

    els.optionsLoading = byId('addstaff-options-loading');
    els.optionsError = byId('addstaff-options-error');
    els.optionsErrorMessage = byId('addstaff-options-error-message');
    els.optionsRetry = byId('addstaff-options-retry');

    els.successBanner = byId('staff-create-status');
    els.successMessage = byId('staff-create-status-message');
    els.successDismiss = byId('staff-create-status-dismiss');
  }

  /* ---------------------------- field errors ---------------------------- */

  function clearFieldError(key) {
    const field = FIELDS[key];
    const input = byId(field.inputId);
    const message = byId(field.errorId);

    if (input) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }

    if (message) {
      message.textContent = '';
      hide(message);
    }
  }

  function clearAllFieldErrors() {
    FIELD_KEYS.forEach(clearFieldError);
  }

  function applyFieldErrors(errors) {
    let firstInputId = null;

    FIELD_KEYS.forEach(function (key) {
      const message = errors[key];

      if (!message) {
        clearFieldError(key);
        return;
      }

      const field = FIELDS[key];
      const input = byId(field.inputId);
      const messageElement = byId(field.errorId);

      if (messageElement) {
        messageElement.textContent = message;
        show(messageElement);
      }

      if (input) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', field.errorId);
      }

      if (!firstInputId) {
        firstInputId = field.inputId;
      }
    });

    if (firstInputId) {
      const input = byId(firstInputId);

      if (input) {
        input.focus();
      }
    }
  }

  function showFormError(message) {
    if (!els.formError) {
      return;
    }

    show(els.formError);
    els.formError.textContent = message;
  }

  function clearFormError() {
    if (!els.formError) {
      return;
    }

    els.formError.textContent = '';
    hide(els.formError);
  }

  /* --------------------------- option loading --------------------------- */

  function buildOption(value, label) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    return option;
  }

  function fillOptions(select, items, noneLabel, emptyLabel) {
    if (!select) {
      return;
    }

    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }

    if (!items || items.length === 0) {
      select.appendChild(buildOption('', emptyLabel));
      return;
    }

    select.appendChild(buildOption('', noneLabel));

    items.forEach(function (item) {
      select.appendChild(buildOption(String(item.id), item.name));
    });
  }

  function setSelectsDisabled(disabled) {
    [els.department, els.role].forEach(function (select) {
      if (select) {
        select.disabled = Boolean(disabled);
      }
    });
  }

  function updateSubmitState() {
    if (!els.submit) {
      return;
    }

    els.submit.disabled = submitting || optionsState === 'loading';
  }

  async function loadOptions() {
    if (optionsState === 'loading') {
      return;
    }

    optionsState = 'loading';
    setText(els.optionsErrorMessage, '');
    hide(els.optionsError);
    show(els.optionsLoading);
    setSelectsDisabled(true);
    updateSubmitState();

    try {
      const data = await Promise.all([api.getDepartments(), api.getRoles()]);
      const departments = data[0];
      const roles = data[1];

      fillOptions(els.department, departments, NONE_LABELS.department, EMPTY_LABELS.department);
      fillOptions(els.role, roles, NONE_LABELS.role, EMPTY_LABELS.role);

      optionsState = 'ready';
      hide(els.optionsLoading);
      setSelectsDisabled(false);
    } catch (error) {
      optionsState = 'error';
      hide(els.optionsLoading);

      /* Department and role are optional, so the form stays usable without them. */
      setSelectsDisabled(true);
      setText(els.optionsErrorMessage, messageForError(error, OPTIONS_FALLBACK_MESSAGE));
      show(els.optionsError);

      if (shouldLogError(error)) {
        console.error(
          'Staff Directory: unable to load department and role options:',
          (error && error.message) || error
        );
      }
    }

    updateSubmitState();
  }

  function ensureOptions() {
    if (optionsState === 'loading' || optionsState === 'ready') {
      return;
    }

    loadOptions();
  }

  /* ------------------------------ validation ---------------------------- */

  function validate() {
    const errors = {};

    if (!valueOf('addstaff-firstname')) {
      errors.firstName = 'Enter a first name.';
    }

    if (!valueOf('addstaff-lastname')) {
      errors.lastName = 'Enter a last name.';
    }

    const email = valueOf('addstaff-email');

    if (!email) {
      errors.email = 'Enter an email address.';
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!valueOf('addstaff-status')) {
      errors.status = 'Choose an employment status.';
    }

    const avatarUrl = valueOf('addstaff-avatar');

    if (avatarUrl && !AVATAR_PATTERN.test(avatarUrl)) {
      errors.avatarUrl =
        'Enter a valid image address, such as https://example.com/photo.jpg or ' +
        '/assets/images/placeholders/avatar.svg.';
    }

    return errors;
  }

  /* ------------------------------- submit -------------------------------- */

  function readPayload() {
    return {
      firstName: valueOf('addstaff-firstname'),
      lastName: valueOf('addstaff-lastname'),
      email: valueOf('addstaff-email'),
      phone: valueOf('addstaff-phone'),
      jobTitle: valueOf('addstaff-jobtitle'),
      departmentId: els.department ? els.department.value : '',
      roleId: els.role ? els.role.value : '',
      location: valueOf('addstaff-location'),
      avatarUrl: valueOf('addstaff-avatar'),
      bio: valueOf('addstaff-bio'),
      employmentStatus: els.status ? els.status.value : ''
    };
  }

  function setSubmitting(active) {
    submitting = active;

    if (els.form) {
      els.form.setAttribute('aria-busy', active ? 'true' : 'false');
    }

    if (els.submitLabel) {
      els.submitLabel.textContent = active ? BUSY_LABEL : IDLE_LABEL;
    }

    updateSubmitState();
  }

  function resetForm() {
    if (els.form) {
      els.form.reset();
    }

    clearAllFieldErrors();
    clearFormError();
  }

  function handleSessionExpired() {
    const auth = window.StaffDirectoryAuth;

    if (auth && typeof auth.handleSessionExpired === 'function') {
      auth.handleSessionExpired(SESSION_MESSAGE);
      return;
    }

    showFormError(SESSION_MESSAGE);
  }

  function showSuccess(name) {
    if (!els.successBanner) {
      return;
    }

    setText(els.successMessage, name + ' was added to the directory.');
    show(els.successBanner);
  }

  function hideSuccess() {
    if (!els.successBanner) {
      return;
    }

    setText(els.successMessage, '');
    hide(els.successBanner);
  }

  function openDirectoryWithConfirmation(name) {
    const announce = function () {
      showSuccess(name);
    };

    if (window.location.hash === '#directory') {
      announce();
      return;
    }

    /*
     * auth.js registers its hashchange listener first, so the directory view
     * is already on screen when this runs and the confirmation is announced.
     */
    window.addEventListener('hashchange', announce, { once: true });
    window.location.hash = '#directory';
  }

  function handleCreated(staff) {
    const name =
      staff && typeof staff.full_name === 'string' && staff.full_name.trim()
        ? staff.full_name.trim()
        : 'The staff member';

    resetForm();

    /*
     * One refresh of the staff data the directory already owns — no second
     * copy of the list is kept here. Clearing the filters first guarantees
     * the new record is on screen when the directory opens.
     */
    const filters = window.StaffDirectoryFilters;

    if (filters && typeof filters.clear === 'function') {
      filters.clear();
    } else if (filters && typeof filters.retry === 'function') {
      filters.retry();
    }

    openDirectoryWithConfirmation(name);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    clearFormError();

    const errors = validate();

    if (Object.keys(errors).length > 0) {
      applyFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const staff = await api.createStaff(readPayload());
      handleCreated(staff);
    } catch (error) {
      if (error && error.status === 401) {
        /* The session ended mid-use: say so, never fake a success. */
        handleSessionExpired();
        return;
      }

      if (shouldLogError(error)) {
        console.error('Staff Directory: unable to add staff:', (error && error.message) || error);
      }

      showFormError(messageForError(error, FALLBACK_MESSAGE));
    } finally {
      setSubmitting(false);
    }
  }

  /* -------------------------------- wiring ------------------------------- */

  function handleViewEnter() {
    clearFormError();
    clearAllFieldErrors();
    ensureOptions();
  }

  function bindFieldErrors() {
    FIELD_KEYS.forEach(function (key) {
      const input = byId(FIELDS[key].inputId);

      if (!input) {
        return;
      }

      input.addEventListener('input', function () {
        clearFieldError(key);
      });
    });

    if (els.form) {
      els.form.addEventListener('input', function () {
        clearFormError();
      });
    }
  }

  function bindEvents() {
    if (els.form) {
      els.form.addEventListener('submit', handleSubmit);
    }

    if (els.optionsRetry) {
      els.optionsRetry.addEventListener('click', function () {
        loadOptions();
      });
    }

    if (els.successDismiss) {
      els.successDismiss.addEventListener('click', hideSuccess);
    }

    bindFieldErrors();

    document.addEventListener('staffdirectory:view', function (event) {
      const detail = event && event.detail;

      if (detail && detail.view === VIEW) {
        handleViewEnter();
      }
    });
  }

  function init() {
    if (started) {
      return;
    }

    api = window.StaffDirectoryApi;

    if (!api) {
      console.error('Staff Directory add staff could not start: API module is unavailable.');
      return;
    }

    started = true;

    cacheElements();
    bindEvents();
  }

  window.StaffDirectoryStaffCreate = {
    init: init
  };
})();
