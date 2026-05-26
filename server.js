const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// DANH SÁCH API
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
  'luck8_sicbo40': 'https://qld-incentives-tion-boost.trycloudflare.com/api/sicbo40',
  'lc79_xocdia': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/xocdia',
  'sunwin_sicbo': 'https://api.wsktnus8.net/v2/history/getLastResult?gameId=ktrng_3979&size=100&tableId=39791215743193&curPage=1'
};

// ==========================================
// LƯU TRỮ DỮ LIỆU
// ==========================================
const historyDB = {};
const cacheDB = {};
const statsDB = {};

for (let key in GAME_APIS) {
  historyDB[key] = { data: [], tongData: [], diceData: [], lichSuDuDoan: [] };
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

async function fetchSicboData(url) {
  try {
    const res = await axios.get(url, { 
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const data = res.data;
    if (!data || !data.data || !data.data.resultList || !data.data.resultList.length) return null;
    const last = data.data.resultList[0];
    const score = last.score;
    const resultType = last.resultType;
    const faces = last.facesList;
    const phien = parseInt(last.gameNum.replace('#', ''));
    let ketQua = resultType === 3 ? 'Tài' : (resultType === 4 ? 'Xỉu' : 'Bão');
    if (ketQua === 'Bão') return null;
    return { phien, ket_qua: ketQua, tong: score, dice: faces };
  } catch (err) {
    console.error('Lỗi fetch Sicbo:', err.message);
    return null;
  }
}

// ==========================================
// ========== THUẬT TOÁN RIÊNG CHO TỪNG GAME ==========
// ==========================================

// 1. THUẬT TOÁN SUNWIN TX - Chuyên bệt & Martingale
class SunwinTXAlgorithm {
  constructor() { this.name = "SUNWIN_TX - Chuyên bệt & Martingale"; }
  
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // Phát hiện bệt
    let bet = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[0]) bet++;
      else break;
    }
    if (bet >= 4) return { du_doan: lichSu[0], do_tin_cay: 70 + Math.min(15, bet * 2), giai_thich: `Bệt ${bet} - theo cầu` };
    if (bet === 3) return { du_doan: lichSu[0], do_tin_cay: 65, giai_thich: `Bệt 3 - theo cầu` };
    
    // Martingale 10 phiên
    if (lichSu.length >= 10) {
      const last10 = lichSu.slice(0, 10);
      const tai10 = last10.filter(r => r === "Tài").length;
      if (tai10 >= 8) return { du_doan: "Xỉu", do_tin_cay: 78, giai_thich: `Tài ${tai10}/10 - bẻ Xỉu` };
      if (tai10 <= 2) return { du_doan: "Tài", do_tin_cay: 78, giai_thich: `Xỉu ${10-tai10}/10 - bẻ Tài` };
      if (tai10 >= 7) return { du_doan: "Xỉu", do_tin_cay: 72, giai_thich: `Tài ${tai10}/10 - bẻ nhẹ` };
      if (tai10 <= 3) return { du_doan: "Tài", do_tin_cay: 72, giai_thich: `Xỉu ${10-tai10}/10 - bẻ nhẹ` };
    }
    
    // Xu hướng 3 phiên
    const last3 = lichSu.slice(0, 3);
    const tai3 = last3.filter(r => r === "Tài").length;
    return { du_doan: tai3 >= 2 ? "Tài" : "Xỉu", do_tin_cay: 62, giai_thich: `Xu hướng ${tai3}T-${3-tai3}X` };
  }
}

// 2. THUẬT TOÁN LC79 TX - Chuyên tổng điểm
class LC79TXAlgorithm {
  constructor() { this.name = "LC79_TX - Chuyên tổng điểm & xúc xắc"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // Phân tích tổng điểm
    if (tongData && tongData.length >= 10) {
      const avg = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
      if (avg > 11.5) return { du_doan: "Xỉu", do_tin_cay: 70, giai_thich: `Tổng cao TB ${avg.toFixed(1)}` };
      if (avg < 9.5) return { du_doan: "Tài", do_tin_cay: 70, giai_thich: `Tổng thấp TB ${avg.toFixed(1)}` };
    }
    
    // Phát hiện bệt
    let bet = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[0]) bet++;
      else break;
    }
    if (bet >= 4) return { du_doan: lichSu[0], do_tin_cay: 72, giai_thich: `Bệt ${bet} - theo cầu` };
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 62, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 3. THUẬT TOÁN LC79 MD5 - Chuyên Markov & pattern
class LC79MD5Algorithm {
  constructor() { this.name = "LC79_MD5 - Chuyên Markov & pattern lặp"; }
  
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // Pattern lặp 3
    if (lichSu.length >= 9) {
      const p3 = lichSu.slice(0, 3);
      if (lichSu.slice(3, 6).join('') === p3.join('') && lichSu.slice(6, 9).join('') === p3.join('')) {
        return { du_doan: p3[2] === "Tài" ? "Xỉu" : "Tài", do_tin_cay: 80, giai_thich: "Pattern lặp 3-3-3 - bẻ" };
      }
    }
    
    // Markov bậc 2
    if (lichSu.length >= 10) {
      const map = new Map();
      for (let i = 0; i < lichSu.length - 2; i++) {
        const key = lichSu[i] + ',' + lichSu[i+1];
        const next = lichSu[i+2];
        if (!map.has(key)) map.set(key, { T: 0, X: 0 });
        if (next === "Tài") map.get(key).T++;
        else map.get(key).X++;
      }
      const lastKey = lichSu[0] + ',' + lichSu[1];
      const stat = map.get(lastKey);
      if (stat && stat.T + stat.X >= 2) {
        const pred = stat.T > stat.X ? "Tài" : "Xỉu";
        return { du_doan: pred, do_tin_cay: 70, giai_thich: "Markov bậc 2" };
      }
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 4. THUẬT TOÁN BETVIP TX - Chuyên Martingale pro
class BetvipTXAlgorithm {
  constructor() { this.name = "BETVIP_TX - Chuyên Martingale pro"; }
  
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // Martingale 10 phiên
    if (lichSu.length >= 10) {
      const last10 = lichSu.slice(0, 10);
      const tai10 = last10.filter(r => r === "Tài").length;
      if (tai10 >= 9) return { du_doan: "Xỉu", do_tin_cay: 85, giai_thich: `Tài ${tai10}/10 - bẻ Xỉu chắc` };
      if (tai10 <= 1) return { du_doan: "Tài", do_tin_cay: 85, giai_thich: `Xỉu ${10-tai10}/10 - bẻ Tài chắc` };
      if (tai10 >= 8) return { du_doan: "Xỉu", do_tin_cay: 78, giai_thich: `Tài ${tai10}/10 - bẻ Xỉu` };
      if (tai10 <= 2) return { du_doan: "Tài", do_tin_cay: 78, giai_thich: `Xỉu ${10-tai10}/10 - bẻ Tài` };
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    const duDoan = tai5 >= 3 ? "Tài" : "Xỉu";
    let conf = 55 + Math.abs(tai5 - 2.5) * 10;
    return { du_doan: duDoan, do_tin_cay: Math.min(75, Math.round(conf)), giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 5. THUẬT TOÁN BETVIP MD5 - Chuyên xúc xắc
class BetvipMD5Algorithm {
  constructor() { this.name = "BETVIP_MD5 - Chuyên xúc xắc & tần suất"; }
  
  predict(lichSu, diceData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // Phân tích tần suất mặt xúc xắc
    if (diceData && diceData.length >= 10) {
      const freq = {1:0,2:0,3:0,4:0,5:0,6:0};
      for (let d of diceData.slice(0, 20)) {
        if (d && d.length === 3) d.forEach(f => { if (f) freq[f]++; });
      }
      const maxFace = Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
      if (maxFace >= 5) return { du_doan: "Tài", do_tin_cay: 68, giai_thich: `Mặt ${maxFace} xuất hiện nhiều` };
      if (maxFace <= 2) return { du_doan: "Xỉu", do_tin_cay: 68, giai_thich: `Mặt ${maxFace} xuất hiện nhiều` };
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 6. THUẬT TOÁN 789CLUB TX - Chuyên cầu 1-1
class Club789TXAlgorithm {
  constructor() { this.name = "CLUB789_TX - Chuyên cầu 1-1 & zigzag"; }
  
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // Cầu 1-1
    let zigzag = 0;
    for (let i = 1; i < 5; i++) {
      if (lichSu[i] !== lichSu[i-1]) zigzag++;
    }
    if (zigzag >= 4) return { du_doan: lichSu[0] === "Tài" ? "Xỉu" : "Tài", do_tin_cay: 78, giai_thich: "Cầu 1-1 hoàn hảo" };
    if (zigzag >= 3) return { du_doan: lichSu[0] === "Tài" ? "Xỉu" : "Tài", do_tin_cay: 72, giai_thich: "Cầu 1-1" };
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 7. THUẬT TOÁN B52 - Chuyên chỉ báo kỹ thuật
class B52Algorithm {
  constructor() { this.name = "B52 - Chuyên chỉ báo kỹ thuật"; }
  
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // RSI giả lập
    if (lichSu.length >= 14) {
      const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
      let gains = 0, losses = 0;
      for (let i = 1; i < nums.length; i++) {
        const diff = nums[i] - nums[i-1];
        if (diff > 0) gains += diff;
        else losses -= diff;
      }
      const rsi = losses === 0 ? 100 : 100 - (100 / (1 + gains / losses));
      if (rsi >= 70) return { du_doan: "Xỉu", do_tin_cay: 72, giai_thich: "RSI quá mua - bẻ Xỉu" };
      if (rsi <= 30) return { du_doan: "Tài", do_tin_cay: 72, giai_thich: "RSI quá bán - bẻ Tài" };
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 8. THUẬT TOÁN MAX789 - Chuyên Fibonacci & chu kỳ
class Max789Algorithm {
  constructor() { this.name = "MAX789 - Chuyên Fibonacci & chu kỳ"; }
  
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // Chu kỳ 8
    if (lichSu.length >= 16) {
      const c1 = lichSu.slice(0, 8).join('');
      const c2 = lichSu.slice(8, 16).join('');
      if (c1 === c2) {
        return { du_doan: c1[0] === "T" ? "Xỉu" : "Tài", do_tin_cay: 75, giai_thich: "Chu kỳ 8 phiên - bẻ" };
      }
    }
    
    // Fibonacci
    const fibs = [2, 3, 5];
    let match = 0;
    for (let f of fibs) {
      if (lichSu.length > f && lichSu[0] === lichSu[f]) match++;
    }
    if (match >= 2) {
      return { du_doan: lichSu[0] === "Tài" ? "Xỉu" : "Tài", do_tin_cay: 70, giai_thich: "Fibonacci - bẻ cầu" };
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 9. THUẬT TOÁN LUCK8 MD5 - Chuyên KNN & decision tree
class Luck8MD5Algorithm {
  constructor() { this.name = "LUCK8_MD5 - Chuyên Machine Learning"; }
  
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // KNN đơn giản
    if (lichSu.length >= 10) {
      const last5 = lichSu.slice(0, 5);
      let match = 0;
      for (let i = 5; i < lichSu.length - 5; i++) {
        let isMatch = true;
        for (let j = 0; j < 5; j++) {
          if (last5[j] !== lichSu[i + j]) { isMatch = false; break; }
        }
        if (isMatch) match++;
      }
      if (match >= 2) {
        return { du_doan: last5[4] === "Tài" ? "Xỉu" : "Tài", do_tin_cay: 72, giai_thich: "KNN pattern - bẻ cầu" };
      }
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 10. THUẬT TOÁN SUMVIN MD5 - Chuyên pattern đặc biệt
class SumvinMD5Algorithm {
  constructor() { this.name = "SUMVIN_MD5 - Chuyên pattern đặc biệt"; }
  
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // Pattern 1-2-3
    if (lichSu.length >= 6) {
      if (lichSu[0] === lichSu[1] && lichSu[3] === lichSu[4] && lichSu[0] !== lichSu[3]) {
        return { du_doan: lichSu[0], do_tin_cay: 72, giai_thich: "Pattern 2-1 - theo nhịp" };
      }
    }
    
    // Cầu Rồng Hổ
    let tRun = 0, xRun = 0;
    for (let i = lichSu.length - 1; i >= 0; i--) {
      if (lichSu[i] === "Tài") tRun++;
      else break;
    }
    for (let i = lichSu.length - 1; i >= 0; i--) {
      if (lichSu[i] === "Xỉu") xRun++;
      else break;
    }
    if (tRun >= 5) return { du_doan: "Xỉu", do_tin_cay: 75, giai_thich: `Cầu Rồng ${tRun} Tài - bẻ Xỉu` };
    if (xRun >= 5) return { du_doan: "Tài", do_tin_cay: 75, giai_thich: `Cầu Hổ ${xRun} Xỉu - bẻ Tài` };
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 11. THUẬT TOÁN GB68 THƯỜNG - Chuyên cầu ngắn hạn
class GB68ThuongAlgorithm {
  constructor() { this.name = "GB68_THUONG - Chuyên cầu ngắn hạn"; }
  
  predict(lichSu) {
    if (lichSu.length < 4) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // Bệt 3
    const last3 = lichSu.slice(0, 3);
    const tai3 = last3.filter(r => r === "Tài").length;
    if (tai3 === 3) return { du_doan: "Xỉu", do_tin_cay: 70, giai_thich: "Bệt Tài 3 - bẻ Xỉu" };
    if (tai3 === 0) return { du_doan: "Tài", do_tin_cay: 70, giai_thich: "Bệt Xỉu 3 - bẻ Tài" };
    if (tai3 === 2) return { du_doan: "Tài", do_tin_cay: 64, giai_thich: "2T/3 - theo Tài" };
    return { du_doan: "Xỉu", do_tin_cay: 64, giai_thich: "2X/3 - theo Xỉu" };
  }
}

// 12. THUẬT TOÁN GB68 MD5 - Chuyên tổng điểm
class GB68MD5Algorithm {
  constructor() { this.name = "GB68_MD5 - Chuyên tổng điểm chẵn lẻ"; }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // Phân tích tổng điểm
    if (tongData && tongData.length >= 5) {
      const avg = tongData.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      if (avg > 11.5) return { du_doan: "Xỉu", do_tin_cay: 68, giai_thich: `Tổng cao TB ${avg.toFixed(1)}` };
      if (avg < 9.5) return { du_doan: "Tài", do_tin_cay: 68, giai_thich: `Tổng thấp TB ${avg.toFixed(1)}` };
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 13. THUẬT TOÁN ALO HITCLUB MD5 - Chuyên tổng hợp
class AloHitclubMD5Algorithm {
  constructor() { this.name = "ALO_HITCLUB_MD5 - Chuyên tổng hợp đa tầng"; }
  
  predict(lichSu, diceData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // Phân tích xúc xắc
    if (diceData && diceData.length >= 10) {
      let sum = 0, count = 0;
      for (let d of diceData.slice(0, 10)) {
        if (d && d.length === 3) { sum += d[0] + d[1] + d[2]; count++; }
      }
      if (count > 0) {
        const avg = sum / count;
        if (avg > 11) return { du_doan: "Xỉu", do_tin_cay: 66, giai_thich: `TB xúc xắc ${avg.toFixed(1)}` };
        if (avg < 10) return { du_doan: "Tài", do_tin_cay: 66, giai_thich: `TB xúc xắc ${avg.toFixed(1)}` };
      }
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 14. THUẬT TOÁN LUCK8 SICBO40 - Chuyên tốc độ cao
class Luck8Sicbo40Algorithm {
  constructor() { this.name = "LUCK8_SICBO40 - Chuyên tốc độ cao"; }
  
  predict(lichSu) {
    if (lichSu.length < 4) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    const last3 = lichSu.slice(0, 3);
    const tai3 = last3.filter(r => r === "Tài").length;
    if (tai3 === 3) return { du_doan: "Xỉu", do_tin_cay: 70, giai_thich: "Bệt Tài 3 - bẻ Xỉu" };
    if (tai3 === 0) return { du_doan: "Tài", do_tin_cay: 70, giai_thich: "Bệt Xỉu 3 - bẻ Tài" };
    if (tai3 === 2) return { du_doan: "Xỉu", do_tin_cay: 65, giai_thich: "2T/3 - bẻ Xỉu" };
    if (tai3 === 1) return { du_doan: "Tài", do_tin_cay: 65, giai_thich: "2X/3 - bẻ Tài" };
    return { du_doan: "Tài", do_tin_cay: 58, giai_thich: "Mặc định Tài" };
  }
}

// 15. THUẬT TOÁN XÓC ĐĨA
class LC79XocDiaAlgorithm {
  constructor() { this.name = "LC79_XOCDIA - Chuyên Chẵn/Lẻ"; }
  
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Chẵn", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    // Bệt
    let bet = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[0]) bet++;
      else break;
    }
    if (bet >= 4) return { du_doan: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", do_tin_cay: 75, giai_thich: `Bệt ${bet} - bẻ cầu` };
    if (bet === 3) return { du_doan: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", do_tin_cay: 68, giai_thich: "Bệt 3 - bẻ cầu" };
    
    // Cầu 1-1
    let zigzag = 0;
    for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
    if (zigzag >= 3) return { du_doan: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", do_tin_cay: 70, giai_thich: "Cầu 1-1 - đan xen" };
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const chan5 = last5.filter(r => r === "Chẵn").length;
    return { du_doan: chan5 >= 3 ? "Chẵn" : "Lẻ", do_tin_cay: 62, giai_thich: `Xu hướng ${chan5}C-${5-chan5}L` };
  }
}

// 16. THUẬT TOÁN SICBO SUNWIN
class SunwinSicboAlgorithm {
  constructor() { this.name = "SUNWIN_SICBO - Chuyên dự đoán 3 kết quả"; }
  
  duDoanTaiXiu(tongData) {
    if (tongData.length < 10) return { pred: "Tài", conf: 55 };
    const last10 = tongData.slice(0, 10);
    const tai10 = last10.filter(t => t >= 11).length;
    if (tai10 >= 7) return { pred: "Xỉu", conf: 72 };
    if (tai10 <= 3) return { pred: "Tài", conf: 72 };
    const last5 = tongData.slice(0, 5);
    const avg5 = last5.reduce((a, b) => a + b, 0) / 5;
    if (avg5 > 12) return { pred: "Xỉu", conf: 68 };
    if (avg5 < 9) return { pred: "Tài", conf: 68 };
    return { pred: tai10 >= 5 ? "Tài" : "Xỉu", conf: 60 };
  }
  
  duDoanChanLe(tongData) {
    if (tongData.length < 10) return { pred: "Chẵn", conf: 55 };
    const last10 = tongData.slice(0, 10);
    const chan10 = last10.filter(t => t % 2 === 0).length;
    if (chan10 >= 7) return { pred: "Lẻ", conf: 70 };
    if (chan10 <= 3) return { pred: "Chẵn", conf: 70 };
    return { pred: chan10 >= 5 ? "Chẵn" : "Lẻ", conf: 60 };
  }
  
  duDoanVi(tongData) {
    if (tongData.length < 15) return { vi1: 11, vi2: 14, vi3: 16, tong: 41, conf: 55 };
    const duDoanTaiXiu = this.duDoanTaiXiu(tongData).pred;
    const freq = {4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0};
    for (let t of tongData.slice(0, 30)) if (t >= 4 && t <= 17) freq[t]++;
    let candidates = duDoanTaiXiu === "Tài" ? [11,12,13,14,15,16,17] : [4,5,6,7,8,9,10];
    candidates.sort((a, b) => freq[b] - freq[a]);
    let selected = candidates.slice(0, 3);
    selected.sort((a, b) => a - b);
    let avgFreq = (freq[selected[0]] + freq[selected[1]] + freq[selected[2]]) / 3;
    let conf = 55 + Math.min(30, avgFreq * 3);
    return { vi1: selected[0], vi2: selected[1], vi3: selected[2], tong: selected[0]+selected[1]+selected[2], conf: Math.min(85, Math.round(conf)) };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) {
      return { du_doan_tai_xiu: "Tài", do_tin_cay_tai_xiu: 55, du_doan_chan_le: "Chẵn", do_tin_cay_chan_le: 55, du_doan_vi: { vi1: 11, vi2: 14, vi3: 16, tong: 41, do_tin_cay: 55 }, giai_thich: "Chưa đủ dữ liệu" };
    }
    const taiXiu = this.duDoanTaiXiu(tongData);
    const chanLe = this.duDoanChanLe(tongData);
    const vi = this.duDoanVi(tongData);
    return {
      du_doan_tai_xiu: taiXiu.pred, do_tin_cay_tai_xiu: taiXiu.conf,
      du_doan_chan_le: chanLe.pred, do_tin_cay_chan_le: chanLe.conf,
      du_doan_vi: { vi1: vi.vi1, vi2: vi.vi2, vi3: vi.vi3, tong: vi.tong, do_tin_cay: vi.conf },
      giai_thich: `Dựa trên ${tongData.length} phiên`
    };
  }
}

// ==========================================
// KHỞI TẠO ALGORITHM RIÊNG CHO TỪNG GAME
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
  'luck8_sicbo40': new Luck8Sicbo40Algorithm(),
  'lc79_xocdia': new LC79XocDiaAlgorithm(),
  'sunwin_sicbo': new SunwinSicboAlgorithm()
};

// ==========================================
// XỬ LÝ REQUEST
// ==========================================
async function xuLyGame(gameKey) {
  let data;
  if (gameKey === 'sunwin_sicbo') {
    data = await fetchSicboData(GAME_APIS[gameKey]);
  } else {
    data = await fetchGameData(GAME_APIS[gameKey], gameKey);
  }
  if (!data) throw new Error(`Không lấy được dữ liệu ${gameKey}`);
  if (data.ket_qua === "Bão") throw new Error(`Game ${gameKey} ra Bão`);
  
  const hist = historyDB[gameKey];
  const lastPred = cacheDB[gameKey].get(data.phien - 1);
  const isXocDia = (gameKey === 'lc79_xocdia');
  const isSicbo = (gameKey === 'sunwin_sicbo');
  
  if (lastPred && lastPred.prediction !== undefined) {
    let thucTe = data.ket_qua;
    let duDoanCu = lastPred.prediction;
    const dung = updateStats(gameKey, thucTe, duDoanCu);
    lastPred.actual = thucTe;
    lastPred.isCorrect = dung;
    hist.lichSuDuDoan.unshift({ phien_du_doan: lastPred.phien_du_doan, du_doan: duDoanCu, do_tin_cay: lastPred.confidence, thuc_te: thucTe, ket_qua: dung ? 'ĐÚNG' : 'SAI', thoi_gian: new Date().toISOString() });
    if (hist.lichSuDuDoan.length > 100) hist.lichSuDuDoan.pop();
  }
  
  hist.data.unshift(data.ket_qua);
  if (hist.data.length > 500) hist.data.pop();
  if (data.tong && typeof data.tong === 'number') {
    hist.tongData.unshift(data.tong);
    if (hist.tongData.length > 500) hist.tongData.pop();
  }
  if (data.dice && Array.isArray(data.dice)) {
    hist.diceData.unshift(data.dice);
    if (hist.diceData.length > 500) hist.diceData.pop();
  }
  
  if (cacheDB[gameKey].has(data.phien)) {
    const cached = cacheDB[gameKey].get(data.phien);
    if (isSicbo) {
      return {
        phien_hien_tai: data.phien,
        ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong },
        duDoan: {
          phien_du_doan: data.phien + 1,
          tai_xiu: cached.prediction_tx,
          do_tin_cay_tai_xiu: cached.confidence_tx + '%',
          chan_le: cached.prediction_cl,
          do_tin_cay_chan_le: cached.confidence_cl + '%',
          vi: `${cached.vi1}, ${cached.vi2}, ${cached.vi3}`,
          tong_vi: cached.tong_vi,
          do_tin_cay_vi: cached.confidence_vi + '%'
        },
        thongKe: statsDB[gameKey],
        lichSuDuDoan: hist.lichSuDuDoan.slice(0, 30)
      };
    } else {
      return {
        phien_hien_tai: data.phien,
        ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong },
        duDoan: { phien_du_doan: data.phien + 1, du_doan: cached.prediction, do_tin_cay: cached.confidence + '%', giai_thich: cached.reason },
        thongKe: statsDB[gameKey],
        lichSuDuDoan: hist.lichSuDuDoan.slice(0, 30)
      };
    }
  }
  
  const algo = algorithms[gameKey];
  let prediction;
  if (isSicbo) {
    prediction = algo.predict(hist.data, hist.tongData);
    cacheDB[gameKey].set(data.phien, {
      prediction_tx: prediction.du_doan_tai_xiu,
      confidence_tx: prediction.do_tin_cay_tai_xiu,
      prediction_cl: prediction.du_doan_chan_le,
      confidence_cl: prediction.do_tin_cay_chan_le,
      vi1: prediction.du_doan_vi.vi1,
      vi2: prediction.du_doan_vi.vi2,
      vi3: prediction.du_doan_vi.vi3,
      tong_vi: prediction.du_doan_vi.tong,
      confidence_vi: prediction.du_doan_vi.do_tin_cay,
      phien_du_doan: data.phien + 1,
      prediction: prediction.du_doan_tai_xiu,
      confidence: prediction.do_tin_cay_tai_xiu,
      reason: prediction.giai_thich
    });
  } else if (isXocDia) {
    prediction = algo.predict(hist.data);
    cacheDB[gameKey].set(data.phien, {
      prediction: prediction.du_doan,
      confidence: prediction.do_tin_cay,
      reason: prediction.giai_thich,
      phien_du_doan: data.phien + 1
    });
  } else {
    prediction = algo.predict(hist.data, hist.tongData, hist.diceData);
    cacheDB[gameKey].set(data.phien, {
      prediction: prediction.du_doan,
      confidence: prediction.do_tin_cay,
      reason: prediction.giai_thich,
      phien_du_doan: data.phien + 1
    });
  }
  
  if (cacheDB[gameKey].size > 20) {
    const firstKey = cacheDB[gameKey].keys().next().value;
    cacheDB[gameKey].delete(firstKey);
  }
  
  if (isSicbo) {
    return {
      phien_hien_tai: data.phien,
      ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong },
      duDoan: {
        phien_du_doan: data.phien + 1,
        tai_xiu: prediction.du_doan_tai_xiu,
        do_tin_cay_tai_xiu: prediction.do_tin_cay_tai_xiu + '%',
        chan_le: prediction.du_doan_chan_le,
        do_tin_cay_chan_le: prediction.do_tin_cay_chan_le + '%',
        vi: `${prediction.du_doan_vi.vi1}, ${prediction.du_doan_vi.vi2}, ${prediction.du_doan_vi.vi3}`,
        tong_vi: prediction.du_doan_vi.tong,
        do_tin_cay_vi: prediction.du_doan_vi.do_tin_cay + '%'
      },
      thongKe: statsDB[gameKey],
      lichSuDuDoan: hist.lichSuDuDoan.slice(0, 30)
    };
  } else {
    return {
      phien_hien_tai: data.phien,
      ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong },
      duDoan: { phien_du_doan: data.phien + 1, du_doan: prediction.du_doan, do_tin_cay: prediction.do_tin_cay + '%', giai_thich: prediction.giai_thich },
      thongKe: statsDB[gameKey],
      lichSuDuDoan: hist.lichSuDuDoan.slice(0, 30)
    };
  }
}

// ==========================================
// TẠO ENDPOINTS
// ==========================================
for (let gameKey in GAME_APIS) {
  const endpoint = `/${gameKey.replace(/_/g, '/')}`;
  app.get(endpoint, async (req, res) => {
    try {
      const result = await xuLyGame(gameKey);
      res.json({ game: gameKey.toUpperCase(), ...result, author: '@tranhoang2286', version: 'MỖI GAME THUẬT TOÁN RIÊNG' });
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
  res.json({ game, lichSuDuDoan: historyDB[game].lichSuDuDoan.slice(0, 30), thongKe: statsDB[game] });
});

app.get('/lich-su', (req, res) => {
  const allStats = {};
  for (let key in GAME_APIS) allStats[key] = statsDB[key];
  res.json({ thong_ke_tat_ca_game: allStats, tong_so_game: Object.keys(GAME_APIS).length });
});

app.get('/', (req, res) => {
  res.json({
    name: '🎲 16 GAME - 16 THUẬT TOÁN RIÊNG BIỆT 🎲',
    author: '@tranhoang2286',
    version: '37.0 - MỖI GAME MỘT THUẬT TOÁN',
    endpoints: Object.keys(GAME_APIS).map(k => `/${k.replace(/_/g, '/')}`),
    cac_thuat_toan: {
      'sunwin_tx': 'Chuyên bệt & Martingale',
      'lc79_tx': 'Chuyên tổng điểm & xúc xắc',
      'lc79_md5': 'Chuyên Markov & pattern lặp',
      'betvip_tx': 'Chuyên Martingale pro',
      'betvip_md5': 'Chuyên xúc xắc & tần suất',
      'club789_tx': 'Chuyên cầu 1-1 & zigzag',
      'b52': 'Chuyên chỉ báo kỹ thuật',
      'max789': 'Chuyên Fibonacci & chu kỳ',
      'luck8_md5': 'Chuyên Machine Learning',
      'sumvin_md5': 'Chuyên pattern đặc biệt',
      'gb68_thuong': 'Chuyên cầu ngắn hạn',
      'gb68_md5': 'Chuyên tổng điểm',
      'alo_hitclub_md5': 'Chuyên tổng hợp đa tầng',
      'luck8_sicbo40': 'Chuyên tốc độ cao',
      'lc79_xocdia': 'Chuyên Chẵn/Lẻ',
      'sunwin_sicbo': 'Chuyên 3 kết quả (Tài/Xỉu, Chẵn/Lẻ, 3 vị)'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎲 16 GAME - 16 THUẬT TOÁN RIÊNG BIỆT - PORT ${PORT}`);
  for (let key in algorithms) {
    console.log(`  ✅ ${key.toUpperCase()} - ${algorithms[key].name}`);
  }
});
