import { searchShow, searchMovies } from './api.js';
import { renderResults, renderLibrary } from './ui.js';
import { getLibrary } from './storage.js';

// ==========================================
// 1. INTEGRACIÓN DE PAGOS (STRIPE)
// ==========================================
const checkoutButton = document.getElementById('checkout-button');

if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        // Tu enlace de pago seguro de Stripe
        const stripeLink = 'https://buy.stripe.com/test_dRmeVe3tB1J1fqT14W9IQ00';
        
        // Detectamos la dirección actual de tu web para volver
        const currentUrl = window.location.href;
        
        // Redirigimos enviando la dirección de vuelta
        window.location.href = `${stripeLink}?redirect_url=${encodeURIComponent(currentUrl)}`;
    });
}

// ==========================================
// 2. ELEMENTOS DEL DOM
// ==========================================
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('btn-search');

// Navegación
const btnNavSearch = document.getElementById('nav-home');
const btnNavSeries = document.getElementById('btn-library');  // Botón "Mis Series"
const btnNavMovies = document.getElementById('btn-library1'); // Botón "Mis Películas"

// Secciones
const searchSection = document.getElementById('search-section');
const librarySection = document.getElementById('library-section');

// Filtros
const filtersContainer = document.getElementById('search-filters');
const btnFilterAll = document.getElementById('filter-all');
const btnFilterSeries = document.getElementById('filter-series');
const btnFilterMovies = document.getElementById('filter-movies');

// Estado (Memoria de búsqueda)
let currentSearchResults = []; 


// ==========================================
// 3. LÓGICA DE BÚSQUEDA
// ==========================================
async function handleSearch() {
    const query = searchInput.value.trim();
    if (query === "") return;
    
    showSection('search');
    
    try {
        // A. Buscamos Series y Pelis en paralelo
        const series = await searchShow(query);
        const movies = await searchMovies(query);
        
        // B. Guardamos TODO en memoria
        currentSearchResults = [...series, ...movies];

        // C. Mostramos filtros y reseteamos estado
        if (filtersContainer) filtersContainer.classList.remove('hidden');
        updateFilterActiveState('all');

        // D. Pintamos resultados
        renderResults(currentSearchResults); 
    } catch (error) {
        console.error("Error en la búsqueda:", error);
    }
}

// Eventos del Buscador
if(searchBtn) searchBtn.addEventListener('click', handleSearch);
if(searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}


// ==========================================
// 4. LÓGICA DE FILTROS
// ==========================================

// Filtro: TODO
if (btnFilterAll) {
    btnFilterAll.addEventListener('click', () => {
        updateFilterActiveState('all');
        renderResults(currentSearchResults); 
    });
}

// Filtro: SOLO SERIES
if (btnFilterSeries) {
    btnFilterSeries.addEventListener('click', () => {
        updateFilterActiveState('series');
        const onlySeries = currentSearchResults.filter(item => item.name); // Las series tienen 'name'
        renderResults(onlySeries);
    });
}

// Filtro: SOLO PELÍCULAS
if (btnFilterMovies) {
    btnFilterMovies.addEventListener('click', () => {
        updateFilterActiveState('movies');
        const onlyMovies = currentSearchResults.filter(item => item.title); // Las pelis tienen 'title'
        renderResults(onlyMovies);
    });
}

function updateFilterActiveState(type) {
    // Quitamos la clase 'active' de todos
    btnFilterAll.classList.remove('active');
    btnFilterSeries.classList.remove('active');
    btnFilterMovies.classList.remove('active');

    // Se la ponemos al que hemos clicado
    if (type === 'all') btnFilterAll.classList.add('active');
    if (type === 'series') btnFilterSeries.classList.add('active');
    if (type === 'movies') btnFilterMovies.classList.add('active');
}


// ==========================================
// 5. LÓGICA DE NAVEGACIÓN
// ==========================================

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
        // Filtramos para mostrar solo series
        renderLibrary(fullLibrary.filter(item => item.name));
    });
}

if (btnNavMovies) {
    btnNavMovies.addEventListener('click', () => {
        showSection('library');
        changeLibraryTitle("🎬 Mis Películas Guardadas");
        const fullLibrary = getLibrary();
        // Filtramos para mostrar solo películas
        renderLibrary(fullLibrary.filter(item => item.title));
    });
}

// ==========================================
// 6. FUNCIONES AUXILIARES
// ==========================================

function showSection(sectionName) {
    if (sectionName === 'search') {
        searchSection.classList.remove('hidden');
        librarySection.classList.add('hidden');
    } else if (sectionName === 'library') {
        searchSection.classList.add('hidden');
        librarySection.classList.remove('hidden');
        if(filtersContainer) filtersContainer.classList.add('hidden');
    }
}

function changeLibraryTitle(text) {
    const titleElement = document.querySelector('#library-section h2');
    if(titleElement) titleElement.innerText = text;
}