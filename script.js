// ============================================
// MOVIECONNECT - PREMIUM JAVASCRIPT
// ============================================

// --- CONFIGURATION ---
const CONFIG = {
    apiKey: 'f97a13b6f8bee2a5f1c466a054ad44bd',
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p',
    posterSize: '/w500',
    backdropSize: '/w1280',
    profileSize: '/w185',
    debounceDelay: 300,
    toastDuration: 3000
};

// --- STATE MANAGEMENT ---
const state = {
    currentPage: 1,
    totalPages: 1,
    currentSearch: '',
    currentMovieId: null,
    currentGenre: null,
    currentView: 'home',
    movies: [],
    genres: [],
    userRating: 0,
    trailerKey: null,
    autocompleteIndex: -1,
    bodyScrollPosition: 0
};

// --- DOM ELEMENTS ---
const elements = {
    navbar: document.getElementById('navbar'),
    navbarToggle: document.getElementById('navbarToggle'),
    navbarNav: document.getElementById('navbarNav'),
    homeLink: document.getElementById('homeLink'),
    trendingLink: document.getElementById('trendingLink'),
    watchlistLink: document.getElementById('watchlistLink'),
    watchlistCount: document.getElementById('watchlistCount'),
    heroSection: document.getElementById('heroSection'),
    searchInput: document.getElementById('searchInput'),
    searchAutocomplete: document.getElementById('searchAutocomplete'),
    trendingSection: document.getElementById('trendingSection'),
    trendingScroll: document.getElementById('trendingScroll'),
    genreSection: document.getElementById('genreSection'),
    genrePills: document.getElementById('genrePills'),
    moviesHeader: document.getElementById('moviesHeader'),
    moviesSectionTitle: document.getElementById('moviesSectionTitle'),
    moviesSectionSubtitle: document.getElementById('moviesSectionSubtitle'),
    filtersSection: document.getElementById('filtersSection'),
    movieGrid: document.getElementById('movieGrid'),
    defaultState: document.getElementById('defaultState'),
    pagination: document.getElementById('pagination'),
    paginationInfo: document.getElementById('paginationInfo'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    resultsCount: document.getElementById('resultsCount'),
    sortFilter: document.getElementById('sortFilter'),
    yearFilter: document.getElementById('yearFilter'),
    ratingFilter: document.getElementById('ratingFilter'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    movieModal: document.getElementById('movieModal'),
    modalBackdropImg: document.getElementById('modalBackdropImg'),
    modalPoster: document.getElementById('modalPoster'),
    modalTitle: document.getElementById('modalTitle'),
    modalRating: document.getElementById('modalRating'),
    modalYear: document.getElementById('modalYear'),
    modalRuntime: document.getElementById('modalRuntime'),
    modalGenres: document.getElementById('modalGenres'),
    modalPlot: document.getElementById('modalPlot'),
    modalCast: document.getElementById('modalCast'),
    modalDirector: document.getElementById('modalDirector'),
    modalReleaseDate: document.getElementById('modalReleaseDate'),
    modalBudget: document.getElementById('modalBudget'),
    modalRevenue: document.getElementById('modalRevenue'),
    watchlistBtn: document.getElementById('watchlistBtn'),
    trailerBtn: document.getElementById('trailerBtn'),
    similarMovies: document.getElementById('similarMovies'),
    starRating: document.getElementById('starRating'),
    userReview: document.getElementById('userReview'),
    videoModal: document.getElementById('videoModal'),
    trailerIframe: document.getElementById('trailerIframe'),
    toastContainer: document.getElementById('toastContainer'),
    miniSearchInput: document.getElementById('miniSearchInput')
};

// --- GENRE DATA ---
const genreData = [
    { id: 28, name: 'Action', icon: 'fa-explosion' },
    { id: 12, name: 'Adventure', icon: 'fa-compass' },
    { id: 16, name: 'Animation', icon: 'fa-pencil' },
    { id: 35, name: 'Comedy', icon: 'fa-face-laugh' },
    { id: 80, name: 'Crime', icon: 'fa-user-secret' },
    { id: 99, name: 'Documentary', icon: 'fa-video' },
    { id: 18, name: 'Drama', icon: 'fa-masks-theater' },
    { id: 10751, name: 'Family', icon: 'fa-users' },
    { id: 14, name: 'Fantasy', icon: 'fa-dragon' },
    { id: 36, name: 'History', icon: 'fa-landmark' },
    { id: 27, name: 'Horror', icon: 'fa-ghost' },
    { id: 10402, name: 'Music', icon: 'fa-music' },
    { id: 9648, name: 'Mystery', icon: 'fa-magnifying-glass' },
    { id: 10749, name: 'Romance', icon: 'fa-heart' },
    { id: 878, name: 'Sci-Fi', icon: 'fa-rocket' },
    { id: 53, name: 'Thriller', icon: 'fa-skull' },
    { id: 10752, name: 'War', icon: 'fa-jet-fighter' },
    { id: 37, name: 'Western', icon: 'fa-hat-cowboy' }
];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    updateWatchlistCount();
    loadTrendingMovies();
    renderGenrePills();
    populateYearFilter();
    setupEventListeners();
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    window.addEventListener('scroll', handleNavbarScroll);
    elements.navbarToggle.addEventListener('click', toggleMobileMenu);
    elements.searchInput.addEventListener('input', debounce(handleSearchInput, CONFIG.debounceDelay));
    elements.searchInput.addEventListener('keydown', handleSearchKeydown);
    elements.searchInput.addEventListener('focus', () => {
        if (elements.searchInput.value.trim().length >= 2) {
            elements.searchAutocomplete.classList.add('active');
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            elements.searchAutocomplete.classList.remove('active');
        }
    });

    elements.starRating.querySelectorAll('i').forEach(star => {
        star.addEventListener('click', () => handleStarClick(star));
        star.addEventListener('mouseover', () => handleStarHover(star));
        star.addEventListener('mouseout', updateStarDisplay);
    });

    document.addEventListener('keydown', handleKeyboardShortcuts);

    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    }, 100));

    // Mini search input - Enter key
    if (elements.miniSearchInput) {
        elements.miniSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                miniSearchMovies();
            }
        });
    }
}

// ============================================
// NAVBAR
// ============================================

function handleNavbarScroll() {
    if (window.scrollY > 50) {
        elements.navbar.classList.add('scrolled');
    } else {
        elements.navbar.classList.remove('scrolled');
    }
}

function toggleMobileMenu() {
    elements.navbarNav.classList.toggle('active');
    const icon = elements.navbarToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
}

function closeMobileMenu() {
    elements.navbarNav.classList.remove('active');
    const icon = elements.navbarToggle.querySelector('i');
    icon.classList.add('fa-bars');
    icon.classList.remove('fa-times');
}

function setActiveNavLink(linkId) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.getElementById(linkId)?.classList.add('active');
    closeMobileMenu();
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

async function handleSearchInput(e) {
    const query = elements.searchInput.value.trim();

    if (query.length < 2) {
        elements.searchAutocomplete.classList.remove('active');
        return;
    }

    try {
        const url = `${CONFIG.baseUrl}/search/movie?api_key=${CONFIG.apiKey}&query=${encodeURIComponent(query)}&page=1`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            renderAutocomplete(data.results.slice(0, 6));
        } else {
            elements.searchAutocomplete.classList.remove('active');
        }
    } catch (error) {
        console.error('Autocomplete error:', error);
    }
}

function renderAutocomplete(movies) {
    elements.searchAutocomplete.innerHTML = movies.map((movie, index) => `
        <div class="autocomplete-item ${index === state.autocompleteIndex ? 'selected' : ''}" 
             onclick="selectAutocompleteItem(${movie.id})"
             data-id="${movie.id}">
            <img src="${movie.poster_path
            ? CONFIG.imageBaseUrl + '/w92' + movie.poster_path
            : 'https://via.placeholder.com/50x75/1a1a2e/64748b?text=No+Image'}" 
                alt="${movie.title}"
                class="autocomplete-poster">
            <div class="autocomplete-info">
                <div class="autocomplete-title">${movie.title}</div>
                <div class="autocomplete-meta">
                    <span>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                    ${movie.vote_average ? `
                        <span class="autocomplete-rating">
                            <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                        </span>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');

    elements.searchAutocomplete.classList.add('active');
}

function handleSearchKeydown(e) {
    const items = elements.searchAutocomplete.querySelectorAll('.autocomplete-item');

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.autocompleteIndex = Math.min(state.autocompleteIndex + 1, items.length - 1);
        updateAutocompleteSelection(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.autocompleteIndex = Math.max(state.autocompleteIndex - 1, -1);
        updateAutocompleteSelection(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (state.autocompleteIndex >= 0 && items[state.autocompleteIndex]) {
            const movieId = items[state.autocompleteIndex].dataset.id;
            selectAutocompleteItem(parseInt(movieId));
        } else {
            searchMovies(1);
        }
    } else if (e.key === 'Escape') {
        elements.searchAutocomplete.classList.remove('active');
        state.autocompleteIndex = -1;
    }
}

function updateAutocompleteSelection(items) {
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === state.autocompleteIndex);
    });
}

function selectAutocompleteItem(movieId) {
    elements.searchAutocomplete.classList.remove('active');
    state.autocompleteIndex = -1;
    getMovieDetails(movieId);
}

function quickSearch(query) {
    elements.searchInput.value = query;
    searchMovies(1);
}

function miniSearchMovies() {
    const query = elements.miniSearchInput?.value?.trim();
    if (!query) {
        showToast('warning', 'Search Required', 'Please enter a movie name.');
        return;
    }
    elements.searchInput.value = query;
    searchMovies(1);
}

// ============================================
// MOVIE SEARCH & DISPLAY
// ============================================

async function searchMovies(page = 1) {
    const query = elements.searchInput.value.trim();

    if (!query) {
        showToast('warning', 'Search Required', 'Please enter a movie name to search.');
        return;
    }

    state.currentSearch = query;
    state.currentPage = page;
    state.currentView = 'search';
    state.currentGenre = null;

    elements.searchAutocomplete.classList.remove('active');
    setActiveNavLink('homeLink');
    showMoviesSection(`Search Results: "${query}"`, `Found movies matching your search`);
    showSkeletonLoaders();

    try {
        const url = `${CONFIG.baseUrl}/search/movie?api_key=${CONFIG.apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            state.movies = data.results;
            state.totalPages = Math.min(data.total_pages, 500);
            displayMovies(data.results, data.total_results);
            setupPagination();
        } else {
            showEmptyState('No Results Found', `We couldn't find any movies matching "${query}". Try a different search term.`, 'fa-search');
        }
    } catch (error) {
        console.error('Search error:', error);
        showErrorState(error.message);
    }
}

async function loadTrendingMovies() {
    try {
        const url = `${CONFIG.baseUrl}/trending/movie/week?api_key=${CONFIG.apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
            renderTrendingCarousel(data.results.slice(0, 10));
        }
    } catch (error) {
        console.error('Trending error:', error);
    }
}

async function showTrendingPage() {
    state.currentView = 'trending';
    state.currentGenre = null;
    state.currentPage = 1;

    setActiveNavLink('trendingLink');
    showMoviesSection('Trending Movies', 'What everyone is watching this week');
    showSkeletonLoaders();

    try {
        const url = `${CONFIG.baseUrl}/trending/movie/week?api_key=${CONFIG.apiKey}&page=${state.currentPage}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
            state.movies = data.results;
            state.totalPages = Math.min(data.total_pages, 500);
            displayMovies(data.results, data.total_results);
            setupPagination();
        }
    } catch (error) {
        console.error('Trending error:', error);
        showErrorState(error.message);
    }
}

function renderTrendingCarousel(movies) {
    elements.trendingScroll.innerHTML = movies.map((movie, index) => `
        <div class="trending-card" onclick="getMovieDetails(${movie.id})">
            <img src="${movie.backdrop_path
            ? CONFIG.imageBaseUrl + CONFIG.backdropSize + movie.backdrop_path
            : 'https://via.placeholder.com/320x180/1a1a2e/64748b?text=No+Image'}" 
                alt="${movie.title}"
                class="trending-backdrop"
                loading="lazy">
            <div class="trending-overlay">
                <div class="trending-rank">#${index + 1}</div>
                <div class="trending-play-btn">
                    <i class="fas fa-play"></i>
                </div>
                <h3 class="trending-title">${movie.title}</h3>
                <div class="trending-meta">
                    <span class="rating">
                        <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                    </span>
                    <span>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function displayMovies(movies, totalResults = null) {
    elements.defaultState.style.display = 'none';

    if (totalResults) {
        elements.resultsCount.innerHTML = `Found <strong>${totalResults.toLocaleString()}</strong> movies`;
    }

    elements.movieGrid.innerHTML = movies.map(movie => {
        const posterUrl = movie.poster_path
            ? CONFIG.imageBaseUrl + CONFIG.posterSize + movie.poster_path
            : 'https://via.placeholder.com/200x300/1a1a2e/64748b?text=No+Poster';

        const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const genreName = getGenreName(movie.genre_ids?.[0]);

        return `
            <div class="movie-card" onclick="getMovieDetails(${movie.id})" tabindex="0" role="button">
                <div class="movie-card-poster">
                    <img src="${posterUrl}" alt="${movie.title}" loading="lazy">
                    <div class="movie-card-rating">
                        <i class="fas fa-star"></i> ${rating}
                    </div>
                    <div class="movie-card-overlay">
                        <div class="movie-card-quick-actions">
                            <button class="quick-action" onclick="event.stopPropagation(); toggleQuickWatchlist(${movie.id}, '${escapeHtml(movie.title)}', '${posterUrl}', '${year}')" title="Add to Watchlist" aria-label="Add to watchlist">
                                <i class="fas ${isInWatchlist(movie.id) ? 'fa-bookmark' : 'fa-plus'}"></i>
                            </button>
                            <button class="quick-action" onclick="event.stopPropagation(); getMovieDetails(${movie.id})" title="View Details" aria-label="View details">
                                <i class="fas fa-info"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="movie-card-body">
                    <h3 class="movie-card-title">${movie.title}</h3>
                    <div class="movie-card-meta">
                        <span><i class="far fa-calendar"></i> ${year}</span>
                    </div>
                    ${genreName ? `<span class="movie-card-genre">${genreName}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function showSkeletonLoaders(count = 12) {
    elements.defaultState.style.display = 'none';
    elements.movieGrid.innerHTML = Array(count).fill('').map(() => `
        <div class="skeleton-card">
            <div class="skeleton skeleton-poster"></div>
            <div class="skeleton-body">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-meta"></div>
            </div>
        </div>
    `).join('');
}

function showEmptyState(title, message, icon = 'fa-film') {
    elements.movieGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">
                <i class="fas ${icon}"></i>
            </div>
            <h3 class="empty-state-title">${title}</h3>
            <p class="empty-state-message">${message}</p>
            <button class="btn btn-primary" onclick="goHome()">
                <i class="fas fa-home"></i> Go Home
            </button>
        </div>
    `;
    elements.pagination.style.display = 'none';
    elements.filtersSection.style.display = 'none';
}

function showErrorState(errorMessage) {
    elements.movieGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2);">
                <i class="fas fa-exclamation-triangle" style="background: linear-gradient(135deg, #ef4444, #dc2626); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
            </div>
            <h3 class="empty-state-title">Oops! Something went wrong</h3>
            <p class="empty-state-message">${errorMessage}</p>
            <button class="btn btn-primary" onclick="location.reload()">
                <i class="fas fa-redo"></i> Retry
            </button>
        </div>
    `;
    elements.pagination.style.display = 'none';
    elements.filtersSection.style.display = 'none';
}

function showMoviesSection(title, subtitle) {
    elements.heroSection.style.display = 'none';
    elements.trendingSection.style.display = 'none';
    elements.genreSection.style.display = 'none';
    elements.moviesHeader.style.display = 'flex';
    elements.filtersSection.style.display = 'grid';
    elements.moviesSectionTitle.innerHTML = `<i class="fas fa-film"></i> ${title}`;
    elements.moviesSectionSubtitle.textContent = subtitle;

    // Update mini search with current search
    if (elements.miniSearchInput && state.currentSearch) {
        elements.miniSearchInput.value = state.currentSearch;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// GENRE FUNCTIONALITY
// ============================================

function renderGenrePills() {
    elements.genrePills.innerHTML = genreData.map(genre => `
        <button class="genre-pill ${state.currentGenre === genre.id ? 'active' : ''}" 
                onclick="searchByGenre(${genre.id})"
                data-genre-id="${genre.id}">
            <i class="fas ${genre.icon}"></i>
            ${genre.name}
        </button>
    `).join('');
}

async function searchByGenre(genreId) {
    const genre = genreData.find(g => g.id === genreId);
    if (!genre) return;

    state.currentView = 'genre';
    state.currentGenre = genreId;
    state.currentPage = 1;
    state.currentSearch = '';

    setActiveNavLink('');
    showMoviesSection(genre.name + ' Movies', `Explore the best ${genre.name.toLowerCase()} films`);
    showSkeletonLoaders();

    try {
        const url = `${CONFIG.baseUrl}/discover/movie?api_key=${CONFIG.apiKey}&with_genres=${genreId}&sort_by=${elements.sortFilter.value}&page=${state.currentPage}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            state.movies = data.results;
            state.totalPages = Math.min(data.total_pages, 500);
            displayMovies(data.results, data.total_results);
            setupPagination();
        } else {
            showEmptyState('No Movies Found', `No ${genre.name} movies available at this time.`);
        }
    } catch (error) {
        console.error('Genre search error:', error);
        showErrorState(error.message);
    }
}

function getGenreName(genreId) {
    const genre = genreData.find(g => g.id === genreId);
    return genre ? genre.name : null;
}

// ============================================
// MOVIE DETAILS MODAL
// ============================================

async function getMovieDetails(movieId) {
    state.currentMovieId = movieId;

    state.bodyScrollPosition = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${state.bodyScrollPosition}px`;
    document.body.style.width = '100%';

    elements.modalBackdrop.classList.add('active');
    elements.movieModal.classList.add('active');

    try {
        const url = `${CONFIG.baseUrl}/movie/${movieId}?api_key=${CONFIG.apiKey}&append_to_response=credits,videos,similar`;
        const response = await fetch(url);
        const movie = await response.json();

        populateModal(movie);
        loadReview(movieId);
        updateWatchlistButton(movieId);
    } catch (error) {
        console.error('Movie details error:', error);
        showToast('error', 'Error', 'Failed to load movie details.');
        closeModal();
    }
}

function populateModal(movie) {
    elements.modalBackdropImg.src = movie.backdrop_path
        ? CONFIG.imageBaseUrl + CONFIG.backdropSize + movie.backdrop_path
        : 'https://via.placeholder.com/1280x720/1a1a2e/64748b?text=No+Backdrop';

    elements.modalPoster.src = movie.poster_path
        ? CONFIG.imageBaseUrl + CONFIG.posterSize + movie.poster_path
        : 'https://via.placeholder.com/200x300/1a1a2e/64748b?text=No+Poster';

    elements.modalTitle.textContent = movie.title;
    elements.modalRating.innerHTML = `<i class="fas fa-star"></i> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}`;
    elements.modalYear.textContent = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    elements.modalRuntime.textContent = movie.runtime ? formatRuntime(movie.runtime) : 'N/A';
    elements.modalPlot.textContent = movie.overview || 'No overview available.';

    elements.modalGenres.innerHTML = movie.genres?.map(genre =>
        `<span class="modal-genre-tag">${genre.name}</span>`
    ).join('') || '<span class="modal-genre-tag">N/A</span>';

    const director = movie.credits?.crew?.find(person => person.job === 'Director');
    elements.modalDirector.textContent = director ? director.name : 'N/A';

    elements.modalReleaseDate.textContent = movie.release_date
        ? new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    elements.modalBudget.textContent = movie.budget ? formatCurrency(movie.budget) : 'N/A';
    elements.modalRevenue.textContent = movie.revenue ? formatCurrency(movie.revenue) : 'N/A';

    const cast = movie.credits?.cast?.slice(0, 10) || [];
    elements.modalCast.innerHTML = cast.length > 0
        ? cast.map(actor => `
            <div class="cast-member">
                <img src="${actor.profile_path
                ? CONFIG.imageBaseUrl + CONFIG.profileSize + actor.profile_path
                : 'https://via.placeholder.com/60x60/1a1a2e/64748b?text=' + actor.name.charAt(0)}" 
                    alt="${actor.name}"
                    class="cast-avatar"
                    loading="lazy">
                <div class="cast-name">${actor.name}</div>
                <div class="cast-character">${actor.character || ''}</div>
            </div>
        `).join('')
        : '<p style="color: var(--text-muted);">No cast information available.</p>';

    const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    state.trailerKey = trailer?.key || null;
    elements.trailerBtn.style.display = state.trailerKey ? 'inline-flex' : 'none';

    const similar = movie.similar?.results?.slice(0, 8) || [];
    elements.similarMovies.innerHTML = similar.length > 0
        ? similar.map(m => `
            <div class="similar-movie-card" onclick="getMovieDetails(${m.id})">
                <img src="${m.poster_path
                ? CONFIG.imageBaseUrl + '/w185' + m.poster_path
                : 'https://via.placeholder.com/120x180/1a1a2e/64748b?text=No+Poster'}" 
                    alt="${m.title}"
                    class="similar-movie-poster"
                    loading="lazy">
                <div class="similar-movie-title">${m.title}</div>
            </div>
        `).join('')
        : '<p style="color: var(--text-muted);">No similar movies found.</p>';
}

function closeModal() {
    elements.modalBackdrop.classList.remove('active');
    elements.movieModal.classList.remove('active');

    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, state.bodyScrollPosition);

    state.currentMovieId = null;
}

function formatRuntime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatCurrency(amount) {
    if (amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
}

// ============================================
// TRAILER
// ============================================

function playTrailer() {
    if (!state.trailerKey) {
        showToast('warning', 'No Trailer', 'Trailer is not available for this movie.');
        return;
    }

    elements.trailerIframe.src = `https://www.youtube.com/embed/${state.trailerKey}?autoplay=1`;
    elements.videoModal.classList.add('active');
}

function closeVideoModal() {
    elements.videoModal.classList.remove('active');
    elements.trailerIframe.src = '';
}

// ============================================
// WATCHLIST
// ============================================

function getWatchlist() {
    return JSON.parse(localStorage.getItem('watchlist')) || [];
}

function saveWatchlist(watchlist) {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    updateWatchlistCount();
}

function isInWatchlist(movieId) {
    return getWatchlist().some(m => m.id === movieId);
}

function toggleWatchlist() {
    if (!state.currentMovieId) return;

    const watchlist = getWatchlist();
    const movieData = {
        id: state.currentMovieId,
        title: elements.modalTitle.textContent,
        poster: elements.modalPoster.src,
        year: elements.modalYear.textContent,
        rating: elements.modalRating.textContent.replace(/[^\d.]/g, '')
    };

    const index = watchlist.findIndex(m => m.id === state.currentMovieId);

    if (index === -1) {
        watchlist.push(movieData);
        showToast('success', 'Added to Watchlist', `${movieData.title} has been added to your watchlist.`);
    } else {
        watchlist.splice(index, 1);
        showToast('info', 'Removed from Watchlist', `${movieData.title} has been removed from your watchlist.`);
    }

    saveWatchlist(watchlist);
    updateWatchlistButton(state.currentMovieId);
}

function toggleQuickWatchlist(id, title, poster, year) {
    const watchlist = getWatchlist();
    const index = watchlist.findIndex(m => m.id === id);

    if (index === -1) {
        watchlist.push({ id, title, poster, year });
        showToast('success', 'Added to Watchlist', `${title} has been added to your watchlist.`);
    } else {
        watchlist.splice(index, 1);
        showToast('info', 'Removed from Watchlist', `${title} has been removed from your watchlist.`);
    }

    saveWatchlist(watchlist);

    if (state.movies.length > 0) {
        displayMovies(state.movies);
    }
}

function updateWatchlistButton(movieId) {
    const inWatchlist = isInWatchlist(movieId);
    elements.watchlistBtn.innerHTML = inWatchlist
        ? '<i class="fas fa-check"></i><span>In Watchlist</span>'
        : '<i class="fas fa-plus"></i><span>Add to Watchlist</span>';
    elements.watchlistBtn.className = inWatchlist ? 'btn btn-secondary' : 'btn btn-primary';
}

function updateWatchlistCount() {
    const count = getWatchlist().length;
    elements.watchlistCount.textContent = count;
    elements.watchlistCount.style.display = count > 0 ? 'inline' : 'none';
}

function showWatchlist() {
    state.currentView = 'watchlist';
    state.currentGenre = null;

    setActiveNavLink('watchlistLink');
    showMoviesSection('My Watchlist', 'Movies you want to watch');

    const watchlist = getWatchlist();

    if (watchlist.length === 0) {
        showEmptyState(
            'Your Watchlist is Empty',
            'Start adding movies to your watchlist by clicking the bookmark icon on any movie card.',
            'fa-bookmark'
        );
        return;
    }

    elements.filtersSection.style.display = 'none';
    elements.pagination.style.display = 'none';

    elements.movieGrid.innerHTML = watchlist.map(movie => `
        <div class="movie-card" onclick="getMovieDetails(${movie.id})" tabindex="0" role="button">
            <div class="movie-card-poster">
                <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
                ${movie.rating ? `
                    <div class="movie-card-rating">
                        <i class="fas fa-star"></i> ${movie.rating}
                    </div>
                ` : ''}
                <div class="movie-card-overlay">
                    <div class="movie-card-quick-actions">
                        <button class="quick-action" onclick="event.stopPropagation(); removeFromWatchlist(${movie.id}, '${escapeHtml(movie.title)}')" title="Remove from Watchlist" aria-label="Remove from watchlist">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="quick-action" onclick="event.stopPropagation(); getMovieDetails(${movie.id})" title="View Details" aria-label="View details">
                            <i class="fas fa-info"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="movie-card-body">
                <h3 class="movie-card-title">${movie.title}</h3>
                <div class="movie-card-meta">
                    <span><i class="far fa-calendar"></i> ${movie.year || 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function removeFromWatchlist(id, title) {
    const watchlist = getWatchlist().filter(m => m.id !== id);
    saveWatchlist(watchlist);
    showToast('info', 'Removed', `${title} has been removed from your watchlist.`);
    showWatchlist();
}

// ============================================
// REVIEWS & RATINGS
// ============================================

function handleStarClick(star) {
    state.userRating = parseInt(star.dataset.rating);
    updateStarDisplay();
}

function handleStarHover(star) {
    const rating = parseInt(star.dataset.rating);
    elements.starRating.querySelectorAll('i').forEach((s, index) => {
        s.classList.toggle('active', index < rating);
        s.classList.toggle('fas', index < rating);
        s.classList.toggle('far', index >= rating);
    });
}

function updateStarDisplay() {
    elements.starRating.querySelectorAll('i').forEach((star, index) => {
        star.classList.toggle('active', index < state.userRating);
        star.classList.toggle('fas', index < state.userRating);
        star.classList.toggle('far', index >= state.userRating);
    });
}

function saveReview() {
    if (!state.currentMovieId) return;

    const reviews = JSON.parse(localStorage.getItem('movieReviews')) || {};
    reviews[state.currentMovieId] = {
        rating: state.userRating,
        text: elements.userReview.value,
        date: new Date().toISOString()
    };

    localStorage.setItem('movieReviews', JSON.stringify(reviews));
    showToast('success', 'Review Saved', 'Your review has been saved successfully.');
}

function loadReview(movieId) {
    const reviews = JSON.parse(localStorage.getItem('movieReviews')) || {};
    const review = reviews[movieId];

    if (review) {
        state.userRating = review.rating || 0;
        elements.userReview.value = review.text || '';
    } else {
        state.userRating = 0;
        elements.userReview.value = '';
    }

    updateStarDisplay();
}

// ============================================
// PAGINATION
// ============================================

function setupPagination() {
    elements.pagination.style.display = 'flex';
    elements.paginationInfo.textContent = `Page ${state.currentPage} of ${state.totalPages}`;
    elements.prevBtn.disabled = state.currentPage <= 1;
    elements.nextBtn.disabled = state.currentPage >= state.totalPages;
}

function changePage(direction) {
    const newPage = state.currentPage + direction;

    if (newPage < 1 || newPage > state.totalPages) return;

    state.currentPage = newPage;

    if (state.currentView === 'search') {
        searchMovies(newPage);
    } else if (state.currentView === 'trending') {
        showTrendingPageWithPage(newPage);
    } else if (state.currentView === 'genre') {
        searchByGenreWithPage(state.currentGenre, newPage);
    }
}

// ============================================
// FILTERS
// ============================================

function populateYearFilter() {
    const currentYear = new Date().getFullYear();
    let options = '<option value="">All Years</option>';

    for (let year = currentYear; year >= 1900; year--) {
        options += `<option value="${year}">${year}</option>`;
    }

    elements.yearFilter.innerHTML = options;
}

function applyFilters() {
    state.currentPage = 1;

    if (state.currentView === 'genre' && state.currentGenre) {
        searchByGenreWithFilters(state.currentGenre);
    } else if (state.currentView === 'trending') {
        showTrendingPageFiltered();
    } else if (state.currentView === 'search' && state.currentSearch) {
        searchMoviesWithFilters(1);
    } else {
        showToast('info', 'No Active View', 'Please search for movies or select a genre first.');
    }
}

async function searchMoviesWithFilters(page = 1) {
    const query = state.currentSearch;
    const yearFilter = elements.yearFilter.value;
    const ratingFilter = elements.ratingFilter.value;

    state.currentPage = page;
    showSkeletonLoaders();

    try {
        let url = `${CONFIG.baseUrl}/search/movie?api_key=${CONFIG.apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
        if (yearFilter) url += `&primary_release_year=${yearFilter}`;

        const response = await fetch(url);
        const data = await response.json();

        let results = data.results || [];

        if (ratingFilter) {
            results = results.filter(m => m.vote_average >= parseFloat(ratingFilter));
        }

        if (results.length > 0) {
            state.movies = results;
            state.totalPages = Math.min(data.total_pages, 500);
            displayMovies(results, results.length);
            setupPagination();
        } else {
            showEmptyState('No Results', 'No movies match your filters. Try adjusting them.', 'fa-filter');
        }
    } catch (error) {
        console.error('Filter error:', error);
        showErrorState(error.message);
    }
}

async function searchByGenreWithFilters(genreId) {
    const genre = genreData.find(g => g.id === genreId);
    if (!genre) return;

    showSkeletonLoaders();

    const yearFilter = elements.yearFilter.value;
    const ratingFilter = elements.ratingFilter.value;
    const sortFilter = elements.sortFilter.value;

    try {
        let url = `${CONFIG.baseUrl}/discover/movie?api_key=${CONFIG.apiKey}&with_genres=${genreId}&sort_by=${sortFilter}&page=${state.currentPage}`;
        if (yearFilter) url += `&primary_release_year=${yearFilter}`;
        if (ratingFilter) url += `&vote_average.gte=${ratingFilter}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            state.movies = data.results;
            state.totalPages = Math.min(data.total_pages, 500);
            displayMovies(data.results, data.total_results);
            setupPagination();
        } else {
            showEmptyState('No Results', `No ${genre.name} movies match your filters.`, 'fa-filter');
        }
    } catch (error) {
        console.error('Filter error:', error);
        showErrorState(error.message);
    }
}

async function showTrendingPageFiltered() {
    showSkeletonLoaders();

    const yearFilter = elements.yearFilter.value;
    const ratingFilter = elements.ratingFilter.value;

    try {
        const url = `${CONFIG.baseUrl}/trending/movie/week?api_key=${CONFIG.apiKey}&page=${state.currentPage}`;
        const response = await fetch(url);
        const data = await response.json();

        let results = data.results || [];

        if (yearFilter) {
            results = results.filter(m => m.release_date && m.release_date.startsWith(yearFilter));
        }
        if (ratingFilter) {
            results = results.filter(m => m.vote_average >= parseFloat(ratingFilter));
        }

        if (results.length > 0) {
            state.movies = results;
            displayMovies(results, results.length);
            setupPagination();
        } else {
            showEmptyState('No Results', 'No trending movies match your filters.', 'fa-filter');
        }
    } catch (error) {
        console.error('Filter error:', error);
        showErrorState(error.message);
    }
}

// ============================================
// NAVIGATION
// ============================================

// Functions for pagination with page parameter
async function showTrendingPageWithPage(page) {
    state.currentPage = page;
    showSkeletonLoaders();

    try {
        const url = `${CONFIG.baseUrl}/trending/movie/week?api_key=${CONFIG.apiKey}&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
            state.movies = data.results;
            state.totalPages = Math.min(data.total_pages, 500);
            displayMovies(data.results, data.total_results);
            setupPagination();
        }
    } catch (error) {
        console.error('Trending error:', error);
        showErrorState(error.message);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function searchByGenreWithPage(genreId, page) {
    const genre = genreData.find(g => g.id === genreId);
    if (!genre) return;

    state.currentPage = page;
    showSkeletonLoaders();

    try {
        const url = `${CONFIG.baseUrl}/discover/movie?api_key=${CONFIG.apiKey}&with_genres=${genreId}&sort_by=${elements.sortFilter.value}&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            state.movies = data.results;
            state.totalPages = Math.min(data.total_pages, 500);
            displayMovies(data.results, data.total_results);
            setupPagination();
        } else {
            showEmptyState('No Movies Found', `No more ${genre.name} movies available.`);
        }
    } catch (error) {
        console.error('Genre search error:', error);
        showErrorState(error.message);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
    state.currentView = 'home';
    state.currentGenre = null;
    state.currentSearch = '';
    state.currentPage = 1;

    setActiveNavLink('homeLink');

    elements.heroSection.style.display = 'flex';
    elements.trendingSection.style.display = 'block';
    elements.genreSection.style.display = 'block';
    elements.moviesHeader.style.display = 'none';
    elements.filtersSection.style.display = 'none';
    elements.pagination.style.display = 'none';
    elements.defaultState.style.display = 'block';
    elements.movieGrid.innerHTML = '';
    elements.movieGrid.appendChild(elements.defaultState);
    elements.searchInput.value = '';

    loadTrendingMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check',
        error: 'fa-times',
        warning: 'fa-exclamation',
        info: 'fa-info'
    };

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('active'), 10);

    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.toastDuration);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, "\\'");
}

function handleKeyboardShortcuts(e) {
    if (e.key === 'Escape') {
        if (elements.videoModal.classList.contains('active')) {
            closeVideoModal();
        } else if (elements.movieModal.classList.contains('active')) {
            closeModal();
        }
    }

    if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        elements.searchInput.focus();
    }
}

// ============================================
// GLOBAL EXPORTS
// ============================================

window.searchMovies = searchMovies;
window.quickSearch = quickSearch;
window.miniSearchMovies = miniSearchMovies;
window.getMovieDetails = getMovieDetails;
window.closeModal = closeModal;
window.toggleWatchlist = toggleWatchlist;
window.toggleQuickWatchlist = toggleQuickWatchlist;
window.removeFromWatchlist = removeFromWatchlist;
window.playTrailer = playTrailer;
window.closeVideoModal = closeVideoModal;
window.saveReview = saveReview;
window.changePage = changePage;
window.goHome = goHome;
window.showWatchlist = showWatchlist;
window.showTrendingPage = showTrendingPage;
window.searchByGenre = searchByGenre;
window.applyFilters = applyFilters;
window.selectAutocompleteItem = selectAutocompleteItem;