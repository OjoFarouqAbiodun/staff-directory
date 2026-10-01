/**
 * Staff Directory - application bootstrap.
 *
 * Responsibilities: coordinate startup. It requests data through
 * window.StaffDirectoryApi and hands the results to window.StaffDirectoryUi.
 * It performs no DOM construction of its own and never calls fetch directly.
 */

document.addEventListener('DOMContentLoaded', function () {
  const api = window.StaffDirectoryApi;
  const ui = window.StaffDirectoryUi;

  if (!api || !ui) {
    console.error('Staff Directory failed to start: application modules are unavailable.');
    return;
  }

  const ERROR_RETRY_ID = 'error-retry';

  /**
   * Controlled, user-facing copy. The real failure is logged to the console
   * for the developer; nothing derived from the error object is rendered.
   */
  const LOAD_ERROR_MESSAGE = 'Unable to load the directory right now.';
  const LOAD_ERROR_DETAIL = 'Please try again.';

  /** Summary shown while loading and when no count can be trusted. */
  const LOADING_COUNT_TEXT = 'Loading...';
  const NO_COUNT_TEXT = '—';

  /**
   * True once the directory has been loaded successfully at least once.
   * Decides whether the retry button repeats the initial load or the
   * current filter request.
   */
  let directoryLoaded = false;

  async function loadDirectory() {
    // The loading view replaces the shell's static placeholder cards so the
    // page never shows sample staff, or "0 people", before real data arrives.
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

      // An empty database is a legitimate result, not an error.
      if (staff.length === 0) {
        ui.showEmpty();
        return;
      }

      ui.setGridVisible(true);
      ui.hideEmpty();
    } catch (error) {
      // Developer-facing only. No exception text reaches the page.
      console.error(
        'Staff Directory failed to load directory data:',
        (error && error.message) || error
      );

      ui.hideLoading();
      ui.hideEmpty();
      // Nothing was rendered, so the shell's placeholders are cleared too.
      ui.renderStaffList([]);
      ui.setGridVisible(false);
      ui.setStaffCountText(NO_COUNT_TEXT);
      ui.showError(LOAD_ERROR_MESSAGE, LOAD_ERROR_DETAIL);
    } finally {
      // Search/filter and modal listeners are attached once the first render
      // is done. These only bind events; they do not issue new requests, and
      // both guard against being initialised twice.
      initialiseModule('StaffDirectoryFilters');
      initialiseModule('StaffDirectoryModal');
    }
  }

  /**
   * Repeats whichever request failed, without reloading the page. A failed
   * initial load re-runs the whole directory load; a failed filter request
   * re-applies the filters exactly as the user left them.
   */
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

  // Bound once here so repeated loads cannot attach the listener twice.
  const retryButton = document.getElementById(ERROR_RETRY_ID);

  if (retryButton) {
    retryButton.addEventListener('click', handleRetry);
  }

  loadDirectory();
});
