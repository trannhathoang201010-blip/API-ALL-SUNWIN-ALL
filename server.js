const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// DANH SÁCH API MỚI (23/5/2026) - 30+ GAME
// ==========================================
const GAME_APIS = {
  // SUNWIN
  'sunwin_tx': 'https://era-technology-particular-domestic.trycloudflare.com/api/tx',
  'sunwin_sicbo': 'https://enquiries-indices-navigator-mega.trycloudflare.com/api/sunsicbo',
  'sunwin_sunphung': 'https://ntsc-fly-questionnaire-divx.trycloudflare.com/api/sunphung',
  'sunwin_xocdia_live': 'https://suggested-knew-ban-furniture.trycloudflare.com/api/xdlive',
  
  // HITCLUB / GO88
  'hitclub_tx': 'https://preference-assuming-picnic-concentration.trycloudflare.com/api/tx',
  'hitclub_txmd5': 'https://preference-assuming-picnic-concentration.trycloudflare.com/api/txmd5',
  'hitclub_sicbo': 'https://implement-university-orders-consciousness.trycloudflare.com/sicbo/hitclub',
  
  // LC79
  'lc79_tx': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/tx',
  'lc79_txmd5': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/txmd5',
  'lc79_xocdia': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/xocdia',
  
  // BETVIP
  'betvip_tx': 'https://eve-hydrocodone-offshore-eagle.trycloudflare.com/api/tx',
  'betvip_txmd5': 'https://eve-hydrocodone-offshore-eagle.trycloudflare.com/api/txmd5',
  
  // 789CLUB
  'club789_tx': 'https://venue-integrate-aged-heavily.trycloudflare.com/api/tx',
  'club789_sicbo': 'https://implement-university-orders-consciousness.trycloudflare.com/sicbo/789club',
  
  // B52
  'b52_txmd5': 'https://flex-knights-agree-grass.trycloudflare.com/txmd5',
  'b52_sicbo': 'https://implement-university-orders-consciousness.trycloudflare.com/sicbo/b52',
  
  // MAX789
  'max789_txmd5': 'https://deutschland-mandatory-upon-changelog.trycloudflare.com/api/tx',
  
  // SON789
  'son789_tx': 'https://with-boating-signed-turn.trycloudflare.com/api/tx',
  
  // LUCK8
  'luck8_txmd5': 'https://qld-incentives-tion-boost.trycloudflare.com/api/txmd5',
  'luck8_sicbo40': 'https://qld-incentives-tion-boost.trycloudflare.com/api/sicbo40',
  
  // SUMVIN
  'sumvin_txmd5': 'https://cricket-compressed-list-suppose.trycloudflare.com/api/md5',
  
  // 68GB
  'gb68_thuong': 'https://description-zen-dog-films.trycloudflare.com/api/68/thuong',
  'gb68_txmd5': 'https://profiles-televisions-sic-stay.trycloudflare.com/api/68/md5',
  
  // OGK.FAN
  'ogk_txmd5': 'https://liver-specs-processors-css.trycloudflare.com/api/txmd5/latest',
  
  // BCR SEXY V1
  'bcr_v1': 'https://employers-hormone-land-idaho.trycloudflare.com/api/bcr',
  
  // BCR V2 - 25 bàn (1-10 và C01-C15)
  'bcr_1': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/1',
  'bcr_2': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/2',
  'bcr_3': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/3',
  'bcr_4': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/4',
  'bcr_5': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/5',
  'bcr_6': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/6',
  'bcr_7': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/7',
  'bcr_8': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/8',
  'bcr_9': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/9',
  'bcr_10': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/10',
  'bcr_C01': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C01',
  'bcr_C02': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C02',
  'bcr_C03': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C03',
  'bcr_C04': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C04',
  'bcr_C05': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C05',
  'bcr_C06': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C06',
  'bcr_C07': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C07',
  'bcr_C08': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C08',
  'bcr_C09': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C09',
  'bcr_C10': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C10',
  'bcr_C11': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C11',
  'bcr_C12': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C12',
  'bcr_C13': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C13',
  'bcr_C14': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C14',
  'bcr_C15': 'https://nurse-involves-avoiding-farmers.trycloudflare.com/api/bcr/C15'
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
    
    if (gameKey === 'sunwin_xocdia_live') {
      if (data.ket_qua_truyen_thong) {
        return { phien: data.phien, ket_qua: data.ket_qua_truyen_thong, dice: [], tong: null };
      }
      return null;
    }
    
    if (gameKey === 'sunwin_sunphung') {
      if (data.success && data.data) {
        let ketQua = data.data.he_so >= 4 ? 'Tài' : 'Xỉu';
        return { phien: data.data.phien, ket_qua: ketQua, dice: [], tong: data.data.he_so };
      }
      return null;
    }
    
    if (gameKey.startsWith('bcr_')) {
      if (data.last_5 && data.last_5.length > 0) {
        const lastResult = data.last_5[data.last_5.length - 1];
        let ketQua = lastResult.winner === 'Banker' ? 'Cái' : (lastResult.winner === 'Player' ? 'Con' : 'Hòa');
        let phien = data.phien || Date.now();
        return { phien, ket_qua: ketQua, dice: [], tong: null, bcr_data: data };
      }
      return null;
    }
    
    if (gameKey === 'bcr_v1') {
      if (data.data && data.data.length > 0) {
        return { phien: Date.now(), ket_qua: 'Cái', dice: [], tong: null };
      }
      return null;
    }
    
    if (gameKey.includes('sicbo')) {
      if (data.ket_qua) {
        let ketQua = data.ket_qua === 'Tài' ? 'Tài' : (data.ket_qua === 'Xỉu' ? 'Xỉu' : 'Bão');
        if (ketQua === 'Bão') return null;
        return { phien: data.phien, ket_qua: ketQua, dice: [data.xuc_xac_1, data.xuc_xac_2, data.xuc_xac_3], tong: data.tong };
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
    if (gameKey === 'b52_txmd5' && phien) phien = parseInt(String(phien).replace('#', ''));
    
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
// ========== 30 THUẬT TOÁN CHUYÊN SÂU ==========
// ==========================================

// 1. Markov Chain bậc 1-5
function markovChainBac1(lichSu) {
  if (lichSu.length < 5) return null;
  const trans = { T: { T: 0, X: 0 }, X: { T: 0, X: 0 } };
  for (let i = 0; i < lichSu.length - 1; i++) {
    const cur = lichSu[i] === 'Tài' ? 'T' : 'X';
    const nxt = lichSu[i+1] === 'Tài' ? 'T' : 'X';
    trans[cur][nxt]++;
  }
  const last = lichSu[0] === 'Tài' ? 'T' : 'X';
  const total = trans[last].T + trans[last].X;
  if (total < 3) return null;
  const prob = trans[last].T / total;
  const pred = prob > 0.5 ? 'Tài' : 'Xỉu';
  let conf = 55 + Math.abs(prob - 0.5) * 60;
  return { pred, conf: Math.min(88, Math.round(conf)) };
}

function markovChainBac2(lichSu) {
  if (lichSu.length < 7) return null;
  const map = new Map();
  for (let i = 0; i < lichSu.length - 2; i++) {
    const key = `${lichSu[i]==='Tài'?'T':'X'},${lichSu[i+1]==='Tài'?'T':'X'}`;
    const next = lichSu[i+2] === 'Tài' ? 'T' : 'X';
    if (!map.has(key)) map.set(key, { T: 0, X: 0 });
    map.get(key)[next]++;
  }
  const lastKey = `${lichSu[0]==='Tài'?'T':'X'},${lichSu[1]==='Tài'?'T':'X'}`;
  const stat = map.get(lastKey);
  if (!stat || stat.T + stat.X < 2) return null;
  const pred = stat.T > stat.X ? 'Tài' : 'Xỉu';
  let conf = 60 + (stat.T + stat.X) * 3;
  return { pred, conf: Math.min(88, Math.round(conf)) };
}

function markovChainBac3(lichSu) {
  if (lichSu.length < 9) return null;
  const map = new Map();
  for (let i = 0; i < lichSu.length - 3; i++) {
    const key = `${lichSu[i]==='Tài'?'T':'X'},${lichSu[i+1]==='Tài'?'T':'X'},${lichSu[i+2]==='Tài'?'T':'X'}`;
    const next = lichSu[i+3] === 'Tài' ? 'T' : 'X';
    if (!map.has(key)) map.set(key, { T: 0, X: 0 });
    map.get(key)[next]++;
  }
  const lastKey = `${lichSu[0]==='Tài'?'T':'X'},${lichSu[1]==='Tài'?'T':'X'},${lichSu[2]==='Tài'?'T':'X'}`;
  const stat = map.get(lastKey);
  if (!stat || stat.T + stat.X < 2) return null;
  const pred = stat.T > stat.X ? 'Tài' : 'Xỉu';
  let conf = 65 + (stat.T + stat.X) * 2;
  return { pred, conf: Math.min(88, Math.round(conf)) };
}

function markovChainBac4(lichSu) {
  if (lichSu.length < 11) return null;
  const map = new Map();
  for (let i = 0; i < lichSu.length - 4; i++) {
    const key = `${lichSu[i]==='Tài'?'T':'X'},${lichSu[i+1]==='Tài'?'T':'X'},${lichSu[i+2]==='Tài'?'T':'X'},${lichSu[i+3]==='Tài'?'T':'X'}`;
    const next = lichSu[i+4] === 'Tài' ? 'T' : 'X';
    if (!map.has(key)) map.set(key, { T: 0, X: 0 });
    map.get(key)[next]++;
  }
  const lastKey = `${lichSu[0]==='Tài'?'T':'X'},${lichSu[1]==='Tài'?'T':'X'},${lichSu[2]==='Tài'?'T':'X'},${lichSu[3]==='Tài'?'T':'X'}`;
  const stat = map.get(lastKey);
  if (!stat || stat.T + stat.X < 2) return null;
  const pred = stat.T > stat.X ? 'Tài' : 'Xỉu';
  let conf = 68 + (stat.T + stat.X) * 2;
  return { pred, conf: Math.min(88, Math.round(conf)) };
}

function markovChainBac5(lichSu) {
  if (lichSu.length < 13) return null;
  const map = new Map();
  for (let i = 0; i < lichSu.length - 5; i++) {
    const key = `${lichSu[i]==='Tài'?'T':'X'},${lichSu[i+1]==='Tài'?'T':'X'},${lichSu[i+2]==='Tài'?'T':'X'},${lichSu[i+3]==='Tài'?'T':'X'},${lichSu[i+4]==='Tài'?'T':'X'}`;
    const next = lichSu[i+5] === 'Tài' ? 'T' : 'X';
    if (!map.has(key)) map.set(key, { T: 0, X: 0 });
    map.get(key)[next]++;
  }
  const lastKey = `${lichSu[0]==='Tài'?'T':'X'},${lichSu[1]==='Tài'?'T':'X'},${lichSu[2]==='Tài'?'T':'X'},${lichSu[3]==='Tài'?'T':'X'},${lichSu[4]==='Tài'?'T':'X'}`;
  const stat = map.get(lastKey);
  if (!stat || stat.T + stat.X < 2) return null;
  const pred = stat.T > stat.X ? 'Tài' : 'Xỉu';
  let conf = 70 + (stat.T + stat.X) * 2;
  return { pred, conf: Math.min(88, Math.round(conf)) };
}

// 2. Xác suất Bayes nâng cao
function bayesProbability3(lichSu) {
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
  let conf = 50 + Math.abs(postTai - postXiu) / (postTai + postXiu) * 50;
  return { pred, conf: Math.round(conf) };
}

function bayesProbability4(lichSu) {
  if (lichSu.length < 15) return null;
  const pTai = lichSu.filter(r => r === 'Tài').length / lichSu.length;
  const pXiu = 1 - pTai;
  const last4 = lichSu.slice(0, 4);
  let condTai = 0, condXiu = 0, countTai = 0, countXiu = 0;
  for (let i = 0; i < lichSu.length - 4; i++) {
    if (lichSu.slice(i, i + 4).join('') === last4.join('')) {
      if (lichSu[i + 4] === 'Tài') { condTai++; countTai++; }
      else { condXiu++; countXiu++; }
    }
  }
  condTai = condTai / Math.max(1, countTai);
  condXiu = condXiu / Math.max(1, countXiu);
  const postTai = pTai * condTai;
  const postXiu = pXiu * condXiu;
  if (postTai + postXiu === 0) return null;
  const pred = postTai > postXiu ? 'Tài' : 'Xỉu';
  let conf = 50 + Math.abs(postTai - postXiu) / (postTai + postXiu) * 55;
  return { pred, conf: Math.round(conf) };
}

function bayesProbability5(lichSu) {
  if (lichSu.length < 20) return null;
  const pTai = lichSu.filter(r => r === 'Tài').length / lichSu.length;
  const pXiu = 1 - pTai;
  const last5 = lichSu.slice(0, 5);
  let condTai = 0, condXiu = 0, countTai = 0, countXiu = 0;
  for (let i = 0; i < lichSu.length - 5; i++) {
    if (lichSu.slice(i, i + 5).join('') === last5.join('')) {
      if (lichSu[i + 5] === 'Tài') { condTai++; countTai++; }
      else { condXiu++; countXiu++; }
    }
  }
  condTai = condTai / Math.max(1, countTai);
  condXiu = condXiu / Math.max(1, countXiu);
  const postTai = pTai * condTai;
  const postXiu = pXiu * condXiu;
  if (postTai + postXiu === 0) return null;
  const pred = postTai > postXiu ? 'Tài' : 'Xỉu';
  let conf = 50 + Math.abs(postTai - postXiu) / (postTai + postXiu) * 60;
  return { pred, conf: Math.round(conf) };
}

// 3. Phân tích chuỗi (Streak) nâng cao
function streakAnalysisCoBan(lichSu) {
  if (lichSu.length < 3) return null;
  let streak = 1;
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[i-1]) streak++;
    else break;
  }
  if (streak >= 8) return { pred: lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài', conf: 92 };
  if (streak >= 6) return { pred: lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài', conf: 88 };
  if (streak >= 5) return { pred: lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài', conf: 85 };
  if (streak >= 4) return { pred: lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài', conf: 80 };
  if (streak >= 3) return { pred: lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài', conf: 72 };
  if (streak === 2) return { pred: lichSu[0], conf: 62 };
  return null;
}

function streakAnalysisNangCao(lichSu) {
  if (lichSu.length < 8) return null;
  let maxStreak = 1, curStreak = 1;
  let maxValue = lichSu[0];
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[i-1]) { curStreak++; if (curStreak > maxStreak) { maxStreak = curStreak; maxValue = lichSu[i]; } }
    else curStreak = 1;
  }
  if (maxStreak >= 7) return { pred: maxValue === 'Tài' ? 'Xỉu' : 'Tài', conf: 90 };
  if (maxStreak >= 5) return { pred: maxValue === 'Tài' ? 'Xỉu' : 'Tài', conf: 85 };
  return null;
}

function streakAnalysisTheoDoi(lichSu) {
  if (lichSu.length < 6) return null;
  let segments = [];
  let j = 0;
  while (j < lichSu.length) {
    let count = 1;
    while (j + count < lichSu.length && lichSu[j] === lichSu[j+count]) count++;
    segments.push({ val: lichSu[j], len: count });
    j += count;
  }
  if (segments.length >= 2) {
    const lastSeg = segments[segments.length-1];
    const prevSeg = segments[segments.length-2];
    if (prevSeg.val === lastSeg.val && lastSeg.len >= prevSeg.len) {
      return { pred: lastSeg.val === 'Tài' ? 'Xỉu' : 'Tài', conf: 78 };
    }
  }
  return null;
}

// 4. Phân phối nhị phân và thống kê
function binomialDistribution5(lichSu) {
  if (lichSu.length < 5) return null;
  const taiCount = lichSu.slice(0, 5).filter(r => r === 'Tài').length;
  if (taiCount >= 4) return { pred: 'Xỉu', conf: 75 };
  if (taiCount <= 1) return { pred: 'Tài', conf: 75 };
  return null;
}

function binomialDistribution10(lichSu) {
  if (lichSu.length < 10) return null;
  const taiCount = lichSu.slice(0, 10).filter(r => r === 'Tài').length;
  if (taiCount >= 8) return { pred: 'Xỉu', conf: 82 };
  if (taiCount <= 2) return { pred: 'Tài', conf: 82 };
  if (taiCount >= 7) return { pred: 'Xỉu', conf: 75 };
  if (taiCount <= 3) return { pred: 'Tài', conf: 75 };
  return null;
}

function binomialDistribution20(lichSu) {
  if (lichSu.length < 20) return null;
  const taiCount = lichSu.slice(0, 20).filter(r => r === 'Tài').length;
  const expected = 10;
  const deviation = Math.abs(taiCount - expected);
  if (deviation >= 8) return { pred: taiCount > expected ? 'Xỉu' : 'Tài', conf: 85 };
  if (deviation >= 6) return { pred: taiCount > expected ? 'Xỉu' : 'Tài', conf: 78 };
  if (deviation >= 4) return { pred: taiCount > expected ? 'Xỉu' : 'Tài', conf: 70 };
  return null;
}

function binomialDistribution30(lichSu) {
  if (lichSu.length < 30) return null;
  const taiCount = lichSu.slice(0, 30).filter(r => r === 'Tài').length;
  if (taiCount >= 22) return { pred: 'Xỉu', conf: 84 };
  if (taiCount <= 8) return { pred: 'Tài', conf: 84 };
  if (taiCount >= 20) return { pred: 'Xỉu', conf: 76 };
  if (taiCount <= 10) return { pred: 'Tài', conf: 76 };
  return null;
}

// 5. Monte Carlo Simulation
function monteCarlo5(lichSu) {
  if (lichSu.length < 10) return null;
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
  if (taiCount + xiuCount < 2) return null;
  const pred = taiCount > xiuCount ? 'Tài' : 'Xỉu';
  let conf = 55 + Math.abs(taiCount - xiuCount) * 5;
  return { pred, conf: Math.min(85, conf) };
}

function monteCarlo3(lichSu) {
  if (lichSu.length < 8) return null;
  const last3 = lichSu.slice(0, 3);
  let taiCount = 0, xiuCount = 0;
  for (let i = 3; i < lichSu.length - 3; i++) {
    let match = true;
    for (let j = 0; j < 3; j++) {
      if (lichSu[i + j] !== last3[j]) { match = false; break; }
    }
    if (match && i + 3 < lichSu.length) {
      if (lichSu[i + 3] === 'Tài') taiCount++;
      else xiuCount++;
    }
  }
  if (taiCount + xiuCount < 2) return null;
  const pred = taiCount > xiuCount ? 'Tài' : 'Xỉu';
  let conf = 50 + Math.abs(taiCount - xiuCount) * 4;
  return { pred, conf: Math.min(82, conf) };
}

function monteCarlo7(lichSu) {
  if (lichSu.length < 14) return null;
  const last7 = lichSu.slice(0, 7);
  let taiCount = 0, xiuCount = 0;
  for (let i = 7; i < lichSu.length - 7; i++) {
    let match = true;
    for (let j = 0; j < 7; j++) {
      if (lichSu[i + j] !== last7[j]) { match = false; break; }
    }
    if (match && i + 7 < lichSu.length) {
      if (lichSu[i + 7] === 'Tài') taiCount++;
      else xiuCount++;
    }
  }
  if (taiCount + xiuCount < 2) return null;
  const pred = taiCount > xiuCount ? 'Tài' : 'Xỉu';
  let conf = 58 + Math.abs(taiCount - xiuCount) * 3;
  return { pred, conf: Math.min(88, conf) };
}

// 6. Kalman Filter
function kalmanFilterCoBan(lichSu) {
  if (lichSu.length < 15) return null;
  let mean = 0.5;
  let variance = 0.1;
  for (let i = 0; i < Math.min(15, lichSu.length); i++) {
    const z = lichSu[i] === 'Tài' ? 1 : 0;
    const k = variance / (variance + 0.1);
    mean = mean + k * (z - mean);
    variance = (1 - k) * variance;
  }
  const pred = mean > 0.5 ? 'Tài' : 'Xỉu';
  let conf = 50 + Math.abs(mean - 0.5) * 70;
  return { pred, conf: Math.min(86, Math.round(conf)) };
}

function kalmanFilterNangCao(lichSu) {
  if (lichSu.length < 25) return null;
  let mean = 0.5;
  let variance = 0.15;
  let q = 0.05;
  let r = 0.1;
  for (let i = 0; i < Math.min(25, lichSu.length); i++) {
    const z = lichSu[i] === 'Tài' ? 1 : 0;
    const k = variance / (variance + r);
    mean = mean + k * (z - mean);
    variance = (1 - k) * variance + q;
  }
  const pred = mean > 0.5 ? 'Tài' : 'Xỉu';
  let conf = 50 + Math.abs(mean - 0.5) * 80;
  return { pred, conf: Math.min(88, Math.round(conf)) };
}

// 7. Hồi quy Logistic
function logisticRegression5(lichSu) {
  if (lichSu.length < 10) return null;
  let score = 0;
  for (let i = 0; i < 5; i++) {
    if (lichSu[i] === 'Tài') score += 1;
    else score -= 1;
  }
  const last = lichSu[0] === 'Tài' ? 1 : 0;
  score = score / 5;
  const logit = 0.6 * score + 0.4 * (last - 0.5);
  const prob = 1 / (1 + Math.exp(-logit * 2));
  const pred = prob > 0.5 ? 'Tài' : 'Xỉu';
  let conf = 50 + Math.abs(prob - 0.5) * 70;
  return { pred, conf: Math.min(84, Math.round(conf)) };
}

function logisticRegression10(lichSu) {
  if (lichSu.length < 15) return null;
  let score = 0;
  for (let i = 0; i < 10; i++) {
    if (lichSu[i] === 'Tài') score += 1;
    else score -= 1;
  }
  const last = lichSu[0] === 'Tài' ? 1 : 0;
  score = score / 10;
  const logit = 0.5 * score + 0.3 * (last - 0.5);
  const prob = 1 / (1 + Math.exp(-logit * 2.5));
  const pred = prob > 0.5 ? 'Tài' : 'Xỉu';
  let conf = 50 + Math.abs(prob - 0.5) * 75;
  return { pred, conf: Math.min(86, Math.round(conf)) };
}

function logisticRegression15(lichSu) {
  if (lichSu.length < 20) return null;
  let score = 0;
  for (let i = 0; i < 15; i++) {
    if (lichSu[i] === 'Tài') score += 1;
    else score -= 1;
  }
  const last = lichSu[0] === 'Tài' ? 1 : 0;
  score = score / 15;
  const logit = 0.45 * score + 0.25 * (last - 0.5);
  const prob = 1 / (1 + Math.exp(-logit * 3));
  const pred = prob > 0.5 ? 'Tài' : 'Xỉu';
  let conf = 50 + Math.abs(prob - 0.5) * 80;
  return { pred, conf: Math.min(88, Math.round(conf)) };
}

// 8. RSI Indicator
function rsi7(lichSu) {
  if (lichSu.length < 8) return null;
  const nums = lichSu.slice(0, 7).map(r => r === 'Tài' ? 1 : 0);
  let gains = 0, losses = 0;
  for (let i = 1; i < nums.length; i++) {
    const diff = nums[i] - nums[i-1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / 7, avgLoss = losses / 7;
  const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  if (rsi >= 75) return { pred: 'Xỉu', conf: 78 };
  if (rsi <= 25) return { pred: 'Tài', conf: 78 };
  return null;
}

function rsi14(lichSu) {
  if (lichSu.length < 15) return null;
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
  if (rsi >= 60) return { pred: 'Xỉu', conf: 68 };
  if (rsi <= 40) return { pred: 'Tài', conf: 68 };
  return null;
}

function rsi21(lichSu) {
  if (lichSu.length < 22) return null;
  const nums = lichSu.slice(0, 21).map(r => r === 'Tài' ? 1 : 0);
  let gains = 0, losses = 0;
  for (let i = 1; i < nums.length; i++) {
    const diff = nums[i] - nums[i-1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / 21, avgLoss = losses / 21;
  const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  if (rsi >= 68) return { pred: 'Xỉu', conf: 72 };
  if (rsi <= 32) return { pred: 'Tài', conf: 72 };
  return null;
}

// 9. MACD Indicator
function macd6_13_4(lichSu) {
  if (lichSu.length < 20) return null;
  const nums = lichSu.map(r => r === 'Tài' ? 1 : 0);
  const ema6 = nums.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
  const ema13 = nums.slice(0, 13).reduce((a, b) => a + b, 0) / 13;
  const macd = ema6 - ema13;
  const signal = macd * 0.8;
  if (macd > signal + 0.08) return { pred: 'Tài', conf: 70 };
  if (macd < signal - 0.08) return { pred: 'Xỉu', conf: 70 };
  return null;
}

function macd12_26_9(lichSu) {
  if (lichSu.length < 35) return null;
  const nums = lichSu.map(r => r === 'Tài' ? 1 : 0);
  const ema12 = nums.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
  const ema26 = nums.slice(0, 26).reduce((a, b) => a + b, 0) / 26;
  const macd = ema12 - ema26;
  const ema9 = (macd + (nums[0] === 'Tài' ? 1 : 0)) / 2;
  const signal = ema9 * 0.85;
  if (macd > signal + 0.05) return { pred: 'Tài', conf: 68 };
  if (macd < signal - 0.05) return { pred: 'Xỉu', conf: 68 };
  return null;
}

// 10. Bollinger Bands
function bollinger20_2(lichSu) {
  if (lichSu.length < 20) return null;
  const nums = lichSu.slice(0, 20).map(r => r === 'Tài' ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 20;
  const variance = nums.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / 20;
  const std = Math.sqrt(variance);
  const last = nums[19];
  if (last > mean + 2 * std) return { pred: 'Xỉu', conf: 74 };
  if (last < mean - 2 * std) return { pred: 'Tài', conf: 74 };
  return null;
}

function bollinger14_2(lichSu) {
  if (lichSu.length < 14) return null;
  const nums = lichSu.slice(0, 14).map(r => r === 'Tài' ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 14;
  const variance = nums.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / 14;
  const std = Math.sqrt(variance);
  const last = nums[13];
  if (last > mean + 2 * std) return { pred: 'Xỉu', conf: 72 };
  if (last < mean - 2 * std) return { pred: 'Tài', conf: 72 };
  return null;
}

// 11. Stochastic Oscillator
function stochastic7(lichSu) {
  if (lichSu.length < 7) return null;
  const nums = lichSu.slice(0, 7).map(r => r === 'Tài' ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return null;
  const k = (nums[6] - lowest) / (highest - lowest) * 100;
  if (k > 85) return { pred: 'Xỉu', conf: 72 };
  if (k < 15) return { pred: 'Tài', conf: 72 };
  return null;
}

function stochastic14(lichSu) {
  if (lichSu.length < 14) return null;
  const nums = lichSu.slice(0, 14).map(r => r === 'Tài' ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return null;
  const k = (nums[13] - lowest) / (highest - lowest) * 100;
  if (k > 80) return { pred: 'Xỉu', conf: 70 };
  if (k < 20) return { pred: 'Tài', conf: 70 };
  return null;
}

// 12. Williams %R
function williams7(lichSu) {
  if (lichSu.length < 7) return null;
  const nums = lichSu.slice(0, 7).map(r => r === 'Tài' ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return null;
  const wr = (highest - nums[6]) / (highest - lowest) * -100;
  if (wr < -85) return { pred: 'Tài', conf: 72 };
  if (wr > -15) return { pred: 'Xỉu', conf: 72 };
  return null;
}

function williams14(lichSu) {
  if (lichSu.length < 14) return null;
  const nums = lichSu.slice(0, 14).map(r => r === 'Tài' ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return null;
  const wr = (highest - nums[13]) / (highest - lowest) * -100;
  if (wr < -80) return { pred: 'Tài', conf: 70 };
  if (wr > -20) return { pred: 'Xỉu', conf: 70 };
  return null;
}

// 13. CCI Indicator
function cci10(lichSu) {
  if (lichSu.length < 10) return null;
  const nums = lichSu.slice(0, 10).map(r => r === 'Tài' ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 10;
  const mad = nums.reduce((sum, x) => sum + Math.abs(x - mean), 0) / 10;
  if (mad === 0) return null;
  const cci = (nums[9] - mean) / (0.015 * mad);
  if (cci > 100) return { pred: 'Xỉu', conf: 70 };
  if (cci < -100) return { pred: 'Tài', conf: 70 };
  if (cci > 80) return { pred: 'Xỉu', conf: 65 };
  if (cci < -80) return { pred: 'Tài', conf: 65 };
  return null;
}

function cci14(lichSu) {
  if (lichSu.length < 14) return null;
  const nums = lichSu.slice(0, 14).map(r => r === 'Tài' ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 14;
  const mad = nums.reduce((sum, x) => sum + Math.abs(x - mean), 0) / 14;
  if (mad === 0) return null;
  const cci = (nums[13] - mean) / (0.015 * mad);
  if (cci > 120) return { pred: 'Xỉu', conf: 72 };
  if (cci < -120) return { pred: 'Tài', conf: 72 };
  return null;
}

// 14. Entropy Analysis
function entropy10(lichSu) {
  if (lichSu.length < 10) return null;
  const tai10 = lichSu.slice(0, 10).filter(r => r === 'Tài').length;
  const p = tai10 / 10;
  if (p === 0) return { pred: 'Tài', conf: 78 };
  if (p === 1) return { pred: 'Xỉu', conf: 78 };
  const entropy = -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  if (entropy < 0.5) return { pred: p > 0.5 ? 'Tài' : 'Xỉu', conf: 74 };
  if (entropy > 0.95) return { pred: p > 0.5 ? 'Xỉu' : 'Tài', conf: 70 };
  return null;
}

function entropy20(lichSu) {
  if (lichSu.length < 20) return null;
  const tai20 = lichSu.slice(0, 20).filter(r => r === 'Tài').length;
  const p = tai20 / 20;
  if (p === 0) return { pred: 'Tài', conf: 82 };
  if (p === 1) return { pred: 'Xỉu', conf: 82 };
  const entropy = -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  if (entropy < 0.6) return { pred: p > 0.5 ? 'Tài' : 'Xỉu', conf: 76 };
  if (entropy > 0.9) return { pred: p > 0.5 ? 'Xỉu' : 'Tài', conf: 72 };
  return null;
}

function entropy30(lichSu) {
  if (lichSu.length < 30) return null;
  const tai30 = lichSu.slice(0, 30).filter(r => r === 'Tài').length;
  const p = tai30 / 30;
  if (p === 0) return { pred: 'Tài', conf: 85 };
  if (p === 1) return { pred: 'Xỉu', conf: 85 };
  const entropy = -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  if (entropy < 0.65) return { pred: p > 0.5 ? 'Tài' : 'Xỉu', conf: 78 };
  if (entropy > 0.88) return { pred: p > 0.5 ? 'Xỉu' : 'Tài', conf: 74 };
  return null;
}

// 15. Linear Regression
function linearRegression5(lichSu) {
  if (lichSu.length < 10) return null;
  const y = lichSu.slice(0, 5).map(r => r === 'Tài' ? 1 : 0);
  const x = [0, 1, 2, 3, 4];
  const n = 5;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0);
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const pred = slope * 5 + intercept;
  const result = pred > 0.5 ? 'Tài' : 'Xỉu';
  let conf = 55 + Math.abs(slope) * 20;
  return { pred: result, conf: Math.min(80, Math.round(conf)) };
}

function linearRegression10(lichSu) {
  if (lichSu.length < 15) return null;
  const y = lichSu.slice(0, 10).map(r => r === 'Tài' ? 1 : 0);
  const x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const n = 10;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0);
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const pred = slope * 10 + intercept;
  const result = pred > 0.5 ? 'Tài' : 'Xỉu';
  let conf = 55 + Math.abs(slope) * 15;
  return { pred: result, conf: Math.min(82, Math.round(conf)) };
}

// 16. KNN (K-Nearest Neighbors)
function knn5(lichSu) {
  if (lichSu.length < 15) return null;
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
  const taiCount = neighbors.filter(n => n.next === 'Tài').length;
  const pred = taiCount > k/2 ? 'Tài' : 'Xỉu';
  let conf = 55 + (k - distances[0].diff) * 3;
  return { pred, conf: Math.min(80, conf) };
}

function knn7(lichSu) {
  if (lichSu.length < 20) return null;
  const k = 7, lookback = 7;
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
  const taiCount = neighbors.filter(n => n.next === 'Tài').length;
  const pred = taiCount > k/2 ? 'Tài' : 'Xỉu';
  let conf = 55 + (k - distances[0].diff) * 2.5;
  return { pred, conf: Math.min(82, conf) };
}

// 17. Decision Tree
function decisionTreeCoBan(lichSu) {
  if (lichSu.length < 10) return null;
  const last1 = lichSu[0], last2 = lichSu[1], last3 = lichSu[2];
  const t5 = lichSu.slice(0, 5).filter(r => r === 'Tài').length;
  if (last1 === 'Tài' && last2 === 'Tài' && last3 === 'Tài') return { pred: 'Xỉu', conf: 78 };
  if (last1 === 'Xỉu' && last2 === 'Xỉu' && last3 === 'Xỉu') return { pred: 'Tài', conf: 78 };
  if (last1 === 'Tài' && last2 === 'Xỉu' && last3 === 'Tài') return { pred: 'Xỉu', conf: 72 };
  if (last1 === 'Xỉu' && last2 === 'Tài' && last3 === 'Xỉu') return { pred: 'Tài', conf: 72 };
  if (t5 >= 4) return { pred: 'Xỉu', conf: 70 };
  if (t5 <= 1) return { pred: 'Tài', conf: 70 };
  return null;
}

function decisionTreeNangCao(lichSu) {
  if (lichSu.length < 15) return null;
  const last1 = lichSu[0], last2 = lichSu[1], last3 = lichSu[2], last4 = lichSu[3];
  const t8 = lichSu.slice(0, 8).filter(r => r === 'Tài').length;
  const streak = lichSu[0] === lichSu[1] && lichSu[1] === lichSu[2] ? 3 : 0;
  if (last1 === 'Tài' && last2 === 'Tài' && last3 === 'Tài' && last4 === 'Xỉu') return { pred: 'Xỉu', conf: 80 };
  if (last1 === 'Xỉu' && last2 === 'Xỉu' && last3 === 'Xỉu' && last4 === 'Tài') return { pred: 'Tài', conf: 80 };
  if (t8 >= 6) return { pred: 'Xỉu', conf: 74 };
  if (t8 <= 2) return { pred: 'Tài', conf: 74 };
  if (streak === 3) return { pred: last1 === 'Tài' ? 'Xỉu' : 'Tài', conf: 76 };
  return null;
}

// 18. Ensemble Voting
function ensembleVoting(lichSu) {
  const methods = [markovChainBac2, bayesProbability3, streakAnalysisCoBan, binomialDistribution10, monteCarlo5, kalmanFilterCoBan, logisticRegression10, rsi14, macd6_13_4, bollinger20_2, stochastic14, williams14, cci10, entropy20, linearRegression10, knn5, decisionTreeCoBan];
  let votesTai = 0, votesXiu = 0;
  let soPP = 0;
  for (let method of methods) {
    const result = method(lichSu);
    if (result) {
      soPP++;
      if (result.pred === 'Tài') votesTai++;
      else votesXiu++;
    }
  }
  if (soPP < 5) return null;
  const pred = votesTai > votesXiu ? 'Tài' : 'Xỉu';
  let conf = 50 + (Math.max(votesTai, votesXiu) / soPP) * 40;
  return { pred, conf: Math.round(conf), soPP };
}

// 19. Tổng hợp đa luồng (chạy tất cả thuật toán đồng thời)
async function multiThreadPrediction(lichSu, tongData, diceData) {
  const algorithms = [
    markovChainBac1, markovChainBac2, markovChainBac3, markovChainBac4, markovChainBac5,
    bayesProbability3, bayesProbability4, bayesProbability5,
    streakAnalysisCoBan, streakAnalysisNangCao, streakAnalysisTheoDoi,
    binomialDistribution5, binomialDistribution10, binomialDistribution20, binomialDistribution30,
    monteCarlo3, monteCarlo5, monteCarlo7,
    kalmanFilterCoBan, kalmanFilterNangCao,
    logisticRegression5, logisticRegression10, logisticRegression15,
    rsi7, rsi14, rsi21,
    macd6_13_4, macd12_26_9,
    bollinger14_2, bollinger20_2,
    stochastic7, stochastic14,
    williams7, williams14,
    cci10, cci14,
    entropy10, entropy20, entropy30,
    linearRegression5, linearRegression10,
    knn5, knn7,
    decisionTreeCoBan, decisionTreeNangCao
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
  
  if (soTT === 0) {
    const ensemble = ensembleVoting(lichSu);
    if (ensemble) return { pred: ensemble.pred, conf: ensemble.conf, soTT: ensemble.soPP };
    return null;
  }
  
  const pred = diemTai > diemXiu ? 'Tài' : 'Xỉu';
  let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
  conf = Math.min(94, Math.max(55, conf));
  return { pred, conf: Math.round(conf), soTT };
}

// ==========================================
// THUẬT TOÁN BCR (BACCARAT)
// ==========================================
class BCRAlgorithm {
  constructor(name) { this.name = name; }
  
  p1_PhanTichTiLe(bcrData) {
    if (!bcrData || !bcrData.stats_55) return null;
    const stats = bcrData.stats_55;
    const banker = stats.banker || 0;
    const player = stats.player || 0;
    const total = banker + player;
    if (total < 5) return null;
    const tyLeBanker = banker / total;
    const tyLePlayer = player / total;
    if (tyLeBanker > 0.65) return { pred: "Con", conf: 80 };
    if (tyLePlayer > 0.65) return { pred: "Cái", conf: 80 };
    if (tyLeBanker > 0.6) return { pred: "Con", conf: 75 };
    if (tyLePlayer > 0.6) return { pred: "Cái", conf: 75 };
    if (tyLeBanker > 0.55) return { pred: "Con", conf: 68 };
    if (tyLePlayer > 0.55) return { pred: "Cái", conf: 68 };
    return null;
  }
  
  p2_PhanTichChuoi(bcrData) {
    const last5 = bcrData?.last_5 || [];
    if (last5.length < 3) return null;
    let streak = 1;
    for (let i = last5.length - 2; i >= 0; i--) {
      if (last5[i].winner === last5[last5.length-1].winner) streak++;
      else break;
    }
    const lastWinner = last5[last5.length-1].winner;
    if (streak >= 4) return { pred: lastWinner === 'Banker' ? 'Con' : 'Cái', conf: 82 };
    if (streak >= 3) return { pred: lastWinner === 'Banker' ? 'Con' : 'Cái', conf: 75 };
    return null;
  }
  
  p3_PhanTichChenhLech(bcrData) {
    if (!bcrData || !bcrData.bet_info) return null;
    const bankerInfo = bcrData.bet_info.find(b => b.type === 'Banker');
    const playerInfo = bcrData.bet_info.find(b => b.type === 'Player');
    if (!bankerInfo || !playerInfo) return null;
    const chenhLech = Math.abs(bankerInfo.amount - playerInfo.amount);
    if (chenhLech > 2000) {
      if (bankerInfo.amount > playerInfo.amount) return { pred: "Con", conf: 72 };
      return { pred: "Cái", conf: 72 };
    }
    return null;
  }
  
  p4_PhanTichSoLuong(bcrData) {
    if (!bcrData || !bcrData.bet_info) return null;
    const bankerInfo = bcrData.bet_info.find(b => b.type === 'Banker');
    const playerInfo = bcrData.bet_info.find(b => b.type === 'Player');
    if (!bankerInfo || !playerInfo) return null;
    const chenhLechCount = Math.abs(bankerInfo.count - playerInfo.count);
    if (chenhLechCount > 50) {
      if (bankerInfo.count > playerInfo.count) return { pred: "Con", conf: 70 };
      return { pred: "Cái", conf: 70 };
    }
    return null;
  }
  
  predict(bcrData) {
    if (!bcrData) return { du_doan: "Cái", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemCai = 0, diemCon = 0, soTT = 0;
    
    const p1 = this.p1_PhanTichTiLe(bcrData);
    if (p1) { soTT++; if (p1.pred === "Cái") diemCai += p1.conf; else diemCon += p1.conf; }
    
    const p2 = this.p2_PhanTichChuoi(bcrData);
    if (p2) { soTT++; if (p2.pred === "Cái") diemCai += p2.conf; else diemCon += p2.conf; }
    
    const p3 = this.p3_PhanTichChenhLech(bcrData);
    if (p3) { soTT++; if (p3.pred === "Cái") diemCai += p3.conf; else diemCon += p3.conf; }
    
    const p4 = this.p4_PhanTichSoLuong(bcrData);
    if (p4) { soTT++; if (p4.pred === "Cái") diemCai += p4.conf; else diemCon += p4.conf; }
    
    if (soTT === 0) {
      const stats = bcrData.stats_55;
      if (stats) {
        const banker = stats.banker || 0;
        const player = stats.player || 0;
        if (banker + player > 0) {
          return { du_doan: banker > player ? "Cái" : "Con", do_tin_cay: 60, giai_thich: "Theo xu hướng (55 phiên)" };
        }
      }
      return { du_doan: "Cái", do_tin_cay: 55, giai_thich: "Mặc định Cái" };
    }
    
    const pred = diemCai > diemCon ? "Cái" : "Con";
    let conf = Math.abs(diemCai - diemCon) / (diemCai + diemCon) * 100;
    conf = Math.min(88, Math.max(55, Math.round(conf)));
    return { du_doan: pred, do_tin_cay: conf, giai_thich: `${soTT} phương pháp phân tích BCR` };
  }
}

// ==========================================
// THUẬT TOÁN SUN PHỤNG
// ==========================================
class SunPhungAlgorithm {
  constructor() { this.name = "SUNPHUNG"; }
  
  p1_PhanTichHeSo(heSo) {
    if (!heSo) return null;
    if (heSo >= 4.5) return { pred: "Xỉu", conf: 75 };
    if (heSo <= 3.5) return { pred: "Tài", conf: 75 };
    return null;
  }
  
  p2_PhanTichXuHuong(lichSu) {
    if (lichSu.length < 5) return null;
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    if (tai5 >= 4) return { pred: "Xỉu", conf: 72 };
    if (tai5 <= 1) return { pred: "Tài", conf: 72 };
    return { pred: tai5 >= 3 ? "Tài" : "Xỉu", conf: 62 };
  }
  
  p3_PhanTichStreak(lichSu) {
    if (lichSu.length < 3) return null;
    let streak = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[i-1]) streak++;
      else break;
    }
    if (streak >= 3) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 70 };
    return null;
  }
  
  predict(lichSu, heSo) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let diemTai = 0, diemXiu = 0, soTT = 0;
    
    const p1 = this.p1_PhanTichHeSo(heSo);
    if (p1) { soTT++; if (p1.pred === "Tài") diemTai += p1.conf; else diemXiu += p1.conf; }
    
    const p2 = this.p2_PhanTichXuHuong(lichSu);
    if (p2) { soTT++; if (p2.pred === "Tài") diemTai += p2.conf; else diemXiu += p2.conf; }
    
    const p3 = this.p3_PhanTichStreak(lichSu);
    if (p3) { soTT++; if (p3.pred === "Tài") diemTai += p3.conf; else diemXiu += p3.conf; }
    
    const last3 = lichSu.slice(0, 3);
    const tai3 = last3.filter(r => r === "Tài").length;
    const fallback = tai3 >= 2 ? "Tài" : "Xỉu";
    
    if (soTT === 0) return { du_doan: fallback, do_tin_cay: 60, giai_thich: "Xu hướng 3 phiên" };
    
    const pred = diemTai > diemXiu ? "Tài" : "Xỉu";
    let conf = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
    conf = Math.min(88, Math.max(55, Math.round(conf)));
    return { du_doan: pred, do_tin_cay: conf, giai_thich: `${soTT} phương pháp Sun Phụng` };
  }
}

// ==========================================
// THUẬT TOÁN TÀI XỈU TỔNG HỢP
// ==========================================
class TaiXiuAlgorithm {
  constructor(name) { this.name = name; }
  
  async predict(lichSu, tongData) {
    if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    const result = await multiThreadPrediction(lichSu, tongData);
    if (result) return { du_doan: result.pred, do_tin_cay: result.conf, giai_thich: `${result.soTT} thuật toán đa luồng` };
    
    const last3 = lichSu.slice(0, 3);
    const tai3 = last3.filter(r => r === "Tài").length;
    const fallback = tai3 >= 2 ? "Tài" : "Xỉu";
    const conf = 55 + Math.abs(tai3 - 1.5) * 10;
    return { du_doan: fallback, do_tin_cay: Math.round(conf), giai_thich: "Xu hướng 3 phiên" };
  }
}

// ==========================================
// KHỞI TẠO ALGORITHM RIÊNG CHO TỪNG GAME
// ==========================================
const algorithms = {};

// Tài Xỉu thông thường
const txGames = ['sunwin_tx', 'hitclub_tx', 'lc79_tx', 'betvip_tx', 'club789_tx', 'son789_tx', 'max789_txmd5', 'luck8_txmd5', 'sumvin_txmd5', 'ogk_txmd5', 'gb68_thuong', 'gb68_txmd5', 'hitclub_txmd5', 'lc79_txmd5', 'betvip_txmd5', 'b52_txmd5'];
for (let game of txGames) {
  algorithms[game] = new TaiXiuAlgorithm(game.toUpperCase());
}

// Sicbo
const sicboGames = ['sunwin_sicbo', 'hitclub_sicbo', 'club789_sicbo', 'b52_sicbo', 'luck8_sicbo40'];
for (let game of sicboGames) {
  algorithms[game] = new TaiXiuAlgorithm(game.toUpperCase());
}

// Xóc đĩa
algorithms['sunwin_xocdia_live'] = new TaiXiuAlgorithm('XOCDIA_LIVE');
algorithms['lc79_xocdia'] = new TaiXiuAlgorithm('XOCDIA');

// Sun Phụng
algorithms['sunwin_sunphung'] = new SunPhungAlgorithm();

// BCR
for (let key in GAME_APIS) {
  if (key.startsWith('bcr_')) {
    algorithms[key] = new BCRAlgorithm(key.toUpperCase());
  }
}

// ==========================================
// XỬ LÝ REQUEST
// ==========================================
async function xuLyGame(gameKey) {
  const url = GAME_APIS[gameKey];
  let data = await fetchGameData(url, gameKey);
  if (!data) throw new Error(`Không lấy được dữ liệu ${gameKey}`);
  if (data.ket_qua === "Bão") throw new Error(`Game ${gameKey} ra Bão`);
  
  const hist = historyDB[gameKey];
  const lastPred = cacheDB[gameKey].get(data.phien - 1);
  const isBCR = gameKey.startsWith('bcr_');
  const isSunPhung = gameKey === 'sunwin_sunphung';
  
  if (lastPred && lastPred.prediction !== undefined) {
    let thucTe = data.ket_qua;
    let duDoanCu = lastPred.prediction;
    let doTinCayCu = lastPred.confidence;
    const dung = updateStats(gameKey, thucTe, duDoanCu, doTinCayCu);
    lastPred.actual = thucTe;
    lastPred.isCorrect = dung;
    hist.lichSuDuDoan.unshift({ phien_du_doan: lastPred.phien_du_doan, du_doan: duDoanCu, do_tin_cay: doTinCayCu, thuc_te: thucTe, ket_qua: dung ? 'ĐÚNG' : 'SAI', thoi_gian: new Date().toISOString() });
    if (hist.lichSuDuDoan.length > 100) hist.lichSuDuDoan.pop();
  }
  
  hist.data.unshift(data.ket_qua);
  while (hist.data.length > 500) hist.data.pop();
  if (data.tong && typeof data.tong === 'number') { hist.tongData.unshift(data.tong); while (hist.tongData.length > 500) hist.tongData.pop(); }
  
  if (cacheDB[gameKey].has(data.phien)) {
    const cached = cacheDB[gameKey].get(data.phien);
    return {
      phien_hien_tai: data.phien,
      ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong },
      duDoan: { phien_du_doan: data.phien + 1, du_doan: cached.prediction, do_tin_cay: cached.confidence + '%', giai_thich: cached.reason },
      thongKe: statsDB[gameKey],
      lichSuDuDoan: hist.lichSuDuDoan.slice(0, 30)
    };
  }
  
  const algo = algorithms[gameKey];
  let prediction;
  if (isBCR) {
    prediction = algo.predict(data.bcr_data);
  } else if (isSunPhung) {
    prediction = algo.predict(hist.data, data.tong);
  } else {
    prediction = await algo.predict(hist.data, hist.tongData);
  }
  
  cacheDB[gameKey].set(data.phien, {
    prediction: prediction.du_doan,
    confidence: prediction.do_tin_cay,
    reason: prediction.giai_thich,
    phien_du_doan: data.phien + 1
  });
  
  if (cacheDB[gameKey].size > 20) {
    const firstKey = cacheDB[gameKey].keys().next().value;
    cacheDB[gameKey].delete(firstKey);
  }
  
  return {
    phien_hien_tai: data.phien,
    ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong },
    duDoan: { phien_du_doan: data.phien + 1, du_doan: prediction.du_doan, do_tin_cay: prediction.do_tin_cay + '%', giai_thich: prediction.giai_thich },
    thongKe: statsDB[gameKey],
    lichSuDuDoan: hist.lichSuDuDoan.slice(0, 30)
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
      res.json({ game: gameKey.toUpperCase(), ...result, author: '@tranhoang2286', version: 'ULTIMATE' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

app.get('/bcr/all', async (req, res) => {
  const results = {};
  for (let key in GAME_APIS) {
    if (key.startsWith('bcr_')) {
      try {
        const result = await xuLyGame(key);
        results[key.replace('bcr_', '')] = result;
      } catch (e) { results[key.replace('bcr_', '')] = { error: e.message }; }
    }
  }
  res.json({ game: 'BCR', all_bans: results, author: '@tranhoang2286' });
});

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
    name: '🏆 30+ GAME - 50+ THUẬT TOÁN ĐA LUỒNG 🏆',
    author: '@tranhoang2286',
    version: '35.0 - ULTIMATE',
    endpoints: Object.keys(GAME_APIS).map(k => `/${k.replace(/_/g, '/')}`),
    thong_tin: {
      tong_so_game: Object.keys(GAME_APIS).length,
      tong_so_thuat_toan: '50+',
      so_luong_phuong_phap: 'Markov(5), Bayes(3), Streak(3), Binomial(4), MonteCarlo(3), Kalman(2), Logistic(3), RSI(3), MACD(2), Bollinger(2), Stochastic(2), Williams(2), CCI(2), Entropy(3), Linear(2), KNN(2), DecisionTree(2), Ensemble(1)'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏆 30+ GAME - 50+ THUẬT TOÁN - PORT ${PORT}`);
  console.log(`✅ Mỗi game có thuật toán riêng biệt`);
  console.log(`✅ 50+ phương pháp phân tích chuyên sâu`);
  console.log(`✅ Chạy đa luồng Promise.all`);
});
