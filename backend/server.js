import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files dari folder frontend
app.use(express.static(path.join(__dirname, '../frontend')));

const DATA_DIR = path.join(__dirname, 'data');
const TUGAS_FILE = path.join(DATA_DIR, 'tugas.json');
const JAWABAN_FILE = path.join(DATA_DIR, 'jawaban.json');

// Pastikan folder data ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inisialisasi file jika belum ada
if (!fs.existsSync(TUGAS_FILE)) {
  fs.writeFileSync(TUGAS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(JAWABAN_FILE)) {
  fs.writeFileSync(JAWABAN_FILE, JSON.stringify([]));
}

// Routes API
app.get('/api/tugas', (req, res) => {
  const tugas = JSON.parse(fs.readFileSync(TUGAS_FILE, 'utf-8'));
  res.json(tugas);
});

app.post('/api/tugas', (req, res) => {
  const tugas = JSON.parse(fs.readFileSync(TUGAS_FILE, 'utf-8'));
  const newTugas = {
    id: Date.now(),
    ...req.body,
    tanggal: new Date().toISOString()
  };
  tugas.push(newTugas);
  fs.writeFileSync(TUGAS_FILE, JSON.stringify(tugas, null, 2));
  res.json({ success: true, tugas: newTugas });
});

app.delete('/api/tugas/:id', (req, res) => {
  const tugas = JSON.parse(fs.readFileSync(TUGAS_FILE, 'utf-8'));
  const filtered = tugas.filter(t => t.id != req.params.id);
  fs.writeFileSync(TUGAS_FILE, JSON.stringify(filtered, null, 2));
  res.json({ success: true });
});

app.post('/api/jawaban', (req, res) => {
  const jawaban = JSON.parse(fs.readFileSync(JAWABAN_FILE, 'utf-8'));
  const newJawaban = {
    id: Date.now(),
    ...req.body,
    waktuSubmit: new Date().toISOString()
  };
  jawaban.push(newJawaban);
  fs.writeFileSync(JAWABAN_FILE, JSON.stringify(jawaban, null, 2));
  res.json({ success: true });
});

app.get('/api/jawaban/:tugasId', (req, res) => {
  const jawaban = JSON.parse(fs.readFileSync(JAWABAN_FILE, 'utf-8'));
  const filtered = jawaban.filter(j => j.tugasId == req.params.tugasId);
  res.json(filtered);
});

app.get('/api/jawaban/all', (req, res) => {
  const jawaban = JSON.parse(fs.readFileSync(JAWABAN_FILE, 'utf-8'));
  res.json(jawaban);
});

// Route untuk halaman utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Route untuk halaman dashboard
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// Route untuk halaman ujian
app.get('/ujian.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/ujian.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Buka browser dan akses: http://localhost:${PORT}`);
});

export default app;