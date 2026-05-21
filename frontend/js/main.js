// Generate particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.width = Math.random() * 5 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = Math.random() * 3 + 4 + 's';
        particlesContainer.appendChild(particle);
    }
}

// Load tugas
async function loadTugas() {
    try {
        const response = await fetch('/api/tugas');
        const tugas = await response.json();
        
        const tugasGrid = document.getElementById('tugasGrid');
        const totalTugasSpan = document.getElementById('totalTugas');
        
        if (totalTugasSpan) totalTugasSpan.textContent = tugas.length;
        
        if (tugas.length === 0) {
            tugasGrid.innerHTML = '<div class="loading-spinner">Belum ada tugas. Silakan cek lagi nanti 📚</div>';
            return;
        }
        
        tugasGrid.innerHTML = tugas.map(t => `
            <div class="tugas-card" onclick="openFormModal(${t.id})">
                <h3>${t.judul}</h3>
                <div class="mapel">📖 ${t.mapel}</div>
                <p class="deskripsi">${t.deskripsi.substring(0, 100)}...</p>
                <div class="meta">
                    <span>⏱️ ${t.waktu} menit</span>
                    <span>📝 ${t.jumlahSoal} soal</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tugas:', error);
    }
}

let selectedTugasId = null;

function openFormModal(tugasId) {
    selectedTugasId = tugasId;
    const modal = document.getElementById('formModal');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('formModal');
    modal.style.display = 'none';
    document.getElementById('studentForm').reset();
}

document.getElementById('studentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentData = {
        nama: document.getElementById('studentName').value,
        nis: document.getElementById('studentId').value,
        kelas: document.getElementById('studentClass').value,
        tugasId: selectedTugasId
    };
    
    localStorage.setItem('studentData', JSON.stringify(studentData));
    window.location.href = `/ujian.html?id=${selectedTugasId}`;
});

function scrollToTugas() {
    document.getElementById('tugasSection').scrollIntoView({ behavior: 'smooth' });
}

// Load data siswa aktif
async function loadActiveStudents() {
    try {
        const response = await fetch('/api/jawaban/all');
        const jawaban = await response.json();
        const totalSiswaSpan = document.getElementById('totalSiswa');
        if (totalSiswaSpan) {
            const uniqueStudents = new Set(jawaban.map(j => j.nis));
            totalSiswaSpan.textContent = uniqueStudents.size;
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    loadTugas();
    loadActiveStudents();
});

// Close modal when clicking outside
window.onclick = (event) => {
    const modal = document.getElementById('formModal');
    if (event.target === modal) {
        closeModal();
    }
};