//Mettre le code JavaScript lié à la page photographer.html
import { mediaFactory } from '../templates/media.js';

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
    return
  }

medias = data.media.filter(media => media.photographerId === photographerId); 
displayPhotographerMedias(medias);
const totalLikes = medias.reduce((sum, media) => sum + media.likes, 0);
displayPriceBox(photographer, totalLikes);
initLikeSystem();
setTimeout(() => {
  displayLightbox();
}, 0);
}

function displayPhotographerMedias(medias) {
  const mediaSection = document.createElement('section');
  mediaSection.classList.add('media-section');
  document.querySelector('main').appendChild(mediaSection);

  medias.forEach((media) => {
    const mediaModel = mediaFactory(media);
    const mediaCard = mediaModel.getMediaCardDOM();
    mediaSection.appendChild(mediaCard);
  });
}


function displayPhotographerData(photographer) {
  const header = document.querySelector('.photograph-header');
  const infoContainer = header.querySelector('.photograph-info');
  const portrait = header.querySelector('img.photographer-portrait');

  const { name, city, country, tagline, portrait: portraitFile } = photographer;

  // Insérer les éléments de texte
  infoContainer.innerHTML = `
    <h1>${name}</h1>
    <p class="photographer-location">${city}, ${country}</p>
    <p class="photographer-tagline">${tagline}</p>
  `;

  // Image
  portrait.src = `assets/photographers/${portraitFile}`;
  portrait.alt = `Portrait de ${name}`;

  // Mettre le nom du photographe dans la modale
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

function displayLightbox() {
  const allMedias = document.querySelectorAll('.media-item');
  const lightWrapper = document.querySelector('#lightbox_wrapper');
  const imageProvider = document.querySelector('#lightbox_media');
  
  allMedias.forEach(media => {
    media.addEventListener('click', () => {
      lightWrapper.removeAttribute('hidden');
      lightWrapper.classList.add('active');
      currentIndex = medias.findIndex(image => image.id == media.dataset.id)
      lightboxTemplate();
    })
  })

  function lightboxTemplate() {
  const currentMedia = medias[currentIndex];

  if (!currentMedia) {
    console.error("Aucun média trouvé pour l'index :", currentIndex);
    return;
  }

  const { photographerId, image, video, thumbnail, title } = currentMedia;

  let mediaHTML = '';

  if (image) {
    // Cas image normale
    mediaHTML = `<img src="assets/media/${photographerId}/${image}" alt="${title}">
    <p class="lightbox-title" aria-label="Titre du média">${title}</p>`;
  } else if (video && thumbnail) {
    // Cas vidéo avec miniature
    mediaHTML = `<img src="assets/media/${photographerId}/${thumbnail}" alt="Miniature de ${title}">
    <p class="lightbox-title" aria-label="Titre du média">${title}</p>`;
  } 

  imageProvider.innerHTML = mediaHTML;

  }

  function navigateToIndex(newIndex) {
  currentIndex = newIndex
  if (currentIndex < 0) currentIndex = medias.length - 1;
  if (currentIndex > medias.length - 1) currentIndex = 0;
  lightboxTemplate();
}

const btnNext = document.querySelector('.next');
const btnPrev = document.querySelector('.prev');
const btnClose = document.querySelector('.close')
btnNext.addEventListener('click', () => navigateToIndex(currentIndex + 1));
btnPrev.addEventListener('click', () => navigateToIndex(currentIndex - 1));
btnClose.addEventListener('click', () => {
  lightWrapper.classList.toggle('active');
  lightWrapper.setAttribute('hidden', '')
})
};

function initLikeSystem() {
  const likeButtons = document.querySelectorAll('.like-button');
  const totalLikesSpan = document.querySelector('.price-box span'); // 1er span = total likes
  let totalLikes = parseInt(totalLikesSpan.textContent);

  const likedMediaIds = new Set(); // Pour suivre les médias likés

  likeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mediaCard = button.closest('.media-info');
      const mediaId = parseInt(mediaCard.dataset.id);
      const likeCountSpan = button.previousElementSibling;
      let mediaLikes = parseInt(likeCountSpan.textContent);

      if (likedMediaIds.has(mediaId)) {
        // Retirer le like
        likedMediaIds.delete(mediaId);
        mediaLikes -= 1;
        totalLikes -= 1;
        button.classList.remove('liked');
      } else {
        // Ajouter le like
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

displayPhotographerProfile();


const dropdown = document.querySelector('.custom-dropdown');
const options = dropdown.querySelector('.dropdown-options');

dropdown.addEventListener('click', () => {
  const isOpen = dropdown.classList.contains('open');
  dropdown.classList.toggle('open');
  dropdown.setAttribute('aria-expanded', !isOpen);
  options.hidden = isOpen;
});