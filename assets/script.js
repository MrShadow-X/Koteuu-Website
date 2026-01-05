'use strict';

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

window.addEventListener("scroll", function () {
  if (window.scrollY >= 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});



// ZMIANA MOTYWU - Dark/Light mode
const themeToggleBtn = document.querySelector('[data-theme-toggle-btn]');
const html = document.documentElement;
const themeColorMeta = document.getElementById('theme-color-meta');

// Funkcja do aktualizacji koloru paska przeglądarki
function updateThemeColor(theme) {
  if (theme === 'dark') {
    themeColorMeta.setAttribute('content', '#262626'); // Ciemny kolor
  } else {
    themeColorMeta.setAttribute('content', '#ffffff'); // Jasny kolor
  }
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