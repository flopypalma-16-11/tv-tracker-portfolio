// src/main.js
import { searchShow } from './api.js';
import { renderResults, renderLibrary } from './ui.js'; // <--- Importamos renderLibrary
import { getLibrary } from './storage.js'; // <--- Importamos getLibrary

// Elementos del DOM
const searchBtn = document.getElementById('btn-search');
const searchInput = document.getElementById('search-input');
const libraryBtn = document.getElementById('btn-library'); // El botón "Mis Series"

// Secciones (Vistas)
const searchSection = document.getElementById('search-section');
const librarySection = document.getElementById('library-section');

// --- LÓGICA DE BÚSQUEDA ---
async function handleSearch() {
    const query = searchInput.value.trim();
    if (query === "") return;
    
    // Al buscar, nos aseguramos de estar en la vista de búsqueda
    showSection('search');
    
    const series = await searchShow(query);
    renderResults(series);
}

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});


// --- LÓGICA DE NAVEGACIÓN (TABS) ---

// Función auxiliar para cambiar de vista
function showSection(sectionName) {
    if (sectionName === 'search') {
        searchSection.classList.remove('hidden');
        librarySection.classList.add('hidden');
    } else if (sectionName === 'library') {
        searchSection.classList.add('hidden');
        librarySection.classList.remove('hidden');
    }
}


const navSearchBtn = document.querySelector('#btn-search'); 



// Evento: Clic en "Mis Series"
libraryBtn.addEventListener('click', () => {
    // 1. Cambiamos la vista
    showSection('library');
    
    // 2. Leemos los datos guardados
    const myCollection = getLibrary();
    
    // 3. Pintamos la librería
    renderLibrary(myCollection);
});




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
