const bolumler = {
    "Mühendislik Fakültesi": [
        "Bilgisayar Mühendisliği",
        "Elektrik-Elektronik Mühendisliği", 
        "Makine Mühendisliği",
        "İnşaat Mühendisliği"
    ],
    "İktisadi ve İdari Bilimler Fakültesi": [
        "İşletme",
        "İktisat", 
        "Maliye"
    ],
    "Fen-Edebiyat Fakültesi": [
        "Matematik",
        "Fizik",
        "Kimya"
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Lütfen önce giriş yapınız!');
        window.location.href = 'index.html';
        return;
    }
            
    setupEventListeners();
});
        
function setupEventListeners() {
    document.querySelector('select[name="fakulte"]').addEventListener('change', function() {
        const bolumSelect = document.querySelector('select[name="bolum"]');
        const secilenFakulte = this.value;
                
        bolumSelect.innerHTML = '<option value="">Bölüm Seçiniz</option>';
                
        if (secilenFakulte && bolumler[secilenFakulte]) {
            bolumler[secilenFakulte].forEach(bolum => {
                bolumSelect.innerHTML += `<option value="${bolum}">${bolum}</option>`;
            });
        }
    });

    document.getElementById('stajBasvuruForm').addEventListener('submit', function(e) {
        e.preventDefault();
                
        const formData = new FormData(this);
        const basvuru = {};
                
        for (let [key, value] of formData.entries()) {
            if (this.querySelector(`[name="${key}"]`).type === 'checkbox') {
                basvuru[key] = this.querySelector(`[name="${key}"]`).checked;
            } else {
                basvuru[key] = value;
            }
        }
                
        const requiredFields = this.querySelectorAll('[required]');
        let isValid = true;
                
        requiredFields.forEach(field => {
            if (field.type === 'checkbox' && !field.checked) {
                isValid = false;
            } else if (field.type !== 'checkbox' && !field.value.trim()) {
                isValid = false;
            }
        });
                
        if (!isValid) {
            alert('Lütfen tüm zorunlu alanları doldurunuz.');
            return;
        }
                
        basvuru.id = Date.now();
        basvuru.durum = 'beklemede';
        basvuru.basvuruTarihi = new Date().toLocaleDateString('tr-TR');
        basvuru.basvuruSaati = new Date().toLocaleTimeString('tr-TR');
                
        let stajlar = JSON.parse(localStorage.getItem('stajBasvurulari')) || [];
        stajlar.push(basvuru);
        localStorage.setItem('stajBasvurulari', JSON.stringify(stajlar));
                
        const activity = {
            id: Date.now(),
            tarih: new Date().toLocaleDateString('tr-TR'),
            saat: new Date().toLocaleTimeString('tr-TR'),
            islem: 'Staj Başvurusu',
            kullanici: basvuru.adSoyad,
            durum: 'Başvuru kaydedildi',
            durumClass: 'success'
        };

        let activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
        activities.unshift(activity);
        if (activities.length > 50) {
            activities = activities.slice(0, 50);
        }
        localStorage.setItem('recentActivities', JSON.stringify(activities));
                
        alert(`Staj başvurunuz başarıyla kaydedildi!\n\nBaşvuru No: ${basvuru.id}\nTarih: ${basvuru.basvuruTarihi}`);
                
        if (confirm('Ana panele dönmek istiyor musunuz?')) {
            window.location.href = 'dashboard.html';
        } else {
            this.reset();
        }
    });
}


