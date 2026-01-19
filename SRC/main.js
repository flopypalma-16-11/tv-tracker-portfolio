// src/main.js
import { searchShow, searchMovies } from './api.js';
import { renderResults, renderLibrary } from './ui.js';
import { getLibrary } from './storage.js';

// --- 1. ELEMENTOS DEL DOM ---
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('btn-search');

// Botones del Menú de Navegación
const btnNavSearch = document.getElementById('nav-home');
const btnNavSeries = document.getElementById('btn-library');
const btnNavMovies = document.getElementById('btn-library1');

// Secciones (Vistas)
const searchSection = document.getElementById('search-section');
const librarySection = document.getElementById('library-section');

// --- NUEVO: Elementos de los Filtros de Búsqueda ---
const filtersContainer = document.getElementById('search-filters');
const btnFilterAll = document.getElementById('filter-all');
const btnFilterSeries = document.getElementById('filter-series');
const btnFilterMovies = document.getElementById('filter-movies');

// --- NUEVO: Variable para recordar qué hemos buscado ---
let currentSearchResults = []; 


// --- 2. LÓGICA DE BÚSQUEDA ---
async function handleSearch() {
    const query = searchInput.value.trim();
    if (query === "") return;
    
    showSection('search');
    
    // A. Buscamos Series y Pelis
    const series = await searchShow(query);
    const movies = await searchMovies(query);
    
    // B. Guardamos TODO en nuestra variable de memoria
    currentSearchResults = [...series, ...movies];

    // C. Mostramos los botones de filtro (que estaban ocultos)
    if (filtersContainer) filtersContainer.classList.remove('hidden');

    // D. Reseteamos el filtro a "Todo" visualmente
    updateFilterActiveState('all');

    // E. Pintamos todo
    renderResults(currentSearchResults); 
}

// Eventos del Buscador
if(searchBtn) searchBtn.addEventListener('click', handleSearch);
if(searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}


// --- 3. LÓGICA DE LOS BOTONES DE FILTRO (¡NUEVO!) ---

// Filtro: TODO
if (btnFilterAll) {
    btnFilterAll.addEventListener('click', () => {
        updateFilterActiveState('all');
        renderResults(currentSearchResults); // Pintamos la lista completa original
    });
}

// Filtro: SOLO SERIES
if (btnFilterSeries) {
    btnFilterSeries.addEventListener('click', () => {
        updateFilterActiveState('series');
        // Filtramos: Solo lo que tenga 'name' (las series)
        const onlySeries = currentSearchResults.filter(item => item.name);
        renderResults(onlySeries);
    });
}

// Filtro: SOLO PELÍCULAS
if (btnFilterMovies) {
    btnFilterMovies.addEventListener('click', () => {
        updateFilterActiveState('movies');
        // Filtramos: Solo lo que tenga 'title' (las pelis)
        const onlyMovies = currentSearchResults.filter(item => item.title);
        renderResults(onlyMovies);
    });
}

// Función auxiliar para pintar de rojo el botón activo
function updateFilterActiveState(type) {
    // 1. Quitamos la clase 'active' a todos
    btnFilterAll.classList.remove('active');
    btnFilterSeries.classList.remove('active');
    btnFilterMovies.classList.remove('active');

    // 2. Se la ponemos al que hemos pulsado
    if (type === 'all') btnFilterAll.classList.add('active');
    if (type === 'series') btnFilterSeries.classList.add('active');
    if (type === 'movies') btnFilterMovies.classList.add('active');
}


// --- 4. LÓGICA DE NAVEGACIÓN (Menú Principal) ---

if (btnNavSearch) {
    btnNavSearch.addEventListener('click', () => {
        showSection('search');
    });
}

if (btnNavSeries) {
    btnNavSeries.addEventListener('click', () => {
        showSection('library');
        changeLibraryTitle("📺 Mis Series Guardadas");
        const fullLibrary = getLibrary();
        renderLibrary(fullLibrary.filter(item => item.name));
    });
}

if (btnNavMovies) {
    btnNavMovies.addEventListener('click', () => {
        showSection('library');
        changeLibraryTitle("🎬 Mis Películas Guardadas");
        const fullLibrary = getLibrary();
        renderLibrary(fullLibrary.filter(item => item.title));
    });
}

// --- 5. FUNCIONES AUXILIARES ---

function showSection(sectionName) {
    if (sectionName === 'search') {
        searchSection.classList.remove('hidden');
        librarySection.classList.add('hidden');
    } else if (sectionName === 'library') {
        searchSection.classList.add('hidden');
        librarySection.classList.remove('hidden');
    }
}

// Botón "Buscar" (del menú de arriba)
// Si tienes un botón en el nav para volver al buscador, añádele id="nav-search-btn" en el HTML
// O reutiliza el botón de buscar si quieres. Asumiré que quieres volver al buscador:
const navSearchBtn = document.querySelector('#btn-search'); 

// Ojo: en tu HTML original tenías id="btn-search" para el botón junto al input.
// Si tienes botones en el Header, asegúrate de tener IDs únicos.
// Vamos a asumir que el botón del header para ir a "Buscar" se llama 'nav-home' 
// y el de la lupa 'search-action'.
// Si usas el mismo botón para todo, ajusta los IDs. 


// Evento: Clic en "Mis Series"
libraryBtn.addEventListener('click', () => {
    // 1. Cambiamos la vista
    showSection('library');
    
    // 2. Leemos los datos guardados
    const myCollection = getLibrary();
    
    // 3. Pintamos la librería
    renderLibrary(myCollection);
});


// Evento: Volver al buscador (Opcional, si quieres que el título o un botón vuelva al inicio)
// document.querySelector('h1').addEventListener('click', () => showSection('search'));
// src/main.js (Añadir al final)

// Lógica para el botón "Buscador" del menú
const navHomeBtn = document.getElementById('nav-home');

if (navHomeBtn) {
    navHomeBtn.addEventListener('click', () => {
        // Reutilizamos la función que ya tenías para cambiar de vista
        showSection('search'); 
        
        // Opcional: Limpiar el buscador para empezar de cero
        document.getElementById('search-input').value = ''; 
        document.getElementById('results-grid').innerHTML = '';
    });
} else {
    console.error("⚠️ Cuidado: No encuentro el botón con id='nav-home' en el HTML");
}
