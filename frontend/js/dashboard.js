// Load tugas list
async function loadTugasList() {
    try {
        const response = await fetch('/api/tugas');
        const tugas = await response.json();
        
        const tugasList = document.getElementById('tugasList');
        
        if (tugas.length === 0) {
            tugasList.innerHTML = '<p style="text-align: center; color: #999;">Belum ada tugas yang diupload</p>';
            return;
        }
        
        tugasList.innerHTML = tugas.map(t => `
            <div class="tugas-item">
                <div>
                    <strong>${t.judul}</strong><br>
                    <small>${t.mapel} | ${t.waktu} menit | ${t.jumlahSoal} soal</small>
                </div>
                <button class="delete-btn" onclick="deleteTugas(${t.id})">Hapus</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tugas:', error);
    }
}

// Upload tugas
document.getElementById('tugasForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const soalText = document.getElementById('soal').value;
    const soalArray = soalText.split('\n\n').filter(s => s.trim());
    
    const tugasData = {
        judul: document.getElementById('judul').value,
        mapel: document.getElementById('mapel').value,
        deskripsi: document.getElementById('deskripsi').value,
        waktu: parseInt(document.getElementById('waktu').value),
        jumlahSoal: parseInt(document.getElementById('jumlahSoal').value),
        soal: soalArray
    };
    
    try {
        const response = await fetch('/api/tugas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tugasData)
        });
        
        if (response.ok) {
            alert('Tugas berhasil diupload! 🎉');
            document.getElementById('tugasForm').reset();
            loadTugasList();
            
            // Update total di halaman utama
            const totalTugasSpan = document.getElementById('totalTugas');
            if (totalTugasSpan) {
                const allTugas = await fetch('/api/tugas');
                const tugas = await allTugas.json();
                totalTugasSpan.textContent = tugas.length;
            }
        }
    } catch (error) {
        console.error('Error uploading tugas:', error);
        alert('Gagal mengupload tugas');
    }
});

// Delete tugas
async function deleteTugas(id) {
    if (confirm('Yakin ingin menghapus tugas ini?')) {
        try {
            await fetch(`/api/tugas/${id}`, { method: 'DELETE' });
            loadTugasList();
            alert('Tugas berhasil dihapus');
        } catch (error) {
            console.error('Error deleting tugas:', error);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTugasList();
    
    // Create particles
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
});