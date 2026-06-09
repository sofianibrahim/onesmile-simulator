const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Database States
let iplBills = [
  { id: 'IPL-001', month: 'Juni 2026', type: 'Iuran Keamanan & Kebersihan', amount: 350000, status: 'Belum Bayar' },
  { id: 'IPL-002', month: 'Juni 2026', type: 'Pemakaian Air Bersih', amount: 185000, status: 'Belum Bayar' },
  { id: 'IPL-003', month: 'Mei 2026', type: 'Iuran Keamanan & Kebersihan', amount: 350000, status: 'Lunas' },
  { id: 'IPL-004', month: 'Mei 2026', type: 'Pemakaian Air Bersih', amount: 142000, status: 'Lunas' }
];

let complaints = [
  { id: 'CMP-201', title: 'Lampu jalan mati', category: 'Fasilitas Umum', date: '2026-06-08', status: 'Diproses', description: 'Lampu jalan di depan Cluster Foresta Block B3 mati sejak 2 hari yang lalu.' },
  { id: 'CMP-202', title: 'Genangan air setelah hujan', category: 'Infrastruktur', date: '2026-06-05', status: 'Selesai', description: 'Saluran air tersumbat menyebabkan genangan di persimpangan jalan utama cluster.' }
];

const cctvCameras = [
  { id: 'CCTV-01', name: 'Gerbang Utama Cluster', area: 'Foresta', status: 'Online', mockUrl: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-in-a-crossroad-of-a-big-city-40748-large.mp4' },
  { id: 'CCTV-02', name: 'Taman Bermain Anak', area: 'Foresta', status: 'Online', mockUrl: 'https://assets.mixkit.co/videos/preview/mixkit-children-playing-in-a-playground-43033-large.mp4' },
  { id: 'CCTV-03', name: 'Persimpangan Utama BSD', area: 'BSD Boulevard', status: 'Online', mockUrl: 'https://assets.mixkit.co/videos/preview/mixkit-intersection-with-cars-and-traffic-lights-in-city-41617-large.mp4' },
  { id: 'CCTV-04', name: 'Area Olahraga / Club House', area: 'The Breeze', status: 'Offline', mockUrl: '' }
];

// API Endpoints
app.get('/api/cctv', (req, res) => {
  res.json(cctvCameras);
});

app.get('/api/ipl', (req, res) => {
  res.json(iplBills);
});

app.post('/api/ipl/pay', (req, res) => {
  const { id } = req.body;
  const bill = iplBills.find(b => b.id === id);
  if (bill) {
    bill.status = 'Lunas';
    return res.json({ success: true, message: `Tagihan ${bill.type} berhasil dibayar!`, bills: iplBills });
  }
  res.status(404).json({ success: false, message: 'Tagihan tidak ditemukan' });
});

app.get('/api/complaints', (req, res) => {
  res.json(complaints);
});

app.post('/api/complaints', (req, res) => {
  const { title, category, description } = req.body;
  if (!title || !category || !description) {
    return res.status(400).json({ success: false, message: 'Harap lengkapi semua kolom!' });
  }
  const newComplaint = {
    id: `CMP-${Math.floor(100 + Math.random() * 900)}`,
    title,
    category,
    date: new Date().toISOString().split('T')[0],
    status: 'Terkirim',
    description
  };
  complaints.unshift(newComplaint);
  res.status(201).json({ success: true, message: 'Laporan berhasil terkirim!', complaints });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`OneSmile Mock API Server running on port ${PORT}`);
  });
}

module.exports = app;
