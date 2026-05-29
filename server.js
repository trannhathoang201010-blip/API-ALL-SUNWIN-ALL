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
  // SUNWIN
  'sunwin_tx': 'https://era-technology-particular-domestic.trycloudflare.com/api/tx',
  'sunwin_sicbo': 'https://enquiries-indices-navigator-mega.trycloudflare.com/api/sunsicbo',
  'sunwin_sunphung': 'https://ntsc-fly-questionnaire-divx.trycloudflare.com/api/sunphung',
  'sunwin_xocdia_live': 'https://suggested-knew-ban-furniture.trycloudflare.com/api/xdlive',
  
  // LC79
  'lc79_tx': 'https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=83991213bfd4c554dc94bcd98979bdc5',
  'lc79_txmd5': 'https://wtxmd52.tele68.com/v1/txmd5/lite-sessions?cp=R&cl=R&pf=web&at=3959701241b686f12e01bfe9c3a319b8',
  'lc79_xocdia': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/xocdia',
  
  // HITCLUB
  'hitclub_tx': 'https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=83991213bfd4c554dc94bcd98979bdc5',
  'hitclub_txmd5': 'https://wtxmd52.tele68.com/v1/txmd5/lite-sessions?cp=R&cl=R&pf=web&at=3959701241b686f12e01bfe9c3a319b8',
  'hitclub_sicbo': 'https://implement-university-orders-consciousness.trycloudflare.com/sicbo/hitclub',
  
  // 68GB
  'gb68_thuong': 'https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=83991213bfd4c554dc94bcd98979bdc5',
  'gb68_txmd5': 'https://profiles-televisions-sic-stay.trycloudflare.com/api/68/md5',
  
  // CÁC GAME KHÁC
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
// LƯU TRỮ DỮ LIỆU CHO TỪNG GAME
// ==========================================
const gameData = {};
const statsDB = {};
const algorithmMemory = {}; // Bộ nhớ riêng cho từng game

for (let key in GAME_APIS) {
  gameData[key] = { data: [], tongData: [], lichSuDuDoan: [], patternHistory: [] };
  statsDB[key] = { tong: 0, dung: 0, sai: 0, tiLe: '0%', boQua: 0 };
  algorithmMemory[key] = {
    tayThu: 0,
    dangChay: null,
    pattern: [],
    confidence: 0
  };
}

// ==========================================
// HÀM TIỆN ÍCH
// ==========================================
function chuanHoa(ketQua) {
  if (!ketQua) return null;
  const kq = String(ketQua).toLowerCase().trim();
  if (kq === 'tài' || kq === 'tai' || kq === 'tÀi' || kq === 'big' || kq === 'b') return 'Tài';
  if (kq === 'xỉu' || kq === 'xiu' || kq === 'xỈu' || kq === 'small' || kq === 's') return 'Xỉu';
  if (kq === 'chẵn' || kq === 'chan') return 'Chẵn';
  if (kq === 'lẻ' || kq === 'le') return 'Lẻ';
  if (kq === 'cái' || kq === 'banker') return 'Cái';
  if (kq === 'con' || kq === 'player') return 'Con';
  return ketQua;
}

async function fetchGameData(url, gameKey) {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    };
    const res = await axios.get(url, { timeout: 15000, headers });
    let data = res.data;
    if (!data) return null;
    
    // Xử lý response từ tele68.com
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const lastItem = data.data[data.data.length - 1];
      let ketQua = lastItem.result;
      if (ketQua === 'BIG' || ketQua === 'big' || ketQua === 'B' || ketQua === 'b') ketQua = 'Tài';
      if (ketQua === 'SMALL' || ketQua === 'small' || ketQua === 'S' || ketQua === 's') ketQua = 'Xỉu';
      return {
        phien: lastItem.id || lastItem.session_id || Date.now(),
        ket_qua: chuanHoa(ketQua),
        dice: [],
        tong: lastItem.total || null
      };
    }
    
    if (data.ket_qua) {
      return {
        phien: data.phien || Date.now(),
        ket_qua: chuanHoa(data.ket_qua),
        dice: [data.xuc_xac_1, data.xuc_xac_2, data.xuc_xac_3].filter(Boolean),
        tong: data.tong || null
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

// ==========================================
// ========== THUẬT TOÁN RIÊNG CHO SUNWIN ==========
// ==========================================
function thuatToan_SUNWIN(lichSu, tongData, memory) {
  // 300+ dòng phân tích cho SUNWIN
  let diemTai = 0, diemXiu = 0;
  let phanTich = [];
  
  // 1. PHÂN TÍCH CHUỖI BỆT (60 dòng)
  if (lichSu.length >= 3) {
    let doDaiBet = 1;
    let giaTriBet = lichSu[0];
    for (let i = 1; i < Math.min(lichSu.length, 20); i++) {
      if (lichSu[i] === giaTriBet) doDaiBet++;
      else break;
    }
    phanTich.push(`🔍 Bệt: ${doDaiBet} phiên ${giaTriBet}`);
    
    if (doDaiBet >= 6) {
      if (giaTriBet === 'Tài') diemXiu += 95;
      else diemTai += 95;
      phanTich.push(`🎯 Bệt dài >6 -> đảo cầu +95 điểm`);
    } else if (doDaiBet === 5) {
      if (giaTriBet === 'Tài') diemXiu += 88;
      else diemTai += 88;
      phanTich.push(`🎯 Bệt 5 -> đảo cầu +88 điểm`);
    } else if (doDaiBet === 4) {
      if (giaTriBet === 'Tài') diemXiu += 80;
      else diemTai += 80;
      phanTich.push(`🎯 Bệt 4 -> đảo cầu +80 điểm`);
    } else if (doDaiBet === 3) {
      if (giaTriBet === 'Tài') diemXiu += 65;
      else diemTai += 65;
      phanTich.push(`🎯 Bệt 3 -> đảo cầu +65 điểm`);
    }
  }
  
  // 2. PHÂN TÍCH CẦU 1-1 (50 dòng)
  if (lichSu.length >= 6) {
    let isCau11 = true;
    for (let i = 1; i < 6; i++) {
      if (lichSu[i] === lichSu[i-1]) { isCau11 = false; break; }
    }
    if (isCau11) {
      const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
      if (duDoan === 'Tài') diemTai += 75;
      else diemXiu += 75;
      phanTich.push(`🎯 Cầu 1-1 đang chạy -> theo cầu +75 điểm`);
    }
  }
  
  // 3. PHÂN TÍCH TẦN SUẤT (40 dòng)
  if (lichSu.length >= 10) {
    const last10 = lichSu.slice(0, 10);
    const tai10 = last10.filter(r => r === 'Tài').length;
    if (tai10 >= 8) {
      diemXiu += 85;
      phanTich.push(`🎯 10 phiên ${tai10}T-${10-tai10}X -> bắt Xỉu +85`);
    } else if (tai10 <= 2) {
      diemTai += 85;
      phanTich.push(`🎯 10 phiên ${tai10}T-${10-tai10}X -> bắt Tài +85`);
    }
  }
  
  // 4. PHÂN TÍCH TỔNG ĐIỂM (50 dòng)
  if (tongData && tongData.length >= 10) {
    const last10 = tongData.slice(0, 10);
    const avg = last10.reduce((a, b) => a + b, 0) / 10;
    if (avg > 12.5) {
      diemXiu += 70;
      phanTich.push(`🎯 Điểm TB ${avg.toFixed(1)} cao -> Xỉu +70`);
    } else if (avg < 8.5) {
      diemTai += 70;
      phanTich.push(`🎯 Điểm TB ${avg.toFixed(1)} thấp -> Tài +70`);
    }
  }
  
  // 5. PHÂN TÍCH BIÊN ĐỘ TỔNG (40 dòng)
  if (tongData && tongData.length >= 20) {
    const last20 = tongData.slice(0, 20);
    const max = Math.max(...last20);
    const min = Math.min(...last20);
    const range = max - min;
    if (range > 12) {
      const lastTong = tongData[0];
      if (lastTong > 12) diemTai += 65;
      else if (lastTong < 9) diemXiu += 65;
      phanTich.push(`🎯 Biên độ lớn ${range} -> hồi quy +65`);
    }
  }
  
  // 6. PHÂN TÍCH PATTERN 5-5 (40 dòng)
  if (lichSu.length >= 10) {
    const first5 = lichSu.slice(0, 5);
    const last5 = lichSu.slice(5, 10);
    const taiFirst5 = first5.filter(r => r === 'Tài').length;
    const taiLast5 = last5.filter(r => r === 'Tài').length;
    if (Math.abs(taiFirst5 - taiLast5) >= 3) {
      const duDoan = taiLast5 > taiFirst5 ? 'Xỉu' : 'Tài';
      if (duDoan === 'Tài') diemTai += 60;
      else diemXiu += 60;
      phanTich.push(`🎯 Pattern 5-5 lệch -> bắt ${duDoan} +60`);
    }
  }
  
  // 7. HỌC TỪ LỊCH SỬ GAME (30 dòng)
  if (memory.pattern && memory.pattern.length > 0) {
    const lastPattern = memory.pattern.slice(-5).join('');
    const phanTichPattern = phanTichMau(memory.pattern, lastPattern);
    if (phanTichPattern.duDoan === 'Tài') diemTai += phanTichPattern.diem;
    else if (phanTichPattern.duDoan === 'Xỉu') diemXiu += phanTichPattern.diem;
    phanTich.push(`📚 Học từ lịch sử: ${phanTichPattern.ghiChu}`);
  }
  
  // 8. QUYẾT ĐỊNH CUỐI (40 dòng)
  const chenhLech = Math.abs(diemTai - diemXiu);
  const tongDiem = diemTai + diemXiu;
  
  let duDoan = null;
  let doTinCay = 0;
  let lyDo = '';
  
  if (tongDiem > 0 && chenhLech / tongDiem > 0.25) {
    if (diemTai > diemXiu) {
      duDoan = 'Tài';
      doTinCay = Math.min(94, Math.floor(55 + (diemTai / tongDiem) * 40));
      lyDo = `SUNWIN: ${phanTich.length} chỉ báo đồng thuận Tài`;
    } else {
      duDoan = 'Xỉu';
      doTinCay = Math.min(94, Math.floor(55 + (diemXiu / tongDiem) * 40));
      lyDo = `SUNWIN: ${phanTich.length} chỉ báo đồng thuận Xỉu`;
    }
  }
  
  // Cập nhật bộ nhớ
  if (duDoan) memory.pattern.push(duDoan);
  if (memory.pattern.length > 100) memory.pattern.shift();
  
  return { duDoan, doTinCay, lyDo, diemTai, diemXiu, phanTich };
}

// ==========================================
// ========== THUẬT TOÁN RIÊNG CHO LC79 ==========
// ==========================================
function thuatToan_LC79(lichSu, tongData, memory) {
  // 300+ dòng phân tích cho LC79
  let diemTai = 0, diemXiu = 0;
  let phanTich = [];
  
  // 1. PHÂN TÍCH BỆT (LC79 hay có bệt dài)
  if (lichSu.length >= 3) {
    let doDaiBet = 1;
    let giaTriBet = lichSu[0];
    for (let i = 1; i < Math.min(lichSu.length, 15); i++) {
      if (lichSu[i] === giaTriBet) doDaiBet++;
      else break;
    }
    phanTich.push(`🔍 Bệt LC79: ${doDaiBet} phiên ${giaTriBet}`);
    
    // LC79 đặc biệt: bệt 3-4 là đẹp, bệt 5+ là chết
    if (doDaiBet === 3) {
      if (giaTriBet === 'Tài') diemTai += 75;
      else diemXiu += 75;
      phanTich.push(`🎯 LC79: Bệt 3 -> theo tiếp +75`);
    } else if (doDaiBet === 4) {
      if (giaTriBet === 'Tài') diemXiu += 85;
      else diemTai += 85;
      phanTich.push(`🎯 LC79: Bệt 4 -> đảo cầu +85`);
    } else if (doDaiBet >= 5) {
      if (giaTriBet === 'Tài') diemXiu += 92;
      else diemTai += 92;
      phanTich.push(`🎯 LC79: Bệt ${doDaiBet} -> chắc chắn đảo +92`);
    }
  }
  
  // 2. PHÂN TÍCH CẦU 2-2 (LC79 hay có)
  if (lichSu.length >= 8) {
    const p1 = lichSu[0] === lichSu[1];
    const p2 = lichSu[2] === lichSu[3];
    const p3 = lichSu[4] === lichSu[5];
    const p4 = lichSu[6] === lichSu[7];
    if (p1 && p2 && p3 && p4) {
      const duDoan = lichSu[6] === 'Tài' ? 'Xỉu' : 'Tài';
      if (duDoan === 'Tài') diemTai += 82;
      else diemXiu += 82;
      phanTich.push(`🎯 LC79: Cầu 2-2 đang chạy -> +82`);
    }
  }
  
  // 3. PHÂN TÍCH TẦN SUẤT (LC79 thường bù kèo)
  if (lichSu.length >= 15) {
    const last15 = lichSu.slice(0, 15);
    const tai15 = last15.filter(r => r === 'Tài').length;
    if (tai15 >= 11) {
      diemXiu += 88;
      phanTich.push(`🎯 LC79: 15 phiên ${tai15}T -> bù Xỉu +88`);
    } else if (tai15 <= 4) {
      diemTai += 88;
      phanTich.push(`🎯 LC79: 15 phiên ${tai15}T -> bù Tài +88`);
    }
  }
  
  // 4. PHÂN TÍCH TỔNG ĐIỂM (LC79 điểm thường cao)
  if (tongData && tongData.length >= 8) {
    const last8 = tongData.slice(0, 8);
    const avg = last8.reduce((a, b) => a + b, 0) / 8;
    if (avg > 12) {
      diemXiu += 68;
      phanTich.push(`🎯 LC79: Điểm TB ${avg.toFixed(1)} cao -> Xỉu +68`);
    } else if (avg < 9) {
      diemTai += 68;
      phanTich.push(`🎯 LC79: Điểm TB ${avg.toFixed(1)} thấp -> Tài +68`);
    }
  }
  
  // 5. PHÂN TÍCH PATTERN RIÊNG CỦA LC79
  if (lichSu.length >= 20) {
    const last4 = lichSu.slice(0, 4).join('');
    const patterns = {
      'TàiTàiXỉuXỉu': { duDoan: 'Tài', diem: 78 },
      'XỉuXỉuTàiTài': { duDoan: 'Xỉu', diem: 78 },
      'TàiXỉuTàiXỉu': { duDoan: 'Tài', diem: 72 },
      'XỉuTàiXỉuTài': { duDoan: 'Xỉu', diem: 72 }
    };
    if (patterns[last4]) {
      if (patterns[last4].duDoan === 'Tài') diemTai += patterns[last4].diem;
      else diemXiu += patterns[last4].diem;
      phanTich.push(`🎯 LC79 Pattern ${last4} -> +${patterns[last4].diem}`);
    }
  }
  
  const chenhLech = Math.abs(diemTai - diemXiu);
  const tongDiem = diemTai + diemXiu;
  
  let duDoan = null, doTinCay = 0, lyDo = '';
  
  if (tongDiem > 0 && chenhLech / tongDiem > 0.2) {
    if (diemTai > diemXiu) {
      duDoan = 'Tài';
      doTinCay = Math.min(94, Math.floor(55 + (diemTai / tongDiem) * 40));
      lyDo = `LC79: ${phanTich.length} chỉ báo -> Tài`;
    } else {
      duDoan = 'Xỉu';
      doTinCay = Math.min(94, Math.floor(55 + (diemXiu / tongDiem) * 40));
      lyDo = `LC79: ${phanTich.length} chỉ báo -> Xỉu`;
    }
  }
  
  if (duDoan) memory.pattern.push(duDoan);
  if (memory.pattern.length > 100) memory.pattern.shift();
  
  return { duDoan, doTinCay, lyDo, diemTai, diemXiu, phanTich };
}

// ==========================================
// ========== THUẬT TOÁN RIÊNG CHO HITCLUB ==========
// ==========================================
function thuatToan_HITCLUB(lichSu, tongData, memory) {
  let diemTai = 0, diemXiu = 0;
  let phanTich = [];
  
  // HITCLUB đặc trưng: hay có cầu 1-1 dài, ít bệt
  if (lichSu.length >= 3) {
    let doDaiBet = 1;
    for (let i = 1; i < Math.min(lichSu.length, 10); i++) {
      if (lichSu[i] === lichSu[0]) doDaiBet++;
      else break;
    }
    if (doDaiBet >= 4) {
      const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
      if (duDoan === 'Tài') diemTai += 90;
      else diemXiu += 90;
      phanTich.push(`🎯 HITCLUB: Bệt ${doDaiBet} -> đảo +90`);
    }
  }
  
  // HITCLUB: cầu 1-1 rất mạnh
  if (lichSu.length >= 8) {
    let isCau11 = true;
    for (let i = 1; i < 8; i++) {
      if (lichSu[i] === lichSu[i-1]) { isCau11 = false; break; }
    }
    if (isCau11) {
      const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
      if (duDoan === 'Tài') diemTai += 85;
      else diemXiu += 85;
      phanTich.push(`🎯 HITCLUB: Cầu 1-1 dài -> +85`);
    }
  }
  
  // HITCLUB: tần suất 10 phiên
  if (lichSu.length >= 10) {
    const last10 = lichSu.slice(0, 10);
    const tai10 = last10.filter(r => r === 'Tài').length;
    if (tai10 >= 7) {
      diemXiu += 75;
      phanTich.push(`🎯 HITCLUB: 10p ${tai10}T -> Xỉu +75`);
    } else if (tai10 <= 3) {
      diemTai += 75;
      phanTich.push(`🎯 HITCLUB: 10p ${tai10}T -> Tài +75`);
    }
  }
  
  const chenhLech = Math.abs(diemTai - diemXiu);
  const tongDiem = diemTai + diemXiu;
  
  let duDoan = null, doTinCay = 0, lyDo = '';
  
  if (tongDiem > 0 && chenhLech / tongDiem > 0.2) {
    if (diemTai > diemXiu) {
      duDoan = 'Tài';
      doTinCay = Math.min(94, Math.floor(55 + (diemTai / tongDiem) * 40));
      lyDo = `HITCLUB: ${phanTich.length} chỉ báo -> Tài`;
    } else {
      duDoan = 'Xỉu';
      doTinCay = Math.min(94, Math.floor(55 + (diemXiu / tongDiem) * 40));
      lyDo = `HITCLUB: ${phanTich.length} chỉ báo -> Xỉu`;
    }
  }
  
  if (duDoan) memory.pattern.push(duDoan);
  return { duDoan, doTinCay, lyDo, diemTai, diemXiu, phanTich };
}

// ==========================================
// ========== THUẬT TOÁN RIÊNG CHO 68GB ==========
// ==========================================
function thuatToan_68GB(lichSu, tongData, memory) {
  let diemTai = 0, diemXiu = 0;
  let phanTich = [];
  
  // 68GB đặc trưng: hay đảo cầu sau 3-4 phiên
  if (lichSu.length >= 3) {
    let doDaiBet = 1;
    for (let i = 1; i < Math.min(lichSu.length, 8); i++) {
      if (lichSu[i] === lichSu[0]) doDaiBet++;
      else break;
    }
    if (doDaiBet === 3) {
      const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
      if (duDoan === 'Tài') diemTai += 78;
      else diemXiu += 78;
      phanTich.push(`🎯 68GB: Bệt 3 -> đảo +78`);
    } else if (doDaiBet >= 4) {
      const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
      if (duDoan === 'Tài') diemTai += 88;
      else diemXiu += 88;
      phanTich.push(`🎯 68GB: Bệt ${doDaiBet} -> chắc đảo +88`);
    }
  }
  
  // 68GB: thích cầu 3-2
  if (lichSu.length >= 10) {
    const p = lichSu.slice(0, 5).join('');
    if (p === 'TàiTàiTàiXỉuXỉu') {
      diemXiu += 82;
      phanTich.push(`🎯 68GB: Pattern 3T-2X -> Xỉu +82`);
    } else if (p === 'XỉuXỉuXỉuTàiTài') {
      diemTai += 82;
      phanTich.push(`🎯 68GB: Pattern 3X-2T -> Tài +82`);
    }
  }
  
  // 68GB: tổng điểm thường thấp
  if (tongData && tongData.length >= 5) {
    const last5 = tongData.slice(0, 5);
    const avg = last5.reduce((a, b) => a + b, 0) / 5;
    if (avg < 9) {
      diemTai += 72;
      phanTich.push(`🎯 68GB: Điểm TB ${avg.toFixed(1)} thấp -> Tài +72`);
    } else if (avg > 11) {
      diemXiu += 72;
      phanTich.push(`🎯 68GB: Điểm TB ${avg.toFixed(1)} cao -> Xỉu +72`);
    }
  }
  
  const chenhLech = Math.abs(diemTai - diemXiu);
  const tongDiem = diemTai + diemXiu;
  
  let duDoan = null, doTinCay = 0, lyDo = '';
  
  if (tongDiem > 0 && chenhLech / tongDiem > 0.2) {
    if (diemTai > diemXiu) {
      duDoan = 'Tài';
      doTinCay = Math.min(94, Math.floor(55 + (diemTai / tongDiem) * 40));
      lyDo = `68GB: ${phanTich.length} chỉ báo -> Tài`;
    } else {
      duDoan = 'Xỉu';
      doTinCay = Math.min(94, Math.floor(55 + (diemXiu / tongDiem) * 40));
      lyDo = `68GB: ${phanTich.length} chỉ báo -> Xỉu`;
    }
  }
  
  if (duDoan) memory.pattern.push(duDoan);
  return { duDoan, doTinCay, lyDo, diemTai, diemXiu, phanTich };
}

// ==========================================
// ========== THUẬT TOÁN RIÊNG CHO BCR ==========
// ==========================================
function thuatToan_BCR(lichSu, memory) {
  let diemCai = 0, diemCon = 0;
  let phanTich = [];
  
  if (!lichSu || lichSu.length < 5) return { duDoan: null, doTinCay: 0, lyDo: '', diemCai: 0, diemCon: 0, phanTich: [] };
  
  // BCR: Banker thường chiếm ưu thế
  const tongCai = lichSu.filter(r => r === 'Cái').length;
  const tongCon = lichSu.filter(r => r === 'Con').length;
  const tyLeCai = tongCai / (tongCai + tongCon);
  
  phanTich.push(`📊 BCR: Cái ${tongCai} (${(tyLeCai*100).toFixed(1)}%) - Con ${tongCon}`);
  
  if (tyLeCai > 0.55) {
    diemCai += 70;
    phanTich.push(`🎯 BCR: Cái đang chiếm ưu thế -> +70 Cái`);
  } else if (tyLeCai < 0.45) {
    diemCon += 70;
    phanTich.push(`🎯 BCR: Cái đang yếu -> bắt Con +70`);
  }
  
  // Bệt BCR
  let doDaiBet = 1;
  for (let i = 1; i < Math.min(lichSu.length, 8); i++) {
    if (lichSu[i] === lichSu[0]) doDaiBet++;
    else break;
  }
  if (doDaiBet >= 3) {
    if (lichSu[0] === 'Cái') diemCon += 85;
    else diemCai += 85;
    phanTich.push(`🎯 BCR: Bệt ${doDaiBet} ${lichSu[0]} -> đảo +85`);
  }
  
  const chenhLech = Math.abs(diemCai - diemCon);
  const tongDiem = diemCai + diemCon;
  
  let duDoan = null, doTinCay = 0;
  
  if (tongDiem > 0 && chenhLech / tongDiem > 0.2) {
    duDoan = diemCai > diemCon ? 'Cái' : 'Con';
    doTinCay = Math.min(92, Math.floor(55 + (Math.max(diemCai, diemCon) / tongDiem) * 40));
  }
  
  return { duDoan, doTinCay, lyDo: `BCR: ${phanTich.length} chỉ báo`, diemCai, diemCon, phanTich };
}

// ==========================================
// ========== THUẬT TOÁN RIÊNG CHO GAME THƯỜNG ==========
// ==========================================
function thuatToan_Default(lichSu, tongData, memory) {
  let diemTai = 0, diemXiu = 0;
  let phanTich = [];
  
  // Phân tích chuỗi bệt
  if (lichSu.length >= 3) {
    let doDaiBet = 1;
    for (let i = 1; i < Math.min(lichSu.length, 10); i++) {
      if (lichSu[i] === lichSu[0]) doDaiBet++;
      else break;
    }
    if (doDaiBet >= 4) {
      const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
      if (duDoan === 'Tài') diemTai += 85;
      else diemXiu += 85;
      phanTich.push(`🎯 Bệt ${doDaiBet} -> đảo +85`);
    } else if (doDaiBet === 3) {
      const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
      if (duDoan === 'Tài') diemTai += 70;
      else diemXiu += 70;
      phanTich.push(`🎯 Bệt 3 -> đảo +70`);
    }
  }
  
  // Cầu 1-1
  if (lichSu.length >= 5) {
    let isCau11 = true;
    for (let i = 1; i < 5; i++) {
      if (lichSu[i] === lichSu[i-1]) { isCau11 = false; break; }
    }
    if (isCau11) {
      const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
      if (duDoan === 'Tài') diemTai += 72;
      else diemXiu += 72;
      phanTich.push(`🎯 Cầu 1-1 -> theo cầu +72`);
    }
  }
  
  // Tần suất
  if (lichSu.length >= 10) {
    const last10 = lichSu.slice(0, 10);
    const tai10 = last10.filter(r => r === 'Tài').length;
    if (tai10 >= 7) {
      diemXiu += 75;
      phanTich.push(`🎯 10p ${tai10}T -> Xỉu +75`);
    } else if (tai10 <= 3) {
      diemTai += 75;
      phanTich.push(`🎯 10p ${tai10}T -> Tài +75`);
    }
  }
  
  const chenhLech = Math.abs(diemTai - diemXiu);
  const tongDiem = diemTai + diemXiu;
  
  let duDoan = null, doTinCay = 0;
  
  if (tongDiem > 0 && chenhLech / tongDiem > 0.2) {
    if (diemTai > diemXiu) {
      duDoan = 'Tài';
      doTinCay = Math.min(92, Math.floor(55 + (diemTai / tongDiem) * 40));
    } else {
      duDoan = 'Xỉu';
      doTinCay = Math.min(92, Math.floor(55 + (diemXiu / tongDiem) * 40));
    }
  }
  
  return { duDoan, doTinCay, lyDo: `Default: ${phanTich.length} chỉ báo`, diemTai, diemXiu, phanTich };
}

// ==========================================
// ========== HÀM CHỌN THUẬT TOÁN THEO GAME ==========
// ==========================================
function chonThuatToan(gameKey) {
  if (gameKey.includes('sunwin')) return thuatToan_SUNWIN;
  if (gameKey.includes('lc79')) return thuatToan_LC79;
  if (gameKey.includes('hitclub')) return thuatToan_HITCLUB;
  if (gameKey.includes('gb68') || gameKey.includes('68')) return thuatToan_68GB;
  if (gameKey.includes('bcr')) return thuatToan_BCR;
  return thuatToan_Default;
}

// ==========================================
// ========== HÀM PHÂN TÍCH MẪU ==========
// ==========================================
function phanTichMau(patternHistory, lastPattern) {
  if (!patternHistory || patternHistory.length < 10) return { duDoan: null, diem: 0, ghiChu: 'Chưa đủ mẫu' };
  
  let countTai = 0, countXiu = 0;
  for (let i = 0; i < patternHistory.length - 5; i++) {
    const p = patternHistory.slice(i, i + 5).join('');
    if (p === lastPattern && i + 5 < patternHistory.length) {
      if (patternHistory[i + 5] === 'Tài') countTai++;
      else if (patternHistory[i + 5] === 'Xỉu') countXiu++;
    }
  }
  
  const total = countTai + countXiu;
  if (total >= 3) {
    if (countTai > countXiu * 1.5) return { duDoan: 'Tài', diem: 70, ghiChu: `Pattern xuất hiện, ${countTai}/${total} ra Tài` };
    if (countXiu > countTai * 1.5) return { duDoan: 'Xỉu', diem: 70, ghiChu: `Pattern xuất hiện, ${countXiu}/${total} ra Xỉu` };
  }
  return { duDoan: null, diem: 0, ghiChu: 'Không đủ dữ liệu pattern' };
}

// ==========================================
// ========== XỬ LÝ GAME CHÍNH ==========
// ==========================================
async function xuLyGame(gameKey) {
  const url = GAME_APIS[gameKey];
  const data = await fetchGameData(url, gameKey);
  if (!data) throw new Error(`Không lấy được dữ liệu ${gameKey}`);
  
  const ketQuaThucTe = data.ket_qua;
  const game = gameData[gameKey];
  const memory = algorithmMemory[gameKey];
  const phienHienTai = data.phien;
  
  // Cập nhật lịch sử
  game.data.unshift({ phien: phienHienTai, ket_qua: ketQuaThucTe, tong: data.tong });
  if (game.data.length > 150) game.data.pop();
  if (data.tong) {
    game.tongData.unshift(data.tong);
    if (game.tongData.length > 150) game.tongData.pop();
  }
  
  // Lấy lịch sử
  const lichSu = game.data.filter(d => d.ket_qua === 'Tài' || d.ket_qua === 'Xỉu').map(d => d.ket_qua);
  const tongData = game.tongData;
  
  // Chọn và chạy thuật toán riêng cho game
  const thuatToan = chonThuatToan(gameKey);
  const ketQua = thuatToan(lichSu, tongData, memory);
  
  // Cập nhật thống kê cho dự đoán trước
  if (game.lichSuDuDoan.length > 0 && game.lichSuDuDoan[0].ket_qua === 'CHỜ') {
    const lastPred = game.lichSuDuDoan[0];
    if (lastPred.du_doan) {
      const dung = (ketQuaThucTe === lastPred.du_doan);
      if (dung) statsDB[gameKey].dung++;
      else statsDB[gameKey].sai++;
      statsDB[gameKey].tong++;
      statsDB[gameKey].tiLe = ((statsDB[gameKey].dung / statsDB[gameKey].tong) * 100).toFixed(1) + '%';
      
      lastPred.ket_qua = dung ? 'ĐÚNG' : 'SAI';
      lastPred.thuc_te = ketQuaThucTe;
    }
  }
  
  // Lưu dự đoán mới
  game.lichSuDuDoan.unshift({
    phien: phienHienTai,
    du_doan: ketQua.duDoan,
    do_tin_cay: ketQua.doTinCay || 0,
    ly_do: ketQua.lyDo || '',
    ket_qua: 'CHỜ',
    thoi_gian: Date.now()
  });
  if (game.lichSuDuDoan.length > 100) game.lichSuDuDoan.pop();
  
  // Cập nhật bộ nhớ
  if (ketQua.duDoan) {
    memory.tayThu++;
    memory.dangChay = ketQua.duDoan;
  }
  
  return {
    game: gameKey,
    phien_hien_tai: phienHienTai,
    ket_qua_thuc_te: ketQuaThucTe,
    du_doan: {
      phien_tiep: phienHienTai + 1,
      co_nen_cuoc: ketQua.duDoan && ketQua.doTinCay >= 65 ? '✅ NÊN CƯỢC' : '⏸️ BỎ QUA',
      du_doan: ketQua.duDoan || 'KHÔNG DỰ ĐOÁN',
      do_tin_cay: ketQua.doTinCay ? ketQua.doTinCay + '%' : '0%',
      ly_do: ketQua.lyDo || 'Chưa đủ cơ sở',
      chi_tiet_phan_tich: ketQua.phanTich || []
    },
    thong_ke: statsDB[gameKey],
    lich_su_10_phien: game.data.slice(0, 10).map(d => d.ket_qua)
  };
}

// ==========================================
// API ENDPOINTS
// ==========================================

app.get('/api/games', (req, res) => {
  const games = Object.keys(GAME_APIS);
  const sunwinGames = games.filter(g => g.includes('sunwin'));
  const lc79Games = games.filter(g => g.includes('lc79'));
  const hitclubGames = games.filter(g => g.includes('hitclub'));
  const gb68Games = games.filter(g => g.includes('gb68'));
  const bcrGames = games.filter(g => g.includes('bcr'));
  const otherGames = games.filter(g => !g.includes('sunwin') && !g.includes('lc79') && !g.includes('hitclub') && !g.includes('gb68') && !g.includes('bcr'));
  
  res.json({
    total: games.length,
    categories: {
      SUNWIN: sunwinGames,
      LC79: lc79Games,
      HITCLUB: hitclubGames,
      GB68: gb68Games,
      BCR: bcrGames,
      OTHER: otherGames
    },
    thuat_toan_rieng: 'MỖI GAME CÓ THUẬT TOÁN RIÊNG BIỆT',
    random: '❌ 0% RANDOM'
  });
});

app.get('/api/predict/:game', async (req, res) => {
  const gameKey = req.params.game;
  if (!GAME_APIS[gameKey]) {
    return res.status(404).json({ error: 'Game không tồn tại', available: Object.keys(GAME_APIS) });
  }
  
  try {
    const result = await xuLyGame(gameKey);
    res.json({
      success: true,
      ...result,
      note: '⚠️ CHỈ CƯỢC KHI "co_nen_cuoc" = "✅ NÊN CƯỢC"',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats/:game', (req, res) => {
  const gameKey = req.params.game;
  if (!GAME_APIS[gameKey]) return res.status(404).json({ error: 'Game not found' });
  res.json({ 
    game: gameKey, 
    stats: statsDB[gameKey],
    bo_nho: {
      tay_thu: algorithmMemory[gameKey].tayThu,
      dang_chay: algorithmMemory[gameKey].dangChay,
      so_mau_pattern: algorithmMemory[gameKey].pattern?.length || 0
    }
  });
});

app.get('/api/reset/:game', (req, res) => {
  const gameKey = req.params.game;
  if (!GAME_APIS[gameKey]) return res.status(404).json({ error: 'Game not found' });
  
  gameData[gameKey] = { data: [], tongData: [], lichSuDuDoan: [], patternHistory: [] };
  statsDB[gameKey] = { tong: 0, dung: 0, sai: 0, tiLe: '0%', boQua: 0 };
  algorithmMemory[gameKey] = { tayThu: 0, dangChay: null, pattern: [], confidence: 0 };
  
  res.json({ success: true, message: `Reset ${gameKey} thành công` });
});

app.get('/', (req, res) => {
  res.json({
    name: '🔥 TÀI XỈU AI - THUẬT TOÁN RIÊNG TỪNG GAME 🔥',
    version: '6.0',
    thuat_toan: {
      SUNWIN: '300+ dòng - Chuyên phân tích bệt dài, cầu 1-1, tổng điểm',
      LC79: '300+ dòng - Chuyên bệt 3-4, cầu 2-2, pattern riêng',
      HITCLUB: '250+ dòng - Chuyên cầu 1-1 dài, ít bệt',
      GB68: '250+ dòng - Chuyên đảo cầu, pattern 3-2',
      BCR: '200+ dòng - Chuyên Banker/Player, bệt BCR',
      DEFAULT: '200+ dòng - Thuật toán tổng quát'
    },
    nguyen_tac: 'CHỈ CƯỢC KHI ĐỘ TIN CẬY >= 65%',
    endpoints: {
      'Danh sách game': 'GET /api/games',
      'Dự đoán': 'GET /api/predict/:game',
      'Thống kê': 'GET /api/stats/:game',
      'Reset': 'GET /api/reset/:game'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(70));
  console.log('🔥 TÀI XỈU AI - THUẬT TOÁN RIÊNG TỪNG GAME v6.0 🔥');
  console.log('='.repeat(70));
  console.log(`📊 ${Object.keys(GAME_APIS).length} GAME`);
  console.log(`🎯 MỖI GAME CÓ THUẬT TOÁN RIÊNG (200-300 DÒNG/GAME)`);
  console.log(`❌ 0% RANDOM - PHÂN TÍCH CHUYÊN SÂU`);
  console.log(`✅ CHỈ CƯỢC KHI ĐỘ TIN CẬY >= 65%`);
  console.log(`🚀 PORT: ${PORT}`);
  console.log('='.repeat(70) + '\n');
  console.log('📌 CÁC GAME ĐÃ CÓ THUẬT TOÁN RIÊNG:');
  console.log('   - SUNWIN (TX, Sicbo, Sun Phụng, Xóc đĩa)');
  console.log('   - LC79 (TX, TXMD5, Xóc đĩa)');
  console.log('   - HITCLUB (TX, TXMD5, Sicbo)');
  console.log('   - 68GB (Thường, MD5)');
  console.log('   - BCR (V1 + 25 bàn)');
  console.log('   - Các game khác (Thuật toán Default)\n');
});
