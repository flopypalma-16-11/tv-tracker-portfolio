// src/api.js
import { API_KEY, API_BASE_URL } from './config.js';

// Función para buscar series
export async function searchShow(query) {
    // Construimos la URL con la query y el idioma español
    const url = `${API_BASE_URL}/search/tv?api_key=${API_KEY}&language=es-ES&query=${query}`;
    
    try {
        const response = await fetch(url);
        
        // Si la respuesta no es OK (ej: error 404 o 500), lanzamos error
        if (!response.ok) {
            throw new Error('Error en la petición a TMDB');
        }

        const data = await response.json();
        return data.results; // Devolvemos solo el array de resultados

    } catch (error) {
        console.error("Ups, algo falló buscando la serie:", error);
        return []; // Devolvemos array vacío para que la app no rompa
    }}
    // src/api.js

// ... tu función searchShow existente ...

export async function searchMovies(query) {
    const url = `${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=es-ES`;
    try {
        // Fíjate que cambiamos 'tv' por 'movie' en la URL 👇
        
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error buscando películas:", error);
        return [];
    }
}

// src/api.js (Añade esto al final)

export async function getTVDetails(id) {
    // Endpoint: /tv/{series_id}
    const url = `${API_BASE_URL}/tv/${id}?api_key=${API_KEY}&language=es-ES`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener detalles');
        const data = await response.json();
        return data; // Esto devuelve el objeto completo con temporadas, episodios, etc.
    } catch (error) {
        console.error("Error obteniendo detalles:", error);
        return null;
    }
}


// Obtengo todos los capítulos de una temporada específica
export async function getSeasonDetails(seriesId, seasonNumber) {
    // Endpoint: /tv/{id}/season/{season_number}
    const url = `${API_BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}&language=es-ES`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error obteniendo temporada');
        const data = await response.json();
        return data.episodes; // Devolvemos el array de episodios
    } catch (error) {
        console.error(error);
        return [];
    }
}
