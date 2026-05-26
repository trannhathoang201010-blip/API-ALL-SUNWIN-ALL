const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// API NGUỒN (ĐÃ THÊM 789CLUB)
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
  console.log(`[${game}] Dự đoán: ${duDoan} | Thực tế: ${thucTe} | KQ: ${dung ? '✅ ĐÚNG' : '❌ SAI'} | TL: ${st.tiLe}`);
  return dung;
}

// ==========================================
// FETCH DỮ LIỆU (CÓ HEADERS CHO 789CLUB)
// ==========================================
async function fetchGameData(url, gameKey) {
  try {
    // Headers riêng cho 789Club để tránh lỗi 403
    const headers = {};
    if (gameKey === 'club789_sicbo') {
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      headers['Accept'] = 'application/json, text/plain, */*';
      headers['Referer'] = 'https://demo7892.fun/';
    }
    
    const res = await axios.get(url, { timeout: 10000, headers });
    const data = res.data;
    if (!data) return null;
    
    // Xóc đĩa
    if (gameKey === 'lc79_xocdia') {
      if (data.ket_qua_truyen_thong) {
        return { phien: data.phien, ket_qua: data.ket_qua_truyen_thong, dice: [], tong: null };
      }
      return null;
    }
    
    // 789Club Sicbo (cấu trúc đặc biệt)
    if (gameKey === 'club789_sicbo') {
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
    
    // Sunwin Sicbo
    if (gameKey === 'sunwin_sicbo') {
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
    
    // Các game Tài Xỉu thông thường
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
// MODULE 1: NHẬN DIỆN CẦU
// ==========================================
class CauDetector {
  nhanDien(lichSu) {
    if (lichSu.length < 5) return { ten: "CHƯA ĐỦ DỮ LIỆU", do_dai: 0, do_tin_cay: 50, du_doan: null };
    
    // Cầu bệt
    let betCount = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[0]) betCount++;
      else break;
    }
    if (betCount >= 5) return { ten: `BỆT ${betCount}`, do_dai: betCount, do_tin_cay: 88, du_doan: lichSu[0] };
    if (betCount === 4) return { ten: "BỆT 4", do_dai: 4, do_tin_cay: 82, du_doan: lichSu[0] };
    if (betCount === 3) return { ten: "BỆT 3", do_dai: 3, do_tin_cay: 68, du_doan: lichSu[0] };
    
    // Cầu 1-1
    let zigzag = 0;
    for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
    if (zigzag >= 3) {
      return { ten: "CẦU 1-1", do_dai: 4, do_tin_cay: 76, du_doan: lichSu[0] === "Tài" ? "Xỉu" : "Tài" };
    }
    
    return { ten: "KHÔNG CÓ CẦU", do_dai: 0, do_tin_cay: 55, du_doan: null };
  }
}

// ==========================================
// MODULE 2: DỰ ĐOÁN
// ==========================================
class DuDoanEngine {
  constructor() {
    this.cauDetector = new CauDetector();
  }

  duDoanTaiXiu(lichSu) {
    if (lichSu.length < 5) {
      return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu", loai_cau: null };
    }
    
    const cau = this.cauDetector.nhanDien(lichSu);
    
    if (cau.du_doan && cau.do_tin_cay >= 65) {
      return {
        du_doan: cau.du_doan,
        do_tin_cay: cau.do_tin_cay,
        giai_thich: `${cau.ten} → ${cau.du_doan === "Tài" ? "Tài" : "Xỉu"}`,
        loai_cau: cau.ten
      };
    }
    
    // Xu hướng 5 phiên
    const last5 = lichSu.slice(0, 5);
    const tai5 = last5.filter(r => r === "Tài").length;
    const duDoan = tai5 >= 3 ? "Tài" : "Xỉu";
    let conf = 55 + Math.abs(tai5 - 2.5) * 6;
    
    // Kiểm tra nóng 10 phiên
    if (lichSu.length >= 10) {
      const last10 = lichSu.slice(0, 10);
      const tai10 = last10.filter(r => r === "Tài").length;
      if (tai10 >= 7) return { du_doan: "Xỉu", do_tin_cay: 72, giai_thich: `Tài nóng ${tai10}/10 - bẻ Xỉu`, loai_cau: "MARTINGALE" };
      if (tai10 <= 3) return { du_doan: "Tài", do_tin_cay: 72, giai_thich: `Xỉu nóng ${10-tai10}/10 - bẻ Tài`, loai_cau: "MARTINGALE" };
    }
    
    return {
      du_doan: duDoan,
      do_tin_cay: Math.min(72, Math.round(conf)),
      giai_thich: `Theo xu hướng ${tai5}T-${5-tai5}X`,
      loai_cau: "XU HƯỚNG"
    };
  }

  // SICBO: Dự đoán Tài/Xỉu + 3 VỊ CỤ THỂ
  duDoanSicbo(lichSu, tongData) {
    if (lichSu.length < 5) {
      return {
        tai_xiu: "Tài", do_tin_cay_tai_xiu: 55,
        vi: "8, 9, 10", tong_vi: 27, do_tin_cay_vi: 55,
        giai_thich: "Chưa đủ dữ liệu"
      };
    }
    
    // Dự đoán Tài/Xỉu
    const taiXiuResult = this.duDoanTaiXiu(lichSu);
    
    // Dự đoán 3 vị cụ thể
    let vi1 = 8, vi2 = 9, vi3 = 10;
    let doTinCayVi = 55;
    
    if (tongData && tongData.length >= 10) {
      // Thống kê tần suất các tổng điểm từ 4-17
      const freq = {4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0};
      for (let t of tongData.slice(0, 30)) {
        if (t >= 4 && t <= 17) freq[t]++;
      }
      
      // Chọn vị dựa trên loại Tài/Xỉu
      if (taiXiuResult.du_doan === "Tài") {
        const viTai = [11,12,13,14,15,16,17];
        viTai.sort((a,b) => freq[b] - freq[a]);
        vi1 = viTai[0] || 13;
        vi2 = viTai[1] || 14;
        vi3 = viTai[2] || 15;
        doTinCayVi = 60 + Math.min(20, freq[vi1] + freq[vi2] + freq[vi3]);
      } else {
        const viXiu = [4,5,6,7,8,9,10];
        viXiu.sort((a,b) => freq[b] - freq[a]);
        vi1 = viXiu[0] || 6;
        vi2 = viXiu[1] || 7;
        vi3 = viXiu[2] || 8;
        doTinCayVi = 60 + Math.min(20, freq[vi1] + freq[vi2] + freq[vi3]);
      }
      doTinCayVi = Math.min(85, doTinCayVi);
    }
    
    return {
      tai_xiu: taiXiuResult.du_doan,
      do_tin_cay_tai_xiu: taiXiuResult.do_tin_cay,
      vi: `${vi1}, ${vi2}, ${vi3}`,
      tong_vi: vi1 + vi2 + vi3,
      do_tin_cay_vi: doTinCayVi,
      giai_thich: taiXiuResult.giai_thich
    };
  }

  duDoanXocDia(lichSu) {
    if (lichSu.length < 5) return { du_doan: "Chẵn", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
    
    let betCount = 1;
    for (let i = 1; i < lichSu.length; i++) {
      if (lichSu[i] === lichSu[0]) betCount++;
      else break;
    }
    if (betCount >= 4) {
      return { du_doan: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", do_tin_cay: 78, giai_thich: `Bệt ${betCount} - bẻ cầu` };
    }
    if (betCount === 3) {
      return { du_doan: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", do_tin_cay: 70, giai_thich: `Bệt 3 - bẻ cầu` };
    }
    
    const last5 = lichSu.slice(0, 5);
    const chan5 = last5.filter(r => r === "Chẵn").length;
    const duDoan = chan5 >= 3 ? "Chẵn" : "Lẻ";
    let conf = 55 + Math.abs(chan5 - 2.5) * 6;
    return { du_doan: duDoan, do_tin_cay: Math.min(72, Math.round(conf)), giai_thich: `Theo xu hướng ${chan5}C-${5-chan5}L` };
  }
}

// ==========================================
// KHỞI TẠO ENGINE CHO TỪNG GAME
// ==========================================
const engines = {};
for (let key in GAME_APIS) {
  engines[key] = new DuDoanEngine();
}

// ==========================================
// XỬ LÝ REQUEST CHÍNH
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
  
  // CẬP NHẬT KẾT QUẢ CHO DỰ ĐOÁN TRƯỚC - QUAN TRỌNG
  if (lastPred && lastPred.prediction !== undefined) {
    let thucTe, duDoanCu;
    if (isSicbo) {
      thucTe = data.ket_qua;
      duDoanCu = lastPred.prediction_tx;
    } else {
      thucTe = data.ket_qua;
      duDoanCu = lastPred.prediction;
    }
    const dung = updateStats(gameKey, thucTe, duDoanCu);
    
    // GHI VÀO LỊCH SỬ DỰ ĐOÁN
    hist.lichSuDuDoan.unshift({
      phien_du_doan: lastPred.phien_du_doan,
      du_doan: isSicbo ? lastPred.prediction_tx : lastPred.prediction,
      do_tin_cay: lastPred.confidence,
      thuc_te: thucTe,
      ket_qua: dung ? 'ĐÚNG' : 'SAI',
      thoi_gian: new Date().toISOString(),
      chi_tiet: isSicbo ? { vi: lastPred.vi, tong_vi: lastPred.tong_vi } : null
    });
    if (hist.lichSuDuDoan.length > 100) hist.lichSuDuDoan.pop();
    
    lastPred.actual = thucTe;
    lastPred.isCorrect = dung;
  }
  
  // Cập nhật lịch sử kết quả
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
  
  // Cache
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
  
  // Dự đoán mới
  const engine = engines[gameKey];
  let prediction;
  if (isSicbo) {
    const sicboResult = engine.duDoanSicbo(hist.data, hist.tongData);
    prediction = {
      tai_xiu: sicboResult.tai_xiu,
      do_tin_cay_tai_xiu: sicboResult.do_tin_cay_tai_xiu,
      vi: sicboResult.vi,
      tong_vi: sicboResult.tong_vi,
      do_tin_cay_vi: sicboResult.do_tin_cay_vi,
      giai_thich: sicboResult.giai_thich
    };
    cacheDB[gameKey].set(data.phien, {
      prediction_tx: prediction.tai_xiu,
      confidence_tx: prediction.do_tin_cay_tai_xiu,
      vi: prediction.vi,
      tong_vi: prediction.tong_vi,
      confidence_vi: prediction.do_tin_cay_vi,
      reason: prediction.giai_thich,
      phien_du_doan: data.phien + 1
    });
  } else if (isXocDia) {
    prediction = engine.duDoanXocDia(hist.data);
    cacheDB[gameKey].set(data.phien, {
      prediction: prediction.du_doan,
      confidence: prediction.do_tin_cay,
      reason: prediction.giai_thich,
      phien_du_doan: data.phien + 1
    });
  } else {
    prediction = engine.duDoanTaiXiu(hist.data);
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
        tai_xiu: prediction.tai_xiu,
        do_tin_cay_tai_xiu: prediction.do_tin_cay_tai_xiu + '%',
        vi: prediction.vi,
        tong_vi: prediction.tong_vi,
        do_tin_cay_vi: prediction.do_tin_cay_vi + '%',
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
      res.json({ game: gameKey.toUpperCase(), ...result, author: '@tranhoang2286', version: 'FIXED' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// API lịch sử riêng
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
    name: '🎲 17 GAME - TÀI XỈU + SICBO (CÓ VỊ) 🎲',
    author: '@tranhoang2286',
    version: '41.0 - FIXED',
    endpoints: Object.keys(GAME_APIS).map(k => `/${k.replace(/_/g, '/')}`),
    luu_y: {
      sicbo: 'Dự đoán Tài/Xỉu + 3 vị cụ thể (VD: 11, 14, 16)',
      lich_su: 'Mỗi game có lịch sử riêng, hiển thị đúng/sai rõ ràng'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎲 ${Object.keys(GAME_APIS).length} GAME - PORT ${PORT}`);
  console.log(`✅ Đã thêm 789Club Sicbo`);
  console.log(`✅ Sicbo có dự đoán 3 vị cụ thể`);
  console.log(`✅ Lịch sử hiển thị đúng/sai rõ ràng`);
});
