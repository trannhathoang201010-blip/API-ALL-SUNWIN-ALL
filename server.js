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
    ty_le_cau_dung: 0
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
  
  // Cập nhật học cầu
  if (loaiCau === 'CẦU BỆT') {
    cauHocDB[game].cau_bet.ty_le_dung = (cauHocDB[game].cau_bet.ty_le_dung * (cauHocDB[game].cau_bet.so_lan - 1) + (dung ? 100 : 0)) / cauHocDB[game].cau_bet.so_lan;
  } else if (loaiCau === 'CẦU 1-1') {
    cauHocDB[game].cau_1_1.ty_le_dung = (cauHocDB[game].cau_1_1.ty_le_dung * (cauHocDB[game].cau_1_1.so_lan - 1) + (dung ? 100 : 0)) / cauHocDB[game].cau_1_1.so_lan;
  } else if (loaiCau === 'CẦU 2-1') {
    cauHocDB[game].cau_2_1.ty_le_dung = (cauHocDB[game].cau_2_1.ty_le_dung * (cauHocDB[game].cau_2_1.so_lan - 1) + (dung ? 100 : 0)) / cauHocDB[game].cau_2_1.so_lan;
  } else if (loaiCau === 'CẦU 3-2') {
    cauHocDB[game].cau_3_2.ty_le_dung = (cauHocDB[game].cau_3_2.ty_le_dung * (cauHocDB[game].cau_3_2.so_lan - 1) + (dung ? 100 : 0)) / cauHocDB[game].cau_3_2.so_lan;
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
// ========== 30 THUẬT TOÁN CON ==========
// ==========================================

function thuatToan_Bet(lichSu) {
  if (lichSu.length < 3) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'BET' };
  let streak = 1;
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[0]) streak++;
    else break;
  }
  if (streak >= 7) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 98, doTinCay: 98, soPP: 1, loai: 'BET' };
    else return { diemTai: 98, diemXiu: 0, doTinCay: 98, soPP: 1, loai: 'BET' };
  }
  if (streak === 6) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 95, doTinCay: 95, soPP: 1, loai: 'BET' };
    else return { diemTai: 95, diemXiu: 0, doTinCay: 95, soPP: 1, loai: 'BET' };
  }
  if (streak === 5) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 90, doTinCay: 90, soPP: 1, loai: 'BET' };
    else return { diemTai: 90, diemXiu: 0, doTinCay: 90, soPP: 1, loai: 'BET' };
  }
  if (streak === 4) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 84, doTinCay: 84, soPP: 1, loai: 'BET' };
    else return { diemTai: 84, diemXiu: 0, doTinCay: 84, soPP: 1, loai: 'BET' };
  }
  if (streak === 3) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 74, doTinCay: 74, soPP: 1, loai: 'BET' };
    else return { diemTai: 74, diemXiu: 0, doTinCay: 74, soPP: 1, loai: 'BET' };
  }
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'BET' };
}

function thuatToan_TanSuat5(lichSu) {
  if (lichSu.length < 5) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'TS5' };
  const last5 = lichSu.slice(0, 5);
  const tai5 = last5.filter(r => r === "Tài").length;
  if (tai5 >= 4) return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1, loai: 'TS5' };
  if (tai5 <= 1) return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1, loai: 'TS5' };
  if (tai5 === 3) return { diemTai: 68, diemXiu: 0, doTinCay: 68, soPP: 1, loai: 'TS5' };
  if (tai5 === 2) return { diemTai: 0, diemXiu: 68, doTinCay: 68, soPP: 1, loai: 'TS5' };
  return { diemTai: 60, diemXiu: 60, doTinCay: 60, soPP: 1, loai: 'TS5' };
}

function thuatToan_TanSuat10(lichSu) {
  if (lichSu.length < 10) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'TS10' };
  const last10 = lichSu.slice(0, 10);
  const tai10 = last10.filter(r => r === "Tài").length;
  if (tai10 >= 9) return { diemTai: 0, diemXiu: 92, doTinCay: 92, soPP: 1, loai: 'TS10' };
  if (tai10 <= 1) return { diemTai: 92, diemXiu: 0, doTinCay: 92, soPP: 1, loai: 'TS10' };
  if (tai10 >= 8) return { diemTai: 0, diemXiu: 88, doTinCay: 88, soPP: 1, loai: 'TS10' };
  if (tai10 <= 2) return { diemTai: 88, diemXiu: 0, doTinCay: 88, soPP: 1, loai: 'TS10' };
  if (tai10 >= 7) return { diemTai: 0, diemXiu: 82, doTinCay: 82, soPP: 1, loai: 'TS10' };
  if (tai10 <= 3) return { diemTai: 82, diemXiu: 0, doTinCay: 82, soPP: 1, loai: 'TS10' };
  if (tai10 >= 6) return { diemTai: 0, diemXiu: 74, doTinCay: 74, soPP: 1, loai: 'TS10' };
  if (tai10 <= 4) return { diemTai: 74, diemXiu: 0, doTinCay: 74, soPP: 1, loai: 'TS10' };
  return { diemTai: 65, diemXiu: 65, doTinCay: 65, soPP: 1, loai: 'TS10' };
}

function thuatToan_TanSuat20(lichSu) {
  if (lichSu.length < 20) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'TS20' };
  const last20 = lichSu.slice(0, 20);
  const tai20 = last20.filter(r => r === "Tài").length;
  if (tai20 >= 15) return { diemTai: 0, diemXiu: 85, doTinCay: 85, soPP: 1, loai: 'TS20' };
  if (tai20 <= 5) return { diemTai: 85, diemXiu: 0, doTinCay: 85, soPP: 1, loai: 'TS20' };
  if (tai20 >= 14) return { diemTai: 0, diemXiu: 80, doTinCay: 80, soPP: 1, loai: 'TS20' };
  if (tai20 <= 6) return { diemTai: 80, diemXiu: 0, doTinCay: 80, soPP: 1, loai: 'TS20' };
  if (tai20 >= 13) return { diemTai: 0, diemXiu: 75, doTinCay: 75, soPP: 1, loai: 'TS20' };
  if (tai20 <= 7) return { diemTai: 75, diemXiu: 0, doTinCay: 75, soPP: 1, loai: 'TS20' };
  return { diemTai: 65, diemXiu: 65, doTinCay: 65, soPP: 1, loai: 'TS20' };
}

function thuatToan_Cau1_1(lichSu) {
  if (lichSu.length < 5) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'C11' };
  let zigzag = 0;
  for (let i = 1; i < 5; i++) {
    if (lichSu[i] !== lichSu[i-1]) zigzag++;
  }
  if (zigzag >= 4) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 86, doTinCay: 86, soPP: 1, loai: 'C11' };
    else return { diemTai: 86, diemXiu: 0, doTinCay: 86, soPP: 1, loai: 'C11' };
  }
  if (zigzag >= 3) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1, loai: 'C11' };
    else return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1, loai: 'C11' };
  }
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'C11' };
}

function thuatToan_Cau2_1(lichSu) {
  if (lichSu.length < 6) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'C21' };
  if (lichSu[0] === lichSu[1] && lichSu[3] === lichSu[4] && lichSu[0] !== lichSu[3]) {
    if (lichSu[0] === "Tài") return { diemTai: 82, diemXiu: 0, doTinCay: 82, soPP: 1, loai: 'C21' };
    else return { diemTai: 0, diemXiu: 82, doTinCay: 82, soPP: 1, loai: 'C21' };
  }
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'C21' };
}

function thuatToan_Cau3_2(lichSu) {
  if (lichSu.length < 10) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'C32' };
  const p = lichSu.slice(0, 5).join('');
  if (p === "TàiTàiTàiXỉuXỉu") return { diemTai: 0, diemXiu: 86, doTinCay: 86, soPP: 1, loai: 'C32' };
  if (p === "XỉuXỉuXỉuTàiTài") return { diemTai: 86, diemXiu: 0, doTinCay: 86, soPP: 1, loai: 'C32' };
  if (p === "TàiTàiXỉuXỉuTài") return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1, loai: 'C32' };
  if (p === "XỉuXỉuTàiTàiXỉu") return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1, loai: 'C32' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'C32' };
}

function thuatToan_TongDiemTB(tongData) {
  if (!tongData || tongData.length < 10) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'TDTB' };
  const avg = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
  if (avg > 13) return { diemTai: 0, diemXiu: 82, doTinCay: 82, soPP: 1, loai: 'TDTB' };
  if (avg < 8) return { diemTai: 82, diemXiu: 0, doTinCay: 82, soPP: 1, loai: 'TDTB' };
  if (avg > 12.5) return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1, loai: 'TDTB' };
  if (avg < 8.5) return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1, loai: 'TDTB' };
  if (avg > 11.5) return { diemTai: 0, diemXiu: 72, doTinCay: 72, soPP: 1, loai: 'TDTB' };
  if (avg < 9.5) return { diemTai: 72, diemXiu: 0, doTinCay: 72, soPP: 1, loai: 'TDTB' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'TDTB' };
}

function thuatToan_RSI(lichSu) {
  if (lichSu.length < 14) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'RSI' };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  let gains = 0, losses = 0;
  for (let i = 1; i < nums.length; i++) {
    const diff = nums[i] - nums[i-1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / 14, avgLoss = losses / 14;
  const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  if (rsi >= 85) return { diemTai: 0, diemXiu: 90, doTinCay: 90, soPP: 1, loai: 'RSI' };
  if (rsi <= 15) return { diemTai: 90, diemXiu: 0, doTinCay: 90, soPP: 1, loai: 'RSI' };
  if (rsi >= 75) return { diemTai: 0, diemXiu: 84, doTinCay: 84, soPP: 1, loai: 'RSI' };
  if (rsi <= 25) return { diemTai: 84, diemXiu: 0, doTinCay: 84, soPP: 1, loai: 'RSI' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'RSI' };
}

function thuatToan_MACD(lichSu) {
  if (lichSu.length < 26) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'MACD' };
  const nums = lichSu.map(r => r === "Tài" ? 1 : 0);
  const ema12 = nums.slice(-12).reduce((a, b) => a + b, 0) / 12;
  const ema26 = nums.slice(-26).reduce((a, b) => a + b, 0) / 26;
  const macd = ema12 - ema26;
  const signal = macd * 0.8;
  if (macd > signal + 0.08) return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1, loai: 'MACD' };
  if (macd < signal - 0.08) return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1, loai: 'MACD' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'MACD' };
}

function thuatToan_Bollinger(lichSu) {
  if (lichSu.length < 20) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'BB' };
  const nums = lichSu.slice(0, 20).map(r => r === "Tài" ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 20;
  const variance = nums.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / 20;
  const std = Math.sqrt(variance);
  const upper = mean + 2 * std;
  const lower = mean - 2 * std;
  const last = nums[19];
  if (last > upper) return { diemTai: 0, diemXiu: 80, doTinCay: 80, soPP: 1, loai: 'BB' };
  if (last < lower) return { diemTai: 80, diemXiu: 0, doTinCay: 80, soPP: 1, loai: 'BB' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'BB' };
}

function thuatToan_Stochastic(lichSu) {
  if (lichSu.length < 14) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'STO' };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'STO' };
  const k = (nums[13] - lowest) / (highest - lowest) * 100;
  if (k > 90) return { diemTai: 0, diemXiu: 82, doTinCay: 82, soPP: 1, loai: 'STO' };
  if (k < 10) return { diemTai: 82, diemXiu: 0, doTinCay: 82, soPP: 1, loai: 'STO' };
  if (k > 80) return { diemTai: 0, diemXiu: 76, doTinCay: 76, soPP: 1, loai: 'STO' };
  if (k < 20) return { diemTai: 76, diemXiu: 0, doTinCay: 76, soPP: 1, loai: 'STO' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'STO' };
}

function thuatToan_Entropy(lichSu) {
  if (lichSu.length < 20) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'ENT' };
  const tai20 = lichSu.slice(0, 20).filter(r => r === "Tài").length;
  const p = tai20 / 20;
  if (p === 0) return { diemTai: 85, diemXiu: 0, doTinCay: 85, soPP: 1, loai: 'ENT' };
  if (p === 1) return { diemTai: 0, diemXiu: 85, doTinCay: 85, soPP: 1, loai: 'ENT' };
  const entropy = -p * Math.log2(p) - (1-p) * Math.log2(1-p);
  if (entropy < 0.5) {
    if (p > 0.5) return { diemTai: 82, diemXiu: 0, doTinCay: 82, soPP: 1, loai: 'ENT' };
    else return { diemTai: 0, diemXiu: 82, doTinCay: 82, soPP: 1, loai: 'ENT' };
  }
  if (entropy > 0.95) {
    if (p > 0.5) return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1, loai: 'ENT' };
    else return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1, loai: 'ENT' };
  }
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'ENT' };
}

function thuatToan_KNN(lichSu) {
  if (lichSu.length < 25) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'KNN' };
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
  if (taiCount >= 6) return { diemTai: 80, diemXiu: 0, doTinCay: 80, soPP: 1, loai: 'KNN' };
  if (taiCount <= 1) return { diemTai: 0, diemXiu: 80, doTinCay: 80, soPP: 1, loai: 'KNN' };
  if (taiCount >= 5) return { diemTai: 74, diemXiu: 0, doTinCay: 74, soPP: 1, loai: 'KNN' };
  if (taiCount <= 2) return { diemTai: 0, diemXiu: 74, doTinCay: 74, soPP: 1, loai: 'KNN' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'KNN' };
}

function thuatToan_DecisionTree(lichSu) {
  if (lichSu.length < 10) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'DT' };
  const last1 = lichSu[0], last2 = lichSu[1], last3 = lichSu[2];
  const t5 = lichSu.slice(0, 5).filter(r => r === "Tài").length;
  if (last1 === "Tài" && last2 === "Tài" && last3 === "Tài") return { diemTai: 0, diemXiu: 85, doTinCay: 85, soPP: 1, loai: 'DT' };
  if (last1 === "Xỉu" && last2 === "Xỉu" && last3 === "Xỉu") return { diemTai: 85, diemXiu: 0, doTinCay: 85, soPP: 1, loai: 'DT' };
  if (t5 >= 4) return { diemTai: 0, diemXiu: 76, doTinCay: 76, soPP: 1, loai: 'DT' };
  if (t5 <= 1) return { diemTai: 76, diemXiu: 0, doTinCay: 76, soPP: 1, loai: 'DT' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'DT' };
}

function thuatToan_Momentum(lichSu) {
  if (lichSu.length < 15) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'MOM' };
  const last5 = lichSu.slice(0, 5).filter(r => r === "Tài").length;
  const prev5 = lichSu.slice(5, 10).filter(r => r === "Tài").length;
  const diff = last5 - prev5;
  if (diff >= 4) return { diemTai: 0, diemXiu: 80, doTinCay: 80, soPP: 1, loai: 'MOM' };
  if (diff <= -4) return { diemTai: 80, diemXiu: 0, doTinCay: 80, soPP: 1, loai: 'MOM' };
  if (diff >= 2) return { diemTai: 0, diemXiu: 72, doTinCay: 72, soPP: 1, loai: 'MOM' };
  if (diff <= -2) return { diemTai: 72, diemXiu: 0, doTinCay: 72, soPP: 1, loai: 'MOM' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'MOM' };
}

function thuatToan_XuHuongTong(tongData) {
  if (!tongData || tongData.length < 20) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'XHT' };
  const gan = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
  const truoc = tongData.slice(10, 20).reduce((a, b) => a + b, 0) / 10;
  const delta = gan - truoc;
  if (delta > 2.5) return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1, loai: 'XHT' };
  if (delta < -2.5) return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1, loai: 'XHT' };
  if (delta > 1.5) return { diemTai: 0, diemXiu: 70, doTinCay: 70, soPP: 1, loai: 'XHT' };
  if (delta < -1.5) return { diemTai: 70, diemXiu: 0, doTinCay: 70, soPP: 1, loai: 'XHT' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'XHT' };
}

function thuatToan_BienDoTong(tongData) {
  if (!tongData || tongData.length < 15) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'BDT' };
  const max = Math.max(...tongData.slice(0, 15));
  const min = Math.min(...tongData.slice(0, 15));
  const bienDo = max - min;
  if (bienDo >= 12) {
    if (max > 14) return { diemTai: 0, diemXiu: 80, doTinCay: 80, soPP: 1, loai: 'BDT' };
    else return { diemTai: 80, diemXiu: 0, doTinCay: 80, soPP: 1, loai: 'BDT' };
  }
  if (bienDo >= 9) {
    if (max > 13) return { diemTai: 0, diemXiu: 74, doTinCay: 74, soPP: 1, loai: 'BDT' };
    else return { diemTai: 74, diemXiu: 0, doTinCay: 74, soPP: 1, loai: 'BDT' };
  }
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'BDT' };
}

function thuatToan_WilliamsR(lichSu) {
  if (lichSu.length < 14) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'WR' };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'WR' };
  const wr = (highest - nums[13]) / (highest - lowest) * -100;
  if (wr < -90) return { diemTai: 80, diemXiu: 0, doTinCay: 80, soPP: 1, loai: 'WR' };
  if (wr > -10) return { diemTai: 0, diemXiu: 80, doTinCay: 80, soPP: 1, loai: 'WR' };
  if (wr < -80) return { diemTai: 74, diemXiu: 0, doTinCay: 74, soPP: 1, loai: 'WR' };
  if (wr > -20) return { diemTai: 0, diemXiu: 74, doTinCay: 74, soPP: 1, loai: 'WR' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'WR' };
}

function thuatToan_CCI(lichSu) {
  if (lichSu.length < 14) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'CCI' };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 14;
  const mad = nums.reduce((sum, x) => sum + Math.abs(x - mean), 0) / 14;
  if (mad === 0) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'CCI' };
  const cci = (nums[13] - mean) / (0.015 * mad);
  if (cci > 150) return { diemTai: 0, diemXiu: 80, doTinCay: 80, soPP: 1, loai: 'CCI' };
  if (cci < -150) return { diemTai: 80, diemXiu: 0, doTinCay: 80, soPP: 1, loai: 'CCI' };
  if (cci > 100) return { diemTai: 0, diemXiu: 74, doTinCay: 74, soPP: 1, loai: 'CCI' };
  if (cci < -100) return { diemTai: 74, diemXiu: 0, doTinCay: 74, soPP: 1, loai: 'CCI' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'CCI' };
}

function thuatToan_LinearReg(lichSu) {
  if (lichSu.length < 12) return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'LR' };
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
  if (pred > 0.65) return { diemTai: 78, diemXiu: 0, doTinCay: 78, soPP: 1, loai: 'LR' };
  if (pred < 0.35) return { diemTai: 0, diemXiu: 78, doTinCay: 78, soPP: 1, loai: 'LR' };
  return { diemTai: 0, diemXiu: 0, doTinCay: 0, soPP: 0, loai: 'LR' };
}

// ==========================================
// ========== AI META SIÊU MẠNH (20 PHƯƠNG PHÁP KIỂM TRA) ==========
// ==========================================

function metaPhanTichLai(lichSu, tongData, duDoanGoc, doTinCayGoc, gameKey) {
  let diemXacNhan = 0;
  let diemPhanBac = 0;
  let chiTietMeta = [];
  const trongSoMeta = metaDB[gameKey].trong_so || 0.65;
  
  // 1. KIỂM TRA BẰNG TẦN SUẤT 10 PHIÊN (trọng số 1.5)
  if (lichSu.length >= 10) {
    const last10 = lichSu.slice(0, 10);
    const tai10 = last10.filter(r => r === "Tài").length;
    if ((duDoanGoc === "Tài" && tai10 >= 7) || (duDoanGoc === "Xỉu" && tai10 <= 3)) {
      diemXacNhan += 25 * trongSoMeta;
      chiTietMeta.push({ phuong_phap: "Tần suất 10 phiên", ket_luan: "✅ XÁC NHẬN", diem: 25 });
    } else if ((duDoanGoc === "Xỉu" && tai10 >= 7) || (duDoanGoc === "Tài" && tai10 <= 3)) {
      diemPhanBac += 30 * trongSoMeta;
      chiTietMeta.push({ phuong_phap: "Tần suất 10 phiên", ket_luan: "❌ PHẢN BÁC", diem: -30 });
    } else {
      chiTietMeta.push({ phuong_phap: "Tần suất 10 phiên", ket_luan: "⚖️ TRUNG LẬP", diem: 0 });
    }
  }
  
  // 2. KIỂM TRA CHUỖI BỆT (trọng số 1.8)
  if (lichSu.length >= 3) {
    let bet = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[0]) bet++;
      else break;
    }
    if (bet >= 4) {
      const duDoanBet = lichSu[0] === "Tài" ? "Xỉu" : "Tài";
      if (duDoanGoc === duDoanBet) {
        diemXacNhan += 22 * trongSoMeta;
        chiTietMeta.push({ phuong_phap: "Cầu bệt", ket_luan: "✅ XÁC NHẬN", diem: 22 });
      } else {
        diemPhanBac += 28 * trongSoMeta;
        chiTietMeta.push({ phuong_phap: "Cầu bệt", ket_luan: "❌ PHẢN BÁC", diem: -28 });
      }
    }
  }
  
  // 3. KIỂM TRA CẦU 1-1 (trọng số 1.6)
  if (lichSu.length >= 5) {
    let zigzag = 0;
    for (let i = 1; i < 5; i++) {
      if (lichSu[i] !== lichSu[i-1]) zigzag++;
    }
    if (zigzag >= 3) {
      const duDoanCau = lichSu[0] === "Tài" ? "Xỉu" : "Tài";
      if (duDoanGoc === duDoanCau) {
        diemXacNhan += 20 * trongSoMeta;
        chiTietMeta.push({ phuong_phap: "Cầu 1-1", ket_luan: "✅ XÁC NHẬN", diem: 20 });
      } else {
        diemPhanBac += 25 * trongSoMeta;
        chiTietMeta.push({ phuong_phap: "Cầu 1-1", ket_luan: "❌ PHẢN BÁC", diem: -25 });
      }
    }
  }
  
  // 4. KIỂM TRA TỔNG ĐIỂM TRUNG BÌNH (trọng số 1.4)
  if (tongData && tongData.length >= 10) {
    const avg = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    if ((duDoanGoc === "Tài" && avg < 9.5) || (duDoanGoc === "Xỉu" && avg > 11.5)) {
      diemXacNhan += 18 * trongSoMeta;
      chiTietMeta.push({ phuong_phap: "Tổng điểm TB", ket_luan: "✅ XÁC NHẬN", diem: 18 });
    } else if ((duDoanGoc === "Tài" && avg > 11.5) || (duDoanGoc === "Xỉu" && avg < 9.5)) {
      diemPhanBac += 20 * trongSoMeta;
      chiTietMeta.push({ phuong_phap: "Tổng điểm TB", ket_luan: "❌ PHẢN BÁC", diem: -20 });
    } else {
      chiTietMeta.push({ phuong_phap: "Tổng điểm TB", ket_luan: "⚖️ TRUNG LẬP", diem: 0 });
    }
  }
  
  // 5. KIỂM TRA RSI (trọng số 1.5)
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
      diemXacNhan += 20 * trongSoMeta;
      chiTietMeta.push({ phuong_phap: "RSI", ket_luan: "✅ XÁC NHẬN", diem: 20 });
    } else if ((duDoanGoc === "Tài" && rsi >= 70) || (duDoanGoc === "Xỉu" && rsi <= 30)) {
      diemPhanBac += 22 * trongSoMeta;
      chiTietMeta.push({ phuong_phap: "RSI", ket_luan: "❌ PHẢN BÁC", diem: -22 });
    }
  }
  
  // 6. KIỂM TRA MACD (trọng số 1.3)
  if (lichSu.length >= 26) {
    const nums = lichSu.map(r => r === "Tài" ? 1 : 0);
    const ema12 = nums.slice(-12).reduce((a, b) => a + b, 0) / 12;
    const ema26 = nums.slice(-26).reduce((a, b) => a + b, 0) / 26;
    const macd = ema12 - ema26;
    if ((duDoanGoc === "Tài" && macd < -0.08) || (duDoanGoc === "Xỉu" && macd > 0.08)) {
      diemXacNhan += 16 * trongSoMeta;
      chiTietMeta.push({ phuong_phap: "MACD", ket_luan: "✅ XÁC NHẬN", diem: 16 });
    } else if ((duDoanGoc === "Tài" && macd > 0.08) || (duDoanGoc === "Xỉu" && macd < -0.08)) {
      diemPhanBac += 18 * trongSoMeta;
      chiTietMeta.push({ phuong_phap: "MACD", ket_luan: "❌ PHẢN BÁC", diem: -18 });
    }
  }
  
  // 7. KIỂM TRA BOLLINGER BANDS (trọng số 1.4)
  if (lichSu.length >= 20) {
    const nums = lichSu.slice(0, 20).map(r => r === "Tài" ? 1 : 0);
    const mean = nums.reduce((a, b) => a + b, 0) / 20;
    const variance = nums.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / 20;
    const std = Math.sqrt(variance);
    const last = nums[19];
    if ((duDoanGoc === "Tài" && last < mean - 2 * std) || (duDoanGoc === "Xỉu" && last > mean + 2 * std)) {
      diemXacNhan += 18 * trongSoMeta;
      chiTietMeta.push({ phuong_phap: "Bollinger", ket_luan: "✅ XÁC NHẬN", diem: 18 });
    } else if ((duDoanGoc === "Tài" && last > mean + 2 * std) || (duDoanGoc === "Xỉu" && last < mean - 2 * std)) {
      diemPhanBac += 18 * trongSoMeta;
      chiTietMeta.push({ phuong_phap: "Bollinger", ket_luan: "❌ PHẢN BÁC", diem: -18 });
    }
  }
  
  // 8. KIỂM TRA STOCHASTIC (trọng số 1.3)
  if (lichSu.length >= 14) {
    const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
    const highest = Math.max(...nums), lowest = Math.min(...nums);
    if (highest !== lowest) {
      const k = (nums[13] - lowest) / (highest - lowest) * 100;
      if ((duDoanGoc === "Tài" && k < 20) || (duDoanGoc === "Xỉu" && k > 80)) {
        diemXacNhan += 16 * trongSoMeta;
        chiTietMeta.push({ phuong_phap: "Stochastic", ket_luan: "✅ XÁC NHẬN", diem: 16 });
      } else if ((duDoanGoc === "Tài" && k > 80) || (duDoanGoc === "Xỉu" && k < 20)) {
        diemPhanBac += 16 * trongSoMeta;
        chiTietMeta.push({ phuong_phap: "Stochastic", ket_luan: "❌ PHẢN BÁC", diem: -16 });
      }
    }
  }
  
  // 9. KIỂM TRA ENTROPY (trọng số 1.2)
  if (lichSu.length >= 20) {
    const tai20 = lichSu.slice(0, 20).filter(r => r === "Tài").length;
    const p = tai20 / 20;
    const entropy = -p * Math.log2(p) - (1-p) * Math.log2(1-p);
    if (entropy > 0.9) {
      const duDoanEntropy = p > 0.5 ? "Xỉu" : "Tài";
      if (duDoanGoc === duDoanEntropy) {
        diemXacNhan += 14 * trongSoMeta;
        chiTietMeta.push({ phuong_phap: "Entropy", ket_luan: "✅ XÁC NHẬN", diem: 14 });
      } else {
        diemPhanBac += 14 * trongSoMeta;
        chiTietMeta.push({ phuong_phap: "Entropy", ket_luan: "❌ PHẢN BÁC", diem: -14 });
      }
    }
  }
  
  // 10. KIỂM TRA BẰNG KNN (trọng số 1.5)
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
      diemXacNhan += 18 * trongSoMeta;
      chiTietMeta.push({ phuong_phap: "KNN Pattern", ket_luan: "✅ XÁC NHẬN", diem: 18 });
    } else {
      diemPhanBac += 18 * trongSoMeta;
      chiTietMeta.push({ phuong_phap: "KNN Pattern", ket_luan: "❌ PHẢN BÁC", diem: -18 });
    }
  }
  
  // 11. KIỂM TRA DECISION TREE (trọng số 1.3)
  if (lichSu.length >= 10) {
    const last1 = lichSu[0], last2 = lichSu[1], last3 = lichSu[2];
    const t5 = lichSu.slice(0, 5).filter(r => r === "Tài").length;
    let duDoanDT = null;
    if (last1 === "Tài" && last2 === "Tài" && last3 === "Tài") duDoanDT = "Xỉu";
    else if (last1 === "Xỉu" && last2 === "Xỉu" && last3 === "Xỉu") duDoanDT = "Tài";
    else if (t5 >= 4) duDoanDT = "Xỉu";
    else if (t5 <= 1) duDoanDT = "Tài";
    if (duDoanDT && duDoanGoc === duDoanDT) {
      diemXacNhan += 15 * trongSoMeta;
      chiTietMeta.push({ phuong
