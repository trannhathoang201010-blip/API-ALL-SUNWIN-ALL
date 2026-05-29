const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// DANH SÁCH API (CHỈ GIỮ LẠI API MỚI)
// ==========================================
const GAME_APIS = {
  // LC79 HŨ
  'lc79_tx': 'https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=83991213bfd4c554dc94bcd98979bdc5',
  
  // LC79 BÀN MD5
  'lc79_txmd5': 'https://wtxmd52.tele68.com/v1/txmd5/lite-sessions?cp=R&cl=R&pf=web&at=3959701241b686f12e01bfe9c3a319b8',
  
  // HITCLUB MD5 (CẦN THÊM TOKEN)
  'hitclub_txmd5': 'https://wtxmd52.tele68.com/v1/txmd5/lite-sessions?cp=R&cl=R&pf=web&at=',
  
  // HITCLUB HŨ (CẦN THÊM TOKEN)
  'hitclub_tx': 'https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=',
  
  // 68GB MD5
  'gb68_txmd5': 'https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=83991213bfd4c554dc94bcd98979bdc5',
  
  // SUNWIN SICBO (API WS)
  'sunwin_sicbo': 'https://api.wsktnus8.net/v2/history/getLastResult?gameId=ktrng_3979&size=100&tableId=39791215743193&curPage=1'
};

// ==========================================
// LƯU TRỮ DỮ LIỆU CHO TỪNG GAME
// ==========================================
const gameData = {};
const statsDB = {};
const memory = {};

for (let key in GAME_APIS) {
  gameData[key] = { data: [], tongData: [], lichSuDuDoan: [] };
  statsDB[key] = { tong: 0, dung: 0, sai: 0, tiLe: '0%' };
  memory[key] = { patterns: [], markovChain: {}, kalmanState: { x: 10.5, p: 1 } };
}

// ==========================================
// HÀM CHUẨN HÓA KẾT QUẢ
// ==========================================
function chuanHoa(ketQua) {
  if (!ketQua) return null;
  const kq = String(ketQua).toLowerCase().trim();
  if (kq === 'tài' || kq === 'tai' || kq === 'big' || kq === 'b' || kq === 'tai' || kq === 'tài') return 'Tài';
  if (kq === 'xỉu' || kq === 'xiu' || kq === 'small' || kq === 's' || kq === 'xiu' || kq === 'xỉu') return 'Xỉu';
  if (kq === 'chẵn' || kq === 'chan') return 'Chẵn';
  if (kq === 'lẻ' || kq === 'le') return 'Lẻ';
  return ketQua;
}

// ==========================================
// HÀM FETCH DATA - XỬ LÝ NHIỀU ĐỊNH DẠNG API
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
    
    // ========== XỬ LÝ API TELE68 (lc79_tx, lc79_txmd5, hitclub, gb68) ==========
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
    
    // ========== XỬ LÝ API SUNWIN SICBO (wsktnus8.net) ==========
    if (data.data && data.data.resultList && Array.isArray(data.data.resultList) && data.data.resultList.length > 0) {
      const lastItem = data.data.resultList[0];
      let ketQua = '';
      // resultType: 3=Tài, 4=Xỉu, 11=Bão
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
    
    console.log(`⚠️ [${gameKey}] Không xác định được cấu trúc data:`, Object.keys(data));
    return null;
    
  } catch (error) {
    console.error(`❌ Fetch lỗi ${gameKey}:`, error.message);
    return null;
  }
}

// ==========================================
// HÀM TÍNH ĐỘ LỆCH CHUẨN
// ==========================================
function tinhDoLechChuan(mangSo) {
  if (mangSo.length < 2) return 0;
  const n = mangSo.length;
  const mean = mangSo.reduce((a, b) => a + b, 0) / n;
  const variance = mangSo.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
  return Math.sqrt(variance);
}

// ==========================================
// ENGINE TÀI XỈU THƯỜNG (KALMAN FILTER)
// ==========================================
function engineTaiXiuThuong(lichSu, tongData, kalmanState) {
  if (lichSu.length < 12) {
    return { duDoan: null, doTinCay: 0, lyDo: `Đang tích lũy chuỗi (${lichSu.length}/12)` };
  }

  // Bộ lọc Kalman ước lượng điểm số
  let x_pred = kalmanState.x; 
  let p_pred = kalmanState.p + 0.1; 
  if (tongData.length > 0) {
    const z = tongData[0]; 
    const k_gain = p_pred / (p_pred + 2.9); 
    kalmanState.x = x_pred + k_gain * (z - x_pred);
    kalmanState.p = (1 - k_gain) * p_pred;
  }
  const diemUocLuong = kalmanState.x;

  // Phát hiện bệt
  let streak = 1;
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[0]) streak++;
    else break;
  }

  if (streak >= 5) {
    const nguocLai = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
    return { 
      duDoan: nguocLai, 
      doTinCay: Math.min(94, 65 + streak * 5), 
      lyDo: `🔥 Bệt ${streak} phiên ${lichSu[0]} => BẺ CẦU` 
    };
  }

  // Độ lệch chuẩn thấp -> cầu sideway
  const sDev = tinhDoLechChuan(tongData.slice(0, 10));
  if (sDev < 1.8 && tongData.length >= 10) {
    return { 
      duDoan: lichSu[0], 
      doTinCay: 76, 
      lyDo: `📊 Độ lệch chuẩn thấp (σ=${sDev.toFixed(2)}) => Theo cầu` 
    };
  }

  // Dự đoán theo Kalman
  const kqKalman = diemUocLuong > 10.5 ? 'Tài' : 'Xỉu';
  return { 
    duDoan: kqKalman, 
    doTinCay: 72, 
    lyDo: `🎯 Kalman dự báo điểm ${diemUocLuong.toFixed(1)} => ${kqKalman}` 
  };
}

// ==========================================
// ENGINE TÀI XỈU MD5 (MARKOV CHAIN BẬC 3)
// ==========================================
function engineTaiXiuMD5(lichSu, gameMemory) {
  if (lichSu.length < 15) {
    return { duDoan: null, doTinCay: 0, lyDo: `Đang tích lũy Markov (${lichSu.length}/15)` };
  }

  const mc = gameMemory.markovChain;
  
  // Xây dựng ma trận Markov bậc 3
  for (let i = lichSu.length - 4; i >= 0; i--) {
    const trangThai = lichSu.slice(i + 1, i + 4).join(''); 
    const ketQuaTiep = lichSu[i];
    if (!mc[trangThai]) mc[trangThai] = { Tài: 0, Xỉu: 0 };
    mc[trangThai][ketQuaTiep]++;
  }

  // Dự đoán dựa trên trạng thái hiện tại
  const trangThaiHienTai = lichSu.slice(0, 3).join('');
  const thongKe = mc[trangThaiHienTai];

  if (thongKe) {
    const t = thongKe['Tài'];
    const x = thongKe['Xỉu'];
    if (t !== x) {
      const duDoan = t > x ? 'Tài' : 'Xỉu';
      const tyLe = Math.max(t, x) / (t + x);
      return { 
        duDoan, 
        doTinCay: Math.round(65 + tyLe * 25), 
        lyDo: `🔗 Markov [${trangThaiHienTai}] => ${duDoan} (${Math.round(tyLe*100)}%)` 
      };
    }
  }

  // Cấu trúc ABAB
  if (lichSu[0] === lichSu[2] && lichSu[1] === lichSu[3] && lichSu[0] !== lichSu[1]) {
    const bienB = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
    return { duDoan: bienB, doTinCay: 81, lyDo: `🔄 Cấu trúc ABAB => ${bienB}` };
  }

  // Fallback: theo xu hướng 15 phiên
  const tongTai = lichSu.slice(0, 15).filter(v => v === 'Tài').length;
  const duDoan = tongTai > 7 ? 'Xỉu' : 'Tài';
  return {
    duDoan,
    doTinCay: 66,
    lyDo: `📈 Hồi quy 15 phiên (${tongTai}T - ${15-tongTai}X) => ${duDoan}`
  };
}

// ==========================================
// ENGINE SUNWIN SICBO (XỬ LÝ RIÊNG)
// ==========================================
function engineSunwinSicbo(lichSu, tongData) {
  if (lichSu.length < 10) {
    return { duDoan: null, doTinCay: 0, lyDo: `Đang tích lũy (${lichSu.length}/10)` };
  }

  // Phân tích bệt
  let streak = 1;
  for (let i = 1; i < lichSu.length; i++) {
    if (lichSu[i] === lichSu[0]) streak++;
    else break;
  }

  if (streak >= 4) {
    const nguocLai = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
    return { 
      duDoan: nguocLai, 
      doTinCay: Math.min(92, 70 + streak * 4), 
      lyDo: `🔥 Bệt ${streak} phiên => BẺ CẦU` 
    };
  }

  // Phân tích tần suất 10 phiên
  const last10 = lichSu.slice(0, 10);
  const tai10 = last10.filter(r => r === 'Tài').length;
  
  if (tai10 >= 8) {
    return { duDoan: 'Xỉu', doTinCay: 85, lyDo: `📊 10 phiên ${tai10}T - ${10-tai10}X => BẮT XỈU` };
  }
  if (tai10 <= 2) {
    return { duDoan: 'Tài', doTinCay: 85, lyDo: `📊 10 phiên ${tai10}T - ${10-tai10}X => BẮT TÀI` };
  }

  // Cầu 1-1
  let isZigzag = true;
  for (let i = 1; i < 5; i++) {
    if (lichSu[i] === lichSu[i-1]) { isZigzag = false; break; }
  }
  if (isZigzag) {
    const duDoan = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
    return { duDoan, doTinCay: 78, lyDo: `🎯 Cầu 1-1 đang chạy => ${duDoan}` };
  }

  // Fallback: theo xu hướng
  return {
    duDoan: tai10 >= 5 ? 'Tài' : 'Xỉu',
    doTinCay: 65,
    lyDo: `⚖️ Theo xu hướng chính (${tai10}T - ${10-tai10}X)`
  };
}

// ==========================================
// ĐỊNH TUYẾN ENGINE THEO GAME
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
  if (!data) throw new Error(`Không lấy được data từ API ${gameKey}. Kiểm tra lại link hoặc token.`);
  
  const ketQuaThucTe = data.ket_qua;
  const game = gameData[gameKey];
  const mem = memory[gameKey];
  const phien = data.phien;
  
  // Cập nhật lịch sử (tránh trùng phiên)
  const daTonTai = game.data.find(x => x.phien === phien);
  if (!daTonTai) {
    game.data.unshift({ phien, ket_qua: ketQuaThucTe, tong: data.tong });
    if (game.data.length > 300) game.data.pop();
    if (data.tong && typeof data.tong === 'number') {
      game.tongData.unshift(data.tong);
      if (game.tongData.length > 100) game.tongData.pop();
    }
  }
  
  // Kiểm tra dự đoán cũ (tính tỷ lệ đúng/sai)
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
  
  // Lấy chuỗi lịch sử (chỉ lấy Tài/Xỉu)
  const lichSuChuoi = game.data.map(d => d.ket_qua).filter(k => k === 'Tài' || k === 'Xỉu');
  const tongData = game.tongData;
  
  // Dự đoán phiên tiếp theo
  const ketQuaPhanTich = dinhTuyenEngine(gameKey, lichSuChuoi, tongData, mem);
  
  // Học pattern cho lần sau
  if (lichSuChuoi.length >= 5) {
    const patternMau = lichSuChuoi.slice(1, 5).join('-');
    const nhipKe = lichSuChuoi[0];
    mem.patterns.push({ pattern: patternMau, next: nhipKe });
    if (mem.patterns.length > 500) mem.patterns.shift();
  }
  
  const duDoanCuoi = ketQuaPhanTich.duDoan || 'KHÔNG DỰ ĐOÁN';
  const tinCayCuoi = ketQuaPhanTich.doTinCay || 0;
  
  // Lưu dự đoán
  game.lichSuDuDoan.unshift({
    phien: phien,
    du_doan: duDoanCuoi,
    do_tin_cay: tinCayCuoi,
    ly_do: ketQuaPhanTich.lyDo || 'Phân tích toán học',
    ket_qua: 'CHỜ',
    thoi_gian: Date.now()
  });
  if (game.lichSuDuDoan.length > 100) game.lichSuDuDoan.pop();
  
  return {
    game: gameKey,
    phien_hien_tai: phien,
    ket_qua_thuc_te: ketQuaThucTe,
    du_doan: {
      phien_tiep: phien + 1,
      co_nen_cuoc: (duDoanCuoi !== 'KHÔNG DỰ ĐOÁN' && tinCayCuoi >= 70) ? '✅ NÊN CƯỢC' : '⏸️ BỎ QUA',
      du_doan: duDoanCuoi,
      do_tin_cay: tinCayCuoi + '%',
      ly_do: ketQuaPhanTich.lyDo || 'Chưa đủ cơ sở'
    },
    thong_ke: statsDB[gameKey],
    lich_su_gan_day: lichSuChuoi.slice(0, 12)
  };
}

// ==========================================
// API ENDPOINTS
// ==========================================

app.get('/api/games', (req, res) => {
  res.json({ 
    games: Object.keys(GAME_APIS), 
    total: Object.keys(GAME_APIS).length,
    note: 'Hitclub cần thêm token vào link API'
  });
});

app.get('/api/predict/:game', async (req, res) => {
  const gameKey = req.params.game;
  if (!GAME_APIS[gameKey]) {
    return res.status(404).json({ 
      error: 'Game không tồn tại',
      available: Object.keys(GAME_APIS)
    });
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
  if (!statsDB[gameKey]) return res.status(404).json({ error: 'Chưa có dữ liệu' });
  res.json(statsDB[gameKey]);
});

app.get('/', (req, res) => {
  res.json({
    name: '🔥 API TÀI XỈU - PHIÊN BẢN THU GỌN 🔥',
    status: 'ONLINE',
    games: Object.keys(GAME_APIS),
    algorithms: ['Kalman Filter', 'Markov Chain Bậc 3', 'Pattern Recognition'],
    note: 'Hitclub cần token, sunwin_sicbo hoạt động qua wsktnus8.net'
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 API TÀI XỈU - THU GỌN`);
  console.log(`📊 ${Object.keys(GAME_APIS).length} GAME ĐƯỢC QUẢN LÝ:`);
  Object.keys(GAME_APIS).forEach(key => console.log(`   - ${key}`));
  console.log(`⚡ Port: ${PORT}`);
  console.log(`======================================================\n`);
});
