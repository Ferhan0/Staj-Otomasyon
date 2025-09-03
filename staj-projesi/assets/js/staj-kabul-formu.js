let stajBasvurulari = [];
       
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
});
       
function loadStudents() {
    stajBasvurulari = JSON.parse(localStorage.getItem('stajBasvurulari')) || [];
    const select = document.getElementById('studentSelect');
           
    select.innerHTML = '<option value="">Öğrenci seçiniz...</option>';
           
    stajBasvurulari.forEach((student, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${student.adSoyad} - ${student.ogrenciNo} (${student.stajTuru})`;
        select.appendChild(option);
    });
}
       
function fillForm() {
    const selectedIndex = document.getElementById('studentSelect').value;
           
    if (selectedIndex === '') {
        alert('Lütfen bir öğrenci seçiniz!');
        return;
    }
           
    const student = stajBasvurulari[selectedIndex];
           
    document.getElementById('akademikYil').textContent = student.akademikYil || '2024-2025';
    document.getElementById('yariyil').textContent = getYariyil(student.stajTuru);
    document.getElementById('fakulte').textContent = student.fakulte || '';
    document.getElementById('bolumProgram').textContent = student.bolum || '';
    document.getElementById('adiSoyadi').textContent = student.adSoyad || '';
    document.getElementById('ogrenciNo').textContent = student.ogrenciNo || '';
    document.getElementById('tcKimlikNo').textContent = generateTcNo();
    document.getElementById('eposta').textContent = student.email || '';
    document.getElementById('ceptel').textContent = student.telefon || '';
    document.getElementById('iban').textContent = generateIban();
           
    document.getElementById('dersKodu').textContent = getDersKodu(student.stajTuru);
    document.getElementById('dersAdi').textContent = student.stajTuru || '';
    document.getElementById('suresi').textContent = getStajSuresi(student.stajTuru);
    document.getElementById('baslangicBitis').textContent = `${formatDate(student.baslangicTarihi)} - ${formatDate(student.bitisTarihi)}`;
           
    document.getElementById('isyeriMesleki').textContent = '';
    document.getElementById('ailesidenAnnem').textContent = '';
           
    alert('Form başarıyla dolduruldu! Artık yazdırabilirsiniz.');
}
       
function getYariyil(stajTuru) {
    const yaz = ['Yaz Stajı I', 'Yaz Stajı II'];
    return yaz.includes(stajTuru) ? 'Yaz' : 'Güz/Bahar';
}
       
function getDersKodu(stajTuru) {
    const kodlar = { 'Yaz Stajı I': 'STAJ301', 'Yaz Stajı II': 'STAJ302', 'Zorunlu Staj': 'STAJ401' };
    return kodlar[stajTuru] || 'STAJ';
}
       
function getStajSuresi(stajTuru) {
    const sureler = { 'Yaz Stajı I': '30 Gün', 'Yaz Stajı II': '30 Gün', 'Zorunlu Staj': '60 Gün' };
    return sureler[stajTuru] || '30 Gün';
}
       
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR');
}
       
function generateTcNo() { return '12345678901'; }
function generateIban() { return 'TR12 3456 7890 1234 5678 9012 34'; }


