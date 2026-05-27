const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// API SUNWIN TÀI XỈU
// ==========================================
const API_URL = 'https://era-technology-particular-domestic.trycloudflare.com/api/tx';

// ==========================================
// LƯU TRỮ DỮ LIỆU
// ==========================================
let lichSuKetQua = [];
let lichSuTongDiem = [];
let lichSuXucXac = [];
let lichSuDuDoan = [];
let thongKe = { tong: 0, dung: 0, sai: 0, tiLe: '0%' };
let cache = new Map();

// ==========================================
// CẬP NHẬT THỐNG KÊ
// ==========================================
function capNhatThongKe(thucTe, duDoan) {
  const dung = (thucTe === duDoan);
  if (dung) thongKe.dung++;
  else thongKe.sai++;
  thongKe.tong++;
  thongKe.tiLe = ((thongKe.dung / thongKe.tong) * 100).toFixed(1) + '%';
  return dung;
}

// ==========================================
// LẤY DỮ LIỆU
// ==========================================
async function layDuLieu() {
  try {
    const res = await axios.get(API_URL, { timeout: 10000 });
    const data = res.data;
    if (!data || !data.ket_qua) return null;
    
    let ketQua = data.ket_qua;
    if (ketQua === 'tài' || ketQua === 'TAI' || ketQua === 'Tài') ketQua = 'Tài';
    else if (ketQua === 'xiu' || ketQua === 'XIU' || ketQua === 'Xỉu') ketQua = 'Xỉu';
    else return null;
    
    return {
      phien: data.phien,
      ket_qua: ketQua,
      tong: data.tong || (data.xuc_xac_1 + data.xuc_xac_2 + data.xuc_xac_3),
      dice: [data.xuc_xac_1, data.xuc_xac_2, data.xuc_xac_3]
    };
  } catch (err) {
    console.error('Lỗi lấy dữ liệu:', err.message);
    return null;
  }
}

// ==========================================
// ========== THUẬT TOÁN CỰC MẠNH (30+ PHƯƠNG PHÁP) ==========
// ==========================================

// 1. PHÂN TÍCH CHUỖI BỆT (Streak)
function phanTichBệt(lichSu) {
  if (lichSu.length < 3) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  let streak = 1;
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[0]) streak++;
    else break;
  }
  if (streak >= 6) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 95, soPP: 1 };
    else return { diemTai: 95, diemXiu: 0, soPP: 1 };
  }
  if (streak === 5) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 90, soPP: 1 };
    else return { diemTai: 90, diemXiu: 0, soPP: 1 };
  }
  if (streak === 4) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 84, soPP: 1 };
    else return { diemTai: 84, diemXiu: 0, soPP: 1 };
  }
  if (streak === 3) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 74, soPP: 1 };
    else return { diemTai: 74, diemXiu: 0, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 2. TẦN SUẤT 5 PHIÊN
function tanSuat5(lichSu) {
  if (lichSu.length < 5) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const last5 = lichSu.slice(0, 5);
  const tai5 = last5.filter(r => r === "Tài").length;
  if (tai5 >= 4) return { diemTai: 0, diemXiu: 78, soPP: 1 };
  if (tai5 <= 1) return { diemTai: 78, diemXiu: 0, soPP: 1 };
  if (tai5 === 3) return { diemTai: 68, diemXiu: 0, soPP: 1 };
  if (tai5 === 2) return { diemTai: 0, diemXiu: 68, soPP: 1 };
  return { diemTai: 60, diemXiu: 60, soPP: 1 };
}

// 3. TẦN SUẤT 10 PHIÊN (Martingale)
function tanSuat10(lichSu) {
  if (lichSu.length < 10) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const last10 = lichSu.slice(0, 10);
  const tai10 = last10.filter(r => r === "Tài").length;
  if (tai10 >= 8) return { diemTai: 0, diemXiu: 88, soPP: 1 };
  if (tai10 <= 2) return { diemTai: 88, diemXiu: 0, soPP: 1 };
  if (tai10 >= 7) return { diemTai: 0, diemXiu: 80, soPP: 1 };
  if (tai10 <= 3) return { diemTai: 80, diemXiu: 0, soPP: 1 };
  if (tai10 >= 6) return { diemTai: 0, diemXiu: 72, soPP: 1 };
  if (tai10 <= 4) return { diemTai: 72, diemXiu: 0, soPP: 1 };
  return { diemTai: 62, diemXiu: 62, soPP: 1 };
}

// 4. TẦN SUẤT 20 PHIÊN
function tanSuat20(lichSu) {
  if (lichSu.length < 20) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const last20 = lichSu.slice(0, 20);
  const tai20 = last20.filter(r => r === "Tài").length;
  if (tai20 >= 14) return { diemTai: 0, diemXiu: 80, soPP: 1 };
  if (tai20 <= 6) return { diemTai: 80, diemXiu: 0, soPP: 1 };
  if (tai20 >= 13) return { diemTai: 0, diemXiu: 74, soPP: 1 };
  if (tai20 <= 7) return { diemTai: 74, diemXiu: 0, soPP: 1 };
  return { diemTai: 62, diemXiu: 62, soPP: 1 };
}

// 5. CẦU 1-1 (Zigzag)
function cau1_1(lichSu) {
  if (lichSu.length < 5) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  let zigzag = 0;
  for (let i = 1; i < 5; i++) {
    if (lichSu[i] !== lichSu[i-1]) zigzag++;
  }
  if (zigzag >= 4) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 86, soPP: 1 };
    else return { diemTai: 86, diemXiu: 0, soPP: 1 };
  }
  if (zigzag >= 3) {
    if (lichSu[0] === "Tài") return { diemTai: 0, diemXiu: 78, soPP: 1 };
    else return { diemTai: 78, diemXiu: 0, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 6. CẦU 2-1
function cau2_1(lichSu) {
  if (lichSu.length < 6) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  if (lichSu[0] === lichSu[1] && lichSu[3] === lichSu[4] && lichSu[0] !== lichSu[3]) {
    if (lichSu[0] === "Tài") return { diemTai: 80, diemXiu: 0, soPP: 1 };
    else return { diemTai: 0, diemXiu: 80, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 7. CẦU 3-2
function cau3_2(lichSu) {
  if (lichSu.length < 10) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const p = lichSu.slice(0, 5).join('');
  if (p === "TàiTàiTàiXỉuXỉu") return { diemTai: 0, diemXiu: 84, soPP: 1 };
  if (p === "XỉuXỉuXỉuTàiTài") return { diemTai: 84, diemXiu: 0, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 8. CẦU ĐỐI XỨNG
function cauDoiXung(lichSu) {
  if (lichSu.length < 9) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  let isMirror = true;
  for (let i = 0; i < 4; i++) {
    if (lichSu[i] !== lichSu[8-i]) { isMirror = false; break; }
  }
  if (isMirror) {
    if (lichSu[4] === "Tài") return { diemTai: 0, diemXiu: 82, soPP: 1 };
    else return { diemTai: 82, diemXiu: 0, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 9. PATTERN LẶP 3
function patternLap3(lichSu) {
  if (lichSu.length < 9) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const p3 = lichSu.slice(0, 3);
  if (lichSu.slice(3, 6).join('') === p3.join('') && lichSu.slice(6, 9).join('') === p3.join('')) {
    if (p3[2] === "Tài") return { diemTai: 0, diemXiu: 88, soPP: 1 };
    else return { diemTai: 88, diemXiu: 0, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 10. PATTERN LẶP 4
function patternLap4(lichSu) {
  if (lichSu.length < 12) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const p4 = lichSu.slice(0, 4);
  if (lichSu.slice(4, 8).join('') === p4.join('') && lichSu.slice(8, 12).join('') === p4.join('')) {
    if (p4[3] === "Tài") return { diemTai: 0, diemXiu: 90, soPP: 1 };
    else return { diemTai: 90, diemXiu: 0, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 11. PHÂN TÍCH TỔNG ĐIỂM TRUNG BÌNH
function tongDiemTB(tongData) {
  if (!tongData || tongData.length < 10) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const avg = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
  if (avg > 12.5) return { diemTai: 0, diemXiu: 78, soPP: 1 };
  if (avg < 8.5) return { diemTai: 78, diemXiu: 0, soPP: 1 };
  if (avg > 11.5) return { diemTai: 0, diemXiu: 72, soPP: 1 };
  if (avg < 9.5) return { diemTai: 72, diemXiu: 0, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 12. XU HƯỚNG TỔNG ĐIỂM (Delta)
function xuHuongTongDiem(tongData) {
  if (!tongData || tongData.length < 20) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const gan = tongData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
  const truoc = tongData.slice(10, 20).reduce((a, b) => a + b, 0) / 10;
  const delta = gan - truoc;
  if (delta > 2) return { diemTai: 0, diemXiu: 74, soPP: 1 };
  if (delta < -2) return { diemTai: 74, diemXiu: 0, soPP: 1 };
  if (delta > 1.2) return { diemTai: 0, diemXiu: 68, soPP: 1 };
  if (delta < -1.2) return { diemTai: 68, diemXiu: 0, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 13. BIÊN ĐỘ TỔNG ĐIỂM
function bienDoTongDiem(tongData) {
  if (!tongData || tongData.length < 15) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const max = Math.max(...tongData.slice(0, 15));
  const min = Math.min(...tongData.slice(0, 15));
  if (max - min >= 12) {
    if (max > 14) return { diemTai: 0, diemXiu: 76, soPP: 1 };
    else return { diemTai: 76, diemXiu: 0, soPP: 1 };
  }
  if (max - min >= 9) {
    if (max > 13) return { diemTai: 0, diemXiu: 70, soPP: 1 };
    else return { diemTai: 70, diemXiu: 0, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 14. RSI (CHỈ BÁO SỨC MẠNH)
function rsiIndicator(lichSu) {
  if (lichSu.length < 14) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  let gains = 0, losses = 0;
  for (let i = 1; i < nums.length; i++) {
    const diff = nums[i] - nums[i-1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const rsi = losses === 0 ? 100 : 100 - (100 / (1 + gains / losses));
  if (rsi >= 80) return { diemTai: 0, diemXiu: 86, soPP: 1 };
  if (rsi <= 20) return { diemTai: 86, diemXiu: 0, soPP: 1 };
  if (rsi >= 70) return { diemTai: 0, diemXiu: 80, soPP: 1 };
  if (rsi <= 30) return { diemTai: 80, diemXiu: 0, soPP: 1 };
  if (rsi >= 60) return { diemTai: 0, diemXiu: 72, soPP: 1 };
  if (rsi <= 40) return { diemTai: 72, diemXiu: 0, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 15. MACD (HỘI TỤ PHÂN KỲ)
function macdIndicator(lichSu) {
  if (lichSu.length < 26) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const nums = lichSu.map(r => r === "Tài" ? 1 : 0);
  const ema12 = nums.slice(-12).reduce((a, b) => a + b, 0) / 12;
  const ema26 = nums.slice(-26).reduce((a, b) => a + b, 0) / 26;
  const macd = ema12 - ema26;
  if (macd > 0.12) return { diemTai: 0, diemXiu: 76, soPP: 1 };
  if (macd < -0.12) return { diemTai: 76, diemXiu: 0, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 16. BOLLINGER BANDS
function bollingerBands(lichSu) {
  if (lichSu.length < 20) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const nums = lichSu.slice(0, 20).map(r => r === "Tài" ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 20;
  const variance = nums.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / 20;
  const std = Math.sqrt(variance);
  const last = nums[19];
  if (last > mean + 2 * std) return { diemTai: 0, diemXiu: 78, soPP: 1 };
  if (last < mean - 2 * std) return { diemTai: 78, diemXiu: 0, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 17. STOCHASTIC OSCILLATOR
function stochasticOsc(lichSu) {
  if (lichSu.length < 14) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const k = (nums[13] - lowest) / (highest - lowest) * 100;
  if (k > 85) return { diemTai: 0, diemXiu: 78, soPP: 1 };
  if (k < 15) return { diemTai: 78, diemXiu: 0, soPP: 1 };
  if (k > 75) return { diemTai: 0, diemXiu: 72, soPP: 1 };
  if (k < 25) return { diemTai: 72, diemXiu: 0, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 18. WILLIAMS %R
function williamsR(lichSu) {
  if (lichSu.length < 14) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  const highest = Math.max(...nums), lowest = Math.min(...nums);
  if (highest === lowest) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const wr = (highest - nums[13]) / (highest - lowest) * -100;
  if (wr < -85) return { diemTai: 78, diemXiu: 0, soPP: 1 };
  if (wr > -15) return { diemTai: 0, diemXiu: 78, soPP: 1 };
  if (wr < -75) return { diemTai: 72, diemXiu: 0, soPP: 1 };
  if (wr > -25) return { diemTai: 0, diemXiu: 72, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 19. CCI (COMMODITY CHANNEL INDEX)
function cciIndicator(lichSu) {
  if (lichSu.length < 14) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const nums = lichSu.slice(0, 14).map(r => r === "Tài" ? 1 : 0);
  const mean = nums.reduce((a, b) => a + b, 0) / 14;
  const mad = nums.reduce((sum, x) => sum + Math.abs(x - mean), 0) / 14;
  if (mad === 0) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const cci = (nums[13] - mean) / (0.015 * mad);
  if (cci > 120) return { diemTai: 0, diemXiu: 76, soPP: 1 };
  if (cci < -120) return { diemTai: 76, diemXiu: 0, soPP: 1 };
  if (cci > 100) return { diemTai: 0, diemXiu: 70, soPP: 1 };
  if (cci < -100) return { diemTai: 70, diemXiu: 0, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 20. ENTROPY (ĐỘ HỖN LOẠN)
function entropyAnalysis(lichSu) {
  if (lichSu.length < 20) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const tai20 = lichSu.slice(0, 20).filter(r => r === "Tài").length;
  const p = tai20 / 20;
  if (p === 0) return { diemTai: 82, diemXiu: 0, soPP: 1 };
  if (p === 1) return { diemTai: 0, diemXiu: 82, soPP: 1 };
  const entropy = -p * Math.log2(p) - (1-p) * Math.log2(1-p);
  if (entropy < 0.5) {
    if (p > 0.5) return { diemTai: 78, diemXiu: 0, soPP: 1 };
    else return { diemTai: 0, diemXiu: 78, soPP: 1 };
  }
  if (entropy > 0.95) {
    if (p > 0.5) return { diemTai: 0, diemXiu: 74, soPP: 1 };
    else return { diemTai: 74, diemXiu: 0, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 21. LINEAR REGRESSION
function linearRegression(lichSu) {
  if (lichSu.length < 12) return { diemTai: 0, diemXiu: 0, soPP: 0 };
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
  if (pred > 0.6) return { diemTai: 74, diemXiu: 0, soPP: 1 };
  if (pred < 0.4) return { diemTai: 0, diemXiu: 74, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 22. KNN (K-LÁNG GIỀNG GẦN NHẤT)
function knnPredict(lichSu) {
  if (lichSu.length < 20) return { diemTai: 0, diemXiu: 0, soPP: 0 };
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
  if (taiCount >= 4) return { diemTai: 76, diemXiu: 0, soPP: 1 };
  if (taiCount <= 1) return { diemTai: 0, diemXiu: 76, soPP: 1 };
  if (taiCount === 3) return { diemTai: 68, diemXiu: 0, soPP: 1 };
  if (taiCount === 2) return { diemTai: 0, diemXiu: 68, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 23. DECISION TREE
function decisionTree(lichSu) {
  if (lichSu.length < 10) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const last1 = lichSu[0], last2 = lichSu[1], last3 = lichSu[2];
  const t5 = lichSu.slice(0, 5).filter(r => r === "Tài").length;
  if (last1 === "Tài" && last2 === "Tài" && last3 === "Tài") return { diemTai: 0, diemXiu: 80, soPP: 1 };
  if (last1 === "Xỉu" && last2 === "Xỉu" && last3 === "Xỉu") return { diemTai: 80, diemXiu: 0, soPP: 1 };
  if (last1 === "Tài" && last2 === "Xỉu" && last3 === "Tài") return { diemTai: 0, diemXiu: 76, soPP: 1 };
  if (last1 === "Xỉu" && last2 === "Tài" && last3 === "Xỉu") return { diemTai: 76, diemXiu: 0, soPP: 1 };
  if (t5 >= 4) return { diemTai: 0, diemXiu: 74, soPP: 1 };
  if (t5 <= 1) return { diemTai: 74, diemXiu: 0, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 24. MOMENTUM (ĐÀ TĂNG GIẢM)
function momentum(lichSu) {
  if (lichSu.length < 15) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  const last5 = lichSu.slice(0, 5).filter(r => r === "Tài").length;
  const prev5 = lichSu.slice(5, 10).filter(r => r === "Tài").length;
  const diff = last5 - prev5;
  if (diff >= 3) return { diemTai: 0, diemXiu: 74, soPP: 1 };
  if (diff <= -3) return { diemTai: 74, diemXiu: 0, soPP: 1 };
  if (diff >= 2) return { diemTai: 0, diemXiu: 68, soPP: 1 };
  if (diff <= -2) return { diemTai: 68, diemXiu: 0, soPP: 1 };
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// 25. GAP ANALYSIS (KHOẢNG CÁCH XUẤT HIỆN)
function gapAnalysis(lichSu) {
  if (lichSu.length < 15) return { diemTai: 0, diemXiu: 0, soPP: 0 };
  let lastGap = 0, lastResult = lichSu[0];
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lastResult) {
      lastGap = i;
      break;
    }
  }
  if (lastGap > 5) {
    if (lastResult === "Tài") return { diemTai: 72, diemXiu: 0, soPP: 1 };
    else return { diemTai: 0, diemXiu: 72, soPP: 1 };
  }
  return { diemTai: 0, diemXiu: 0, soPP: 0 };
}

// ==========================================
// TỔNG HỢP TẤT CẢ THUẬT TOÁN
// ==========================================
function tongHopDuDoan(lichSu, tongData) {
  if (lichSu.length < 5) {
    return { du_doan: "Tài", do_tin_cay: 55, giai_thich: "Chưa đủ dữ liệu (cần 5 phiên)" };
  }
  
  const cacPhuongPhap = [
    phanTichBệt(lichSu), tanSuat5(lichSu), tanSuat10(lichSu), tanSuat20(lichSu),
    cau1_1(lichSu), cau2_1(lichSu), cau3_2(lichSu), cauDoiXung(lichSu),
    patternLap3(lichSu), patternLap4(lichSu), tongDiemTB(tongData), xuHuongTongDiem(tongData),
    bienDoTongDiem(tongData), rsiIndicator(lichSu), macdIndicator(lichSu),
    bollingerBands(lichSu), stochasticOsc(lichSu), williamsR(lichSu), cciIndicator(lichSu),
    entropyAnalysis(lichSu), linearRegression(lichSu), knnPredict(lichSu),
    decisionTree(lichSu), momentum(lichSu), gapAnalysis(lichSu)
  ];
  
  let diemTai = 0, diemXiu = 0;
  let soPhuongPhap = 0;
  
  for (let p of cacPhuongPhap) {
    if (p.soPP > 0) {
      soPhuongPhap += p.soPP;
      diemTai += p.diemTai;
      diemXiu += p.diemXiu;
    }
  }
  
  if (soPhuongPhap === 0) {
    const last3 = lichSu.slice(0, 3);
    const tai3 = last3.filter(r => r === "Tài").length;
    return {
      du_doan: tai3 >= 2 ? "Tài" : "Xỉu",
      do_tin_cay: 58,
      giai_thich: "Theo xu hướng 3 phiên"
    };
  }
  
  const finalPred = diemTai > diemXiu ? "Tài" : "Xỉu";
  let doTinCay = Math.abs(diemTai - diemXiu) / (diemTai + diemXiu) * 100;
  doTinCay = Math.min(94, Math.max(55, doTinCay));
  
  return {
    du_doan: finalPred,
    do_tin_cay: Math.round(doTinCay),
    giai_thich: `${soPhuongPhap} phương pháp phân tích | Tài:${Math.round(diemTai)} - Xỉu:${Math.round(diemXiu)}`
  };
}

// ==========================================
// API CHÍNH
// ==========================================
app.get('/sunwin-tx', async (req, res) => {
  try {
    const data = await layDuLieu();
    if (!data) {
      return res.status(503).json({ error: 'Không lấy được dữ liệu từ API nguồn' });
    }
    
    const duDoanTruoc = cache.get(data.phien - 1);
    
    if (duDoanTruoc && duDoanTruoc.du_doan) {
      const dung = capNhatThongKe(data.ket_qua, duDoanTruoc.du_doan);
      lichSuDuDoan.unshift({
        phien: duDoanTruoc.phien_du_doan,
        du_doan: duDoanTruoc.du_doan,
        do_tin_cay: duDoanTruoc.do_tin_cay,
        thuc_te: data.ket_qua,
        ket_qua: dung ? 'ĐÚNG' : 'SAI',
        thoi_gian: new Date().toISOString()
      });
      if (lichSuDuDoan.length > 100) lichSuDuDoan.pop();
    }
    
    lichSuKetQua.unshift(data.ket_qua);
    if (lichSuKetQua.length > 500) lichSuKetQua.pop();
    
    lichSuTongDiem.unshift(data.tong);
    if (lichSuTongDiem.length > 500) lichSuTongDiem.pop();
    
    lichSuXucXac.unshift(data.dice);
    if (lichSuXucXac.length > 500) lichSuXucXac.pop();
    
    if (cache.has(data.phien)) {
      const cached = cache.get(data.phien);
      return res.json({
        success: true,
        game: 'SUNWIN TÀI XỈU',
        phien_hien_tai: data.phien,
        ket_qua_truoc: {
          phien: data.phien,
          ket_qua: data.ket_qua,
          dice: data.dice,
          tong: data.tong
        },
        du_doan: {
          phien_tiep_theo: data.phien + 1,
          du_doan: cached.du_doan,
          do_tin_cay: cached.do_tin_cay + '%',
          giai_thich: cached.giai_thich
        },
        lich_su_du_doan: lichSuDuDoan.slice(0, 30),
        thong_ke: thongKe,
        author: '@tranhoang2286'
      });
    }
    
    const duDoanMoi = tongHopDuDoan(lichSuKetQua, lichSuTongDiem);
    
    cache.set(data.phien, {
      phien_du_doan: data.phien + 1,
      du_doan: duDoanMoi.du_doan,
      do_tin_cay: duDoanMoi.do_tin_cay,
      giai_thich: duDoanMoi.giai_thich
    });
    
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    res.json({
      success: true,
      game: 'SUNWIN TÀI XỈU',
      phien_hien_tai: data.phien,
      ket_qua_truoc: {
        phien: data.phien,
        ket_qua: data.ket_qua,
        dice: data.dice,
        tong: data.tong
      },
      du_doan: {
        phien_tiep_theo: data.phien + 1,
        du_doan: duDoanMoi.du_doan,
        do_tin_cay: duDoanMoi.do_tin_cay + '%',
        giai_thich: duDoanMoi.giai_thich
      },
      lich_su_du_doan: lichSuDuDoan.slice(0, 30),
      thong_ke: thongKe,
      author: '@tranhoang2286'
    });
    
  } catch (err) {
    console.error('Lỗi:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// API LỊCH SỬ
// ==========================================
app.get('/lich-su', (req, res) => {
  res.json({
    lich_su_du_doan: lichSuDuDoan.slice(0, 50),
    lich_su_ket_qua: lichSuKetQua.slice(0, 50),
    thong_ke: thongKe
  });
});

app.get('/thong-ke', (req, res) => {
  res.json({ thong_ke: thongKe });
});

app.get('/', (req, res) => {
  res.json({
    name: '🔥 SUNWIN TÀI XỈU - 25+ THUẬT TOÁN PHÂN TÍCH 🔥',
    author: '@tranhoang2286',
    version: '46.0 - SIÊU MẠNH',
    endpoints: {
      'Dự đoán chính': '/sunwin-tx',
      'Lịch sử dự đoán': '/lich-su',
      'Thống kê': '/thong-ke'
    },
    danh_sach_thuat_toan: [
      '1. Phân tích bệt (Streak) - cấp độ 3-4-5-6+',
      '2. Tần suất 5 phiên',
      '3. Tần suất 10 phiên (Martingale)',
      '4. Tần suất 20 phiên',
      '5. Cầu 1-1 (Zigzag)',
      '6. Cầu 2-1',
      '7. Cầu 3-2',
      '8. Cầu đối xứng',
      '9. Pattern lặp 3-3-3',
      '10. Pattern lặp 4-4-4',
      '11. Phân tích tổng điểm trung bình',
      '12. Xu hướng tổng điểm (Delta)',
      '13. Biên độ tổng điểm',
      '14. RSI (Chỉ báo sức mạnh)',
      '15. MACD (Hội tụ phân kỳ)',
      '16. Bollinger Bands',
      '17. Stochastic Oscillator',
      '18. Williams %R',
      '19. CCI (Commodity Channel Index)',
      '20. Entropy (Độ hỗn loạn)',
      '21. Linear Regression',
      '22. KNN (K-láng giềng)',
      '23. Decision Tree',
      '24. Momentum (Đà tăng/giảm)',
      '25. Gap Analysis (Khoảng cách)'
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🔥 SUNWIN TÀI XỈU - 25+ THUẬT TOÁN - PORT ${PORT}`);
  console.log(`✅ Endpoint: http://localhost:${PORT}/sunwin-tx`);
});
