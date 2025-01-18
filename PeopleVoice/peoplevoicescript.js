// Sidebar toggle functionality
const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.getElementById('toggle-sidebar');
const overlay = document.getElementById('overlay');

// Open sidebar
toggleSidebar.addEventListener('click', (event) => {
    event.stopPropagation();
    sidebar.style.left = '0';
    overlay.style.display = 'block';
});

// Close sidebar
overlay.addEventListener('click', () => {
    sidebar.style.left = '-220px';
    overlay.style.display = 'none';
});

// Prevent clicks inside the sidebar from closing it
sidebar.addEventListener('click', (event) => {
    event.stopPropagation();
});
