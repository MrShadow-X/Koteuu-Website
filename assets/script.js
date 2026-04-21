'use strict';


// ============================================
// PRELOADER SYSTEM
// ============================================

(function initPreloader() {
  const preloader = document.getElementById('preloader');
  const progressBar = preloader ? preloader.querySelector('.preloader-progress') : null;
  const themeToggleBtn = document.querySelector('[data-theme-toggle-btn]');
  
  if (!preloader) return;
  
  // 1. PRELOADER STARTOWY (pokazuje się od razu)
  document.body.classList.add('preloader-active');
  
  // Funkcja do ukrywania preloadera
  function hidePreloader(withDelay = false) {
    if (withDelay) {
      setTimeout(() => {
        preloader.classList.add('loaded');
        setTimeout(() => {
          preloader.style.display = 'none';
          document.body.classList.remove('preloader-active');
        }, 500);
      }, 300);
    } else {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.style.display = 'none';
        document.body.classList.remove('preloader-active');
      }, 500);
    }
  }
  
  // Ukryj gdy strona się załaduje
  if (document.readyState === 'complete') {
    hidePreloader(true);
  } else {
    window.addEventListener('load', () => hidePreloader(true));
    document.addEventListener('DOMContentLoaded', () => hidePreloader(true));
    
    // Fallback
    setTimeout(() => hidePreloader(true), 3000);
  }
  
  // 2. PRELOADER PRZY ZMIANIE MOTYWU
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
      // Pokaż preloader
      preloader.style.display = 'flex';
      preloader.classList.remove('loaded');
      document.body.classList.add('preloader-active');
      
      // Restartuj animację paska
      if (progressBar) {
        progressBar.style.animation = 'none';
        void progressBar.offsetWidth;
        progressBar.style.animation = 'loading 1s ease-in-out';
      }
      
      // Ukryj preloader po animacji
      setTimeout(() => {
        preloader.classList.add('loaded');
        setTimeout(() => {
          preloader.style.display = 'none';
          document.body.classList.remove('preloader-active');
        }, 500);
      }, 1000);
    });
  }
})();


// NAWIGACJA MOBILNA - Toggle menu
const navbar = document.querySelector("[data-navbar]");
const navToggleBtn = document.querySelector("[data-nav-toggle-btn]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");

// Otwórz/zamknij menu po kliknięciu hamburger
navToggleBtn.addEventListener("click", function () {
  navbar.classList.toggle("active");
  this.classList.toggle("active");
});

// Zamknij menu po kliknięciu linku
for (let i = 0; i < navbarLinks.length; i++) {
  navbarLinks[i].addEventListener("click", function () {
    navbar.classList.toggle("active");
    navToggleBtn.classList.toggle("active");
  });
}



// STICKY HEADER - Pojawia się przy scrollu
const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

let lastScrollY = window.scrollY;

window.addEventListener("scroll", function () {
  const currentScrollY = window.scrollY;
  
  if (currentScrollY >= 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
  
  // Zamyka menu mobilne przy scrollowaniu (działa na telefonie)
  if (Math.abs(currentScrollY - lastScrollY) > 1 && navbar.classList.contains('active')) {
    navbar.classList.remove('active');
    navToggleBtn.classList.remove('active');
  }
  
  lastScrollY = currentScrollY;
}, { passive: true });


// ZMIANA MOTYWU - Dark/Light mode
const themeToggleBtn = document.querySelector('[data-theme-toggle-btn]');
const html = document.documentElement;
const themeColorMeta = document.getElementById('theme-color-meta');

// Funkcja do aktualizacji koloru paska przeglądarki
function updateThemeColor(theme) {
  const themeColorMeta = document.getElementById('theme-color-meta');
  
  if (!themeColorMeta) {
    // Jeśli nie ma meta tagu, utwórz go
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.id = 'theme-color-meta';
    meta.content = theme === 'dark' ? '#262626' : '#ffffff';
    document.head.appendChild(meta);
    return;
  }
  
  // Po prostu zaktualizuj content
  themeColorMeta.content = theme === 'dark' ? '#262626' : '#ffffff';
}

// Załaduj zapisany motyw lub ustaw domyślnie ciemny
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeColor(savedTheme);

// Przełącz motyw po kliknięciu
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeColor(newTheme);
});



// ZAMYKANIE MENU po kliknięciu poza nim
document.addEventListener('click', function(event) {
  const isClickInsideNavbar = navbar.contains(event.target);
  const isClickOnToggleBtn = navToggleBtn.contains(event.target);
  
  // Jeśli kliknięto poza menu i poza przyciskiem toggle, zamknij menu
  if (!isClickInsideNavbar && !isClickOnToggleBtn && navbar.classList.contains('active')) {
    navbar.classList.remove('active');
    navToggleBtn.classList.remove('active');
  }
});


// ============================================
// SYSTEM KOMEND
// ============================================

(function initCommands() {
  const commandSearch = document.getElementById('command-search');
  const commandsAccordion = document.getElementById('commands-accordion');
  const commandModal = document.getElementById('command-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalBody = document.getElementById('modal-body');
  const modalBanner = document.getElementById('modal-banner');

  let commandsData = null;
  let activeFilter = 'all';
  let currentSearch = '';

  // Mapowania kategorii: ikona ion-icon + kolor akcentu
  const categoryMeta = {
    'Ustawienia':   { icon: 'settings-outline',           color: 'hsl(220, 70%, 52%)' },
    'Moderacja':    { icon: 'shield-outline',             color: 'hsl(0, 65%, 50%)'   },
    'Ekonomia':     { icon: 'cash-outline',               color: 'hsl(40, 75%, 44%)'  },
    'Muzyka':       { icon: 'musical-notes-outline',      color: 'hsl(280, 60%, 52%)' },
    'Tickety':      { icon: 'ticket-outline',             color: 'hsl(175, 60%, 36%)' },
    'Głosowe':      { icon: 'mic-outline',                color: 'hsl(200, 65%, 44%)' },
    'Narzędzia':    { icon: 'construct-outline',          color: 'hsl(160, 50%, 38%)' },
    'Rozrywka':     { icon: 'game-controller-outline',    color: 'hsl(332, 60%, 50%)' },
    'Gry':          { icon: 'dice-outline',               color: 'hsl(332, 60%, 50%)' },
    'Zabawa':       { icon: 'happy-outline',              color: 'hsl(30, 70%, 48%)'  },
    'Informacje':   { icon: 'information-circle-outline', color: 'hsl(205, 65%, 46%)' },
    'Informacyjne': { icon: 'megaphone-outline',          color: 'hsl(197, 60%, 44%)' },
    'Losowania':    { icon: 'gift-outline',               color: 'hsl(310, 60%, 50%)' },
    'Inne':         { icon: 'apps-outline',               color: 'hsl(0, 0%, 45%)'    },
  };

  function getCatMeta(catName) {
    return categoryMeta[catName] || { icon: 'apps-outline', color: 'hsl(0, 0%, 45%)' };
  }

  // Filter tag icons
  const filterTagIcons = {
    'all': 'search-outline',
  };

  // ── Ładowanie komend ──
  async function loadCommands() {
    try {
      const response = await fetch('commands.json');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const rawCommands = await response.json();
      commandsData = organizeByCategories(rawCommands);
    } catch (error) {
      console.warn('Fallback na dane testowe:', error.message);
      commandsData = getExampleData();
    }
    buildFilterBar();
    renderAccordion();
  }

  // ── Organizacja wg kategorii ──
  function organizeByCategories(commands) {
    const map = {};
    commands.forEach(cmd => {
      const cat = cmd.category || 'Inne';
      if (!map[cat]) {
        const meta = getCatMeta(cat);
        map[cat] = { id: slugify(cat), name: cat, icon: meta.icon, color: meta.color, commands: [] };
      }
      map[cat].commands.push(cmd);
    });
    return { categories: Object.values(map) };
  }

  function slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  // ── Dane testowe ──
  function getExampleData() {
    return {
      categories: [
        {
          id: 'moderacja', name: 'Moderacja',
          icon: 'shield-outline', color: 'hsl(0, 65%, 50%)',
          commands: [
            { name: 'ban', description: 'Zbanuj użytkownika na serwerze', category: 'Moderacja', aliases: ['b'], usage: '<użytkownik> [powód]', cooldown: 3, userPermissions: ['BanMembers'], botPermissions: ['BanMembers'], isEnabled: true },
            { name: 'kick', description: 'Wyrzuć użytkownika z serwera', category: 'Moderacja', aliases: ['k'], usage: '<użytkownik> [powód]', cooldown: 3, userPermissions: ['KickMembers'], botPermissions: ['KickMembers'], isEnabled: true },
            { name: 'mute', description: 'Wycisz użytkownika na określony czas', category: 'Moderacja', aliases: ['timeout'], usage: '<użytkownik> <czas>', cooldown: 5, userPermissions: ['ModerateMembers'], botPermissions: ['ModerateMembers'], isEnabled: true }
          ]
        },
        {
          id: 'narzedzia', name: 'Narzędzia',
          icon: 'construct-outline', color: 'hsl(160, 50%, 38%)',
          commands: [
            { name: 'ping', description: 'Sprawdź opóźnienie bota', category: 'Narzędzia', aliases: [], usage: '', cooldown: 5, userPermissions: [], botPermissions: ['EmbedLinks'], isEnabled: true },
            { name: 'weather', description: 'Wyświetla informacje o pogodzie dla wybranego miejsca', category: 'Narzędzia', aliases: ['pogoda'], usage: '<miejscowość>', cooldown: 5, userPermissions: [], botPermissions: ['EmbedLinks'], isEnabled: true }
          ]
        }
      ]
    };
  }

  // ── Pasek filtrów (z ikonami zamiast emoji) ──
  function buildFilterBar() {
    const bar = document.querySelector('.commands-filter-bar');
    if (!bar || !commandsData) return;

    const total = commandsData.categories.reduce((s, c) => s + c.commands.length, 0);
    let html = `<button class="filter-tag active" data-cat="all">
      <ion-icon name="apps-outline"></ion-icon> Wszystkie <small>(${total})</small>
    </button>`;

    commandsData.categories.forEach(cat => {
      html += `<button class="filter-tag" data-cat="${cat.id}">
        <ion-icon name="${cat.icon}"></ion-icon> ${escapeHtml(cat.name)} <small>(${cat.commands.length})</small>
      </button>`;
    });

    bar.innerHTML = html;
    bar.querySelectorAll('.filter-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.cat;
        renderAccordion(currentSearch);
      });
    });
  }



  // ── Renderowanie ──
  function renderAccordion(searchQuery = '') {
    currentSearch = searchQuery;
    if (!commandsData) return;

    const query = searchQuery.trim().toLowerCase();
    let totalVisible = 0;
    let categoriesHTML = '';

    commandsData.categories.forEach((category, index) => {
      if (activeFilter !== 'all' && category.id !== activeFilter) return;

      let commands = category.commands;
      if (query) {
        commands = commands.filter(cmd =>
          cmd.name.toLowerCase().includes(query) ||
          (cmd.description && cmd.description.toLowerCase().includes(query)) ||
          (cmd.aliases && cmd.aliases.some(a => a.toLowerCase().includes(query)))
        );
      }
      if (commands.length === 0) return;

      totalVisible += commands.length;
      const isOpen = index === 0 || !!query;
      const commandsHTML = commands.map(cmd => createCommandCard(cmd, category)).join('');

      categoriesHTML += `
        <div class="category-accordion${isOpen ? ' is-open' : ''}">
          <div class="category-header${isOpen ? ' active' : ''}" data-category="${index}">
            <div class="category-info">
              <div class="category-icon-wrap" style="background-color:${category.color}">
                <ion-icon name="${category.icon}"></ion-icon>
              </div>
              <div class="category-text-block">
                <span class="category-name">${escapeHtml(category.name)}</span>
                <div class="category-meta">
                  <span class="category-count">${commands.length} ${pluralCmd(commands.length)}</span>
                </div>
              </div>
            </div>
            <ion-icon name="chevron-down-outline" class="category-toggle"></ion-icon>
          </div>
          <div class="category-content${isOpen ? ' active' : ''}">
            <div class="category-divider"></div>
            <div class="category-commands">${commandsHTML}</div>
          </div>
        </div>
      `;
    });

    const allTotal = commandsData.categories.reduce((s, c) => s + c.commands.length, 0);

    if (!categoriesHTML) {
      commandsAccordion.innerHTML = `
        <div class="no-results">
          <ion-icon name="search-outline" class="no-results-icon"></ion-icon>
          <p>Brak Wyników!</p>
          <span>Nie znaleziono komend pasujących do "${escapeHtml(searchQuery)}".</span>
        </div>
      `;
        return;
    }

    commandsAccordion.innerHTML = categoriesHTML;
    addAccordionListeners();
  }

  function pluralCmd(n) {
    if (n === 1) return 'komenda';
    if (n >= 2 && n <= 4) return 'komendy';
    return 'komend';
  }

  // ── Karta komendy ──
  function createCommandCard(command, category) {
    const hasCooldown = (command.cooldown || 0) > 0;

    return `
      <div class="command-card" data-command='${escapeDataAttr({...command, category})}' style="--card-accent:${category.color}">
        <div class="command-card-header">
          <span class="command-name">/${escapeHtml(command.name)}</span>
          ${hasCooldown ? `
            <span class="command-cooldown-badge">
              <ion-icon name="time-outline"></ion-icon>${formatCooldown(command.cooldown)}
            </span>
          ` : ''}
        </div>
        <p class="command-description">${escapeHtml(command.description || '')}</p>
        <div class="command-card-footer">
          <span class="command-more-hint">
            Szczegóły <ion-icon name="arrow-forward-outline"></ion-icon>
          </span>
        </div>
      </div>
    `;
  }

  // ── Format cooldown ──
  function formatCooldown(seconds) {
    if (!seconds || seconds === 0) return 'Brak';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  }

  // ── Accordion listenery ──
  function addAccordionListeners() {
    const headers = commandsAccordion.querySelectorAll('.category-header');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const accordion = header.closest('.category-accordion');
        const content = header.nextElementSibling;
        const isActive = header.classList.contains('active');

        commandsAccordion.querySelectorAll('.category-header').forEach(h => {
          h.classList.remove('active');
          h.closest('.category-accordion').classList.remove('is-open');
          h.nextElementSibling.classList.remove('active');
        });

        if (!isActive) {
          header.classList.add('active');
          accordion.classList.add('is-open');
          content.classList.add('active');
        }
      });
    });

    commandsAccordion.querySelectorAll('.command-card').forEach(card => {
      card.addEventListener('click', () => {
        try {
          const command = JSON.parse(card.dataset.command);
          openCommandModal(command);
        } catch (e) { console.error('Błąd parsowania komendy', e); }
      });
    });
  }

  // ── Modal ──
  function openCommandModal(command) {
    const catData = command.category;
    const catName = typeof catData === 'object' ? catData.name : (catData || 'Inne');
    const meta = getCatMeta(catName);
    const catColor = typeof catData === 'object' ? (catData.color || meta.color) : meta.color;
    const catIcon = typeof catData === 'object' ? (catData.icon || meta.icon) : meta.icon;

    const cooldownText = formatCooldown(command.cooldown || 0);
    const hasCooldown = (command.cooldown || 0) > 0;

    // Opcje
    let optionsHTML = '';
    if (command.options && command.options.length > 0) {
      const items = command.options.map(opt => `
        <div class="option-item">
          <span class="option-name">${escapeHtml(opt.name)}</span>
          <span class="option-required ${opt.required ? 'required' : 'optional'}">${opt.required ? 'wymagane' : 'opcjonalne'}</span>
          <span class="option-desc">${escapeHtml(opt.description || '')}</span>
        </div>
      `).join('');
      optionsHTML = `
        <div class="modal-section">
          <h4 class="modal-section-title color-options">
            <ion-icon name="list-outline"></ion-icon>
            Opcje
          </h4>
          <div class="options-list">${items}</div>
        </div>
      `;
    }

    // Aliasy
    let aliasHTML = '';
    if (command.aliases && command.aliases.length > 0) {
      aliasHTML = `
        <div class="modal-section">
          <h4 class="modal-section-title color-aliases">
            <ion-icon name="git-branch-outline"></ion-icon>
            Aliasy
          </h4>
          <div class="aliases-list">
            ${command.aliases.map(a => `<span class="alias-badge">/${escapeHtml(a)}</span>`).join('')}
          </div>
        </div>
      `;
    }

    // Set banner color separately (banner is outside modal-body padding)
    if (modalBanner) modalBanner.style.backgroundColor = catColor;

    modalBody.innerHTML = `
      <div class="modal-header">
          <div class="modal-icon-wrap" style="background-color:${catColor}">
            <ion-icon name="${catIcon}"></ion-icon>
          </div>
          <div class="modal-header-text">
            <h3 class="modal-title">/${escapeHtml(command.name)}</h3>
            <span class="modal-category-tag">
              <ion-icon name="${catIcon}" style="color:${catColor}"></ion-icon>
              ${escapeHtml(catName)}
            </span>
          </div>
        </div>

        <p class="modal-description">${escapeHtml(command.description || '')}</p>

        <div class="modal-section">
          <h4 class="modal-section-title color-usage">
            <ion-icon name="terminal-outline"></ion-icon>
            Użycie
          </h4>
          <div class="usage-block"><code>${'/' + escapeHtml(command.name) + (command.usage ? ' ' + escapeHtml(command.usage) : '')}</code></div>
        </div>

        ${optionsHTML}
        ${aliasHTML}

        <div class="modal-section">
          <h4 class="modal-section-title color-perms">
            <ion-icon name="shield-checkmark-outline"></ion-icon>
            Uprawnienia
          </h4>
          <div class="permissions-grid">
            <div class="permission-item">
              <ion-icon name="person-outline"></ion-icon>
              <span><span class="permission-label">Użytkownik:</span>
                ${command.userPermissions && command.userPermissions.length > 0
                  ? escapeHtml(command.userPermissions.join(', '))
                  : 'Brak wymagań'}
              </span>
            </div>
            <div class="permission-item">
              <ion-icon name="logo-discord"></ion-icon>
              <span><span class="permission-label">Bot:</span>
                ${command.botPermissions && command.botPermissions.length > 0
                  ? escapeHtml(command.botPermissions.join(', '))
                  : 'Brak wymagań'}
              </span>
            </div>
          </div>
        </div>

        <div class="modal-section" style="margin-block-end:0">
          <h4 class="modal-section-title color-cooldown">
            <ion-icon name="time-outline"></ion-icon>
            Cooldown
          </h4>
          <div class="cooldown-display">
            <ion-icon name="hourglass-outline"></ion-icon>
            ${hasCooldown
              ? `<span class="cooldown-text">${cooldownText}</span>`
              : `<span class="cooldown-none">Brak cooldownu</span>`}
          </div>
        </div>
    `;

    commandModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // ── Zamknij modal ──
  function closeCommandModal() {
    commandModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ── Helpers ──
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function escapeDataAttr(obj) {
    return JSON.stringify(obj).replace(/'/g, '&#39;');
  }

  // ── Event listenery ──
  if (commandSearch) {
    let timer;
    commandSearch.addEventListener('input', (e) => {
      const val = e.target.value;
      const clearBtn = document.querySelector('.search-clear');
      if (clearBtn) clearBtn.classList.toggle('visible', val.length > 0);
      clearTimeout(timer);
      timer = setTimeout(() => renderAccordion(val), 150);
    });
  }

  const clearBtn = document.querySelector('.search-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (commandSearch) {
        commandSearch.value = '';
        commandSearch.focus();
        clearBtn.classList.remove('visible');
        renderAccordion('');
      }
    });
  }

  // Lewy pasek koloru przez CSS var
  document.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.command-card');
    if (card) {
      const accent = card.style.getPropertyValue('--card-accent');
      card.style.setProperty('--bar-color', accent);
    }
  });

  if (modalClose) modalClose.addEventListener('click', closeCommandModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeCommandModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && commandModal && commandModal.classList.contains('active')) closeCommandModal();
  });

  loadCommands();
})();