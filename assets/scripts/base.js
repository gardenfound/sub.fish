const notification = document.getElementById('clipboard-notification');
const sidebar = document.getElementById('sideBar');
const sideBarOpen = document.getElementById('sideBarOpen');

function showNotification(message, hex) {
    if(notification.classList.contains('show')){ // already running? don't do shit!
        return;
    }
    notification.style.backgroundColor = hex;
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

function toggleSidebar(value) {
    value ? sidebar.classList.add('show') : sidebar.classList.remove('show');
    value ? sideBarOpen.classList.add('hide') : sideBarOpen.classList.remove('hide');
}