const notification = document.getElementById('clipboard-notification');
const sidebar = document.getElementById('sideBar');
const sideBarOpen = document.getElementById('sideBarOpen');

function showNotification() {
    // if it already has the show class, return here
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

function toggleSidebar(value) {
    value ? sidebar.classList.add('show') : sidebar.classList.remove('show');
    value ? sideBarOpen.classList.add('hide') : sideBarOpen.classList.remove('hide');
}