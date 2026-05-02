// --- DATA ---
const projectData = {
    camsnipe: {
        icon: "👁️", title: "CamSnipe Hub", badge: "LIVE", isLive: true,
        desc: "Online directory of exposed IP cameras. Mapping the internet's eyes.",
        features: ["Live stream aggregation without auth walls", "Device fingerprinting and ID", "ISP/Location metadata extraction"],
        url: "https://camsnipe-hub-ipym.onrender.com/"
    },
    webshame: {
        icon: "🔑", title: "WebShame", badge: "LIVE", isLive: true,
        desc: "Wall of shame for leaked secrets pushed to public GitHub repos. Free API keys anyone?",
        features: ["Real-time GitHub scanner", "Leaderboard tracking", "Displays all leaked repositories"],
        url: "https://x3r0day.me/WebShame/"
    },
    sniffer: {
        icon: "🕷️", title: "API Sniffer", badge: "STABLE", isLive: false, hasDownload: false,
        desc: "Multi-threaded GitHub secret scanner. Catches credentials before adversaries do.",
        features: ["Regex heuristic scanning for 60+ key types", "GitHub Enterprise support", "Low false-positive via entropy analysis"],
        githubUrl: "https://github.com/X3r0Day/XeroDay-APISniffer"
    },
    hashlock: {
        icon: "🔐", title: "HashLock", badge: "STABLE", isLive: false, hasDownload: true,
        desc: "Military-grade offline password manager. Zero trust, zero cloud syncing.",
        features: ["Fernet cryptographic encryption", "Zero network requests made", "Portable encrypted vault file"],
        githubUrl: "https://github.com/X3r0Day/HashLock"
    },
    specter: {
        icon: "⚡", title: "Specter", badge: "BETA", isLive: false, hasDownload: false,
        desc: "Blazing fast async subdomain enum & port scanner. Maps infrastructure in seconds.",
        features: ["Asyncio TCP port scanning", "Wordlist subdomain bruteforce", "JSON, CSV, HTML export"],
        install: "> pipx install git+https://github.com/x3r0day/x3r0day-specter.git\n> yay -S specter",
        githubUrl: "https://github.com/X3r0Day/X3r0Day-Specter"
    },
    infodisc: {
        icon: "🗄️", title: "InfoDisclosure", badge: "STABLE", isLive: false, hasDownload: false,
        desc: "Automated Wayback Machine scraper. Hunts down forgotten .env and .bak files.",
        features: ["Direct Wayback CDX API integration", "Pattern matching for sensitive extensions", "Custom keywords support"],
        githubUrl: "https://github.com/X3r0Day/InformationDisclosure"
    }
};

// --- CLOCK ---
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('clock').innerText = hours + ':' + minutes + ' ' + ampm;
}

// --- WINDOW MANAGEMENT ---
let highestZ = 100;

function focusWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        highestZ++;
        win.style.zIndex = highestZ;

        // Update title bar colors
        document.querySelectorAll('.title-bar').forEach(tb => tb.classList.add('inactive'));
        win.querySelector('.title-bar').classList.remove('inactive');

        // Update taskbar
        document.querySelectorAll('.task-tab').forEach(tb => tb.classList.remove('active'));
        const tab = document.getElementById('tab-' + id);
        if (tab) tab.classList.add('active');
    }
}

function openApp(id) {
    const win = document.getElementById(id);
    const tab = document.getElementById('tab-' + id);
    if (win) {
        win.style.display = 'flex';
        focusWindow(id);
    }
    if (tab) tab.style.display = 'flex';
}

function closeApp(id) {
    const win = document.getElementById(id);
    const tab = document.getElementById('tab-' + id);
    if (win) win.style.display = 'none';
    if (tab) tab.style.display = 'none';
}

function minimizeApp(id) {
    const win = document.getElementById(id);
    const tab = document.getElementById('tab-' + id);
    if (win) win.style.display = 'none';
    if (tab) tab.classList.remove('active');
}

function toggleApp(id) {
    const win = document.getElementById(id);
    const tab = document.getElementById('tab-' + id);
    if (win.style.display === 'none') {
        openApp(id);
    } else {
        if (win.style.zIndex == highestZ) {
            minimizeApp(id);
        } else {
            focusWindow(id);
        }
    }
}

function maximize(id, btnElement) {
    const win = document.getElementById(id);
    if (win.dataset.maximized === 'true') {
        win.style.width = win.dataset.origW;
        win.style.height = win.dataset.origH;
        win.style.top = win.dataset.origT;
        win.style.left = win.dataset.origL;
        win.dataset.maximized = 'false';
        if (btnElement) btnElement.innerText = '◻';
    } else {
        win.dataset.origW = win.style.width || getComputedStyle(win).width;
        win.dataset.origH = win.style.height || getComputedStyle(win).height;
        win.dataset.origT = win.style.top || getComputedStyle(win).top;
        win.dataset.origL = win.style.left || getComputedStyle(win).left;

        win.style.width = '100%';
        win.style.height = 'calc(100vh - 35px)';
        win.style.top = '0';
        win.style.left = '0';
        win.dataset.maximized = 'true';
        if (btnElement) btnElement.innerText = '❐';
    }
}

// --- DRAGGING LOGIC ---
function dragWindow(e, id) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('.title-controls')) return;
    focusWindow(id);

    const win = document.getElementById(id);
    if (win.dataset.maximized === 'true') return; // Cannot drag maximized window

    let shiftX = e.clientX - win.getBoundingClientRect().left;
    let shiftY = e.clientY - win.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
        win.style.left = pageX - shiftX + 'px';
        win.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) { moveAt(e.pageX, e.pageY); }
    document.addEventListener('mousemove', onMouseMove);

    document.onmouseup = function () {
        document.removeEventListener('mousemove', onMouseMove);
        document.onmouseup = null;
    };
}

// --- ICON DOUBLE CLICK LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Icon click/dblclick handlers
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            document.querySelectorAll('.app-icon').forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
        });

        icon.addEventListener('dblclick', () => {
            const toolKey = icon.getAttribute('data-tool');
            const data = projectData[toolKey];

            if (data) {
                document.getElementById('det-icon').innerText = data.icon;
                document.getElementById('det-title-bar').innerText = data.title + ".exe";
                document.getElementById('tab-det-icon').innerText = data.icon;
                document.getElementById('tab-det-title').innerText = data.title;

                const content = document.getElementById('det-content');
                content.innerHTML = `
                    <div class="detail-header">
                        <span class="emoji-icon">${data.icon}</span>
                        <div>
                            <h2>${data.title}</h2>
                            <span class="badge ${data.isLive ? '' : 'offline'}">${data.badge}</span>
                        </div>
                    </div>
                    <div class="detail-body">
                        <p>${data.desc}</p>
                        <h3>Features</h3>
                        <ul>
                            ${data.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                        ${data.install ? `<h3>Installation</h3><div class="code-box">${data.install.replace(/\n/g,'<br>')}</div>` : ''}
                    </div>
                    <div class="action-btns">
                        ${data.url ? `<a href="${data.url}" target="_blank" class="btn-outset">Launch App</a>` : ''}
                        ${data.hasDownload && data.githubUrl ? `<a href="${data.githubUrl}/releases" target="_blank" class="btn-outset">Download</a>` : ''}
                        ${data.githubUrl ? `<a href="${data.githubUrl}" target="_blank" class="btn-outset">View Source</a>` : ''}
                    </div>
                `;
                openApp('win-details');
            }
        });
    });

    // Initialize focus
    focusWindow('win-main');

    // Window clicks focus them
    document.querySelectorAll('.window').forEach(win => {
        win.addEventListener('mousedown', () => focusWindow(win.id));
    });
});
