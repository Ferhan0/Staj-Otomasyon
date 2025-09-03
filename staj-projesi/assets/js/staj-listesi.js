let allApplications = [];
let filteredApplications = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentApplicationId = null;
        
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Lütfen önce giriş yapınız!');
        window.location.href = 'index.html';
        return;
    }
            
    initializePage();
    setupEventListeners();
});
        
function initializePage() {
    loadApplications();
    updateStatistics();
    setTimeout(() => {
        loadDepartments();
    }, 100);
}
        
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('departmentFilter').addEventListener('change', applyFilters);
    document.getElementById('internshipTypeFilter').addEventListener('change', applyFilters);
    document.getElementById('sortSelect').addEventListener('change', applyFilters);
    document.getElementById('itemsPerPage').addEventListener('change', function() {
        itemsPerPage = parseInt(this.value);
        currentPage = 1;
        renderTable();
    });
}
        
function loadApplications() {
    allApplications = JSON.parse(localStorage.getItem('stajBasvurulari')) || [];
            
    if (allApplications.length === 0) {
        const ornekVeri = [
            {
                id: Date.now(),
                adSoyad: "Ahmet Yılmaz",
                ogrenciNo: "210101001",
                fakulte: "Mühendislik Fakültesi",
                bolum: "Bilgisayar Mühendisliği",
                sinif: "3",
                telefon: "0555-123-4567",
                email: "ahmet@student.adiyaman.edu.tr",
                stajTuru: "Yaz Stajı I",
                akademikYil: "2024-2025",
                baslangicTarihi: "2025-06-15",
                bitisTarihi: "2025-07-15",
                firmaAdi: "TechSoft Yazılım",
                firmaSektoru: "Yazılım ve Bilişim",
                firmaAdresi: "Adıyaman Merkez",
                firmaTelefon: "0416-111-2233",
                yetkiliKisi: "Mehmet Demir",
                durum: "beklemede",
                basvuruTarihi: new Date().toLocaleDateString('tr-TR'),
                basvuruSaati: new Date().toLocaleTimeString('tr-TR'),
                gssOnay: true,
                bilgiOnay: true,
                kvkkOnay: true
            }
        ];
        allApplications = ornekVeri;
        localStorage.setItem('stajBasvurulari', JSON.stringify(allApplications));
    }
            
    filteredApplications = [...allApplications];
    renderTable();
}
        
function loadDepartments() {
    const departments = [...new Set(allApplications.map(app => app.bolum).filter(Boolean))];
    const select = document.getElementById('departmentFilter');
            
    select.innerHTML = '<option value="">Tümü</option>';
            
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        select.appendChild(option);
    });
}
        
function updateStatistics() {
    const stats = {
        total: allApplications.length,
        pending: allApplications.filter(app => app.durum === 'beklemede').length,
        approved: allApplications.filter(app => app.durum === 'onaylandi').length,
        rejected: allApplications.filter(app => app.durum === 'reddedildi').length
    };
        
    animateNumber('totalCount', stats.total);
    animateNumber('pendingCount', stats.pending);
    animateNumber('approvedCount', stats.approved);
    animateNumber('rejectedCount', stats.rejected);
}
        
function animateNumber(elementId, targetNumber) {
    const element = document.getElementById(elementId);
    let currentNumber = 0;
    const increment = Math.max(1, Math.floor(targetNumber / 20));
            
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= targetNumber) {
            currentNumber = targetNumber;
            clearInterval(timer);
        }
        element.textContent = currentNumber;
    }, 50);
}
        
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const department = document.getElementById('departmentFilter').value;
    const internshipType = document.getElementById('internshipTypeFilter').value;
    const sort = document.getElementById('sortSelect').value;
        
    filteredApplications = allApplications.filter(app => {
        const matchesSearch = !search || 
            app.adSoyad.toLowerCase().includes(search) ||
            app.ogrenciNo.toLowerCase().includes(search) ||
            app.firmaAdi.toLowerCase().includes(search) ||
            app.bolum.toLowerCase().includes(search);
        
        const matchesStatus = !status || app.durum === status;
        const matchesDepartment = !department || app.bolum === department;
        const matchesInternshipType = !internshipType || app.stajTuru === internshipType;
        
        return matchesSearch && matchesStatus && matchesDepartment && matchesInternshipType;
    });
        
    filteredApplications.sort((a, b) => {
        switch (sort) {
            case 'newest':
                return new Date(b.basvuruTarihi.split('.').reverse().join('-')) - new Date(a.basvuruTarihi.split('.').reverse().join('-'));
            case 'oldest':
                return new Date(a.basvuruTarihi.split('.').reverse().join('-')) - new Date(b.basvuruTarihi.split('.').reverse().join('-'));
            case 'name':
                return a.adSoyad.localeCompare(b.adSoyad, 'tr');
            case 'status':
                return a.durum.localeCompare(b.durum, 'tr');
            default:
                return 0;
        }
    });
        
    currentPage = 1;
    renderTable();
}
        
function renderTable() {
    const tbody = document.getElementById('applicationTableBody');
            
    if (!tbody) {
        console.error('Table body element not found');
        return;
    }
            
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredApplications.slice(start, end);
        
    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="fas fa-search me-2"></i>
                    ${filteredApplications.length === 0 ? 'Henüz başvuru bulunmuyor' : 'Filtrelere uygun sonuç bulunamadı'}
                    ${allApplications.length === 0 ? '<br><button class="btn btn-primary mt-2" onclick="window.location.href=\'staj-basvuru.html\'\"><i class="fas fa-plus me-2"></i>İlk Başvuruyu Oluştur</button>' : ''}
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = pageData.map(app => createTableRow(app)).join('');
    }
        
    updatePagination();
            
    const showingElement = document.getElementById('showingCount');
    if (showingElement) {
        showingElement.textContent = filteredApplications.length;
    }
}
        
function createTableRow(app) {
    const statusClass = {
        'beklemede': 'bg-warning text-dark',
        'onaylandi': 'bg-success text-white',
        'reddedildi': 'bg-danger text-white'
    };

    const statusText = {
        'beklemede': 'Beklemede',
        'onaylandi': 'Onaylandı',
        'reddedildi': 'Reddedildi'
    };

    return `
        <tr>
            <td><strong>#${app.id}</strong></td>
            <td>
                <div class="fw-bold">${app.adSoyad}</div>
                <small class="text-muted">${app.ogrenciNo}</small><br>
                <small class="text-muted">${app.telefon}</small>
            </td>
            <td>
                <div>${app.bolum}</div>
                <small class="text-muted">${app.fakulte || ''}</small>
            </td>
            <td>
                <span class="badge bg-primary">${app.stajTuru}</span>
            </td>
            <td>
                <div class="fw-bold">${app.firmaAdi}</div>
                <small class="text-muted">${app.firmaSektoru}</small>
            </td>
            <td>
                <small>
                    <div><strong>Başlangıç:</strong> ${app.baslangicTarihi}</div>
                    <div><strong>Bitiş:</strong> ${app.bitisTarihi}</div>
                    <div class="text-muted">Başvuru: ${app.basvuruTarihi}</div>
                </small>
            </td>
            <td>
                <span class="status-badge ${statusClass[app.durum]}">${statusText[app.durum]}</span>
            </td>
            <td>
                <button class="btn btn-action btn-info" onclick="showDetails(${app.id})" title="Detayları Görüntüle">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-action btn-success" onclick="openKabulFormu(${app.id})" title="Kabul Formu">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="btn btn-action btn-warning" onclick="showStatusModal(${app.id})" title="Durum Değiştir">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-action btn-danger" onclick="deleteApplication(${app.id})" title="Başvuruyu Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
}
        
function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('Excel kütüphanesi yüklenmedi. Lütfen sayfayı yenileyin.');
        return;
    }
            
    try {
        const workbook = XLSX.utils.book_new();
                
        const excelData = filteredApplications.map(app => ({
            'Başvuru No': app.id,
            'Ad Soyad': app.adSoyad,
            'Öğrenci No': app.ogrenciNo,
            'Bölüm': app.bolum,
            'Staj Türü': app.stajTuru,
            'Firma': app.firmaAdi,
            'Başvuru Tarihi': app.basvuruTarihi,
            'Durum': app.durum === 'beklemede' ? 'Beklemede' : app.durum === 'onaylandi' ? 'Onaylandı' : 'Reddedildi'
        }));
                
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Staj Başvuruları');
                
        const fileName = `staj_basvurulari_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
                
        showToast('Excel dosyası başarıyla indirildi!', 'success');
                
    } catch (error) {
        console.error('Excel export error:', error);
        showToast('Excel dışa aktarma sırasında bir hata oluştu.', 'error');
    }
}
        
function refreshList() {
    loadApplications();
    updateStatistics();
    showToast('Liste başarıyla yenilendi!', 'info');
}
        
function deleteApplication(appId) {
    const app = allApplications.find(a => a.id === appId);
    if (!app) return;

    if (confirm(`${app.adSoyad} adlı öğrencinin staj başvurusunu silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) {
        allApplications = allApplications.filter(a => a.id !== appId);
        localStorage.setItem('stajBasvurulari', JSON.stringify(allApplications));

        const activity = {
            id: Date.now(),
            tarih: new Date().toLocaleDateString('tr-TR'),
            saat: new Date().toLocaleTimeString('tr-TR'),
            islem: 'Başvuru Silme',
            kullanici: app.adSoyad,
            durum: 'Başvuru silindi',
            durumClass: 'danger'
        };

        let activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
        activities.unshift(activity);
        if (activities.length > 50) {
            activities = activities.slice(0, 50);
        }
        localStorage.setItem('recentActivities', JSON.stringify(activities));

        loadApplications();
        updateStatistics();
        showToast('Başvuru başarıyla silindi!', 'success');
    }
}
        
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('departmentFilter').value = '';
    document.getElementById('internshipTypeFilter').value = '';
    document.getElementById('sortSelect').value = 'newest';
    applyFilters();
}
        
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
        
function showDetails(appId) {
    const app = allApplications.find(a => a.id === appId);
    if (!app) return;
        
    alert(`Başvuru Detayları:
            
Ad Soyad: ${app.adSoyad}
Öğrenci No: ${app.ogrenciNo}
Bölüm: ${app.bolum}
Staj Türü: ${app.stajTuru}
Firma: ${app.firmaAdi}
Başvuru Tarihi: ${app.basvuruTarihi}
Durum: ${app.durum}`);
}
        
function showStatusModal(appId) {
    const app = allApplications.find(a => a.id === appId);
    if (!app) return;
        
    const newStatus = prompt(`${app.adSoyad} başvurusunun yeni durumunu seçin:
            
1 - Beklemede
2 - Onaylandı  
3 - Reddedildi
        
Mevcut durum: ${app.durum}
Yeni durum (1-3):`);
        
    if (newStatus === '1' || newStatus === '2' || newStatus === '3') {
        const statusMap = {
            '1': 'beklemede',
            '2': 'onaylandi',
            '3': 'reddedildi'
        };
                
        const appIndex = allApplications.findIndex(a => a.id === appId);
        allApplications[appIndex].durum = statusMap[newStatus];
        localStorage.setItem('stajBasvurulari', JSON.stringify(allApplications));
                
        loadApplications();
        updateStatistics();
        showToast('Başvuru durumu güncellendi!', 'success');
    }
}
        
function updatePagination() {
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const paginationList = document.getElementById('paginationList');
            
    if (totalPages <= 1) {
        paginationList.innerHTML = '<li class="page-item disabled"><span class="page-link">1 sayfa</span></li>';
        return;
    }
        
    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>
            </li>
        `;
    }
    paginationList.innerHTML = paginationHTML;
}
        
function goToPage(page) {
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
    }
}
        
function printList() {
    window.print();
}
        
function openKabulFormu(appId) {
    const app = allApplications.find(a => a.id === appId);
    if (!app) {
        alert('Başvuru bulunamadı!');
        return;
    }
            
    localStorage.setItem('selectedStudentForForm', JSON.stringify(app));
            
    const formWindow = window.open('staj-kabul-formu.html', '_blank', 'width=1000,height=800,scrollbars=yes');
            
    if (!formWindow) {
        alert('Pop-up engellenmiş olabilir. Lütfen tarayıcı ayarlarınızı kontrol edin.');
    }
}


