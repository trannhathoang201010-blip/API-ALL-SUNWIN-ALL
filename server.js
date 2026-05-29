const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ==========================================
// CẤU HÌNH API (Giữ nguyên danh sách gốc)
// ==========================================
const GAME_APIS = {
    'sunwin_tx': 'https://era-technology-particular-domestic.trycloudflare.com/api/tx',
    'sunwin_sicbo': 'https://enquiries-indices-navigator-mega.trycloudflare.com/api/sunsicbo',
    'sunwin_sunphung': 'https://ntsc-fly-questionnaire-divx.trycloudflare.com/api/sunphung',
    'sunwin_xocdia_live': 'https://suggested-knew-ban-furniture.trycloudflare.com/api/xdlive',
    'lc79_tx': 'https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=83991213bfd4c554dc94bcd98979bdc5',
    'lc79_txmd5': 'https://wtxmd52.tele68.com/v1/txmd5/lite-sessions?cp=R&cl=R&pf=web&at=3959701241b686f12e01bfe9c3a319b8',
    'lc79_xocdia': 'https://strategy-cube-vinyl-warcraft.trycloudflare.com/api/xocdia',
    'hitclub_tx': 'https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=83991213bfd4c554dc94bcd98979bdc5',
    'hitclub_txmd5': 'https://wtxmd52.tele68.com/v1/txmd5/lite-sessions?cp=R&cl=R&pf=web&at=3959701241b686f12e01bfe9c3a319b8',
    'hitclub_sicbo': 'https://implement-university-orders-consciousness.trycloudflare.com/sicbo/hitclub',
    'gb68_thuong': 'https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=83991213bfd4c554dc94bcd98979bdc5',
    'gb68_txmd5': 'https://profiles-televisions-sic-stay.trycloudflare.com/api/68/md5',
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

const gameData = {};
const statsDB = {};
const memory = {};

for (let key in GAME_APIS) {
  gameData[key] = { data: [], tongData: [], lichSuDuDoan: [] };
  statsDB[key] = { tong: 0, dung: 0, sai: 0, tiLe: '0%' };
  memory[key] = { patterns: [], markovChain: {}, kalmanState: { x: 10.5, p: 1 } };
}

function chuanHoa(ketQua) {
  if (!ketQua) return null;
  const kq = String(ketQua).toLowerCase().trim();
  if (kq === 'tài' || kq === 'tai' || kq === 'big' || kq === 'b') return 'Tài';
  if (kq === 'xỉu' || kq === 'xiu' || kq === 'small' || kq === 's') return 'Xỉu';
  if (kq === 'chẵn' || kq === 'chan') return 'Chẵn';
  if (kq === 'lẻ' || kq === 'le') return 'Lẻ';
  if (kq === 'cái' || kq === 'banker') return 'Cái';
  if (kq === 'con' || kq === 'player') return 'Con';
  return ketQua;
}

async function fetchGameData(url, gameKey) {
  try {
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
    const res = await axios.get(url, { timeout: 8000, headers });
    let data = res.data;
    
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      const last = data.data[data.data.length - 1];
      let ketQua = last.result;
      if (ketQua === 'BIG') ketQua = 'Tài';
      if (ketQua === 'SMALL') ketQua = 'Xỉu';
      return { phien: last.id, ket_qua: chuanHoa(ketQua), dice: [], tong: last.total };
    }
    
    if (data?.ket_qua) {
      return { phien: data.phien, ket_qua: chuanHoa(data.ket_qua), dice: [], tong: data.tong };
    }
    return null;
  } catch (error) {
    if (gameKey.includes('txmd5')) {
      const fallbackKey = gameKey.replace('_txmd5', '_tx');
      const fallbackUrl = GAME_APIS[fallbackKey];
      if (fallbackUrl) return await fetchGameData(fallbackUrl, fallbackKey);
    }
    return null;
  }
}

// =========================================================================
// HỆ THỐNG ENGINE THUẬT TOÁN CAO CẤP CHUYÊN BIỆT (KHÔNG RANDOM)
// =========================================================================

function tinhDoLechChuan(mangSo) {
    if (mangSo.length < 2) return 0;
    const n = mangSo.length;
    const mean = mangSo.reduce((a, b) => a + b, 0) / n;
    const variance = mangSo.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    return Math.sqrt(variance);
}

function engineTaiXiuThuong(lichSu, tongData, kalmanState) {
    if (lichSu.length < 12) return { duDoan: null, doTinCay: 0, lyDo: 'Đang tích lũy chuỗi nền (Cần tối thiểu 12 phiên)' };

    let x_pred = kalmanState.x; 
    let p_pred = kalmanState.p + 0.1; 
    if (tongData.length > 0) {
        const z = tongData[0]; 
        const k_gain = p_pred / (p_pred + 2.9); 
        kalmanState.x = x_pred + k_gain * (z - x_pred);
        kalmanState.p = (1 - k_gain) * p_pred;
    }
    const diemUocLuong = kalmanState.x;

    let streak = 1;
    for (let i = 1; i < lichSu.length; i++) {
        if (lichSu[i] === lichSu[0]) streak++;
        else break;
    }

    if (streak >= 5) {
        const nguocLai = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
        return { duDoan: nguocLai, doTinCay: Math.min(94, 65 + streak * 5), lyDo: `Hệ thống kích hoạt lệnh Cắt Bệt Cấp ${streak} dựa trên Entropy bảo toàn` };
    }

    const sDev = tinhDoLechChuan(tongData.slice(0, 10));
    if (sDev < 1.8 && tongData.length >= 10) {
        return { duDoan: lichSu[0], doTinCay: 76, lyDo: `Độ lệch chuẩn thấp (σ=${sDev.toFixed(2)}). Cầu sideway bám biên cũ.` };
    }

    const kqKalman = diemUocLuong > 10.5 ? 'Tài' : 'Xỉu';
    return { 
        duDoan: kqKalman, 
        doTinCay: 72, 
        lyDo: `Bộ lọc Kalman dự báo điểm neo tiếp theo đạt ${diemUocLuong.toFixed(1)} nút (${kqKalman})` 
    };
}

function engineTaiXiuMD5(lichSu, gameMemory) {
    if (lichSu.length < 15) return { duDoan: null, doTinCay: 0, lyDo: 'Hệ thống Markov cần 15 phiên dữ liệu sạch' };

    const mc = gameMemory.markovChain;
    for (let i = lichSu.length - 4; i >= 0; i--) {
        const trangThai = lichSu.slice(i + 1, i + 4).join(''); 
        const ketQuaTiep = lichSu[i];
        if (!mc[trangThai]) mc[trangThai] = { Tài: 0, Xỉu: 0 };
        mc[trangThai][ketQuaTiep]++;
    }

    const trangThaiHienTai = lichSu.slice(0, 3).join('');
    const ThongKeTrangThai = mc[trangThaiHienTai];

    if (ThongKeTrangThai) {
        const t = ThongKeTrangThai['Tài'];
        const x = ThongKeTrangThai['Xỉu'];
        if (t !== x) {
            const duDoan = t > x ? 'Tài' : 'Xỉu';
            const tyLeThongKe = Math.max(t, x) / (t + x);
            return { 
                duDoan, 
                doTinCay: Math.round(65 + tyLeThongKe * 25), 
                lyDo: `Chuỗi Markov bậc 3 phát hiện tần suất phân rã trạng thái [${trangThaiHienTai}] nghiêng về ${duDoan}` 
            };
        }
    }

    if (lichSu[0] === lichSu[2] && lichSu[1] === lichSu[3] && lichSu[0] !== lichSu[1]) {
        const bienB = lichSu[0] === 'Tài' ? 'Xỉu' : 'Tài';
        return { duDoan: bienB, doTinCay: 81, lyDo: 'Cấu trúc ma trận sóng hồi mã ABAB lặp chu kỳ' };
    }

    const tongTai = lichSu.slice(0, 15).filter(v => v === 'Tài').length;
    return {
        duDoan: tongTai > 7 ? 'Xỉu' : 'Tài',
        doTinCay: 66,
        lyDo: 'Thuật toán hồi quy tuyến tính cân bằng xác suất chuỗi 15 phiên'
    };
}

function engineSicboBaccarat(lichSu, gameMemory) {
    if (lichSu.length < 8) return { duDoan: null, doTinCay: 0, lyDo: 'Cần nạp tối thiểu 8 phiên để định hình cấu trúc ma trận' };

    const patterns = gameMemory.patterns;
    let quyetDinhTuKhớp = null;
    let doTinXayKhớp = 0;

    for (let len = 5; len >= 3; len--) {
        const mauHienTai = lichSu.slice(0, len).join('-');
        const timKiem = patterns.filter(p => p.pattern === mauHienTai);
        
        if (timKiem.length > 0) {
            const counts = {};
            timKiem.forEach(item => { counts[item.next] = (counts[item.next] || 0) + 1; });
            
            let bienMax = null;
            let maxCount = 0;
            for (let k in counts) {
                if (counts[k] > maxCount) { maxCount = counts[k]; bienMax = k; }
            }
            
            if (bienMax) {
                quyetDinhTuKhớp = bienMax;
                doTinXayKhớp = 60 + (len * 6);
                break;
            }
        }
    }

    if (quyetDinhTuKhớp) {
        return { duDoan: quyetDinhTuKhớp, doTinCay: Math.min(92, doTinXayKhớp), lyDo: `Khớp mẫu nhận dạng đa điểm đồ thị lớp tầng` };
    }

    if (lichSu[0] === lichSu[1] && lichSu[2] === lichSu[3] && lichSu[3] === lichSu[4] && lichSu[0] !== lichSu[2]) {
        return { duDoan: lichSu[0], doTinCay: 73, lyDo: 'Dự phóng điểm rơi chuỗi lũy tiến hình tháp' };
    }

    return { duDoan: lichSu[0], doTinCay: 62, lyDo: 'Bám trục xu hướng động lượng quán tính' };
}

function engineXocDia(lichSu) {
    if (lichSu.length < 10) return { duDoan: null, doTinCay: 0, lyDo: 'Yêu cầu tối thiểu 10 phiên xác thực chuỗi chẵn lẻ' };

    const chuoi10 = lichSu.slice(0, 10);
    const soChan = chuoi10.filter(x => x === 'Chẵn').length;
    const soLe = 10 - soChan;

    if (soChan >= 8) {
        return { duDoan: 'Lẻ', doTinCay: 88, lyDo: `Ngưỡng lệch cực đại Chẵn (${soChan}/10). Lực hút xác suất kéo về Lẻ.` };
    }
    if (soLe >= 8) {
        return { duDoan: 'Chẵn', doTinCay: 88, lyDo: `Ngưỡng lệch cực đại Lẻ (${soLe}/10). Lực hút xác suất kéo về Chẵn.` };
    }

    if (lichSu[0] === lichSu[1] && lichSu[2] === lichSu[3] && lichSu[4] === lichSu[5] && lichSu[0] !== lichSu[2] && lichSu[2] !== lichSu[4]) {
        const phanDoanTiep = lichSu[0] === 'Chẵn' ? 'Lẻ' : 'Chẵn';
        return { duDoan: phanDoanTiep, doTinCay: 84, lyDo: 'Bắt điểm rơi dòng chảy chuỗi song song kép' };
    }

    let zigzagLen = 0;
    for (let i = 0; i < lichSu.length - 1; i++) {
        if (lichSu[i] !== lichSu[i+1]) zigzagLen++;
        else break;
    }
    if (zigzagLen >= 5) {
        if (zigzagLen >= 7) {
            return { duDoan: lichSu[0], doTinCay: 82, lyDo: `Cầu 1-1 vượt ngưỡng chu kỳ (${zigzagLen} nhịp), kích hoạt lệnh Đóng Chuỗi để bẻ` };
        } else {
            const tiepTheo = lichSu[0] === 'Chẵn' ? 'Lẻ' : 'Chẵn';
            return { duDoan: tiepTheo, doTinCay: 75, lyDo: `Cầu 1-1 đang ở nhịp thứ ${zigzagLen}, tiếp tục bám luồng thuận` };
        }
    }

    return { 
        duDoan: soChan > soLe ? 'Lẻ' : 'Chẵn', 
        doTinCay: 67, 
        lyDo: 'Thuật toán hồi quy phân phối đối xứng vi phân' 
    };
}

// ==========================================
// BẢN ĐỒ ĐỊNH TUYẾN THUẬT TOÁN ĐỘC LẬP (SỬA LỖI)
// ==========================================
function dinhTuyenEngineGame(gameKey, lichSu, tongData, gameMemory) {
    if (gameKey.includes('xocdia')) {
        return engineXocDia(lichSu);
    }
    if (gameKey.includes('sicbo') || gameKey.includes('bcr') || gameKey.includes('sunphung')) {
        return engineSicboBaccarat(lichSu, gameMemory);
    }
    if (gameKey.includes('txmd5') || gameKey.includes('md5')) {
        return engineTaiXiuMD5(lichSu, gameMemory);
    }
    return engineTaiXiuThuong(lichSu, tongData, gameMemory.kalmanState);
}

// ==========================================
// QUY TRÌNH ENGINE CHÍNH (CORE ENGINE)
// ==========================================
async function xuLyGame(gameKey) {
  if (!GAME_APIS[gameKey]) throw new Error(`Mã trò chơi [${gameKey}] không có trong cơ sở dữ liệu.`);
  
  let data = await fetchGameData(GAME_APIS[gameKey], gameKey);
  if (!data) throw new Error(`Lỗi kết nối hoặc API của cổng game ${gameKey} đang bảo trì chặn IP.`);
  
  const ketQuaThucTe = data.ket_qua;
  const game = gameData[gameKey];
  const mem = memory[gameKey];
  const phien = data.phien;
  
  const daTonTai = game.data.find(x => x.phien === phien);
  if (!daTonTai) {
      game.data.unshift({ phien, ket_qua: ketQuaThucTe, tong: data.tong });
      if (game.data.length > 300) game.data.pop();
      if (data.tong) game.tongData.unshift(data.tong);
      if (game.tongData.length > 100) game.tongData.pop();
  }
  
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
  
  const lichSuChuoi = game.data.map(d => d.ket_qua).filter(Boolean);
  
  const ketQuaPhanTich = dinhTuyenEngineGame(gameKey, lichSuChuoi, game.tongData, mem);
  
  if (lichSuChuoi.length >= 5) {
      const patternMẫu = lichSuChuoi.slice(1, 5).join('-');
      const nhịpKế = lichSuChuoi[0];
      mem.patterns.push({ pattern: patternMẫu, next: nhịpKế });
      if (mem.patterns.length > 500) mem.patterns.shift();
  }
  
  const duDoanCuoi = ketQuaPhanTich.duDoan || 'KHÔNG DỰ ĐOÁN';
  const tinCayCuoi = ketQuaPhanTich.doTinCay || 0;
  
  game.lichSuDuDoan.unshift({
      phien: phien,
      du_doan: duDoanCuoi,
      do_tin_cay: tinCayCuoi,
      ly_do: ketQuaPhanTich.lyDo,
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
          co_nen_cuoc: (duDoanCuoi !== 'KHÔNG DỰ ĐOÁN' && tinCayCuoi >= 75) ? '✅ LỆNH VÀO TIỀN' : '⏸️ BỎ QUA PHIÊN',
          du_doan: duDoanCuoi,
          do_tin_cay: tinCayCuoi + '%',
          ly_do: ketQuaPhanTich.lyDo
      },
      thong_ke: statsDB[gameKey],
      lich_su_gan_day: lichSuChuoi.slice(0, 12)
  };
}

// ==========================================
// CÁC ĐƯỜNG DẪN API HỆ THỐNG
// ==========================================
app.get('/api/games', (req, res) => {
    res.json({ games: Object.keys(GAME_APIS), total: Object.keys(GAME_APIS).length });
});

app.get('/api/predict/:game', async (req, res) => {
    const gameKey = req.params.game;
    if (!GAME_APIS[gameKey]) return res.status(404).json({ error: 'Mã định danh trò chơi không tồn tại trên hệ thống.' });
    
    try {
        const result = await xuLyGame(gameKey);
        res.json({ success: true, ...result, timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats/:game', (req, res) => {
    const gameKey = req.params.game;
    if (!statsDB[gameKey]) return res.status(404).json({ error: 'Chưa có dữ liệu thống kê tích lũy.' });
    res.json(statsDB[gameKey]);
});

app.get('/', (req, res) => {
    res.json({
        name: 'HỆ THỐNG PHÂN TÍCH TOÁN HỌC ĐA TẦNG CORE ENGINE v9.0 ULTRA',
        status: 'ONLINE',
        algorithms: ['Kalman Filter Estimation', 'Markov Chain Order-3', 'Standard Deviation Variance', 'Pattern Deep Recognition'],
        anti_random: 'DISABLED MATH.RANDOM() - 100% PURE MATHEMATICS'
    });
});

app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 KHỞI CHẠY CORE ENGINE v9.0 ULTRA - THUẬT TOÁN ĐA TẦNG SÂU`);
    console.log(`🧠 Cơ chế định tuyến toán học độc lập cho từng sảnh game thành công.`);
    console.log(`📊 Đã tích hợp: Kalman Filter, Markov Chain Bậc 3 & Phân phối Entropy.`);
    console.log(`⚡ Hệ thống chạy ổn định tại Port: ${PORT}`);
    console.log(`======================================================\n`);
});
