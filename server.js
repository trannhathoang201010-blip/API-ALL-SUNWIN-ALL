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
  // SUNWIN (4)
  'sunwin_tx': 'https://era-technology-particular-domestic.trycloudflare.com/api/tx',
  'sunwin_sicbo': 'https://enquiries-indices-navigator-mega.trycloudflare.com/api/sunsicbo',
  'sunwin_sunphung': 'https://ntsc-fly-questionnaire-divx.trycloudflare.com/api/sunphung',
  'sunwin_xocdia_live': 'https://suggested-knew-ban-furniture.trycloudflare.com/api/xdlive',
  
  // HITCLUB (3)
  'hitclub_tx': 'https://preference-assuming-picnic-concentration.trycloudflare.com/api/tx',
  'hitclub_txmd5': 'https://preference-assuming-picnic-concentration.trycloudflare.com/api/txmd5',
  'hitclub_sicbo': 'https://implement-university-orders-consciousness.trycloudflare.com/sicbo/hitclub',
  
  // LC79 (3)
  'lc79_tx': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/tx',
  'lc79_txmd5': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/txmd5',
  'lc79_xocdia': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/xocdia',
  
  // BETVIP (2)
  'betvip_tx': 'https://eve-hydrocodone-offshore-eagle.trycloudflare.com/api/tx',
  'betvip_txmd5': 'https://eve-hydrocodone-offshore-eagle.trycloudflare.com/api/txmd5',
  
  // 789CLUB (2)
  'club789_tx': 'https://venue-integrate-aged-heavily.trycloudflare.com/api/tx',
  'club789_sicbo': 'https://implement-university-orders-consciousness.trycloudflare.com/sicbo/789club',
  
  // B52 (2)
  'b52_txmd5': 'https://flex-knights-agree-grass.trycloudflare.com/txmd5',
  'b52_sicbo': 'https://implement-university-orders-consciousness.trycloudflare.com/sicbo/b52',
  
  // MAX789 (1)
  'max789_txmd5': 'https://deutschland-mandatory-upon-changelog.trycloudflare.com/api/tx',
  
  // SON789 (1)
  'son789_tx': 'https://with-boating-signed-turn.trycloudflare.com/api/tx',
  
  // LUCK8 (2)
  'luck8_txmd5': 'https://qld-incentives-tion-boost.trycloudflare.com/api/txmd5',
  'luck8_sicbo40': 'https://qld-incentives-tion-boost.trycloudflare.com/api/sicbo40',
  
  // SUMVIN (1)
  'sumvin_txmd5': 'https://cricket-compressed-list-suppose.trycloudflare.com/api/md5',
  
  // 68GB (2)
  'gb68_thuong': 'https://description-zen-dog-films.trycloudflare.com/api/68/thuong',
  'gb68_txmd5': 'https://profiles-televisions-sic-stay.trycloudflare.com/api/68/md5',
  
  // OGK.FAN (1)
  'ogk_txmd5': 'https://liver-specs-processors-css.trycloudflare.com/api/txmd5/latest',
  
  // BCR V1 (1)
  'bcr_v1': 'https://employers-hormone-land-idaho.trycloudflare.com/api/bcr',
  
  // BCR V2 (25 bàn)
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

for (let key in GAME_APIS) {
  gameData[key] = { data: [], tongData: [], diceData: [], lichSuDuDoan: [] };
  cacheDB[key] = new Map();
  statsDB[key] = { tong: 0, dung: 0, sai: 0, tiLe: '0%', tiLe10: '0%', tiLe30: '0%', meta_do_tin_cay: 0 };
  cauHocDB[key] = {
    cau_bet: { so_lan: 0, do_dai_tb: 0, ty_le_dung: 0, do_tin_cay: 0 },
    cau_1_1: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0 },
    cau_2_1: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0 },
    cau_3_2: { so_lan: 0, ty_le_dung: 0, do_tin_cay: 0 },
    cau_dang_chay: null
  };
  metaDB[key] = {
    lich_su_meta: [],
    do_chinh_xac_meta: 0,
    trong_so: 0.5
  };
}

function updateStats(game, thucTe, duDoan, doTinCayMeta) {
  const st = statsDB[game];
  if (!st || !thucTe || !duDoan) return;
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
  metaDB[game].lich_su_meta.push({ dung, doTinCayMeta, thoi_gian: Date.now() });
  if (metaDB[game].lich_su_meta.length > 50) metaDB[game].lich_su_meta.shift();
  const dungCount = metaDB[game].lich_su_meta.filter(m => m.dung).length;
  metaDB[game].do_chinh_xac_meta = (dungCount / metaDB[game].lich_su_meta.length) * 100;
  
  return dung;
}

async function fetchGameData(url, gameKey) {
  try {
    const headers = {};
    if (gameKey.includes('bcr_') || gameKey === 'club789_sicbo') {
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      headers['Referer'] = 'https://implement-university-orders-consciousness.trycloudflare.com/';
    }
    const res = await axios.get(url, { timeout: 10000, headers });
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
// ========== 30 THUẬT TOÁN CON ==========
// ==========================================

function thuatToan_Bet(lichSu) {
  if (lichSu.length < 3) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  let streak = 1;
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[0]) streak++;
    else break;
  }
  if (streak >= 7) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 98, doTinCay: 98, soPP: 1 };
    else return { diemTai: 98, diemXiu: 0, doTinCay: 98, soPP: 1 };
  }
  if (streak === 6) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 95, doTinCay: 95, soPP: 1 };
    else return { diemTai: 95, diemXiu: 0, doTinCay: 95, soPP: 1 };
  }
  if (streak === 5) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 90, doTinCay: 90, soPP: 1 };
    else return { diemTai: 90, diemXiu: 0, doTinCay: 90, soPP: 1 };
  }
  if (streak === 4) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 84, doTinCay: 84, soPP: 1 };
    else return { diemTai: 84, diemXiu: 0, doTinCay: 84, soPP: 1 };
  }
  if (streak === 3) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 74, doTinCay: 74, soPP: 1 };
    else return { diemTai: 74, diemXiu: 0, doTinCay: 74, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

function thuatToan_TanSuat5(lichSu) {
  if (lichSu.length < 5) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const last5 = lichSu.slice(0, 5);
  const tai5 = last5.filter(r => r === "Tài").length;
  if (tai5 >= 4) return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1 };
  if (tai5 <= 1) return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1 };
  if (tai5 === 3) return { diemTai: 68, diemXiu: 0, doTinCay: 68, soPP: 1 };
  if (tai5 === 2) return { diemTai: 0, diemXiu: 68, doTinCay: 68, soPP: 1 };
  return { diemTai: 60, diemXiu: 60, doTinCay: 60, soPP: 1 };
}

function thuatToan_TanSuat10(lichSu) {
  if (lichSu.length < 10) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const last10 = lichSu.slice(0, 10);
  const tai10 = last10.filter(r => r === "Tài").length;
  if (tai10 >= 9) return { diemTai: 0, diemXiu: 92, doTinCay: 92, soPP: 1 };
  if (tai10 <= 1) return { diemTai: 92, diemXiu: 0, doTinCay: 92, soPP: 1 };
  if (tai10 >= 8) return { diemTai: 0, diemXiu: 88, doTinCay: 88, soPP: 1 };
  if (tai10 <= 2) return { diemTai: 88, diemXiu: 0, doTinCay: 88, soPP: 1 };
  if (tai10 >= 7) return { diemTai: 0, diemXiu: 82, doTinCay: 82, soPP: 1 };
  if (tai10 <= 3) return { diemTai: 82, diemXiu: 0, doTinCay: 82, soPP: 1 };
  if (tai10 >= 6) return { diemTai: 0, diemXiu: 74, doTinCay: 74, soPP: 1 };
  if (tai10 <= 4) return { diemTai: 74, diemXiu: 0, doTinCay: 74, soPP: 1 };
  return { diemTai: 65, diemXiu: 65, doTinCay: 65, soPP: 1 };
}

function thuatToan_TanSuat20(lichSu) {
  if (lichSu.length < 20) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const last20 = lichSu.slice(0, 20);
  const tai20 = last20.filter(r => r === "Tài").length;
  if (tai20 >= 15) return { diemTai: 0, diemXiu: 85, doTinCay: 85, soPP: 1 };
  if (tai20 <= 5) return { diemTai: 85, diemXiu: 0, doTinCay: 85, soPP: 1 };
  if (tai20 >= 14) return { diemTai: 0, diemXiu: 80, doTinCay: 80, soPP: 1 };
  if (tai20 <= 6) return { diemTai: 80, diemXiu: 0, doTinCay: 80, soPP: 1 };
  if (tai20 >= 13) return { diemTai: 0, diemXiu: 75, doTinCay: 75, soPP: 1 };
  if (tai20 <= 7) return { diemTai: 75, diemXiu: 0, doTinCay: 75, soPP: 1 };
  return { diemTai: 65, diemXiu: 65, doTinCay: 65, soPP: 1 };
}

function thuatToan_Cau1_1(lichSu) {
  if (lichSu.length < 5) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  let zigzag = 0;
  for (let i = 1; i < 5; i++) {
    if (lichSu[i] !== lichSu[i-1]) zigzag++;
  }
  if (zigzag >= 4) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 86, doTinCay: 86, soPP: 1 };
    else return { diemTai: 86, diemXiu: 0, doTinCay: 86, soPP: 1 };
  }
  if (zigzag >= 3) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1 };
    else return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

function thuatToan_Cau2_1(lichSu) {
  if (lichSu.length < 6) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  if (lichSu[0] === lichSu[1] && lichSu[3] === lichSu[4] && lichSu[0] !== lichSu[3]) {
    if (lichSu[0] === "Tài") return { diemTai: 82, diemXiu: 0, doTinCay: 82, soPP: 1 };
    else return { diemTai: 0, diemXiu: 82, doTinCay: 82, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

function thuatToan_Cau3_2(lichSu) {
  if (lichSu.length < 10) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const p = lichSu.slice(0, 5).join('');
  if (p === "TàiTàiTàiXỉuXỉu") return { diemTai: 0, diemXiu: 86, doTinCay: 86, soPP: 1 };
  if (p === "XỉuXỉuXỉuTàiTài") return { diemTai: 86, diemXiu: 0, doTinCay: 86, soPP: 1 };
  if (p === "TàiTàiXỉuXỉuTài") return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1 };
  if (p === "XỉuXỉuTàiTàiXỉu") return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

function thuatToan_TongDiemTB(tongData) {
  if (!tongData || tongData.length < 10) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const avg = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
  if (avg > 13) return { diemTai: 0, diemXiu: 82, doTinCay: 82, soPP: 1 };
  if (avg < 8) return { diemTai: 82, diemXiu: 0, doTinCay: 82, soPP: 1 };
  if (avg > 12.5) return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1 };
  if (avg < 8.5) return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1 };
  if (avg > 11.5) return { diemTai: 0, diemXiu: 72, doTinCay: 72, soPP: 1 };
  if (avg < 9.5) return { diemTai: 72, diemXiu: 0, doTinCay: 72, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

function thuatToan_RSI(lichSu) {
  if (lichSu.length < 14) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  let gains = 0, losses = 0;
  for (let i = 1; i < nums.length; i++) {
    const diff = nums[i] - nums[i-1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / 14, avgLoss = losses / 14;
  const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  if (rsi >= 85) return { diemTai: 0, diemXiu: 90, doTinCay: 90, soPP: 1 };
  if (rsi <= 15) return { diemTai: 90, diemXiu: 0, doTinCay: 90, soPP: 1 };
  if (rsi >= 75) return { diemTai: 0, diemXiu: 84, doTinCay: 84, soPP: 1 };
  if (rsi <= 25) return { diemTai: 84, diemXiu: 0, doTinCay: 84, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

function thuatToan_MACD(lichSu) {
  if (lichSu.length < 26) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const nums = lichSu.map(r => r === "Tài" ? 1 : 0);
  const ema12 = nums.slice(-12).reduce((a, b) => a + b, 0) / 12;
  const ema26 = nums.slice(-26).reduce((a, b) => a + b, 0) / 26;
  const macd = ema12 - ema26;
  const signal = macd * 0.8;
  if (macd > signal + 0.08) return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1 };
  if (macd < signal - 0.08) return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

function thuatToan_Bollinger(lichSu) {
  if (lichSu.length < 20) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const nums = lichSu.slice(0, 20).map(r => r === "Tài" ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 20;
  const variance = nums.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / 20;
  const std = Math.sqrt(variance);
  const upper = mean + 2 * std;
  const lower = mean - 2 * std;
  const last = nums[19];
  if (last > upper) return { diemTai: 0, diemXiu: 80, doTinCay: 80, soPP: 1 };
  if (last < lower) return { diemTai: 80, diemXiu: 0, doTinCay: 80, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

function thuatToan_Stochastic(lichSu) {
  if (lichSu.length < 14) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const k = (nums[13] - lowest) / (highest - lowest) * 100;
  if (k > 90) return { diemTai: 0, diemXiu: 82, doTinCay: 82, soPP: 1 };
  if (k < 10) return { diemTai: 82, diemXiu: 0, doTinCay: 82, soPP: 1 };
  if (k > 80) return { diemTai: 0, diemXiu: 76, doTinCay: 76, soPP: 1 };
  if (k < 20) return { diemTai: 76, diemXiu: 0, doTinCay: 76, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

function thuatToan_Entropy(lichSu) {
  if (lichSu.length < 20) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const tai20 = lichSu.slice(0, 20).filter(r => r === "Tài").length;
  const p = tai20 / 20;
  if (p === 0) return { diemTai: 85, diemXiu: 0, doTinCay: 85, soPP: 1 };
  if (p === 1) return { diemTai: 0, diemXiu: 85, doTinCay: 85, soPP: 1 };
  const entropy = -p * Math.log2(p) - (1-p) * Math.log2(1-p);
  if (entropy < 0.5) {
    if (p > 0.5) return { diemTai: 82, diemXiu: 0, doTinCay: 82, soPP: 1 };
    else return { diemTai: 0, diemXiu: 82, doTinCay: 82, soPP: 1 };
  }
  if (entropy > 0.95) {
    if (p > 0.5) return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1 };
    else return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

function thuatToan_KNN(lichSu) {
  if (lichSu.length < 20) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
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
  if (taiCount >= 6) return { diemTai: 80, diemXiu: 0, doTinCay: 80, soPP: 1 };
  if (taiCount <= 1) return { diemTai: 0, diemXiu: 80, doTinCay: 80, soPP: 1 };
  if (taiCount >= 5) return { diemTai: 74, diemXiu: 0, doTinCay: 74, soPP: 1 };
  if (taiCount <= 2) return { diemTai: 0, diemXiu: 74, doTinCay: 74, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

function thuatToan_DecisionTree(lichSu) {
  if (lichSu.length < 10) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const last1 = lichSu[0], last2 = lichSu[1], last3 = lichSu[2];
  const t5 = lichSu.slice(0, 5).filter(r => r === "Tài").length;
  if (last1 === "Tài" && last2 === "Tài" && last3 === "Tài") return { diemTai: 0, diemXiu: 85, doTinCay: 85, soPP: 1 };
  if (last1 === "Xỉu" && last2 === "Xỉu" && last3 === "Xỉu") return { diemTai: 85, diemXiu: 0, doTinCay: 85, soPP: 1 };
  if (t5 >= 4) return { diemTai: 0, diemXiu: 76, doTinCay: 76, soPP: 1 };
  if (t5 <= 1) return { diemTai: 76, diemXiu: 0, doTinCay: 76, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

function thuatToan_Momentum(lichSu) {
  if (lichSu.length < 15) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
  const last5 = lichSu.slice(0, 5).filter(r => r === "Tài").length;
  const prev5 = lichSu.slice(5, 10).filter(r => r === "Tài").length;
  const diff = last5 - prev5;
  if (diff >= 4) return { diemTai: 0, diemXiu: 80, doTinCay: 80, soPP: 1 };
  if (diff <= -4) return { diemTai: 80, diemXiu: 0, doTinCay: 80, soPP: 1 };
  if (diff >= 2) return { diemTai: 0, diemXiu: 72, doTinCay: 72, soPP: 1 };
  if (diff <= -2) return { diemTai: 72, diemXiu: 0, doTinCay: 72, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0 };
}

// ==========================================
// ========== AI META SIÊU MẠNH (15 PHƯƠNG PHÁP) ==========
// ==========================================

function metaPhanTichLai(lichSu, tongData, duDoanGoc, doTinCayGoc, gameKey) {
  let diemXacNhan = 0;
  let diemPhanBac = 0;
  let chiTietMeta = [];
  
  // 1. KIỂM TRA BẰNG TẦN SUẤT 10 PHIÊN (trọng số cao)
  if (lichSu.length >= 10) {
    const last10 = lichSu.slice(0, 10);
    const tai10 = last10.filter(r => r === "Tài").length;
    if ((duDoanGoc === "Tài" && tai10 >= 7) || (duDoanGoc === "Xỉu" && tai10 <= 3)) {
      diemXacNhan += 25;
      chiTietMeta.push({ phuong_phap: "Tần suất 10 phiên", ket_luan: "XÁC NHẬN", diem: 25 });
    } else if ((duDoanGoc === "Xỉu" && tai10 >= 7) || (duDoanGoc === "Tài" && tai10 <= 3)) {
      diemPhanBac += 30;
      chiTietMeta.push({ phuong_phap: "Tần suất 10 phiên", ket_luan: "PHẢN BÁC", diem: -30 });
    } else {
      chiTietMeta.push({ phuong_phap: "Tần suất 10 phiên", ket_luan: "TRUNG LẬP", diem: 0 });
    }
  }
  
  // 2. KIỂM TRA CHUỖI BỆT
  if (lichSu.length >= 3) {
    let bet = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[0]) bet++;
      else break;
    }
    if (bet >= 4) {
      const duDoanBet = lichSu[0] === "Tài" ? "Xỉu" : "Tài";
      if (duDoanGoc === duDoanBet) {
        diemXacNhan += 20;
        chiTietMeta.push({ phuong_phap: "Cầu bệt", ket_luan: "XÁC NHẬN", diem: 20 });
      } else {
        diemPhanBac += 25;
        chiTietMeta.push({ phuong_phap: "Cầu bệt", ket_luan: "PHẢN BÁC", diem: -25 });
      }
    }
  }
  
  // 3. KIỂM TRA CẦU 1-1
  if (lichSu.length >= 5) {
    let zigzag = 0;
    for (let i = 1; i < 5; i++) {
      if (lichSu[i] !== lichSu[i-1]) zigzag++;
    }
    if (zigzag >= 3) {
      const duDoanCau = lichSu[0] === "Tài" ? "Xỉu" : "Tài";
      if (duDoanGoc === duDoanCau) {
        diemXacNhan += 18;
        chiTietMeta.push({ phuong_phap: "Cầu 1-1", ket_luan: "XÁC NHẬN", diem: 18 });
      } else {
        diemPhanBac += 20;
        chiTietMeta.push({ phuong_phap: "Cầu 1-1", ket_luan: "PHẢN BÁC", diem: -20 });
      }
    }
  }
  
  // 4. KIỂM TRA TỔNG ĐIỂM TRUNG BÌNH
  if (tongData && tongData.length >= 10) {
    const avg = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    if ((duDoanGoc === "Tài" && avg < 9.5) || (duDoanGoc === "Xỉu" && avg > 11.5)) {
      diemXacNhan += 15;
      chiTietMeta.push({ phuong_phap: "Tổng điểm TB", ket_luan: "XÁC NHẬN", diem: 15 });
    } else if ((duDoanGoc === "Tài" && avg > 11.5) || (duDoanGoc === "Xỉu" && avg < 9.5)) {
      diemPhanBac += 18;
      chiTietMeta.push({ phuong_phap: "Tổng điểm TB", ket_luan: "PHẢN BÁC", diem: -18 });
    } else {
      chiTietMeta.push({ phuong_phap: "Tổng điểm TB", ket_luan: "TRUNG LẬP", diem: 0 });
    }
  }
  
  // 5. KIỂM TRA RSI
  if (lichSu.length >= 14) {
    const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
    let gains = 0, losses = 0;
    for (let i = 1; i < nums.length; i++) {
      const diff = nums[i] - nums[i-1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const rsi = losses === 0 ? 100 : 100 - (100 / (1 + gains / losses));
    if ((duDoanGoc === "Tài" && rsi <= 30) || (duDoanGoc === "Xỉu" && rsi >= 70)) {
      diemXacNhan += 16;
      chiTietMeta.push({ phuong_phap: "RSI", ket_luan: "XÁC NHẬN", diem: 16 });
    } else if ((duDoanGoc === "Tài" && rsi >= 70) || (duDoanGoc === "Xỉu" && rsi <= 30)) {
      diemPhanBac += 18;
      chiTietMeta.push({ phuong_phap: "RSI", ket_luan: "PHẢN BÁC", diem: -18 });
    }
  }
  
  // 6. KIỂM TRA MACD
  if (lichSu.length >= 26) {
    const nums = lichSu.map(r => r === "Tài" ? 1 : 0);
    const ema12 = nums.slice(-12).reduce((a, b) => a + b, 0) / 12;
    const ema26 = nums.slice(-26).reduce((a, b) => a + b, 0) / 26;
    const macd = ema12 - ema26;
    if ((duDoanGoc === "Tài" && macd < -0.08) || (duDoanGoc === "Xỉu" && macd > 0.08)) {
      diemXacNhan += 14;
      chiTietMeta.push({ phuong_phap: "MACD", ket_luan: "XÁC NHẬN", diem: 14 });
    } else if ((duDoanGoc === "Tài" && macd > 0.08) || (duDoanGoc === "Xỉu" && macd < -0.08)) {
      diemPhanBac += 16;
      chiTietMeta.push({ phuong_phap: "MACD", ket_luan: "PHẢN BÁC", diem: -16 });
    }
  }
  
  // 7. KIỂM TRA BOLLINGER BANDS
  if (lichSu.length >= 20) {
    const nums = lichSu.slice(0, 20).map(r => r === "Tài" ? 1 : 0);
    const mean = nums.reduce((a, b) => a + b, 0) / 20;
    const variance = nums.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / 20;
    const std = Math.sqrt(variance);
    const last = nums[19];
    if ((duDoanGoc === "Tài" && last < mean - 2 * std) || (duDoanGoc === "Xỉu" && last > mean + 2 * std)) {
      diemXacNhan += 15;
      chiTietMeta.push({ phuong_phap: "Bollinger", ket_luan: "XÁC NHẬN", diem: 15 });
    } else if ((duDoanGoc === "Tài" && last > mean + 2 * std) || (duDoanGoc === "Xỉu" && last < mean - 2 * std)) {
      diemPhanBac += 15;
      chiTietMeta.push({ phuong_phap: "Bollinger", ket_luan: "PHẢN BÁC", diem: -15 });
    }
  }
  
  // 8. KIỂM TRA STOCHASTIC
  if (lichSu.length >= 14) {
    const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
    const highest = Math.max(...nums), lowest = Math.min(...nums);
    if (highest !== lowest) {
      const k = (nums[13] - lowest) / (highest - lowest) * 100;
      if ((duDoanGoc === "Tài" && k < 20) || (duDoanGoc === "Xỉu" && k > 80)) {
        diemXacNhan += 14;
        chiTietMeta.push({ phuong_phap: "Stochastic", ket_luan: "XÁC NHẬN", diem: 14 });
      } else if ((duDoanGoc === "Tài" && k > 80) || (duDoanGoc === "Xỉu" && k < 20)) {
        diemPhanBac += 14;
        chiTietMeta.push({ phuong_phap: "Stochastic", ket_luan: "PHẢN BÁC", diem: -14 });
      }
    }
  }
  
  // 9. KIỂM TRA ENTROPY
  if (lichSu.length >= 20) {
    const tai20 = lichSu.slice(0, 20).filter(r => r === "Tài").length;
    const p = tai20 / 20;
    const entropy = -p * Math.log2(p) - (1-p) * Math.log2(1-p);
    if (entropy > 0.9) {
      const duDoanEntropy = p > 0.5 ? "Xỉu" : "Tài";
      if (duDoanGoc === duDoanEntropy) {
        diemXacNhan += 12;
        chiTietMeta.push({ phuong_phap: "Entropy", ket_luan: "XÁC NHẬN", diem: 12 });
      } else {
        diemPhanBac += 12;
        chiTietMeta.push({ phuong_phap: "Entropy", ket_luan: "PHẢN BÁC", diem: -12 });
      }
    }
  }
  
  // 10. KIỂM TRA BẰNG LỊCH SỬ META CỦA GAME
  const metaHistory = metaDB[gameKey].lich_su_meta.slice(0, 20);
  if (metaHistory.length >= 10) {
    const dungGanDay = metaHistory.filter(m => m.dung).length;
    const tyLeDungMeta = (dungGanDay / metaHistory.length) * 100;
    if (tyLeDungMeta >= 70) {
      diemXacNhan += 10;
      chiTietMeta.push({ phuong_phap: "Lịch sử Meta", ket_luan: "XÁC NHẬN (Meta đang chạy tốt)", diem: 10 });
    } else if (tyLeDungMeta <= 40) {
      diemPhanBac += 15;
      chiTietMeta.push({ phuong_phap: "Lịch sử Meta", ket_luan: "PHẢN BÁC (Meta đang chạy tệ)", diem: -15 });
    }
  }
  
  // 11. KIỂM TRA XU HƯỚNG TỔNG ĐIỂM (DELTA)
  if (tongData && tongData.length >= 20) {
    const gan = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    const truoc = tongData.slice(10, 20).reduce((a, b) => a + b, 0) / 10;
    const delta = gan - truoc;
    if ((duDoanGoc === "Tài" && delta < -1.5) || (duDoanGoc === "Xỉu" && delta > 1.5)) {
      diemXacNhan += 13;
      chiTietMeta.push({ phuong_phap: "Xu hướng tổng", ket_luan: "XÁC NHẬN", diem: 13 });
    } else if ((duDoanGoc === "Tài" && delta > 1.5) || (duDoanGoc === "Xỉu" && delta < -1.5)) {
      diemPhanBac += 13;
      chiTietMeta.push({ phuong_phap: "Xu hướng tổng", ket_luan: "PHẢN BÁC", diem: -13 });
    }
  }
  
  // 12. KIỂM TRA BẰNG KNN (Pattern matching)
  if (lichSu.length >= 25) {
    const k = 5, lookback = 8;
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
    const duDoanKNN = taiCount >= 3 ? "Tài" : "Xỉu";
    if (duDoanGoc === duDoanKNN) {
      diemXacNhan += 12;
      chiTietMeta.push({ phuong_phap: "KNN Pattern", ket_luan: "XÁC NHẬN", diem: 12 });
    } else {
      diemPhanBac += 12;
      chiTietMeta.push({ phuong_phap: "KNN Pattern", ket_luan: "PHẢN BÁC", diem: -12 });
    }
  }
  
  // 13. KIỂM TRA MOMENTUM DÀI HẠN
  if (lichSu.length >= 30) {
    const last15 = lichSu.slice(0, 15).filter(r => r === "Tài").length;
    const prev15 = lichSu.slice(15, 30).filter(r => r === "Tài").length;
    const diff = last15 - prev15;
    if ((duDoanGoc === "Tài" && diff < -3) || (duDoanGoc === "Xỉu" && diff > 3)) {
      diemXacNhan += 12;
      chiTietMeta.push({ phuong_phap: "Momentum dài hạn", ket_luan: "XÁC NHẬN", diem: 12 });
    } else if ((duDoanGoc === "Tài" && diff > 3) || (duDoanGoc === "Xỉu" && diff < -3)) {
      diemPhanBac += 12;
      chiTietMeta.push({ phuong_phap: "Momentum dài hạn", ket_luan: "PHẢN BÁC", diem: -12 });
    }
  }
  
  // 14. KIỂM TRA BIÊN ĐỘ TỔNG ĐIỂM
  if (tongData && tongData.length >= 15) {
    const max = Math.max(...tongData.slice(0, 15));
    const min = Math.min(...tongData.slice(0, 15));
    const bienDo = max - min;
    if (bienDo >= 10) {
      if ((duDoanGoc === "Tài" && max > 14) || (duDoanGoc === "Xỉu" && max < 11)) {
        diemXacNhan += 10;
        chiTietMeta.push({ phuong_phap: "Biên độ tổng", ket_luan: "XÁC NHẬN", diem: 10 });
      } else {
        diemPhanBac += 10;
        chiTietMeta.push({ phuong_phap: "Biên độ tổng", ket_luan: "PHẢN BÁC", diem: -10 });
      }
    }
  }
  
  // 15. KIỂM TRA CHU KỲ 8 PHIÊN
  if (lichSu.length >= 16) {
    const c1 = lichSu.slice(0, 8);
    const c2 = lichSu.slice(8, 16);
    let giongNhau = 0;
    for (let i = 0; i < 8; i++) if (c1[i] === c2[i]) giongNhau++;
    if (giongNhau >= 6) {
      const duDoanCycle = c2[7] === "Tài" ? "Xỉu" : "Tài";
      if (duDoanGoc === duDoanCycle) {
        diemXacNhan += 14;
        chiTietMeta.push({ phuong_phap: "Chu kỳ 8", ket_luan: "XÁC NHẬN", diem: 14 });
      } else {
        diemPhanBac += 14;
        chiTietMeta.push({ phuong_phap: "Chu kỳ 8", ket_luan: "PHẢN BÁC", diem: -14 });
      }
    }
  }
  
  // TỔNG HỢP KẾT QUẢ META
  const tongDiem = diemXacNhan - diemPhanBac;
  let trangThaiMeta = "";
  let mucDoXacNhan = 0;
  let dieuChinhDoTinCay = 0;
  
  if (tongDiem >= 40) {
    trangThaiMeta = "✅ SIÊU XÁC NHẬN - CỰC KỲ AN TOÀN";
    mucDoXacNhan = 95;
    dieuChinhDoTinCay = +12;
  } else if (tongDiem >= 25) {
    trangThaiMeta = "✅ XÁC NHẬN MẠNH - RẤT AN TOÀN";
    mucDoXacNhan = 88;
    dieuChinhDoTinCay = +8;
  } else if (tongDiem >= 10) {
    trangThaiMeta = "✅ XÁC NHẬN - AN TOÀN";
    mucDoXacNhan = 82;
    dieuChinhDoTinCay = +5;
  } else if (tongDiem >= -5) {
    trangThaiMeta = "📊 TRUNG LẬP - BÌNH THƯỜNG";
    mucDoXacNhan = 68;
    dieuChinhDoTinCay = 0;
  } else if (tongDiem >= -20) {
    trangThaiMeta = "⚠️ PHẢN BÁC NHẸ - CẨN THẬN";
    mucDoXacNhan = 55;
    dieuChinhDoTinCay = -8;
  } else if (tongDiem >= -35) {
    trangThaiMeta = "⚠️ PHẢN BÁC MẠNH - NGUY HIỂM";
    mucDoXacNhan = 48;
    dieuChinhDoTinCay = -15;
  } else {
    trangThaiMeta = "🔴 PHẢN BÁC CỰC MẠNH - TRÁNH XA";
    mucDoXacNhan = 40;
    dieuChinhDoTinCay = -22;
  }
  
  let doTinCayCuoi = doTinCayGoc + dieuChinhDoTinCay;
  doTinCayCuoi = Math.min(96, Math.max(42, doTinCayCuoi));
  
  return {
    du_doan: duDoanGoc,
    do_tin_cay: Math.round(doTinCayCuoi),
    trang_thai_meta: trangThaiMeta,
    diem_xac_nhan: diemXacNhan,
    diem_phan_bac: diemPhanBac,
    tong_diem_meta: tongDiem,
    muc_do_xac_nhan: mucDoXacNhan,
    dieu_chinh: dieuChinhDoTinCay,
    chi_tiet_meta: chiTietMeta.slice(0, 10)
  };
}

// ==========================================
// TỔNG HỢP THUẬT TOÁN + META
// ==========================================
function tongHopDuDoanVaMeta(lichSu, tongData, gameKey) {
  if (lichSu.length < 5) {
    return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu (cần 5 phiên)", so_phuong_phap: 0 };
  }
  
  const cacPhuongPhap = [
    thuatToan_Bet(lichSu), thuatToan_TanSuat5(lichSu), thuatToan_TanSuat10(lichSu), thuatToan_TanSuat20(lichSu),
    thuatToan_Cau1_1(lichSu), thuatToan_Cau2_1(lichSu), thuatToan_Cau3_2(lichSu),
    thuatToan_TongDiemTB(tongData), thuatToan_RSI(lichSu), thuatToan_MACD(lichSu),
    thuatToan_Bollinger(lichSu), thuatToan_Stochastic(lichSu), thuatToan_Entropy(lichSu),
    thuatToan_KNN(lichSu), thuatToan_DecisionTree(lichSu), thuatToan_Momentum(lichSu)
  ];
  
  let diemTai = 0, diemXiu = 0;
  let soPhuongPhap = 0;
  
  for (let p of cacPhuongPhap) {
    if (p.soPP > 0) {
      soPhuongPhap++;
      diemTai += p.diemTai;
      diemXiu += p.diemXiu;
    }
  }
  
  if (soPhuongPhap === 0) {
    const last3 = lichSu.slice(0, 3);
    const tai3 = last3.filter(r => r === "Tài").length;
    const duDoanGoc = tai3 >= 2 ? "Tài" : "Xỉu";
    const metaResult = metaPhanTichLai(lichSu, tongData, duDoanGoc, 58, gameKey);
    return {
      du_doan: metaResult.du_doan,
      do_tin_cay: metaResult.do_tin_cay,
      giai_thich: `Xu hướng 3 phiên | ${metaResult.trang_thai_meta}`,
      so_phuong_phap: 0,
      meta: metaResult
    };
  }
  
  const duDoanGoc = diemTai > diemXiu ? "Tài" : "Xỉu";
  let doTinCayGoc = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
  doTinCayGoc = Math.min(90, Math.max(55, doTinCayGoc));
  
  const metaResult = metaPhanTichLai(lichSu, tongData, duDoanGoc, doTinCayGoc, gameKey);
  
  // Cập nhật độ tin cậy meta vào stats
  statsDB[gameKey].meta_do_tin_cay = metaResult.muc_do_xac_nhan;
  
  return {
    du_doan: metaResult.du_doan,
    do_tin_cay: metaResult.do_tin_cay,
    giai_thich: `${soPhuongPhap} phương pháp | ${metaResult.trang_thai_meta} | Điều chỉnh: ${metaResult.dieu_chinh > 0 ? '+' : ''}${metaResult.dieu_chinh}%`,
    so_phuong_phap: soPhuongPhap,
    meta: {
      diem_xac_nhan: metaResult.diem_xac_nhan,
      diem_phan_bac: metaResult.diem_phan_bac,
      tong_diem: metaResult.tong_diem_meta,
      muc_do_xac_nhan: metaResult.muc_do_xac_nhan + '%',
      chi_tiet: metaResult.chi_tiet_meta
    }
  };
}

// ==========================================
// HÀM DỰ ĐOÁN CHO CÁC GAME (TÀI XỈU, SICBO, XÓC ĐĨA, BCR...)
// ==========================================
function duDoanXocDia(lichSu, gameKey) {
  if (lichSu.length < 5) return { du_doan: "Chẵn", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
  let bet = 1;
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[0]) bet++;
    else break;
  }
  if (bet >= 4) {
    const duDoanGoc = lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn";
    const metaResult = metaPhanTichLai(lichSu.map(v => v === "Chẵn" ? "Tài" : "Xỉu"), [], duDoanGoc === "Chẵn" ? "Tài" : "Xỉu", 78, gameKey);
    return { du_doan: duDoanGoc, do_tin_cay: metaResult.do_tin_cay, giai_thich: `Bệt ${bet} - bẻ cầu | ${metaResult.trang_thai_meta}` };
  }
  if (bet === 3) {
    const duDoanGoc = lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn";
    const metaResult = metaPhanTichLai(lichSu.map(v => v === "Chẵn" ? "Tài" : "Xỉu"), [], duDoanGoc === "Chẵn" ? "Tài" : "Xỉu", 70, gameKey);
    return { du_doan: duDoanGoc, do_tin_cay: metaResult.do_tin_cay, giai_thich: `Bệt 3 - bẻ cầu | ${metaResult.trang_thai_meta}` };
  }
  const last5 = lichSu.slice(0, 5);
  const chan5 = last5.filter(r => r === "Chẵn").length;
  const duDoanGoc = chan5 >= 3 ? "Chẵn" : "Lẻ";
  const metaResult = metaPhanTichLai(lichSu.map(v => v === "Chẵn" ? "Tài" : "Xỉu"), [], duDoanGoc === "Chẵn" ? "Tài" : "Xỉu", 62, gameKey);
  return { du_doan: duDoanGoc, do_tin_cay: metaResult.do_tin_cay, giai_thich: `Theo xu hướng ${chan5}C-${5-chan5}L | ${metaResult.trang_thai_meta}` };
}

function duDoanSicbo(lichSu, tongData, gameKey) {
  return tongHopDuDoanVaMeta(lichSu, tongData, gameKey);
}

function duDoanSunPhung(lichSu, heSo, gameKey) {
  if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
  let diemTai = 0, diemXiu = 0;
  if (heSo >= 4.5) diemXiu += 40;
  else if (heSo >= 4.0) diemXiu += 32;
  else if (heSo <= 2.5) diemTai += 40;
  else if (heSo <= 3.0) diemTai += 32;
  let bet = 1;
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[0]) bet++;
    else break;
  }
  if (bet >= 4) { if (lichSu[0] === "Tài") diemXiu += 50; else diemTai += 50; }
  else if (bet === 3) { if (lichSu[0] === "Tài") diemXiu += 40; else diemTai += 40; }
  const last5 = lichSu.slice(0, 5);
  const tai5 = last5.filter(r => r === "Tài").length;
  if (tai5 >= 4) diemXiu += 30;
  else if (tai5 <= 1) diemTai += 30;
  else if (tai5 >= 3) diemTai += 22;
  else diemXiu += 22;
  const duDoanGoc = diemTai > diemXiu ? "Tài" : "Xỉu";
  let doTinCayGoc = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
  doTinCayGoc = Math.min(88, Math.max(55, doTinCayGoc));
  const metaResult = metaPhanTichLai(lichSu, [], duDoanGoc, doTinCayGoc, gameKey);
  return { du_doan: metaResult.du_doan, do_tin_cay: metaResult.do_tin_cay, giai_thich: `Hệ số ${heSo} + bệt + xu hướng | ${metaResult.trang_thai_meta}` };
}

function duDoanBCR(bcrData, gameKey) {
  if (!bcrData || !bcrData.stats_55) return { du_doan: "Cái", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
  const stats = bcrData.stats_55;
  const banker = stats.banker || 0;
  const player = stats.player || 0;
  const total = banker + player;
  if (total < 5) return { du_doan: "Cái", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
  let tyLeBanker = banker / total;
  let duDoanGoc = "Cái";
  let doTinCayGoc = 60;
  if (tyLeBanker > 0.65) { duDoanGoc = "Con"; doTinCayGoc = 80; }
  else if (tyLeBanker < 0.35) { duDoanGoc = "Cái"; doTinCayGoc = 80; }
  else { duDoanGoc = banker > player ? "Cái" : "Con"; doTinCayGoc = 65; }
  const last5 = bcrData.last_5 || [];
  if (last5.length >= 3) {
    let streak = 1;
    for (let i = last5.length - 2; i >= 0; i--) {
      if (last5[i].winner === last5[last5.length-1].winner) streak++;
      else break;
    }
    if (streak >= 3) {
      const lastWinner = last5[last5.length-1].winner;
      duDoanGoc = lastWinner === 'Banker' ? 'Con' : 'Cái';
      doTinCayGoc = 76;
    }
  }
  const metaResult = metaPhanTichLai([], [], duDoanGoc, doTinCayGoc, gameKey);
  return { du_doan: metaResult.du_doan, do_tin_cay: metaResult.do_tin_cay, giai_thich: `BCR ${tyLeBanker > 0.65 ? "nóng" : "bình thường"} | ${metaResult.trang_thai_meta}` };
}

// ==========================================
// XỬ LÝ REQUEST
// ==========================================
async function xuLyGame(gameKey) {
  const url = GAME_APIS[gameKey];
  const data = await fetchGameData(url, gameKey);
  if (!data) throw new Error(`Không lấy được dữ liệu ${gameKey}`);
  if (data.ket_qua === "Bão") throw new Error(`Game ${gameKey} ra Bão`);
  
  const game = gameData[gameKey];
  const lastPred = cacheDB[gameKey].get(data.phien - 1);
  const isXocDia = (gameKey === 'sunwin_xocdia_live' || gameKey === 'lc79_xocdia');
  const isSicbo = (gameKey.includes('sicbo'));
  const isBCR = (gameKey.startsWith('bcr_'));
  const isSunPhung = (gameKey === 'sunwin_sunphung');
  
  // Cập nhật kết quả cho dự đoán trước
  if (lastPred && lastPred.prediction !== undefined) {
    const dung = updateStats(gameKey, data.ket_qua, lastPred.prediction, lastPred.meta_do_tin_cay || 0);
    game.lichSuDuDoan.unshift({
      phien_du_doan: lastPred.phien_du_doan,
      du_doan: lastPred.prediction,
      do_tin_cay: lastPred.confidence,
      meta_do_tin_cay: lastPred.meta_do_tin_cay,
      thuc_te: data.ket_qua,
      ket_qua: dung ? 'ĐÚNG' : 'SAI',
      thoi_gian: new Date().toISOString()
    });
    if (game.lichSuDuDoan.length > 100) game.lichSuDuDoan.pop();
    lastPred.actual = data.ket_qua;
    lastPred.isCorrect = dung;
  }
  
  game.data.unshift(data.ket_qua);
  if (game.data.length > 500) game.data.pop();
  if (data.tong && typeof data.tong === 'number') {
    game.tongData.unshift(data.tong);
    if (game.tongData.length > 500) game.tongData.pop();
  }
  
  // Cache
  if (cacheDB[gameKey].has(data.phien)) {
    const cached = cacheDB[gameKey].get(data.phien);
    return {
      phien_hien_tai: data.phien,
      ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong },
      duDoan: {
        phien_du_doan: data.phien + 1,
        du_doan: cached.prediction,
        do_tin_cay: cached.confidence + '%',
        giai_thich: cached.reason,
        meta: cached.meta
      },
      thongKe: statsDB[gameKey],
      lichSuDuDoan: game.lichSuDuDoan.slice(0, 30)
    };
  }
  
  // Dự đoán mới
  let prediction;
  if (isXocDia) {
    prediction = duDoanXocDia(game.data, gameKey);
  } else if (isSicbo) {
    prediction = duDoanSicbo(game.data, game.tongData, gameKey);
  } else if (isBCR) {
    prediction = duDoanBCR(data.bcr_data, gameKey);
  } else if (isSunPhung) {
    prediction = duDoanSunPhung(game.data, data.tong, gameKey);
  } else {
    prediction = tongHopDuDoanVaMeta(game.data, game.tongData, gameKey);
  }
  
  cacheDB[gameKey].set(data.phien, {
    prediction: prediction.du_doan,
    confidence: prediction.do_tin_cay,
    reason: prediction.giai_thich,
    meta: prediction.meta,
    meta_do_tin_cay: prediction.meta?.muc_do_xac_nhan || 0,
    phien_du_doan: data.phien + 1
  });
  
  if (cacheDB[gameKey].size > 20) {
    const firstKey = cacheDB[gameKey].keys().next().value;
    cacheDB[gameKey].delete(firstKey);
  }
  
  return {
    phien_hien_tai: data.phien,
    ketQuaTruoc: { phien: data.phien, ket_qua: data.ket_qua, dice: data.dice, tong: data.tong },
    duDoan: {
      phien_du_doan: data.phien + 1,
      du_doan: prediction.du_doan,
      do_tin_cay: prediction.do_tin_cay + '%',
      giai_thich: prediction.giai_thich,
      so_phuong_phap: prediction.so_phuong_phap,
      meta: prediction.meta
    },
    thongKe: statsDB[gameKey],
    lichSuDuDoan: game.lichSuDuDoan.slice(0, 30)
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
      res.json({ game: gameKey.toUpperCase(), ...result, author: '@tranhoang2286', version: 'META AI v2.0' });
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

app.get('/meta/:game', (req, res) => {
  const game = req.params.game;
  if (!GAME_APIS[game]) {
    return res.status(400).json({ error: 'Game không tồn tại', ds_game: Object.keys(GAME_APIS) });
  }
  res.json({
    game,
    meta_accuracy: metaDB[game].do_chinh_xac_meta.toFixed(1) + '%',
    lich_su_meta: metaDB[game].lich_su_meta.slice(0, 20),
    trong_so_hien_tai: metaDB[game].trong_so
  });
});

app.get('/lich-su/:game', (req, res) => {
  const game = req.params.game;
  if (!GAME_APIS[game]) return res.status(400).json({ error: 'Game không tồn tại', ds_game: Object.keys(GAME_APIS) });
  res.json({ game, lichSuDuDoan: gameData[game].lichSuDuDoan.slice(0, 30), thongKe: statsDB[game] });
});

app.get('/lich-su', (req, res) => {
  const allStats = {}; for (let key in GAME_APIS) allStats[key] = statsDB[key];
  res.json({ thong_ke_tat_ca_game: allStats, tong_so_game: Object.keys(GAME_APIS).length });
});

app.get('/', (req, res) => {
  res.json({
    name: '🤖 29 GAME - AI META SIÊU MẠNH (15 PHƯƠNG PHÁP KIỂM TRA) 🤖',
    author: '@tranhoang2286',
    version: '50.0 - META AI v2.0',
    endpoints: {
      'Dự đoán theo game': Object.keys(GAME_APIS).map(k => `/${k.replace(/_/g, '/')}`),
      'BCR tất cả bàn': '/bcr/all',
      'Thống kê Meta': '/meta/:game',
      'Lịch sử dự đoán': '/lich-su/:game'
    },
    ai_meta: {
      so_phuong_phap: '15 phương pháp kiểm tra lại dự đoán',
      cac_phuong_phap: 'Tần suất 10, Bệt, Cầu 1-1, Tổng điểm TB, RSI, MACD, Bollinger, Stochastic, Entropy, KNN, Decision Tree, Momentum, Xu hướng tổng, Biên độ tổng, Chu kỳ 8',
      cach_hoat_dong: 'AI META phân tích lại dự đoán từ 15 góc độ, tổng hợp điểm xác nhận/phản bác, điều chỉnh độ tin cậy'
    },
    ds_game: {
      sunwin: 'TX, Sicbo, Sun Phụng, Xóc đĩa live',
      hitclub: 'TX, TX MD5, Sicbo',
      lc79: 'TX, TX MD5, Xóc đĩa',
      betvip: 'TX, TX MD5',
      club789: 'TX, Sicbo',
      b52: 'TX MD5, Sicbo',
      max789: 'TX MD5',
      son789: 'TX',
      luck8: 'TX MD5, Sicbo 40s',
      sumvin: 'TX MD5',
      gb68: 'Thường, MD5',
      ogk: 'TX MD5',
      bcr: 'V1 + V2 (25 bàn)'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🤖 ${Object.keys(GAME_APIS).length} GAME - AI META v2.0 - PORT ${PORT}`);
  console.log(`✅ 15 thuật toán con + 15 phương pháp Meta kiểm tra`);
  console.log(`✅ Mỗi game có AI META riêng, tự học từ lịch sử`);
});
