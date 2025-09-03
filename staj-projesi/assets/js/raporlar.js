let stajlar = [];
let firmalar = [];

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Lütfen önce giriş yapınız!');
        window.location.href = 'index.html';
        return;
    }
    
    loadReports();
});

async function loadReports() {
    stajlar = JSON.parse(localStorage.getItem('stajBasvurulari')) || [];
    firmalar = JSON.parse(localStorage.getItem('firmalar')) || [];
    
    await updateStatistics();
    await new Promise(resolve => setTimeout(resolve, 500));
    createStatusChart();
    await new Promise(resolve => setTimeout(resolve, 300));
    createDepartmentChart();
    await new Promise(resolve => setTimeout(resolve, 300));
    createSectorChart();
    await new Promise(resolve => setTimeout(resolve, 300));
    createMonthlyTrendChart();
}

async function updateStatistics() {
    const stats = {
        total: stajlar.length,
        approved: stajlar.filter(s => s.durum === 'onaylandi').length,
        pending: stajlar.filter(s => s.durum === 'beklemede').length,
        rejected: stajlar.filter(s => s.durum === 'reddedildi').length
    };
    
    animateNumber('totalApplications', stats.total);
    animateNumber('approvedApplications', stats.approved);
    animateNumber('pendingApplications', stats.pending);
    animateNumber('rejectedApplications', stats.rejected);
}

function animateNumber(elementId, targetNumber) {
    const element = document.getElementById(elementId);
    element.innerHTML = '';
    let currentNumber = 0;
    const increment = Math.max(1, Math.floor(targetNumber / 30));
    
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= targetNumber) {
            currentNumber = targetNumber;
            clearInterval(timer);
        }
        element.textContent = currentNumber;
    }, 50);
}

function createStatusChart() {
    const stats = {
        onaylandi: stajlar.filter(s => s.durum === 'onaylandi').length,
        beklemede: stajlar.filter(s => s.durum === 'beklemede').length,
        reddedildi: stajlar.filter(s => s.durum === 'reddedildi').length
    };

    const ctx = document.getElementById('statusChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Onaylandı', 'Beklemede', 'Reddedildi'],
            datasets: [{
                data: [stats.onaylandi, stats.beklemede, stats.reddedildi],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 20, usePointStyle: true }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createDepartmentChart() {
    const departments = {};
    stajlar.forEach(staj => {
        if (staj.bolum) {
            departments[staj.bolum] = (departments[staj.bolum] || 0) + 1;
        }
    });
    
    const sortedDepts = Object.entries(departments).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const ctx = document.getElementById('departmentChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedDepts.map(([dept]) => dept.length > 20 ? dept.substring(0, 20) + '...' : dept),
            datasets: [{
                label: 'Başvuru Sayısı',
                data: sortedDepts.map(([, count]) => count),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'],
                borderRadius: 5,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function createSectorChart() {
    const sectors = {};
    firmalar.forEach(firma => {
        if (firma.sektor) {
            sectors[firma.sektor] = (sectors[firma.sektor] || 0) + 1;
        }
    });

    const ctx = document.getElementById('sectorChart').getContext('2d');
    new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(sectors),
            datasets: [{
                data: Object.values(sectors),
                backgroundColor: ['rgba(59, 130, 246, 0.8)','rgba(16, 185, 129, 0.8)','rgba(245, 158, 11, 0.8)','rgba(239, 68, 68, 0.8)','rgba(139, 92, 246, 0.8)','rgba(6, 182, 212, 0.8)'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } } },
            scales: { r: { beginAtZero: true } }
        }
    });
}

function createMonthlyTrendChart() {
    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' });
        monthlyData[key] = { label, count: 0 };
    }

    stajlar.forEach(staj => {
        if (staj.basvuruTarihi) {
            const [day, month, year] = staj.basvuruTarihi.split('.');
            const key = `${year}-${month.padStart(2, '0')}`;
            if (monthlyData[key]) monthlyData[key].count++;
        }
    });

    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.values(monthlyData).map(item => item.label),
            datasets: [{
                label: 'Başvuru Sayısı',
                data: Object.values(monthlyData).map(item => item.count),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function exportToExcel() {
    try {
        const workbook = XLSX.utils.book_new();
        const stajData = stajlar.map(staj => ({
            'Başvuru No': staj.id,
            'Ad Soyad': staj.adSoyad,
            'Öğrenci No': staj.ogrenciNo,
            'Fakülte': staj.fakulte || '',
            'Bölüm': staj.bolum,
            'Sınıf': staj.sinif || '',
            'Telefon': staj.telefon,
            'E-posta': staj.email,
            'Staj Türü': staj.stajTuru,
            'Başlangıç Tarihi': staj.baslangicTarihi,
            'Bitiş Tarihi': staj.bitisTarihi,
            'Firma Adı': staj.firmaAdi,
            'Firma Sektörü': staj.firmaSektoru,
            'Yetkili Kişi': staj.yetkiliKisi || '',
            'Başvuru Tarihi': staj.basvuruTarihi,
            'Durum': staj.durum
        }));
        const stajSheet = XLSX.utils.json_to_sheet(stajData);
        XLSX.utils.book_append_sheet(workbook, stajSheet, 'Staj Başvuruları');

        const firmaData = firmalar.map(firma => ({
            'ID': firma.id,
            'Firma Adı': firma.firmaAdi,
            'Sektör': firma.sektor,
            'Adres': firma.adres,
            'Telefon': firma.telefon,
            'E-posta': firma.email,
            'Web Sitesi': firma.webSitesi || '',
            'Yetkili Adı': firma.yetkiliAdi,
            'Yetkili Telefon': firma.yetkiliTelefon,
            'Yetkili E-posta': firma.yetkiliEmail,
            'Stajyer Kapasitesi': firma.stajyerSayisi,
            'Kayıt Tarihi': firma.kayitTarihi
        }));
        const firmaSheet = XLSX.utils.json_to_sheet(firmaData);
        XLSX.utils.book_append_sheet(workbook, firmaSheet, 'Firmalar');

        const stats = {
            'Toplam Başvuru': stajlar.length,
            'Onaylanan': stajlar.filter(s => s.durum === 'onaylandi').length,
            'Bekleyen': stajlar.filter(s => s.durum === 'beklemede').length,
            'Reddedilen': stajlar.filter(s => s.durum === 'reddedildi').length,
            'Toplam Firma': firmalar.length,
            'Rapor Tarihi': new Date().toLocaleDateString('tr-TR')
        };
        const statsData = Object.entries(stats).map(([key, value]) => ({ 'İstatistik': key, 'Değer': value }));
        const statsSheet = XLSX.utils.json_to_sheet(statsData);
        XLSX.utils.book_append_sheet(workbook, statsSheet, 'İstatistikler');

        const fileName = `staj_sistemi_raporu_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        showToast('Excel raporu başarıyla indirildi!', 'success');
    } catch (error) {
        console.error('Excel export error:', error);
        showToast('Excel dışa aktarma sırasında bir hata oluştu.', 'error');
    }
}

function exportToCSV() {
    let csv = 'Başvuru No,Ad Soyad,Öğrenci No,Bölüm,Staj Türü,Firma,Sektör,Başvuru Tarihi,Durum\n';
    stajlar.forEach(staj => {
        csv += `${staj.id},"${staj.adSoyad}","${staj.ogrenciNo}","${staj.bolum}","${staj.stajTuru}","${staj.firmaAdi}","${staj.firmaSektoru}","${staj.basvuruTarihi}","${staj.durum}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `staj_raporu_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.csv`;
    link.click();
    showToast('CSV dosyası başarıyla indirildi!', 'success');
}

function printReport() { window.print(); }

function showToast(message, type = 'info') {
    const toastId = 'toast_' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show" 
             style="position: fixed; top: 20px; right: 20px; z-index: 1070; min-width: 300px;">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="document.getElementById('${toastId}').remove()"></button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    setTimeout(() => {
        const toast = document.getElementById(toastId);
        if (toast) toast.remove();
    }, 3000);
}


