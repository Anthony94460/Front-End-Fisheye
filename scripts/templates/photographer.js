  function photographerTemplate(data) {
    const { name, portrait, city, country, tagline, price, id } = data;

    const picture = `assets/photographers/${portrait}`;

    function getUserCardDOM() {
        const article = document.createElement("article");
        
        // URL vers la page du photographe
        const photographerURL = `photographer.html?id=${id}`;

        // Lien autour de l'image
        const link = document.createElement("a");
        link.setAttribute("href", photographerURL);
        link.setAttribute("aria-label", name);

        // Création de la div qui contiendra l'image
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-container");
        
        const img = document.createElement("img");
        img.setAttribute("src", picture);
        img.setAttribute("alt", name);
        img.classList.add("photographer-image");

        imageContainer.appendChild(img); // on insère l'image dans la div
        link.appendChild(imageContainer); // <a><div><img></div></a>
        article.appendChild(link);// on ajoute le lien à l'article

        // Lien autour du nom (h2)
        const nameLink = document.createElement("a");
        nameLink.setAttribute("href", photographerURL);
        nameLink.setAttribute("aria-label", `Voir la page de ${name}`);
        
        const h2 = document.createElement("h2");
        h2.textContent = name;

        nameLink.appendChild(h2);
        article.appendChild(nameLink); // <a><h2></h2></a>

        const location = document.createElement("p");
        location.textContent = `${city}, ${country}`;
        location.classList.add("photographer-location");

        const slogan = document.createElement("p");
        slogan.textContent = tagline;
        slogan.classList.add("photographer-tagline");

        const rate = document.createElement("p");
        rate.textContent = `${price}€/jour`;
        rate.classList.add("photographer-price");

        
        article.appendChild(location);
        article.appendChild(slogan);
        article.appendChild(rate);

        return article;
    }

    return { name, picture, getUserCardDOM };
}

