const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// DANH SÁCH API (16 GAME + BCR)
// ==========================================
const GAME_APIS = {
  'sunwin_tx': 'https://era-technology-particular-domestic.trycloudflare.com/api/tx',
  'lc79_tx': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/tx',
  'lc79_md5': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/txmd5',
  'betvip_tx': 'https://eve-hydrocodone-offshore-eagle.trycloudflare.com/api/tx',
  'betvip_md5': 'https://eve-hydrocodone-offshore-eagle.trycloudflare.com/api/txmd5',
  'club789_tx': 'https://venue-integrate-aged-heavily.trycloudflare.com/api/tx',
  'b52': 'https://flex-knights-agree-grass.trycloudflare.com/txmd5',
  'max789': 'https://deutschland-mandatory-upon-changelog.trycloudflare.com/api/tx',
  'luck8_md5': 'https://qld-incentives-tion-boost.trycloudflare.com/api/txmd5',
  'sumvin_md5': 'https://cricket-compressed-list-suppose.trycloudflare.com/api/md5',
  'gb68_thuong': 'https://description-zen-dog-films.trycloudflare.com/api/68/thuong',
  'gb68_md5': 'https://profiles-televisions-sic-stay.trycloudflare.com/api/68/md5',
  'alo_hitclub_md5': 'https://preference-assuming-picnic-concentration.trycloudflare.com/api/txmd5',
  'sunwin_sicbo': 'https://enquiries-indices-navigator-mega.trycloudflare.com/api/sunsicbo',
  'luck8_sicbo40': 'https://qld-incentives-tion-boost.trycloudflare.com/api/sicbo40',
  'lc79_xocdia': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/xocdia'
};

// ==========================================
// API BCR
// ==========================================
const BCR_BASE_URL = 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/';
const BCR_BANS = ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10'];

// Lưu trữ riêng cho BCR
const bcrHistory = {};
const bcrCache = {};
const bcrStats = {};

for (let ban of BCR_BANS) {
  bcrHistory[ban] = { data: [], ketQua: [] };
  bcrCache[ban] = new Map();
  bcrStats[ban] = { tong: 0, dung: 0, sai: 0, tiLe: '0%' };
}

// ==========================================
// LƯU TRỮ DỮ LIỆU TÀI XỈU
// ==========================================
const historyDB = {};
const cacheDB = {};
const statsDB = {};

for (let key in GAME_APIS) {
  historyDB[key] = { data: [], tongData: [], diceData: [] };
  cacheDB[key] = new Map();
  statsDB[key] = { tong: 0, dung: 0, sai: 0, tiLe: '0%' };
}

function updateStats(game, thucTe, duDoan) {
  const st = statsDB[game];
  if (!st || !thucTe || !duDoan) return;
  const dung = (thucTe === duDoan);
  if (dung) st.dung++;
  else st.sai++;
  st.tong++;
  st.tiLe = ((st.dung / st.tong) * 100).toFixed(1) + '%';
  console.log(`[${game}] Dự đoán: ${duDoan} | Thực tế: ${thucTe} | KQ: ${dung ? '✅' : '❌'} | TL: ${st.tiLe}`);
  return dung;
}

function updateBcrStats(ban, thucTe, duDoan) {
  const st = bcrStats[ban];
  if (!st || !thucTe || !duDoan) return;
  const dung = (thucTe === duDoan);
  if (dung) st.dung++;
  else st.sai++;
  st.tong++;
  st.tiLe = ((st.dung / st.tong) * 100).toFixed(1) + '%';
  console.log(`[BCR-${ban}] Dự đoán: ${duDoan} | Thực tế: ${thucTe} | KQ: ${dung ? '✅' : '❌'} | TL: ${st.tiLe}`);
  return dung;
}

// ==========================================
// FETCH DỮ LIỆU
// ==========================================
async function fetchGameData(url, gameKey) {
  try {
    const res = await axios.get(url, { timeout: 10000 });
    const data = res.data;
    if (!data) return null;
    
    if (gameKey === 'lc79_xocdia') {
      if (data.ket_qua_truyen_thong) {
        return { phien: data.phien, ket_qua: data.ket_qua_truyen_thong, dice: [], tong: null };
      }
      return null;
    }
    
    if (data.ket_qua) {
      let ketQua = data.ket_qua;
      if (ketQua === 'tài' || ketQua === 'TAI' || ketQua === 'Tài' || ketQua === 'TÀI') ketQua = 'Tài';
      else if (ketQua === 'xiu' || ketQua === 'XIU' || ketQua === 'Xỉu' || ketQua === 'XỈU') ketQua = 'Xỉu';
      else if (ketQua === 'Bão') ketQua = 'Bão';
      else return null;
      
      let phien = data.phien;
      if (gameKey === 'sunwin_sicbo') phien = parseInt(String(data.phien).replace('#', ''));
      if (gameKey === 'b52' && phien) phien = parseInt(String(phien).replace('#', ''));
      
      return { 
        phien, 
        ket_qua: ketQua, 
        dice: [data.xuc_xac_1, data.xuc_xac_2, data.xuc_xac_3], 
        tong: data.tong || (data.xuc_xac_1 + data.xuc_xac_2 + data.xuc_xac_3)
      };
    }
    return null;
  } catch (err) {
    console.error(`Lỗi fetch ${gameKey}:`, err.message);
    return null;
  }
}

// ==========================================
// FETCH BCR DATA
// ==========================================
async function fetchBcrData(ban) {
  try {
    const url = `${BCR_BASE_URL}${ban}`;
    const res = await axios.get(url, { timeout: 10000 });
    const data = res.data;
    if (!data) return null;
    
    // Lấy kết quả mới nhất
    let phien = data.phien || data.session || data.id || Date.now();
    let ketQua = data.ket_qua || data.result || '';
    let history = data.history || data.results || [];
    
    // Chuẩn hóa kết quả (Cái/Con/Hòa)
    if (ketQua === 'C' || ketQua === 'Cái' || ketQua === 'BANKER') ketQua = 'Cái';
    else if (ketQua === 'P' || ketQua === 'Con' || ketQua === 'PLAYER') ketQua = 'Con';
    else if (ketQua === 'T' || ketQua === 'Hòa' || ketQua === 'TIE') ketQua = 'Hòa';
    
    return { phien, ket_qua: ketQua, history, raw: data };
  } catch (err) {
    console.error(`Lỗi fetch BCR ${ban}:`, err.message);
    return null;
  }
}

// ==========================================
// THUẬT TOÁN BCR
// ==========================================
class BCRAlgorithm {
  constructor(ban) {
    this.ban = ban;
    this.name = `BCR-${ban}`;
  }
  
  // Phát hiện cầu bệt
  phatHienCauBet(lichSu) {
    if (lichSu.length < 3) return null;
    let streak = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[i-1]) streak++;
      else break;
    }
    if (streak >= 4) return { pred: lichSu[0] === "Cái" ? "Con" : "Cái", conf: 82, reason: `Bệt ${streak} - bẻ cầu` };
    if (streak === 3) return { pred: lichSu[0] === "Cái" ? "Con" : "Cái", conf: 72, reason: `Bệt 3 - chuẩn bị gãy` };
    return null;
  }
  
  // Phát hiện cầu 1-1
  phatHienCau1_1(lichSu) {
    if (lichSu.length < 5) return null;
    let zigzag = 0;
    for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
    if (zigzag >= 3) return { pred: lichSu[0] === "Cái" ? "Con" : "Cái", conf: 76, reason: "Cầu 1-1" };
    return null;
  }
  
  // Phân tích xu hướng 10 phiên
  phanTichXuHuong(lichSu) {
    if (lichSu.length < 10) return null;
    const last10 = lichSu.slice(0,10);
    const cai10 = last10.filter(r => r === "Cái").length;
    const con10 = last10.filter(r => r === "Con").length;
    if (cai10 >= 7) return { pred: "Con", conf: 78, reason: `Cái nóng ${cai10}/10 - bẻ Con` };
    if (con10 >= 7) return { pred: "Cái", conf: 78, reason: `Con nóng ${con10}/10 - bẻ Cái` };
    return null;
  }
  
  // Phát hiện cầu đối xứng
  phatHienCauDoiXung(lichSu) {
    if (lichSu.length < 8) return null;
    let isMirror = true;
    for (let i = 0; i < 3; i++) if (lichSu[i] !== lichSu[6-i]) { isMirror = false; break; }
    if (isMirror) return { pred: lichSu[3] === "Cái" ? "Con" : "Cái", conf: 74, reason: "Cầu đối xứng" };
    return null;
  }
  
  // Tổng hợp dự đoán
  tongHop(lichSu) {
    let diemCai = 0, diemCon = 0, soTT = 0;
    
    const b1 = this.phatHienCauBet(lichSu);
    if (b1) { soTT++; if (b1.pred === "Cái") diemCai += b1.conf; else diemCon += b1.conf; }
    
    const b2 = this.phatHienCau1_1(lichSu);
    if (b2) { soTT++; if (b2.pred === "Cái") diemCai += b2.conf; else diemCon += b2.conf; }
    
    const b3 = this.phanTichXuHuong(lichSu);
    if (b3) { soTT++; if (b3.pred === "Cái") diemCai += b3.conf; else diemCon += b3.conf; }
    
    const b4 = this.phatHienCauDoiXung(lichSu);
    if (b4) { soTT++; if (b4.pred === "Cái") diemCai += b4.conf; else diemCon += b4.conf; }
    
    if (soTT === 0) return null;
    
    const pred = diemCai > diemCon ? "Cái" : "Con";
    let conf = Math.abs(diemCai - diemCon) / (diemCai + diemCon) * 100;
    conf = Math.min(88, Math.max(55, conf));
    
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu) {
    if (lichSu.length < 5) {
      return { du_doan: "Cái", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu (cần 5 phiên)" };
    }
    
    const result = this.tongHop(lichSu);
    if (result) {
      return {
        du_doan: result.pred,
        do_tin_cay: result.conf,
        giai_thich: `${result.soTT} thuật toán BCR tổng hợp`
      };
    }
    
    const last3 = lichSu.slice(0, 3);
    const cai3 = last3.filter(r => r === "Cái").length;
    return {
      du_doan: cai3 >= 2 ? "Cái" : "Con",
      do_tin_cay: 60,
      giai_thich: `Xu hướng 3 phiên (${cai3}C-${3-cai3}N)`
    };
  }
}

// Khởi tạo algorithm cho từng bàn BCR
const bcrAlgorithms = {};
for (let ban of BCR_BANS) {
  bcrAlgorithms[ban] = new BCRAlgorithm(ban);
}

// ==========================================
// XỬ LÝ REQUEST BCR
// ==========================================
async function xuLyBcrBan(ban) {
  const data = await fetchBcrData(ban);
  if (!data) throw new Error(`Không lấy được dữ liệu bàn ${ban}`);
  if (!data.ket_qua) throw new Error(`Bàn ${ban} chưa có kết quả`);
  
  const hist = bcrHistory[ban];
  const lastPred = bcrCache[ban].get(data.phien - 1);
  
  if (lastPred && lastPred.prediction !== undefined) {
    updateBcrStats(ban, data.ket_qua, lastPred.prediction);
    lastPred.actual = data.ket_qua;
    lastPred.isCorrect = (data.ket_qua === lastPred.prediction);
  }
  
  // Cập nhật lịch sử
  hist.data.unshift(data.ket_qua);
  if (hist.data.length > 200) hist.data.pop();
  
  // Nếu có lịch sử từ API thì lưu thêm
  if (data.history && data.history.length > 0) {
    for (let h of data.history.slice(0, 50)) {
      let result = h;
      if (result === 'C' || result === 'BANKER') result = 'Cái';
      else if (result === 'P' || result === 'PLAYER') result = 'Con';
      else if (result === 'T' || result === 'TIE') result = 'Hòa';
      if (result === 'Cái' || result === 'Con') {
        if (!hist.ketQua.includes(result)) hist.ketQua.unshift(result);
      }
    }
  }
  
  // Cache - F5 không đổi
  if (bcrCache[ban].has(data.phien)) {
    const cached = bcrCache[ban].get(data.phien);
    return {
      ban: ban,
      phienHienTai: data.phien,
      ketQuaTruoc: data.ket_qua,
      duDoan: {
        phien: data.phien + 1,
        du_doan: cached.prediction,
        do_tin_cay: cached.confidence + '%',
        giai_thich: cached.reason
      },
      thongKe: bcrStats[ban]
    };
  }
  
  // Dự đoán
  const algo = bcrAlgorithms[ban];
  const prediction = algo.predict(hist.data);
  
  bcrCache[ban].set(data.phien, {
    prediction: prediction.du_doan,
    confidence: prediction.do_tin_cay,
    reason: prediction.giai_thich
  });
  
  if (bcrCache[ban].size > 20) {
    const firstKey = bcrCache[ban].keys().next().value;
    bcrCache[ban].delete(firstKey);
  }
  
  return {
    ban: ban,
    phienHienTai: data.phien,
    ketQuaTruoc: data.ket_qua,
    lichSuGanDay: hist.data.slice(0, 10),
    duDoan: {
      phien: data.phien + 1,
      du_doan: prediction.du_doan,
      do_tin_cay: prediction.do_tin_cay + '%',
      giai_thich: prediction.giai_thich
    },
    thongKe: bcrStats[ban]
  };
}

// ==========================================
// XỬ LÝ REQUEST TÀI XỈU (GIỮ NGUYÊN)
// ==========================================
// ... (giữ nguyên code Tài Xỉu từ các file trước)

// ==========================================
// TẠO ENDPOINTS
// ==========================================

// Endpoints cho Tài Xỉu (giữ nguyên)
for (let gameKey in GAME_APIS) {
  const endpoint = `/${gameKey.replace(/_/g, '/')}`;
  app.get(endpoint, async (req, res) => {
    try {
      const result = await xuLyGame(gameKey); // Hàm xuLyGame cũ
      res.json({ game: gameKey.toUpperCase(), ...result, author: '@tranhoang2286' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// Endpoint BCR - 1 bàn cụ thể
app.get('/bcr/:ban', async (req, res) => {
  const ban = req.params.ban.toUpperCase();
  if (!BCR_BANS.includes(ban)) {
    return res.status(400).json({ error: 'Bàn không hợp lệ', ds_ban: BCR_BANS });
  }
  try {
    const result = await xuLyBcrBan(ban);
    res.json({ game: 'BCR', ...result, author: '@tranhoang2286' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint BCR - tất cả các bàn
app.get('/bcr/all', async (req, res) => {
  const results = {};
  for (let ban of BCR_BANS) {
    try {
      const result = await xuLyBcrBan(ban);
      results[ban] = {
        phien: result.phienHienTai,
        ketQuaTruoc: result.ketQuaTruoc,
        duDoan: result.duDoan,
        thongKe: result.thongKe
      };
    } catch (err) {
      results[ban] = { error: err.message };
    }
  }
  res.json({ game: 'BCR', all_bans: results, author: '@tranhoang2286' });
});

// Endpoint BCR - danh sách bàn
app.get('/bcr/bans', (req, res) => {
  res.json({ game: 'BCR', ds_ban: BCR_BANS, total: BCR_BANS.length, author: '@tranhoang2286' });
});

// Endpoint lịch sử BCR
app.get('/bcr/lich-su/:ban', (req, res) => {
  const ban = req.params.ban.toUpperCase();
  if (!BCR_BANS.includes(ban)) {
    return res.status(400).json({ error: 'Bàn không hợp lệ', ds_ban: BCR_BANS });
  }
  res.json({
    ban,
    lichSu: bcrHistory[ban].data.slice(0, 30).map((v, i) => ({ stt: i + 1, ket_qua: v })),
    thongKe: bcrStats[ban]
  });
});

// Endpoint tổng quan lịch sử
app.get('/lich-su', (req, res) => {
  const allStats = {};
  for (let key in GAME_APIS) allStats[key] = statsDB[key];
  for (let ban of BCR_BANS) allStats[`bcr_${ban}`] = bcrStats[ban];
  res.json({ thong_ke_tat_ca_game: allStats, tong_so_game: Object.keys(GAME_APIS).length + BCR_BANS.length });
});

// Root
app.get('/', (req, res) => {
  res.json({
    name: '🏆 16 GAME TÀI XỈU + 10 BÀN BCR - 26 THUẬT TOÁN RIÊNG 🏆',
    author: '@tranhoang2286',
    version: '17.0',
    endpoints: {
      'Tài Xỉu (16 game)': Object.keys(GAME_APIS).map(k => `/${k.replace(/_/g, '/')}`),
      'BCR danh sách bàn': '/bcr/bans',
      'BCR 1 bàn': '/bcr/:ban (C01-C10)',
      'BCR tất cả': '/bcr/all',
      'BCR lịch sử': '/bcr/lich-su/:ban',
      'Lịch sử tổng hợp': '/lich-su'
    }
  });
});

// Hàm xuLyGame cũ (cần giữ nguyên từ code trước)
// ... (phần code Tài Xỉu đã có)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏆 16 GAME TÀI XỈU + 10 BÀN BCR - PORT ${PORT}`);
  console.log(`✅ BCR: ${BCR_BANS.join(', ')}`);
});
