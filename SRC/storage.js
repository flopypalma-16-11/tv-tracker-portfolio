// src/storage.js

const KEY = 'my_tv_library_v2'; 

export function getLibrary() {
    const dataString = localStorage.getItem(KEY);
    return dataString ? JSON.parse(dataString) : [];
}

export function addToLibrary(item) {
    const library = getLibrary();
    // Evitamos duplicados
    if (library.some(saved => saved.id === item.id)) return false;

    // 🔥 AQUÍ ESTABA EL PROBLEMA 🔥
    // Antes solo guardábamos 'name'. Ahora guardamos TODO lo importante.
    const newEntry = {
        id: item.id,
        name: item.name,       // Para series
        title: item.title,     // Para películas (¡ESTO FALTABA!)
        poster_path: item.poster_path,
        vote_average: item.vote_average,
        overview: item.overview,
        number_of_seasons: item.number_of_seasons,
        watchedEpisodes: [] 
    };

    library.push(newEntry);
    localStorage.setItem(KEY, JSON.stringify(library));
    return true;
}

// Marcar/Desmarcar un capítulo
export function toggleEpisode(seriesId, seasonNum, episodeNum) {
    const library = getLibrary();
    const index = library.findIndex(item => item.id == seriesId);

    if (index !== -1) {
        const serie = library[index];
        const episodeCode = `S${seasonNum}_E${episodeNum}`;

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

export function isEpisodeWatched(seriesId, seasonNum, episodeNum) {
    const library = getLibrary();
    const serie = library.find(item => item.id == seriesId);
    if (!serie) return false;
    
    const episodeCode = `S${seasonNum}_E${episodeNum}`;
    return serie.watchedEpisodes ? serie.watchedEpisodes.includes(episodeCode) : false;
}

export function isInLibrary(id) {
    const library = getLibrary();
    return library.some(item => item.id === id);
}