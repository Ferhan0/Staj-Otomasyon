let firmalar = [];

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Lütfen önce giriş yapınız!');
        window.location.href = 'index.html';
        return;
    }
    
    loadFirmalar();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('firmaForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveFirma();
    });
}

function loadFirmalar() {
    firmalar = JSON.parse(localStorage.getItem('firmalar')) || [];
    renderTable();
}

function saveFirma() {
    try {
        const firma = {
            firmaAdi: document.querySelector('[name="firmaAdi"]').value.trim(),
            sektor: document.querySelector('[name="sektor"]').value.trim(),
            adres: document.querySelector('[name="adres"]').value.trim(),
            telefon: document.querySelector('[name="telefon"]').value.trim(),
            email: document.querySelector('[name="email"]').value.trim(),
            webSitesi: document.querySelector('[name="webSitesi"]').value.trim(),
            yetkiliAdi: document.querySelector('[name="yetkiliAdi"]').value.trim(),
            yetkiliUnvan: document.querySelector('[name="yetkiliUnvan"]').value.trim(),
            yetkiliTelefon: document.querySelector('[name="yetkiliTelefon"]').value.trim(),
            yetkiliEmail: document.querySelector('[name="yetkiliEmail"]').value.trim(),
            stajyerSayisi: document.querySelector('[name="stajyerSayisi"]').value || '1',
            stajAlanlari: document.querySelector('[name="stajAlanlari"]').value.trim()
        };

        const requiredFields = ['firmaAdi', 'sektor', 'adres', 'telefon', 'email', 'yetkiliAdi', 'yetkiliTelefon', 'yetkiliEmail'];
        for (let field of requiredFields) {
            if (!firma[field]) {
                alert(`${field} alanı zorunludur!`);
                return;
            }
        }

        firma.id = Date.now();
        firma.kayitTarihi = new Date().toLocaleDateString('tr-TR');
        firma.durum = 'aktif';

        let firmalar = JSON.parse(localStorage.getItem('firmalar') || '[]');
        firmalar.push(firma);
        localStorage.setItem('firmalar', JSON.stringify(firmalar));

        window.firmalar = firmalar;

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const activity = {
            id: Date.now(),
            tarih: new Date().toLocaleDateString('tr-TR'),
            saat: new Date().toLocaleTimeString('tr-TR'),
            islem: 'Firma Kaydı',
            kullanici: currentUser ? currentUser.name : 'Sistem',
            durum: `${firma.firmaAdi} kaydedildi`,
            durumClass: 'success'
        };

        let activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
        activities.unshift(activity);
        if (activities.length > 50) {
            activities = activities.slice(0, 50);
        }
        localStorage.setItem('recentActivities', JSON.stringify(activities));

        renderTable();
        document.getElementById('firmaForm').reset();
        alert(`${firma.firmaAdi} başarıyla sisteme kaydedildi!`);
    } catch (error) {
        console.error('Firma kayıt hatası:', error);
        alert('Firma kaydında hata oluştu: ' + error.message);
    }
}

function renderTable() {
    const tbody = document.getElementById('firmaListesi');
            
    if (firmalar.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    Henüz kayıtlı firma bulunmamaktadır.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '';
    firmalar.forEach(firma => {
        const webLink = firma.webSitesi ? `<a href="${firma.webSitesi}" target="_blank">${firma.webSitesi}</a>` : 'Web sitesi yok';
                
        const row = `
            <tr>
                <td>
                    <div class="fw-bold">${firma.firmaAdi}</div>
                    <small class="text-muted">${webLink}</small>
                </td>
                <td><span class="badge bg-info">${firma.sektor}</span></td>
                <td>
                    <div>${firma.yetkiliAdi}</div>
                    <small class="text-muted">${firma.yetkiliUnvan || ''}</small>
                </td>
                <td>
                    <div>${firma.telefon}</div>
                    <small class="text-muted">${firma.yetkiliTelefon}</small>
                </td>
                <td class="text-center">
                    <span class="badge bg-success">${firma.stajyerSayisi} kişi</span>
                </td>
                <td><small>${firma.kayitTarihi}</small></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showDetails(${firma.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="printFirma(${firma.id})">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function showDetails(firmaId) {
    const firma = firmalar.find(f => f.id === firmaId);
    if (!firma) return;

    const detayText = `
Firma Detayları:
─────────────────
Firma: ${firma.firmaAdi}
Sektör: ${firma.sektor}
Adres: ${firma.adres}
Telefon: ${firma.telefon}
E-posta: ${firma.email}
Web: ${firma.webSitesi || 'Belirtilmemiş'}

Yetkili Kişi:
─────────────────
Ad: ${firma.yetkiliAdi}
Ünvan: ${firma.yetkiliUnvan || 'Belirtilmemiş'}
Telefon: ${firma.yetkiliTelefon}
E-posta: ${firma.yetkiliEmail}

Staj Bilgileri:
─────────────────
Kapasite: ${firma.stajyerSayisi} kişi
Alanlar: ${firma.stajAlanlari || 'Belirtilmemiş'}
Kayıt: ${firma.kayitTarihi}
    `;

    alert(detayText);
}

function printFirma(firmaId) {
    const firma = firmalar.find(f => f.id === firmaId);
    if (!firma) return;

    const printWindow = window.open('', '_blank');
            
    const htmlParts = [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '<title>Firma Bilgi Formu - ' + firma.firmaAdi + '</title>',
        '<style>',
        'body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }',
        '.header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }',
        '.section { margin: 20px 0; }',
        '.section h3 { color: #1e40af; border-bottom: 1px solid #ddd; padding-bottom: 10px; }',
        '.info-item { margin: 10px 0; }',
        '.info-item strong { display: inline-block; width: 150px; }',
        '@media print { .no-print { display: none !important; } }',
        '</style>',
        '</head>',
        '<body>',
        '<div class="header">',
        '<h1>ADIYAMAN ÜNİVERSİTESİ</h1>',
        '<h2>FİRMA BİLGİ FORMU</h2>',
        '</div>',
        '<div class="section">',
        '<h3>Firma Bilgileri</h3>',
        '<div class="info-item"><strong>Firma Adı:</strong> ' + firma.firmaAdi + '</div>',
        '<div class="info-item"><strong>Sektör:</strong> ' + firma.sektor + '</div>',
        '<div class="info-item"><strong>Adres:</strong> ' + firma.adres + '</div>',
        '<div class="info-item"><strong>Telefon:</strong> ' + firma.telefon + '</div>',
        '<div class="info-item"><strong>E-posta:</strong> ' + firma.email + '</div>',
        '<div class="info-item"><strong>Web Sitesi:</strong> ' + (firma.webSitesi || 'Belirtilmemiş') + '</div>',
        '</div>',
        '<div class="section">',
        '<h3>Yetkili Kişi</h3>',
        '<div class="info-item"><strong>Ad Soyad:</strong> ' + firma.yetkiliAdi + '</div>',
        '<div class="info-item"><strong>Ünvan:</strong> ' + (firma.yetkiliUnvan || 'Belirtilmemiş') + '</div>',
        '<div class="info-item"><strong>Telefon:</strong> ' + firma.yetkiliTelefon + '</div>',
        '<div class="info-item"><strong>E-posta:</strong> ' + firma.yetkiliEmail + '</div>',
        '</div>',
        '<div class="section">',
        '<h3>Staj Bilgileri</h3>',
        '<div class="info-item"><strong>Stajyer Kapasitesi:</strong> ' + firma.stajyerSayisi + ' kişi</div>',
        '<div class="info-item"><strong>Staj Alanları:</strong> ' + (firma.stajAlanlari || 'Belirtilmemiş') + '</div>',
        '<div class="info-item"><strong>Kayıt Tarihi:</strong> ' + firma.kayitTarihi + '</div>',
        '</div>',
        '<div style="margin-top: 50px; text-align: right;">',
        '<p>Bilgi İşlem Daire Başkanlığı<br>Adıyaman Üniversitesi</p>',
        '</div>',
        '<div class="no-print" style="position: fixed; top: 20px; right: 20px;">',
        '<button onclick="window.print()" style="padding: 10px 20px; background: #1e40af; color: white; border: none; border-radius: 5px;">Yazdır</button>',
        '</div>',
        '</body>',
        '</html>'
    ];
            
    const printContent = htmlParts.join('');
    printWindow.document.write(printContent);
    printWindow.document.close();
            
    printWindow.onload = function() {
        printWindow.print();
    };
}


