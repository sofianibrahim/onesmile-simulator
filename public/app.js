// ─────────────────────────────────────────────────────────────
// ONE SMILE SIMULATOR - INTERACTIVE JAVASCRIPT SYSTEM
// ─────────────────────────────────────────────────────────────

// State Management
let state = {
  currentTab: 'pageHome',
  isLoggedIn: false,
  userPhone: '',
  iplBills: [],
  complaints: [],
  cctvList: [],
  activeCctvId: 'CCTV-01'
};

// DOM Elements
const body = document.body;
const phoneDevice = document.getElementById('phoneDevice');
const phoneNotch = document.getElementById('phoneNotch');
const phoneNavBar = document.getElementById('phoneNavBar');
const statusTime = document.getElementById('statusTime');
const userDisplayPhone = document.getElementById('userDisplayPhone');
const logsContainer = document.getElementById('logsContainer');

// Control Buttons
const toggleThemeBtn = document.getElementById('toggleThemeBtn');
const toggleNotchBtn = document.getElementById('toggleNotchBtn');
const resetDemoBtn = document.getElementById('resetDemoBtn');

// Pages
const pages = {
  pageSplash: document.getElementById('pageSplash'),
  pageLogin: document.getElementById('pageLogin'),
  pageHome: document.getElementById('pageHome'),
  pageCctv: document.getElementById('pageCctv'),
  pageIpl: document.getElementById('pageIpl'),
  pageLapor: document.getElementById('pageLapor')
};

// ─────────────────────────────────────────────────────────────
// LOGS & UTILITIES
// ─────────────────────────────────────────────────────────────

function addLog(message, type = 'action') {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `[${timeStr}] ${message}`;
  logsContainer.appendChild(entry);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  statusTime.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

// Toast Alert
function showToast(message, isSuccess = true) {
  const toast = document.getElementById('toastNotification');
  const toastIcon = toast.querySelector('.toast-icon');
  const toastMsg = toast.querySelector('.toast-message');

  toastMsg.textContent = message;
  if (isSuccess) {
    toastIcon.className = 'fa-solid fa-circle-check toast-icon';
    toastIcon.style.color = '#10b981';
  } else {
    toastIcon.className = 'fa-solid fa-circle-xmark toast-icon';
    toastIcon.style.color = '#ef4444';
  }

  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// ─────────────────────────────────────────────────────────────
// ROUTING / NAVIGATION
// ─────────────────────────────────────────────────────────────

function navigateTo(pageId) {
  addLog(`Navigasi ke halaman: <strong>${pageId.replace('page', '')}</strong>`, 'system');
  
  // Hide all pages
  Object.values(pages).forEach(page => {
    page.classList.remove('active');
  });

  // Show target page
  pages[pageId].classList.add('active');
  
  // Manage Bottom Nav active state
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.dataset.page === pageId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Handle bottom navigation visibility
  if (pageId === 'pageSplash' || pageId === 'pageLogin') {
    phoneNavBar.classList.add('hidden');
  } else {
    phoneNavBar.classList.remove('hidden');
  }

  // Page Specific Inits
  if (pageId === 'pageCctv') {
    initCctvPage();
  } else if (pageId === 'pageIpl') {
    loadIplBills();
  } else if (pageId === 'pageLapor') {
    loadComplaints();
  }
}

// Bottom navigation clicks
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const pageId = item.dataset.page;
    navigateTo(pageId);
  });
});

// Home Page menu item clicks
document.getElementById('menuIpl').addEventListener('click', () => navigateTo('pageIpl'));
document.getElementById('menuCctv').addEventListener('click', () => navigateTo('pageCctv'));
document.getElementById('menuLapor').addEventListener('click', () => navigateTo('pageLapor'));
document.getElementById('menuBsdlink').addEventListener('click', () => {
  addLog('Mengetuk menu BSD Link: Rute bus tidak tersedia secara lokal.', 'action');
  showToast('Fitur BSD Link hanya tersedia di SDK asli', false);
});

// Back buttons
document.querySelectorAll('.back-to-home-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    navigateTo('pageHome');
  });
});

// ─────────────────────────────────────────────────────────────
// LOGIN & OTP SIMULATION
// ─────────────────────────────────────────────────────────────

const loginForm = document.getElementById('loginForm');
const phoneNumberInput = document.getElementById('phoneNumber');
const otpSection = document.getElementById('otpSection');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const resendOtpLink = document.getElementById('resendOtpLink');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const phone = phoneNumberInput.value.trim();
  if (phone.length < 9) {
    showToast('Nomor HP tidak valid!', false);
    return;
  }
  state.userPhone = `+62 ${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  addLog(`OTP dikirim ke nomor <strong>+62 ${phone}</strong>`, 'action');
  showToast('Kode OTP terkirim! (Gunakan 1234)');
  
  // Toggle UI
  loginForm.querySelector('.submit-btn').classList.add('hidden');
  otpSection.classList.remove('hidden');
  
  // Auto-focus OTP inputs
  document.querySelectorAll('.otp-box')[0].focus();
});

// OTP inputs auto-advance
document.querySelectorAll('.otp-box').forEach((box, idx, boxes) => {
  box.addEventListener('input', (e) => {
    if (box.value.length === 1 && idx < boxes.length - 1) {
      boxes[idx + 1].focus();
    }
  });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && box.value.length === 0 && idx > 0) {
      boxes[idx - 1].focus();
    }
  });
});

verifyOtpBtn.addEventListener('click', () => {
  let otp = '';
  document.querySelectorAll('.otp-box').forEach(box => otp += box.value);
  
  if (otp.length < 4) {
    showToast('Masukkan 4 digit OTP!', false);
    return;
  }
  
  addLog(`Verifikasi OTP: <strong>${otp}</strong>`, 'action');
  
  // Accept any OTP but log success
  state.isLoggedIn = true;
  userDisplayPhone.textContent = state.userPhone;
  showToast('Login Berhasil!');
  addLog('Pengguna berhasil masuk ke Dashboard OneSmile.', 'action');
  
  // Transition
  navigateTo('pageHome');
});

resendOtpLink.addEventListener('click', (e) => {
  e.preventDefault();
  addLog('OTP dikirim ulang.', 'action');
  showToast('OTP dikirim ulang ke nomor Anda!');
});

// ─────────────────────────────────────────────────────────────
// CCTV BSD FUNCTIONALITY
// ─────────────────────────────────────────────────────────────

const cctvVideoPlayer = document.getElementById('cctvVideoPlayer');
const cctvStatusOverlay = document.getElementById('cctvStatusOverlay');
const cctvHudName = document.getElementById('cctvHudName');
const cctvHudTime = document.getElementById('cctvHudTime');

async function initCctvPage() {
  try {
    addLog('Mengambil daftar kamera CCTV...', 'system');
    const res = await fetch('/api/cctv');
    const data = await res.json();
    state.cctvList = data;
    renderCctvList();
    playCctv(state.activeCctvId);
  } catch (err) {
    addLog('Gagal memuat CCTV dari server lokal.', 'error');
  }
}

function renderCctvList() {
  const list = document.getElementById('cctvList');
  list.innerHTML = '';
  state.cctvList.forEach(cam => {
    const item = document.createElement('div');
    item.className = `cctv-item ${cam.id === state.activeCctvId ? 'active' : ''}`;
    item.innerHTML = `
      <div class="cctv-item-left">
        <div class="cctv-thumb-icon"><i class="fa-solid fa-video"></i></div>
        <div class="cctv-item-info">
          <h4>${cam.name}</h4>
          <span>${cam.area}</span>
        </div>
      </div>
      <span class="cctv-status ${cam.status.toLowerCase()}">${cam.status}</span>
    `;
    item.addEventListener('click', () => {
      if (cam.status === 'Offline') {
        showToast('Kamera offline!', false);
        addLog(`CCTV offline: <strong>${cam.name}</strong>`, 'error');
        return;
      }
      state.activeCctvId = cam.id;
      document.querySelectorAll('.cctv-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      playCctv(cam.id);
    });
    list.appendChild(item);
  });
}

const cctvCanvasPlayer = document.getElementById('cctvCanvasPlayer');
let canvasAnimationId = null;

function startCanvasSimulation(camName) {
  if (canvasAnimationId) {
    cancelAnimationFrame(canvasAnimationId);
  }
  
  cctvCanvasPlayer.width = 640;
  cctvCanvasPlayer.height = 360;
  const ctx = cctvCanvasPlayer.getContext('2d');
  
  let vehicles = [
    { x: 50, y: 250, speed: 2, color: 'rgba(245, 158, 11, 0.7)', size: 20 },
    { x: 400, y: 250, speed: 1.5, color: 'rgba(14, 165, 233, 0.7)', size: 18 },
    { x: 200, y: 220, speed: -1, color: 'rgba(255, 255, 255, 0.6)', size: 15 }
  ];

  function drawFrame() {
    if (cctvCanvasPlayer.classList.contains('hidden')) return;

    const w = cctvCanvasPlayer.width;
    const h = cctvCanvasPlayer.height;
    
    // Background Dark Slate
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    
    // Grid overlay / Road lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    
    // Draw Simulated Road
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h);
    ctx.lineTo(w * 0.45, h * 0.4);
    ctx.lineTo(w * 0.55, h * 0.4);
    ctx.lineTo(w * 0.9, h);
    ctx.fill();
    
    // Road center line
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h);
    ctx.lineTo(w * 0.5, h * 0.4);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Update and draw vehicles
    vehicles.forEach(v => {
      v.x += v.speed;
      if (v.speed > 0 && v.x > w + 20) v.x = -20;
      if (v.speed < 0 && v.x < -20) v.x = w + 20;
      
      const scale = 0.3 + (v.y / h) * 0.7;
      const width = v.size * scale;
      const height = (v.size * 0.6) * scale;
      
      ctx.fillStyle = v.color;
      ctx.fillRect(v.x - width/2, v.y - height/2, width, height);
    });

    // Draw CCTV Viewfinder Corners
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    const pad = 24;
    const len = 15;
    
    // Top Left
    ctx.beginPath(); ctx.moveTo(pad, pad + len); ctx.lineTo(pad, pad); ctx.lineTo(pad + len, pad); ctx.stroke();
    // Top Right
    ctx.beginPath(); ctx.moveTo(w - pad, pad + len); ctx.lineTo(w - pad, pad); ctx.lineTo(w - pad - len, pad); ctx.stroke();
    // Bottom Left
    ctx.beginPath(); ctx.moveTo(pad, h - pad - len); ctx.lineTo(pad, h - pad); ctx.lineTo(pad + len, h - pad); ctx.stroke();
    // Bottom Right
    ctx.beginPath(); ctx.moveTo(w - pad, h - pad - len); ctx.lineTo(w - pad, h - pad); ctx.lineTo(w - pad - len, h - pad); ctx.stroke();

    // Blink REC indicator
    if (Math.floor(Date.now() / 600) % 2 === 0) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(pad + 15, pad + 25, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('REC', pad + 26, pad + 29);
    }
    
    // Text overlay: Cam Name & Info
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px monospace';
    ctx.fillText(`CAM: ${camName.toUpperCase()}`, pad + 10, h - pad - 20);
    ctx.fillText('FPS: 30.0 | ISO: 400 | MODE: OFFLINE SIMULATION', pad + 10, h - pad - 8);

    // Scanlines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < h; i += 3) {
      ctx.fillRect(0, i, w, 1);
    }
    
    // Grain
    if (Math.random() < 0.1) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, Math.random() * h, w, Math.random() * 3);
    }

    canvasAnimationId = requestAnimationFrame(drawFrame);
  }
  
  drawFrame();
}

function playCctv(camId) {
  const cam = state.cctvList.find(c => c.id === camId);
  if (!cam) return;

  addLog(`Memutar CCTV: <strong>${cam.name}</strong>`, 'action');
  
  // Reset players visibility
  cctvCanvasPlayer.classList.add('hidden');
  cctvVideoPlayer.classList.remove('hidden');
  if (canvasAnimationId) {
    cancelAnimationFrame(canvasAnimationId);
  }
  
  // Show spinner overlay
  cctvStatusOverlay.classList.remove('hidden');
  cctvStatusOverlay.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><p>Menghubungkan Stream...</p>';
  cctvHudName.textContent = cam.name;

  cctvVideoPlayer.src = cam.mockUrl;
  
  cctvVideoPlayer.oncanplay = () => {
    cctvStatusOverlay.classList.add('hidden');
  };

  cctvVideoPlayer.onerror = () => {
    // Hide video, show canvas simulation
    cctvVideoPlayer.classList.add('hidden');
    cctvCanvasPlayer.classList.remove('hidden');
    cctvStatusOverlay.classList.add('hidden'); // Hide loading overlay
    
    addLog(`CCTV: Gagal memuat stream video. Mengaktifkan simulasi grafis offline untuk <strong>${cam.name}</strong>`, 'system');
    startCanvasSimulation(cam.name);
  };
}

// Update CCTV HUD Clock
setInterval(() => {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  cctvHudTime.textContent = `LIVE ${timeStr}`;
}, 1000);

// ─────────────────────────────────────────────────────────────
// IPL BILLING FUNCTIONALITY
// ─────────────────────────────────────────────────────────────

const iplBillsList = document.getElementById('iplBillsList');
let currentIplTab = 'unpaid';

async function loadIplBills() {
  try {
    const res = await fetch('/api/ipl');
    state.iplBills = await res.json();
    renderIplBills();
  } catch (err) {
    addLog('Gagal memuat tagihan IPL dari server.', 'error');
  }
}

function renderIplBills() {
  iplBillsList.innerHTML = '';
  const filtered = state.iplBills.filter(bill => {
    return currentIplTab === 'unpaid' ? bill.status === 'Belum Bayar' : bill.status === 'Lunas';
  });

  if (filtered.length === 0) {
    iplBillsList.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--phone-text-muted);">
        <i class="fa-solid fa-receipt" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
        <p style="font-size: 13px; font-weight: 500;">Tidak ada tagihan dalam kategori ini</p>
      </div>
    `;
    return;
  }

  filtered.forEach(bill => {
    const card = document.createElement('div');
    card.className = 'bill-card';
    
    const isUnpaid = bill.status === 'Belum Bayar';
    const badgeClass = isUnpaid ? 'unpaid' : 'paid';
    
    card.innerHTML = `
      <div class="bill-card-header">
        <h4>${bill.type}</h4>
        <span class="bill-status-badge ${badgeClass}">${bill.status}</span>
      </div>
      <div class="bill-details">
        <div class="bill-meta">
          <span class="bill-month">Periode: ${bill.month}</span>
          <span class="bill-amount">Rp ${bill.amount.toLocaleString('id-ID')}</span>
        </div>
        ${isUnpaid ? `<button class="pay-bill-btn" data-id="${bill.id}">Bayar Sekarang</button>` : ''}
      </div>
    `;

    if (isUnpaid) {
      card.querySelector('.pay-bill-btn').addEventListener('click', async () => {
        addLog(`Memproses pembayaran tagihan: <strong>${bill.type} (${bill.id})</strong>`, 'action');
        try {
          const payRes = await fetch('/api/ipl/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: bill.id })
          });
          const result = await payRes.json();
          if (result.success) {
            state.iplBills = result.bills;
            addLog(`Pembayaran Berhasil: <strong>${bill.type}</strong> senilai Rp ${bill.amount.toLocaleString('id-ID')}`, 'action');
            showToast('Tagihan berhasil dibayar!');
            renderIplBills();
          }
        } catch (err) {
          showToast('Gagal memproses pembayaran!', false);
        }
      });
    }
    
    iplBillsList.appendChild(card);
  });
}

// Tab Switching for IPL
document.querySelectorAll('.ipl-tabs .tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.ipl-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentIplTab = btn.dataset.status;
    renderIplBills();
  });
});

// ─────────────────────────────────────────────────────────────
// COMPLAINTS / REPORTING FUNCTIONALITY
// ─────────────────────────────────────────────────────────────

const complaintForm = document.getElementById('complaintForm');
const complaintsList = document.getElementById('complaintsList');
const toggleNewLapor = document.getElementById('toggleNewLapor');
const toggleListLapor = document.getElementById('toggleListLapor');
const laporFormView = document.getElementById('laporFormView');
const laporListView = document.getElementById('laporListView');

async function loadComplaints() {
  try {
    const res = await fetch('/api/complaints');
    state.complaints = await res.json();
    renderComplaints();
  } catch (err) {
    addLog('Gagal memuat daftar aduan dari server.', 'error');
  }
}

function renderComplaints() {
  complaintsList.innerHTML = '';
  if (state.complaints.length === 0) {
    complaintsList.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--phone-text-muted);">
        <i class="fa-solid fa-folder-open" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
        <p style="font-size: 13px; font-weight: 500;">Anda belum memiliki riwayat laporan</p>
      </div>
    `;
    return;
  }

  state.complaints.forEach(item => {
    const card = document.createElement('div');
    card.className = 'complaint-card';
    const statusClass = item.status.toLowerCase();
    
    card.innerHTML = `
      <div class="complaint-header">
        <div class="complaint-header-info">
          <span class="complaint-id">${item.id}</span>
          <h4 class="complaint-title">${item.title}</h4>
        </div>
        <span class="complaint-status ${statusClass}">${item.status}</span>
      </div>
      <p class="complaint-body">${item.description}</p>
      <div class="complaint-footer">
        <span>Kategori: <strong>${item.category}</strong></span>
        <span>${item.date}</span>
      </div>
    `;
    complaintsList.appendChild(card);
  });
}

// Switch between Form and List tabs
toggleNewLapor.addEventListener('click', () => {
  toggleNewLapor.classList.add('active');
  toggleListLapor.classList.remove('active');
  laporFormView.classList.remove('hidden');
  laporListView.classList.add('hidden');
});

toggleListLapor.addEventListener('click', () => {
  toggleListLapor.classList.add('active');
  toggleNewLapor.classList.remove('active');
  laporListView.classList.remove('hidden');
  laporFormView.classList.add('hidden');
  renderComplaints();
});

complaintForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('complaintTitle').value.trim();
  const category = document.getElementById('complaintCategory').value;
  const description = document.getElementById('complaintDesc').value.trim();
  
  addLog(`Mengirim pengaduan: <strong>"${title}"</strong>`, 'action');
  
  try {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, description })
    });
    const result = await res.json();
    if (result.success) {
      state.complaints = result.complaints;
      addLog(`Laporan Terkirim: ID <strong>${state.complaints[0].id}</strong>`, 'action');
      showToast('Laporan berhasil dikirim!');
      
      // Reset form
      complaintForm.reset();
      
      // Switch to list view
      toggleListLapor.click();
    }
  } catch (err) {
    showToast('Gagal mengirim laporan', false);
  }
});

// ─────────────────────────────────────────────────────────────
// SIDEBAR CONTROL BUTTONS PANEL
// ─────────────────────────────────────────────────────────────

// Light/Dark Theme Switcher
toggleThemeBtn.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    body.removeAttribute('data-theme');
    toggleThemeBtn.innerHTML = '<i class="fa-solid fa-moon"></i> Ganti Tema Gelap';
    addLog('Ganti ke <strong>Tema Terang</strong>', 'system');
  } else {
    body.setAttribute('data-theme', 'dark');
    toggleThemeBtn.innerHTML = '<i class="fa-solid fa-sun"></i> Ganti Tema Terang';
    addLog('Ganti ke <strong>Tema Gelap</strong>', 'system');
  }
});

// Hide/Show notch
toggleNotchBtn.addEventListener('click', () => {
  if (phoneNotch.classList.contains('hidden-notch')) {
    phoneNotch.classList.remove('hidden-notch');
    toggleNotchBtn.innerHTML = '<i class="fa-solid fa-mobile-screen-button"></i> Sembunyikan Notch';
    addLog('Menampilkan Notch telepon', 'system');
  } else {
    phoneNotch.classList.add('hidden-notch');
    toggleNotchBtn.innerHTML = '<i class="fa-solid fa-mobile-screen-button"></i> Tampilkan Notch';
    addLog('Menyembunyikan Notch telepon', 'system');
  }
});

// Reset Demo Simulation
resetDemoBtn.addEventListener('click', () => {
  addLog('Simulasi di-reset kembali ke Splash Screen.', 'system');
  showToast('Simulasi Berhasil Direset!');
  
  // Clear states
  state.isLoggedIn = false;
  state.userPhone = '';
  document.getElementById('phoneNumber').value = '';
  otpSection.classList.add('hidden');
  loginForm.querySelector('.submit-btn').classList.remove('hidden');
  
  // Clear OTP boxes
  document.querySelectorAll('.otp-box').forEach(box => box.value = '');
  
  // Re-run Splash sequence
  runSplashSequence();
});

// ─────────────────────────────────────────────────────────────
// INITIALIZATION FLOW
// ─────────────────────────────────────────────────────────────

function runSplashSequence() {
  navigateTo('pageSplash');
  setTimeout(() => {
    navigateTo('pageLogin');
  }, 2500);
}

// Trigger initial start
runSplashSequence();
