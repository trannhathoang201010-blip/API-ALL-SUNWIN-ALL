const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// API NGUỒN
// ==========================================
const GAME_APIS = {
  'sunwin_tx': 'https://era-technology-particular-domestic.trycloudflare.com/api/tx',
  'sunwin_sicbo': 'https://api.wsktnus8.net/v2/history/getLastResult?gameId=ktrng_3979&size=100&tableId=39791215743193&curPage=1',
  'lc79_tx': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/tx',
  'lc79_md5': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/txmd5',
  'betvip_tx': 'https://eve-hydrocodone-offshore-eagle.trycloudflare.com/api/tx',
  'betvip_md5': 'https://eve-hydrocodone-offshore-eagle.trycloudflare.com/api/txmd5',
  'club789_tx': 'https://venue-integrate-aged-heavily.trycloudflare.com/api/tx',
  'club789_sicbo': 'https://demo7892.fun/history/getLastResult?gameId=ktrng_3986&size=100&tableId=398625062021&curPage=1',
  'b52': 'https://flex-knights-agree-grass.trycloudflare.com/txmd5',
  'max789': 'https://deutschland-mandatory-upon-changelog.trycloudflare.com/api/tx',
  'luck8_md5': 'https://qld-incentives-tion-boost.trycloudflare.com/api/txmd5',
  'sumvin_md5': 'https://cricket-compressed-list-suppose.trycloudflare.com/api/md5',
  'gb68_thuong': 'https://description-zen-dog-films.trycloudflare.com/api/68/thuong',
  'gb68_md5': 'https://profiles-televisions-sic-stay.trycloudflare.com/api/68/md5',
  'alo_hitclub_md5': 'https://preference-assuming-picnic-concentration.trycloudflare.com/api/txmd5',
  'luck8_sicbo40': 'https://qld-incentives-tion-boost.trycloudflare.com/api/sicbo40',
  'lc79_xocdia': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/xocdia'
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
  console.log(`[${game}] Dự đoán: ${duDoan} | Thực tế: ${thucTe} | KQ: ${dung ? '✅' : '❌'} | TL: ${st.tiLe}`);
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
// THUẬT TOÁN PHÂN TÍCH THỰC THỤ (KHÔNG THEO CẦU KIỂU "RA GÌ ĐOÁN NẤY")
// ==========================================

// 1. PHÂN TÍCH TẦN SUẤT 10 PHIÊN (BẺ CẦU KHI QUÁ NÓNG)
function phanTichTanSuat10(lichSu) {
  if (lichSu.length < 10) return null;
  const last10 = lichSu.slice(0, 10);
  const tai10 = last10.filter(r => r === "Tài").length;
  const xiu10 = 10 - tai10;
  
  if (tai10 >= 8) return { pred: "Xỉu", conf: 82, lyDo: `Tài quá nóng ${tai10}/10 → bẻ Xỉu` };
  if (xiu10 >= 8) return { pred: "Tài", conf: 82, lyDo: `Xỉu quá nóng ${xiu10}/10 → bẻ Tài` };
  if (tai10 >= 7) return { pred: "Xỉu", conf: 75, lyDo: `Tài nóng ${tai10}/10 → bẻ Xỉu` };
  if (xiu10 >= 7) return { pred: "Tài", conf: 75, lyDo: `Xỉu nóng ${xiu10}/10 → bẻ Tài` };
  return null;
}

// 2. PHÂN TÍCH CHUỖI BỆT (PHÁ CẦU KHI BỆT DÀI)
function phanTichBệt(lichSu) {
  if (lichSu.length < 3) return null;
  let streak = 1;
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[i-1]) streak++;
    else break;
  }
  if (streak >= 5) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 88, lyDo: `Bệt ${streak} quá dài → phá cầu` };
  if (streak === 4) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 80, lyDo: `Bệt 4 → chuẩn bị gãy` };
  if (streak === 3) return { pred: lichSu[0] === "Tài" ? "Xỉu" : "Tài", conf: 72, lyDo: `Bệt 3 → nguy cơ gãy` };
  return null;
}

// 3. PHÂN TÍCH CẦU 1-1 (XEN KẼ)
function phanTichCau1_1(lichSu) {
  if (lichSu.length < 6) return null;
  let isZigzag = true;
  for (let i = 1; i < 5; i++) {
    if (lichSu[i] === lichSu[i-1]) { isZigzag = false; break; }
  }
  if (isZigzag) {
    let nextPred = lichSu[0] === "Tài" ? "Xỉu" : "Tài";
    return { pred: nextPred, conf: 78, lyDo: "Cầu 1-1 đang chạy → đánh ngược" };
  }
  return null;
}

// 4. PHÂN TÍCH TỔNG ĐIỂM (NẾU CÓ DỮ LIỆU)
function phanTichTongDiem(tongData) {
  if (!tongData || tongData.length < 15) return null;
  const last10 = tongData.slice(0, 10);
  const avg = last10.reduce((a, b) => a + b, 0) / 10;
  const prevAvg = tongData.slice(10, 20).reduce((a, b) => a + b, 0) / 10;
  
  if (avg > prevAvg + 1.5) return { pred: "Xỉu", conf: 68, lyDo: `Tổng tăng mạnh (${avg.toFixed(1)} → ${prevAvg.toFixed(1)}) → Xỉu` };
  if (avg < prevAvg - 1.5) return { pred: "Tài", conf: 68, lyDo: `Tổng giảm mạnh (${avg.toFixed(1)} → ${prevAvg.toFixed(1)}) → Tài` };
  if (avg > 12) return { pred: "Xỉu", conf: 66, lyDo: `Tổng trung bình cao (${avg.toFixed(1)}) → Xỉu` };
  if (avg < 9) return { pred: "Tài", conf: 66, lyDo: `Tổng trung bình thấp (${avg.toFixed(1)}) → Tài` };
  return null;
}

// 5. PHÂN TÍCH XÁC SUẤT MARKOV BẬC 2
function phanTichMarkov(lichSu) {
  if (lichSu.length < 12) return null;
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
    const pred = stat.T > stat.X ? "Tài" : "Xỉu";
    let conf = 60 + Math.min(15, (stat.T + stat.X) * 2);
    return { pred, conf: Math.min(80, conf), lyDo: `Markov bậc 2 (${stat.T+stat.X} mẫu) → ${pred}` };
  }
  return null;
}

// 6. PHÂN TÍCH XU HƯỚNG 5 PHIÊN (CHỈ DÙNG KHI KHÔNG CÓ TÍN HIỆU RÕ)
function phanTichXuHuong5(lichSu) {
  if (lichSu.length < 5) return null;
  const last5 = lichSu.slice(0, 5);
  const tai5 = last5.filter(r => r === "Tài").length;
  const pred = tai5 >= 3 ? "Tài" : "Xỉu";
  let conf = 55 + Math.abs(tai5 - 2.5) * 8;
  return { pred, conf: Math.min(68, Math.round(conf)), lyDo: `Xu hướng ${tai5}T-${5-tai5}X` };
}

// TỔNG HỢP TẤT CẢ THUẬT TOÁN
function tongHopDuDoan(lichSu, tongData) {
  if (lichSu.length < 5) return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
  
  const cacPhuongPhap = [
    phanTichTanSuat10(lichSu),
    phanTichBệt(lichSu),
    phanTichCau1_1(lichSu),
    phanTichTongDiem(tongData),
    phanTichMarkov(lichSu),
    phanTichXuHuong5(lichSu)
  ].filter(p => p !== null);
  
  if (cacPhuongPhap.length === 0) {
    const last3 = lichSu.slice(0, 3);
    const tai3 = last3.filter(r => r === "Tài").length;
    return { du_doan: tai3 >= 2 ? "Tài" : "Xỉu", do_tin_cay: 58, giai_thich: "Theo xu hướng 3 phiên" };
  }
  
  // Bỏ phiếu có trọng số
  let diemTai = 0, diemXiu = 0;
  for (let p of cacPhuongPhap) {
    if (p.pred === "Tài") diemTai += p.conf;
    else diemXiu += p.conf;
  }
  
  const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
  let confidence = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
  confidence = Math.min(90, Math.max(55, confidence));
  
  // Lấy lý do từ phương pháp có độ tin cậy cao nhất
  const bestMethod = cacPhuongPhap.reduce((a, b) => a.conf > b.conf ? a : b);
  
  return {
    du_doan: finalPred,
    do_tin_cay: Math.round(confidence),
    giai_thich: `${bestMethod.lyDo} (tổng hợp ${cacPhuongPhap.length} phương pháp)`
  };
}

// SICBO (có thêm dự đoán vị)
function duDoanSicbo(lichSu, tongData) {
  const taiXiu = tongHopDuDoan(lichSu, tongData);
  
  // Dự đoán 3 vị
  let vi1 = 8, vi2 = 9, vi3 = 10;
  let doTinCayVi = 55;
  
  if (tongData && tongData.length >= 15) {
    const freq = {4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0};
    for (let t of tongData.slice(0, 30)) if (t >= 4 && t <= 17) freq[t]++;
    
    if (taiXiu.du_doan === "Tài") {
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
    tai_xiu: taiXiu.du_doan,
    do_tin_cay_tai_xiu: taiXiu.do_tin_cay,
    vi: `${vi1}, ${vi2}, ${vi3}`,
    tong_vi: vi1 + vi2 + vi3,
    do_tin_cay_vi: doTinCayVi,
    giai_thich: taiXiu.giai_thich
  };
}

// XÓC ĐĨA
function duDoanXocDia(lichSu) {
  if (lichSu.length < 5) return { du_doan: "Chẵn", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu" };
  
  // Phân tích bệt
  let betCount = 1;
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[0]) betCount++;
    else break;
  }
  if (betCount >= 4) {
    return { du_doan: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", do_tin_cay: 78, giai_thich: `Bệt ${betCount} quá dài → bẻ cầu` };
  }
  if (betCount === 3) {
    return { du_doan: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", do_tin_cay: 70, giai_thich: `Bệt 3 → chuẩn bị gãy` };
  }
  
  // Phân tích cầu 1-1
  let zigzag = 0;
  for (let i = 1; i < 5; i++) if (lichSu[i] !== lichSu[i-1]) zigzag++;
  if (zigzag >= 3) {
    return { du_doan: lichSu[0] === "Chẵn" ? "Lẻ" : "Chẵn", do_tin_cay: 72, giai_thich: "Cầu 1-1 đang chạy → đánh ngược" };
  }
  
  // Tần suất 5 phiên
  const last5 = lichSu.slice(0, 5);
  const chan5 = last5.filter(r => r === "Chẵn").length;
  if (chan5 >= 4) return { du_doan: "Lẻ", do_tin_cay: 72, giai_thich: `Chẵn nóng ${chan5}/5 → bẻ Lẻ` };
  if (chan5 <= 1) return { du_doan: "Chẵn", do_tin_cay: 72, giai_thich: `Lẻ nóng ${5-chan5}/5 → bẻ Chẵn` };
  
  // Theo xu hướng
  return { du_doan: chan5 >= 3 ? "Chẵn" : "Lẻ", do_tin_cay: 60, giai_thich: `Theo xu hướng ${chan5}C-${5-chan5}L` };
}

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
  
  // Cập nhật kết quả dự đoán trước
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
  
  // Cập nhật lịch sử
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
  let prediction;
  if (isSicbo) {
    const sicboResult = duDoanSicbo(hist.data, hist.tongData);
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
    prediction = duDoanXocDia(hist.data);
    cacheDB[gameKey].set(data.phien, {
      prediction: prediction.du_doan,
      confidence: prediction.do_tin_cay,
      reason: prediction.giai_thich,
      phien_du_doan: data.phien + 1
    });
  } else {
    prediction = tongHopDuDoan(hist.data, hist.tongData);
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
      res.json({ game: gameKey.toUpperCase(), ...result, author: '@tranhoang2286', version: 'PHÂN TÍCH THỰC THỤ' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

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
    name: '🎲 17 GAME - THUẬT TOÁN PHÂN TÍCH THỰC THỤ 🎲',
    author: '@tranhoang2286',
    version: '42.0 - KHÔNG THEO CẦU KIỂU NGU',
    endpoints: Object.keys(GAME_APIS).map(k => `/${k.replace(/_/g, '/')}`),
    thuat_toan: {
      tan_suat_10: 'Bẻ cầu khi Tài/Xỉu quá 7/10 phiên',
      bet: 'Phá cầu khi bệt 3-4-5 phiên',
      cau_1_1: 'Nhận diện cầu xen kẽ',
      tong_diem: 'Phân tích xu hướng tổng điểm',
      markov: 'Xác suất Markov bậc 2',
      xu_huong_5: 'Theo xu hướng 5 phiên (chỉ khi không có tín hiệu)'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎲 ${Object.keys(GAME_APIS).length} GAME - PORT ${PORT}`);
  console.log(`✅ Thuật toán: Tần suất | Bệt | Cầu 1-1 | Tổng điểm | Markov | Xu hướng`);
  console.log(`✅ KHÔNG còn kiểu "ra gì đoán nấy" nữa`);
});
