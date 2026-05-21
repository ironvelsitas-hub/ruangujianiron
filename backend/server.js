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

// Untuk Vercel, gunakan /tmp untuk menyimpan data sementara
const DATA_DIR = '/tmp/ruang-ujian-data';
const TUGAS_FILE = path.join(DATA_DIR, 'tugas.json');
const JAWABAN_FILE = path.join(DATA_DIR, 'jawaban.json');

// Pastikan folder data ada (khusus untuk Vercel)
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
  try {
    const tugas = JSON.parse(fs.readFileSync(TUGAS_FILE, 'utf-8'));
    res.json(tugas);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/tugas', (req, res) => {
  try {
    const tugas = JSON.parse(fs.readFileSync(TUGAS_FILE, 'utf-8'));
    const newTugas = {
      id: Date.now(),
      ...req.body,
      tanggal: new Date().toISOString()
    };
    tugas.push(newTugas);
    fs.writeFileSync(TUGAS_FILE, JSON.stringify(tugas, null, 2));
    res.json({ success: true, tugas: newTugas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tugas/:id', (req, res) => {
  try {
    const tugas = JSON.parse(fs.readFileSync(TUGAS_FILE, 'utf-8'));
    const filtered = tugas.filter(t => t.id != req.params.id);
    fs.writeFileSync(TUGAS_FILE, JSON.stringify(filtered, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/jawaban', (req, res) => {
  try {
    const jawaban = JSON.parse(fs.readFileSync(JAWABAN_FILE, 'utf-8'));
    const newJawaban = {
      id: Date.now(),
      ...req.body,
      waktuSubmit: new Date().toISOString()
    };
    jawaban.push(newJawaban);
    fs.writeFileSync(JAWABAN_FILE, JSON.stringify(jawaban, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/jawaban/:tugasId', (req, res) => {
  try {
    const jawaban = JSON.parse(fs.readFileSync(JAWABAN_FILE, 'utf-8'));
    const filtered = jawaban.filter(j => j.tugasId == req.params.tugasId);
    res.json(filtered);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/jawaban/all', (req, res) => {
  try {
    const jawaban = JSON.parse(fs.readFileSync(JAWABAN_FILE, 'utf-8'));
    res.json(jawaban);
  } catch (error) {
    res.json([]);
  }
});

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Handle semua route untuk SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Export untuk Vercel
export default app;