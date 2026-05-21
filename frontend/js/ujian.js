let tugasData = null;
let studentData = null;
let jawaban = [];
let timer = null;
let waktuTersisa = 0;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tugasId = urlParams.get('id');

// Load student data
studentData = JSON.parse(localStorage.getItem('studentData'));

if (!studentData || studentData.tugasId != tugasId) {
    alert('Data siswa tidak ditemukan. Silakan isi form terlebih dahulu.');
    window.location.href = '/';
}

// Load tugas
async function loadTugas() {
    try {
        const response = await fetch('/api/tugas');
        const semuaTugas = await response.json();
        tugasData = semuaTugas.find(t => t.id == tugasId);
        
        if (!tugasData) {
            alert('Tugas tidak ditemukan');
            window.location.href = '/';
            return;
        }
        
        document.getElementById('judulUjian').textContent = tugasData.judul;
        document.getElementById('mapelUjian').textContent = `📖 ${tugasData.mapel}`;
        
        waktuTersisa = tugasData.waktu * 60;
        startTimer();
        displaySoal();
        createSoalNav();
        
        // Initialize jawaban array
        jawaban = new Array(tugasData.jumlahSoal).fill(null);
        
        // Load saved answers from localStorage
        const savedAnswers = localStorage.getItem(`jawaban_${tugasId}_${studentData.nis}`);
        if (savedAnswers) {
            jawaban = JSON.parse(savedAnswers);
            updateNavButtons();
        }
    } catch (error) {
        console.error('Error loading tugas:', error);
    }
}

function startTimer() {
    updateTimerDisplay();
    timer = setInterval(() => {
        if (waktuTersisa <= 0) {
            clearInterval(timer);
            submitUjian();
        } else {
            waktuTersisa--;
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const menit = Math.floor(waktuTersisa / 60);
    const detik = waktuTersisa % 60;
    document.getElementById('timer').textContent = `${String(menit).padStart(2, '0')}:${String(detik).padStart(2, '0')}`;
    
    if (waktuTersisa <= 60) {
        document.getElementById('timer').style.color = '#ff4444';
    }
}

function displaySoal() {
    const container = document.getElementById('soalContainer');
    
    container.innerHTML = tugasData.soal.map((soal, index) => {
        // Parse soal (format: "1. Pertanyaan\nA. ...\nB. ...")
        const lines = soal.split('\n');
        const questionText = lines[0].replace(/^\d+\.\s*/, '');
        const options = lines.slice(1).filter(line => line.match(/^[A-D]\./));
        
        return `
            <div class="soal-item" id="soal-${index}">
                <div class="soal-text">
                    <strong>Soal ${index + 1}.</strong> ${questionText}
                </div>
                <div class="options">
                    ${options.map(opt => {
                        const letter = opt[0];
                        const text = opt.substring(3);
                        return `
                            <label class="option">
                                <input type="radio" name="soal${index}" value="${letter}" 
                                    ${jawaban[index] === letter ? 'checked' : ''}
                                    onchange="saveAnswer(${index}, '${letter}')">
                                <span><strong>${letter}.</strong> ${text}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function createSoalNav() {
    const nav = document.getElementById('soalNav');
    let buttons = '<div class="nav-buttons">';
    for (let i = 0; i < tugasData.jumlahSoal; i++) {
        buttons += `<button class="nav-btn" onclick="scrollToSoal(${i})">${i + 1}</button>`;
    }
    buttons += '</div>';
    nav.innerHTML = buttons;
    updateNavButtons();
}

function updateNavButtons() {
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach((btn, index) => {
        if (jawaban[index] !== null) {
            btn.classList.add('answered');
        } else {
            btn.classList.remove('answered');
        }
    });
}

function saveAnswer(soalIndex, jawabanValue) {
    jawaban[soalIndex] = jawabanValue;
    updateNavButtons();
    
    // Save to localStorage
    localStorage.setItem(`jawaban_${tugasId}_${studentData.nis}`, JSON.stringify(jawaban));
}

function scrollToSoal(index) {
    const element = document.getElementById(`soal-${index}`);
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function submitUjian() {
    if (timer) clearInterval(timer);
    
    // Calculate score
    let benar = 0;
    jawaban.forEach((jawab, index) => {
        const soalText = tugasData.soal[index];
        const lines = soalText.split('\n');
        const correctAnswer = lines[1] ? lines[1][0] : null;
        if (jawab === correctAnswer) benar++;
    });
    
    const nilai = Math.round((benar / tugasData.jumlahSoal) * 100);
    
    const submissionData = {
        tugasId: parseInt(tugasId),
        nama: studentData.nama,
        nis: studentData.nis,
        kelas: studentData.kelas,
        jawaban: jawaban,
        nilai: nilai,
        benar: benar,
        total: tugasData.jumlahSoal
    };
    
    try {
        await fetch('/api/jawaban', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData)
        });
        
        // Clear saved answers
        localStorage.removeItem(`jawaban_${tugasId}_${studentData.nis}`);
        
        alert(`🎉 Selamat! Anda telah menyelesaikan ujian.\nNilai Anda: ${nilai}\nBenar: ${benar}/${tugasData.jumlahSoal}`);
        window.location.href = '/';
    } catch (error) {
        console.error('Error submitting:', error);
        alert('Gagal menyimpan jawaban');
    }
}

document.getElementById('submitBtn')?.addEventListener('click', () => {
    if (confirm('Yakin ingin mengumpulkan ujian?')) {
        submitUjian();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', loadTugas);