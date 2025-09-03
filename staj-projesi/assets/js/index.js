const testUsers = {};

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const userType = document.getElementById('userType').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (testUsers[username] && testUsers[username].password === password) {
        const currentUser = {
            username: username,
            name: testUsers[username].name,
            type: userType || testUsers[username].type,
            role: testUsers[username].role,
            loginTime: new Date().toISOString(),
            sessionId: 'session_' + Date.now()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('isLoggedIn', 'true');
        
        const activity = {
            id: Date.now(),
            tarih: new Date().toLocaleDateString('tr-TR'),
            saat: new Date().toLocaleTimeString('tr-TR'),
            islem: 'Sistem Girişi',
            kullanici: currentUser.name,
            durum: 'Başarılı',
            durumClass: 'success'
        };
        
        let activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
        activities.unshift(activity);
        localStorage.setItem('recentActivities', JSON.stringify(activities));
        
        showAlert('success', `Hoş geldiniz, ${currentUser.name}!`);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } else {
        showAlert('danger', 'Geçersiz kullanıcı adı veya şifre!');
        document.getElementById('password').value = '';
    }
});

function validateForm() {
    const form = document.getElementById('loginForm');
    let isValid = true;
    
    form.querySelectorAll('input[required], select[required]').forEach(field => {
        field.classList.remove('is-valid', 'is-invalid');
        
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.add('is-valid');
        }
    });
    
    return isValid;
}

function showAlert(type, message) {
    document.getElementById('alertContainer').innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (isLoggedIn === 'true' && currentUser) {
        showAlert('info', `Zaten giriş yapmışsınız. ${currentUser.name} olarak yönlendiriliyorsunuz...`);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }
});


