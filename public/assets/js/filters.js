/**
 * Staff Directory - search and filter behaviour.
 *
 * Responsibilities: hold the active filter state, listen to the existing
 * search/filter controls, and ask the API client for matching staff.
 *
 * It never calls fetch() itself and never builds or manipulates individual
 * cards - list rendering and the count are delegated to
 * window.StaffDirectoryUi.
 */

(function () {
  'use strict';

  const SEARCH_INPUT_ID = 'search-input';
  const DEPARTMENT_SELECT_ID = 'filter-department';
  const ROLE_SELECT_ID = 'filter-role';
  const STATUS_SELECT_ID = 'filter-status';
  const CLEAR_BUTTON_ID = 'clear-filters';

  const SEARCH_DEBOUNCE_MS = 300;

  /**
   * Controlled, user-facing copy for a failed filter request. No exception
   * text, status code or backend detail is ever shown to the user.
   */
  const FILTER_ERROR_MESSAGE = 'Unable to update the results right now.';
  const FILTER_ERROR_DETAIL = 'Please try again.';

  /** Single source of truth for what the directory is currently filtered by. */
  const state = {
    search: '',
    department: '',
    role: '',
    status: ''
  };

  let debounceTimer = null;

  /**
   * Monotonic request token. Every filter request takes a ticket before it
   * goes out and only the holder of the newest ticket is allowed to paint,
   * so a slow earlier response can never overwrite a newer result.
   */
  let requestToken = 0;

  let initialised = false;

  function cancelPendingSearch() {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  }

  function readValue(element) {
    return element && typeof element.value === 'string' ? element.value : '';
  }

  /**
   * Requests staff for the current state and renders the result.
   *
   * The existing race protection is unchanged: a request takes a ticket
   * before it goes out and only the newest ticket may paint, so a slow
   * earlier response can never overwrite a newer result - or leave the
   * loading, empty or error view behind when it is discarded.
   *
   * On failure the currently displayed list is preserved and the error
   * view is shown instead.
   */
  async function applyFilters() {
    // A pending debounced search is already represented in `state`, so it is
    // folded into this request instead of firing a redundant follow-up.
    cancelPendingSearch();

    const token = ++requestToken;
    const ui = window.StaffDirectoryUi;

    ui.showLoading();
    ui.hideEmpty();
    ui.hideError();

    try {
      const staff = await window.StaffDirectoryApi.getStaff({
        search: state.search,
        department: state.department,
        role: state.role,
        status: state.status
      });

      if (token !== requestToken) {
        return;
      }

      ui.renderStaffList(staff);
      ui.updateStaffCount(staff.length);
      ui.hideLoading();
      ui.hideError();

      if (staff.length === 0) {
        ui.showEmpty();
        return;
      }

      ui.setGridVisible(true);
      ui.hideEmpty();
    } catch (error) {
      if (token !== requestToken) {
        return;
      }

      // Developer-facing detail only; the user sees the controlled copy
      // rendered by the error state.
      console.error(
        'Staff Directory failed to apply filters:',
        (error && error.message) || error
      );

      ui.hideLoading();
      // Keep the last successful results visible underneath the message.
      ui.setGridVisible(true);
      ui.showError(FILTER_ERROR_MESSAGE, FILTER_ERROR_DETAIL);
    }
  }

  /** Debounces the search input so a request is not issued per keystroke. */
  function scheduleSearch() {
    cancelPendingSearch();

    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      applyFilters();
    }, SEARCH_DEBOUNCE_MS);
  }

  function handleSearchInput(event) {
    // Trimming here means a whitespace-only entry behaves like an empty search.
    state.search = readValue(event.target).trim();
    scheduleSearch();
  }

  function handleDepartmentChange(event) {
    state.department = readValue(event.target);
    applyFilters();
  }

  function handleRoleChange(event) {
    state.role = readValue(event.target);
    applyFilters();
  }

  function handleStatusChange(event) {
    state.status = readValue(event.target);
    applyFilters();
  }

  function handleClearFilters() {
    const searchInput = document.getElementById(SEARCH_INPUT_ID);
    const departmentSelect = document.getElementById(DEPARTMENT_SELECT_ID);
    const roleSelect = document.getElementById(ROLE_SELECT_ID);
    const statusSelect = document.getElementById(STATUS_SELECT_ID);

    if (searchInput) {
      searchInput.value = '';
    }

    if (departmentSelect) {
      departmentSelect.value = '';
    }

    if (roleSelect) {
      roleSelect.value = '';
    }

    if (statusSelect) {
      statusSelect.value = '';
    }

    state.search = '';
    state.department = '';
    state.role = '';
    state.status = '';

    applyFilters();
  }

  /**
   * Re-runs the current request. Used by the error state's retry button so a
   * failed filter request can be repeated without the page reloading and
   * without any filter control being reset.
   */
  function retry() {
    applyFilters();
  }

  /**
   * Attaches the filter listeners. Called once by app.js after the initial
   * data load, so initialisation never issues a second identical request.
   */
  function init() {
    if (initialised) {
      return;
    }

    initialised = true;

    const searchInput = document.getElementById(SEARCH_INPUT_ID);
    const departmentSelect = document.getElementById(DEPARTMENT_SELECT_ID);
    const roleSelect = document.getElementById(ROLE_SELECT_ID);
    const statusSelect = document.getElementById(STATUS_SELECT_ID);
    const clearButton = document.getElementById(CLEAR_BUTTON_ID);

    if (searchInput) {
      searchInput.addEventListener('input', handleSearchInput);
    }

    if (departmentSelect) {
      departmentSelect.addEventListener('change', handleDepartmentChange);
    }

    if (roleSelect) {
      roleSelect.addEventListener('change', handleRoleChange);
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', handleStatusChange);
    }

    if (clearButton) {
      clearButton.addEventListener('click', handleClearFilters);
    }
  }

  window.StaffDirectoryFilters = {
    init,
    retry
  };
})();
