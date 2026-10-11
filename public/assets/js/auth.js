
(function () {
  'use strict';

  const CHECKING = 'checking';
  const AUTHENTICATED = 'authenticated';
  const UNAUTHENTICATED = 'unauthenticated';
  const AUTH_ERROR = 'error';

  const VIEW_SECTIONS = {
    directory: 'view-directory',
    signin: 'view-signin',
    signup: 'view-signup',
    account: 'view-account',
    dashboard: 'view-dashboard',
    'add-staff': 'view-add-staff',
    tasks: 'view-tasks'
  };

  const VIEW_TITLES = {
    directory: 'Staff Directory',
    signin: 'Sign in - Staff Directory',
    signup: 'Create account - Staff Directory',
    account: 'Your account - Staff Directory',
    dashboard: 'Dashboard - Staff Directory',
    'add-staff': 'Add staff - Staff Directory',
    tasks: 'Tasks - Staff Directory'
  };

  /* Views that must never render for a visitor without a live session. */
  const ADMIN_ONLY_VIEWS = ['account', 'dashboard', 'add-staff', 'tasks'];

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_PASSWORD_LENGTH = 8;

  const IDLE_LABELS = { signin: 'Sign in', signup: 'Create account' };
  const BUSY_LABELS = { signin: 'Signing in…', signup: 'Creating account…' };

  const SIGN_OUT_LABEL = 'Sign out';
  const SIGNING_OUT_LABEL = 'Signing out…';

  const FALLBACK_MESSAGES = {
    signIn: 'Unable to sign in right now. Please try again.',
    signUp: 'Unable to create the account right now. Please try again.',
    signOut: 'Unable to sign out right now. Please try again.',
    unknownAccount: 'Unable to confirm your account right now. Please try again.'
  };

  const SIGN_IN_FIELDS = [
    { key: 'email', inputId: 'signin-email', errorId: 'signin-email-error' },
    { key: 'password', inputId: 'signin-password', errorId: 'signin-password-error' }
  ];

  const SIGN_UP_FIELDS = [
    { key: 'fullName', inputId: 'signup-name', errorId: 'signup-name-error' },
    { key: 'username', inputId: 'signup-username', errorId: 'signup-username-error' },
    { key: 'email', inputId: 'signup-email', errorId: 'signup-email-error' },
    { key: 'password', inputId: 'signup-password', errorId: 'signup-password-error' }
  ];

  let api = null;
  let started = false;

  let state = {
    status: CHECKING,
    admin: null
  };

  let signingIn = false;
  let signingUp = false;
  let signingOut = false;

  const els = {};

  function byId(id) {
    return document.getElementById(id);
  }

  function readText(value) {
    return typeof value === 'string' ? value : '';
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

  function cacheElements() {
    els.navChecking = byId('auth-nav-checking');
    els.navSignedOut = byId('auth-nav-signed-out');
    els.navSignedIn = byId('auth-nav-signed-in');
    els.navName = byId('auth-nav-name');
    els.navEmail = byId('auth-nav-email');

    els.headerChecking = byId('auth-header-checking');
    els.headerSignedOut = byId('auth-header-signed-out');
    els.headerSignedIn = byId('auth-header-signed-in');
    els.headerName = byId('auth-header-name-text');

    els.statusBanner = byId('auth-status');

    els.signinForm = byId('signin-form');
    els.signinFormError = byId('signin-form-error');
    els.signinSubmit = byId('signin-submit');

    els.signupForm = byId('signup-form');
    els.signupFormError = byId('signup-form-error');
    els.signupSubmit = byId('signup-submit');

    els.accountName = byId('account-name');
    els.accountUsername = byId('account-username');
    els.accountEmail = byId('account-email');
  }

  /*
   * Only the four fields the API declares as safe are kept, and they are kept in
   * memory only. Nothing is written to browser storage and no session token is
   * ever read or handled here — the cookie is HTTP-only and stays on the server.
   */
  function sanitizeAdmin(admin) {
    if (!admin || typeof admin !== 'object') {
      return null;
    }

    return {
      id: typeof admin.id === 'string' || typeof admin.id === 'number' ? admin.id : '',
      username: readText(admin.username),
      email: readText(admin.email),
      full_name: readText(admin.full_name)
    };
  }

  function renderAuthNavigation() {
    const status = state.status;
    const checking = status === CHECKING;
    const signedIn = status === AUTHENTICATED;
    const signedOut = !checking && !signedIn;

    if (checking) {
      show(els.navChecking);
      show(els.headerChecking);
    } else {
      hide(els.navChecking);
      hide(els.headerChecking);
    }

    if (signedOut) {
      show(els.navSignedOut);
      show(els.headerSignedOut);
    } else {
      hide(els.navSignedOut);
      hide(els.headerSignedOut);
    }

    if (signedIn) {
      show(els.navSignedIn);
      show(els.headerSignedIn);

      setText(els.navName, state.admin ? state.admin.full_name : '');
      setText(els.navEmail, state.admin ? state.admin.email : '');
      setText(els.headerName, state.admin ? state.admin.username : '');
    } else {
      hide(els.navSignedIn);
      hide(els.headerSignedIn);

      setText(els.navName, '');
      setText(els.navEmail, '');
      setText(els.headerName, '');
    }

    renderAdminActions();
  }

  /*
   * Every control that can create data in the directory is marked with
   * `data-admin-only`, so an administrator-only action disappears the moment
   * the session is not confirmed — including while it is still being checked.
   */
  function renderAdminActions() {
    const signedIn = state.status === AUTHENTICATED;
    const actions = document.querySelectorAll('[data-admin-only]');

    for (let index = 0; index < actions.length; index += 1) {
      if (signedIn) {
        show(actions[index]);
      } else {
        hide(actions[index]);
      }
    }
  }

  function renderAccount() {
    const admin = state.status === AUTHENTICATED ? state.admin : null;

    setText(els.accountName, admin ? admin.full_name : '');
    setText(els.accountUsername, admin ? admin.username : '');
    setText(els.accountEmail, admin ? admin.email : '');
  }

  function setActiveView(view) {
    const links = document.querySelectorAll('aside [data-view]');

    for (let index = 0; index < links.length; index += 1) {
      const link = links[index];
      const active = link.getAttribute('data-view') === view;

      if (active) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('bg-stone-100', 'text-stone-900');
        link.classList.remove('text-stone-600', 'hover:bg-stone-50', 'hover:text-stone-900');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('bg-stone-100', 'text-stone-900');
        link.classList.add('text-stone-600', 'hover:bg-stone-50', 'hover:text-stone-900');
      }

      const icon = link.querySelector('svg');

      if (icon) {
        icon.classList.toggle('text-teal-700', active);
        icon.classList.toggle('text-stone-400', !active);
      }
    }
  }

  function clearStatusBanner() {
    if (!els.statusBanner) {
      return;
    }

    els.statusBanner.textContent = '';
    hide(els.statusBanner);
  }

  function showStatusBanner(message) {
    if (!els.statusBanner) {
      return;
    }

    show(els.statusBanner);
    els.statusBanner.textContent = message;
  }

  function renderView(view, focusHeading) {
    Object.keys(VIEW_SECTIONS).forEach(function (name) {
      const section = byId(VIEW_SECTIONS[name]);

      if (!section) {
        return;
      }

      if (name === view) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });

    document.title = VIEW_TITLES[view] || VIEW_TITLES.directory;
    setActiveView(view);
    clearStatusBanner();

    /* Entering an authentication form starts from a clean form: the
       application never restores previously entered personal details or
       passwords when a visitor comes back to the page. */
    if (view === 'signin') {
      resetSignInForm();
    } else if (view === 'signup') {
      resetSignUpForm();
    }

    /*
     * Other modules learn that a view is on screen through this event, so the
     * routing rules above stay the single place that decides what is visible.
     */
    document.dispatchEvent(new CustomEvent('staffdirectory:view', { detail: { view: view } }));

    if (!focusHeading) {
      return;
    }

    const section = byId(VIEW_SECTIONS[view]);
    const heading = section ? section.querySelector('h1') : null;

    if (heading && typeof heading.focus === 'function') {
      heading.focus();
    }
  }

  function resolveView() {
    const hash = window.location.hash;

    /*
     * Dashboard links can carry a filter intent as a query fragment (for
     * example `#tasks?status=Pending` or `#directory?status=On Leave`). The
     * route is the part before the `?`; the arriving view module reads and
     * applies the filter itself.
     */
    const queryIndex = hash.indexOf('?');
    const path = queryIndex === -1 ? hash : hash.slice(0, queryIndex);

    if (path === '#directory') {
      return 'directory';
    }

    if (path === '#signin') {
      return 'signin';
    }

    if (path === '#signup') {
      return 'signup';
    }

    if (path === '#account') {
      return 'account';
    }

    if (path === '#dashboard') {
      return 'dashboard';
    }

    if (path === '#add-staff') {
      return 'add-staff';
    }

    if (path === '#tasks') {
      return 'tasks';
    }

    if (path === '' || path === '#' || path === '#/') {
      return 'directory';
    }

    /* Unknown fragments (for example the #main-content skip link) are not
       application routes, so the router stays out of the way. */
    return null;
  }

  function redirect(view, focusHeading) {
    const target = '#' + view;

    if (window.location.hash !== target) {
      window.history.replaceState(null, '', target);
    }

    renderView(view, focusHeading !== false);
  }

  function handleRouteChange(options) {
    const focusHeading = Boolean(options && options.focusHeading);
    const view = resolveView();

    if (!view) {
      /* Not an application route — leave the current view and focus alone so
         in-page links such as the skip link keep working. */
      return;
    }

    /*
     * Administrator views render real account details and real creation
     * controls, so both wait for the session check. The public directory and
     * the two auth forms are safe to show straight away.
     */
    if (state.status === CHECKING) {
      if (ADMIN_ONLY_VIEWS.indexOf(view) === -1) {
        renderView(view, false);
      }
      return;
    }

    if (ADMIN_ONLY_VIEWS.indexOf(view) !== -1 && state.status !== AUTHENTICATED) {
      redirect('signin', focusHeading);
      return;
    }

    if ((view === 'signin' || view === 'signup') && state.status === AUTHENTICATED) {
      redirect('account', focusHeading);
      return;
    }

    renderView(view, focusHeading);
  }

  async function checkSession() {
    try {
      const data = await api.getCurrentAdmin();
      const admin = sanitizeAdmin(data ? data.admin : null);

      if (admin) {
        state = { status: AUTHENTICATED, admin: admin };
      } else {
        state = { status: UNAUTHENTICATED, admin: null };
        console.warn('Staff Directory: the session response did not include an administrator.');
      }
    } catch (error) {
      if (error && error.status === 401) {
        /* Not signed in is an expected state, not an application error. */
        state = { status: UNAUTHENTICATED, admin: null };
      } else {
        state = { status: AUTH_ERROR, admin: null };
        console.warn(
          'Staff Directory: unable to confirm the session.',
          (error && error.message) || error
        );
      }
    }

    renderAuthNavigation();
    renderAccount();
    handleRouteChange({ focusHeading: false });
  }

  function applyAuthenticated(admin) {
    state = { status: AUTHENTICATED, admin: admin };

    renderAuthNavigation();
    renderAccount();
    redirect('account', true);
  }

  /*
   * Called when a protected request answers HTTP 401. The backend is the
   * source of truth, so the local signed-in state is dropped straight away,
   * the navigation is redrawn and the visitor is returned to the sign-in
   * screen with an explanation instead of a fake success.
   */
  function handleSessionExpired(message) {
    state = { status: UNAUTHENTICATED, admin: null };

    renderAuthNavigation();
    renderAccount();
    redirect('signin', true);
    showStatusBanner(message || 'Your session has expired. Sign in again to continue.');
  }

  function clearFieldError(field) {
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

  function clearFieldErrors(fields) {
    fields.forEach(clearFieldError);
  }

  function applyFieldErrors(fields, errors) {
    let firstInputId = null;

    fields.forEach(function (field) {
      const message = errors[field.key];

      if (!message) {
        return;
      }

      const input = byId(field.inputId);
      const errorElement = byId(field.errorId);

      if (errorElement) {
        errorElement.textContent = message;
        show(errorElement);
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

  function showFormError(element, message) {
    if (!element) {
      return;
    }

    show(element);
    element.textContent = message;
  }

  function clearFormError(element) {
    if (!element) {
      return;
    }

    element.textContent = '';
    hide(element);
  }

  /*
   * Form-state hygiene for the two authentication forms.
   *
   * Entering either view starts from a clean form, failed submissions keep
   * only the fields that help correct the error (never the password), and
   * signing out clears both forms. The application never restores a previous
   * administrator's details or a previous password.
   *
   * Browser autofill and password managers are a separate layer: the fields
   * carry the recommended `autocomplete` attributes and the application never
   * writes credentials or session state to localStorage or sessionStorage,
   * but the application cannot force every browser or password manager to
   * ignore a field. What this code guarantees is that the application itself
   * never repopulates those values.
   */
  function clearFieldValue(inputId) {
    const input = byId(inputId);

    if (input && typeof input.value === 'string') {
      input.value = '';
    }
  }

  function resetSignInForm() {
    clearFieldErrors(SIGN_IN_FIELDS);
    clearFormError(els.signinFormError);
    clearFieldValue('signin-email');
    clearFieldValue('signin-password');
  }

  function resetSignUpForm() {
    clearFieldErrors(SIGN_UP_FIELDS);
    clearFormError(els.signupFormError);
    clearFieldValue('signup-name');
    clearFieldValue('signup-username');
    clearFieldValue('signup-email');
    clearFieldValue('signup-password');
  }

  function resetAuthForms() {
    resetSignInForm();
    resetSignUpForm();
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

  function valueOf(input) {
    return input && typeof input.value === 'string' ? input.value.trim() : '';
  }

  function validateSignIn() {
    const errors = {};
    const email = valueOf(byId('signin-email'));
    const password = byId('signin-password') ? byId('signin-password').value : '';

    if (!email) {
      errors.email = 'Enter your email address.';
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Enter your password.';
    }

    return errors;
  }

  function validateSignUp() {
    const errors = {};

    const fullName = valueOf(byId('signup-name'));
    const username = valueOf(byId('signup-username'));
    const email = valueOf(byId('signup-email'));
    const password = byId('signup-password') ? byId('signup-password').value : '';

    if (!fullName) {
      errors.fullName = 'Enter your full name.';
    }

    if (!username) {
      errors.username = 'Enter a username.';
    }

    if (!email) {
      errors.email = 'Enter your email address.';
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Enter a password.';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = 'Use at least ' + MIN_PASSWORD_LENGTH + ' characters.';
    }

    return errors;
  }

  function setSubmitting(form, submitButton, formType, active) {
    if (form) {
      if (active) {
        form.setAttribute('aria-busy', 'true');
      } else {
        form.removeAttribute('aria-busy');
      }
    }

    if (submitButton) {
      submitButton.disabled = active;

      const label = submitButton.querySelector('span');

      if (label) {
        label.textContent = active ? BUSY_LABELS[formType] : IDLE_LABELS[formType];
      }
    }
  }

  async function handleSignInSubmit(event) {
    event.preventDefault();

    if (signingIn) {
      return;
    }

    clearFormError(els.signinFormError);
    clearFieldErrors(SIGN_IN_FIELDS);

    const errors = validateSignIn();

    if (Object.keys(errors).length > 0) {
      applyFieldErrors(SIGN_IN_FIELDS, errors);
      /* Never keep a password in the field after a failed attempt. */
      clearFieldValue('signin-password');
      return;
    }

    signingIn = true;
    setSubmitting(els.signinForm, els.signinSubmit, 'signin', true);

    try {
      const data = await api.loginAdmin({
        email: byId('signin-email').value,
        password: byId('signin-password').value
      });

      const admin = sanitizeAdmin(data ? data.admin : null);

      if (!admin) {
        clearFieldValue('signin-password');
        showFormError(els.signinFormError, FALLBACK_MESSAGES.unknownAccount);
        return;
      }

      applyAuthenticated(admin);
      clearFieldValue('signin-password');
    } catch (error) {
      if (shouldLogError(error)) {
        console.error('Staff Directory sign in failed:', (error && error.message) || error);
      }

      clearFieldValue('signin-password');

      showFormError(
        els.signinFormError,
        messageForError(error, FALLBACK_MESSAGES.signIn)
      );
    } finally {
      signingIn = false;
      setSubmitting(els.signinForm, els.signinSubmit, 'signin', false);
    }
  }

  async function handleSignUpSubmit(event) {
    event.preventDefault();

    if (signingUp) {
      return;
    }

    clearFormError(els.signupFormError);
    clearFieldErrors(SIGN_UP_FIELDS);

    const errors = validateSignUp();

    if (Object.keys(errors).length > 0) {
      applyFieldErrors(SIGN_UP_FIELDS, errors);
      /* Never keep a password in the field after a failed attempt. */
      clearFieldValue('signup-password');
      return;
    }

    signingUp = true;
    setSubmitting(els.signupForm, els.signupSubmit, 'signup', true);

    try {
      const data = await api.registerAdmin({
        fullName: byId('signup-name').value,
        username: byId('signup-username').value,
        email: byId('signup-email').value,
        password: byId('signup-password').value
      });

      const admin = sanitizeAdmin(data ? data.admin : null);

      if (!admin) {
        clearFieldValue('signup-password');
        showFormError(els.signupFormError, FALLBACK_MESSAGES.unknownAccount);
        return;
      }

      /* The server already started the session, so there is no second sign in.
         The registration data has been consumed, so the form is cleared
         rather than keeping a password or personal details in the DOM. */
      resetSignUpForm();
      applyAuthenticated(admin);
    } catch (error) {
      if (shouldLogError(error)) {
        console.error('Staff Directory sign up failed:', (error && error.message) || error);
      }

      clearFieldValue('signup-password');

      showFormError(
        els.signupFormError,
        messageForError(error, FALLBACK_MESSAGES.signUp)
      );
    } finally {
      signingUp = false;
      setSubmitting(els.signupForm, els.signupSubmit, 'signup', false);
    }
  }

  function setSigningOut(active) {
    const buttons = document.querySelectorAll('[data-sign-out]');

    for (let index = 0; index < buttons.length; index += 1) {
      const button = buttons[index];

      button.disabled = active;

      const label = button.querySelector('span');

      if (label) {
        label.textContent = active ? SIGNING_OUT_LABEL : SIGN_OUT_LABEL;
      }
    }
  }

  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    signingOut = true;
    setSigningOut(true);
    clearStatusBanner();

    try {
      await api.logoutAdmin();
    } catch (error) {
      if (shouldLogError(error)) {
        console.error('Staff Directory sign out failed:', (error && error.message) || error);
      }

      /*
       * The server owns the HTTP-only cookie, so the signed-in state is only
       * cleared once the server confirms the session ended.
       */
      showStatusBanner(messageForError(error, FALLBACK_MESSAGES.signOut));
      return;
    } finally {
      signingOut = false;
      setSigningOut(false);
    }

    state = { status: UNAUTHENTICATED, admin: null };

    /* Both authentication forms start clean again: no previously entered
       name, username, email or password is carried into the next sign-in or
       sign-up session. */
    resetAuthForms();

    renderAuthNavigation();
    renderAccount();
    redirect('directory', true);
  }

  function bindFieldErrors(fields, form, formError) {
    fields.forEach(function (field) {
      const input = byId(field.inputId);

      if (!input) {
        return;
      }

      input.addEventListener('input', function () {
        clearFieldError(field);
      });
    });

    if (form && formError) {
      form.addEventListener('input', function () {
        clearFormError(formError);
      });
    }
  }

  function bindEvents() {
    if (els.signinForm) {
      els.signinForm.addEventListener('submit', handleSignInSubmit);
    }

    if (els.signupForm) {
      els.signupForm.addEventListener('submit', handleSignUpSubmit);
    }

    const signOutButtons = document.querySelectorAll('[data-sign-out]');

    for (let index = 0; index < signOutButtons.length; index += 1) {
      signOutButtons[index].addEventListener('click', handleSignOut);
    }

    bindFieldErrors(SIGN_IN_FIELDS, els.signinForm, els.signinFormError);
    bindFieldErrors(SIGN_UP_FIELDS, els.signupForm, els.signupFormError);

    window.addEventListener('hashchange', function () {
      handleRouteChange({ focusHeading: true });
    });

    /*
     * Browsers may restore the page — and with it form values — from the
     * back/forward cache or session history. Reset the authentication forms
     * every time the page is shown again so personal details or passwords
     * typed earlier never reappear.
     */
    window.addEventListener('pageshow', function () {
      resetAuthForms();
    });
  }

  function init() {
    if (started) {
      return;
    }

    api = window.StaffDirectoryApi;

    if (!api) {
      console.error('Staff Directory authentication could not start: API module is unavailable.');
      return;
    }

    started = true;

    cacheElements();
    bindEvents();
    renderAuthNavigation();
    renderAccount();

    handleRouteChange({ focusHeading: false });
    checkSession();
  }

  function getState() {
    return {
      status: state.status,
      admin: state.admin ? Object.assign({}, state.admin) : null
    };
  }

  window.StaffDirectoryAuth = {
    init: init,
    getState: getState,
    handleSessionExpired: handleSessionExpired
  };
})();
