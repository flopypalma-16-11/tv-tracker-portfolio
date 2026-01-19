// src/ui.js
import { getTVDetails, getSeasonDetails } from './api.js';
import { addToLibrary, isInLibrary, toggleEpisode, isEpisodeWatched, getLibrary } from './storage.js';

const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// --- ELEMENTOS GLOBALES DEL MODAL ---
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.getElementById('close-modal');

// Cerrar modal
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        refreshLibraryView();
    });
}

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
    
    if (libraryGrid && librarySection && !librarySection.classList.contains('hidden')) {
        const titleElement = document.querySelector('#library-section h2');
        const titleText = titleElement ? titleElement.innerText : '';
        const fullLibrary = getLibrary();
        
        if (titleText.includes('Películas')) {
            renderLibrary(fullLibrary.filter(i => i.title));
        } else {
            renderLibrary(fullLibrary.filter(i => i.name));
        }
    }
}

// --- RENDERIZAR RESULTADOS ---
export function renderResults(list) {
    const grid = document.getElementById('results-grid');
    grid.innerHTML = '';

    if (!list || list.length === 0) {
        grid.innerHTML = '<p>No se encontraron resultados.</p>';
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
            if (!isMovie) {
                const details = await getTVDetails(item.id);
                if (details) dataToShow = details;
            }
            renderModalContent(dataToShow); 
        });

        grid.appendChild(card);
    });
}

// --- MODAL DE DETALLES ---
function renderModalContent(item) {
    const imagePath = item.poster_path 
        ? `${IMG_URL}${item.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=No+Image';

    const isMovie = !!item.title; 
    const displayTitle = item.name || item.title || "Sin título";
    const tipoContenido = isMovie ? "Mis Películas" : "Mis Series";

    let infoHtml = isMovie ? `<p>🎬 <strong>Película</strong></p>` : `<p>📚 Temporadas: <strong>${item.number_of_seasons || '?'}</strong></p>`;

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

// --- RENDERIZAR LIBRERÍA ---
export function renderLibrary(list) {
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

// --- MODAL DE TEMPORADAS ---
async function openSeasonModal(serieId, serieName, totalSeasons) {
    modalBody.innerHTML = `<h2>${serieName}</h2><p>Cargando temporadas...</p>`;
    modalOverlay.classList.remove('hidden');

    let htmlContent = `<h2>${serieName}</h2><div class="seasons-container">`;

    for (let i = 1; i <= totalSeasons; i++) {
        const episodes = await getSeasonDetails(serieId, i);
        
        htmlContent += `
            <details class="season-folder">
                <summary>Temporada ${i} (${episodes ? episodes.length : 0} caps)</summary>
                <div class="episode-list">
        `;

        if(episodes && episodes.length > 0) {
            episodes.forEach(ep => {
                const isChecked = isEpisodeWatched(serieId, i, ep.episode_number) ? 'checked' : '';
                htmlContent += `
                    <div class="episode-item">
                        <label>
                            <input type="checkbox" class="ep-check" data-serie="${serieId}" data-season="${i}" data-ep="${ep.episode_number}" ${isChecked}>
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

    const checks = modalBody.querySelectorAll('.ep-check');
    checks.forEach(check => {
        check.addEventListener('change', (e) => {
            toggleEpisode(e.target.dataset.serie, e.target.dataset.season, e.target.dataset.ep);
        });
    });
}
