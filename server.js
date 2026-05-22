const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// DANH SÁCH API (16 GAME)
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
// API BCR - TỰ ĐỘNG QUÉT BÀN CÓ DỮ LIỆU
// ==========================================
const BCR_BASE_URL = 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/';
const ALL_BANS = ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10'];

// Lưu trữ BCR
const bcrHistory = {};
const bcrCache = {};
const bcrStats = {};
const bcrActiveBans = new Set(); // Chỉ lưu bàn có dữ liệu

for (let ban of ALL_BANS) {
  bcrHistory[ban] = { data: [] };
  bcrCache[ban] = new Map();
  bcrStats[ban] = { tong: 0, dung: 0, sai: 0, tiLe: '0%', active: false };
}

// ==========================================
// LƯU TRỮ TÀI XỈU
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
  st.active = true;
  console.log(`[BCR-${ban}] Dự đoán: ${duDoan} | Thực tế: ${thucTe} | KQ: ${dung ? '✅' : '❌'} | TL: ${st.tiLe}`);
  return dung;
}

// ==========================================
// FETCH DỮ LIỆU TÀI XỈU (GIỮ NGUYÊN)
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
// FETCH BCR DATA - KIỂM TRA KỸ LƯỠNG
// ==========================================
async function fetchBcrData(ban) {
  try {
    const url = `${BCR_BASE_URL}${ban}`;
    const res = await axios.get(url, { timeout: 10000 });
    const data = res.data;
    if (!data) return null;
    
    // TH1: Dữ liệu có sẵn ket_qua
    if (data.ket_qua) {
      let ketQua = data.ket_qua;
      if (ketQua === 'C' || ketQua === 'Cái' || ketQua === 'BANKER') ketQua = 'Cái';
      else if (ketQua === 'P' || ketQua === 'Con' || ketQua === 'PLAYER') ketQua = 'Con';
      else if (ketQua === 'T' || ketQua === 'Hòa' || ketQua === 'TIE') ketQua = 'Hòa';
      else return null;
      
      let phien = data.phien || data.session || data.id || Date.now();
      return { phien, ket_qua: ketQua, history: data.history || data.results || [] };
    }
    
    // TH2: Dữ liệu dạng mảng lịch sử
    if (data.history && data.history.length > 0) {
      const lastResult = data.history[0];
      let ketQua = lastResult;
      if (ketQua === 'C' || ketQua === 'Cái' || ketQua === 'BANKER') ketQua = 'Cái';
      else if (ketQua === 'P' || ketQua === 'Con' || ketQua === 'PLAYER') ketQua = 'Con';
      else if (ketQua === 'T' || ketQua === 'Hòa' || ketQua === 'TIE') ketQua = 'Hòa';
      else return null;
      
      let phien = data.phien || data.session || data.id || Date.now();
      return { phien, ket_qua: ketQua, history: data.history };
    }
    
    // TH3: Dữ liệu có result
    if (data.result) {
      let ketQua = data.result;
      if (ketQua === 'C' || ketQua === 'Cái' || ketQua === 'BANKER') ketQua = 'Cái';
      else if (ketQua === 'P' || ketQua === 'Con' || ketQua === 'PLAYER') ketQua = 'Con';
      else if (ketQua === 'T' || ketQua === 'Hòa' || ketQua === 'TIE') ketQua = 'Hòa';
      else return null;
      
      let phien = data.phien || data.session || data.id || Date.now();
      return { phien, ket_qua: ketQua, history: data.history || [] };
    }
    
    // Không có dữ liệu hợp lệ
    return null;
  } catch (err) {
    if (err.response?.status === 400 || err.response?.status === 404) {
      console.log(`[BCR] Bàn ${ban} không có dữ liệu hoặc chưa mở`);
    } else {
      console.error(`Lỗi fetch BCR ${ban}:`, err.message);
    }
    return null;
  }
}

// ==========================================
// THUẬT TOÁN BCR
// ==========================================
class BCRAlgorithm {
  constructor(ban) { this.ban = ban; }
  
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
  
  phatHienCau1_1(lichSu) {
    if (lichSu.length < 5) return null;
    let zigzag = 0;
    for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
    if (zigzag >= 3) return { pred: lichSu[0] === "Cái" ? "Con" : "Cái", conf: 76, reason: "Cầu 1-1" };
    return null;
  }
  
  phanTichXuHuong(lichSu) {
    if (lichSu.length < 10) return null;
    const last10 = lichSu.slice(0,10);
    const cai10 = last10.filter(r => r === "Cái").length;
    const con10 = last10.filter(r => r === "Con").length;
    if (cai10 >= 7) return { pred: "Con", conf: 78, reason: `Cái nóng ${cai10}/10 - bẻ Con` };
    if (con10 >= 7) return { pred: "Cái", conf: 78, reason: `Con nóng ${con10}/10 - bẻ Cái` };
    return null;
  }
  
  tongHop(lichSu) {
    let diemCai = 0, diemCon = 0, soTT = 0;
    const b1 = this.phatHienCauBet(lichSu);
    if (b1) { soTT++; if (b1.pred === "Cái") diemCai += b1.conf; else diemCon += b1.conf; }
    const b2 = this.phatHienCau1_1(lichSu);
    if (b2) { soTT++; if (b2.pred === "Cái") diemCai += b2.conf; else diemCon += b2.conf; }
    const b3 = this.phanTichXuHuong(lichSu);
    if (b3) { soTT++; if (b3.pred === "Cái") diemCai += b3.conf; else diemCon += b3.conf; }
    if (soTT === 0) return null;
    const pred = diemCai > diemCon ? "Cái" : "Con";
    let conf = Math.abs(diemCai - diemCon) / (diemCai + diemCon) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Cái", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu (cần 5 phiên)" };
    const result = this.tongHop(lichSu);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán BCR` };
    const last3 = lichSu.slice(0,3);
    const cai3 = last3.filter(r => r === "Cái").length;
    return { du_doan: cai3 >= 2 ? "Cái" : "Con", do_tin_cay: 60, giai_thich: `Xu hướng 3 phiên (${cai3}C-${3-cai3}N)` };
  }
}

// Khởi tạo algorithm cho BCR
const bcrAlgorithms = {};
for (let ban of ALL_BANS) {
  bcrAlgorithms[ban] = new BCRAlgorithm(ban);
}

// ==========================================
// XỬ LÝ REQUEST BCR
// ==========================================
async function xuLyBcrBan(ban, chiLayBanCoDuLieu = true) {
  const data = await fetchBcrData(ban);
  if (!data) {
    if (chiLayBanCoDuLieu) return null;
    throw new Error(`Bàn ${ban} không có dữ liệu hoặc chưa có kết quả`);
  }
  
  const hist = bcrHistory[ban];
  const lastPred = bcrCache[ban].get(data.phien - 1);
  
  if (lastPred && lastPred.prediction !== undefined) {
    updateBcrStats(ban, data.ket_qua, lastPred.prediction);
    lastPred.actual = data.ket_qua;
    lastPred.isCorrect = (data.ket_qua === lastPred.prediction);
  }
  
  hist.data.unshift(data.ket_qua);
  if (hist.data.length > 200) hist.data.pop();
  
  if (bcrCache[ban].has(data.phien)) {
    const cached = bcrCache[ban].get(data.phien);
    return {
      ban, active: true,
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
  
  bcrStats[ban].active = true;
  
  return {
    ban, active: true,
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
// THUẬT TOÁN TÀI XỈU (GIỮ NGUYÊN TỪ CODE CŨ)
// ==========================================
// ... (các class SunwinTXAlgorithm, LC79TXAlgorithm, ... giữ nguyên)

// ==========================================
// TẠO ENDPOINTS
// ==========================================

// Endpoint BCR - 1 bàn cụ thể
app.get('/bcr/:ban', async (req, res) => {
  const ban = req.params.ban.toUpperCase();
  if (!ALL_BANS.includes(ban)) {
    return res.status(400).json({ error: 'Bàn không hợp lệ', ds_ban: ALL_BANS });
  }
  try {
    const result = await xuLyBcrBan(ban, false);
    if (!result) {
      return res.status(404).json({ error: `Bàn ${ban} không có dữ liệu hoặc chưa có kết quả`, gợi_ý: 'Thử bàn khác như C01, C02, C04, C06...' });
    }
    res.json({ game: 'BCR', ...result, author: '@tranhoang2286' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint BCR - tự động lấy danh sách bàn có dữ liệu
app.get('/bcr/bans', async (req, res) => {
  const activeBans = [];
  for (let ban of ALL_BANS) {
    const data = await fetchBcrData(ban);
    if (data && data.ket_qua) {
      activeBans.push(ban);
      bcrStats[ban].active = true;
    }
  }
  res.json({ game: 'BCR', ds_ban_co_du_lieu: activeBans, tong_so_ban: activeBans.length, author: '@tranhoang2286' });
});

// Endpoint BCR - tất cả bàn có dữ liệu
app.get('/bcr/all', async (req, res) => {
  const results = {};
  for (let ban of ALL_BANS) {
    const result = await xuLyBcrBan(ban, true);
    if (result) results[ban] = result;
  }
  res.json({ game: 'BCR', so_ban_co_du_lieu: Object.keys(results).length, all_bans: results, author: '@tranhoang2286' });
});

// Endpoint BCR lịch sử
app.get('/bcr/lich-su/:ban', (req, res) => {
  const ban = req.params.ban.toUpperCase();
  if (!ALL_BANS.includes(ban)) {
    return res.status(400).json({ error: 'Bàn không hợp lệ', ds_ban: ALL_BANS });
  }
  res.json({
    ban,
    lichSu: bcrHistory[ban].data.slice(0, 30).map((v, i) => ({ stt: i + 1, ket_qua: v })),
    thongKe: bcrStats[ban]
  });
});

// Endpoint Tài Xỉu (giữ nguyên)
app.get('/sunwin/tx', async (req, res) => {
  // ... code sunwin tx
  res.json({ message: 'Sunwin TX endpoint' });
});

// Root
app.get('/', (req, res) => {
  res.json({
    name: '🏆 16 GAME TÀI XỈU + BCR (BACCARAT) 🏆',
    author: '@tranhoang2286',
    version: '18.0',
    endpoints: {
      'BCR danh sách bàn có dữ liệu': '/bcr/bans',
      'BCR 1 bàn': '/bcr/:ban (C01, C02, C04, C06...)',
      'BCR tất cả bàn có dữ liệu': '/bcr/all',
      'BCR lịch sử': '/bcr/lich-su/:ban'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏆 SERVER CHẠY - PORT ${PORT}`);
  console.log(`✅ BCR: Gọi /bcr/bans để xem bàn có dữ liệu`);
});
