const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// API NGUỒN (17 GAME)
// ==========================================
const GAME_APIS = {
  // Tài Xỉu
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
  // Sicbo
  'sunwin_sicbo': 'https://api.wsktnus8.net/v2/history/getLastResult?gameId=ktrng_3979&size=100&tableId=39791215743193&curPage=1',
  'club789_sicbo': 'https://demo7892.fun/history/getLastResult?gameId=ktrng_3986&size=100&tableId=398625062021&curPage=1'
};

// ==========================================
// LƯU TRỮ
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
  console.log(`[${game}] Dự đoán: ${duDoan} | Thực tế: ${thucTe} | KQ: ${dung ? '✅ ĐÚNG' : '❌ SAI'} | TL: ${st.tiLe}`);
  return dung;
}

async function fetchGameData(url, gameKey) {
  try {
    const headers = {};
    if (gameKey === 'club789_sicbo') {
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      headers['Referer'] = 'https://demo7892.fun/';
    }
    const res = await axios.get(url, { timeout: 10000, headers });
    const data = res.data;
    if (!data) return null;
    
    if (gameKey === 'lc79_xocdia') {
      if (data.ket_qua_truyen_thong) {
        return { phien: data.phien, ket_qua: data.ket_qua_truyen_thong, dice: [], tong: null };
      }
      return null;
    }
    
    if (gameKey === 'sunwin_sicbo' || gameKey === 'club789_sicbo') {
      if (data?.data?.resultList?.length) {
        const last = data.data.resultList[0];
        const score = last.score;
        const resultType = last.resultType;
        const faces = last.facesList;
        const phien = parseInt(last.gameNum.replace('#', ''));
        let ketQua = resultType === 3 ? 'Tài' : (resultType === 4 ? 'Xỉu' : 'Bão');
        if (ketQua === 'Bão') return null;
        return { phien, ket_qua: ketQua, tong: score, dice: faces };
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

// ==========================================
// ========== THUẬT TOÁN RIÊNG CHO TỪNG GAME (KHÔNG RANDOM) ==========
// ==========================================

// 1. SUNWIN TX - Chuyên phân tích tần suất 10 phiên và bệt
class SunwinTXAlgorithm {
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    
    // Tần suất 10 phiên (ưu tiên cao nhất)
    if (lichSu.length >= 10) {
      const last10 = lichSu.slice(0, 10);
      const tai10 = last10.filter(r => r === "Tài").length;
      if (tai10 >= 8) diemXiu += 85;
      else if (tai10 <= 2) diemTai += 85;
      else if (tai10 >= 7) diemXiu += 78;
      else if (tai10 <= 3) diemTai += 78;
      else if (tai10 >= 6) diemXiu += 70;
      else if (tai10 <= 4) diemTai += 70;
      else { diemTai += 60; diemXiu += 60; }
    }
    
    // Bệt
    let bet = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[0]) bet++;
      else break;
    }
    if (bet >= 5) { if (lichSu[0] === "Tài") diemXiu += 88; else diemTai += 88; }
    else if (bet === 4) { if (lichSu[0] === "Tài") diemXiu += 80; else diemTai += 80; }
    else if (bet === 3) { if (lichSu[0] === "Tài") diemXiu += 72; else diemTai += 72; }
    
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(92, Math.max(55, conf));
    return { du_doan: pred, do_tin_cay: Math.round(conf), giai_thich: `T:${Math.round(diemTai)} X:${Math.round(diemXiu)}` };
  }
}

// 2. LC79 TX - Chuyên phân tích tổng điểm
class LC79TXAlgorithm {
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    
    // Tổng điểm
    if (tongData && tongData.length >= 15) {
      const avg = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
      const prevAvg = tongData.slice(10, 20).reduce((a, b) => a + b, 0) / 10;
      if (avg > prevAvg + 1.5) diemXiu += 30;
      else if (avg < prevAvg - 1.5) diemTai += 30;
      if (avg > 12.5) diemXiu += 35;
      else if (avg < 8.5) diemTai += 35;
      else if (avg > 11.5) diemXiu += 28;
      else if (avg < 9.5) diemTai += 28;
    }
    
    // Bệt
    let bet = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[0]) bet++;
      else break;
    }
    if (bet >= 4) { if (lichSu[0] === "Tài") diemXiu += 75; else diemTai += 75; }
    else if (bet === 3) { if (lichSu[0] === "Tài") diemXiu += 68; else diemTai += 68; }
    
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { du_doan: pred, do_tin_cay: Math.round(conf), giai_thich: `Tổng điểm + Bệt` };
  }
}

// 3. LC79 MD5 - Chuyên Markov chain
class LC79MD5Algorithm {
  predict(lichSu) {
    if (lichSu.length < 10) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    
    // Markov bậc 2
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
    if (stat && stat.T + stat.X >= 3) {
      if (stat.T > stat.X) diemTai += 75;
      else diemXiu += 75;
    }
    
    // Tần suất 10 phiên
    if (lichSu.length >= 10) {
      const last10 = lichSu.slice(0, 10);
      const tai10 = last10.filter(r => r === "Tài").length;
      if (tai10 >= 7) diemXiu += 35;
      else if (tai10 <= 3) diemTai += 35;
    }
    
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { du_doan: pred, do_tin_cay: Math.round(conf), giai_thich: `Markov + Tần suất` };
  }
}

// 4. BETVIP TX - Chuyên Martingale
class BetvipTXAlgorithm {
  predict(lichSu) {
    if (lichSu.length < 10) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    const last10 = lichSu.slice(0, 10);
    const tai10 = last10.filter(r => r === "Tài").length;
    
    if (tai10 >= 8) return { du_doan: "Xỉu", do_tin_cay: 85, giai_thich: `Tài ${tai10}/10 - bẻ Xỉu` };
    if (tai10 <= 2) return { du_doan: "Tài", do_tin_cay: 85, giai_thich: `Xỉu ${10-tai10}/10 - bẻ Tài` };
    if (tai10 >= 7) return { du_doan: "Xỉu", do_tin_cay: 78, giai_thich: `Tài ${tai10}/10 - bẻ Xỉu` };
    if (tai10 <= 3) return { du_doan: "Tài", do_tin_cay: 78, giai_thich: `Xỉu ${10-tai10}/10 - bẻ Tài` };
    
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 65, giai_thich: `Xu hướng 5 phiên` };
  }
}

// 5. BETVIP MD5 - Chuyên xúc xắc
class BetvipMD5Algorithm {
  predict(lichSu, diceData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    
    if (diceData && diceData.length >= 15) {
      const freq = {1:0,2:0,3:0,4:0,5:0,6:0};
      for (let d of diceData.slice(0, 20)) {
        if (d && d.length === 3) d.forEach(f => { if (f) freq[f]++; });
      }
      const maxFace = Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
      if (maxFace >= 5) diemTai += 25;
      else if (maxFace <= 2) diemXiu += 25;
    }
    
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    if (tai5 >= 4) diemXiu += 40;
    else if (tai5 <= 1) diemTai += 40;
    else if (tai5 >= 3) diemTai += 30;
    else diemXiu += 30;
    
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(85, Math.max(55, conf));
    return { du_doan: pred, do_tin_cay: Math.round(conf), giai_thich: `Xúc xắc + xu hướng` };
  }
}

// 6. 789CLUB TX - Chuyên cầu 1-1
class Club789TXAlgorithm {
  predict(lichSu) {
    if (lichSu.length < 6) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let zigzag = 0;
    for (let i = 1; i < 5; i++) {
      if (lichSu[i] !== lichSu[i-1]) zigzag++;
    }
    if (zigzag >= 3) {
      const pred = lichSu[0] === "Tài" ? "Xỉu" : "Tài";
      return { du_doan: pred, do_tin_cay: 78, giai_thich: "Cầu 1-1 - đánh ngược" };
    }
    
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 65, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 7. B52 - Chuyên RSI
class B52Algorithm {
  predict(lichSu) {
    if (lichSu.length < 14) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
    let gains = 0, losses = 0;
    for (let i = 1; i < nums.length; i++) {
      const diff = nums[i] - nums[i-1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const rsi = losses === 0 ? 100 : 100 - (100 / (1 + gains / losses));
    
    if (rsi >= 75) return { du_doan: "Xỉu", do_tin_cay: 80, giai_thich: `RSI quá mua (${rsi.toFixed(0)}) - bẻ Xỉu` };
    if (rsi <= 25) return { du_doan: "Tài", do_tin_cay: 80, giai_thich: `RSI quá bán (${rsi.toFixed(0)}) - bẻ Tài` };
    if (rsi >= 65) return { du_doan: "Xỉu", do_tin_cay: 72, giai_thich: `RSI cao (${rsi.toFixed(0)}) - bẻ Xỉu` };
    if (rsi <= 35) return { du_doan: "Tài", do_tin_cay: 72, giai_thich: `RSI thấp (${rsi.toFixed(0)}) - bẻ Tài` };
    
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 62, giai_thich: `Xu hướng 5 phiên` };
  }
}

// 8. MAX789 - Chuyên Fibonacci & chu kỳ
class Max789Algorithm {
  predict(lichSu) {
    if (lichSu.length < 16) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    const fibs = [2, 3, 5, 8];
    let match = 0;
    for (let f of fibs) {
      if (lichSu.length > f && lichSu[0] === lichSu[f]) match++;
    }
    
    if (match >= 3) {
      const pred = lichSu[0] === "Tài" ? "Xỉu" : "Tài";
      return { du_doan: pred, do_tin_cay: 82, giai_thich: `Fibonacci ${match}/4 vị trí trùng - bẻ cầu` };
    }
    
    const last8 = lichSu.slice(0, 8);
    const next8 = lichSu.slice(8, 16);
    if (last8.join('') === next8.join('')) {
      const pred = last8[7] === "Tài" ? "Xỉu" : "Tài";
      return { du_doan: pred, do_tin_cay: 78, giai_thich: "Chu kỳ 8 phiên - bẻ cầu" };
    }
    
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 62, giai_thich: `Xu hướng 5 phiên` };
  }
}

// 9. LUCK8 MD5 - Chuyên KNN
class Luck8MD5Algorithm {
  predict(lichSu) {
    if (lichSu.length < 15) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    const k = 5, lookback = 5;
    const query = lichSu.slice(0, lookback);
    const distances = [];
    for (let i = lookback; i < lichSu.length - 1; i++) {
      let diff = 0;
      for (let j = 0; j < lookback; j++) {
        if (lichSu[i - lookback + j] !== query[j]) diff++;
      }
      distances.push({ diff, next: lichSu[i] });
    }
    distances.sort((a, b) => a.diff - b.diff);
    const neighbors = distances.slice(0, k);
    const taiCount = neighbors.filter(n => n.next === "Tài").length;
    
    if (taiCount > k/2) return { du_doan: "Tài", do_tin_cay: 68, giai_thich: `KNN (${taiCount}/${k} láng giềng chọn Tài)` };
    return { du_doan: "Xỉu", do_tin_cay: 68, giai_thich: `KNN (${k-taiCount}/${k} láng giềng chọn Xỉu)` };
  }
}

// 10. SUMVIN MD5 - Chuyên pattern 2-1
class SumvinMD5Algorithm {
  predict(lichSu) {
    if (lichSu.length < 6) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    if (lichSu[0] === lichSu[1] && lichSu[3] === lichSu[4] && lichSu[0] !== lichSu[3]) {
      return { du_doan: lichSu[0], do_tin_cay: 78, giai_thich: "Cầu 2-1 - theo nhịp" };
    }
    
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    if (tai5 >= 4) return { du_doan: "Xỉu", do_tin_cay: 72, giai_thich: `Tài ${tai5}/5 - bẻ Xỉu` };
    if (tai5 <= 1) return { du_doan: "Tài", do_tin_cay: 72, giai_thich: `Xỉu ${5-tai5}/5 - bẻ Tài` };
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 62, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 11. GB68 THƯỜNG - Chuyên cầu ngắn hạn 3 phiên
class GB68ThuongAlgorithm {
  predict(lichSu) {
    if (lichSu.length < 4) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    const last3 = lichSu.slice(0, 3);
    const tai3 = last3.filter(r => r === "Tài").length;
    if (tai3 === 3) return { du_doan: "Xỉu", do_tin_cay: 74, giai_thich: "Bệt Tài 3 - bẻ Xỉu" };
    if (tai3 === 0) return { du_doan: "Tài", do_tin_cay: 74, giai_thich: "Bệt Xỉu 3 - bẻ Tài" };
    if (tai3 === 2) return { du_doan: "Tài", do_tin_cay: 66, giai_thich: "2T/3 - theo Tài" };
    return { du_doan: "Xỉu", do_tin_cay: 66, giai_thich: "2X/3 - theo Xỉu" };
  }
}

// 12. GB68 MD5 - Chuyên tổng điểm
class GB68MD5Algorithm {
  predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    if (tongData && tongData.length >= 10) {
      const avg = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
      if (avg > 11.5) return { du_doan: "Xỉu", do_tin_cay: 70, giai_thich: `Tổng cao TB ${avg.toFixed(1)}` };
      if (avg < 9.5) return { du_doan: "Tài", do_tin_cay: 70, giai_thich: `Tổng thấp TB ${avg.toFixed(1)}` };
    }
    
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    return { du_doan: tai5 >= 3 ? "Tài" : "Xỉu", do_tin_cay: 62, giai_thich: `Xu hướng ${tai5}T-${5-tai5}X` };
  }
}

// 13. ALO HITCLUB MD5 - Chuyên tổng hợp
class AloHitclubMD5Algorithm {
  predict(lichSu, diceData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0;
    
    if (diceData && diceData.length >= 10) {
      let sum = 0, count = 0;
      for (let d of diceData.slice(0, 10)) {
        if (d && d.length === 3) { sum += d[0] + d[1] + d[2]; count++; }
      }
      if (count > 0) {
        const avg = sum / count;
        if (avg > 11.5) diemXiu += 25;
        else if (avg < 9.5) diemTai += 25;
      }
    }
    
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    if (tai5 >= 4) diemXiu += 45;
    else if (tai5 <= 1) diemTai += 45;
    else if (tai5 >= 3) diemTai += 35;
    else diemXiu += 35;
    
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, conf));
    return { du_doan: pred, do_tin_cay: Math.round(conf), giai_thich: `Tổng hợp xúc xắc + xu hướng` };
  }
}

// 14. LUCK8 SICBO40 - Chuyên tốc độ cao
class Luck8Sicbo40Algorithm {
  predict(lichSu) {
    if (lichSu.length < 4) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    const last3 = lichSu.slice(0, 3);
    const tai3 = last3.filter(r => r === "Tài").length;
    if (tai3 === 3) return { du_doan: "Xỉu", do_tin_cay: 72, giai_thich: "Bệt Tài 3 - bẻ Xỉu" };
    if (tai3 === 0) return { du_doan: "Tài", do_tin_cay: 72, giai_thich: "Bệt Xỉu 3 - bẻ Tài" };
    if (tai3 === 2) return { du_doan: "Xỉu", do_tin_cay: 66, giai_thich: "2T/3 - bẻ Xỉu" };
    return { du_doan: "Tài", do_tin_cay: 66, giai_thich: "2X/3 - bẻ Tài" };
  }
}

// 15. XÓC ĐĨA
class LC79XocDiaAlgorithm {
  predict(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Chẵn", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let bet = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[0]) bet++;
      else break;
    }
    if (bet >= 4) return { du_doan: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", do_tin_cay: 78, giai_thich: `Bệt ${bet} - bẻ cầu` };
    if (bet === 3) return { du_doan: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", do_tin_cay: 70, giai_thich: "Bệt 3 - bẻ cầu" };
    
    const last5 = lichSu.slice(0, 5);
    const chan5 = last5.filter(r => r === "Chẵn").length;
    if (chan5 >= 4) return { du_doan: "Lẻ", do_tin_cay: 72, giai_thich: `Chẵn nóng ${chan5}/5 - bẻ Lẻ` };
    if (chan5 <= 1) return { du_doan: "Chẵn", do_tin_cay: 72, giai_thich: `Lẻ nóng ${5-chan5}/5 - bẻ Chẵn` };
    return { du_doan: chan5 >= 3 ? "Chẵn" : "Lẻ", do_tin_cay: 62, giai_thich: `Theo xu hướng ${chan5}C-${5-chan5}L` };
  }
}

// 16. SUNWIN SICBO - Chuyên 3 kết quả (Tài/Xỉu + Chẵn/Lẻ + 3 vị)
class SunwinSicboAlgorithm {
  duDoanTaiXiu(tongData) {
    if (tongData.length < 10) return { pred: "Tài", conf: 55 };
    let diemTai = 0, diemXiu = 0;
    const last10 = tongData.slice(0, 10);
    const tai10 = last10.filter(t => t >= 11).length;
    if (tai10 >= 8) diemXiu += 40;
    else if (tai10 <= 2) diemTai += 40;
    else if (tai10 >= 7) diemXiu += 32;
    else if (tai10 <= 3) diemTai += 32;
    else if (tai10 >= 6) diemXiu += 24;
    else if (tai10 <= 4) diemTai += 24;
    else { diemTai += 16; diemXiu += 16; }
    const avg5 = tongData.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    if (avg5 > 13) diemXiu += 35;
    else if (avg5 < 8) diemTai += 35;
    else if (avg5 > 12) diemXiu += 28;
    else if (avg5 < 9) diemTai += 28;
    else if (avg5 > 11) diemXiu += 20;
    else if (avg5 < 10) diemTai += 20;
    else { diemTai += 14; diemXiu += 14; }
    let streak = 1;
    for (let i = 1; i < tongData.length; i++) {
      if ((tongData[i] >= 11) === (tongData[i-1] >= 11)) streak++;
      else break;
    }
    if (streak >= 4) { if (tongData[0] >= 11) diemXiu += 35; else diemTai += 35; }
    else if (streak >= 3) { if (tongData[0] >= 11) diemXiu += 25; else diemTai += 25; }
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    return { pred, conf: Math.min(92, Math.max(55, Math.round(conf))) };
  }
  
  duDoanChanLe(tongData) {
    if (tongData.length < 10) return { pred: "Chẵn", conf: 55 };
    let diemChan = 0, diemLe = 0;
    const last5 = tongData.slice(0, 5);
    const chan5 = last5.filter(t => t % 2 === 0).length;
    if (chan5 >= 4) diemLe += 35;
    else if (chan5 <= 1) diemChan += 35;
    else if (chan5 >= 3) diemChan += 25;
    else diemLe += 25;
    const last10 = tongData.slice(0, 10);
    const chan10 = last10.filter(t => t % 2 === 0).length;
    if (chan10 >= 8) diemLe += 35;
    else if (chan10 <= 2) diemChan += 35;
    else if (chan10 >= 7) diemLe += 28;
    else if (chan10 <= 3) diemChan += 28;
    let streak = 1;
    for (let i = 1; i < tongData.length; i++) {
      if ((tongData[i] % 2 === 0) === (tongData[i-1] % 2 === 0)) streak++;
      else break;
    }
    if (streak >= 3) { if (tongData[0] % 2 === 0) diemLe += 25; else diemChan += 25; }
    const pred = diemChan > diemLe ? "Chẵn" : "Lẻ";
    let conf = Math.abs(diemChan - diemLe) / (diemChan + diemLe) * 100;
    return { pred, conf: Math.min(90, Math.max(55, Math.round(conf))) };
  }
  
  duDoanVi(tongData) {
    if (tongData.length < 15) {
      return { vi1: 11, vi2: 14, vi3: 16, tong: 41, conf: 55 };
    }
    const duDoanTaiXiu = this.duDoanTaiXiu(tongData).pred;
    const freq = {4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0};
    for (let t of tongData.slice(0, 30)) if (t >= 4 && t <= 17) freq[t]++;
    let candidates = duDoanTaiXiu === "Tài" ? [11,12,13,14,15,16,17] : [4,5,6,7,8,9,10];
    candidates.sort((a, b) => freq[b] - freq[a]);
    let selected = [candidates[0], candidates[1], candidates[2]];
    selected.sort((a, b) => a - b);
    let conf = 55 + Math.min(30, (freq[selected[0]] + freq[selected[1]] + freq[selected[2]]) / 3);
    return { vi1: selected[0], vi2: selected[1], vi3: selected[2], tong: selected[0]+selected[1]+selected[2], conf: Math.min(85, Math.round(conf)) };
  }
  
  predict(lichSu, tongData) {
    if (lichSu.length < 5) {
      return { tai_xiu: "Tài", do_tin_cay_tai_xiu: 55, chan_le: "Chẵn", do_tin_cay_chan_le: 55, vi: "11, 14, 16", tong_vi: 41, do_tin_cay_vi: 55, giai_thich: "Chưa đủ dữ liệu" };
    }
    const taiXiu = this.duDoanTaiXiu(tongData);
    const chanLe = this.duDoanChanLe(tongData);
    const vi = this.duDoanVi(tongData);
    return {
      tai_xiu: taiXiu.pred, do_tin_cay_tai_xiu: taiXiu.conf,
      chan_le: chanLe.pred, do_tin_cay_chan_le: chanLe.conf,
      vi: `${vi.vi1}, ${vi.vi2}, ${vi.vi3}`, tong_vi: vi.tong, do_tin_cay_vi: vi.conf,
      giai_thich: `Phân tích ${tongData.length} phiên`
    };
  }
}

// 17. 789CLUB SICBO - Tương tự Sunwin Sicbo
class Club789SicboAlgorithm extends SunwinSicboAlgorithm {
  constructor() { super(); this.name = "CLUB789_SICBO"; }
}

// ==========================================
// KHỞI TẠO ALGORITHM CHO TỪNG GAME
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
  'sunwin_sicbo': new SunwinSicboAlgorithm(),
  'club789_sicbo': new Club789SicboAlgorithm()
};

// ==========================================
// XỬ LÝ REQUEST
// ==========================================
async function xuLyGame(gameKey) {
  const url = GAME_APIS[gameKey];
  const data = await fetchGameData(url, gameKey);
  if (!data) throw new Error(`Không lấy được dữ liệu ${gameKey}`);
  if (data.ket_qua === "Bão") throw new Error(`Game ${gameKey} ra Bão`);
  
  const hist = historyDB[gameKey];
  const lastPred = cacheDB[gameKey].get(data.phien - 1);
  const isSicbo = (gameKey === 'sunwin_sicbo' || gameKey === 'club789_sicbo');
  const isXocDia = (gameKey === 'lc79_xocdia');
  
  if (lastPred && lastPred.prediction !== undefined) {
    let thucTe = data.ket_qua;
    let duDoanCu = isSicbo ? lastPred.prediction_tx : lastPred.prediction;
    const dung = updateStats(gameKey, thucTe, duDoanCu);
    hist.lichSuDuDoan.unshift({
      phien_du_doan: lastPred.phien_du_doan,
      du_doan: duDoanCu,
      do_tin_cay: lastPred.confidence,
      thuc_te: thucTe,
      ket_qua: dung ? 'ĐÚNG' : 'SAI',
      thoi_gian: new Date().toISOString()
    });
    if (hist.lichSuDuDoan.length > 100) hist.lichSuDuDoan.pop();
    lastPred.actual = thucTe;
    lastPred.isCorrect = dung;
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
          vi: cached.vi,
          tong_vi: cached.tong_vi,
          do_tin_cay_vi: cached.confidence_vi + '%',
          giai_thich: cached.reason
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
    const sicboResult = algo.predict(hist.data, hist.tongData);
    prediction = {
      tai_xiu: sicboResult.tai_xiu, do_tin_cay_tai_xiu: sicboResult.do_tin_cay_tai_xiu,
      chan_le: sicboResult.chan_le, do_tin_cay_chan_le: sicboResult.do_tin_cay_chan_le,
      vi: sicboResult.vi, tong_vi: sicboResult.tong_vi, do_tin_cay_vi: sicboResult.do_tin_cay_vi,
      giai_thich: sicboResult.giai_thich
    };
    cacheDB[gameKey].set(data.phien, {
      prediction_tx: prediction.tai_xiu, confidence_tx: prediction.do_tin_cay_tai_xiu,
      prediction_cl: prediction.chan_le, confidence_cl: prediction.do_tin_cay_chan_le,
      vi: prediction.vi, tong_vi: prediction.tong_vi, confidence_vi: prediction.do_tin_cay_vi,
      reason: prediction.giai_thich, phien_du_doan: data.phien + 1
    });
  } else if (isXocDia) {
    prediction = algo.predict(hist.data);
    cacheDB[gameKey].set(data.phien, {
      prediction: prediction.du_doan, confidence: prediction.do_tin_cay,
      reason: prediction.giai_thich, phien_du_doan: data.phien + 1
    });
  } else {
    prediction = algo.predict(hist.data, hist.tongData, hist.diceData);
    cacheDB[gameKey].set(data.phien, {
      prediction: prediction.du_doan, confidence: prediction.do_tin_cay,
      reason: prediction.giai_thich, phien_du_doan: data.phien + 1
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
        tai_xiu: prediction.tai_xiu, do_tin_cay_tai_xiu: prediction.do_tin_cay_tai_xiu + '%',
        chan_le: prediction.chan_le, do_tin_cay_chan_le: prediction.do_tin_cay_chan_le + '%',
        vi: prediction.vi, tong_vi: prediction.tong_vi, do_tin_cay_vi: prediction.do_tin_cay_vi + '%',
        giai_thich: prediction.giai_thich
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
      res.json({ game: gameKey.toUpperCase(), ...result, author: '@tranhoang2286', version: 'NO-RANDOM' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

app.get('/lich-su/:game', (req, res) => {
  const game = req.params.game;
  if (!GAME_APIS[game]) return res.status(400).json({ error: 'Game không tồn tại', ds_game: Object.keys(GAME_APIS) });
  res.json({ game, lichSuDuDoan: historyDB[game].lichSuDuDoan.slice(0, 30), thongKe: statsDB[game] });
});

app.get('/lich-su', (req, res) => {
  const allStats = {}; for (let key in GAME_APIS) allStats[key] = statsDB[key];
  res.json({ thong_ke_tat_ca_game: allStats, tong_so_game: Object.keys(GAME_APIS).length });
});

app.get('/', (req, res) => {
  res.json({
    name: '🎲 17 GAME - MỖI GAME THUẬT TOÁN RIÊNG (KHÔNG RANDOM) 🎲',
    author: '@tranhoang2286',
    version: '43.0 - NO RANDOM',
    endpoints: Object.keys(GAME_APIS).map(k => `/${k.replace(/_/g, '/')}`),
    thuat_toan: {
      sunwin_tx: 'Tần suất 10 phiên + Bệt',
      lc79_tx: 'Tổng điểm + Bệt',
      lc79_md5: 'Markov + Tần suất',
      betvip_tx: 'Martingale',
      betvip_md5: 'Xúc xắc + Xu hướng',
      club789_tx: 'Cầu 1-1',
      b52: 'RSI',
      max789: 'Fibonacci + Chu kỳ',
      luck8_md5: 'KNN',
      sumvin_md5: 'Cầu 2-1',
      gb68_thuong: 'Cầu 3 phiên',
      gb68_md5: 'Tổng điểm',
      alo_hitclub_md5: 'Tổng hợp xúc xắc',
      luck8_sicbo40: 'Cầu 3 phiên tốc độ',
      lc79_xocdia: 'Chẵn/Lẻ + Bệt',
      sunwin_sicbo: '3 kết quả (Tài/Xỉu, Chẵn/Lẻ, 3 vị)',
      club789_sicbo: '3 kết quả (Tài/Xỉu, Chẵn/Lẻ, 3 vị)'
    },
    cam_ket: '🔴 HOÀN TOÀN KHÔNG CÓ Math.random() - 100% DỰA TRÊN THỐNG KÊ 🔴'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎲 ${Object.keys(GAME_APIS).length} GAME - MỖI GAME THUẬT TOÁN RIÊNG - PORT ${PORT}`);
  console.log(`🔴 CAM KẾT: KHÔNG CÓ RANDOM - 100% PHÂN TÍCH THỐNG KÊ 🔴`);
});
