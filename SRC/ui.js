// src/ui.js
import { IMAGE_BASE_URL } from './config.js';
import { getTVDetails, getSeasonDetails } from './api.js';
import { addToLibrary, isInLibrary, toggleEpisode, isEpisodeWatched, getLibrary } from './storage.js';

// --- ELEMENTOS GLOBALES DEL MODAL ---
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.getElementById('close-modal');

// Cerrar modal con botón X
closeBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
    // 🔥 LÓGICA NUEVA: Refrescar la vista
    // 1. Leemos los datos nuevos (con los capítulos que acabas de marcar)
    const updatedList = getLibrary();
    // 2. Volvemos a pintar la librería SOLO si estamos viéndola
    // (Un pequeño truco: miramos si el grid de librería es visible o tiene contenido)
    const libraryGrid = document.getElementById('library-grid');
    if (libraryGrid && libraryGrid.offsetParent !== null) {
        renderLibrary(updatedList);
    }

});

// Cerrar modal con clic fuera
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.add('hidden');
        // 🔥 LÓGICA NUEVA (Repetimos lo de arriba)
        const updatedList = getLibrary();
        const libraryGrid = document.getElementById('library-grid');
        if (libraryGrid && libraryGrid.offsetParent !== null) {
            renderLibrary(updatedList);
        }
    }
    }
);


export function renderResults(seriesList) {
    const grid = document.getElementById('results-grid');
    grid.innerHTML = '';

    if (seriesList.length === 0) {
        grid.innerHTML = '<p>No se encontraron series.</p>';
        return;
    }

    seriesList.forEach(serie => {
        const imagePath = serie.poster_path 
            ? `${IMAGE_BASE_URL}${serie.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Image';

        const card = document.createElement('div');
        card.classList.add('tv-card');
        card.dataset.id = serie.id; 

        card.innerHTML = `
            <div class="card-image-container">
                <img src="${imagePath}" alt="${serie.name}">
            </div>
            <div class="card-info">
                <h3>${serie.name}</h3>
            </div>
        `;

        // Evento click para ver detalles
        card.addEventListener('click', async () => {
            modalBody.innerHTML = '<p>Cargando detalles...</p>';
            modalOverlay.classList.remove('hidden');
            const details = await getTVDetails(serie.id);
            if (details) renderModalContent(details);
        });

        grid.appendChild(card);
    });
}

// Función auxiliar para el modal de detalles
function renderModalContent(serie) {
    const imagePath = serie.poster_path 
        ? `${IMAGE_BASE_URL}${serie.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=No+Image';

    const isSaved = isInLibrary(serie.id);
    const buttonText = isSaved ? '✅ Ya en Mis Series' : 'Agregar a Mis Series';
    const buttonStyle = isSaved ? 'background: #444; cursor: default;' : 'background: #e50914; cursor: pointer;';
    const buttonDisabled = isSaved ? 'disabled' : '';

    modalBody.innerHTML = `
        <div style="text-align: center;">
            <img src="${imagePath}" style="max-width: 200px; border-radius: 8px;">
            <h2>${serie.name}</h2>
            <p>⭐ ${serie.vote_average.toFixed(1)} / 10</p>
            <p>📚 Temporadas: <strong>${serie.number_of_seasons}</strong></p>
            <p style="text-align: left; margin-top: 15px;">${serie.overview || 'Sin descripción disponible.'}</p>
            
            <button id="btn-add-library" ${buttonDisabled} style="margin-top: 20px; padding: 10px 20px; color: white; border: none; border-radius: 5px; ${buttonStyle}">
                ${buttonText}
            </button>
        </div>
    `;

    if (!isSaved) {
        const addBtn = document.getElementById('btn-add-library');
        addBtn.addEventListener('click', () => {
            const success = addToLibrary(serie);
            if (success) {
                addBtn.textContent = '✅ Agregada';
                addBtn.style.background = '#444';
                addBtn.disabled = true;
                alert(`¡${serie.name} añadida a tu colección!`);
            }
        });
    }
}


export function renderLibrary(seriesList) {
    const grid = document.getElementById('library-grid');
    grid.innerHTML = '';

    if (seriesList.length === 0) {
        grid.innerHTML = '<p>Aún no has guardado ninguna serie.</p>';
        return;
    }

    seriesList.forEach(serie => {
        const imagePath = serie.poster_path 
            ? `${IMAGE_BASE_URL}${serie.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Image';

        const card = document.createElement('div');
        card.classList.add('tv-card');
        
        card.innerHTML = `
            <div class="card-image-container">
                <img src="${imagePath}" alt="${serie.name}">
            </div>
            <div class="card-info">
                <h3>${serie.name}</h3>
                <p>${serie.watchedEpisodes.length} caps. vistos</p>
                <button class="btn-manage" style="width:100%; margin-top:10px; padding:8px; background:#333; color:white; border:1px solid #555; cursor:pointer;">
                    📂 Ver Temporadas
                </button>
            </div>
        `;

        grid.appendChild(card);

        // 🔥 AQUÍ ESTÁ EL FIX: Asignamos el evento DIRECTAMENTE al botón de esta carta
        const btnManage = card.querySelector('.btn-manage');
        btnManage.addEventListener('click', () => {
            console.log("Abriendo temporadas de:", serie.name);
            openSeasonModal(serie.id, serie.name, serie.number_of_seasons);
        });
    });
}

async function openSeasonModal(serieId, serieName, totalSeasons) {
    modalBody.innerHTML = `<h2>${serieName}</h2><p>Cargando temporadas...</p>`;
    modalOverlay.classList.remove('hidden');

    let htmlContent = `<h2>${serieName}</h2><div class="seasons-container">`;

    for (let i = 1; i <= totalSeasons; i++) {
        // Obtenemos los capítulos
        const episodes = await getSeasonDetails(serieId, i);
        
        // Creamos la carpeta
        htmlContent += `
            <details class="season-folder">
                <summary>Temporada ${i} (${episodes.length} caps)</summary>
                <div class="episode-list">
        `;

        // Renderizamos capítulos
        if(episodes && episodes.length > 0) {
            episodes.forEach(ep => {
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

    // Asignar eventos a los checkboxes recién creados
    const checks = modalBody.querySelectorAll('.ep-check');
    checks.forEach(check => {
        check.addEventListener('change', (e) => {
            const sId = e.target.dataset.serie;
            const season = e.target.dataset.season;
            const ep = e.target.dataset.ep;
            
            toggleEpisode(sId, season, ep);
            // Opcional: Podrías repintar la librería de fondo para actualizar el contador
        });
    });
}
