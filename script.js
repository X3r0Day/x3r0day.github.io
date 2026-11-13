const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');

if (menuButton && navigation) {
    document.documentElement.classList.add('js-menu');
    menuButton.hidden = false;
    const setMenu = open => {
        menuButton.setAttribute('aria-expanded', String(open));
        navigation.classList.toggle('is-open', open);
        menuButton.querySelector('span').textContent = open ? '−' : '+';
    };
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    navigation.addEventListener('click', event => {
        if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
            setMenu(false);
            menuButton.focus();
        }
    });
    document.addEventListener('click', event => {
        if (!event.target.closest('.site-header')) setMenu(false);
    });
}

const searchDialog = document.querySelector('#site-search');
const searchTrigger = document.querySelector('.search-trigger');
if (searchDialog && searchTrigger && typeof searchDialog.showModal === 'function') {
    searchTrigger.hidden = false;
    const query = searchDialog.querySelector('input[type=search]');
    const results = [...searchDialog.querySelectorAll('.search-results li')];
    const status = searchDialog.querySelector('.search-status');
    const empty = searchDialog.querySelector('.search-empty');
    const updateSearch = () => {
        const term = query.value.trim().toLowerCase();
        let count = 0;
        for (const result of results) {
            result.hidden = !result.dataset.search.includes(term);
            if (!result.hidden) count++;
        }
        status.textContent = `${count} ${count === 1 ? 'result' : 'results'}`;
        empty.hidden = count !== 0;
    };
    const openSearch = () => {
        if (searchDialog.open) return;
        searchDialog.showModal();
        query.focus();
        updateSearch();
    };
    searchTrigger.addEventListener('click', openSearch);
    searchDialog.querySelector('.search-close').addEventListener('click', () => searchDialog.close());
    searchDialog.addEventListener('click', event => {
        if (event.target !== searchDialog) return;
        const box = searchDialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) searchDialog.close();
    });
    searchDialog.addEventListener('close', () => searchTrigger.focus({ preventScroll: true }));
    query.addEventListener('input', updateSearch);
    document.addEventListener('keydown', event => {
        if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input, textarea, [contenteditable="true"]')) {
            event.preventDefault();
            openSearch();
        }
    });
}

for (const tool of document.querySelectorAll('.tool')) {
    tool.addEventListener('toggle', () => {
        const indicator = tool.querySelector('.tool-toggle');
        if (indicator) indicator.textContent = tool.open ? '−' : '+';
    });
}

const controls = document.querySelector('.writing-controls');
if (controls) {
    controls.hidden = false;
    const cards = [...document.querySelectorAll('.writing-card')];
    const filters = [...controls.querySelectorAll('[data-filter]')];
    const search = controls.querySelector('input[type=search]');
    const status = document.querySelector('.filter-status');
    const empty = document.querySelector('.empty-writing');
    let topic = 'all';

    const update = () => {
        const query = search.value.trim().toLowerCase();
        let count = 0;
        for (const card of cards) {
            const matches = (topic === 'all' || card.dataset.topic === topic) && card.dataset.search.includes(query);
            const wasHidden = card.hidden;
            card.hidden = !matches;
            if (matches) {
                count++;
                if (wasHidden && !reducedMotion.matches) {
                    card.animate([{ opacity: .3, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
                }
            }
        }
        empty.hidden = count !== 0;
        status.textContent = `${count} ${count === 1 ? 'note' : 'notes'} found`;
        for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.filter === topic));
    };
    for (const filter of filters) filter.addEventListener('click', () => {
        topic = filter.dataset.filter;
        update();
    });
    search.addEventListener('input', update);
    document.querySelector('[data-reset-filters]').addEventListener('click', () => {
        topic = 'all';
        search.value = '';
        update();
        filters[0].focus();
    });
    update();
}

const watchArt = document.querySelector('[data-watch-art]');
if (watchArt) {
    document.documentElement.classList.add('js-watch');
    const scenes = [
        { piece: 'night-coast', name: 'night coast', note: 'a lighthouse turning its beam under moonlit clouds over a dark sea' },
        { piece: 'tokyo-rain', name: 'tokyo rain', note: 'a tokyo side street in the rain, neon signs shining on the wet road' },
        { piece: 'aurora-fjord', name: 'aurora fjord', note: 'aurora curtains rippling over a still fjord, a cabin lit on the shore' },
        { piece: 'misty-forest', name: 'misty forest', note: 'pine ridges fading into morning fog, sunbeams slanting through' },
        { piece: 'desert-night', name: 'desert night', note: 'the milky way over a lone acacia on moonless dunes, meteors falling' },
        { piece: 'ocean-sunset', name: 'ocean sunset', note: 'the sun sets past a pine headland, lit cloud, glitter on rolling sea' },
        { piece: 'storm-plains', name: 'storm plains', note: 'an anvil thunderhead at dusk flickering over a wheat field' },
        { piece: 'earthrise', name: 'earthrise', note: 'the earth rising over a cratered lunar horizon in long low sunlight' },
        { piece: 'kyoto-dusk', name: 'kyoto dusk', note: 'a pagoda at dusk behind a cherry tree lit by a stone lantern' },
        { piece: 'alpine-dawn', name: 'alpine dawn', note: 'snow peaks catching first light above a still, misty mountain lake' },
        { piece: 'marine-drive', name: 'marine drive', note: "mumbai's queen's necklace at night, lamps curving round the bay" },
        { piece: 'deep-reef', name: 'deep reef', note: 'light shafts, swaying kelp and a turning school of fish over a reef' }
    ];
    const watchFigure = document.querySelector('[data-watch-figure]');
    const watchShuffle = document.querySelector('[data-watch-shuffle]');
    let watchIndex = Math.floor(Math.random() * scenes.length);

    const showWatch = scene => {
        watchFigure.setAttribute('aria-label', `Animated ASCII art: ${scene.note}.`);
    };
    const playWatch = scene => watchArt.setAttribute('piece', scene.piece);

    showWatch(scenes[watchIndex]);

    if ('IntersectionObserver' in window) {
        const watchObserver = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            watchObserver.disconnect();
            playWatch(scenes[watchIndex]);
        }, { rootMargin: '900px 0px' });
        watchObserver.observe(watchArt);
    } else {
        playWatch(scenes[watchIndex]);
    }

    if (watchShuffle) {
        watchShuffle.addEventListener('click', () => {
            watchIndex = (watchIndex + 1 + Math.floor(Math.random() * (scenes.length - 1))) % scenes.length;
            showWatch(scenes[watchIndex]);
            playWatch(scenes[watchIndex]);
        });
    }
}
