// src/storage.js

const KEY = 'my_tv_library_v2'; // Cambiamos el nombre para no mezclar con la versión anterior

export function getLibrary() {
    const seriesString = localStorage.getItem(KEY);
    console.log("Intentando leer del LocalStorage con la clave:", KEY); // <--- Chivato 1
    console.log("Lo que he encontrado es:", seriesString); // <--- Chivato 2
    return seriesString ? JSON.parse(seriesString) : [];
}

export function addToLibrary(serie) {
    const library = getLibrary();
    if (library.some(item => item.id === serie.id)) return false;

    const newEntry = {
        id: serie.id,
        name: serie.name,
        poster_path: serie.poster_path,
        number_of_seasons: serie.number_of_seasons, // Necesitamos saber cuántas carpetas crear
        watchedEpisodes: [] // ARRAY DE IDs (ej: "S1_E1", "S1_E2")
    };

    library.push(newEntry);
    localStorage.setItem(KEY, JSON.stringify(library));
    return true;
}

// Nueva función: Marcar/Desmarcar un capítulo concreto
export function toggleEpisode(seriesId, seasonNum, episodeNum) {
    const library = getLibrary();
    const index = library.findIndex(item => item.id == seriesId);

    if (index !== -1) {
        const serie = library[index];
        // Creamos un ID único para el capítulo: "S1_E5"
        const episodeCode = `S${seasonNum}_E${episodeNum}`;

        // Si ya está, lo quitamos (filter). Si no está, lo ponemos (push).
        if (serie.watchedEpisodes.includes(episodeCode)) {
            serie.watchedEpisodes = serie.watchedEpisodes.filter(code => code !== episodeCode);
        } else {
            serie.watchedEpisodes.push(episodeCode);
        }

        library[index] = serie;
        localStorage.setItem(KEY, JSON.stringify(library));
        return true;
    }
    return false;
}

// Saber si un capitulo concreto está visto (para pintar el checkbox)
export function isEpisodeWatched(seriesId, seasonNum, episodeNum) {
    const library = getLibrary();
    const serie = library.find(item => item.id == seriesId);
    if (!serie) return false;
    
    const episodeCode = `S${seasonNum}_E${episodeNum}`;
    return serie.watchedEpisodes.includes(episodeCode);
}

export function isInLibrary(id) {
    const library = getLibrary();
    return library.some(item => item.id === id);
}