const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// DANH SÁCH API TÀI XỈU (16 GAME)
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
// API BCR (BACCARAT) - 10 BÀN
// ==========================================
const BCR_BASE_URL = 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/';
const BCR_BANS = ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10'];

// ==========================================
// LƯU TRỮ DỮ LIỆU
// ==========================================
const historyDB = {};
const cacheDB = {};
const statsDB = {};

for (let key in GAME_APIS) {
  historyDB[key] = { data: [], tongData: [], diceData: [] };
  cacheDB[key] = new Map();
  statsDB[key] = { tong: 0, dung: 0, sai: 0, tiLe: '0%' };
}

// Lưu trữ BCR
const bcrHistory = {};
const bcrCache = {};
const bcrStats = {};

for (let ban of BCR_BANS) {
  bcrHistory[ban] = { data: [] };
  bcrCache[ban] = new Map();
  bcrStats[ban] = { tong: 0, dung: 0, sai: 0, tiLe: '0%' };
}

// ==========================================
// HÀM CẬP NHẬT THỐNG KÊ
// ==========================================
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
// FETCH DỮ LIỆU TÀI XỈU
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
    
    if (!data.ket_qua) return null;
    
    let ketQua = data.ket_qua;
    if (ketQua === 'tài' || ketQua === 'TAI' || ketQua === 'Tài' || ketQua === 'TÀI') ketQua = 'Tài';
    else if (ketQua === 'xiu' || ketQua === 'XIU' || ketQua === 'Xỉu' || ketQua === 'XỈU') ketQua = 'Xỉu';
    else if (ketQua === 'Bão') ketQua = 'Bão';
    else return null;
    
    let phien = data.phien;
    if (!phien) phien = Date.now();
    if (gameKey === 'sunwin_sicbo') phien = parseInt(String(data.phien).replace('#', ''));
    if (gameKey === 'b52' && phien) phien = parseInt(String(phien).replace('#', ''));
    
    return { 
      phien, 
      ket_qua: ketQua, 
      dice: [data.xuc_xac_1, data.xuc_xac_2, data.xuc_xac_3], 
      tong: data.tong || (data.xuc_xac_1 + data.xuc_xac_2 + data.xuc_xac_3)
    };
  } catch (err) {
    console.error(`Lỗi fetch ${gameKey}:`, err.message);
    return null;
  }
}

// ==========================================
// FETCH DỮ LIỆU BCR
// ==========================================
async function fetchBcrData(ban) {
  try {
    const url = `${BCR_BASE_URL}${ban}`;
    const res = await axios.get(url, { timeout: 10000 });
    const data = res.data;
    if (!data) return null;
    
    let ketQua = null;
    let phien = data.phien || data.session || Date.now();
    
    if (data.ket_qua) ketQua = data.ket_qua;
    else if (data.result) ketQua = data.result;
    else if (data.history && data.history.length > 0) ketQua = data.history[0];
    else if (data.results && data.results.length > 0) ketQua = data.results[0];
    else return null;
    
    if (ketQua === 'C' || ketQua === 'Cái' || ketQua === 'BANKER' || ketQua === 'Banker') ketQua = 'Cái';
    else if (ketQua === 'P' || ketQua === 'Con' || ketQua === 'PLAYER' || ketQua === 'Player') ketQua = 'Con';
    else if (ketQua === 'T' || ketQua === 'Hòa' || ketQua === 'TIE') return null;
    else return null;
    
    return { phien, ket_qua: ketQua };
  } catch (err) {
    return null;
  }
}

// ==========================================
// ========== THUẬT TOÁN SUNWIN TX (ĐÃ CÂN BẰNG) ==========
// ==========================================
class SunwinTXVIP {
  constructor() { this.name = "SUNWIN_TX - VIP"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // 1. Streak analysis
    let streak = 1;
    for (let i = 1; i < Math.min(lichSu.length, 10); i++) {
      if (lichSu[i] === lichSu[i-1]) streak++;
      else break;
    }
    if (streak >= 4) {
      soThuatToan++;
      if (lichSu[0] === "Tài") diemXiu += 85;
      else diemTai += 85;
    } else if (streak === 3) {
      soThuatToan++;
      if (lichSu[0] === "Tài") diemXiu += 72;
      else diemTai += 72;
    } else if (streak === 2) {
      soThuatToan++;
      if (lichSu[0] === "Tài") diemTai += 62;
      else diemXiu += 62;
    }
    
    // 2. Xu hướng 10 phiên
    if (lichSu.length >= 10) {
      const last10 = lichSu.slice(0, 10);
      const tai10 = last10.filter(r => r === "Tài").length;
      soThuatToan++;
      if (tai10 >= 7) diemXiu += 80;
      else if (tai10 <= 3) diemTai += 80;
      else if (tai10 >= 6) diemXiu += 68;
      else if (tai10 <= 4) diemTai += 68;
      else { diemTai += 60; diemXiu += 60; }
    }
    
    // 3. Cầu 1-1
    if (lichSu.length >= 5) {
      let zigzag = 0;
      for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
      if (zigzag >= 3) {
        soThuatToan++;
        if (lichSu[0] === "Tài") diemXiu += 74;
        else diemTai += 74;
      }
    }
    
    // 4. Cầu 3-2
    if (lichSu.length >= 10) {
      const p = lichSu.slice(0,5).join('');
      if (p === "TàiTàiTàiXỉuXỉu") {
        soThuatToan++;
        diemXiu += 80;
      } else if (p === "XỉuXỉuXỉuTàiTài") {
        soThuatToan++;
        diemTai += 80;
      }
    }
    
    // 5. Fallback nếu không có thuật toán nào
    if (soThuatToan === 0) {
      const last3 = lichSu.slice(0,3);
      const tai3 = last3.filter(r => r === "Tài").length;
      return { 
        du_doan: tai3 >= 2 ? "Tài" : "Xỉu", 
        do_tin_cay: 60, 
        giai_thich: `Xu hướng 3 phiên (${tai3}T-${3-tai3}X)` 
      };
    }
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(88, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/5 thuật toán VIP SUNWIN` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN LC79 TX ==========
// ==========================================
class LC79TXVIP {
  constructor() { this.name = "LC79_TX - VIP"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // 1. Phân tích tổng điểm
    if (tongData && tongData.length >= 10) {
      const avg = tongData.slice(0,10).reduce((a,b)=>a+b,0)/10;
      soThuatToan++;
      if (avg > 11.5) diemXiu += 70;
      else if (avg < 9.5) diemTai += 70;
      else { diemTai += 55; diemXiu += 55; }
    }
    
    // 2. Streak
    let streak = 1;
    for (let i = 1; i < Math.min(lichSu.length, 10); i++) {
      if (lichSu[i] === lichSu[i-1]) streak++;
      else break;
    }
    if (streak >= 3) {
      soThuatToan++;
      if (lichSu[0] === "Tài") diemXiu += 75;
      else diemTai += 75;
    }
    
    // 3. Xu hướng 5 phiên
    const last5 = lichSu.slice(0,5);
    const tai5 = last5.filter(r => r === "Tài").length;
    soThuatToan++;
    if (tai5 >= 3) diemTai += 65;
    else diemXiu += 65;
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/3 thuật toán VIP LC79` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN LC79 MD5 ==========
// ==========================================
class LC79MD5VIP {
  constructor() { this.name = "LC79_MD5 - VIP"; }
  
  predict(lichSu, tongData, diceData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // 1. Pattern lặp
    if (lichSu.length >= 9) {
      const p3 = lichSu.slice(0,3);
      if (lichSu.slice(3,6).join('') === p3.join('') && lichSu.slice(6,9).join('') === p3.join('')) {
        soThuatToan++;
        if (p3[2] === "Tài") diemXiu += 85;
        else diemTai += 85;
      }
    }
    
    // 2. Markov bậc 2
    if (lichSu.length >= 10) {
      const map = new Map();
      for (let i = 0; i < lichSu.length - 2; i++) {
        const key = lichSu[i] + ',' + lichSu[i+1];
        const next = lichSu[i+2];
        if (!map.has(key)) map.set(key, { Tai: 0, Xiu: 0 });
        if (next === "Tài") map.get(key).Tai++;
        else map.get(key).Xiu++;
      }
      const lastKey = lichSu[0] + ',' + lichSu[1];
      const stat = map.get(lastKey);
      if (stat && stat.Tai + stat.Xiu >= 2) {
        soThuatToan++;
        if (stat.Tai > stat.Xiu) diemTai += 70;
        else diemXiu += 70;
      }
    }
    
    // 3. Xu hướng 5 phiên
    const last5 = lichSu.slice(0,5);
    const tai5 = last5.filter(r => r === "Tài").length;
    soThuatToan++;
    if (tai5 >= 3) diemTai += 60;
    else diemXiu += 60;
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(88, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/3 thuật toán VIP LC79 MD5` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN BETVIP TX ==========
// ==========================================
class BetvipTXVIP {
  constructor() { this.name = "BETVIP_TX - VIP"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // Martingale 10 phiên
    if (lichSu.length >= 10) {
      const last10 = lichSu.slice(0,10);
      const tai10 = last10.filter(r => r === "Tài").length;
      soThuatToan++;
      if (tai10 >= 7) diemXiu += 80;
      else if (tai10 <= 3) diemTai += 80;
      else if (tai10 >= 6) diemXiu += 65;
      else if (tai10 <= 4) diemTai += 65;
      else { diemTai += 55; diemXiu += 55; }
    }
    
    // Cầu 2-1
    if (lichSu.length >= 6) {
      if (lichSu[0] === lichSu[1] && lichSu[3] === lichSu[4] && lichSu[0] !== lichSu[3]) {
        soThuatToan++;
        if (lichSu[0] === "Tài") diemTai += 75;
        else diemXiu += 75;
      }
    }
    
    // Xu hướng 3 phiên
    const last3 = lichSu.slice(0,3);
    const tai3 = last3.filter(r => r === "Tài").length;
    soThuatToan++;
    if (tai3 >= 2) diemTai += 60;
    else diemXiu += 60;
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/3 thuật toán VIP BETVIP` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN BETVIP MD5 ==========
// ==========================================
class BetvipMD5VIP {
  constructor() { this.name = "BETVIP_MD5 - VIP"; }
  
  predict(lichSu, tongData, diceData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // Phân tích xúc xắc
    if (diceData && diceData.length >= 10) {
      const freq = {1:0,2:0,3:0,4:0,5:0,6:0};
      for (let d of diceData.slice(0,20)) {
        if (d && d.length === 3) d.forEach(f => { if(f) freq[f]++; });
      }
      const maxFace = Object.keys(freq).reduce((a,b) => freq[a] > freq[b] ? a : b);
      soThuatToan++;
      if (maxFace >= 5) diemTai += 70;
      else if (maxFace <= 2) diemXiu += 70;
      else { diemTai += 55; diemXiu += 55; }
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0,5);
    const tai5 = last5.filter(r => r === "Tài").length;
    soThuatToan++;
    if (tai5 >= 3) diemTai += 65;
    else diemXiu += 65;
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/2 thuật toán VIP BETVIP MD5` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN 789CLUB TX ==========
// ==========================================
class Club789TXVIP {
  constructor() { this.name = "CLUB789_TX - VIP"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // Cầu 1-1
    if (lichSu.length >= 5) {
      let zigzag = 0;
      for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
      if (zigzag >= 3) {
        soThuatToan++;
        if (lichSu[0] === "Tài") diemXiu += 78;
        else diemTai += 78;
      }
    }
    
    // Streak
    let streak = 1;
    for (let i = 1; i < Math.min(lichSu.length, 10); i++) {
      if (lichSu[i] === lichSu[i-1]) streak++;
      else break;
    }
    if (streak >= 3) {
      soThuatToan++;
      if (lichSu[0] === "Tài") diemXiu += 70;
      else diemTai += 70;
    }
    
    // Xu hướng 3 phiên
    const last3 = lichSu.slice(0,3);
    const tai3 = last3.filter(r => r === "Tài").length;
    soThuatToan++;
    if (tai3 >= 2) diemTai += 60;
    else diemXiu += 60;
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/3 thuật toán VIP 789CLUB` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN B52 ==========
// ==========================================
class B52VIP {
  constructor() { this.name = "B52 - VIP"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // RSI giả lập
    if (lichSu.length >= 14) {
      const nums = lichSu.slice(0,14).map(r => r === "Tài" ? 1 : 0);
      let gains = 0, losses = 0;
      for (let i = 1; i < nums.length; i++) {
        const diff = nums[i] - nums[i-1];
        if (diff > 0) gains += diff;
        else losses -= diff;
      }
      const rsi = losses === 0 ? 100 : 100 - (100 / (1 + gains/losses));
      soThuatToan++;
      if (rsi >= 70) diemXiu += 75;
      else if (rsi <= 30) diemTai += 75;
      else if (rsi >= 60) diemXiu += 65;
      else if (rsi <= 40) diemTai += 65;
      else { diemTai += 55; diemXiu += 55; }
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0,5);
    const tai5 = last5.filter(r => r === "Tài").length;
    soThuatToan++;
    if (tai5 >= 3) diemTai += 65;
    else diemXiu += 65;
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/2 thuật toán VIP B52` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN MAX789 ==========
// ==========================================
class Max789VIP {
  constructor() { this.name = "MAX789 - VIP"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // Fibonacci
    const fibs = [2,3,5,8];
    let match = 0;
    for (let f of fibs) {
      if (lichSu.length > f && lichSu[0] === lichSu[f]) match++;
    }
    if (match >= 2) {
      soThuatToan++;
      if (lichSu[0] === "Tài") diemXiu += 80;
      else diemTai += 80;
    }
    
    // Chu kỳ 8
    if (lichSu.length >= 16) {
      const c1 = lichSu.slice(0,8).join('');
      const c2 = lichSu.slice(8,16).join('');
      if (c1 === c2) {
        soThuatToan++;
        if (c1[0] === "T") diemXiu += 75;
        else diemTai += 75;
      }
    }
    
    // Xu hướng 3 phiên
    const last3 = lichSu.slice(0,3);
    const tai3 = last3.filter(r => r === "Tài").length;
    soThuatToan++;
    if (tai3 >= 2) diemTai += 60;
    else diemXiu += 60;
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/3 thuật toán VIP MAX789` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN LUCK8 MD5 ==========
// ==========================================
class Luck8MD5VIP {
  constructor() { this.name = "LUCK8_MD5 - VIP"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // KNN đơn giản
    if (lichSu.length >= 10) {
      const last5 = lichSu.slice(0,5);
      let match = 0;
      for (let i = 5; i < lichSu.length - 5; i++) {
        let isMatch = true;
        for (let j = 0; j < 5; j++) if (last5[j] !== lichSu[i+j]) { isMatch = false; break; }
        if (isMatch) match++;
      }
      if (match >= 1) {
        soThuatToan++;
        if (last5[4] === "Tài") diemXiu += 75;
        else diemTai += 75;
      }
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0,5);
    const tai5 = last5.filter(r => r === "Tài").length;
    soThuatToan++;
    if (tai5 >= 3) diemTai += 65;
    else diemXiu += 65;
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/2 thuật toán VIP LUCK8` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN SUMVIN MD5 ==========
// ==========================================
class SumvinMD5VIP {
  constructor() { this.name = "SUMVIN_MD5 - VIP"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // Pattern 1-2-3
    if (lichSu.length >= 6) {
      if (lichSu[0] === lichSu[1] && lichSu[3] === lichSu[4] && lichSu[0] !== lichSu[3]) {
        soThuatToan++;
        if (lichSu[0] === "Tài") diemTai += 75;
        else diemXiu += 75;
      }
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0,5);
    const tai5 = last5.filter(r => r === "Tài").length;
    soThuatToan++;
    if (tai5 >= 3) diemTai += 65;
    else diemXiu += 65;
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/2 thuật toán VIP SUMVIN` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN GB68 THƯỜNG ==========
// ==========================================
class GB68ThuongVIP {
  constructor() { this.name = "GB68_THUONG - VIP"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // Bệt 3
    let streak = 1;
    for (let i = 1; i < 4; i++) {
      if (lichSu[i] === lichSu[i-1]) streak++;
      else break;
    }
    if (streak === 3) {
      soThuatToan++;
      if (lichSu[0] === "Tài") diemXiu += 75;
      else diemTai += 75;
    } else {
      const last3 = lichSu.slice(0,3);
      const tai3 = last3.filter(r => r === "Tài").length;
      soThuatToan++;
      if (tai3 >= 2) diemTai += 65;
      else diemXiu += 65;
    }
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan} thuật toán VIP GB68` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN GB68 MD5 ==========
// ==========================================
class GB68MD5VIP {
  constructor() { this.name = "GB68_MD5 - VIP"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // Phân tích tổng điểm
    if (tongData && tongData.length >= 5) {
      const avg = tongData.slice(0,5).reduce((a,b)=>a+b,0)/5;
      soThuatToan++;
      if (avg > 11.5) diemXiu += 70;
      else if (avg < 9.5) diemTai += 70;
      else { diemTai += 55; diemXiu += 55; }
    }
    
    // Xu hướng 3 phiên
    const last3 = lichSu.slice(0,3);
    const tai3 = last3.filter(r => r === "Tài").length;
    soThuatToan++;
    if (tai3 >= 2) diemTai += 60;
    else diemXiu += 60;
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/2 thuật toán VIP GB68 MD5` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN ALO HITCLUB MD5 ==========
// ==========================================
class AloHitclubMD5VIP {
  constructor() { this.name = "ALO_HITCLUB_MD5 - VIP"; }
  
  predict(lichSu, tongData, diceData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // Phân tích xúc xắc
    if (diceData && diceData.length >= 5) {
      let sum = 0, count = 0;
      for (let d of diceData.slice(0,10)) {
        if (d && d.length === 3) { sum += d[0] + d[1] + d[2]; count++; }
      }
      if (count > 0) {
        const avg = sum / count;
        soThuatToan++;
        if (avg > 11) diemXiu += 65;
        else if (avg < 10) diemTai += 65;
        else { diemTai += 55; diemXiu += 55; }
      }
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0,5);
    const tai5 = last5.filter(r => r === "Tài").length;
    soThuatToan++;
    if (tai5 >= 3) diemTai += 65;
    else diemXiu += 65;
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/2 thuật toán VIP ALO HITCLUB` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN SUNWIN SICBO ==========
// ==========================================
class SunwinSicboVIP {
  constructor() { this.name = "SUNWIN_SICBO - VIP"; }
  
  predict(lichSu, tongData, diceData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    let soThuatToan = 0;
    
    // Kiểm tra Bão
    if (diceData && diceData.length >= 1) {
      const last = diceData[0];
      if (last && last[0] === last[1] && last[1] === last[2]) {
        soThuatToan++;
        diemTai += 70;
      }
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0,5);
    const tai5 = last5.filter(r => r === "Tài").length;
    soThuatToan++;
    if (tai5 >= 3) diemTai += 65;
    else diemXiu += 65;
    
    const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/2 thuật toán VIP SICBO` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN LUCK8 SICBO40 ==========
// ==========================================
class Luck8Sicbo40VIP {
  constructor() { this.name = "LUCK8_SICBO40 - VIP"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 4) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    const last3 = lichSu.slice(0,3);
    const tai3 = last3.filter(r => r === "Tài").length;
    
    let pred = "Tài";
    let conf = 60;
    if (tai3 === 3) { pred = "Xỉu"; conf = 70; }
    else if (tai3 === 0) { pred = "Tài"; conf = 70; }
    else if (tai3 === 2) { pred = "Xỉu"; conf = 65; }
    else if (tai3 === 1) { pred = "Tài"; conf = 65; }
    
    return { 
      du_doan: pred, 
      do_tin_cay: conf, 
      giai_thich: `Xu hướng 3 phiên (${tai3}T-${3-tai3}X)` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN XÓC ĐĨA ==========
// ==========================================
class LC79XocDiaVIP {
  constructor() { this.name = "LC79_XOCDIA - VIP"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Chẵn", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemChan = 0, diemLe = 0;
    let soThuatToan = 0;
    
    // Cầu bệt
    let streak = 1;
    for (let i = 1; i < Math.min(lichSu.length, 6); i++) {
      if (lichSu[i] === lichSu[i-1]) streak++;
      else break;
    }
    if (streak >= 3) {
      soThuatToan++;
      if (lichSu[0] === "Chẵn") diemLe += 75;
      else diemChan += 75;
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0,5);
    const chan5 = last5.filter(r => r === "Chẵn").length;
    soThuatToan++;
    if (chan5 >= 3) diemChan += 65;
    else diemLe += 65;
    
    const finalPred = diemChan > diemLe ? "Chẵn" : "Lẻ";
    let confidence = Math.abs(diemChan - diemLe) / (diemChan + diemLe) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/2 thuật toán VIP XÓC ĐĨA` 
    };
  }
}

// ==========================================
// ========== THUẬT TOÁN BCR ==========
// ==========================================
class BCRVIP {
  constructor(ban) { this.ban = ban; this.name = `BCR-${ban} - VIP`; }
  
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Cái", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemCai = 0, diemCon = 0;
    let soThuatToan = 0;
    
    // Cầu bệt
    let streak = 1;
    for (let i = 1; i < Math.min(lichSu.length, 10); i++) {
      if (lichSu[i] === lichSu[i-1]) streak++;
      else break;
    }
    if (streak >= 3) {
      soThuatToan++;
      if (lichSu[0] === "Cái") diemCon += 75;
      else diemCai += 75;
    }
    
    // Cầu 1-1
    if (lichSu.length >= 5) {
      let zigzag = 0;
      for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
      if (zigzag >= 3) {
        soThuatToan++;
        if (lichSu[0] === "Cái") diemCon += 70;
        else diemCai += 70;
      }
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0,5);
    const cai5 = last5.filter(r => r === "Cái").length;
    soThuatToan++;
    if (cai5 >= 3) diemCai += 65;
    else diemCon += 65;
    
    const finalPred = diemCai > diemCon ? "Cái" : "Con";
    let confidence = Math.abs(diemCai - diemCon) / (diemCai + diemCon) * 100;
    confidence = Math.min(85, Math.max(55, confidence));
    
    return { 
      du_doan: finalPred, 
      do_tin_cay: Math.round(confidence), 
      giai_thich: `${soThuatToan}/3 thuật toán VIP BCR` 
    };
  }
}

// ==========================================
// KHỞI TẠO ALGORITHM
// ==========================================
const algorithms = {
  'sunwin_tx': new SunwinTXVIP(),
  'lc79_tx': new LC79TXVIP(),
  'lc79_md5': new LC79MD5VIP(),
  'betvip_tx': new BetvipTXVIP(),
  'betvip_md5': new BetvipMD5VIP(),
  'club789_tx': new Club789TXVIP(),
  'b52': new B52VIP(),
  'max789': new Max789VIP(),
  'luck8_md5': new Luck8MD5VIP(),
  'sumvin_md5': new SumvinMD5VIP(),
  'gb68_thuong': new GB68ThuongVIP(),
  'gb68_md5': new GB68MD5VIP(),
  'alo_hitclub_md5': new AloHitclubMD5VIP(),
  'sunwin_sicbo': new SunwinSicboVIP(),
  'luck8_sicbo40': new Luck8Sicbo40VIP(),
  'lc79_xocdia': new LC79XocDiaVIP()
};

const bcrAlgorithms = {};
for (let ban of BCR_BANS) {
  bcrAlgorithms[ban] = new BCRVIP(ban);
}

// ==========================================
// XỬ LÝ REQUEST TÀI XỈU
// ==========================================
async function xuLyGame(gameKey) {
  const url = GAME_APIS[gameKey];
  const data = await fetchGameData(url, gameKey);
  if (!data) throw new Error(`Không lấy được dữ liệu ${gameKey}`);
  if (data.ket_qua === "Bão") throw new Error(`Game ${gameKey} ra Bão`);
  
  const hist = historyDB[gameKey];
  const lastPred = cacheDB[gameKey].get(data.phien - 1);
  const isXocDia = (gameKey === 'lc79_xocdia');
  
  if (lastPred && lastPred.prediction !== undefined) {
    updateStats(gameKey, data.ket_qua, lastPred.prediction);
    lastPred.actual = data.ket_qua;
    lastPred.isCorrect = (data.ket_qua === lastPred.prediction);
  }
  
  hist.data.unshift(data.ket_qua);
  if (hist.data.length > 500) hist.data.pop();
  if (data.tong && typeof data.tong === 'number') {
    hist.tongData.unshift(data.tong);
    if (hist.tongData.length > 500) hist.tongData.pop();
  }
  if (data.dice && Array.isArray(data.dice) && data.dice.length === 3) {
    hist.diceData.unshift(data.dice);
    if (hist.diceData.length > 500) hist.diceData.pop();
  }
  
  if (cacheDB[gameKey].has(data.phien)) {
    const cached = cacheDB[gameKey].get(data.phien);
    return {
      phienHienTai: data.phien,
      ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong },
      duDoan: { phien: data.phien + 1, du_doan: cached.prediction, do_tin_cay: cached.confidence + '%', giai_thich: cached.reason },
      thongKe: statsDB[gameKey]
    };
  }
  
  const algo = algorithms[gameKey];
  let prediction;
  if (isXocDia) {
    prediction = algo.predict(hist.data, hist.tongData);
  } else if (gameKey === 'lc79_md5' || gameKey === 'betvip_md5' || gameKey === 'alo_hitclub_md5' || gameKey === 'sunwin_sicbo') {
    prediction = algo.predict(hist.data, hist.tongData, hist.diceData);
  } else {
    prediction = algo.predict(hist.data, hist.tongData);
  }
  
  cacheDB[gameKey].set(data.phien, {
    prediction: prediction.du_doan,
    confidence: prediction.do_tin_cay,
    reason: prediction.giai_thich
  });
  
  if (cacheDB[gameKey].size > 20) {
    const firstKey = cacheDB[gameKey].keys().next().value;
    cacheDB[gameKey].delete(firstKey);
  }
  
  return {
    phienHienTai: data.phien,
    ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong },
    duDoan: { phien: data.phien + 1, du_doan: prediction.du_doan, do_tin_cay: prediction.do_tin_cay + '%', giai_thich: prediction.giai_thich },
    thongKe: statsDB[gameKey]
  };
}

// ==========================================
// XỬ LÝ REQUEST BCR
// ==========================================
async function xuLyBcrBan(ban) {
  const data = await fetchBcrData(ban);
  if (!data) return null;
  
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
      ban, phienHienTai: data.phien, ketQuaTruoc: data.ket_qua,
      duDoan: { phien: data.phien + 1, du_doan: cached.prediction, do_tin_cay: cached.confidence, giai_thich: cached.reason },
      thongKe: bcrStats[ban]
    };
  }
  
  const algo = bcrAlgorithms[ban];
  const prediction = algo.predict(hist.data);
  
  bcrCache[ban].set(data.phien, {
    prediction: prediction.du_doan,
    confidence: prediction.do_tin_cay + '%',
    reason: prediction.giai_thich
  });
  
  if (bcrCache[ban].size > 20) {
    const firstKey = bcrCache[ban].keys().next().value;
    bcrCache[ban].delete(firstKey);
  }
  
  return {
    ban, phienHienTai: data.phien, ketQuaTruoc: data.ket_qua,
    lichSuGanDay: hist.data.slice(0, 10),
    duDoan: { phien: data.phien + 1, du_doan: prediction.du_doan, do_tin_cay: prediction.do_tin_cay + '%', giai_thich: prediction.giai_thich },
    thongKe: bcrStats[ban]
  };
}

// ==========================================
// TẠO ENDPOINTS TÀI XỈU
// ==========================================
for (let gameKey in GAME_APIS) {
  const endpoint = `/${gameKey.replace(/_/g, '/')}`;
  app.get(endpoint, async (req, res) => {
    try {
      const result = await xuLyGame(gameKey);
      res.json({ game: gameKey.toUpperCase(), ...result, author: '@tranhoang2286', version: 'VIP PRO MAX FIXED' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// ==========================================
// TẠO ENDPOINTS BCR
// ==========================================
app.get('/bcr/bans', async (req, res) => {
  const activeBans = [];
  for (let ban of BCR_BANS) {
    const data = await fetchBcrData(ban);
    if (data) activeBans.push(ban);
  }
  res.json({ game: 'BCR', ds_ban_co_du_lieu: activeBans, tong_so_ban: activeBans.length, author: '@tranhoang2286' });
});

app.get('/bcr/all', async (req, res) => {
  const results = {};
  for (let ban of BCR_BANS) {
    const result = await xuLyBcrBan(ban);
    if (result) results[ban] = result;
  }
  res.json({ game: 'BCR', so_ban_co_du_lieu: Object.keys(results).length, all_bans: results, author: '@tranhoang2286' });
});

app.get('/bcr/:ban', async (req, res) => {
  const ban = req.params.ban.toUpperCase();
  if (!BCR_BANS.includes(ban)) {
    return res.status(400).json({ error: 'Bàn không hợp lệ', ds_ban: BCR_BANS });
  }
  const result = await xuLyBcrBan(ban);
  if (!result) {
    return res.status(404).json({ error: `Bàn ${ban} không có dữ liệu`, gợi_ý: 'Gọi /bcr/bans để xem bàn có dữ liệu' });
  }
  res.json({ game: 'BCR', ...result, author: '@tranhoang2286' });
});

app.get('/bcr/lich-su/:ban', (req, res) => {
  const ban = req.params.ban.toUpperCase();
  if (!BCR_BANS.includes(ban)) {
    return res.status(400).json({ error: 'Bàn không hợp lệ' });
  }
  res.json({ ban, lichSu: bcrHistory[ban].data.slice(0,30).map((v,i)=>({stt:i+1, ket_qua:v})), thongKe: bcrStats[ban] });
});

// ==========================================
// ENDPOINTS KHÁC
// ==========================================
app.get('/lich-su/:game', (req, res) => {
  const game = req.params.game;
  if (!GAME_APIS[game]) {
    return res.status(400).json({ error: 'Game không tồn tại', ds_game: Object.keys(GAME_APIS) });
  }
  res.json({ game, lichSu: historyDB[game].data.slice(0,30).map((v,i)=>({stt:i+1, ket_qua:v})), thongKe: statsDB[game] });
});

app.get('/lich-su', (req, res) => {
  const allStats = {};
  for (let key in GAME_APIS) allStats[key] = statsDB[key];
  for (let ban of BCR_BANS) allStats[`bcr_${ban}`] = bcrStats[ban];
  res.json({ thong_ke_tat_ca_game: allStats, tong_so_game: Object.keys(GAME_APIS).length + BCR_BANS.length });
});

app.get('/', (req, res) => {
  res.json({
    name: '🏆 16 GAME TÀI XỈU + 10 BÀN BCR - VIP PRO MAX 🏆',
    author: '@tranhoang2286',
    version: '23.0 - FIXED & OPTIMIZED',
    endpoints: {
      'Tài Xỉu (16 game)': Object.keys(GAME_APIS).map(k => `/${k.replace(/_/g, '/')}`),
      'BCR danh sách bàn': '/bcr/bans',
      'BCR 1 bàn': '/bcr/:ban (C01-C10)',
      'BCR tất cả': '/bcr/all',
      'BCR lịch sử': '/bcr/lich-su/:ban',
      'Lịch sử tổng hợp': '/lich-su'
    },
    fixes: [
      '✅ Đã fix lỗi dự đoán lệch Xỉu - thuật toán cân bằng Tài/Xỉu',
      '✅ Đã fix lỗi không cập nhật phiên - fetch dữ liệu liên tục',
      '✅ Đã thêm BCR với 10 bàn C01-C10',
      '✅ Mỗi game có thuật toán riêng biệt'
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏆 16 GAME TÀI XỈU + 10 BÀN BCR - PORT ${PORT}`);
  console.log(`✅ Đã fix: Cân bằng Tài/Xỉu | Cập nhật phiên | Thêm BCR`);
  console.log(`🎲 Tài Xỉu: ${Object.keys(GAME_APIS).length} game`);
  console.log(`🎰 BCR: ${BCR_BANS.length} bàn (C01-C10)`);
});
