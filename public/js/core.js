function formatFullDate(ms) {
    if (!ms || isNaN(ms) || ms <= 0) return 'Hidden';

    const date = new Date(parseInt(ms));
    if (isNaN(date.getTime())) return 'Hidden';

    const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const timePart = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return `${datePart} ${timePart}`;
}

const API_BASE_URL = (() => {
    const host = String(window.location.hostname || '').toLowerCase();
    const port = String(window.location.port || '');
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';

    if (isLocalhost && port && port !== '3000') {
        return 'http://localhost:3000';
    }

    return '';
})();

function buildApiUrl(path) {
    return `${API_BASE_URL}${path}`;
}

async function fetchApiJson(path, fallbackError) {
    const response = await fetch(buildApiUrl(path));
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();

    if (!contentType.includes('application/json')) {
        const text = await response.text();
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            throw new Error('API unavailable. Open the site through http://localhost:3000 or keep the backend on port 3000.');
        }
        throw new Error(fallbackError || 'Unexpected server response');
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error || fallbackError || 'Request failed');
    }

    return data;
}

const THEME_STORAGE_KEY = 'clev3r-theme';
const RECENT_PLAYER_SEARCHES_KEY = 'clev3r-recent-player-searches';
const RECENT_GUILD_SEARCHES_KEY = 'clev3r-recent-guild-searches';
const MAX_RECENT_PLAYER_SEARCHES = 10;
const MAX_RECENT_GUILD_SEARCHES = 10;

function applyTheme(themeName) {
    const safeTheme = themeName === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', safeTheme);

    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        const iconClass = safeTheme === 'dark' ? 'fa-moon' : 'fa-sun';
        const title = safeTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
        toggleBtn.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
        toggleBtn.setAttribute('title', title);
        toggleBtn.setAttribute('aria-label', title);
    }
}

function getInitialTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

function initTheme() {
    applyTheme(getInitialTheme());
}

function setFooterYear() {
    const footerYear = document.getElementById('footerYear');
    if (!footerYear) return;
    footerYear.textContent = String(new Date().getFullYear());
}

function getRecentPlayerSearches() {
    try {
        const raw = localStorage.getItem(RECENT_PLAYER_SEARCHES_KEY);
        const parsed = JSON.parse(raw || '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map(item => String(item || '').trim())
            .filter(Boolean)
            .slice(0, MAX_RECENT_PLAYER_SEARCHES);
    } catch {
        return [];
    }
}

function saveRecentPlayerSearches(list) {
    localStorage.setItem(RECENT_PLAYER_SEARCHES_KEY, JSON.stringify(list.slice(0, MAX_RECENT_PLAYER_SEARCHES)));
}

function addRecentPlayerSearch(username) {
    const cleanName = String(username || '').trim();
    if (!cleanName) return;

    const current = getRecentPlayerSearches();
    const deduped = current.filter(item => item.toLowerCase() !== cleanName.toLowerCase());
    const next = [cleanName, ...deduped].slice(0, MAX_RECENT_PLAYER_SEARCHES);
    saveRecentPlayerSearches(next);
    renderRecentPlayerSearches();
}

function removeRecentPlayerSearch(username) {
    const cleanName = String(username || '').trim();
    if (!cleanName) return;

    const current = getRecentPlayerSearches();
    const next = current.filter(item => item.toLowerCase() !== cleanName.toLowerCase());
    saveRecentPlayerSearches(next);
    renderRecentPlayerSearches();
}

function renderRecentPlayerSearches() {
    const wrap = document.getElementById('recentSearches');
    const list = document.getElementById('recentSearchesList');
    if (!wrap || !list) return;

    const recent = getRecentPlayerSearches();
    list.innerHTML = '';

    if (recent.length === 0) {
        wrap.classList.add('hidden');
        return;
    }

    for (const name of recent) {
        const chip = document.createElement('div');
        chip.className = 'recent-search-chip';

        const openButton = document.createElement('span');
        openButton.className = 'recent-search-chip-label';
        openButton.textContent = name;
        openButton.title = `Search ${name}`;
        openButton.setAttribute('role', 'button');
        openButton.setAttribute('tabindex', '0');
        openButton.addEventListener('click', () => {
            const usernameInput = document.getElementById('usernameInput');
            if (usernameInput) usernameInput.value = name;
            getStats();
        });
        openButton.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const usernameInput = document.getElementById('usernameInput');
                if (usernameInput) usernameInput.value = name;
                getStats();
            }
        });

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'recent-search-chip-remove';
        removeButton.innerText = '×';
        removeButton.setAttribute('aria-label', `Remove ${name} from recent searches`);
        removeButton.title = `Remove ${name}`;
        removeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            removeRecentPlayerSearch(name);
        });

        chip.appendChild(openButton);
        chip.appendChild(removeButton);
        list.appendChild(chip);
    }

    wrap.classList.remove('hidden');
}

function getRecentGuildSearches() {
    try {
        const raw = localStorage.getItem(RECENT_GUILD_SEARCHES_KEY);
        const parsed = JSON.parse(raw || '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map(item => String(item || '').trim())
            .filter(Boolean)
            .slice(0, MAX_RECENT_GUILD_SEARCHES);
    } catch {
        return [];
    }
}

function saveRecentGuildSearches(list) {
    localStorage.setItem(RECENT_GUILD_SEARCHES_KEY, JSON.stringify(list.slice(0, MAX_RECENT_GUILD_SEARCHES)));
}

function addRecentGuildSearch(guildName) {
    const cleanName = String(guildName || '').trim();
    if (!cleanName) return;

    const current = getRecentGuildSearches();
    const deduped = current.filter(item => item.toLowerCase() !== cleanName.toLowerCase());
    const next = [cleanName, ...deduped].slice(0, MAX_RECENT_GUILD_SEARCHES);
    saveRecentGuildSearches(next);
    renderRecentGuildSearches();
}

function removeRecentGuildSearch(guildName) {
    const cleanName = String(guildName || '').trim();
    if (!cleanName) return;

    const current = getRecentGuildSearches();
    const next = current.filter(item => item.toLowerCase() !== cleanName.toLowerCase());
    saveRecentGuildSearches(next);
    renderRecentGuildSearches();
}

function renderRecentGuildSearches() {
    const wrap = document.getElementById('guildRecentSearches');
    const list = document.getElementById('guildRecentSearchesList');
    if (!wrap || !list) return;

    const recent = getRecentGuildSearches();
    list.innerHTML = '';

    if (recent.length === 0) {
        wrap.classList.add('hidden');
        return;
    }

    for (const name of recent) {
        const chip = document.createElement('div');
        chip.className = 'recent-search-chip';

        const openButton = document.createElement('span');
        openButton.className = 'recent-search-chip-label';
        openButton.textContent = name;
        openButton.title = `Search guild ${name}`;
        openButton.setAttribute('role', 'button');
        openButton.setAttribute('tabindex', '0');
        openButton.addEventListener('click', () => {
            const guildInput = document.getElementById('guildInput');
            if (guildInput) guildInput.value = name;
            getGuildStats();
        });
        openButton.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const guildInput = document.getElementById('guildInput');
                if (guildInput) guildInput.value = name;
                getGuildStats();
            }
        });

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'recent-search-chip-remove';
        removeButton.innerText = '×';
        removeButton.setAttribute('aria-label', `Remove ${name} from recent guild searches`);
        removeButton.title = `Remove ${name}`;
        removeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            removeRecentGuildSearch(name);
        });

        chip.appendChild(openButton);
        chip.appendChild(removeButton);
        list.appendChild(chip);
    }

    wrap.classList.remove('hidden');
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
}

async function copyContact(value, buttonEl) {
    const safeValue = String(value || '').trim();
    if (!safeValue) return;

    let copied = false;

    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(safeValue);
            copied = true;
        } catch (error) {
            copied = false;
        }
    }

    if (!copied) {
        const tempInput = document.createElement('textarea');
        tempInput.value = safeValue;
        tempInput.setAttribute('readonly', 'readonly');
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.select();
        tempInput.setSelectionRange(0, safeValue.length);
        copied = document.execCommand('copy');
        document.body.removeChild(tempInput);
    }

    if (!buttonEl) return;

    const originalText = buttonEl.innerText;
    buttonEl.innerText = copied ? 'Copied!' : 'Failed';
    buttonEl.classList.toggle('copied', copied);

    window.setTimeout(() => {
        buttonEl.innerText = originalText;
        buttonEl.classList.remove('copied');
    }, 1200);
}

function formatTime(seconds) {
    if (!seconds) return '0';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}, ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatHms(seconds) {
    const safe = Number(seconds) || 0;
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = Math.floor(safe % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getNumberFromStatKeys(source, keys) {
    if (!source || typeof source !== 'object' || !Array.isArray(keys)) return undefined;

    for (const targetKey of keys) {
        const lookup = String(targetKey || '').toLowerCase();
        if (!lookup) continue;

        for (const [statKey, statValue] of Object.entries(source)) {
            if (String(statKey).toLowerCase() !== lookup) continue;
            const parsed = Number(statValue);
            if (Number.isFinite(parsed)) return parsed;
        }
    }

    return undefined;
}

function getUhcModeStat(source, mode, field, allowDerived = true) {
    const modeAliases = mode === 'teams' ? ['teams', 'team'] : ['solo'];
    const fieldAliases = field === 'deaths' ? ['deaths', 'death'] : [field];

    const exactCandidates = [];
    for (const modeAlias of modeAliases) {
        for (const fieldAlias of fieldAliases) {
            exactCandidates.push(
                `${modeAlias}_${fieldAlias}`,
                `${fieldAlias}_${modeAlias}`,
                `${modeAlias}${fieldAlias}`,
                `${fieldAlias}${modeAlias}`
            );
        }
    }

    const exactValue = getNumberFromStatKeys(source, exactCandidates);
    if (Number.isFinite(exactValue)) return exactValue;

    if (mode === 'teams' && allowDerived) {
        const baseValue = getNumberFromStatKeys(source, fieldAliases);
        if (Number.isFinite(baseValue)) {
            return baseValue;
        }

        const overallCandidates = [];
        for (const fieldAlias of fieldAliases) {
            overallCandidates.push(
                `${fieldAlias}_overall`,
                `overall_${fieldAlias}`,
                `total_${fieldAlias}`,
                `${fieldAlias}_total`,
                `uhc_${fieldAlias}`
            );
        }

        const overall = getNumberFromStatKeys(source, overallCandidates);
        const solo = getUhcModeStat(source, 'solo', field, false) || 0;
        if (Number.isFinite(overall) && overall >= solo) {
            return overall - solo;
        }
    }

    return 0;
}

function getBedwarsLevel(exp) {
    if (!exp) return 0;
    let prestiges = Math.floor(exp / 487000);
    let level = prestiges * 100;
    let expWithoutPrestiges = exp % 487000;

    if (expWithoutPrestiges < 500) return level;
    if (expWithoutPrestiges < 1000) return level + 1;
    if (expWithoutPrestiges < 2000) return level + 2;
    if (expWithoutPrestiges < 3500) return level + 3;

    return level + 4 + Math.floor((expWithoutPrestiges - 3500) / 5000);
}


