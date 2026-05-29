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
  'lc79_tx': 'https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=83991213bfd4c554dc94bcd98979bdc5',
  'lc79_txmd5': 'https://wtxmd52.tele68.com/v1/txmd5/lite-sessions?cp=R&cl=R&pf=web&at=3959701241b686f12e01bfe9c3a319b8',
  'hitclub_txmd5': 'https://wtxmd52.tele68.com/v1/txmd5/lite-sessions?cp=R&cl=R&pf=web&at=',
  'hitclub_tx': 'https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=',
  'gb68_txmd5': 'https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=83991213bfd4c554dc94bcd98979bdc5',
  'sunwin_sicbo': 'https://api.wsktnus8.net/v2/history/getLastResult?gameId=ktrng_3979&size=100&tableId=39791215743193&curPage=1'
};

// ==========================================
// LƯU TRỮ DỮ LIỆU
// ==========================================
const gameData = {};
const statsDB = {};
const memory = {};

for (let key in GAME_APIS) {
  gameData[key] = { data: [], tongData: [], lichSuDuDoan: [], feedbackHistory: [] };
  statsDB[key] = { tong: 0, dung: 0, sai: 0, tiLe: '0%' };
  memory[key] = { patterns: [], markovChain: {}, kalmanState: { x: 10.5, p: 1 } };
}

// ==========================================
// HÀM TIỆN ÍCH
// ==========================================
function chuanHoa(ketQua) {
  if (!ketQua) return null;
  const kq = String(ketQua).toLowerCase().trim();
  if (kq === 'tài' || kq === 'tai' || kq === 'big' || kq === 'b') return 'Tài';
  if (kq === 'xỉu' || kq === 'xiu' || kq === 'small' || kq === 's') return 'Xỉu';
  if (kq === 'chẵn' || kq === 'chan') return 'Chẵn';
  if (kq === 'lẻ' || kq === 'le') return 'Lẻ';
  return ketQua;
}

// ==========================================
// FETCH DATA
// ==========================================
async function fetchGameData(url, gameKey) {
  try {
    const headers = { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    };
    
    const res = await axios.get(url, { timeout: 10000, headers });
    let data = res.data;
    if (!data) return null;
    
    // XỬ LÝ API TELE68
    if (data.list && Array.isArray(data.list) && data.list.length > 0) {
      const lastItem = data.list[data.list.length - 1];
      let ketQua = lastItem.resultTruyenThong || lastItem.result;
      if (ketQua === 'TAI' || ketQua === 'BIG') ketQua = 'Tài';
      if (ketQua === 'XIU' || ketQua === 'SMALL') ketQua = 'Xỉu';
      
      return {
        phien: lastItem.id,
        ket_qua: chuanHoa(ketQua),
        dice: lastItem.dices || [],
        tong: lastItem.point || lastItem.total || null
      };
    }
    
    // XỬ LÝ API SUNWIN SICBO
    if (data.data && data.data.resultList && Array.isArray(data.data.resultList) && data.data.resultList.length > 0) {
      const lastItem = data.data.resultList[0];
      let ketQua = '';
      if (lastItem.resultType === 3) ketQua = 'Tài';
      else if (lastItem.resultType === 4) ketQua = 'Xỉu';
      else if (lastItem.resultType === 11) ketQua = 'Bão';
      
      if (ketQua === 'Bão') return null;
      
      return {
        phien: parseInt(lastItem.gameNum.replace('#', '')) || Date.now(),
        ket_qua: chuanHoa(ketQua),
        dice: lastItem.facesList || [],
        tong: lastItem.score || null
      };
    }
    
    return null;
    
  } catch (error) {
    console.error(`❌ Fetch lỗi ${gameKey}:`, error.message);
    return null;
  }
}

// ==========================================
// ENGINE TÀI XỈU THƯỜNG - HITCLUB_TX, LC79_TX
// ==========================================
function engineTaiXiuThuong(lichSu, tongData, kalmanState) {
  // TRƯỜNG HỢP 1: CHỈ CÓ 1 PHIÊN
  if (lichSu.length === 1) {
    const duDoan = lichSu[0] === "Tài" ? "Xỉu" : "Tài";
    return { duDoan, doTinCay: 62, lyDo: `⚠️ Chỉ 1 phiên (${lichSu[0]}), dự đoán đảo cầu: ${duDoan}` };
  }
  
  // TRƯỜNG HỢP 2: CÓ 2 PHIÊN
  if (lichSu.length === 2) {
    const last2 = lichSu.slice(0, 2);
    if (last2[0] === last2[1]) {
      const duDoan = last2[0] === "Tài" ? "Xỉu" : "Tài";
      return { duDoan, doTinCay: 66, lyDo: `📊 Bệt 2 phiên ${last2[0]}, dự đoán đảo thành ${duDoan}` };
    } else {
      const duDoan = last2[0];
      return { duDoan, doTinCay: 64, lyDo: `🔄 Cầu 1-1 (${last2[0]}→${last2[1]}), theo ${duDoan}` };
    }
  }
  
  // TRƯỜNG HỢP 3: CÓ 3 PHIÊN
  if (lichSu.length === 3) {
    const last3 = lichSu.slice(0, 3);
    // Bệt 3
    if (last3[0] === last3[1] && last3[1] === last3[2]) {
      const duDoan = last3[0] === "Tài" ? "Xỉu" : "Tài";
      return { duDoan, doTinCay: 74, lyDo: `🔥 Bệt 3 phiên ${last3[0]}, dự đoán đảo cầu ${duDoan}` };
    }
    // Cầu 1-1
    if (last3[0] !== last3[1] && last3[1] !== last3[2]) {
      const duDoan = last3[2] === "Tài" ? "Xỉu" : "Tài";
      return { duDoan, doTinCay: 72, lyDo: `🎯 Cầu 1-1 (${last3[0]}→${last3[1]}→${last3[2]}), dự đoán ${duDoan}` };
    }
    const duDoan = last3[0] === "Tài" ? "Xỉu" : "Tài";
    return { duDoan, doTinCay: 65, lyDo: `⚖️ Dự đoán đảo cầu (${last3[0]} → ${duDoan})` };
  }
  
  // ========== ĐÃ CÓ >=4 PHIÊN ==========
  
  // 1. BỆT
  let streak = 1;
  for (let i = 1; i < Math.min(lichSu.length, 10); i++) {
    if (lichSu[i] === lichSu[0]) streak++;
    else break;
  }
  
  if (streak >= 5) {
    const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
    let doTinCay = Math.min(94, 75 + (streak - 4) * 5);
    return { duDoan, doTinCay, lyDo: `🔥🔥 Bệt ${streak} phiên ${lichSu[0]} => BẺ CẦU ${duDoan}` };
  }
  
  if (streak === 4) {
    const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
    return { duDoan, doTinCay: 82, lyDo: `🔥 Bệt 4 phiên ${lichSu[0]} => BẺ CẦU ${duDoan}` };
  }
  
  if (streak === 3) {
    const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
    return { duDoan, doTinCay: 74, lyDo: `⚡ Bệt 3 phiên ${lichSu[0]} => Đảo cầu ${duDoan}` };
  }

  // 2. CẦU 1-1
  if (lichSu.length >= 4) {
    let isZigzag = true;
    for (let i = 1; i < 4; i++) {
      if (lichSu[i] === lichSu[i-1]) { isZigzag = false; break; }
    }
    if (isZigzag) {
      const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
      return { duDoan, doTinCay: 78, lyDo: `🎯 Cầu 1-1 => ${duDoan}` };
    }
  }

  // 3. TẦN SUẤT 5 PHIÊN
  if (lichSu.length >= 5) {
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === 'Tài').length;
    if (tai5 >= 4) return { duDoan: 'Xỉu', doTinCay: 80, lyDo: `📊 5 phiên ${tai5}T => BẮT XỈU` };
    if (tai5 <= 1) return { duDoan: 'Tài', doTinCay: 80, lyDo: `📊 5 phiên ${tai5}T => BẮT TÀI` };
  }

  // 4. KALMAN
  if (tongData && tongData.length > 0) {
    let x_pred = kalmanState.x; 
    let p_pred = kalmanState.p + 0.1; 
    const z = tongData[0]; 
    const k_gain = p_pred / (p_pred + 2.9); 
    kalmanState.x = x_pred + k_gain * (z - x_pred);
    kalmanState.p = (1 - k_gain) * p_pred;
    const diemUocLuong = kalmanState.x;
    const kqKalman = diemUocLuong > 10.5 ? 'Tài' : 'Xỉu';
    let doTinCay = 70;
    if (lichSu.length >= 8) doTinCay += 5;
    return { duDoan: kqKalman, doTinCay: Math.min(88, doTinCay), lyDo: `🎯 Kalman dự báo điểm ${diemUocLuong.toFixed(1)} => ${kqKalman}` };
  }

  // FALLBACK
  const lastResult = lichSu[0];
  const duDoan = lastResult === 'Tài' ? 'Xỉu' : 'Tài';
  return { duDoan, doTinCay: 66, lyDo: `⚖️ Đảo cầu (${lastResult} → ${duDoan})` };
}

// ==========================================
// ENGINE TÀI XỈU MD5 - LC79_TXMD5, HITCLUB_TXMD5, GB68_TXMD5
// ==========================================
function engineTaiXiuMD5(lichSu, gameMemory) {
  // TRƯỜNG HỢP 1: CHỈ CÓ 1 PHIÊN
  if (lichSu.length === 1) {
    const duDoan = lichSu[0] === "Tài" ? "Xỉu" : "Tài";
    return { duDoan, doTinCay: 62, lyDo: `⚠️ Chỉ 1 phiên (${lichSu[0]}), dự đoán đảo: ${duDoan}` };
  }
  
  // TRƯỜNG HỢP 2: CÓ 2 PHIÊN
  if (lichSu.length === 2) {
    const last2 = lichSu.slice(0, 2);
    if (last2[0] === last2[1]) {
      const duDoan = last2[0] === "Tài" ? "Xỉu" : "Tài";
      return { duDoan, doTinCay: 66, lyDo: `📊 Bệt 2 phiên ${last2[0]}, dự đoán đảo ${duDoan}` };
    } else {
      return { duDoan: last2[0], doTinCay: 64, lyDo: `🔄 Cầu 1-1, theo ${last2[0]}` };
    }
  }
  
  // TRƯỜNG HỢP 3: CÓ 3 PHIÊN
  if (lichSu.length === 3) {
    const last3 = lichSu.slice(0, 3);
    if (last3[0] === last3[1] && last3[1] === last3[2]) {
      const duDoan = last3[0] === "Tài" ? "Xỉu" : "Tài";
      return { duDoan, doTinCay: 74, lyDo: `🔥 Bệt 3 phiên ${last3[0]}, đảo ${duDoan}` };
    }
    if (last3[0] !== last3[1] && last3[1] !== last3[2]) {
      const duDoan = last3[2] === "Tài" ? "Xỉu" : "Tài";
      return { duDoan, doTinCay: 72, lyDo: `🎯 Cầu 1-1, dự đoán ${duDoan}` };
    }
    const duDoan = last3[0] === "Tài" ? "Xỉu" : "Tài";
    return { duDoan, doTinCay: 65, lyDo: `⚖️ Đảo cầu (${last3[0]} → ${duDoan})` };
  }
  
  // ========== ĐÃ CÓ >=4 PHIÊN ==========
  
  // XÂY DỰNG MARKOV
  const mc = gameMemory.markovChain;
  if (lichSu.length >= 5) {
    for (let i = lichSu.length - 4; i >= 0; i--) {
      const trangThai = lichSu.slice(i + 1, i + 4).join(''); 
      const ketQuaTiep = lichSu[i];
      if (!mc[trangThai]) mc[trangThai] = { Tài: 0, Xỉu: 0 };
      mc[trangThai][ketQuaTiep]++;
    }
  }

  // BỆT
  let streak = 1;
  for (let i = 1; i < Math.min(lichSu.length, 10); i++) {
    if (lichSu[i] === lichSu[0]) streak++;
    else break;
  }
  
  if (streak >= 5) {
    const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
    let doTinCay = Math.min(94, 75 + (streak - 4) * 5);
    return { duDoan, doTinCay, lyDo: `🔥🔥 Bệt ${streak} phiên => BẺ CẦU ${duDoan}` };
  }
  
  if (streak === 4) {
    const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
    return { duDoan, doTinCay: 82, lyDo: `🔥 Bệt 4 phiên => BẺ CẦU ${duDoan}` };
  }
  
  if (streak === 3) {
    const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
    return { duDoan, doTinCay: 74, lyDo: `⚡ Bệt 3 phiên => Đảo ${duDoan}` };
  }

  // MARKOV PREDICTION
  if (lichSu.length >= 4) {
    const trangThaiHienTai = lichSu.slice(0, 3).join('');
    const thongKe = mc[trangThaiHienTai];
    if (thongKe && (thongKe.Tài + thongKe.Xỉu) >= 2) {
      const t = thongKe.Tài;
      const x = thongKe.Xỉu;
      if (t !== x) {
        const duDoan = t > x ? 'Tài' : 'Xỉu';
        const tyLe = Math.max(t, x) / (t + x);
        return { duDoan, doTinCay: Math.min(90, Math.round(65 + tyLe * 25)), lyDo: `🔗 Markov [${trangThaiHienTai}] => ${duDoan} (${Math.round(tyLe*100)}%)` };
      }
    }
  }

  // ABAB PATTERN
  if (lichSu.length >= 4 && lichSu[0] === lichSu[2] && lichSu[1] === lichSu[3] && lichSu[0] !== lichSu[1]) {
    const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
    return { duDoan, doTinCay: 78, lyDo: `🔄 Cấu trúc ABAB => ${duDoan}` };
  }

  // TẦN SUẤT
  if (lichSu.length >= 5) {
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === 'Tài').length;
    if (tai5 >= 4) return { duDoan: 'Xỉu', doTinCay: 80, lyDo: `📊 5 phiên ${tai5}T => BẮT XỈU` };
    if (tai5 <= 1) return { duDoan: 'Tài', doTinCay: 80, lyDo: `📊 5 phiên ${tai5}T => BẮT TÀI` };
  }

  // FALLBACK
  const lastResult = lichSu[0];
  const duDoan = lastResult === 'Tài' ? 'Xỉu' : 'Tài';
  return { duDoan, doTinCay: 66, lyDo: `⚖️ Đảo cầu (${lastResult} → ${duDoan})` };
}

// ==========================================
// ENGINE SUNWIN SICBO
// ==========================================
function engineSunwinSicbo(lichSu, tongData) {
  // 1 PHIÊN
  if (lichSu.length === 1) {
    const duDoan = lichSu[0] === "Tài" ? "Xỉu" : "Tài";
    return { duDoan, doTinCay: 62, lyDo: `⚠️ Chỉ 1 phiên, dự đoán đảo: ${duDoan}` };
  }
  
  // 2 PHIÊN
  if (lichSu.length === 2) {
    const last2 = lichSu.slice(0, 2);
    if (last2[0] === last2[1]) {
      const duDoan = last2[0] === "Tài" ? "Xỉu" : "Tài";
      return { duDoan, doTinCay: 66, lyDo: `📊 Bệt 2 phiên, đảo ${duDoan}` };
    } else {
      return { duDoan: last2[0], doTinCay: 64, lyDo: `🔄 Cầu 1-1, theo ${last2[0]}` };
    }
  }
  
  // 3 PHIÊN
  if (lichSu.length === 3) {
    const last3 = lichSu.slice(0, 3);
    if (last3[0] === last3[1] && last3[1] === last3[2]) {
      const duDoan = last3[0] === "Tài" ? "Xỉu" : "Tài";
      return { duDoan, doTinCay: 74, lyDo: `🔥 Bệt 3 phiên, đảo ${duDoan}` };
    }
    if (last3[0] !== last3[1] && last3[1] !== last3[2]) {
      const duDoan = last3[2] === "Tài" ? "Xỉu" : "Tài";
      return { duDoan, doTinCay: 72, lyDo: `🎯 Cầu 1-1, dự đoán ${duDoan}` };
    }
    const duDoan = last3[0] === "Tài" ? "Xỉu" : "Tài";
    return { duDoan, doTinCay: 65, lyDo: `⚖️ Đảo cầu (${last3[0]} → ${duDoan})` };
  }
  
  // >=4 PHIÊN
  let streak = 1;
  for (let i = 1; i < Math.min(lichSu.length, 10); i++) {
    if (lichSu[i] === lichSu[0]) streak++;
    else break;
  }
  
  if (streak >= 4) {
    const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
    let doTinCay = Math.min(94, 70 + (streak - 3) * 6);
    return { duDoan, doTinCay, lyDo: `🔥 Bệt ${streak} phiên => BẺ CẦU ${duDoan}` };
  }
  
  if (lichSu.length >= 5) {
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === 'Tài').length;
    if (tai5 >= 4) return { duDoan: 'Xỉu', doTinCay: 80, lyDo: `📊 5 phiên ${tai5}T => BẮT XỈU` };
    if (tai5 <= 1) return { duDoan: 'Tài', doTinCay: 80, lyDo: `📊 5 phiên ${tai5}T => BẮT TÀI` };
  }
  
  const lastResult = lichSu[0];
  const duDoan = lastResult === 'Tài' ? 'Xỉu' : 'Tài';
  return { duDoan, doTinCay: 66, lyDo: `⚖️ Đảo cầu (${lastResult} → ${duDoan})` };
}

// ==========================================
// ĐỊNH TUYẾN ENGINE
// ==========================================
function dinhTuyenEngine(gameKey, lichSu, tongData, gameMemory) {
  if (gameKey === 'sunwin_sicbo') {
    return engineSunwinSicbo(lichSu, tongData);
  }
  if (gameKey.includes('txmd5') || gameKey.includes('md5')) {
    return engineTaiXiuMD5(lichSu, gameMemory);
  }
  return engineTaiXiuThuong(lichSu, tongData, gameMemory.kalmanState);
}

// ==========================================
// XỬ LÝ GAME CHÍNH
// ==========================================
async function xuLyGame(gameKey) {
  if (!GAME_APIS[gameKey]) throw new Error(`Game [${gameKey}] không tồn tại.`);
  
  let data = await fetchGameData(GAME_APIS[gameKey], gameKey);
  if (!data) throw new Error(`Không lấy được data từ API ${gameKey}.`);
  
  const ketQuaThucTe = data.ket_qua;
  const game = gameData[gameKey];
  const mem = memory[gameKey];
  const phien = data.phien;
  
  // Cập nhật lịch sử
  const daTonTai = game.data.find(x => x.phien === phien);
  if (!daTonTai) {
    game.data.unshift({ phien, ket_qua: ketQuaThucTe, tong: data.tong });
    if (game.data.length > 300) game.data.pop();
    if (data.tong && typeof data.tong === 'number') {
      game.tongData.unshift(data.tong);
      if (game.tongData.length > 100) game.tongData.pop();
    }
  }
  
  // Kiểm tra dự đoán cũ
  if (game.lichSuDuDoan.length > 0 && game.lichSuDuDoan[0].ket_qua === 'CHỜ') {
    const lastPred = game.lichSuDuDoan[0];
    if (lastPred.du_doan && lastPred.du_doan !== 'KHÔNG DỰ ĐOÁN') {
      const dung = (ketQuaThucTe === lastPred.du_doan);
      if (dung) statsDB[gameKey].dung++;
      else statsDB[gameKey].sai++;
      statsDB[gameKey].tong++;
      statsDB[gameKey].tiLe = ((statsDB[gameKey].dung / statsDB[gameKey].tong) * 100).toFixed(1) + '%';
      lastPred.ket_qua = dung ? 'ĐÚNG' : 'SAI';
      lastPred.thuc_te = ketQuaThucTe;
    }
  }
  
  // Lấy lịch sử
  const lichSuChuoi = game.data.map(d => d.ket_qua).filter(k => k === 'Tài' || k === 'Xỉu');
  const tongData = game.tongData;
  
  // Dự đoán
  const ketQuaPhanTich = dinhTuyenEngine(gameKey, lichSuChuoi, tongData, mem);
  
  // Học pattern
  if (lichSuChuoi.length >= 5) {
    const patternMau = lichSuChuoi.slice(1, 5).join('-');
    const nhipKe = lichSuChuoi[0];
    mem.patterns.push({ pattern: patternMau, next: nhipKe });
    if (mem.patterns.length > 500) mem.patterns.shift();
  }
  
  const duDoanCuoi = ketQuaPhanTich.duDoan;
  const tinCayCuoi = ketQuaPhanTich.doTinCay;
  const lyDo = ketQuaPhanTich.lyDo;
  
  // Lưu dự đoán
  game.lichSuDuDoan.unshift({
    phien: phien,
    du_doan: duDoanCuoi,
    do_tin_cay: tinCayCuoi,
    ly_do: lyDo,
    ket_qua: 'CHỜ',
    thoi_gian: Date.now()
  });
  if (game.lichSuDuDoan.length > 100) game.lichSuDuDoan.pop();
  
  const coNenCuoc = tinCayCuoi >= 65;
  
  return {
    game: gameKey,
    phien_hien_tai: phien,
    ket_qua_thuc_te: ketQuaThucTe,
    du_doan: {
      phien_tiep: phien + 1,
      co_nen_cuoc: coNenCuoc ? '✅ NÊN CƯỢC' : '⏸️ BỎ QUA',
      du_doan: duDoanCuoi,
      do_tin_cay: tinCayCuoi + '%',
      ly_do: lyDo
    },
    thong_ke: statsDB[gameKey],
    lich_su_gan_day: lichSuChuoi.slice(0, 12)
  };
}

// ==========================================
// API ENDPOINTS
// ==========================================

app.get('/api/games', (req, res) => {
  res.json({ games: Object.keys(GAME_APIS), total: Object.keys(GAME_APIS).length });
});

app.get('/api/predict/:game', async (req, res) => {
  const gameKey = req.params.game;
  if (!GAME_APIS[gameKey]) {
    return res.status(404).json({ error: 'Game không tồn tại', available: Object.keys(GAME_APIS) });
  }
  
  try {
    const result = await xuLyGame(gameKey);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feedback/:game', (req, res) => {
  const gameKey = req.params.game;
  const { du_doan, ket_qua_thuc_te } = req.body;
  
  if (!GAME_APIS[gameKey]) {
    return res.status(404).json({ error: 'Game không tồn tại' });
  }
  
  if (!du_doan || !ket_qua_thuc_te) {
    return res.status(400).json({ error: 'Thiếu du_doan hoặc ket_qua_thuc_te' });
  }
  
  const dung = (du_doan === ket_qua_thuc_te);
  const stats = statsDB[gameKey];
  
  if (dung) stats.dung++;
  else stats.sai++;
  stats.tong++;
  stats.tiLe = ((stats.dung / stats.tong) * 100).toFixed(1) + '%';
  
  gameData[gameKey].feedbackHistory.unshift({
    du_doan, thuc_te: ket_qua_thuc_te, ket_qua: dung ? 'ĐÚNG' : 'SAI', thoi_gian: Date.now()
  });
  
  res.json({ success: true, dung, stats });
});

app.get('/api/stats/:game', (req, res) => {
  const gameKey = req.params.game;
  if (!statsDB[gameKey]) return res.status(404).json({ error: 'Chưa có dữ liệu' });
  res.json(statsDB[gameKey]);
});

app.get('/', (req, res) => {
  res.json({
    name: '🔥 API TÀI XỈU - LUÔN DỰ ĐOÁN 🔥',
    status: 'ONLINE',
    total_games: Object.keys(GAME_APIS).length,
    games: Object.keys(GAME_APIS)
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🔥 API TÀI XỈU - LUÔN DỰ ĐOÁN`);
  console.log(`======================================================`);
  console.log(`📊 ${Object.keys(GAME_APIS).length} GAME`);
  console.log(`✅ ĐÃ XÓA HOÀN TOÀN LỖI "TÍCH LŨY"`);
  console.log(`🚀 PORT: ${PORT}`);
  console.log(`======================================================\n`);
});
