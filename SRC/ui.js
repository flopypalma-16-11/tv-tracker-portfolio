// src/ui.js
import { getTVDetails, getSeasonDetails } from './api.js';
import { addToLibrary, isInLibrary, toggleEpisode, isEpisodeWatched, getLibrary } from './storage.js';

// --- ARREGLO DE IMÁGENES: Definimos la URL aquí también por seguridad ---
// Si por lo que sea no la importa bien de config.js, usará esta de reserva:
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// --- ELEMENTOS GLOBALES DEL MODAL ---
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.getElementById('close-modal');

// Cerrar modal con botón X
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        refreshLibraryView();
    });
}

// Cerrar modal con clic fuera
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
            refreshLibraryView();
        }
    });
}

function refreshLibraryView() {
    const libraryGrid = document.getElementById('library-grid');
    const librarySection = document.getElementById('library-section');
    
    // Solo refrescamos si la sección de librería existe y es visible
    if (libraryGrid && librarySection && !librarySection.classList.contains('hidden')) {
        const titleElement = document.querySelector('#library-section h2');
        // Si no encuentra el título, asumimos que estamos en vista general
        const titleText = titleElement ? titleElement.innerText : '';
        const fullLibrary = getLibrary();
        
        if (titleText.includes('Películas')) {
            renderLibrary(fullLibrary.filter(i => i.title));
        } else {
            // Por defecto series
            renderLibrary(fullLibrary.filter(i => i.name));
        }
    }
}

// --- 1. RENDERIZAR RESULTADOS DE BÚSQUEDA ---
export function renderResults(seriesList) {
    const grid = document.getElementById('results-grid');
    grid.innerHTML = '';

    if (!list || list.length === 0) {
        grid.innerHTML = '<p>No se encontraron resultados.</p>';
        return;
    }

    list.forEach(item => {
        // Detectamos si es Peli o Serie
        const isMovie = !!item.title;
        const displayTitle = item.name || item.title || "Sin título";
        
        // Usamos la variable segura IMG_URL
        const imagePath = item.poster_path 
            ? `${IMG_URL}${item.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Image';

        const card = document.createElement('div');
        card.classList.add('tv-card');
        card.dataset.id = item.id; 

        card.innerHTML = `
            <div class="card-image-container">
                <img src="${imagePath}" alt="${displayTitle}">
            </div>
            <div class="card-info">
                <h3>${displayTitle}</h3>
                <span style="font-size: 0.8em; color: #ccc;">${isMovie ? '🎬 Película' : '📺 Serie'}</span>
            </div>
        `;

        card.addEventListener('click', async () => {
            modalBody.innerHTML = '<p>Cargando detalles...</p>';
            modalOverlay.classList.remove('hidden');
            
            let dataToShow = item;

            // Solo pedimos detalles extra si es SERIE
            if (!isMovie) {
                const details = await getTVDetails(item.id);
                if (details) dataToShow = details;
            }
            
            renderModalContent(dataToShow); 
        });

        grid.appendChild(card);
    });
}

// --- FUNCION DEL MODAL (AQUÍ ESTÁ EL ARREGLO DE TEXTO) ---
function renderModalContent(item) {
    const imagePath = item.poster_path 
        ? `${IMG_URL}${item.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=No+Image';

    const isMovie = !!item.title; 
    const displayTitle = item.name || item.title || "Sin título";
    const tipoContenido = isMovie ? "Mis Películas" : "Mis Series";

    // --- 🔥 CORRECCIÓN DE TEXTO ---
    // Creamos el HTML de la información dependiendo de si es peli o serie
    let infoHtml = '';
    
    if (isMovie) {
        // Si es película, NO ponemos "Temporadas"
        infoHtml = `<p>🎬 <strong>Película</strong></p>`; 
    } else {
        // Si es serie, ponemos el número de temporadas
        const seasons = item.number_of_seasons || '?';
        infoHtml = `<p>📚 Temporadas: <strong>${seasons}</strong></p>`;
    }

    const isSaved = isInLibrary(item.id);
    const buttonText = isSaved ? `✅ Ya en ${tipoContenido}` : `Agregar a ${tipoContenido}`;
    const buttonStyle = isSaved ? 'background: #444; cursor: default;' : 'background: #e50914; cursor: pointer;';
    const buttonDisabled = isSaved ? 'disabled' : '';

    modalBody.innerHTML = `
        <div style="text-align: center;">
            <img src="${imagePath}" style="max-width: 200px; border-radius: 8px;">
            <h2>${displayTitle}</h2>
            <p>⭐ ${item.vote_average ? item.vote_average.toFixed(1) : '?'} / 10</p>
            
            ${infoHtml}
            
            <p style="text-align: left; margin-top: 15px;">${item.overview || 'Sin descripción disponible.'}</p>
            
            <button id="btn-add-library" ${buttonDisabled} style="margin-top: 20px; padding: 10px 20px; color: white; border: none; border-radius: 5px; ${buttonStyle}">
                ${buttonText}
            </button>
        </div>
    `;

    if (!isSaved) {
        const addBtn = document.getElementById('btn-add-library');
        if(addBtn){
            addBtn.addEventListener('click', () => {
                const success = addToLibrary(item);
                if (success) {
                    addBtn.textContent = '✅ Agregada'; 
                    addBtn.style.background = '#444';
                    addBtn.disabled = true;
                    alert(`¡${displayTitle} añadida a ${tipoContenido}!`);
                }
            });
        }
    }
}

// --- 2. RENDERIZAR MI LIBRERÍA (CORREGIDO) ---
export function renderLibrary(seriesList) {
    const grid = document.getElementById('library-grid');
    grid.innerHTML = '';

    if (!list || list.length === 0) {
        grid.innerHTML = '<p>No hay nada guardado aquí.</p>';
        return;
    }

    list.forEach(item => {
        const isMovie = !!item.title;
        const displayTitle = item.name || item.title || "Sin título";
        
        const imagePath = item.poster_path 
            ? `${IMG_URL}${item.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Image';

        const card = document.createElement('div');
        card.classList.add('tv-card');
        
        // Si es peli, ocultamos cosas de series
        const watchedInfo = isMovie ? '' : `<p>${item.watchedEpisodes ? item.watchedEpisodes.length : 0} caps. vistos</p>`;
        const btnDisplay = isMovie ? 'display: none;' : ''; 

        card.innerHTML = `
            <div class="card-image-container">
                <img src="${imagePath}" alt="${displayTitle}">
            </div>
            <div class="card-info">
                <h3>${displayTitle}</h3>
                ${watchedInfo}
                <button class="btn-manage" style="width:100%; margin-top:10px; padding:8px; background:#333; color:white; border:1px solid #555; cursor:pointer; ${btnDisplay}">
                    📂 Ver Temporadas
                </button>
            </div>
        `;

        grid.appendChild(card);

        if (!isMovie) {
            const btnManage = card.querySelector('.btn-manage');
            btnManage.addEventListener('click', () => {
                if(item.number_of_seasons) {
                    openSeasonModal(item.id, displayTitle, item.number_of_seasons);
                }
            });
        }
    });
}
// --- PEGAR ESTO AL FINAL DE src/ui.js ---

// --- 3. MODAL DE TEMPORADAS (CORREGIDO) ---
async function openSeasonModal(serieId, serieName, totalSeasons) {
    const modalBody = document.getElementById('modal-body');
    const modalOverlay = document.getElementById('modal-overlay');

    modalBody.innerHTML = `<h2>${serieName}</h2><p>Cargando temporadas...</p>`;
    modalOverlay.classList.remove('hidden');

    let htmlContent = `<h2>${serieName}</h2><div class="seasons-container">`;

    // Recorremos todas las temporadas (desde la 1 hasta la última)
    for (let i = 1; i <= totalSeasons; i++) {
        const episodes = await getSeasonDetails(serieId, i);
        
        // Creamos la carpeta (details/summary)
        htmlContent += `
            <details class="season-folder">
                <summary>Temporada ${i} (${episodes ? episodes.length : 0} caps)</summary>
                <div class="episode-list">
        `;

        // Si hay capítulos, los pintamos
        if(episodes && episodes.length > 0) {
            episodes.forEach(ep => {
                // Comprobamos si ya está visto
                const isChecked = isEpisodeWatched(serieId, i, ep.episode_number) ? 'checked' : '';
                
                htmlContent += `
                    <div class="episode-item">
                        <label>
                            <input type="checkbox" class="ep-check" 
                                data-serie="${serieId}" 
                                data-season="${i}" 
                                data-ep="${ep.episode_number}" 
                                ${isChecked}>
                            <span style="margin-left:10px; color:#ccc;">${ep.episode_number}x${i} - ${ep.name}</span>
                        </label>
                    </div>
                `;
            });
        } else {
            htmlContent += `<p style="padding:10px">No hay info de capítulos.</p>`;
        }

        htmlContent += `</div></details>`; 
    }

    htmlContent += `</div>`;
    modalBody.innerHTML = htmlContent;

    // Asignamos eventos a los checkboxes para que guarden el progreso
    const checks = modalBody.querySelectorAll('.ep-check');
    checks.forEach(check => {
        check.addEventListener('change', (e) => {
            const sId = e.target.dataset.serie;
            const season = e.target.dataset.season;
            const ep = e.target.dataset.ep;
            toggleEpisode(sId, season, ep);
        });
    });
}
