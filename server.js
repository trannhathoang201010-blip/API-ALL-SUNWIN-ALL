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
// ========== THUẬT TOÁN SUNWIN TX ==========
// ==========================================
class SunwinTXAlgorithm {
  constructor() { this.name = "SUNWIN_TX - Chuyên gia bệt & Martingale"; }
  
  phatHienBệt(lichSu) {
    if (lichSu.length < 3) return null;
    let streak = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[i-1]) streak++;
      else break;
    }
    if (streak >= 5) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 85, reason: "Bệt cực đại - phá cầu" };
    if (streak === 4) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 78, reason: "Bệt 4 - chuẩn bị gãy" };
    if (streak === 3) return { pred: lichSu[0], conf: 68, reason: "Bệt 3 - theo cầu" };
    return null;
  }
  
  phanTichXuHuong(lichSu) {
    if (lichSu.length < 10) return null;
    const last10 = lichSu.slice(0,10);
    const tai10 = last10.filter(r => r === "Tài").length;
    if (tai10 >= 8) return { pred: "Xỉu", conf: 80, reason: `Tài nóng ${tai10}/10 - bẻ Xỉu` };
    if (tai10 <= 2) return { pred: "Tài", conf: 80, reason: `Xỉu nóng ${10-tai10}/10 - bẻ Tài` };
    if (tai10 >= 7) return { pred: "Xỉu", conf: 72, reason: `Tài ${tai10}/10 - bẻ nhẹ` };
    if (tai10 <= 3) return { pred: "Tài", conf: 72, reason: `Xỉu ${10-tai10}/10 - bẻ nhẹ` };
    return null;
  }
  
  phatHienCau1_1(lichSu) {
    if (lichSu.length < 5) return null;
    let zigzag = 0;
    for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
    if (zigzag >= 3) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 74, reason: "Cầu 1-1" };
    return null;
  }
  
  phatHienCau3_2(lichSu) {
    if (lichSu.length < 10) return null;
    const p = lichSu.slice(0,5).join('');
    if (p === "TàiTàiTàiXỉuXỉu") return { pred: "Xỉu", conf: 80, reason: "Cầu 3-2" };
    if (p === "XỉuXỉuXỉuTàiTài") return { pred: "Tài", conf: 80, reason: "Cầu 3-2" };
    return null;
  }
  
  tongHop(lichSu) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phatHienBệt(lichSu);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phanTichXuHuong(lichSu);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    const b3 = this.phatHienCau1_1(lichSu);
    if (b3) { soTT++; if (b3.pred === "Tài") diemTai += b3.conf; else diemXiu += b3.conf; }
    const b4 = this.phatHienCau3_2(lichSu);
    if (b4) { soTT++; if (b4.pred === "Tài") diemTai += b4.conf; else diemXiu += b4.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán SUNWIN` };
    const last3 = lichSu.slice(0,3);
    const tai3 = last3.filter(r => r === "Tài").length;
    return { du_doan: tai3 >= 2 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: "Xu hướng 3 phiên" };
  }
}

// ==========================================
// ========== THUẬT TOÁN LC79 TX ==========
// ==========================================
class LC79TXAlgorithm {
  constructor() { this.name = "LC79_TX - Chuyên tổng điểm & xúc xắc"; }
  
  phanTichTongDiem(tongData) {
    if (!tongData || tongData.length < 10) return null;
    const avg = tongData.slice(0,10).reduce((a,b)=>a+b,0)/10;
    if (avg > 11.5) return { pred: "Xỉu", conf: 68, reason: `Tổng cao TB ${avg.toFixed(1)}` };
    if (avg < 9.5) return { pred: "Tài", conf: 68, reason: `Tổng thấp TB ${avg.toFixed(1)}` };
    return null;
  }
  
  phanTichBienDo(tongData) {
    if (!tongData || tongData.length < 10) return null;
    const max = Math.max(...tongData.slice(0,10));
    const min = Math.min(...tongData.slice(0,10));
    if (max - min >= 8) return { pred: max > 14 ? "Xỉu" : "Tài", conf: 64, reason: `Biên độ lớn ${max-min}` };
    return null;
  }
  
  phanTichXuHuongTong(tongData) {
    if (!tongData || tongData.length < 20) return null;
    const avgRecent = tongData.slice(0,10).reduce((a,b)=>a+b,0)/10;
    const avgPrev = tongData.slice(10,20).reduce((a,b)=>a+b,0)/10;
    if (avgRecent > avgPrev + 1.5) return { pred: "Xỉu", conf: 66, reason: "Tổng tăng dần" };
    if (avgRecent < avgPrev - 1.5) return { pred: "Tài", conf: 66, reason: "Tổng giảm dần" };
    return null;
  }
  
  phatHienCauBet(lichSu) {
    if (lichSu.length < 3) return null;
    let streak = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[i-1]) streak++;
      else break;
    }
    if (streak >= 4) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 75, reason: "Bệt dài - phá cầu" };
    if (streak === 3) return { pred: lichSu[0], conf: 65, reason: "Bệt 3 - theo cầu" };
    return null;
  }
  
  tongHop(lichSu, tongData) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phanTichTongDiem(tongData);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phanTichBienDo(tongData);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    const b3 = this.phanTichXuHuongTong(tongData);
    if (b3) { soTT++; if (b3.pred === "Tài") diemTai += b3.conf; else diemXiu += b3.conf; }
    const b4 = this.phatHienCauBet(lichSu);
    if (b4) { soTT++; if (b4.pred === "Tài") diemTai += b4.conf; else diemXiu += b4.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(85, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu, tongData);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán LC79 TX` };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// ==========================================
// ========== THUẬT TOÁN LC79 MD5 ==========
// ==========================================
class LC79MD5Algorithm {
  constructor() { this.name = "LC79_MD5 - Chuyên Markov & pattern lặp"; }
  
  phatHienMarkov(lichSu) {
    if (lichSu.length < 10) return null;
    const map = new Map();
    for (let i = 0; i < lichSu.length - 2; i++) {
      const key = `${lichSu[i]}_${lichSu[i+1]}`;
      const next = lichSu[i+2];
      if (!map.has(key)) map.set(key, { Tai: 0, Xiu: 0 });
      if (next === "Tài") map.get(key).Tai++;
      else map.get(key).Xiu++;
    }
    const lastKey = `${lichSu[0]}_${lichSu[1]}`;
    const stat = map.get(lastKey);
    if (stat && stat.Tai + stat.Xiu >= 3) {
      const pred = stat.Tai > stat.Xiu ? "Tài" : "Xỉu";
      let conf = 65 + Math.min(15, (stat.Tai + stat.Xiu) * 2);
      return { pred, conf: Math.min(80, conf), reason: "Markov bậc 2" };
    }
    return null;
  }
  
  phatHienPatternLap(lichSu) {
    if (lichSu.length < 12) return null;
    for (let len of [3,4,5]) {
      const p = lichSu.slice(0, len);
      if (lichSu.slice(len, len*2).join('') === p.join('') && lichSu.slice(len*2, len*3).join('') === p.join('')) {
        return { pred: p[p.length-1] === "Tài" ? "Xỉu" : "Tài", conf: 84, reason: `Pattern lặp ${len}-${len}-${len}` };
      }
    }
    return null;
  }
  
  phatHienCauDoiXung(lichSu) {
    if (lichSu.length < 9) return null;
    let isMirror = true;
    for (let i = 0; i < 4; i++) if (lichSu[i] !== lichSu[8-i]) { isMirror = false; break; }
    if (isMirror) return { pred: lichSu[4] === "Tài" ? "Xỉu" : "Tài", conf: 78, reason: "Cầu đối xứng" };
    return null;
  }
  
  phatHienXuHuong(lichSu) {
    if (lichSu.length < 8) return null;
    const last8 = lichSu.slice(0,8);
    let tang = true, giam = true;
    for (let i = 1; i < 4; i++) {
      if (last8[i] <= last8[i-1]) tang = false;
      if (last8[i] >= last8[i-1]) giam = false;
    }
    if (tang) return { pred: "Xỉu", conf: 68, reason: "Xu hướng tăng" };
    if (giam) return { pred: "Tài", conf: 68, reason: "Xu hướng giảm" };
    return null;
  }
  
  tongHop(lichSu) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phatHienMarkov(lichSu);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phatHienPatternLap(lichSu);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    const b3 = this.phatHienCauDoiXung(lichSu);
    if (b3) { soTT++; if (b3.pred === "Tài") diemTai += b3.conf; else diemXiu += b3.conf; }
    const b4 = this.phatHienXuHuong(lichSu);
    if (b4) { soTT++; if (b4.pred === "Tài") diemTai += b4.conf; else diemXiu += b4.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán LC79 MD5` };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// ==========================================
// ========== THUẬT TOÁN BETVIP TX ==========
// ==========================================
class BetvipTXAlgorithm {
  constructor() { this.name = "BETVIP_TX - Chuyên Martingale & bẻ cầu"; }
  
  phatHienMartingale(lichSu) {
    if (lichSu.length < 10) return null;
    const last10 = lichSu.slice(0,10);
    const tai10 = last10.filter(r => r === "Tài").length;
    if (tai10 >= 8) return { pred: "Xỉu", conf: 82, reason: `Tài siêu nóng ${tai10}/10` };
    if (tai10 <= 2) return { pred: "Tài", conf: 82, reason: `Xỉu siêu nóng ${10-tai10}/10` };
    if (tai10 >= 7) return { pred: "Xỉu", conf: 74, reason: `Tài nóng ${tai10}/10` };
    if (tai10 <= 3) return { pred: "Tài", conf: 74, reason: `Xỉu nóng ${10-tai10}/10` };
    return null;
  }
  
  phatHienCau2_1(lichSu) {
    if (lichSu.length < 6) return null;
    if (lichSu[0] === lichSu[1] && lichSu[3] === lichSu[4] && lichSu[0] !== lichSu[3]) {
      return { pred: lichSu[0], conf: 76, reason: "Cầu 2-1" };
    }
    return null;
  }
  
  phatHienCau1_1(lichSu) {
    if (lichSu.length < 5) return null;
    let zigzag = 0;
    for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
    if (zigzag >= 3) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 72, reason: "Cầu 1-1" };
    return null;
  }
  
  tongHop(lichSu) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phatHienMartingale(lichSu);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phatHienCau2_1(lichSu);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    const b3 = this.phatHienCau1_1(lichSu);
    if (b3) { soTT++; if (b3.pred === "Tài") diemTai += b3.conf; else diemXiu += b3.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán BETVIP` };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// ==========================================
// ========== THUẬT TOÁN BETVIP MD5 ==========
// ==========================================
class BetvipMD5Algorithm {
  constructor() { this.name = "BETVIP_MD5 - Chuyên phân tích xúc xắc"; }
  
  phanTichXucXacFreq(diceData) {
    if (!diceData || diceData.length < 10) return null;
    const freq = {1:0,2:0,3:0,4:0,5:0,6:0};
    for (let d of diceData.slice(0,20)) {
      if (d && d.length === 3) d.forEach(f => { if(f) freq[f]++; });
    }
    const maxFace = Object.keys(freq).reduce((a,b) => freq[a] > freq[b] ? a : b);
    if (maxFace >= 5) return { pred: "Tài", conf: 66, reason: `Mặt ${maxFace} xuất hiện nhiều` };
    if (maxFace <= 2) return { pred: "Xỉu", conf: 66, reason: `Mặt ${maxFace} xuất hiện nhiều` };
    return null;
  }
  
  phanTichChanLe(diceData) {
    if (!diceData || diceData.length < 10) return null;
    let leCount = 0, total = 0;
    for (let d of diceData.slice(0,20)) {
      if (d && d.length === 3) { d.forEach(f => { if(f) { total++; if(f % 2 === 1) leCount++; } }); }
    }
    if (total === 0) return null;
    if (leCount > total * 0.6) return { pred: "Xỉu", conf: 64, reason: "Xúc xắc lẻ nhiều" };
    if (leCount < total * 0.4) return { pred: "Tài", conf: 64, reason: "Xúc xắc chẵn nhiều" };
    return null;
  }
  
  phanTichTongDiem(tongData) {
    if (!tongData || tongData.length < 10) return null;
    const avg = tongData.slice(0,10).reduce((a,b)=>a+b,0)/10;
    if (avg > 11.5) return { pred: "Xỉu", conf: 68, reason: `Tổng cao TB ${avg.toFixed(1)}` };
    if (avg < 9.5) return { pred: "Tài", conf: 68, reason: `Tổng thấp TB ${avg.toFixed(1)}` };
    return null;
  }
  
  tongHop(lichSu, tongData, diceData) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phanTichXucXacFreq(diceData);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phanTichChanLe(diceData);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    const b3 = this.phanTichTongDiem(tongData);
    if (b3) { soTT++; if (b3.pred === "Tài") diemTai += b3.conf; else diemXiu += b3.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(85, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData, diceData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu, tongData, diceData);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán BETVIP MD5` };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// ==========================================
// ========== THUẬT TOÁN 789CLUB TX ==========
// ==========================================
class Club789TXAlgorithm {
  constructor() { this.name = "CLUB789_TX - Chuyên cầu 1-1 & zigzag"; }
  
  phatHienCau1_1(lichSu) {
    if (lichSu.length < 5) return null;
    let zigzag = 0;
    for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
    if (zigzag >= 4) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 80, reason: "Cầu 1-1 hoàn hảo" };
    if (zigzag >= 3) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 74, reason: "Cầu 1-1" };
    return null;
  }
  
  phatHienZigzagDai(lichSu) {
    if (lichSu.length < 7) return null;
    let isZigzag = true;
    for (let i = 1; i < 7; i++) if (lichSu[i] === lichSu[i-1]) { isZigzag = false; break; }
    if (isZigzag) return { pred: lichSu[6] === "Tài" ? "Xỉu" : "Tài", conf: 84, reason: "Zigzag dài 7 phiên" };
    return null;
  }
  
  phatHienCauDoiXung(lichSu) {
    if (lichSu.length < 9) return null;
    let isMirror = true;
    for (let i = 0; i < 4; i++) if (lichSu[i] !== lichSu[8-i]) { isMirror = false; break; }
    if (isMirror) return { pred: lichSu[4] === "Tài" ? "Xỉu" : "Tài", conf: 76, reason: "Cầu đối xứng" };
    return null;
  }
  
  tongHop(lichSu) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phatHienCau1_1(lichSu);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phatHienZigzagDai(lichSu);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    const b3 = this.phatHienCauDoiXung(lichSu);
    if (b3) { soTT++; if (b3.pred === "Tài") diemTai += b3.conf; else diemXiu += b3.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán 789CLUB` };
    const last3 = lichSu.slice(0,3);
    const tai3 = last3.filter(r => r === "Tài").length;
    return { du_doan: tai3 >= 2 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: "Xu hướng 3 phiên" };
  }
}

// ==========================================
// ========== THUẬT TOÁN B52 ==========
// ==========================================
class B52Algorithm {
  constructor() { this.name = "B52 - Chuyên RSI & chỉ báo kỹ thuật"; }
  
  tinhRSI(lichSu) {
    if (lichSu.length < 14) return null;
    const nums = lichSu.slice(0,14).map(r => r === "Tài" ? 1 : 0);
    let gains = 0, losses = 0;
    for (let i = 1; i < nums.length; i++) {
      const diff = nums[i] - nums[i-1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / 14, avgLoss = losses / 14;
    const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
    if (rsi >= 70) return { pred: "Xỉu", conf: 72, reason: `RSI quá mua (${rsi.toFixed(0)})` };
    if (rsi <= 30) return { pred: "Tài", conf: 72, reason: `RSI quá bán (${rsi.toFixed(0)})` };
    return null;
  }
  
  tinhMACD(lichSu) {
    if (lichSu.length < 26) return null;
    const nums = lichSu.map(r => r === "Tài" ? 1 : 0);
    const ema12 = nums.slice(-12).reduce((a,b)=>a+b,0)/12;
    const ema26 = nums.slice(-26).reduce((a,b)=>a+b,0)/26;
    const macd = ema12 - ema26;
    if (macd > 0.12) return { pred: "Xỉu", conf: 66, reason: `MACD cắt xuống (${macd.toFixed(2)})` };
    if (macd < -0.12) return { pred: "Tài", conf: 66, reason: `MACD cắt lên (${macd.toFixed(2)})` };
    return null;
  }
  
  tinhBollinger(lichSu) {
    if (lichSu.length < 20) return null;
    const nums = lichSu.slice(0,20).map(r => r === "Tài" ? 1 : 0);
    const mean = nums.reduce((a,b)=>a+b,0)/20;
    const variance = nums.reduce((sum,x)=>sum+Math.pow(x-mean,2),0)/20;
    const std = Math.sqrt(variance);
    const last = nums[nums.length-1];
    if (last > mean + 2*std) return { pred: "Xỉu", conf: 68, reason: "Chạm dải trên" };
    if (last < mean - 2*std) return { pred: "Tài", conf: 68, reason: "Chạm dải dưới" };
    return null;
  }
  
  tongHop(lichSu) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.tinhRSI(lichSu);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.tinhMACD(lichSu);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    const b3 = this.tinhBollinger(lichSu);
    if (b3) { soTT++; if (b3.pred === "Tài") diemTai += b3.conf; else diemXiu += b3.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán B52` };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// ==========================================
// ========== THUẬT TOÁN MAX789 ==========
// ==========================================
class Max789Algorithm {
  constructor() { this.name = "MAX789 - Chuyên Fibonacci & chu kỳ"; }
  
  phatHienFibonacci(lichSu) {
    const fibs = [2,3,5,8,13];
    let match = 0;
    for (let f of fibs) {
      if (lichSu.length > f && lichSu[0] === lichSu[f]) match++;
    }
    if (match >= 3) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 74, reason: `Fibonacci ${match}/5` };
    return null;
  }
  
  phatHienChuKy(lichSu) {
    if (lichSu.length < 16) return null;
    for (let cycle = 3; cycle <= 8; cycle++) {
      if (lichSu.slice(0, cycle).join('') === lichSu.slice(cycle, cycle*2).join('')) {
        let nextPred = lichSu[cycle*2] === lichSu[0] ? lichSu[0] : (lichSu[0] === "Tài" ? "Xỉu" : "Tài");
        return { pred: nextPred, conf: 72, reason: `Chu kỳ ${cycle} phiên` };
      }
    }
    return null;
  }
  
  phatHienPatternLap(lichSu) {
    if (lichSu.length < 12) return null;
    const p4 = lichSu.slice(0,4);
    if (lichSu.slice(4,8).join('') === p4.join('') && lichSu.slice(8,12).join('') === p4.join('')) {
      return { pred: p4[3] === "Tài" ? "Xỉu" : "Tài", conf: 82, reason: "Pattern lặp 4-4-4" };
    }
    return null;
  }
  
  tongHop(lichSu) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phatHienFibonacci(lichSu);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phatHienChuKy(lichSu);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    const b3 = this.phatHienPatternLap(lichSu);
    if (b3) { soTT++; if (b3.pred === "Tài") diemTai += b3.conf; else diemXiu += b3.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán MAX789` };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// ==========================================
// ========== THUẬT TOÁN LUCK8 MD5 ==========
// ==========================================
class Luck8MD5Algorithm {
  constructor() { this.name = "LUCK8_MD5 - Chuyên Machine Learning"; }
  
  knnPredict(lichSu) {
    if (lichSu.length < 15) return null;
    const k = 5, lookback = 8;
    const query = lichSu.slice(0, lookback);
    const distances = [];
    for (let i = 0; i < lichSu.length - lookback - 1; i++) {
      const seg = lichSu.slice(i, i + lookback);
      let diff = 0;
      for (let j = 0; j < lookback; j++) if (seg[j] !== query[j]) diff++;
      distances.push({ diff, next: lichSu[i + lookback] });
    }
    distances.sort((a,b) => a.diff - b.diff);
    const neighbors = distances.slice(0, k).map(d => d.next);
    const taiNei = neighbors.filter(n => n === "Tài").length;
    const pred = taiNei > k/2 ? "Tài" : "Xỉu";
    let conf = 60 + Math.min(20, (k - distances[0].diff) * 3);
    return { pred, conf: Math.min(80, conf), reason: "KNN láng giềng" };
  }
  
  decisionTree(lichSu) {
    if (lichSu.length < 10) return null;
    const last1 = lichSu[0], last2 = lichSu[1], last3 = lichSu[2];
    const t5 = lichSu.slice(0,5).filter(r => r === "Tài").length;
    if (last1 === "Tài" && last2 === "Tài" && last3 === "Tài") return { pred: "Xỉu", conf: 72, reason: "Cây quyết định - bệt 3" };
    if (last1 === "Xỉu" && last2 === "Xỉu" && last3 === "Xỉu") return { pred: "Tài", conf: 72, reason: "Cây quyết định - bệt 3" };
    if (t5 >= 4) return { pred: "Xỉu", conf: 66, reason: "Cây quyết định - nóng" };
    if (t5 <= 1) return { pred: "Tài", conf: 66, reason: "Cây quyết định - lạnh" };
    return null;
  }
  
  linearRegression(lichSu) {
    if (lichSu.length < 12) return null;
    const y = lichSu.slice(0,12).map(r => r === "Tài" ? 1 : 0);
    const x = Array.from({length:12}, (_,i)=>i);
    const n = 12;
    const sumX = x.reduce((a,b)=>a+b,0), sumY = y.reduce((a,b)=>a+b,0);
    const sumXY = x.reduce((s,xi,i)=>s+xi*y[i],0), sumX2 = x.reduce((s,xi)=>s+xi*xi,0);
    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return null;
    const slope = (n * sumXY - sumX * sumY) / denom;
    const pred = slope * 12 + (sumY - slope * sumX) / n;
    return { pred: pred > 0.5 ? "Tài" : "Xỉu", conf: 60 + Math.abs(slope)*15, reason: "Linear regression" };
  }
  
  tongHop(lichSu) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.knnPredict(lichSu);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.decisionTree(lichSu);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    const b3 = this.linearRegression(lichSu);
    if (b3) { soTT++; if (b3.pred === "Tài") diemTai += b3.conf; else diemXiu += b3.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán LUCK8` };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// ==========================================
// ========== THUẬT TOÁN SUMVIN MD5 ==========
// ==========================================
class SumvinMD5Algorithm {
  constructor() { this.name = "SUMVIN_MD5 - Chuyên pattern đặc biệt"; }
  
  phatHienCau123(lichSu) {
    if (lichSu.length < 12) return null;
    if (lichSu[0] === lichSu[1] && lichSu[2] !== lichSu[1] && lichSu[3] === lichSu[4] && lichSu[4] === lichSu[5]) {
      return { pred: lichSu[2], conf: 78, reason: "Cầu 1-2-3" };
    }
    return null;
  }
  
  phatHienCau321(lichSu) {
    if (lichSu.length < 12) return null;
    if (lichSu[0] !== lichSu[1] && lichSu[1] !== lichSu[2] && lichSu[2] === lichSu[3] && lichSu[3] === lichSu[4]) {
      return { pred: lichSu[4] === "Tài" ? "Xỉu" : "Tài", conf: 76, reason: "Cầu 3-2-1" };
    }
    return null;
  }
  
  phatHienCauRongHo(lichSu) {
    let tRun = 0, xRun = 0;
    for (let i = lichSu.length - 1; i >= 0; i--) {
      if (lichSu[i] === "Tài") tRun++;
      else break;
    }
    for (let i = lichSu.length - 1; i >= 0; i--) {
      if (lichSu[i] === "Xỉu") xRun++;
      else break;
    }
    if (tRun >= 6) return { pred: "Xỉu", conf: 84, reason: "Cầu Rồng" };
    if (xRun >= 6) return { pred: "Tài", conf: 84, reason: "Cầu Hổ" };
    return null;
  }
  
  tongHop(lichSu) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phatHienCau123(lichSu);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phatHienCau321(lichSu);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    const b3 = this.phatHienCauRongHo(lichSu);
    if (b3) { soTT++; if (b3.pred === "Tài") diemTai += b3.conf; else diemXiu += b3.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán SUMVIN` };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// ==========================================
// ========== THUẬT TOÁN GB68 THƯỜNG ==========
// ==========================================
class GB68ThuongAlgorithm {
  constructor() { this.name = "GB68_THUONG - Chuyên cầu ngắn hạn 3-5 phiên"; }
  
  phatHienCauNgan(lichSu) {
    if (lichSu.length < 5) return null;
    const last3 = lichSu.slice(0,3);
    const tai3 = last3.filter(r => r === "Tài").length;
    if (tai3 === 3) return { pred: "Xỉu", conf: 74, reason: "Bệt Tài 3 - bẻ" };
    if (tai3 === 0) return { pred: "Tài", conf: 74, reason: "Bệt Xỉu 3 - bẻ" };
    if (tai3 === 2) return { pred: "Tài", conf: 66, reason: "2T/3 - theo Tài" };
    if (tai3 === 1) return { pred: "Xỉu", conf: 66, reason: "2X/3 - theo Xỉu" };
    return null;
  }
  
  phatHienCau1_1Ngan(lichSu) {
    if (lichSu.length < 5) return null;
    let zigzag = 0;
    for (let i = 1; i < 4; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
    if (zigzag >= 3) return { pred: lichSu[3] === "Tài" ? "Xỉu" : "Tài", conf: 72, reason: "Cầu 1-1 ngắn" };
    return null;
  }
  
  tongHop(lichSu) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phatHienCauNgan(lichSu);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phatHienCau1_1Ngan(lichSu);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(85, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán GB68` };
    const last3 = lichSu.slice(0,3);
    const tai3 = last3.filter(r => r === "Tài").length;
    return { du_doan: tai3 >= 2 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: "Xu hướng 3 phiên" };
  }
}

// ==========================================
// ========== THUẬT TOÁN GB68 MD5 ==========
// ==========================================
class GB68MD5Algorithm {
  constructor() { this.name = "GB68_MD5 - Chuyên phân tích chẵn lẻ tổng điểm"; }
  
  phanTichTongDiemChanLe(tongData) {
    if (!tongData || tongData.length < 10) return null;
    const last10 = tongData.slice(0,10);
    const chanCount = last10.filter(t => t % 2 === 0).length;
    if (chanCount >= 7) return { pred: "Xỉu", conf: 70, reason: "Tổng chẵn nhiều" };
    if (chanCount <= 3) return { pred: "Tài", conf: 70, reason: "Tổng lẻ nhiều" };
    return null;
  }
  
  phanTichTongDiemTrungBinh(tongData) {
    if (!tongData || tongData.length < 10) return null;
    const avg = tongData.slice(0,10).reduce((a,b)=>a+b,0)/10;
    if (avg > 11.5) return { pred: "Xỉu", conf: 66, reason: `Tổng cao TB ${avg.toFixed(1)}` };
    if (avg < 9.5) return { pred: "Tài", conf: 66, reason: `Tổng thấp TB ${avg.toFixed(1)}` };
    return null;
  }
  
  tongHop(lichSu, tongData) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phanTichTongDiemChanLe(tongData);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phanTichTongDiemTrungBinh(tongData);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(85, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu, tongData);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán GB68 MD5` };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// ==========================================
// ========== THUẬT TOÁN ALO HITCLUB MD5 ==========
// ==========================================
class AloHitclubMD5Algorithm {
  constructor() { this.name = "ALO_HITCLUB_MD5 - Chuyên tổng hợp đa tầng"; }
  
  phatHienCauBet(lichSu) {
    if (lichSu.length < 3) return null;
    let streak = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[i-1]) streak++;
      else break;
    }
    if (streak >= 4) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 80, reason: "Bệt dài - bẻ" };
    if (streak === 3) return { pred: lichSu[0], conf: 68, reason: "Bệt 3 - theo" };
    return null;
  }
  
  phanTichXucXac(diceData) {
    if (!diceData || diceData.length < 10) return null;
    const freq = {1:0,2:0,3:0,4:0,5:0,6:0};
    for (let d of diceData.slice(0,20)) {
      if (d && d.length === 3) d.forEach(f => { if(f) freq[f]++; });
    }
    const maxFace = Object.keys(freq).reduce((a,b) => freq[a] > freq[b] ? a : b);
    if (maxFace >= 5) return { pred: "Tài", conf: 68, reason: `Mặt ${maxFace} nhiều` };
    if (maxFace <= 2) return { pred: "Xỉu", conf: 68, reason: `Mặt ${maxFace} nhiều` };
    return null;
  }
  
  phanTichXuHuong(lichSu) {
    if (lichSu.length < 10) return null;
    const tai10 = lichSu.slice(0,10).filter(r => r === "Tài").length;
    if (tai10 >= 7) return { pred: "Xỉu", conf: 74, reason: `Tài ${tai10}/10 - bẻ` };
    if (tai10 <= 3) return { pred: "Tài", conf: 74, reason: `Xỉu ${10-tai10}/10 - bẻ` };
    return null;
  }
  
  tongHop(lichSu, diceData) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phatHienCauBet(lichSu);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phanTichXucXac(diceData);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    const b3 = this.phanTichXuHuong(lichSu);
    if (b3) { soTT++; if (b3.pred === "Tài") diemTai += b3.conf; else diemXiu += b3.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData, diceData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu, diceData);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán ALO HITCLUB` };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// ==========================================
// ========== THUẬT TOÁN SUNWIN SICBO ==========
// ==========================================
class SunwinSicboAlgorithm {
  constructor() { this.name = "SUNWIN_SICBO - Chuyên Sicbo (có Bão)"; }
  
  phatHienBao(diceData) {
    if (!diceData || diceData.length < 1) return null;
    const last = diceData[0];
    if (last && last[0] === last[1] && last[1] === last[2]) {
      return { pred: "Tài", conf: 70, reason: "Sau Bão - Tài" };
    }
    return null;
  }
  
  phatHienXuHuong(lichSu) {
    if (lichSu.length < 5) return null;
    const last5 = lichSu.slice(0,5);
    const tai5 = last5.filter(r => r === "Tài").length;
    if (tai5 >= 4) return { pred: "Xỉu", conf: 74, reason: `Tài ${tai5}/5 - bẻ` };
    if (tai5 <= 1) return { pred: "Tài", conf: 74, reason: `Xỉu ${5-tai5}/5 - bẻ` };
    return { pred: tai5 >= 3 ? "Tài" : "Xỉu", conf: 64, reason: "Theo xu hướng" };
  }
  
  phatHienCau1_1(lichSu) {
    if (lichSu.length < 5) return null;
    let zigzag = 0;
    for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
    if (zigzag >= 3) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 72, reason: "Cầu 1-1" };
    return null;
  }
  
  tongHop(lichSu, diceData) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phatHienBao(diceData);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phatHienXuHuong(lichSu);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    const b3 = this.phatHienCau1_1(lichSu);
    if (b3) { soTT++; if (b3.pred === "Tài") diemTai += b3.conf; else diemXiu += b3.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData, diceData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu, diceData);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán SICBO` };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// ==========================================
// ========== THUẬT TOÁN LUCK8 SICBO40 ==========
// ==========================================
class Luck8Sicbo40Algorithm {
  constructor() { this.name = "LUCK8_SICBO40 - Chuyên Sicbo tốc độ cao"; }
  
  phatHienXuHuongNhanh(lichSu) {
    if (lichSu.length < 4) return null;
    const last3 = lichSu.slice(0,3);
    const tai3 = last3.filter(r => r === "Tài").length;
    if (tai3 === 3) return { pred: "Xỉu", conf: 72, reason: "Bệt Tài 3 - bẻ" };
    if (tai3 === 0) return { pred: "Tài", conf: 72, reason: "Bệt Xỉu 3 - bẻ" };
    if (tai3 === 2) return { pred: "Xỉu", conf: 66, reason: "2T/3 - bẻ nhẹ" };
    if (tai3 === 1) return { pred: "Tài", conf: 66, reason: "2X/3 - bẻ nhẹ" };
    return null;
  }
  
  phatHienCauNhanh(lichSu) {
    if (lichSu.length < 6) return null;
    let zigzag = 0;
    for (let i = 1; i < 4; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
    if (zigzag >= 3) return { pred: lichSu[3] === "Tài" ? "Xỉu" : "Tài", conf: 70, reason: "Cầu 1-1 nhanh" };
    return null;
  }
  
  tongHop(lichSu) {
    let diemTai = 0, diemXiu = 0, soTT = 0;
    const b1 = this.phatHienXuHuongNhanh(lichSu);
    if (b1) { soTT++; if (b1.pred === "Tài") diemTai += b1.conf; else diemXiu += b1.conf; }
    const b2 = this.phatHienCauNhanh(lichSu);
    if (b2) { soTT++; if (b2.pred === "Tài") diemTai += b2.conf; else diemXiu += b2.conf; }
    if (soTT === 0) return null;
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(85, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 4) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán SICBO40` };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// ==========================================
// ========== THUẬT TOÁN LC79 XÓC ĐĨA ==========
// ==========================================
class LC79XocDiaAlgorithm {
  constructor() { this.name = "LC79_XOCDIA - Chuyên Xóc Đĩa Chẵn/Lẻ"; }
  
  phatHienCauBet(lichSu) {
    if (lichSu.length < 3) return null;
    let streak = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[i-1]) streak++;
      else break;
    }
    if (streak >= 4) return { pred: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", conf: 78, reason: "Bệt dài - bẻ cầu" };
    if (streak === 3) return { pred: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", conf: 70, reason: "Bệt 3 - chuẩn bị gãy" };
    return null;
  }
  
  phatHienXuHuong(lichSu) {
    if (lichSu.length < 5) return null;
    const last5 = lichSu.slice(0,5);
    const chan5 = last5.filter(r => r === "Chẵn").length;
    if (chan5 >= 4) return { pred: "Lẻ", conf: 74, reason: "Chẵn nóng - bẻ Lẻ" };
    if (chan5 <= 1) return { pred: "Chẵn", conf: 74, reason: "Lẻ nóng - bẻ Chẵn" };
    return { pred: chan5 >= 3 ? "Chẵn" : "Lẻ", conf: 62, reason: `Theo xu hướng ${chan5}C-${5-chan5}L` };
  }
  
  phatHienCau1_1(lichSu) {
    if (lichSu.length < 5) return null;
    let zigzag = 0;
    for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
    if (zigzag >= 3) return { pred: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", conf: 72, reason: "Cầu 1-1" };
    return null;
  }
  
  tongHop(lichSu) {
    let diemChan = 0, diemLe = 0, soTT = 0;
    const b1 = this.phatHienCauBet(lichSu);
    if (b1) { soTT++; if (b1.pred === "Chẵn") diemChan += b1.conf; else diemLe += b1.conf; }
    const b2 = this.phatHienXuHuong(lichSu);
    if (b2) { soTT++; if (b2.pred === "Chẵn") diemChan += b2.conf; else diemLe += b2.conf; }
    const b3 = this.phatHienCau1_1(lichSu);
    if (b3) { soTT++; if (b3.pred === "Chẵn") diemChan += b3.conf; else diemLe += b3.conf; }
    if (soTT === 0) return null;
    const pred = diemChan > diemLe ? "Chẵn" : "Lẻ";
    let conf = Math.abs(diemChan - diemLe) / (diemChan + diemLe) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { pred, conf: Math.round(conf), soTT };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Chẵn", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = this.tongHop(lichSu);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán XÓC ĐĨA` };
    return { du_doan: "Chẵn", do_tin_cay: 58, giai_thich: "Mặc định Chẵn" };
  }
}

// ==========================================
// KHỞI TẠO CÁC ALGORITHM
// ==========================================
const algorithms = {
  'sunwin_tx': new SunwinTXAlgorithm(),
  'lc79_tx': new LC79TXAlgorithm(),
  'lc79_md5': new LC79MD5Algorithm(),
  'betvip_tx': new BetvipTXAlgorithm(),
  'betvip_md5': new BetvipMD5Algorithm(),
  'club789_tx': new Club789TXAlgorithm(),
  'b52': new B52Algorithm(),
  'max789': new Max789Algorithm(),
  'luck8_md5': new Luck8MD5Algorithm(),
  'sumvin_md5': new SumvinMD5Algorithm(),
  'gb68_thuong': new GB68ThuongAlgorithm(),
  'gb68_md5': new GB68MD5Algorithm(),
  'alo_hitclub_md5': new AloHitclubMD5Algorithm(),
  'sunwin_sicbo': new SunwinSicboAlgorithm(),
  'luck8_sicbo40': new Luck8Sicbo40Algorithm(),
  'lc79_xocdia': new LC79XocDiaAlgorithm()
};

// ==========================================
// XỬ LÝ REQUEST CHÍNH
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
      duDoan: {
        phien: data.phien + 1,
        du_doan: cached.prediction,
        do_tin_cay: cached.confidence + '%',
        giai_thich: cached.reason
      },
      thongKe: statsDB[gameKey]
    };
  }
  
  const algo = algorithms[gameKey];
  let prediction;
  if (isXocDia) {
    prediction = algo.predict(hist.data, hist.tongData);
  } else {
    prediction = algo.predict(hist.data, hist.tongData, hist.diceData);
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
    duDoan: {
      phien: data.phien + 1,
      du_doan: prediction.du_doan,
      do_tin_cay: prediction.do_tin_cay + '%',
      giai_thich: prediction.giai_thich
    },
    thongKe: statsDB[gameKey]
  };
}

// ==========================================
// TẠO ENDPOINTS
// ==========================================
for (let gameKey in GAME_APIS) {
  const endpoint = `/${gameKey.replace(/_/g, '/')}`;
  app.get(endpoint, async (req, res) => {
    try {
      const result = await xuLyGame(gameKey);
      res.json({ game: gameKey.toUpperCase(), ...result, author: '@tranhoang2286', version: '16 GAME - 16 THUẬT TOÁN' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

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
  res.json({ thong_ke_tat_ca_game: allStats, tong_so_game: Object.keys(GAME_APIS).length });
});

app.get('/', (req, res) => {
  res.json({
    name: '🏆 16 GAME - 16 THUẬT TOÁN RIÊNG BIỆT 🏆',
    author: '@tranhoang2286',
    version: '16.0 - FULL',
    danh_sach_game: Object.keys(GAME_APIS).map(k => `/${k.replace(/_/g, '/')}`),
    thong_tin: 'Mỗi game có thuật toán riêng biệt, tối ưu cho từng loại hình'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏆 16 GAME - 16 THUẬT TOÁN RIÊNG - PORT ${PORT}`);
  for (let key in algorithms) {
    console.log(`  ✅ ${key.toUpperCase()} - ${algorithms[key].name}`);
  }
});
