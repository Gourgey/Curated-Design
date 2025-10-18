// Replace feather icons
window.addEventListener('DOMContentLoaded', () => {
if (window.feather && feather.replace) feather.replace();


// Set current year in footer
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();


// Smooth scroll for on-page anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
a.addEventListener('click', e => {
const target = document.querySelector(a.getAttribute('href'));
if (target) {
e.preventDefault();
target.scrollIntoView({ behavior: 'smooth' });
}
});
});
});