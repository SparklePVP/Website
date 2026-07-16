// Log to console to verify JavaScript is connected and working
document.addEventListener('DOMContentLoaded', () => {
    console.log("GIGGED site fully loaded.");
    
    const heading = document.getElementById('main-heading');
    
    // Optional: Add a little interactive click effect
    heading.addEventListener('click', () => {
        heading.style.color = '#ff007f'; // Flashes pink when clicked
        setTimeout(() => {
            heading.style.color = '#00ffcc';
        }, 300);
    });
});