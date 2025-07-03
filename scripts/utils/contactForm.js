const modal = document.getElementById("contact_modal");
const closeBtn = modal.querySelector('img[alt="Fermer la fenêtre de contact"]');
const openModalBtn = document.querySelector(".contact_button"); 
const firstInput = document.getElementById("first-name");

function trapFocus(element) {
  const focusableSelectors = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])'
  ];

  const focusableElements = Array.from(element.querySelectorAll(focusableSelectors.join(',')));
  if (focusableElements.length === 0) return null;

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown);

  // Retourne une fonction pour retirer le piège plus tard
  return () => element.removeEventListener('keydown', handleKeyDown);
}

let removeFocusTrap = null;

function displayModal() {
  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");

  removeFocusTrap = trapFocus(modal);

  // Focus sur le premier champ du formulaire
  firstInput.focus();
}

function closeModal() {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");

  if (removeFocusTrap) {
    removeFocusTrap();
    removeFocusTrap = null;
  }

  // Si un élément dans la modale a le focus, le retirer
  if (document.activeElement && modal.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  // Redonner le focus au bouton d'ouverture si présent
  if (openModalBtn) openModalBtn.focus();
}

// Permet de fermer la modale avec la touche "Entrée" sur l'icône de fermeture
closeBtn.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " " || e.code === "Space") {
    e.preventDefault();
    closeModal();
  }
});

const form = document.getElementById("contact-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  console.log("Formulaire soumis :", data);
  closeModal();
});