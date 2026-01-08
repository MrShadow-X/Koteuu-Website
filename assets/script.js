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