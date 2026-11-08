const pokemonList = document.getElementById("pokemon-list");
const detailsSection = document.getElementById("pokemon-details");
const detailsContent = document.getElementById("details-content");
const statusText = document.getElementById("status");
const backButton = document.getElementById("back-button");
const showAllButton = document.getElementById("show-all-button");
const showFavoritesButton = document.getElementById("show-favorites-button");

const apiUrl = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";

let allPokemon = [];
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

// Hämtar Pokémon från API:et
async function loadPokemon() {
    statusText.textContent = "Hämtar Pokémon...";
    pokemonList.innerHTML = "";

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Kunde inte hämta listan med Pokémon.");
        }

        const data = await response.json();

        // Varje Pokémon i listan har en egen URL med mer information.
        for (const pokemon of data.results) {
            const pokemonResponse = await fetch(pokemon.url);

            if (!pokemonResponse.ok) {
                throw new Error("Kunde inte hämta information om en Pokémon.");
            }

            const pokemonData = await pokemonResponse.json();
            allPokemon.push(pokemonData);
        }

        statusText.textContent = "";
        showPokemon(allPokemon);
    } catch (error) {
        statusText.textContent = "Ett fel uppstod: " + error.message;
    }
}

// Skapar och visar Pokémon-korten
function showPokemon(pokemonArray) {
    pokemonList.innerHTML = "";

    if (pokemonArray.length === 0) {
        statusText.textContent = "Du har inga sparade favoriter ännu.";
        return;
    }

    statusText.textContent = "";

    pokemonArray.forEach(function(pokemon) {
        const card = document.createElement("article");
        card.className = "pokemon-card";

        const image = document.createElement("img");
        image.src = pokemon.sprites.front_default;
        image.alt = pokemon.name;

        const name = document.createElement("h2");
        name.textContent = pokemon.name;

        const favoriteButton = document.createElement("button");
        favoriteButton.className = "favorite-button";

        if (favorites.includes(pokemon.id)) {
            favoriteButton.textContent = "♥";
            favoriteButton.classList.add("is-favorite");
        } else {
            favoriteButton.textContent = "♡";
        }

        // Favoritknappen ska inte öppna detaljvyn.
        favoriteButton.addEventListener("click", function(event) {
            event.stopPropagation();
            toggleFavorite(pokemon.id);
            showPokemon(getCurrentPokemon());
        });

        card.appendChild(favoriteButton);
        card.appendChild(image);
        card.appendChild(name);

        card.addEventListener("click", function() {
            showDetails(pokemon);
        });

        pokemonList.appendChild(card);
    });
}

// Visar information om en vald Pokémon
function showDetails(pokemon) {
    pokemonList.classList.add("hidden");
    detailsSection.classList.remove("hidden");
    statusText.textContent = "";

    const types = pokemon.types.map(function(typeInfo) {
        return typeInfo.type.name;
    }).join(", ");

    const abilities = pokemon.abilities.map(function(abilityInfo) {
        return abilityInfo.ability.name;
    });

    const favoriteText = favorites.includes(pokemon.id) ? "♥ Ta bort favorit" : "♡ Lägg till favorit";

    detailsContent.innerHTML = `
        <h2>${pokemon.name} (#${pokemon.id})</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>Typ:</strong> ${types}</p>
        <p><strong>Längd:</strong> ${pokemon.height / 10} meter</p>
        <p><strong>Vikt:</strong> ${pokemon.weight / 10} kg</p>
        <h3>Förmågor</h3>
        <ul>
            ${abilities.map(function(ability) {
                return `<li>${ability}</li>`;
            }).join("")}
        </ul>
        <button id="details-favorite-button">${favoriteText}</button>
    `;

    document.getElementById("details-favorite-button").addEventListener("click", function() {
        toggleFavorite(pokemon.id);
        showDetails(pokemon);
    });
}

// Lägger till eller tar bort en Pokémon från favoriter
function toggleFavorite(pokemonId) {
    if (favorites.includes(pokemonId)) {
        favorites = favorites.filter(function(id) {
            return id !== pokemonId;
        });
    } else {
        favorites.push(pokemonId);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Hämtar den lista som ska visas just nu
function getCurrentPokemon() {
    if (showFavoritesButton.classList.contains("active")) {
        return allPokemon.filter(function(pokemon) {
            return favorites.includes(pokemon.id);
        });
    }

    return allPokemon;
}

// Visar alla Pokémon
showAllButton.addEventListener("click", function() {
    showAllButton.classList.add("active");
    showFavoritesButton.classList.remove("active");
    detailsSection.classList.add("hidden");
    pokemonList.classList.remove("hidden");
    showPokemon(allPokemon);
});

// Visar endast favoriter
showFavoritesButton.addEventListener("click", function() {
    showFavoritesButton.classList.add("active");
    showAllButton.classList.remove("active");
    detailsSection.classList.add("hidden");
    pokemonList.classList.remove("hidden");

    const favoritePokemon = allPokemon.filter(function(pokemon) {
        return favorites.includes(pokemon.id);
    });

    showPokemon(favoritePokemon);
});

// Går tillbaka till katalogen
backButton.addEventListener("click", function() {
    detailsSection.classList.add("hidden");
    pokemonList.classList.remove("hidden");
});

// Startar applikationen
loadPokemon();
