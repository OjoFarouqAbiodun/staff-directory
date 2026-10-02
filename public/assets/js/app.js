
document.addEventListener('DOMContentLoaded', function () {
  const api = window.StaffDirectoryApi;
  const ui = window.StaffDirectoryUi;

  if (!api || !ui) {
    console.error('Staff Directory failed to start: application modules are unavailable.');
    return;
  }

  const ERROR_RETRY_ID = 'error-retry';

  const LOAD_ERROR_MESSAGE = 'Unable to load the directory right now.';
  const LOAD_ERROR_DETAIL = 'Please try again.';

  const LOADING_COUNT_TEXT = 'Loading...';
  const NO_COUNT_TEXT = '—';

  let directoryLoaded = false;

  async function loadDirectory() {

    ui.showLoading();
    ui.hideEmpty();
    ui.hideError();
    ui.setStaffCountText(LOADING_COUNT_TEXT);

    try {
      const [departments, roles, staff] = await Promise.all([
        api.getDepartments(),
        api.getRoles(),
        api.getStaff()
      ]);

      ui.renderDepartments(departments);
      ui.renderRoles(roles);
      ui.renderStaffList(staff);
      ui.updateStaffCount(staff.length);

      directoryLoaded = true;
      ui.hideLoading();
      ui.hideError();

      if (staff.length === 0) {
        ui.showEmpty();
        return;
      }

      ui.setGridVisible(true);
      ui.hideEmpty();
    } catch (error) {

      console.error(
        'Staff Directory failed to load directory data:',
        (error && error.message) || error
      );

      ui.hideLoading();
      ui.hideEmpty();

      ui.renderStaffList([]);
      ui.setGridVisible(false);
      ui.setStaffCountText(NO_COUNT_TEXT);
      ui.showError(LOAD_ERROR_MESSAGE, LOAD_ERROR_DETAIL);
    } finally {

      initialiseModule('StaffDirectoryFilters');
      initialiseModule('StaffDirectoryModal');
    }
  }

  function handleRetry() {
    if (directoryLoaded) {
      const filters = window.StaffDirectoryFilters;

      if (filters && typeof filters.retry === 'function') {
        filters.retry();
        return;
      }
    }

    loadDirectory();
  }

  function initialiseModule(name) {
    const module = window[name];

    if (module && typeof module.init === 'function') {
      module.init();
    }
  }

  const retryButton = document.getElementById(ERROR_RETRY_ID);

  if (retryButton) {
    retryButton.addEventListener('click', handleRetry);
  }

  loadDirectory();
});
