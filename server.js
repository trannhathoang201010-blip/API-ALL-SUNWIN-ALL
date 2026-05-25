const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// DANH SÁCH API (15 GAME)
// ==========================================
const GAME_APIS = {
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
  statsDB[key] = { tong: 0, dung: 0, sai: 0, tiLe: '0%', tiLe10: '0%', tiLe30: '0%' };
}

function updateStats(game, thucTe, duDoan, doTinCay) {
  const st = statsDB[game];
  if (!st || !thucTe || !duDoan) return;
  const dung = (thucTe === duDoan);
  if (dung) st.dung++;
  else st.sai++;
  st.tong++;
  st.tiLe = ((st.dung / st.tong) * 100).toFixed(1) + '%';
  
  const ganDay = historyDB[game].data.slice(0, 10);
  if (ganDay.length >= 5) {
    let dung10 = 0;
    for (let i = 0; i < Math.min(10, ganDay.length); i++) {
      const pred = cacheDB[game].get(historyDB[game].phienRef?.[i]);
      if (pred && pred.prediction === ganDay[i]) dung10++;
    }
    st.tiLe10 = ((dung10 / Math.min(10, ganDay.length)) * 100).toFixed(1) + '%';
  }
  
  console.log(`[${game}] Dự đoán: ${duDoan} (${doTinCay}%) | Thực tế: ${thucTe} | KQ: ${dung ? '✅' : '❌'} | TL: ${st.tiLe}`);
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
    
    return { phien, ket_qua: ketQua, dice: [data.xuc_xac_1, data.xuc_xac_2, data.xuc_xac_3], tong: data.tong || (data.xuc_xac_1 + data.xuc_xac_2 + data.xuc_xac_3) };
  } catch (err) {
    console.error(`Lỗi fetch ${gameKey}:`, err.message);
    return null;
  }
}

async function fetchSicboData(url) {
  try {
    const res = await axios.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = res.data;
    if (!data || !data.data || !data.data.resultList || !data.data.resultList.length) return null;
    
    const last = data.data.resultList[0];
    const score = last.score;
    const resultType = last.resultType;
    const faces = last.facesList;
    const phien = parseInt(last.gameNum.replace('#', ''));
    
    let ketQua = resultType === 3 ? 'Tài' : (resultType === 4 ? 'Xỉu' : 'Bão');
    if (ketQua === 'Bão') return null;
    
    const historyList = [];
    for (let i = 1; i < Math.min(51, data.data.resultList.length); i++) {
      const item = data.data.resultList[i];
      historyList.push({ tong: item.score, ket_qua: item.resultType === 3 ? 'Tài' : (item.resultType === 4 ? 'Xỉu' : 'Bão'), dice: item.facesList });
    }
    
    return { phien, ket_qua: ketQua, tong: score, dice: faces, history: historyList };
  } catch (err) {
    console.error('Lỗi fetch Sicbo:', err.message);
    return null;
  }
}

// ==========================================
// ========== THUẬT TOÁN CHUYÊN SÂU ==========
// ==========================================

// ---------- 1. THUẬT TOÁN MARKOV CHAIN ----------
function markovChain(lichSu, bac = 2) {
  if (lichSu.length < bac + 1) return null;
  const map = new Map();
  for (let i = 0; i < lichSu.length - bac; i++) {
    const key = lichSu.slice(i, i + bac).join(',');
    const next = lichSu[i + bac];
    if (!map.has(key)) map.set(key, { T: 0, X: 0 });
    map.get(key)[next]++;
  }
  const lastKey = lichSu.slice(0, bac).join(',');
  const stat = map.get(lastKey);
  if (!stat || stat.T + stat.X < 2) return null;
  const pred = stat.T > stat.X ? 'Tài' : 'Xỉu';
  let conf = 55 + Math.min(30, (Math.max(stat.T, stat.X) / (stat.T + stat.X)) * 30);
  return { pred, conf: Math.round(conf) };
}

// ---------- 2. THUẬT TOÁN XÁC SUẤT BAYES ----------
function bayesProbability(lichSu) {
  if (lichSu.length < 10) return null;
  const pTai = lichSu.filter(r => r === 'Tài').length / lichSu.length;
  const pXiu = 1 - pTai;
  const last3 = lichSu.slice(0, 3);
  let condTai = 0, condXiu = 0, countTai = 0, countXiu = 0;
  for (let i = 0; i < lichSu.length - 3; i++) {
    if (lichSu.slice(i, i + 3).join('') === last3.join('')) {
      if (lichSu[i + 3] === 'Tài') { condTai++; countTai++; }
      else { condXiu++; countXiu++; }
    }
  }
  condTai = condTai / Math.max(1, countTai);
  condXiu = condXiu / Math.max(1, countXiu);
  const postTai = pTai * condTai;
  const postXiu = pXiu * condXiu;
  if (postTai + postXiu === 0) return null;
  const pred = postTai > postXiu ? 'Tài' : 'Xỉu';
  let conf = 50 + Math.abs(postTai - postXiu) / (postTai + postXiu) * 40;
  return { pred, conf: Math.round(conf) };
}

// ---------- 3. THUẬT TOÁN PHÂN TÍCH CHUỖI (STREAK) ----------
function streakAnalysis(lichSu) {
  if (lichSu.length < 3) return null;
  let streak = 1;
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[i-1]) streak++;
    else break;
  }
  if (streak >= 5) return { pred: lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài', conf: 85 };
  if (streak === 4) return { pred: lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài', conf: 78 };
  if (streak === 3) return { pred: lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài', conf: 70 };
  if (streak === 2) return { pred: lichSu[0], conf: 62 };
  return null;
}

// ---------- 4. THUẬT TOÁN PHÂN PHỐI NHỊ PHÂN ----------
function binomialDistribution(lichSu) {
  if (lichSu.length < 20) return null;
  const taiCount = lichSu.slice(0, 20).filter(r => r === 'Tài').length;
  const p = taiCount / 20;
  const expected = 10;
  const deviation = Math.abs(taiCount - expected);
  if (deviation >= 6) {
    const pred = taiCount > expected ? 'Xỉu' : 'Tài';
    let conf = 60 + deviation;
    return { pred, conf: Math.min(85, conf) };
  }
  return null;
}

// ---------- 5. THUẬT TOÁN MONTE CARLO (mô phỏng) ----------
function monteCarlo(lichSu) {
  if (lichSu.length < 15) return null;
  const last5 = lichSu.slice(0, 5);
  let taiCount = 0, xiuCount = 0;
  for (let i = 5; i < lichSu.length - 5; i++) {
    let match = true;
    for (let j = 0; j < 5; j++) {
      if (lichSu[i + j] !== last5[j]) { match = false; break; }
    }
    if (match && i + 5 < lichSu.length) {
      if (lichSu[i + 5] === 'Tài') taiCount++;
      else xiuCount++;
    }
  }
  if (taiCount + xiuCount < 3) return null;
  const pred = taiCount > xiuCount ? 'Tài' : 'Xỉu';
  let conf = 55 + Math.abs(taiCount - xiuCount) * 3;
  return { pred, conf: Math.min(85, conf) };
}

// ---------- 6. THUẬT TOÁN KALMAN FILTER (giả lập) ----------
function kalmanFilter(lichSu) {
  if (lichSu.length < 20) return null;
  let mean = 0.5;
  let variance = 0.1;
  for (let i = 0; i < Math.min(20, lichSu.length); i++) {
    const z = lichSu[i] === 'Tài' ? 1 : 0;
    const k = variance / (variance + 0.1);
    mean = mean + k * (z - mean);
    variance = (1 - k) * variance;
  }
  const pred = mean > 0.5 ? 'Tài' : 'Xỉu';
  let conf = 50 + Math.abs(mean - 0.5) * 80;
  return { pred, conf: Math.min(88, Math.round(conf)) };
}

// ---------- 7. THUẬT TOÁN HỒI QUY LOGISTIC ----------
function logisticRegression(lichSu) {
  if (lichSu.length < 15) return null;
  let score = 0;
  for (let i = 0; i < Math.min(10, lichSu.length - 1); i++) {
    if (lichSu[i] === 'Tài') score += 1;
    else score -= 1;
  }
  const last = lichSu[0] === 'Tài' ? 1 : 0;
  score = score / 10;
  const logit = 0.5 * score + 0.3 * (last - 0.5);
  const prob = 1 / (1 + Math.exp(-logit * 2));
  const pred = prob > 0.5 ? 'Tài' : 'Xỉu';
  let conf = 50 + Math.abs(prob - 0.5) * 80;
  return { pred, conf: Math.min(85, Math.round(conf)) };
}

// ---------- 8. THUẬT TOÁN RSI (CHỈ BÁO SỨC MẠNH) ----------
function rsiIndicator(lichSu) {
  if (lichSu.length < 14) return null;
  const nums = lichSu.slice(0, 14).map(r => r === 'Tài' ? 1 : 0);
  let gains = 0, losses = 0;
  for (let i = 1; i < nums.length; i++) {
    const diff = nums[i] - nums[i-1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / 14, avgLoss = losses / 14;
  const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  if (rsi >= 70) return { pred: 'Xỉu', conf: 75 };
  if (rsi <= 30) return { pred: 'Tài', conf: 75 };
  if (rsi >= 60) return { pred: 'Xỉu', conf: 65 };
  if (rsi <= 40) return { pred: 'Tài', conf: 65 };
  return null;
}

// ---------- 9. THUẬT TOÁN MACD (HỘI TỤ PHÂN KỲ) ----------
function macdIndicator(lichSu) {
  if (lichSu.length < 26) return null;
  const nums = lichSu.map(r => r === 'Tài' ? 1 : 0);
  const ema12 = nums.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
  const ema26 = nums.slice(0, 26).reduce((a, b) => a + b, 0) / 26;
  const macd = ema12 - ema26;
  const signal = macd * 0.8;
  if (macd > signal + 0.05) return { pred: 'Tài', conf: 68 };
  if (macd < signal - 0.05) return { pred: 'Xỉu', conf: 68 };
  return null;
}

// ---------- 10. THUẬT TOÁN BOLLINGER BANDS ----------
function bollingerBands(lichSu) {
  if (lichSu.length < 20) return null;
  const nums = lichSu.slice(0, 20).map(r => r === 'Tài' ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 20;
  const variance = nums.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / 20;
  const std = Math.sqrt(variance);
  const last = nums[19];
  if (last > mean + 2 * std) return { pred: 'Xỉu', conf: 72 };
  if (last < mean - 2 * std) return { pred: 'Tài', conf: 72 };
  return null;
}

// ---------- 11. THUẬT TOÁN STOCHASTIC ----------
function stochasticOsc(lichSu) {
  if (lichSu.length < 14) return null;
  const nums = lichSu.slice(0, 14).map(r => r === 'Tài' ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return null;
  const k = (nums[13] - lowest) / (highest - lowest) * 100;
  if (k > 80) return { pred: 'Xỉu', conf: 70 };
  if (k < 20) return { pred: 'Tài', conf: 70 };
  return null;
}

// ---------- 12. THUẬT TOÁN WILLIAMS %R ----------
function williamsR(lichSu) {
  if (lichSu.length < 14) return null;
  const nums = lichSu.slice(0, 14).map(r => r === 'Tài' ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return null;
  const wr = (highest - nums[13]) / (highest - lowest) * -100;
  if (wr < -80) return { pred: 'Tài', conf: 70 };
  if (wr > -20) return { pred: 'Xỉu', conf: 70 };
  return null;
}

// ---------- 13. THUẬT TOÁN CCI (COMMODITY CHANNEL INDEX) ----------
function cciIndicator(lichSu) {
  if (lichSu.length < 10) return null;
  const nums = lichSu.slice(0, 10).map(r => r === 'Tài' ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 10;
  const mad = nums.reduce((sum, x) => sum + Math.abs(x - mean), 0) / 10;
  if (mad === 0) return null;
  const cci = (nums[9] - mean) / (0.015 * mad);
  if (cci > 100) return { pred: 'Xỉu', conf: 68 };
  if (cci < -100) return { pred: 'Tài', conf: 68 };
  return null;
}

// ---------- 14. THUẬT TOÁN ENTROPY ----------
function entropyAnalysis(lichSu) {
  if (lichSu.length < 20) return null;
  const tai20 = lichSu.slice(0, 20).filter(r => r === 'Tài').length;
  const p = tai20 / 20;
  if (p === 0) return { pred: 'Tài', conf: 80 };
  if (p === 1) return { pred: 'Xỉu', conf: 80 };
  const entropy = -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  if (entropy < 0.6) return { pred: p > 0.5 ? 'Tài' : 'Xỉu', conf: 72 };
  if (entropy > 0.95) return { pred: p > 0.5 ? 'Xỉu' : 'Tài', conf: 68 };
  return null;
}

// ---------- 15. THUẬT TOÁN TỔNG HỢP ĐA LUỒNG ----------
async function multiThreadPrediction(lichSu, tongData, diceData) {
  const algorithms = [
    markovChain, bayesProbability, streakAnalysis, binomialDistribution, monteCarlo,
    kalmanFilter, logisticRegression, rsiIndicator, macdIndicator, bollingerBands,
    stochasticOsc, williamsR, cciIndicator, entropyAnalysis
  ];
  
  const results = await Promise.all(algorithms.map(algo => algo(lichSu)));
  let diemTai = 0, diemXiu = 0, soTT = 0;
  for (let r of results) {
    if (r) {
      soTT++;
      if (r.pred === 'Tài') diemTai += r.conf;
      else diemXiu += r.conf;
    }
  }
  if (soTT === 0) return null;
  const pred = diemTai > diemXiu ? 'Tài' : 'Xỉu';
  let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
  conf = Math.min(92, Math.max(55, conf));
  return { pred, conf: Math.round(conf), soTT };
}

// ==========================================
// THUẬT TOÁN SICBO
// ==========================================
class SunwinSicboAlgorithm {
  constructor() { this.name = "SUNWIN_SICBO"; }
  
  duDoanTaiXiu(tongData) {
    if (tongData.length < 10) return { pred: "Tài", conf: 55 };
    let diemTai = 0, diemXiu = 0, soPP = 0;
    const last10 = tongData.slice(0, 10);
    const tai10 = last10.filter(t => t >= 11).length;
    soPP++; tai10 >= 7 ? diemXiu += 35 : (tai10 <= 3 ? diemTai += 35 : (tai10 >= 6 ? diemXiu += 25 : (tai10 <= 4 ? diemTai += 25 : (diemTai += 15, diemXiu += 15))));
    const avg5 = tongData.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    soPP++; avg5 > 12 ? diemXiu += 30 : (avg5 < 9 ? diemTai += 30 : (avg5 > 11 ? diemXiu += 20 : (avg5 < 10 ? diemTai += 20 : (diemTai += 12, diemXiu += 12))));
    let streak = 1;
    for (let i = 1; i < tongData.length; i++) {
      if ((tongData[i] >= 11) === (tongData[i-1] >= 11)) streak++;
      else break;
    }
    soPP++;
    if (streak >= 4) { if (tongData[0] >= 11) diemXiu += 35; else diemTai += 35; }
    else if (streak >= 3) { if (tongData[0] >= 11) diemXiu += 25; else diemTai += 25; }
    else { diemTai += 15; diemXiu += 15; }
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    return { pred, conf: Math.min(92, Math.max(52, Math.round(conf))), soPP };
  }
  
  duDoanChanLe(tongData) {
    if (tongData.length < 10) return { pred: "Chẵn", conf: 55 };
    let diemChan = 0, diemLe = 0, soPP = 0;
    const last5 = tongData.slice(0, 5);
    const chan5 = last5.filter(t => t % 2 === 0).length;
    soPP++; chan5 >= 4 ? diemLe += 30 : (chan5 <= 1 ? diemChan += 30 : (chan5 >= 3 ? diemChan += 20 : diemLe += 20));
    const last10 = tongData.slice(0, 10);
    const chan10 = last10.filter(t => t % 2 === 0).length;
    soPP++; chan10 >= 7 ? diemLe += 25 : (chan10 <= 3 ? diemChan += 25 : (chan10 >= 6 ? diemLe += 18 : (chan10 <= 4 ? diemChan += 18 : (diemChan += 12, diemLe += 12))));
    let streak = 1;
    for (let i = 1; i < tongData.length; i++) {
      if ((tongData[i] % 2 === 0) === (tongData[i-1] % 2 === 0)) streak++;
      else break;
    }
    soPP++; if (streak >= 3) { if (tongData[0] % 2 === 0) diemLe += 25; else diemChan += 25; }
    const pred = diemChan > diemLe ? "Chẵn" : "Lẻ";
    let conf = Math.abs(diemChan - diemLe) / (diemChan + diemLe) * 100;
    return { pred, conf: Math.min(90, Math.max(52, Math.round(conf))), soPP };
  }
  
  duDoanVi(tongData) {
    if (tongData.length < 15) {
      const duDoanTaiXiu = this.duDoanTaiXiu(tongData).pred;
      return duDoanTaiXiu === "Tài" ? { vi1: 11, vi2: 14, vi3: 16, tong: 41, conf: 55 } : { vi1: 5, vi2: 7, vi3: 9, tong: 21, conf: 55 };
    }
    const duDoanTaiXiu = this.duDoanTaiXiu(tongData).pred;
    const freq = {};
    for (let i = 4; i <= 17; i++) freq[i] = 0;
    for (let t of tongData.slice(0, 50)) if (t >= 4 && t <= 17) freq[t]++;
    const weightedFreq = {};
    for (let i = 4; i <= 17; i++) weightedFreq[i] = 0;
    for (let idx = 0; idx < Math.min(tongData.length, 30); idx++) {
      const t = tongData[idx];
      if (t >= 4 && t <= 17) weightedFreq[t] += Math.pow(0.92, idx);
    }
    let candidates = duDoanTaiXiu === "Tài" ? [11, 12, 13, 14, 15, 16, 17] : [4, 5, 6, 7, 8, 9, 10];
    candidates.sort((a, b) => weightedFreq[b] - weightedFreq[a]);
    let selected = [];
    for (let v of candidates) { if (selected.length >= 3) break; if (!selected.includes(v)) selected.push(v); }
    selected.sort((a, b) => a - b);
    let avgFreq = (freq[selected[0]] + freq[selected[1]] + freq[selected[2]]) / 3;
    let maxFreq = Math.max(...Object.values(freq));
    let confidence = 55 + Math.min(35, (avgFreq / (maxFreq + 1)) * 40);
    return { vi1: selected[0], vi2: selected[1], vi3: selected[2], tong: selected[0] + selected[1] + selected[2], conf: Math.min(88, Math.max(52, Math.round(confidence))) };
  }
  
  predict(lichSu, tongData, viData) {
    if (lichSu.length < 5) return { du_doan_tai_xiu: "Tài", do_tin_cay_tai_xiu: 55, du_doan_chan_le: "Chẵn", do_tin_cay_chan_le: 55, du_doan_vi: { vi1: 11, vi2: 14, vi3: 16, tong: 41, do_tin_cay: 55 }, giai_thich: "Chưa đủ dữ liệu" };
    const taiXiu = this.duDoanTaiXiu(tongData);
    const chanLe = this.duDoanChanLe(tongData);
    const vi = this.duDoanVi(tongData);
    return { du_doan_tai_xiu: taiXiu.pred, do_tin_cay_tai_xiu: taiXiu.conf, du_doan_chan_le: chanLe.pred, do_tin_cay_chan_le: chanLe.conf, du_doan_vi: { vi1: vi.vi1, vi2: vi.vi2, vi3: vi.vi3, tong: vi.tong, do_tin_cay: vi.conf }, giai_thich: `${taiXiu.soPP + chanLe.soPP} phương pháp` };
  }
}

// ==========================================
// THUẬT TOÁN TÀI XỈU ĐA LUỒNG
// ==========================================
class TaiXiuAlgorithm {
  constructor(name) { this.name = name; }
  async predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    const result = await multiThreadPrediction(lichSu, tongData);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán đa luồng` };
    const last3 = lichSu.slice(0, 3);
    const tai3 = last3.filter(r => r === "Tài").length;
    return { du_doan: tai3 >= 2 ? "Tài" : "Xỉu", do_tin_cay: 60, giai_thich: "Xu hướng 3 phiên" };
  }
}

// Khởi tạo algorithm
const algorithms = {
  'lc79_tx': new TaiXiuAlgorithm("LC79_TX"),
  'lc79_md5': new TaiXiuAlgorithm("LC79_MD5"),
  'betvip_tx': new TaiXiuAlgorithm("BETVIP_TX"),
  'betvip_md5': new TaiXiuAlgorithm("BETVIP_MD5"),
  'club789_tx': new TaiXiuAlgorithm("CLUB789_TX"),
  'b52': new TaiXiuAlgorithm("B52"),
  'max789': new TaiXiuAlgorithm("MAX789"),
  'luck8_md5': new TaiXiuAlgorithm("LUCK8_MD5"),
  'sumvin_md5': new TaiXiuAlgorithm("SUMVIN_MD5"),
  'gb68_thuong': new TaiXiuAlgorithm("GB68_THUONG"),
  'gb68_md5': new TaiXiuAlgorithm("GB68_MD5"),
  'alo_hitclub_md5': new TaiXiuAlgorithm("ALO_HITCLUB_MD5"),
  'luck8_sicbo40': new TaiXiuAlgorithm("LUCK8_SICBO40"),
  'lc79_xocdia': new TaiXiuAlgorithm("LC79_XOCDIA"),
  'sunwin_sicbo': new SunwinSicboAlgorithm()
};

// ==========================================
// XỬ LÝ REQUEST
// ==========================================
async function xuLyGame(gameKey) {
  let data;
  if (gameKey === 'sunwin_sicbo') data = await fetchSicboData(GAME_APIS[gameKey]);
  else data = await fetchGameData(GAME_APIS[gameKey], gameKey);
  if (!data) throw new Error(`Không lấy được dữ liệu ${gameKey}`);
  if (data.ket_qua === "Bão") throw new Error(`Game ${gameKey} ra Bão`);
  
  const hist = historyDB[gameKey];
  const lastPred = cacheDB[gameKey].get(data.phien - 1);
  const isSicbo = (gameKey === 'sunwin_sicbo');
  const isXocDia = (gameKey === 'lc79_xocdia');
  
  if (lastPred && lastPred.prediction !== undefined) {
    let thucTe = data.ket_qua;
    let duDoanCu = isSicbo ? lastPred.prediction_tx : lastPred.prediction;
    const dung = updateStats(gameKey, thucTe, duDoanCu, lastPred.confidence);
    lastPred.actual = thucTe;
    lastPred.isCorrect = dung;
    hist.lichSuDuDoan.unshift({ phien_du_doan: lastPred.phien_du_doan, du_doan: duDoanCu, do_tin_cay: lastPred.confidence, thuc_te: thucTe, ket_qua: dung ? 'ĐÚNG' : 'SAI', thoi_gian: new Date().toISOString() });
    if (hist.lichSuDuDoan.length > 100) hist.lichSuDuDoan.pop();
  }
  
  if (isXocDia) hist.data.unshift(data.ket_qua);
  else if (isSicbo) { hist.data.unshift(data.ket_qua); hist.tongData.unshift(data.tong); if (data.history) for (let h of data.history) if (h.tong) hist.tongData.push(h.tong); }
  else { hist.data.unshift(data.ket_qua); if (data.tong) hist.tongData.unshift(data.tong); if (data.dice) hist.diceData.unshift(data.dice); }
  
  while (hist.data.length > 500) hist.data.pop();
  while (hist.tongData.length > 500) hist.tongData.pop();
  while (hist.diceData.length > 500) hist.diceData.pop();
  
  if (cacheDB[gameKey].has(data.phien)) {
    const cached = cacheDB[gameKey].get(data.phien);
    if (isSicbo) return { phien_hien_tai: data.phien, ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong }, duDoan: { phien_du_doan: data.phien + 1, tai_xiu: cached.prediction_tx, do_tin_cay_tai_xiu: cached.confidence_tx + '%', chan_le: cached.prediction_cl, do_tin_cay_chan_le: cached.confidence_cl + '%', vi: `${cached.vi1}, ${cached.vi2}, ${cached.vi3}`, tong_vi: cached.tong_vi, do_tin_cay_vi: cached.confidence_vi + '%' }, thongKe: statsDB[gameKey], lichSuDuDoan: hist.lichSuDuDoan.slice(0, 30) };
    else return { phien_hien_tai: data.phien, ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong }, duDoan: { phien_du_doan: data.phien + 1, du_doan: cached.prediction, do_tin_cay: cached.confidence + '%', giai_thich: cached.reason }, thongKe: statsDB[gameKey], lichSuDuDoan: hist.lichSuDuDoan.slice(0, 30) };
  }
  
  const algo = algorithms[gameKey];
  let prediction;
  if (isSicbo) {
    prediction = algo.predict(hist.data, hist.tongData, hist.viData);
    cacheDB[gameKey].set(data.phien, { prediction_tx: prediction.du_doan_tai_xiu, confidence_tx: prediction.do_tin_cay_tai_xiu, prediction_cl: prediction.du_doan_chan_le, confidence_cl: prediction.do_tin_cay_chan_le, vi1: prediction.du_doan_vi.vi1, vi2: prediction.du_doan_vi.vi2, vi3: prediction.du_doan_vi.vi3, tong_vi: prediction.du_doan_vi.tong, confidence_vi: prediction.du_doan_vi.do_tin_cay, phien_du_doan: data.phien + 1 });
  } else {
    prediction = await algo.predict(hist.data, hist.tongData, hist.diceData);
    cacheDB[gameKey].set(data.phien, { prediction: prediction.du_doan, confidence: prediction.do_tin_cay, reason: prediction.giai_thich, phien_du_doan: data.phien + 1 });
  }
  
  if (cacheDB[gameKey].size > 20) { const firstKey = cacheDB[gameKey].keys().next().value; cacheDB[gameKey].delete(firstKey); }
  
  if (isSicbo) return { phien_hien_tai: data.phien, ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong }, duDoan: { phien_du_doan: data.phien + 1, tai_xiu: prediction.du_doan_tai_xiu, do_tin_cay_tai_xiu: prediction.do_tin_cay_tai_xiu + '%', chan_le: prediction.du_doan_chan_le, do_tin_cay_chan_le: prediction.do_tin_cay_chan_le + '%', vi: `${prediction.du_doan_vi.vi1}, ${prediction.du_doan_vi.vi2}, ${prediction.du_doan_vi.vi3}`, tong_vi: prediction.du_doan_vi.tong, do_tin_cay_vi: prediction.du_doan_vi.do_tin_cay + '%' }, thongKe: statsDB[gameKey], lichSuDuDoan: hist.lichSuDuDoan.slice(0, 30) };
  else return { phien_hien_tai: data.phien, ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong }, duDoan: { phien_du_doan: data.phien + 1, du_doan: prediction.du_doan, do_tin_cay: prediction.do_tin_cay + '%', giai_thich: prediction.giai_thich }, thongKe: statsDB[gameKey], lichSuDuDoan: hist.lichSuDuDoan.slice(0, 30) };
}

// ==========================================
// TẠO ENDPOINTS
// ==========================================
for (let gameKey in GAME_APIS) {
  const endpoint = `/${gameKey.replace(/_/g, '/')}`;
  app.get(endpoint, async (req, res) => {
    try { const result = await xuLyGame(gameKey); res.json({ game: gameKey.toUpperCase(), ...result, author: '@tranhoang2286', version: 'MULTI-THREAD' }); }
    catch (err) { res.status(500).json({ error: err.message }); }
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
  res.json({ name: '🏆 15 GAME - ĐA LUỒNG + 14 THUẬT TOÁN 🏆', author: '@tranhoang2286', version: '33.0 - MULTI-THREAD', endpoints: { 'Tài Xỉu (14 game)': Object.keys(GAME_APIS).filter(k => k !== 'sunwin_sicbo').map(k => `/${k.replace(/_/g, '/')}`), 'Sicbo (3 kết quả)': '/sunwin/sicbo', 'Lịch sử': '/lich-su/:game' }, thong_tin: { da_luong: 'Promise.all chạy 14 thuật toán đồng thời', thuat_toan: 'Markov, Bayes, RSI, MACD, Bollinger, Stochastic, CCI, Entropy, Kalman, Logistic, Monte Carlo...', sicbo: 'Tài/Xỉu, Chẵn/Lẻ, 3 vị' } });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏆 15 GAME - ĐA LUỒNG + 14 THUẬT TOÁN - PORT ${PORT}`);
  console.log(`✅ 14 thuật toán chạy đồng thời (Promise.all)`);
  console.log(`✅ Markov, Bayes, RSI, MACD, Bollinger, Stochastic, CCI, Entropy, Kalman, Logistic, Monte Carlo...`);
  console.log(`✅ Sicbo: 3 kết quả với vị cụ thể (VD: 11, 14, 16)`);
});
