const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// DANH SÁCH API (29 GAME)
// ==========================================
const GAME_APIS = {
  'sunwin_tx': 'https://era-technology-particular-domestic.trycloudflare.com/api/tx',
  'sunwin_sicbo': 'https://enquiries-indices-navigator-mega.trycloudflare.com/api/sunsicbo',
  'sunwin_sunphung': 'https://ntsc-fly-questionnaire-divx.trycloudflare.com/api/sunphung',
  'sunwin_xocdia_live': 'https://suggested-knew-ban-furniture.trycloudflare.com/api/xdlive',
  'hitclub_tx': 'https://preference-assuming-picnic-concentration.trycloudflare.com/api/tx',
  'hitclub_txmd5': 'https://preference-assuming-picnic-concentration.trycloudflare.com/api/txmd5',
  'hitclub_sicbo': 'https://implement-university-orders-consciousness.trycloudflare.com/sicbo/hitclub',
  'lc79_tx': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/tx',
  'lc79_txmd5': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/txmd5',
  'lc79_xocdia': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/xocdia',
  'betvip_tx': 'https://eve-hydrocodone-offshore-eagle.trycloudflare.com/api/tx',
  'betvip_txmd5': 'https://eve-hydrocodone-offshore-eagle.trycloudflare.com/api/txmd5',
  'club789_tx': 'https://venue-integrate-aged-heavily.trycloudflare.com/api/tx',
  'club789_sicbo': 'https://implement-university-orders-consciousness.trycloudflare.com/sicbo/789club',
  'b52_txmd5': 'https://flex-knights-agree-grass.trycloudflare.com/txmd5',
  'b52_sicbo': 'https://implement-university-orders-consciousness.trycloudflare.com/sicbo/b52',
  'max789_txmd5': 'https://deutschland-mandatory-upon-changelog.trycloudflare.com/api/tx',
  'son789_tx': 'https://with-boating-signed-turn.trycloudflare.com/api/tx',
  'luck8_txmd5': 'https://qld-incentives-tion-boost.trycloudflare.com/api/txmd5',
  'luck8_sicbo40': 'https://qld-incentives-tion-boost.trycloudflare.com/api/sicbo40',
  'sumvin_txmd5': 'https://cricket-compressed-list-suppose.trycloudflare.com/api/md5',
  'gb68_thuong': 'https://description-zen-dog-films.trycloudflare.com/api/68/thuong',
  'gb68_txmd5': 'https://profiles-televisions-sic-stay.trycloudflare.com/api/68/md5',
  'ogk_txmd5': 'https://liver-specs-processors-css.trycloudflare.com/api/txmd5/latest',
  'bcr_v1': 'https://employers-hormone-land-idaho.trycloudflare.com/api/bcr',
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
// LƯU TRỮ CHO TỪNG GAME
// ==========================================
const gameData = {};
const cacheDB = {};
const statsDB = {};
const cauHocDB = {};
const metaDB = {};
const learningDB = {};

for (let key in GAME_APIS) {
  gameData[key] = { data: [], tongData: [], diceData: [], lichSuDuDoan: [] };
  cacheDB[key] = new Map();
  statsDB[key] = { tong: 0, dung: 0, sai: 0, tiLe: '0%', tiLe10: '0%', tiLe30: '0%', meta_do_tin_cay: 0, meta_accuracy: 0 };
  cauHocDB[key] = {
    cau_bet: { so_lan: 0, do_dai_tb: 0, ty_le_dung: 0, do_tin_cay: 0, lan_cuoi: 0 },
    cau_1_1: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0, lan_cuoi: 0 },
    cau_2_1: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0, lan_cuoi: 0 },
    cau_3_2: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0, lan_cuoi: 0 },
    cau_doi_xung: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0, lan_cuoi: 0 },
    pattern_lap: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0, lan_cuoi: 0 },
    cau_dang_chay: null,
    tong_cao: { so_lan: 0, ty_le_dung: 0 },
    tong_thap: { so_lan: 0, ty_le_dung: 0 }
  };
  metaDB[key] = {
    lich_su_meta: [],
    do_chinh_xac_meta: 0,
    trong_so: 0.65,
    so_lan_phat_hien_cau: 0,
    ty_le_cau_dung: 0,
    last_calibration: Date.now()
  };
  learningDB[key] = {
    trong_so_thuat_toan: {},
    tan_suat_dung: {},
    last_update: Date.now()
  };
}

// ==========================================
// CẬP NHẬT THỐNG KÊ
// ==========================================
function updateStats(game, thucTe, duDoan, doTinCayMeta, loaiCau) {
  const st = statsDB[game];
  if (!st || !thucTe || !duDoan) return false;
  const dung = (thucTe === duDoan);
  if (dung) st.dung++;
  else st.sai++;
  st.tong++;
  st.tiLe = ((st.dung / st.tong) * 100).toFixed(1) + '%';
  
  const ganDay = gameData[game].lichSuDuDoan.slice(0, 10);
  if (ganDay.length >= 10) {
    const dung10 = ganDay.filter(d => d.ket_qua === 'ĐÚNG').length;
    st.tiLe10 = ((dung10 / 10) * 100).toFixed(1) + '%';
  }
  if (gameData[game].lichSuDuDoan.length >= 30) {
    const dung30 = gameData[game].lichSuDuDoan.slice(0, 30).filter(d => d.ket_qua === 'ĐÚNG').length;
    st.tiLe30 = ((dung30 / 30) * 100).toFixed(1) + '%';
  }
  
  // Cập nhật meta accuracy
  metaDB[game].lich_su_meta.push({ dung, doTinCayMeta, loaiCau, thoi_gian: Date.now() });
  if (metaDB[game].lich_su_meta.length > 100) metaDB[game].lich_su_meta.shift();
  const dungCount = metaDB[game].lich_su_meta.filter(m => m.dung).length;
  metaDB[game].do_chinh_xac_meta = (dungCount / metaDB[game].lich_su_meta.length) * 100;
  
  // Cập nhật trọng số thuật toán
  if (loaiCau) {
    if (!learningDB[game].tan_suat_dung[loaiCau]) learningDB[game].tan_suat_dung[loaiCau] = { dung: 0, sai: 0 };
    if (dung) learningDB[game].tan_suat_dung[loaiCau].dung++;
    else learningDB[game].tan_suat_dung[loaiCau].sai++;
    const tongCau = learningDB[game].tan_suat_dung[loaiCau].dung + learningDB[game].tan_suat_dung[loaiCau].sai;
    const tyLe = tongCau > 0 ? (learningDB[game].tan_suat_dung[loaiCau].dung / tongCau) * 100 : 50;
    learningDB[game].trong_so_thuat_toan[loaiCau] = Math.min(2.0, Math.max(0.5, tyLe / 50));
  }
  
  return dung;
}

// ==========================================
// LẤY DỮ LIỆU
// ==========================================
async function fetchGameData(url, gameKey) {
  try {
    const headers = {};
    if (gameKey.includes('bcr_') || gameKey === 'club789_sicbo') {
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      headers['Referer'] = 'https://implement-university-orders-consciousness.trycloudflare.com/';
    }
    const res = await axios.get(url, { timeout: 15000, headers });
    const data = res.data;
    if (!data) return null;
    
    if (gameKey === 'sunwin_sunphung') {
      if (data.success && data.data) {
        let ketQua = data.data.he_so >= 4 ? 'Tài' : 'Xỉu';
        return { phien: data.data.phien, ket_qua: ketQua, dice: [], tong: data.data.he_so };
      }
      return null;
    }
    
    if (gameKey === 'sunwin_xocdia_live' || gameKey === 'lc79_xocdia') {
      if (data.ket_qua_truyen_thong) {
        return { phien: data.phien, ket_qua: data.ket_qua_truyen_thong, dice: [], tong: null };
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
    
    if (gameKey.startsWith('bcr_')) {
      if (data.last_5 && data.last_5.length > 0) {
        const lastResult = data.last_5[data.last_5.length - 1];
        let ketQua = lastResult.winner === 'Banker' ? 'Cái' : (lastResult.winner === 'Player' ? 'Con' : 'Hòa');
        let phien = data.phien || Date.now();
        return { phien, ket_qua: ketQua, dice: [], tong: null, bcr_data: data };
      }
      return null;
    }
    
    if (!data.ket_qua) return null;
    let ketQua = data.ket_qua;
    if (ketQua === 'tài' || ketQua === 'TAI' || ketQua === 'Tài' || ketQua === 'TÀI') ketQua = 'Tài';
    else if (ketQua === 'xiu' || ketQua === 'XIU' || ketQua === 'Xỉu' || ketQua === 'XỈU') ketQua = 'Xỉu';
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
    return null;
  }
}

// ==========================================
// ========== 20 THUẬT TOÁN DỰ ĐOÁN (KHÔNG RANDOM) ==========
// ==========================================

function thuatToan_Bet(lichSu) {
  if (lichSu.length < 3) return { duDoan: null, doTinCay: 0, loai: 'BET' };
  let streak = 1;
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[0]) streak++;
    else break;
  }
  if (streak >= 7) return { duDoan: lichSu[0] === "Tài" ? "Xỉu" : "Tài", doTinCay: 98, loai: 'BET' };
  if (streak === 6) return { duDoan: lichSu[0] === "Tài" ? "Xỉu" : "Tài", doTinCay: 95, loai: 'BET' };
  if (streak === 5) return { duDoan: lichSu[0] === "Tài" ? "Xỉu" : "Tài", doTinCay: 90, loai: 'BET' };
  if (streak === 4) return { duDoan: lichSu[0] === "Tài" ? "Xỉu" : "Tài", doTinCay: 84, loai: 'BET' };
  if (streak === 3) return { duDoan: lichSu[0] === "Tài" ? "Xỉu" : "Tài", doTinCay: 74, loai: 'BET' };
  return { duDoan: null, doTinCay: 0, loai: 'BET' };
}

function thuatToan_TanSuat5(lichSu) {
  if (lichSu.length < 5) return { duDoan: null, doTinCay: 0, loai: 'TS5' };
  const last5 = lichSu.slice(0, 5);
  const tai5 = last5.filter(r => r === "Tài").length;
  if (tai5 >= 4) return { duDoan: "Xỉu", doTinCay: 78, loai: 'TS5' };
  if (tai5 <= 1) return { duDoan: "Tài", doTinCay: 78, loai: 'TS5' };
  if (tai5 === 3) return { duDoan: "Xỉu", doTinCay: 68, loai: 'TS5' };
  if (tai5 === 2) return { duDoan: "Tài", doTinCay: 68, loai: 'TS5' };
  return { duDoan: null, doTinCay: 0, loai: 'TS5' };
}

function thuatToan_TanSuat10(lichSu) {
  if (lichSu.length < 10) return { duDoan: null, doTinCay: 0, loai: 'TS10' };
  const last10 = lichSu.slice(0, 10);
  const tai10 = last10.filter(r => r === "Tài").length;
  if (tai10 >= 9) return { duDoan: "Xỉu", doTinCay: 92, loai: 'TS10' };
  if (tai10 <= 1) return { duDoan: "Tài", doTinCay: 92, loai: 'TS10' };
  if (tai10 >= 8) return { duDoan: "Xỉu", doTinCay: 88, loai: 'TS10' };
  if (tai10 <= 2) return { duDoan: "Tài", doTinCay: 88, loai: 'TS10' };
  if (tai10 >= 7) return { duDoan: "Xỉu", doTinCay: 82, loai: 'TS10' };
  if (tai10 <= 3) return { duDoan: "Tài", doTinCay: 82, loai: 'TS10' };
  if (tai10 >= 6) return { duDoan: "Xỉu", doTinCay: 74, loai: 'TS10' };
  if (tai10 <= 4) return { duDoan: "Tài", doTinCay: 74, loai: 'TS10' };
  return { duDoan: null, doTinCay: 0, loai: 'TS10' };
}

function thuatToan_TanSuat20(lichSu) {
  if (lichSu.length < 20) return { duDoan: null, doTinCay: 0, loai: 'TS20' };
  const last20 = lichSu.slice(0, 20);
  const tai20 = last20.filter(r => r === "Tài").length;
  if (tai20 >= 15) return { duDoan: "Xỉu", doTinCay: 85, loai: 'TS20' };
  if (tai20 <= 5) return { duDoan: "Tài", doTinCay: 85, loai: 'TS20' };
  if (tai20 >= 14) return { duDoan: "Xỉu", doTinCay: 80, loai: 'TS20' };
  if (tai20 <= 6) return { duDoan: "Tài", doTinCay: 80, loai: 'TS20' };
  if (tai20 >= 13) return { duDoan: "Xỉu", doTinCay: 75, loai: 'TS20' };
  if (tai20 <= 7) return { duDoan: "Tài", doTinCay: 75, loai: 'TS20' };
  return { duDoan: null, doTinCay: 0, loai: 'TS20' };
}

function thuatToan_Cau1_1(lichSu) {
  if (lichSu.length < 5) return { duDoan: null, doTinCay: 0, loai: 'C11' };
  let zigzag = 0;
  for (let i = 1; i < 5; i++) {
    if (lichSu[i] !== lichSu[i-1]) zigzag++;
  }
  if (zigzag >= 4) return { duDoan: lichSu[0] === "Tài" ? "Xỉu" : "Tài", doTinCay: 86, loai: 'C11' };
  if (zigzag >= 3) return { duDoan: lichSu[0] === "Tài" ? "Xỉu" : "Tài", doTinCay: 78, loai: 'C11' };
  return { duDoan: null, doTinCay: 0, loai: 'C11' };
}

function thuatToan_Cau2_1(lichSu) {
  if (lichSu.length < 6) return { duDoan: null, doTinCay: 0, loai: 'C21' };
  if (lichSu[0] === lichSu[1] && lichSu[3] === lichSu[4] && lichSu[0] !== lichSu[3]) {
    return { duDoan: lichSu[0] === "Tài" ? "Tài" : "Xỉu", doTinCay: 82, loai: 'C21' };
  }
  return { duDoan: null, doTinCay: 0, loai: 'C21' };
}

function thuatToan_Cau3_2(lichSu) {
  if (lichSu.length < 10) return { duDoan: null, doTinCay: 0, loai: 'C32' };
  const p = lichSu.slice(0, 5).join('');
  if (p === "TàiTàiTàiXỉuXỉu") return { duDoan: "Xỉu", doTinCay: 86, loai: 'C32' };
  if (p === "XỉuXỉuXỉuTàiTài") return { duDoan: "Tài", doTinCay: 86, loai: 'C32' };
  if (p === "TàiTàiXỉuXỉuTài") return { duDoan: "Xỉu", doTinCay: 78, loai: 'C32' };
  if (p === "XỉuXỉuTàiTàiXỉu") return { duDoan: "Tài", doTinCay: 78, loai: 'C32' };
  return { duDoan: null, doTinCay: 0, loai: 'C32' };
}

function thuatToan_TongDiemTB(tongData) {
  if (!tongData || tongData.length < 10) return { duDoan: null, doTinCay: 0, loai: 'TDTB' };
  const avg = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
  if (avg > 13) return { duDoan: "Xỉu", doTinCay: 82, loai: 'TDTB' };
  if (avg < 8) return { duDoan: "Tài", doTinCay: 82, loai: 'TDTB' };
  if (avg > 12.5) return { duDoan: "Xỉu", doTinCay: 78, loai: 'TDTB' };
  if (avg < 8.5) return { duDoan: "Tài", doTinCay: 78, loai: 'TDTB' };
  if (avg > 11.5) return { duDoan: "Xỉu", doTinCay: 72, loai: 'TDTB' };
  if (avg < 9.5) return { duDoan: "Tài", doTinCay: 72, loai: 'TDTB' };
  return { duDoan: null, doTinCay: 0, loai: 'TDTB' };
}

function thuatToan_RSI(lichSu) {
  if (lichSu.length < 14) return { duDoan: null, doTinCay: 0, loai: 'RSI' };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  let gains = 0, losses = 0;
  for (let i = 1; i < nums.length; i++) {
    const diff = nums[i] - nums[i-1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / 14, avgLoss = losses / 14;
  const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  if (rsi >= 85) return { duDoan: "Xỉu", doTinCay: 90, loai: 'RSI' };
  if (rsi <= 15) return { duDoan: "Tài", doTinCay: 90, loai: 'RSI' };
  if (rsi >= 75) return { duDoan: "Xỉu", doTinCay: 84, loai: 'RSI' };
  if (rsi <= 25) return { duDoan: "Tài", doTinCay: 84, loai: 'RSI' };
  return { duDoan: null, doTinCay: 0, loai: 'RSI' };
}

function thuatToan_MACD(lichSu) {
  if (lichSu.length < 26) return { duDoan: null, doTinCay: 0, loai: 'MACD' };
  const nums = lichSu.map(r => r === "Tài" ? 1 : 0);
  const ema12 = nums.slice(-12).reduce((a, b) => a + b, 0) / 12;
  const ema26 = nums.slice(-26).reduce((a, b) => a + b, 0) / 26;
  const macd = ema12 - ema26;
  const signal = macd * 0.8;
  if (macd > signal + 0.08) return { duDoan: "Xỉu", doTinCay: 78, loai: 'MACD' };
  if (macd < signal - 0.08) return { duDoan: "Tài", doTinCay: 78, loai: 'MACD' };
  return { duDoan: null, doTinCay: 0, loai: 'MACD' };
}

function thuatToan_Bollinger(lichSu) {
  if (lichSu.length < 20) return { duDoan: null, doTinCay: 0, loai: 'BB' };
  const nums = lichSu.slice(0, 20).map(r => r === "Tài" ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 20;
  const variance = nums.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / 20;
  const std = Math.sqrt(variance);
  const upper = mean + 2 * std;
  const lower = mean - 2 * std;
  const last = nums[19];
  if (last > upper) return { duDoan: "Xỉu", doTinCay: 80, loai: 'BB' };
  if (last < lower) return { duDoan: "Tài", doTinCay: 80, loai: 'BB' };
  return { duDoan: null, doTinCay: 0, loai: 'BB' };
}

function thuatToan_Stochastic(lichSu) {
  if (lichSu.length < 14) return { duDoan: null, doTinCay: 0, loai: 'STO' };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return { duDoan: null, doTinCay: 0, loai: 'STO' };
  const k = (nums[13] - lowest) / (highest - lowest) * 100;
  if (k > 90) return { duDoan: "Xỉu", doTinCay: 82, loai: 'STO' };
  if (k < 10) return { duDoan: "Tài", doTinCay: 82, loai: 'STO' };
  if (k > 80) return { duDoan: "Xỉu", doTinCay: 76, loai: 'STO' };
  if (k < 20) return { duDoan: "Tài", doTinCay: 76, loai: 'STO' };
  return { duDoan: null, doTinCay: 0, loai: 'STO' };
}

function thuatToan_Entropy(lichSu) {
  if (lichSu.length < 20) return { duDoan: null, doTinCay: 0, loai: 'ENT' };
  const tai20 = lichSu.slice(0, 20).filter(r => r === "Tài").length;
  const p = tai20 / 20;
  if (p === 0) return { duDoan: "Tài", doTinCay: 85, loai: 'ENT' };
  if (p === 1) return { duDoan: "Xỉu", doTinCay: 85, loai: 'ENT' };
  const entropy = -p * Math.log2(p) - (1-p) * Math.log2(1-p);
  if (entropy < 0.5) {
    return { duDoan: p > 0.5 ? "Tài" : "Xỉu", doTinCay: 82, loai: 'ENT' };
  }
  if (entropy > 0.95) {
    return { duDoan: p > 0.5 ? "Xỉu" : "Tài", doTinCay: 78, loai: 'ENT' };
  }
  return { duDoan: null, doTinCay: 0, loai: 'ENT' };
}

function thuatToan_KNN(lichSu) {
  if (lichSu.length < 25) return { duDoan: null, doTinCay: 0, loai: 'KNN' };
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
  const taiCount = neighbors.filter(n => n.next === "Tài").length;
  if (taiCount >= 6) return { duDoan: "Tài", doTinCay: 80, loai: 'KNN' };
  if (taiCount <= 1) return { duDoan: "Xỉu", doTinCay: 80, loai: 'KNN' };
  if (taiCount >= 5) return { duDoan: "Tài", doTinCay: 74, loai: 'KNN' };
  if (taiCount <= 2) return { duDoan: "Xỉu", doTinCay: 74, loai: 'KNN' };
  return { duDoan: null, doTinCay: 0, loai: 'KNN' };
}

function thuatToan_DecisionTree(lichSu) {
  if (lichSu.length < 10) return { duDoan: null, doTinCay: 0, loai: 'DT' };
  const last1 = lichSu[0], last2 = lichSu[1], last3 = lichSu[2];
  const t5 = lichSu.slice(0, 5).filter(r => r === "Tài").length;
  if (last1 === "Tài" && last2 === "Tài" && last3 === "Tài") return { duDoan: "Xỉu", doTinCay: 85, loai: 'DT' };
  if (last1 === "Xỉu" && last2 === "Xỉu" && last3 === "Xỉu") return { duDoan: "Tài", doTinCay: 85, loai: 'DT' };
  if (t5 >= 4) return { duDoan: "Xỉu", doTinCay: 76, loai: 'DT' };
  if (t5 <= 1) return { duDoan: "Tài", doTinCay: 76, loai: 'DT' };
  return { duDoan: null, doTinCay: 0, loai: 'DT' };
}

function thuatToan_Momentum(lichSu) {
  if (lichSu.length < 15) return { duDoan: null, doTinCay: 0, loai: 'MOM' };
  const last5 = lichSu.slice(0, 5).filter(r => r === "Tài").length;
  const prev5 = lichSu.slice(5, 10).filter(r => r === "Tài").length;
  const diff = last5 - prev5;
  if (diff >= 4) return { duDoan: "Xỉu", doTinCay: 80, loai: 'MOM' };
  if (diff <= -4) return { duDoan: "Tài", doTinCay: 80, loai: 'MOM' };
  if (diff >= 2) return { duDoan: "Xỉu", doTinCay: 72, loai: 'MOM' };
  if (diff <= -2) return { duDoan: "Tài", doTinCay: 72, loai: 'MOM' };
  return { duDoan: null, doTinCay: 0, loai: 'MOM' };
}

function thuatToan_XuHuongTong(tongData) {
  if (!tongData || tongData.length < 20) return { duDoan: null, doTinCay: 0, loai: 'XHT' };
  const gan = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
  const truoc = tongData.slice(10, 20).reduce((a, b) => a + b, 0) / 10;
  const delta = gan - truoc;
  if (delta > 2.5) return { duDoan: "Xỉu", doTinCay: 78, loai: 'XHT' };
  if (delta < -2.5) return { duDoan: "Tài", doTinCay: 78, loai: 'XHT' };
  if (delta > 1.5) return { duDoan: "Xỉu", doTinCay: 70, loai: 'XHT' };
  if (delta < -1.5) return { duDoan: "Tài", doTinCay: 70, loai: 'XHT' };
  return { duDoan: null, doTinCay: 0, loai: 'XHT' };
}

function thuatToan_BienDoTong(tongData) {
  if (!tongData || tongData.length < 15) return { duDoan: null, doTinCay: 0, loai: 'BDT' };
  const max = Math.max(...tongData.slice(0, 15));
  const min = Math.min(...tongData.slice(0, 15));
  const bienDo = max - min;
  if (bienDo >= 12) {
    if (max > 14) return { duDoan: "Xỉu", doTinCay: 80, loai: 'BDT' };
    else return { duDoan: "Tài", doTinCay: 80, loai: 'BDT' };
  }
  if (bienDo >= 9) {
    if (max > 13) return { duDoan: "Xỉu", doTinCay: 74, loai: 'BDT' };
    else return { duDoan: "Tài", doTinCay: 74, loai: 'BDT' };
  }
  return { duDoan: null, doTinCay: 0, loai: 'BDT' };
}

function thuatToan_WilliamsR(lichSu) {
  if (lichSu.length < 14) return { duDoan: null, doTinCay: 0, loai: 'WR' };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return { duDoan: null, doTinCay: 0, loai: 'WR' };
  const wr = (highest - nums[13]) / (highest - lowest) * -100;
  if (wr < -90) return { duDoan: "Tài", doTinCay: 80, loai: 'WR' };
  if (wr > -10) return { duDoan: "Xỉu", doTinCay: 80, loai: 'WR' };
  if (wr < -80) return { duDoan: "Tài", doTinCay: 74, loai: 'WR' };
  if (wr > -20) return { duDoan: "Xỉu", doTinCay: 74, loai: 'WR' };
  return { duDoan: null, doTinCay: 0, loai: 'WR' };
}

function thuatToan_CCI(lichSu) {
  if (lichSu.length < 14) return { duDoan: null, doTinCay: 0, loai: 'CCI' };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 14;
  const mad = nums.reduce((sum, x) => sum + Math.abs(x - mean), 0) / 14;
  if (mad === 0) return { duDoan: null, doTinCay: 0, loai: 'CCI' };
  const cci = (nums[13] - mean) / (0.015 * mad);
  if (cci > 150) return { duDoan: "Xỉu", doTinCay: 80, loai: 'CCI' };
  if (cci < -150) return { duDoan: "Tài", doTinCay: 80, loai: 'CCI' };
  if (cci > 100) return { duDoan: "Xỉu", doTinCay: 74, loai: 'CCI' };
  if (cci < -100) return { duDoan: "Tài", doTinCay: 74, loai: 'CCI' };
  return { duDoan: null, doTinCay: 0, loai: 'CCI' };
}

function thuatToan_LinearReg(lichSu) {
  if (lichSu.length < 12) return { duDoan: null, doTinCay: 0, loai: 'LR' };
  const y = lichSu.slice(0, 12).map(r => r === "Tài" ? 1 : 0);
  const x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const n = 12;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0);
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const pred = slope * 12 + intercept;
  if (pred > 0.65) return { duDoan: "Tài", doTinCay: 78, loai: 'LR' };
  if (pred < 0.35) return { duDoan: "Xỉu", doTinCay: 78, loai: 'LR' };
  return { duDoan: null, doTinCay: 0, loai: 'LR' };
}

// Danh sách tất cả thuật toán
const THUAT_TOANS = [
  thuatToan_Bet, thuatToan_TanSuat5, thuatToan_TanSuat10, thuatToan_TanSuat20,
  thuatToan_Cau1_1, thuatToan_Cau2_1, thuatToan_Cau3_2, thuatToan_TongDiemTB,
  thuatToan_RSI, thuatToan_MACD, thuatToan_Bollinger, thuatToan_Stochastic,
  thuatToan_Entropy, thuatToan_KNN, thuatToan_DecisionTree, thuatToan_Momentum,
  thuatToan_XuHuongTong, thuatToan_BienDoTong, thuatToan_WilliamsR, thuatToan_CCI,
  thuatToan_LinearReg
];

// ==========================================
// ========== META AI TỐI ƯU (KHÔNG RANDOM) ==========
// ==========================================

function metaAIPrediction(lichSu, tongData, gameKey) {
  if (!lichSu || lichSu.length < 3) return { duDoan: null, doTinCay: 0, metaData: [], ketLuan: "Chưa đủ dữ liệu" };
  
  const trongSoMeta = metaDB[gameKey].trong_so || 0.65;
  let diemTai = 0;
  let diemXiu = 0;
  let tongDoTinCay = 0;
  const tatCaDuDoan = [];
  const metaData = [];
  
  // Chạy tất cả thuật toán và tổng hợp
  for (const thuatToan of THUAT_TOANS) {
    let result;
    if (thuatToan.name.includes('Tong') || thuatToan.name.includes('XHT') || thuatToan.name.includes('BDT')) {
      result = thuatToan(tongData);
    } else {
      result = thuatToan(lichSu);
    }
    
    if (result.duDoan && result.doTinCay > 50) {
      tatCaDuDoan.push(result);
      
      // Điều chỉnh trọng số dựa trên học máy
      const trongSoHoc = learningDB[gameKey].trong_so_thuat_toan[result.loai] || 1.0;
      const diemCong = result.doTinCay * trongSoHoc;
      
      if (result.duDoan === "Tài") {
        diemTai += diemCong;
      } else {
        diemXiu += diemCong;
      }
      tongDoTinCay += result.doTinCay;
      
      metaData.push({
        thuat_toan: result.loai,
        du_doan: result.duDoan,
        do_tin_cay: result.doTinCay,
        trong_so_dieu_chinh: trongSoHoc
      });
    }
  }
  
  // Xác định dự đoán cuối cùng (KHÔNG RANDOM)
  let duDoanCuoi = null;
  let doTinCayCuoi = 0;
  
  if (diemTai > 0 || diemXiu > 0) {
    const chenhLech = Math.abs(diemTai - diemXiu);
    const tongDiem = diemTai + diemXiu;
    
    if (tongDiem > 0) {
      if (diemTai > diemXiu && (chenhLech / tongDiem) > 0.15) {
        duDoanCuoi = "Tài";
        doTinCayCuoi = Math.min(99, (diemTai / tongDiem) * 100);
      } else if (diemXiu > diemTai && (chenhLech / tongDiem) > 0.15) {
        duDoanCuoi = "Xỉu";
        doTinCayCuoi = Math.min(99, (diemXiu / tongDiem) * 100);
      }
    }
  }
  
  // Meta phân tích chéo (tăng độ chính xác)
  if (duDoanCuoi && lichSu.length >= 10) {
    // Kiểm tra xu hướng đảo chiều
    const last3 = lichSu.slice(0, 3);
    const allSame = last3[0] === last3[1] && last3[1] === last3[2];
    const isReverse = duDoanCuoi !== last3[0];
    
    if (allSame && isReverse) {
      // Đang bệt, dự đoán đảo - tăng độ tin cậy nếu bệt dài
      let betLength = 3;
      for (let i = 3; i < lichSu.length; i++) {
        if (lichSu[i] === last3[0]) betLength++;
        else break;
      }
      if (betLength >= 5) {
        doTinCayCuoi = Math.min(99, doTinCayCuoi + 8);
        metaData.push({ thuat_toan: "META_REVERSE", ket_luan: "Bệt dài, đảo chiều hợp lý" });
      }
    }
    
    // Kiểm tra tần suất 10 phiên
    const tai10 = lichSu.slice(0, 10).filter(r => r === "Tài").length;
    if ((duDoanCuoi === "Tài" && tai10 <= 2) || (duDoanCuoi === "Xỉu" && tai10 >= 8)) {
      doTinCayCuoi = Math.min(99, doTinCayCuoi + 5);
      metaData.push({ thuat_toan: "META_FREQ", ket_luan: "Hỗ trợ từ tần suất" });
    } else if ((duDoanCuoi === "Tài" && tai10 >= 8) || (duDoanCuoi === "Xỉu" && tai10 <= 2)) {
      doTinCayCuoi = Math.max(50, doTinCayCuoi - 10);
      metaData.push({ thuat_toan: "META_FREQ", ket_luan: "Cảnh báo ngược tần suất" });
    }
  }
  
  // Áp dụng độ chính xác lịch sử của meta
  const metaAccuracy = metaDB[gameKey].do_chinh_xac_meta;
  if (metaAccuracy > 70 && doTinCayCuoi > 0) {
    doTinCayCuoi = Math.min(99, doTinCayCuoi * (metaAccuracy / 70));
  } else if (metaAccuracy < 50 && metaAccuracy > 0) {
    doTinCayCuoi = doTinCayCuoi * 0.9;
  }
  
  // Cập nhật meta DB
  if (duDoanCuoi && doTinCayCuoi > 55) {
    metaDB[gameKey].so_lan_phat_hien_cau++;
    metaDB[gameKey].ty_le_cau_dung = (metaDB[gameKey].ty_le_cau_dung * (metaDB[gameKey].so_lan_phat_hien_cau - 1) + doTinCayCuoi) / metaDB[gameKey].so_lan_phat_hien_cau;
  }
  
  const ketLuan = duDoanCuoi ? 
    `Meta AI dự đoán ${duDoanCuoi} với độ tin cậy ${doTinCayCuoi.toFixed(1)}%` : 
    "Meta AI chưa đủ cơ sở để đưa ra dự đoán tin cậy";
  
  return { 
    duDoan: duDoanCuoi, 
    doTinCay: Math.round(doTinCayCuoi), 
    metaData, 
    ketLuan,
    diemTai: Math.round(diemTai),
    diemXiu: Math.round(diemXiu)
  };
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Lấy danh sách game
app.get('/api/games', (req, res) => {
  res.json({ games: Object.keys(GAME_APIS), total: Object.keys(GAME_APIS).length });
});

// Lấy dự đoán cho một game
app.get('/api/predict/:game', async (req, res) => {
  const gameKey = req.params.game;
  if (!GAME_APIS[gameKey]) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  try {
    // Fetch dữ liệu mới
    const newData = await fetchGameData(GAME_APIS[gameKey], gameKey);
    if (!newData) {
      return res.status(503).json({ error: 'Cannot fetch game data' });
    }
    
    // Cập nhật lịch sử
    if (!gameData[gameKey].data.length || gameData[gameKey].data[0].phien !== newData.phien) {
      gameData[gameKey].data.unshift(newData);
      if (newData.ket_qua === 'Tài' || newData.ket_qua === 'Xỉu') {
        gameData[gameKey].lichSuDuDoan.unshift({ ket_qua: 'CHỜ', thuc_te: newData.ket_qua, thoi_gian: Date.now() });
      }
      if (newData.tong) gameData[gameKey].tongData.unshift(newData.tong);
      if (newData.dice && newData.dice.length) gameData[gameKey].diceData.unshift(newData.dice);
      
      // Giới hạn dung lượng
      if (gameData[gameKey].data.length > 100) gameData[gameKey].data.pop();
      if (gameData[gameKey].tongData.length > 100) gameData[gameKey].tongData.pop();
      if (gameData[gameKey].diceData.length > 100) gameData[gameKey].diceData.pop();
      if (gameData[gameKey].lichSuDuDoan.length > 100) gameData[gameKey].lichSuDuDoan.pop();
    }
    
    // Lấy lịch sử kết quả
    const lichSu = gameData[gameKey].data.map(d => d.ket_qua).filter(k => k === 'Tài' || k === 'Xỉu');
    const tongData = gameData[gameKey].tongData;
    
    // Meta AI dự đoán (KHÔNG RANDOM)
    const metaResult = metaAIPrediction(lichSu, tongData, gameKey);
    
    // Cập nhật kết quả trước đó nếu có
    if (gameData[gameKey].lichSuDuDoan.length > 0 && gameData[gameKey].lichSuDuDoan[0].ket_qua === 'CHỜ') {
      const lastResult = gameData[gameKey].data[0].ket_qua;
      if (lastResult === 'Tài' || lastResult === 'Xỉu') {
        const lastPrediction = gameData[gameKey].lichSuDuDoan[0];
        const dung = updateStats(gameKey, lastResult, lastPrediction.du_doan, lastPrediction.do_tin_cay, lastPrediction.loai_cau);
        lastPrediction.ket_qua = dung ? 'ĐÚNG' : 'SAI';
        lastPrediction.thuc_te = lastResult;
      }
    }
    
    // Lưu dự đoán mới
    const newPrediction = {
      ket_qua: 'CHỜ',
      du_doan: metaResult.duDoan,
      do_tin_cay: metaResult.do_tin_cay,
      loai_cau: metaResult.metaData.length > 0 ? metaResult.metaData[0].thuat_toan : 'META',
      thoi_gian: Date.now()
    };
    gameData[gameKey].lichSuDuDoan.unshift(newPrediction);
    
    // Cập nhật stats meta
    statsDB[gameKey].meta_do_tin_cay = metaResult.do_tin_cay;
    statsDB[gameKey].meta_accuracy = metaDB[gameKey].do_chinh_xac_meta;
    
    // Trả về kết quả
    res.json({
      game: gameKey,
      api: GAME_APIS[gameKey],
      current_result: gameData[gameKey].data[0],
      prediction: {
        du_doan: metaResult.duDoan,
        do_tin_cay: metaResult.do_tin_cay + '%',
        do_chinh_xac_meta: metaDB[gameKey].do_chinh_xac_meta.toFixed(1) + '%',
        ket_luan: metaResult.ketLuan,
        diem_tai: metaResult.diemTai,
        diem_xiu: metaResult.diemXiu,
        meta_chi_tiet: metaResult.metaData.slice(0, 10)
      },
      stats: statsDB[gameKey],
      lich_su_gan_day: gameData[gameKey].data.slice(0, 10).map(d => d.ket_qua),
      lich_su_du_doan: gameData[gameKey].lichSuDuDoan.slice(0, 10)
    });
    
  } catch (err) {
    console.error(`Error predicting ${gameKey}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Lấy thống kê chi tiết
app.get('/api/stats/:game', (req, res) => {
  const gameKey = req.params.game;
  if (!GAME_APIS[gameKey]) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  res.json({
    game: gameKey,
    stats: statsDB[gameKey],
    meta: metaDB[gameKey],
    learning: learningDB[gameKey],
    cau_hoc: cauHocDB[gameKey],
    tong_phien: gameData[gameKey].data.length,
    du_lieu_moi_nhat: gameData[gameKey].data[0]
  });
});

// Reset dữ liệu một game
app.post('/api/reset/:game', (req, res) => {
  const gameKey = req.params.game;
  if (!GAME_APIS[gameKey]) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  gameData[gameKey] = { data: [], tongData: [], diceData: [], lichSuDuDoan: [] };
  cacheDB[gameKey] = new Map();
  statsDB[gameKey] = { tong: 0, dung: 0, sai: 0, tiLe: '0%', tiLe10: '0%', tiLe30: '0%', meta_do_tin_cay: 0, meta_accuracy: 0 };
  cauHocDB[gameKey] = {
    cau_bet: { so_lan: 0, do_dai_tb: 0, ty_le_dung: 0, do_tin_cay: 0, lan_cuoi: 0 },
    cau_1_1: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0, lan_cuoi: 0 },
    cau_2_1: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0, lan_cuoi: 0 },
    cau_3_2: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0, lan_cuoi: 0 },
    cau_doi_xung: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0, lan_cuoi: 0 },
    pattern_lap: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0, lan_cuoi: 0 },
    cau_dang_chay: null,
    tong_cao: { so_lan: 0, ty_le_dung: 0 },
    tong_thap: { so_lan: 0, ty_le_dung: 0 }
  };
  
  res.json({ success: true, message: `Reset ${gameKey} thành công` });
});

// Health check
app.get('/health', (req, res) => {
  const totalGames = Object.keys(GAME_APIS).length;
  const activeGames = Object.keys(gameData).filter(g => gameData[g].data.length > 0).length;
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    total_games: totalGames,
    active_games: activeGames,
    meta_version: '2.0 - NO RANDOM'
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Meta AI Server running on port ${PORT}`);
  console.log(`📊 Total games: ${Object.keys(GAME_APIS).length}`);
  console.log(`🤖 AI Mode: DETERMINISTIC (NO RANDOM)`);
  console.log(`✅ Meta AI v2.0 ready - 20 algorithms + Meta analysis`);
});
