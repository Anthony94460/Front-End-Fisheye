    async function getPhotographers() {
    console.log("getPhotographers() appelée");

    try {
        const response = await fetch("data/photographers.json");
        const data = await response.json();

        console.log("Données récupérées avec fetch :", data.photographers);

        return {
            photographers: data.photographers
        };
    } catch (error) {
        console.error("Erreur lors du fetch :", error);
        return { photographers: [] };
    }
}

    async function displayData(photographers) {
        console.log("displayData() appelé avec :", photographers);
        const photographersSection = document.querySelector(".photographer_section");
        console.log("Section HTML ciblée :", photographersSection);

        photographers.forEach((photographer) => {
            const photographerModel = photographerTemplate(photographer);
            const userCardDOM = photographerModel.getUserCardDOM();
            photographersSection.appendChild(userCardDOM);
        });
    }

    async function init() {
        console.log("init() appelée");
        // Récupère les datas des photographes
        const { photographers } = await getPhotographers();
        console.log("Photographers reçus dans init() :", photographers);
        displayData(photographers);
    }
    
    init();
    
