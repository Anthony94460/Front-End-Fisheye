export function mediaFactory(media) {
  const { id, title, image, video, likes, photographerId, thumbnail, date } = media;
  const mediaPath = `assets/media/${photographerId}/${image || thumbnail}`;

  function getMediaCardDOM() {
    const article = document.createElement('article');
    article.classList.add('media-card',);
    

    let mediaElement;
    if (image) {
      mediaElement = document.createElement('img');
      mediaElement.setAttribute('src', mediaPath);
      mediaElement.setAttribute('alt', title);
    } else if (thumbnail) {
      mediaElement = document.createElement('img');
      mediaElement.setAttribute('src', mediaPath);
      mediaElement.setAttribute('alt', title);
    }

    mediaElement.classList.add("media-item");
    mediaElement.setAttribute('data-full', mediaElement.src);
    mediaElement.setAttribute("tabindex", "0");

    mediaElement.dataset.id = media.id;

    const mediaInfo = document.createElement('div');
    mediaInfo.classList.add('media-info');
    mediaInfo.dataset.id = media.id;
    mediaInfo.innerHTML = `
      <h2>${title}</h2>
      <div class="likes">
        <span class="like-count">${likes}</span>
        <button class="like-button" aria-label="Ajouter un like">
        <i class="fa-solid fa-heart" aria-hidden="true"></i>
      </button>
      </div>
    `;

    article.appendChild(mediaElement);
    article.appendChild(mediaInfo);

    return article;
  }

  return { getMediaCardDOM };
}