/**
 * Staff Directory - staff profile modal.
 *
 * Responsibilities: open the existing profile modal for a staff member, fill
 * it from the authoritative single-record API response, and manage the
 * dialog's visibility, focus and scroll behaviour.
 *
 * It never calls fetch() itself - it uses window.StaffDirectoryApi - and it
 * never builds the profile from HTML strings, so staff data is always
 * inserted as text.
 */

(function () {
  'use strict';

  const MODAL_ID = 'profile-modal';
  const BACKDROP_ID = 'profile-modal-backdrop';
  const CLOSE_BUTTON_ID = 'profile-modal-close';
  const GRID_ID = 'staff-grid';

  /** ui.js marks every rendered card button with the record's id. */
  const CARD_SELECTOR = 'button[data-staff-id]';

  const OPEN_CLASS = 'is-open';
  const HIDDEN_CLASS = 'hidden';
  const OVERFLOW_HIDDEN_CLASS = 'overflow-hidden';

  const FIELD_IDS = {
    avatar: 'profile-modal-avatar',
    initials: 'profile-modal-avatar-initials',
    name: 'profile-modal-name',
    title: 'profile-modal-title',
    status: 'profile-modal-status',
    department: 'profile-modal-department',
    role: 'profile-modal-role',
    email: 'profile-modal-email',
    phone: 'profile-modal-phone',
    location: 'profile-modal-location',
    bio: 'profile-modal-bio'
  };

  /**
   * Status colours mirror the card badges in ui.js so both views agree.
   * The CDN build scans literal class names, so these stay whole strings.
   */
  const STATUS_COLOUR_CLASSES = {
    Active: 'bg-emerald-50 text-emerald-700',
    'On Leave': 'bg-amber-50 text-amber-700',
    Inactive: 'bg-stone-100 text-stone-600'
  };
  const NEUTRAL_COLOUR_CLASSES = 'bg-stone-100 text-stone-600';
  const STATUS_BASE_CLASSES = 'mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium';

  const INITIALS_BASE_CLASSES =
    'h-16 w-16 shrink-0 items-center justify-center rounded-full bg-stone-200 text-lg font-semibold text-stone-600';

  /** Shown instead of a value the record does not provide. */
  const EMPTY_VALUE = '—';

  const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /** Mirrors --transition-base in styles.css. */
  const TRANSITION_MS = 200;

  /** The card that opened the dialog, so focus can be given back on close. */
  let triggerElement = null;
  let closeTimer = null;
  /** Monotonic token so a slow record response cannot open the wrong profile. */
  let requestToken = 0;
  /** Token value of the most recently settled request; differs while loading. */
  let settledToken = 0;
  let initialised = false;

  function readText(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function getModal() {
    return document.getElementById(MODAL_ID);
  }

  function buildInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';

    return (first + last).toUpperCase() || '?';
  }

  /** Writes text into a modal field, or a neutral dash when the value is absent. */
  function setFieldText(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value || EMPTY_VALUE;
    }
  }

  /**
   * Shows the avatar image when a usable avatar_url exists, otherwise hides
   * it and shows initials. No external image service is ever contacted.
   */
  function setAvatar(staffMember) {
    const image = document.getElementById(FIELD_IDS.avatar);
    const initials = document.getElementById(FIELD_IDS.initials);
    const avatarUrl = readText(staffMember.avatar_url);

    if (avatarUrl) {
      if (image) {
        image.classList.remove(HIDDEN_CLASS);
        image.setAttribute('src', avatarUrl);
        image.setAttribute('alt', '');
      }

      if (initials) {
        initials.className = HIDDEN_CLASS + ' ' + INITIALS_BASE_CLASSES;
      }

      return;
    }

    if (image) {
      image.classList.add(HIDDEN_CLASS);
      image.removeAttribute('src');
    }

    if (initials) {
      initials.className = 'flex ' + INITIALS_BASE_CLASSES;
      initials.textContent = buildInitials(
        readText(staffMember.first_name),
        readText(staffMember.last_name)
      );
    }
  }

  function setStatus(status) {
    const element = document.getElementById(FIELD_IDS.status);

    if (!element) {
      return;
    }

    const label = readText(status);
    const colours = STATUS_COLOUR_CLASSES[label] || NEUTRAL_COLOUR_CLASSES;

    element.className = STATUS_BASE_CLASSES + ' ' + colours;
    element.textContent = label || EMPTY_VALUE;
  }

  /**
   * Email is a link, so the href is rebuilt with a mailto: prefix. The prefix
   * is fixed by us, so the value can never introduce a different URL scheme.
   */
  function setEmail(staffMember) {
    const link = document.getElementById(FIELD_IDS.email);

    if (!link) {
      return;
    }

    const email = readText(staffMember.email);

    if (email) {
      link.setAttribute('href', 'mailto:' + email);
      link.textContent = email;
      return;
    }

    link.removeAttribute('href');
    link.textContent = EMPTY_VALUE;
  }

  /** Fills every field from the record, replacing whatever was shown before. */
  function populateProfile(staffMember) {
    const member = staffMember || {};
    const firstName = readText(member.first_name);
    const lastName = readText(member.last_name);
    const name =
      readText(member.full_name) || (firstName && lastName ? firstName + ' ' + lastName : firstName || lastName);

    setFieldText(FIELD_IDS.name, name);
    setFieldText(FIELD_IDS.title, readText(member.job_title));
    setFieldText(FIELD_IDS.department, readText(member.department));
    setFieldText(FIELD_IDS.role, readText(member.role));
    setFieldText(FIELD_IDS.phone, readText(member.phone));
    setFieldText(FIELD_IDS.location, readText(member.location));
    setFieldText(FIELD_IDS.bio, readText(member.bio));
    setEmail(member);
    setStatus(member.employment_status);
    setAvatar(member);
  }

  function isOpen() {
    const modal = getModal();

    return Boolean(modal) && !modal.classList.contains(HIDDEN_CLASS);
  }

  function lockPageScroll() {
    document.body.classList.add(OVERFLOW_HIDDEN_CLASS);
  }

  function unlockPageScroll() {
    document.body.classList.remove(OVERFLOW_HIDDEN_CLASS);
  }

  function openModal() {
    const modal = getModal();

    if (!modal) {
      return;
    }

    // A pending close would otherwise hide a dialog that was just reopened.
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    modal.classList.remove(HIDDEN_CLASS);
    modal.setAttribute('aria-hidden', 'false');
    lockPageScroll();

    // Force a reflow so the opening opacity transition actually runs.
    void modal.offsetWidth;

    modal.classList.add(OPEN_CLASS);

    const closeButton = document.getElementById(CLOSE_BUTTON_ID);

    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeModal() {
    const modal = getModal();

    if (!modal) {
      return;
    }

    // Dismissing abandons any profile request still in flight, so a late
    // response cannot re-open a dialog the user has already dismissed. This
    // runs even when the dialog is not yet visible, because the window
    // between a card click and the response arriving is exactly when the
    // user is most likely to change their mind.
    requestToken += 1;

    if (!isOpen()) {
      return;
    }

    modal.classList.remove(OPEN_CLASS);
    modal.setAttribute('aria-hidden', 'true');
    unlockPageScroll();

    // Give focus back to the card that opened the dialog.
    if (triggerElement && typeof triggerElement.focus === 'function') {
      triggerElement.focus();
    }

    triggerElement = null;

    const finish = function () {
      if (modal.classList.contains(OPEN_CLASS)) {
        return;
      }

      modal.classList.add(HIDDEN_CLASS);
    };

    modal.addEventListener('transitionend', finish, { once: true });

    // Fallback in case the transition never fires.
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
    }

    closeTimer = setTimeout(function () {
      closeTimer = null;
      finish();
    }, TRANSITION_MS + 40);
  }

  /**
   * Fetches the authoritative record and shows the profile.
   * Nothing is opened when the request fails, so a blank dialog never appears.
   */
  async function openProfile(staffId) {
    const token = ++requestToken;

    try {
      const staffMember = await window.StaffDirectoryApi.getStaffById(staffId);
      settledToken = token;

      if (token !== requestToken) {
        return;
      }

      populateProfile(staffMember);
      openModal();
    } catch (error) {
      settledToken = token;

      if (token !== requestToken) {
        return;
      }

      console.error(
        'Staff Directory failed to load the staff profile:',
        (error && error.message) || error
      );
    }
  }

  /**
   * The id is only accepted when it is a positive integer, which is exactly
   * what the API accepts, so a bad value never triggers a doomed request.
   */
  function isRequestableStaffId(rawValue) {
    if (typeof rawValue !== 'string' || !/^[1-9][0-9]*$/.test(rawValue)) {
      return false;
    }

    return Number(rawValue) >= 1;
  }

  /**
   * Delegated from the grid rather than bound per card, so listeners survive
   * every re-render that ui.js and filters.js perform.
   */
  function handleGridClick(event) {
    const target = event.target;

    if (!target || typeof target.closest !== 'function') {
      return;
    }

    const card = target.closest(CARD_SELECTOR);

    if (!card || !getModal()) {
      return;
    }

    const staffId = card.getAttribute('data-staff-id');

    if (!isRequestableStaffId(staffId)) {
      console.error('Staff Directory could not open a profile: the card has no usable staff id.');
      return;
    }

    triggerElement = card;
    openProfile(staffId);
  }

  function handleModalClick(event) {
    const modal = getModal();
    const backdrop = document.getElementById(BACKDROP_ID);

    if (!modal) {
      return;
    }

    // Only the container itself or the backdrop counts as "outside".
    if (event.target === modal || event.target === backdrop) {
      closeModal();
    }
  }

  function handleKeyDown(event) {
    const modalIsOpen = isOpen();
    const loadIsPending = requestToken !== settledToken;

    if (!modalIsOpen && !loadIsPending) {
      return;
    }

    if (event.key === 'Escape' || event.key === 'Esc') {
      // Escape works while the profile is still loading too, so a dismissed
      // card click cannot pop the dialog open after the fact.
      event.preventDefault();
      closeModal();
      return;
    }

    if (!modalIsOpen) {
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    // Keep Tab inside the dialog while it is open.
    const modal = getModal();
    const focusable = modal.querySelectorAll(FOCUSABLE_SELECTOR);

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /**
   * Attaches the modal listeners. Called once by app.js after the initial
   * load; it never requests data by itself.
   */
  function init() {
    if (initialised) {
      return;
    }

    initialised = true;

    const grid = document.getElementById(GRID_ID);
    const modal = getModal();
    const closeButton = document.getElementById(CLOSE_BUTTON_ID);

    if (grid) {
      grid.addEventListener('click', handleGridClick);
    }

    if (modal) {
      modal.addEventListener('click', handleModalClick);
    }

    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', handleKeyDown);
  }

  window.StaffDirectoryModal = {
    init
  };
})();
