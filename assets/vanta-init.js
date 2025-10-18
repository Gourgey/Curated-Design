window.addEventListener('DOMContentLoaded', () => {
if (!window.VANTA || !document.getElementById('vanta-bg')) return;
VANTA.NET({
el: '#vanta-bg',
mouseControls: true,
touchControls: true,
gyroControls: false,
minHeight: 200.00,
minWidth: 200.00,
scale: 1.00,
scaleMobile: 1.00,
color: 0x4f46e5,
backgroundColor: 0xf8fafc,
points: 12.00,
maxDistance: 22.00,
spacing: 18.00
});
});