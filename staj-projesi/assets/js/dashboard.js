let currentUser = null;
let notificationCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    initializeDashboard();
});
        
function initializeDashboard() {
    updateUserInfo();
    updateStats();
    document.getElementById('lastUpdate').textContent = new Date().toLocaleString('tr-TR');
    loadRecentActivities();
    loadNotifications();
    showRoleBasedMenu();
            
    setInterval(() => {
        updateStats();
        loadRecentActivities();
        loadNotifications();
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString('tr-TR');
    }, 300000);
}
        
function updateUserInfo() {
    document.getElementById('userWelcome').textContent = `Hoş geldiniz, ${currentUser.name}!`;
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role || 'Kullanıcı';
            
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('userAvatar').innerHTML = `<span class="fw-bold">${initials}</span>`;
}
        
function updateStats() {
    const stajlar = JSON.parse(localStorage.getItem('stajBasvurulari')) || [];
    const firmalar = JSON.parse(localStorage.getItem('firmalar')) || [];
            
    animateNumber('userCount', stajlar.length);
    animateNumber('internshipCount', stajlar.length);
    animateNumber('companyCount', firmalar.length);
}
        
function animateNumber(elementId, targetNumber) {
    const element = document.getElementById(elementId);
    const startNumber = parseInt(element.textContent) || 0;
    const increment = Math.max(1, Math.floor((targetNumber - startNumber) / 20));
    let currentNumber = startNumber;
            
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= targetNumber) {
            currentNumber = targetNumber;
            clearInterval(timer);
        }
        element.textContent = currentNumber;
    }, 50);
}
        
function loadRecentActivities() {
    const activities = JSON.parse(localStorage.getItem('recentActivities')) || [];
    const tbody = document.querySelector('#recentActivities tbody');
            
    if (activities.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="fas fa-info-circle me-2"></i>
                    Henüz işlem yapılmamış
                </td>
            </tr>
        `;
        return;
    }
            
    tbody.innerHTML = '';
    activities.slice(0, 5).forEach(activity => {
        const row = `
            <tr class="activity-item">
                <td><small>${activity.tarih}</small></td>
                <td>${activity.islem}</td>
                <td>${activity.kullanici}</td>
                <td><span class="badge bg-${activity.durumClass}">${activity.durum}</span></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}
        
function loadNotifications() {
    const stajlar = JSON.parse(localStorage.getItem('stajBasvurulari')) || [];
            
    const pendingStaj = stajlar.filter(s => s.durum === 'beklemede').length;
    notificationCount = pendingStaj;
            
    document.getElementById('notificationCount').textContent = notificationCount;
            
    const dropdown = document.getElementById('notificationDropdown');
    if (notificationCount > 0) {
        dropdown.innerHTML = `
            <li><h6 class="dropdown-header">Bildirimler (${notificationCount})</h6></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="staj-listesi.html">
                <i class="fas fa-clock me-2 text-warning"></i>
                ${pendingStaj} staj başvurusu onay bekliyor
            </a></li>
        `;
    } else {
        dropdown.innerHTML = `
            <li><h6 class="dropdown-header">Bildirimler</h6></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-muted" href="#"><i class="fas fa-info-circle me-2"></i>Henüz bildirim yok</a></li>
        `;
    }
}
        
function showRoleBasedMenu() {
    const roleMenu = document.getElementById('roleBasedMenu');
            
    if (currentUser.type === 'admin') {
        roleMenu.innerHTML = `
            <hr class="mx-3">
            <h6 class="px-3 text-muted small">YÖNETİCİ MENÜSÜ</h6>
            <a class="nav-link" href="#" onclick="showSystemSettings()">
                <i class="fas fa-cogs me-2"></i>Sistem Ayarları
            </a>
            <a class="nav-link" href="#" onclick="showUserManagement()">
                <i class="fas fa-users-cog me-2"></i>Kullanıcı Yönetimi
            </a>
        `;
        roleMenu.style.display = 'block';
    }
}
        
function setActiveNav(element) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    element.classList.add('active');
}
        
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
}
        
function navigateTo(url) {
    window.location.href = url;
}
        
function refreshData() {
    updateStats();
    loadRecentActivities();
    loadNotifications();
    document.getElementById('lastUpdate').textContent = new Date().toLocaleString('tr-TR');
}
        
function refreshActivities() {
    loadRecentActivities();
    loadNotifications();
}
        
function showUserProfile() {
    alert('Profil sayfası geliştirme aşamasındadır.');
}
        
function showSettings() {
    alert('Ayarlar sayfası geliştirme aşamasındadır.');
}
        
function showSystemSettings() {
    alert('Sistem ayarları geliştirme aşamasındadır.');
}
        
function showUserManagement() {
    alert('Kullanıcı yönetimi geliştirme aşamasındadır.');
}
        
function logout() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        const logoutActivity = {
            id: Date.now(),
            tarih: new Date().toLocaleDateString('tr-TR'),
            saat: new Date().toLocaleTimeString('tr-TR'),
            islem: 'Çıkış Yapıldı',
            kullanici: currentUser.name,
            durum: 'Başarılı',
            durumClass: 'info'
        };
                
        let activities = JSON.parse(localStorage.getItem('recentActivities')) || [];
        activities.unshift(logoutActivity);
        localStorage.setItem('recentActivities', JSON.stringify(activities));
                
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }
}
        
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
            
    if (window.innerWidth <= 768 && 
        sidebar && sidebarToggle &&
        !sidebar.contains(e.target) && 
        !sidebarToggle.contains(e.target) && 
        sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
    }
});


