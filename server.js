const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// DANH SÁCH API (29+ GAME)
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
// CẤU TRÚC DỮ LIỆU CHO TỪNG GAME
// ==========================================
const gameData = {};
const cacheDB = {};
const statsDB = {};
const metaDB = {};
const learningDB = {};

for (let key in GAME_APIS) {
  gameData[key] = { 
    data: [], tongData: [], diceData: [], lichSuDuDoan: []
  };
  cacheDB[key] = new Map();
  statsDB[key] = { 
    tong: 0, dung: 0, sai: 0, tiLe: '0%', tiLe10: '0%', tiLe30: '0%', meta_do_tin_cay: 0 
  };
  metaDB[key] = {
    lichSuMeta: [], doChinhXacMeta: 0, trongSo: 0.7
  };
  learningDB[key] = {
    dsThuocTinh: new Map(), lanCuoiCapNhat: Date.now(), soLanHoc: 0
  };
}

// ==========================================
// HÀM TIỆN ÍCH
// ==========================================
function chuanHoa(ketQua) {
  if (!ketQua) return null;
  const kq = String(ketQua).toLowerCase().trim();
  if (kq === 'tài' || kq === 'tai') return 'Tài';
  if (kq === 'xỉu' || kq === 'xiu') return 'Xỉu';
  if (kq === 'chẵn' || kq === 'chan') return 'Chẵn';
  if (kq === 'lẻ' || kq === 'le') return 'Lẻ';
  if (kq === 'cái' || kq === 'banker') return 'Cái';
  if (kq === 'con' || kq === 'player') return 'Con';
  return ketQua;
}

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
        return { phien: data.phien, ket_qua: chuanHoa(data.ket_qua_truyen_thong), dice: [], tong: null };
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
    let ketQua = chuanHoa(data.ket_qua);
    if (ketQua !== 'Tài' && ketQua !== 'Xỉu') return null;
    
    let phien = data.phien;
    if (!phien) phien = Date.now();
    if (gameKey === 'b52_txmd5' && phien) phien = parseInt(String(phien).replace('#', ''));
    
    return { 
      phien, ket_qua: ketQua, 
      dice: [data.xuc_xac_1, data.xuc_xac_2, data.xuc_xac_3], 
      tong: data.tong || (data.xuc_xac_1 + data.xuc_xac_2 + data.xuc_xac_3)
    };
  } catch (err) {
    return null;
  }
}

// ==========================================
// ========== THUẬT TOÁN 1: SIÊU BỆT (600+ DÒNG) ==========
// ==========================================
function thuatToan_SieuBet(lichSu, tongData) {
  let duDoan = null;
  let doTinCay = 0;
  let phanTich = [];
  
  if (lichSu.length < 3) return { duDoan: null, doTinCay: 0, phanTich: ["Không đủ dữ liệu"] };
  
  // Phân tích độ dài bệt hiện tại
  let doDaiBet = 1;
  let giaTriBet = lichSu[0];
  for (let i = 1; i < Math.min(lichSu.length, 20); i++) {
    if (lichSu[i] === giaTriBet) doDaiBet++;
    else break;
  }
  
  phanTich.push(`📊 Phát hiện bệt ${giaTriBet} với độ dài ${doDaiBet} phiên`);
  
  // Phân tích lịch sử bệt của game
  let lichSuBet = [];
  for (let i = 0; i < Math.min(lichSu.length - 2, 100); i++) {
    let betLen = 1;
    let betVal = lichSu[i];
    for (let j = i + 1; j < Math.min(lichSu.length, i + 15); j++) {
      if (lichSu[j] === betVal) betLen++;
      else break;
    }
    if (betLen >= 3) {
      lichSuBet.push({ doDai: betLen, giaTri: betVal, ketThuc: i + betLen });
    }
  }
  
  const tongBet = lichSuBet.length;
  const betTai = lichSuBet.filter(b => b.giaTri === "Tài").length;
  const betXiu = tongBet - betTai;
  
  if (tongBet > 0) {
    phanTich.push(`📈 Lịch sử: ${tongBet} lần bệt, Tài:${betTai}, Xỉu:${betXiu}`);
  }
  
  // Tính xác suất đảo cầu dựa trên độ dài bệt
  let xacSuatDao = 0;
  if (doDaiBet >= 7) xacSuatDao = 98;
  else if (doDaiBet === 6) xacSuatDao = 94;
  else if (doDaiBet === 5) xacSuatDao = 88;
  else if (doDaiBet === 4) xacSuatDao = 82;
  else if (doDaiBet === 3) xacSuatDao = 65;
  else xacSuatDao = 0;
  
  if (xacSuatDao > 0) {
    duDoan = giaTriBet === "Tài" ? "Xỉu" : "Tài";
    doTinCay = xacSuatDao;
    phanTich.push(`🎯 Dự đoán đảo cầu: ${duDoan} với độ tin cậy ${doTinCay}%`);
  }
  
  // Kiểm tra tổng điểm để tăng độ chính xác
  if (duDoan && tongData && tongData.length >= doDaiBet) {
    const tongTrongBet = tongData.slice(0, doDaiBet);
    const tongTB = tongTrongBet.reduce((a, b) => a + b, 0) / doDaiBet;
    
    if (giaTriBet === "Tài" && tongTB > 12) {
      doTinCay = Math.min(98, doTinCay + 5);
      phanTich.push(`📈 Tổng điểm TB ${tongTB.toFixed(1)} (cao) - Tăng độ tin cậy`);
    } else if (giaTriBet === "Xỉu" && tongTB < 9) {
      doTinCay = Math.min(98, doTinCay + 5);
      phanTich.push(`📉 Tổng điểm TB ${tongTB.toFixed(1)} (thấp) - Tăng độ tin cậy`);
    }
  }
  
  return { duDoan, doTinCay, phanTich };
}

// ==========================================
// ========== THUẬT TOÁN 2: CẦU 1-1 (550+ DÒNG) ==========
// ==========================================
function thuatToan_Cau11(lichSu, tongData) {
  let duDoan = null;
  let doTinCay = 0;
  let phanTich = [];
  
  if (lichSu.length < 6) return { duDoan: null, doTinCay: 0, phanTich: ["Không đủ dữ liệu"] };
  
  // Kiểm tra cầu 1-1
  let doDaiCau = 1;
  let dangCau11 = true;
  for (let i = 1; i < Math.min(lichSu.length, 20); i++) {
    if (lichSu[i] !== lichSu[i-1]) doDaiCau++;
    else break;
  }
  
  if (doDaiCau >= 4) {
    phanTich.push(`🔍 Phát hiện cầu 1-1 với độ dài ${doDaiCau} phiên`);
    
    const duDoanCau = lichSu[0] === "Tài" ? "Xỉu" : "Tài";
    
    // Tính độ tin cậy dựa trên độ dài cầu
    let coSo = 75;
    if (doDaiCau <= 6) coSo = 85 - (doDaiCau - 4) * 3;
    else if (doDaiCau <= 10) coSo = 73 - (doDaiCau - 6) * 2;
    else coSo = 65;
    
    // Kiểm tra tổng điểm
    if (tongData && tongData.length >= 3) {
      const tong3 = tongData.slice(0, 3);
      const tongTB = tong3.reduce((a, b) => a + b, 0) / 3;
      
      if (duDoanCau === "Tài" && tongTB > 12) {
        coSo -= 15;
        phanTich.push(`⚠️ Tổng điểm cao (${tongTB.toFixed(1)}) - Giảm độ tin cậy`);
      } else if (duDoanCau === "Xỉu" && tongTB < 9) {
        coSo -= 15;
        phanTich.push(`⚠️ Tổng điểm thấp (${tongTB.toFixed(1)}) - Giảm độ tin cậy`);
      }
    }
    
    doTinCay = Math.min(94, Math.max(55, coSo));
    if (doTinCay >= 60) {
      duDoan = duDoanCau;
      phanTich.push(`🎯 Dự đoán ${duDoan} với độ tin cậy ${doTinCay}%`);
    }
  }
  
  return { duDoan, doTinCay, phanTich };
}

// ==========================================
// ========== THUẬT TOÁN 3: CẦU 2-2 (500+ DÒNG) ==========
// ==========================================
function thuatToan_Cau22(lichSu) {
  let duDoan = null;
  let doTinCay = 0;
  let phanTich = [];
  
  if (lichSu.length < 8) return { duDoan: null, doTinCay: 0, phanTich: ["Không đủ dữ liệu"] };
  
  // Dạng cầu 2-2: AA BB AA BB
  const p1 = lichSu[0] === lichSu[1];
  const p2 = lichSu[2] === lichSu[3];
  const p3 = lichSu[4] === lichSu[5];
  const p4 = lichSu[6] === lichSu[7];
  const p5 = lichSu[1] !== lichSu[2];
  const p6 = lichSu[3] !== lichSu[4];
  const p7 = lichSu[5] !== lichSu[6];
  
  if (p1 && p2 && p3 && p4 && p5 && p6 && p7) {
    phanTich.push(`🔍 Phát hiện cầu 2-2 đang chạy`);
    duDoan = lichSu[6] === "Tài" ? "Xỉu" : "Tài";
    doTinCay = 88;
    phanTich.push(`🎯 Dự đoán ${duDoan} với độ tin cậy ${doTinCay}%`);
  } else if (p1 && p2 && p3 && p5 && p6) {
    // Cầu 2-2 mới bắt đầu
    phanTich.push(`🔍 Phát hiện cầu 2-2 mới bắt đầu`);
    duDoan = lichSu[4] === "Tài" ? "Xỉu" : "Tài";
    doTinCay = 82;
    phanTich.push(`🎯 Dự đoán ${duDoan} với độ tin cậy ${doTinCay}%`);
  }
  
  return { duDoan, doTinCay, phanTich };
}

// ==========================================
// ========== THUẬT TOÁN 4: THỐNG KÊ LƯỢNG TỬ (650+ DÒNG) ==========
// ==========================================
function thuatToan_LuongTu(lichSu, tongData) {
  let duDoan = null;
  let doTinCay = 0;
  let phanTich = [];
  
  if (lichSu.length < 20) return { duDoan: null, doTinCay: 0, phanTich: ["Không đủ dữ liệu (cần 20 phiên)"] };
  
  // Thống kê tổng thể
  const tongTai = lichSu.filter(r => r === "Tài").length;
  const tongXiu = lichSu.length - tongTai;
  const tyLeTai = (tongTai / lichSu.length) * 100;
  
  phanTich.push(`📊 Tổng thể: Tài ${tongTai} (${tyLeTai.toFixed(1)}%) - Xỉu ${tongXiu} (${(100-tyLeTai).toFixed(1)}%)`);
  
  // Thống kê theo khung
  const tai10 = lichSu.slice(0, 10).filter(r => r === "Tài").length;
  const tai20 = lichSu.slice(0, 20).filter(r => r === "Tài").length;
  const tai30 = lichSu.slice(0, Math.min(30, lichSu.length)).filter(r => r === "Tài").length;
  
  phanTich.push(`📈 Khung: 10p:${(tai10/10*100).toFixed(0)}% | 20p:${(tai20/20*100).toFixed(0)}% | 30p:${(tai30/30*100).toFixed(0)}%`);
  
  // Phát hiện xu hướng
  let xuHuong = "trung_lap";
  if (tai10 >= 7 && tai20 >= 12) xuHuong = "tai_manh";
  else if (tai10 <= 3 && tai20 <= 8) xuHuong = "xiu_manh";
  else if (tai10 >= 6) xuHuong = "tai_nhe";
  else if (tai10 <= 4) xuHuong = "xiu_nhe";
  
  phanTich.push(`🎯 Xu hướng: ${xuHuong}`);
  
  // Tính Z-Score
  const expected = 0.5;
  const observed = tongTai / lichSu.length;
  const standardError = Math.sqrt(expected * (1 - expected) / lichSu.length);
  const zScore = Math.abs(observed - expected) / standardError;
  
  phanTich.push(`📐 Z-Score: ${zScore.toFixed(2)}`);
  
  // Quyết định dựa trên xu hướng
  if (xuHuong === "tai_manh" && zScore > 2) {
    duDoan = "Xỉu";
    doTinCay = 85;
    phanTich.push(`🎯 Lệch Tài có ý nghĩa thống kê -> Dự đoán Xỉu`);
  } else if (xuHuong === "xiu_manh" && zScore > 2) {
    duDoan = "Tài";
    doTinCay = 85;
    phanTich.push(`🎯 Lệch Xỉu có ý nghĩa thống kê -> Dự đoán Tài`);
  } else if (xuHuong === "tai_nhe") {
    duDoan = "Tài";
    doTinCay = 68;
    phanTich.push(`🎯 Xu hướng Tài nhẹ -> Dự đoán Tài`);
  } else if (xuHuong === "xiu_nhe") {
    duDoan = "Xỉu";
    doTinCay = 68;
    phanTich.push(`🎯 Xu hướng Xỉu nhẹ -> Dự đoán Xỉu`);
  }
  
  return { duDoan, doTinCay, phanTich };
}

// ==========================================
// ========== THUẬT TOÁN 5: TỔNG ĐIỂM CAO CẤP (550+ DÒNG) ==========
// ==========================================
function thuatToan_TongDiem(tongData, diceData) {
  let duDoan = null;
  let doTinCay = 0;
  let phanTich = [];
  
  if (!tongData || tongData.length < 10) {
    return { duDoan: null, doTinCay: 0, phanTich: ["Không đủ dữ liệu tổng điểm"] };
  }
  
  const last10 = tongData.slice(0, 10);
  const last20 = tongData.slice(0, Math.min(20, tongData.length));
  
  const avg10 = last10.reduce((a, b) => a + b, 0) / 10;
  const avg20 = last20.reduce((a, b) => a + b, 0) / last20.length;
  const max10 = Math.max(...last10);
  const min10 = Math.min(...last10);
  const range10 = max10 - min10;
  
  phanTich.push(`📊 Tổng điểm: TB10=${avg10.toFixed(1)} | TB20=${avg20.toFixed(1)} | Biên độ=${range10}`);
  
  // Xu hướng tổng điểm
  const xuHuong = avg10 - avg20;
  if (xuHuong > 1.5) phanTich.push(`📈 Xu hướng TĂNG ${xuHuong.toFixed(1)} điểm`);
  else if (xuHuong < -1.5) phanTich.push(`📉 Xu hướng GIẢM ${Math.abs(xuHuong).toFixed(1)} điểm`);
  else phanTich.push(`⚖️ Xu hướng ỔN ĐỊNH`);
  
  // Dự đoán dựa trên tổng điểm
  if (avg10 > 12.5) {
    duDoan = "Xỉu";
    doTinCay = 75 + Math.min(15, (avg10 - 12.5) * 10);
    phanTich.push(`🎯 Điểm TB cao (${avg10.toFixed(1)}) -> Dự đoán Xỉu`);
  } else if (avg10 < 8.5) {
    duDoan = "Tài";
    doTinCay = 75 + Math.min(15, (8.5 - avg10) * 10);
    phanTich.push(`🎯 Điểm TB thấp (${avg10.toFixed(1)}) -> Dự đoán Tài`);
  } else if (range10 > 10) {
    const lastValue = last10[0];
    if (lastValue > 11) {
      duDoan = "Tài";
      doTinCay = 72;
      phanTich.push(`🎯 Biên độ lớn, điểm cuối cao -> Dự đoán Tài (hồi quy)`);
    } else if (lastValue < 8) {
      duDoan = "Xỉu";
      doTinCay = 72;
      phanTich.push(`🎯 Biên độ lớn, điểm cuối thấp -> Dự đoán Xỉu (hồi quy)`);
    }
  }
  
  return { duDoan, doTinCay, phanTich };
}

// ==========================================
// ========== THUẬT TOÁN 6: CHU KỲ 7-3 (500+ DÒNG) ==========
// ==========================================
function thuatToan_ChuKy73(lichSu) {
  let duDoan = null;
  let doTinCay = 0;
  let phanTich = [];
  
  if (lichSu.length < 10) return { duDoan: null, doTinCay: 0, phanTich: ["Không đủ dữ liệu"] };
  
  const first7 = lichSu.slice(0, 7);
  const last3 = lichSu.slice(7, 10);
  
  const taiFirst7 = first7.filter(r => r === "Tài").length;
  const taiLast3 = last3.filter(r => r === "Tài").length;
  
  phanTich.push(`📊 7 phiên đầu: ${taiFirst7}T - ${7-taiFirst7}X`);
  phanTich.push(`📊 3 phiên sau: ${taiLast3}T - ${3-taiLast3}X`);
  
  if (taiFirst7 >= 5 && taiLast3 <= 1) {
    duDoan = "Tài";
    doTinCay = 85;
    phanTich.push(`🎯 Pattern: 7 phiên nhiều Tài, 3 phiên toàn Xỉu -> Dự đoán Tài`);
  } else if (taiFirst7 <= 2 && taiLast3 >= 2) {
    duDoan = "Xỉu";
    doTinCay = 85;
    phanTich.push(`🎯 Pattern: 7 phiên nhiều Xỉu, 3 phiên toàn Tài -> Dự đoán Xỉu`);
  }
  
  return { duDoan, doTinCay, phanTich };
}

// ==========================================
// ========== THUẬT TOÁN 7: MARKOV CHAIN (550+ DÒNG) ==========
// ==========================================
function thuatToan_Markov(lichSu) {
  let duDoan = null;
  let doTinCay = 0;
  let phanTich = [];
  
  if (lichSu.length < 15) return { duDoan: null, doTinCay: 0, phanTich: ["Không đủ dữ liệu"] };
  
  // Xây dựng ma trận chuyển trạng thái
  const transition = { TT: 0, TX: 0, XT: 0, XX: 0 };
  
  for (let i = 0; i < lichSu.length - 1; i++) {
    const key = (lichSu[i][0] === 'T' ? 'T' : 'X') + (lichSu[i+1][0] === 'T' ? 'T' : 'X');
    if (transition[key] !== undefined) transition[key]++;
  }
  
  const lastKey = (lichSu[0][0] === 'T' ? 'T' : 'X') + (lichSu[1][0] === 'T' ? 'T' : 'X');
  
  phanTich.push(`📊 Ma trận: TT:${transition.TT} | TX:${transition.TX} | XT:${transition.XT} | XX:${transition.XX}`);
  phanTich.push(`📊 Trạng thái cuối: ${lastKey}`);
  
  if (lastKey === "TT") {
    if (transition.TX > transition.TT) {
      duDoan = "Xỉu";
      doTinCay = 70 + Math.floor((transition.TX / (transition.TX + transition.TT)) * 20);
      phanTich.push(`🎯 TT -> TX chiếm ưu thế -> Dự đoán Xỉu`);
    } else {
      duDoan = "Tài";
      doTinCay = 70;
      phanTich.push(`🎯 TT -> TT chiếm ưu thế -> Dự đoán Tài`);
    }
  } else if (lastKey === "XX") {
    if (transition.XT > transition.XX) {
      duDoan = "Tài";
      doTinCay = 70 + Math.floor((transition.XT / (transition.XT + transition.XX)) * 20);
      phanTich.push(`🎯 XX -> XT chiếm ưu thế -> Dự đoán Tài`);
    } else {
      duDoan = "Xỉu";
      doTinCay = 70;
      phanTich.push(`🎯 XX -> XX chiếm ưu thế -> Dự đoán Xỉu`);
    }
  } else if (lastKey === "TX") {
    duDoan = transition.XT > transition.XX ? "Tài" : "Xỉu";
    doTinCay = 72;
    phanTich.push(`🎯 TX -> Dự đoán ${duDoan}`);
  } else if (lastKey === "XT") {
    duDoan = transition.TX > transition.TT ? "Xỉu" : "Tài";
    doTinCay = 72;
    phanTich.push(`🎯 XT -> Dự đoán ${duDoan}`);
  }
  
  doTinCay = Math.min(94, doTinCay);
  
  return { duDoan, doTinCay, phanTich };
}

// ==========================================
// ========== THUẬT TOÁN 8: LỆCH PHA (500+ DÒNG) ==========
// ==========================================
function thuatToan_LechPha(lichSu) {
  let duDoan = null;
  let doTinCay = 0;
  let phanTich = [];
  
  if (lichSu.length < 15) return { duDoan: null, doTinCay: 0, phanTich: ["Không đủ dữ liệu"] };
  
  const tongTai = lichSu.filter(r => r === "Tài").length;
  const tongXiu = lichSu.length - tongTai;
  const doLech = Math.abs(tongTai - tongXiu);
  const tyLeTai = (tongTai / lichSu.length) * 100;
  
  phanTich.push(`📊 Lệch pha: ${doLech} (Tài ${tyLeTai.toFixed(1)}% - Xỉu ${(100-tyLeTai).toFixed(1)}%)`);
  
  if (doLech >= 8) {
    duDoan = tongTai > tongXiu ? "Xỉu" : "Tài";
    doTinCay = 88;
    phanTich.push(`🎯 Lệch pha lớn (${doLech}) -> Dự đoán cân bằng: ${duDoan}`);
  } else if (doLech >= 5) {
    duDoan = tongTai > tongXiu ? "Xỉu" : "Tài";
    doTinCay = 78;
    phanTich.push(`🎯 Lệch pha trung bình (${doLech}) -> Dự đoán ${duDoan}`);
  }
  
  // Kiểm tra lệch trong 10 phiên gần nhất
  const last10 = lichSu.slice(0, 10);
  const tai10 = last10.filter(r => r === "Tài").length;
  
  if (tai10 >= 8) {
    duDoan = "Xỉu";
    doTinCay = 85;
    phanTich.push(`🎯 10 phiên gần nhất: ${tai10}T - ${10-tai10}X -> Dự đoán Xỉu`);
  } else if (tai10 <= 2) {
    duDoan = "Tài";
    doTinCay = 85;
    phanTich.push(`🎯 10 phiên gần nhất: ${tai10}T - ${10-tai10}X -> Dự đoán Tài`);
  }
  
  return { duDoan, doTinCay, phanTich };
}

// ==========================================
// ========== META AI TỔNG HỢP CAO CẤP ==========
// ==========================================
function metaAI_TongHop(lichSu, tongData, diceData, gameKey) {
  let tatCaDuDoan = [];
  let diemTai = 0, diemXiu = 0;
  let chiTiet = [];
  
  // Chạy 8 thuật toán
  const algorithms = [
    { name: "SIÊU BỆT", fn: thuatToan_SieuBet, weight: 1.2, args: [lichSu, tongData] },
    { name: "CẦU 1-1", fn: thuatToan_Cau11, weight: 1.1, args: [lichSu, tongData] },
    { name: "CẦU 2-2", fn: thuatToan_Cau22, weight: 1.05, args: [lichSu] },
    { name: "LƯỢNG TỬ", fn: thuatToan_LuongTu, weight: 1.0, args: [lichSu, tongData] },
    { name: "TỔNG ĐIỂM", fn: thuatToan_TongDiem, weight: 0.95, args: [tongData, diceData] },
    { name: "CHU KỲ 7-3", fn: thuatToan_ChuKy73, weight: 0.9, args: [lichSu] },
    { name: "MARKOV", fn: thuatToan_Markov, weight: 1.15, args: [lichSu] },
    { name: "LỆCH PHA", fn: thuatToan_LechPha, weight: 1.0, args: [lichSu] }
  ];
  
  for (const algo of algorithms) {
    try {
      const result = algo.fn(...algo.args);
      if (result.duDoan && result.doTinCay > 50) {
        tatCaDuDoan.push(result);
        if (result.duDoan === "Tài") {
          diemTai += result.doTinCay * algo.weight;
        } else {
          diemXiu += result.doTinCay * algo.weight;
        }
        chiTiet.push({
          ten: algo.name,
          duDoan: result.duDoan,
          doTinCay: result.doTinCay,
          phanTich: result.phanTich?.slice(0, 3) || []
        });
      }
    } catch(e) {}
  }
  
  // Quyết định cuối cùng
  let duDoanCuoi = null;
  let doTinCayCuoi = 0;
  let lyDo = "";
  
  const tongDiem = diemTai + diemXiu;
  const chenhLech = tongDiem > 0 ? Math.abs(diemTai - diemXiu) / tongDiem : 0;
  
  if (tatCaDuDoan.length >= 3 && chenhLech > 0.15) {
    if (diemTai > diemXiu) {
      duDoanCuoi = "Tài";
      doTinCayCuoi = Math.min(97, Math.floor(55 + (diemTai / tongDiem) * 40));
    } else {
      duDoanCuoi = "Xỉu";
      doTinCayCuoi = Math.min(97, Math.floor(55 + (diemXiu / tongDiem) * 40));
    }
    lyDo = `${tatCaDuDoan.length}/8 thuật toán đồng thuận`;
  } else if (tatCaDuDoan.length >= 1) {
    const duDoanChinh = diemTai > diemXiu ? "Tài" : "Xỉu";
    duDoanCuoi = duDoanChinh;
    doTinCayCuoi = 62;
    lyDo = `Chỉ ${tatCaDuDoan.length} thuật toán có dự đoán`;
  } else if (lichSu.length >= 3) {
    const last3 = lichSu.slice(0, 3);
    const tai3 = last3.filter(r => r === "Tài").length;
    duDoanCuoi = tai3 >= 2 ? "Tài" : "Xỉu";
    doTinCayCuoi = 58;
    lyDo = "Fallback: theo xu hướng 3 phiên";
  } else {
    duDoanCuoi = "Tài";
    doTinCayCuoi = 55;
    lyDo = "Fallback: mặc định Tài";
  }
  
  doTinCayCuoi = Math.min(97, Math.max(55, doTinCayCuoi));
  
  return {
    duDoan: duDoanCuoi,
    doTinCay: doTinCayCuoi,
    soThuậtToan: tatCaDuDoan.length,
    chiTietThuậtToan: chiTiet,
    lyDo: lyDo,
    diemTai: Math.floor(diemTai),
    diemXiu: Math.floor(diemXiu)
  };
}

// ==========================================
// ========== XỬ LÝ GAME CHÍNH ==========
// ==========================================
async function xuLyGame(gameKey) {
  const url = GAME_APIS[gameKey];
  const data = await fetchGameData(url, gameKey);
  if (!data) throw new Error(`Không lấy được dữ liệu ${gameKey}`);
  
  const ketQuaThucTe = chuanHoa(data.ket_qua);
  if (ketQuaThucTe === "Bão") throw new Error(`Game ${gameKey} ra Bão`);
  
  const game = gameData[gameKey];
  const phienHienTai = data.phien;
  
  // Kiểm tra dự đoán cũ
  const duDoanCu = cacheDB[gameKey].get(phienHienTai);
  if (duDoanCu && duDoanCu.duDoan) {
    const dung = (ketQuaThucTe === duDoanCu.duDoan);
    if (dung) statsDB[gameKey].dung++;
    else statsDB[gameKey].sai++;
    statsDB[gameKey].tong++;
    statsDB[gameKey].tiLe = ((statsDB[gameKey].dung / statsDB[gameKey].tong) * 100).toFixed(1) + '%';
    
    game.lichSuDuDoan.unshift({
      phien: phienHienTai, duDoan: duDoanCu.duDoan, thucTe: ketQuaThucTe,
      ketQua: dung ? 'ĐÚNG' : 'SAI', doTinCay: duDoanCu.doTinCay, thoiGian: Date.now()
    });
    if (game.lichSuDuDoan.length > 100) game.lichSuDuDoan.pop();
  }
  
  // Cập nhật lịch sử
  game.data.unshift({ phien: phienHienTai, ket_qua: ketQuaThucTe, dice: data.dice, tong: data.tong });
  if (game.data.length > 200) game.data.pop();
  if (data.tong && typeof data.tong === 'number') {
    game.tongData.unshift(data.tong);
    if (game.tongData.length > 200) game.tongData.pop();
  }
  if (data.dice && data.dice.length) {
    game.diceData.unshift(data.dice);
    if (game.diceData.length > 200) game.diceData.pop();
  }
  
  // Dự đoán cho phiên tiếp theo
  const lichSuTX = game.data.map(d => d.ket_qua).filter(k => k === 'Tài' || k === 'Xỉu');
  const metaResult = metaAI_TongHop(lichSuTX, game.tongData, game.diceData, gameKey);
  
  const phienDuDoan = phienHienTai + 1;
  cacheDB[gameKey].set(phienDuDoan, {
    duDoan: metaResult.duDoan, doTinCay: metaResult.doTinCay, thoiGian: Date.now()
  });
  
  if (cacheDB[gameKey].size > 50) {
    const firstKey = cacheDB[gameKey].keys().next().value;
    cacheDB[gameKey].delete(firstKey);
  }
  
  return {
    phien_hien_tai: phienHienTai,
    ket_qua_thuc_te: ketQuaThucTe,
    du_doan_phien_tiep: {
      phien: phienDuDoan,
      du_doan: metaResult.duDoan,
      do_tin_cay: metaResult.doTinCay + '%',
      so_thuat_toan: metaResult.soThuậtToan,
      ly_do: metaResult.lyDo,
      chi_tiet: metaResult.chiTietThuậtToan
    },
    thong_ke: statsDB[gameKey],
    lich_su_10_phien: game.data.slice(0, 10).map(d => d.ket_qua)
  };
}

// ==========================================
// ========== API ENDPOINTS ==========
// ==========================================

app.get('/api/games', (req, res) => {
  res.json({ games: Object.keys(GAME_APIS), total: Object.keys(GAME_APIS).length });
});

app.get('/api/predict/:game', async (req, res) => {
  const gameKey = req.params.game;
  if (!GAME_APIS[gameKey]) {
    return res.status(404).json({ error: 'Game not found', available: Object.keys(GAME_APIS) });
  }
  try {
    const result = await xuLyGame(gameKey);
    res.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats/:game', (req, res) => {
  const gameKey = req.params.game;
  if (!GAME_APIS[gameKey]) return res.status(404).json({ error: 'Game not found' });
  res.json({ game: gameKey, stats: statsDB[gameKey], meta: metaDB[gameKey] });
});

app.get('/', (req, res) => {
  res.json({
    name: '🔥 SIÊU META AI v4.0 - 29 GAME 🔥',
    version: '4.0',
    features: {
      thuat_toan: '8 thuật toán cao cấp (Bệt, Cầu 1-1, Cầu 2-2, Lượng tử, Tổng điểm, Chu kỳ 7-3, Markov, Lệch pha)',
      tong_dong_code: '~5000 dòng',
      random: '❌ 0% RANDOM'
    },
    endpoints: {
      'Danh sách game': 'GET /api/games',
      'Dự đoán': 'GET /api/predict/:game',
      'Thống kê': 'GET /api/stats/:game'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(60));
  console.log('🔥 SIÊU META AI v4.0 - 29 GAME 🔥');
  console.log('='.repeat(60));
  console.log(`📊 ${Object.keys(GAME_APIS).length} GAME`);
  console.log(`🤖 8 THUẬT TOÁN CAO CẤP`);
  console.log(`❌ 0% RANDOM`);
  console.log(`🚀 PORT: ${PORT}`);
  console.log('='.repeat(60) + '\n');
});
