import { mediaFactory } from '../templates/media.js';

function trapFocus(container) {
  const focusableSelectors = [
    'a[href]', 'area[href]', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    'button:not([disabled])', 'iframe', 'object', 'embed',
    '[contenteditable]', '[tabindex]:not([tabindex="-1"])'
  ];

  const focusables = container.querySelectorAll(focusableSelectors.join(','));
  if (!focusables.length) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  function handleKeyDown(e) {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  // Retourne une fonction pour retirer l’écouteur quand on ferme
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

let medias = [];
let currentIndex = 0;


// Fonction principale
async function displayPhotographerProfile() {
  const params = new URLSearchParams(window.location.search);
  const photographerId = parseInt(params.get('id'), 10);
  
  let data;
  let photographer;
  
  try {
    const response = await fetch('/data/photographers.json');
    data = await response.json();

    photographer = data.photographers.find(p => p.id === photographerId);
    
    if (!photographer) {
      console.error('Photographe introuvable');
      return;
    }

    displayPhotographerData(photographer);
  } catch (error) {
    console.error('Erreur lors du chargement des données :', error);
    return;
  }

  medias = data.media.filter(media => media.photographerId === photographerId); 
  const totalLikes = medias.reduce((sum, media) => sum + media.likes, 0);
  displayPriceBox(photographer, totalLikes);
  renderMedia(); // Affiche les médias + attaches les events
}

function displayPhotographerData(photographer) {
  const header = document.querySelector('.photograph-header');
  const infoContainer = header.querySelector('.photograph-info');
  const portrait = header.querySelector('img.photographer-portrait');

  const { name, city, country, tagline, portrait: portraitFile } = photographer;

  infoContainer.innerHTML = `
    <h1>${name}</h1>
    <p class="photographer-location">${city}, ${country}</p>
    <p class="photographer-tagline">${tagline}</p>
  `;

  portrait.src = `assets/photographers/${portraitFile}`;
  portrait.alt = `Portrait de ${name}`;

  const modalTitle = document.querySelector('#contact_modal h2');
  if (modalTitle) {
    modalTitle.innerHTML = `Contactez-moi<br>${name}`;
  }
}

function displayPriceBox(photographer, totalLikes) {
  const priceBox = document.createElement('div');
  priceBox.className = 'price-box';
  priceBox.innerHTML = `
    <span aria-label="Nombre de likes">
      ${totalLikes} <i class="fa-solid fa-heart" aria-hidden="true"></i>
    </span>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <span aria-label="Tarif journalier">
      ${photographer.price}€ / jour
    </span>`;
  document.body.appendChild(priceBox);
}

function renderMedia() {
  const mediaSection = document.querySelector('.media-section') || createMediaSection();
  mediaSection.innerHTML = "";

  medias.forEach(media => {
    const mediaModel = mediaFactory(media);
    const mediaCard = mediaModel.getMediaCardDOM();
    mediaSection.appendChild(mediaCard);
  });

  initLikeSystem();
  displayLightbox();
}

function createMediaSection() {
  const mediaSection = document.createElement('section');
  mediaSection.classList.add('media-section');
  document.querySelector('main').appendChild(mediaSection);
  return mediaSection;
}

function displayLightbox() {
  const allMedias = document.querySelectorAll('.media-item');
  const lightWrapper = document.querySelector('#lightbox_wrapper');
  const imageProvider = document.querySelector('#lightbox_media');

  allMedias.forEach(media => {
    // Clic souris
    media.addEventListener('click', () => openLightbox(media));

    // Clavier (Enter ou Espace)
    media.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(media);
      }
    });
  });
  
  let removeFocusTrap = null;

  function openLightbox(media) {
    lightWrapper.removeAttribute('hidden');
    lightWrapper.classList.add('active');
    currentIndex = medias.findIndex(image => image.id == media.dataset.id);
    lightboxTemplate();

    // Met le focus sur le bouton "fermer" pour accessibilité
    document.querySelector('.close').focus();
    removeFocusTrap = trapFocus(lightWrapper);
  }

  function lightboxTemplate() {
    const currentMedia = medias[currentIndex];

    if (!currentMedia) {
      console.error("Aucun média trouvé pour l'index :", currentIndex);
      return;
    }

    const { photographerId, image, video, thumbnail, title } = currentMedia;

    let mediaHTML = '';

    if (image) {
      mediaHTML = `<img src="assets/media/${photographerId}/${image}" alt="${title}">
      <p class="lightbox-title" aria-label="Titre du média">${title}</p>`;
    } else if (video && thumbnail) {
      mediaHTML = `
        <video controls aria-label="${title}">
          <source src="assets/media/${photographerId}/${video}" type="video/mp4">
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
        <p class="lightbox-title" aria-label="Titre du média">${title}</p>`;
    }

    imageProvider.innerHTML = mediaHTML;
  }

  function navigateToIndex(newIndex) {
    currentIndex = newIndex;
    if (currentIndex < 0) currentIndex = medias.length - 1;
    if (currentIndex > medias.length - 1) currentIndex = 0;
    lightboxTemplate();
  }

  const btnNext = document.querySelector('.next');
  const btnPrev = document.querySelector('.prev');
  const btnClose = document.querySelector('.close');

  btnNext.addEventListener('click', () => navigateToIndex(currentIndex + 1));
  btnPrev.addEventListener('click', () => navigateToIndex(currentIndex - 1));
  btnClose.addEventListener('click', closeLightbox);

  function closeLightbox() {
    lightWrapper.classList.remove('active');
    lightWrapper.setAttribute('hidden', '');

    if (typeof removeFocusTrap === 'function') {
    removeFocusTrap();
    removeFocusTrap = null;
  }
  }

  // Écoute globale pour touches du clavier
  document.addEventListener('keydown', (event) => {
    const isLightboxActive = lightWrapper.classList.contains('active');
    if (!isLightboxActive) return;

    switch (event.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowRight':
        navigateToIndex(currentIndex + 1);
        break;
      case 'ArrowLeft':
        navigateToIndex(currentIndex - 1);
        break;
    }
  });
}

function initLikeSystem() {
  const likeButtons = document.querySelectorAll('.like-button');
  const totalLikesSpan = document.querySelector('.price-box span');
  let totalLikes = parseInt(totalLikesSpan.textContent);
  const likedMediaIds = new Set();

  likeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mediaCard = button.closest('.media-info');
      const mediaId = parseInt(mediaCard.dataset.id);
      const likeCountSpan = button.previousElementSibling;
      let mediaLikes = parseInt(likeCountSpan.textContent);

      if (likedMediaIds.has(mediaId)) {
        likedMediaIds.delete(mediaId);
        mediaLikes -= 1;
        totalLikes -= 1;
        button.classList.remove('liked');
      } else {
        likedMediaIds.add(mediaId);
        mediaLikes += 1;
        totalLikes += 1;
        button.classList.add('liked');
      }

      likeCountSpan.textContent = mediaLikes;
      totalLikesSpan.innerHTML = `
        ${totalLikes} <i class="fa-solid fa-heart" aria-hidden="true"></i>
      `;
    });
  });
}

// Tri
function sortMedias(criterion) {
  switch (criterion) {
    case "popularity":
      medias.sort((a, b) => b.likes - a.likes);
      break;
    case "date":
      medias.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "title":
      medias.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      console.warn("Critère de tri inconnu :", criterion);
      return;
  }

  renderMedia(); // Réaffiche les médias + remet les events
}

displayPhotographerProfile();

// Dropdown
const dropdown = document.querySelector('.custom-dropdown');
const options = dropdown.querySelector('.dropdown-options');
const selected = dropdown.querySelector('.selected');

function toggleDropdown() {
  const isOpen = dropdown.classList.contains('open');
  dropdown.classList.toggle('open');
  dropdown.setAttribute('aria-expanded', !isOpen);
  options.hidden = isOpen;

  const selectedText = selected.textContent;
  const optionElements = options.querySelectorAll('li');
  optionElements.forEach(option => {
    if (option.textContent.trim() === selectedText.trim()) {
      option.style.display = isOpen ? '' : 'none';
    } else {
      option.style.display = '';
    }
  });

  if (!isOpen) {
    applyMiddleBorder();
    
  }
}

// Gestion souris
dropdown.addEventListener('click', toggleDropdown);

// Gestion clavier
dropdown.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleDropdown();
  } else if (e.key === 'Escape') {
    toggleDropdown(false);
  }
});




const selectedText = dropdown.querySelector('.selected');
const optionItems = dropdown.querySelectorAll('[role="option"]');

optionItems.forEach((option, index) => {
  function selectOption() {
    const selectedValue = option.dataset.value;
    selectedText.textContent = option.textContent;

    optionItems.forEach(o => {
      o.setAttribute('aria-selected', 'false');
      o.classList.remove('hidden-option');
    });

    option.setAttribute('aria-selected', 'true');
    option.classList.add('hidden-option');
    sortMedias(selectedValue);
  }

  option.addEventListener('click', selectOption);

  option.addEventListener('keydown', (e) => {
    

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectOption();
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = optionItems[(index + 1) % optionItems.length];
      next.focus();
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = optionItems[(index - 1 + optionItems.length) % optionItems.length];
      prev.focus();
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift + Tab → vers le haut
        const prev = optionItems[(index - 1 + optionItems.length) % optionItems.length];
        prev.focus();
      } else {
        // Tab → vers le bas
        const next = optionItems[(index + 1) % optionItems.length];
        next.focus();
      }
    }

    if (e.key === 'Escape') {
      toggleDropdown(false);
      dropdown.focus();
    }
  });
});

function applyMiddleBorder() {
  const listbox = document.querySelector('.dropdown-options');
  const allOptions = Array.from(listbox.children);
  const visibleOptions = allOptions.filter(li => li.style.display !== 'none');

  const targetIndex = 0;

  allOptions.forEach((li) => {
    li.style.borderTop = '';
    li.style.borderBottom = '';
  });

  if (visibleOptions.length > targetIndex) {
    const middleOption = visibleOptions[targetIndex];
    middleOption.style.borderTop = '1px solid white';
    middleOption.style.borderBottom = '1px solid white';
    middleOption.style.paddingTop = '15px';
    middleOption.style.paddingBottom = '15px';
  }
}