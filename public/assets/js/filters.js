
(function () {
  'use strict';

  const SEARCH_INPUT_ID = 'search-input';
  const DEPARTMENT_SELECT_ID = 'filter-department';
  const ROLE_SELECT_ID = 'filter-role';
  const STATUS_SELECT_ID = 'filter-status';
  const CLEAR_BUTTON_ID = 'clear-filters';

  const SEARCH_DEBOUNCE_MS = 300;

  const FILTER_ERROR_MESSAGE = 'Unable to update the results right now.';
  const FILTER_ERROR_DETAIL = 'Please try again.';

  const state = {
    search: '',
    department: '',
    role: '',
    status: ''
  };

  let debounceTimer = null;

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

  async function applyFilters() {

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

      console.error(
        'Staff Directory failed to apply filters:',
        (error && error.message) || error
      );

      ui.hideLoading();

      ui.setGridVisible(true);
      ui.showError(FILTER_ERROR_MESSAGE, FILTER_ERROR_DETAIL);
    }
  }

  function scheduleSearch() {
    cancelPendingSearch();

    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      applyFilters();
    }, SEARCH_DEBOUNCE_MS);
  }

  function handleSearchInput(event) {

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

  function retry() {
    applyFilters();
  }

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
