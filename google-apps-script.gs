// ============================================================
// SISTEM KOL SASIH - Google Apps Script
// Ganti SPREADSHEET_ID dengan ID Google Sheet Anda
// ============================================================

const SPREADSHEET_ID = 'PASTE_SHEET_ID_HERE';
const ADMIN_PASSWORD  = 'sasih2024'; // Ganti password Anda

const SHEETS = {
  PECEL_LELE     : 'DATA_PecelLele',
  BOLU_SUNYARAGI : 'DATA_BoluSunyaragi',
  BAKMI_JOWO     : 'DATA_BakmiJowo',
  KOL_MASTER     : 'KOL_Master',
  CONFIG         : 'CONFIG'
};

// Benchmark Cirebon F&B
const BENCHMARK = {
  IG: {
    ER  : { good: 4,     ok: 2     },
    CPM : { good: 10000, ok: 20000 },
    CPE : { good: 300,   ok: 800   }
  },
  TikTok: {
    ER  : { good: 6,    ok: 3    },
    CPM : { good: 5000, ok: 15000 },
    CPV : { good: 30,   ok: 80   },
    CPE : { good: 200,  ok: 500  }
  }
};

// ---- ROUTER GET ----
function doGet(e) {
  try {
    const action = e.parameter.action;
    let result;
    switch (action) {
      case 'getBriefConfig'  : result = getBriefConfig(e.parameter.brand, e.parameter.cabang); break;
      case 'getKOLList'      : result = getKOLList(e.parameter.brand, e.parameter.cabang); break;
      case 'getKOLProfile'   : result = getKOLProfile(e.parameter.nama); break;
      case 'getCampaigns'    : result = getCampaigns(e.parameter.brand, e.parameter.cabang); break;
      case 'getDashboard'    : result = getDashboardData(e.parameter.brand, e.parameter.cabang, e.parameter.dari, e.parameter.sampai); break;
      case 'initSheets'      : result = initSheets(); break;
      default                : result = { status: 'ok', message: 'Sistem KOL Sasih aktif ✅' };
    }
    return out(result);
  } catch(err) {
    return out({ status: 'error', message: err.toString() });
  }
}

// ---- ROUTER POST ----
function doPost(e) {
  try {
    const data   = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;
    switch (action) {
      case 'saveBriefConfig' : result = saveBriefConfig(data); break;
      case 'saveKOL'         : result = saveKOL(data); break;
      case 'saveMonthlyData' : result = saveMonthlyData(data); break;
      default                : result = { status: 'error', message: 'Action tidak dikenal' };
    }
    return out(result);
  } catch(err) {
    return out({ status: 'error', message: err.toString() });
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- INIT SHEETS ----
function initSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const dataHeaders = getDataHeaders();
  const masterHeaders = getMasterHeaders();

  [
    { name: SHEETS.PECEL_LELE,     headers: dataHeaders },
    { name: SHEETS.BOLU_SUNYARAGI, headers: dataHeaders },
    { name: SHEETS.BAKMI_JOWO,     headers: dataHeaders },
    { name: SHEETS.KOL_MASTER,     headers: masterHeaders },
    { name: SHEETS.CONFIG,         headers: ['Brand','Cabang','Config JSON'] }
  ].forEach(def => {
    let sh = ss.getSheetByName(def.name);
    if (!sh) sh = ss.insertSheet(def.name);
    if (sh.getLastRow() === 0) {
      sh.appendRow(def.headers);
      sh.getRange(1,1,1,def.headers.length)
        .setFontWeight('bold').setBackground('#1a3c2e').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
  });
  return { status: 'ok', message: 'Semua sheet berhasil dibuat!' };
}

function getDataHeaders() {
  return ['Bulan','Cabang','Nama KOL','No WA','Username IG','Link IG',
          'Username TikTok','Link TikTok','Platform','Nama Campaign','Link Konten',
          'Tanggal Upload','Tanggal Visit','Paid (Rp)','Barter (Rp)','Total Cost (Rp)',
          'Impressions','Reach','Views','Likes','Comments','Saves','Shares',
          'Total Engagement','ER (%)','CPM (Rp)','CPV (Rp)','CPE (Rp)',
          'Status ER','Status CPM','Status CPV','Status CPE','Catatan'];
}

function getMasterHeaders() {
  return ['Nama KOL','No WA','Username IG','Link IG','Username TikTok','Link TikTok',
          'Brand','Cabang','Bulan','Platform','Nama Campaign','Link Konten',
          'Tanggal Upload','Tanggal Visit','Paid (Rp)','Barter (Rp)','Total Cost (Rp)',
          'Impressions','Reach','Views','Likes','Comments','Saves','Shares',
          'Total Engagement','ER (%)','CPM (Rp)','CPV (Rp)','CPE (Rp)',
          'Status ER','Status CPM','Status CPV','Status CPE','Catatan'];
}

// ---- CONFIG ----
function getBriefConfig(brand, cabang) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.CONFIG);
  if (!sh) return { status: 'ok', config: defaultConfig(brand, cabang) };

  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === brand && rows[i][1] === cabang) {
      try { return { status: 'ok', config: JSON.parse(rows[i][2]) }; }
      catch(e) {}
    }
  }
  return { status: 'ok', config: defaultConfig(brand, cabang) };
}

function saveBriefConfig(data) {
  const ss  = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh    = ss.getSheetByName(SHEETS.CONFIG);
  if (!sh) { sh = ss.insertSheet(SHEETS.CONFIG); sh.appendRow(['Brand','Cabang','Config JSON']); }

  const rows = sh.getDataRange().getValues();
  const json = JSON.stringify(data.config);
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.brand && rows[i][1] === data.cabang) {
      sh.getRange(i+1, 3).setValue(json);
      return { status: 'ok', message: 'Config tersimpan' };
    }
  }
  sh.appendRow([data.brand, data.cabang, json]);
  return { status: 'ok', message: 'Config tersimpan' };
}

function defaultConfig(brand, cabang) {
  return {
    brand, cabang,
    handleIG: '',
    warnaUtama: '#1a3c2e', warnaAksen: '#c9a84c', warnaBackground: '#ffffff',
    logo: '',
    paragrafUtama: 'Isi brief konten utama di sini...',
    paragrafTambahan: '',
    catatanFormat: 'Format konten disesuaikan dengan gaya dan kreativitas masing-masing KOL.',
    dos  : ['Sebutkan nama brand dengan jelas','Tampilkan produk dengan baik','Gunakan hashtag yang disepakati'],
    donts: ['Jangan bandingkan dengan kompetitor','Jangan gunakan musik berlisensi tanpa izin','Jangan posting tanpa persetujuan'],
    deadline: '',
    kampanyePerBulan: {
      Januari:'',Februari:'',Maret:'',April:'',Mei:'',Juni:'',
      Juli:'',Agustus:'',September:'',Oktober:'',November:'',Desember:''
    }
  };
}

// ---- KOL ONBOARDING ----
function saveKOL(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let masterSh = ss.getSheetByName(SHEETS.KOL_MASTER);
  if (!masterSh) { masterSh = ss.insertSheet(SHEETS.KOL_MASTER); masterSh.appendRow(getMasterHeaders()); }

  const rows = masterSh.getDataRange().getValues();
  // Cek duplikat berdasarkan nama + brand + cabang
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.namaKOL && rows[i][6] === data.brand && rows[i][7] === data.cabang) {
      // Update data profil saja
      masterSh.getRange(i+1, 2, 1, 6).setValues([[
        data.noWA, data.usernameIG, data.linkIG, data.usernameTT, data.linkTT, data.brand
      ]]);
      return { status: 'ok', message: 'Data KOL diperbarui' };
    }
  }
  // Tambah KOL baru
  masterSh.appendRow([
    data.namaKOL, data.noWA, data.usernameIG, data.linkIG,
    data.usernameTT, data.linkTT, data.brand, data.cabang,
    data.tanggalVisit, '', '', '', '', '',
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,'','','','',''
  ]);
  return { status: 'ok', message: 'KOL berhasil didaftarkan' };
}

// ---- MONTHLY DATA ----
function saveMonthlyData(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const likes    = n(data.likes);
  const comments = n(data.comments);
  const saves    = n(data.saves);
  const shares   = n(data.shares);
  const reach    = n(data.reach);
  const impressi = n(data.impressions);
  const views    = n(data.views);
  const paid     = n(data.paid);
  const barter   = n(data.barter);
  const totalCost= paid + barter;
  const totalEng = likes + comments + saves + shares;

  const er  = reach    > 0 ? +(totalEng  / reach    * 100).toFixed(2) : 0;
  const cpm = impressi > 0 ? +(totalCost / impressi * 1000).toFixed(0) : 0;
  const cpv = views    > 0 ? +(totalCost / views).toFixed(0)  : 0;
  const cpe = totalEng > 0 ? +(totalCost / totalEng).toFixed(0) : 0;

  const bm       = BENCHMARK[data.platform] || BENCHMARK.IG;
  const statusER = status(er, bm.ER.good, bm.ER.ok, true);
  const statusCPM= status(cpm, bm.CPM.good, bm.CPM.ok, false);
  const statusCPV= bm.CPV ? status(cpv, bm.CPV.good, bm.CPV.ok, false) : 'N/A';
  const statusCPE= status(cpe, bm.CPE.good, bm.CPE.ok, false);

  const row = [
    data.bulan, data.cabang, data.namaKOL, data.noWA,
    data.usernameIG, data.linkIG, data.usernameTT, data.linkTT,
    data.platform, data.campaign, data.linkKonten,
    data.tanggalUpload, data.tanggalVisit,
    paid, barter, totalCost,
    impressi, reach, views,
    likes, comments, saves, shares,
    totalEng, er, cpm, cpv, cpe,
    statusER, statusCPM, statusCPV, statusCPE,
    data.catatan || ''
  ];

  // Simpan ke sheet brand
  const sheetName = brandToSheet(data.brand);
  let dataSh = ss.getSheetByName(sheetName);
  if (!dataSh) { dataSh = ss.insertSheet(sheetName); dataSh.appendRow(getDataHeaders()); }
  dataSh.appendRow(row);
  applyColors(dataSh, dataSh.getLastRow());

  // Simpan ke KOL_Master
  let masterSh = ss.getSheetByName(SHEETS.KOL_MASTER);
  if (!masterSh) { masterSh = ss.insertSheet(SHEETS.KOL_MASTER); masterSh.appendRow(getMasterHeaders()); }
  // Master pakai urutan kolom sedikit berbeda: brand & cabang di tengah
  const masterRow = [
    data.namaKOL, data.noWA, data.usernameIG, data.linkIG, data.usernameTT, data.linkTT,
    data.brand, data.cabang, data.bulan, data.platform, data.campaign, data.linkKonten,
    data.tanggalUpload, data.tanggalVisit,
    paid, barter, totalCost,
    impressi, reach, views,
    likes, comments, saves, shares,
    totalEng, er, cpm, cpv, cpe,
    statusER, statusCPM, statusCPV, statusCPE,
    data.catatan || ''
  ];
  masterSh.appendRow(masterRow);
  applyColors(masterSh, masterSh.getLastRow());

  return {
    status: 'ok',
    message: 'Data berhasil disimpan!',
    metrics: { er, cpm, cpv, cpe, statusER, statusCPM, statusCPV, statusCPE }
  };
}

// ---- KOL LIST ----
function getKOLList(brand, cabang) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.KOL_MASTER);
  if (!sh || sh.getLastRow() < 2) return { status: 'ok', kols: [] };

  const rows = sh.getDataRange().getValues();
  const seen = new Set();
  const kols = [];

  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    if (brand && rows[i][6] !== brand) continue;
    if (cabang && rows[i][7] !== cabang) continue;
    const key = rows[i][0] + '|' + rows[i][6] + '|' + rows[i][7];
    if (seen.has(key)) continue;
    seen.add(key);
    kols.push({ nama: rows[i][0], noWA: rows[i][1], usernameIG: rows[i][2],
                linkIG: rows[i][3], usernameTT: rows[i][4], linkTT: rows[i][5],
                brand: rows[i][6], cabang: rows[i][7] });
  }
  return { status: 'ok', kols };
}

function getKOLProfile(nama) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.KOL_MASTER);
  if (!sh) return { status: 'error' };
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === nama) {
      return { status: 'ok', profile: {
        nama: rows[i][0], noWA: rows[i][1], usernameIG: rows[i][2],
        linkIG: rows[i][3], usernameTT: rows[i][4], linkTT: rows[i][5]
      }};
    }
  }
  return { status: 'error', message: 'KOL tidak ditemukan' };
}

// ---- CAMPAIGNS ----
function getCampaigns(brand, cabang) {
  const result = getBriefConfig(brand, cabang);
  if (result.status !== 'ok') return { status: 'ok', campaigns: [] };
  const kpb = result.config.kampanyePerBulan || {};
  const campaigns = Object.entries(kpb)
    .filter(([,v]) => v)
    .map(([bulan, tema]) => ({ bulan, tema }));
  return { status: 'ok', campaigns };
}

// ---- DASHBOARD ----
function getDashboardData(brand, cabang, dari, sampai) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const bulanOrder = ['Januari','Februari','Maret','April','Mei','Juni',
                      'Juli','Agustus','September','Oktober','November','Desember'];

  const sheetMap = {
    'Pecel Lele Aminoto': SHEETS.PECEL_LELE,
    'Bolu Sunyaragi'    : SHEETS.BOLU_SUNYARAGI,
    'Bakmi Jowo'        : SHEETS.BAKMI_JOWO
  };

  const sheetNames = brand && sheetMap[brand]
    ? [sheetMap[brand]]
    : Object.values(sheetMap);

  const dariIdx   = dari   ? bulanOrder.indexOf(dari)   : 0;
  const sampaiIdx = sampai ? bulanOrder.indexOf(sampai) : 11;

  let allData = [];

  sheetNames.forEach(sn => {
    const sh = ss.getSheetByName(sn);
    if (!sh || sh.getLastRow() < 2) return;
    const rows = sh.getDataRange().getValues();
    const brandName = Object.keys(sheetMap).find(k => sheetMap[k] === sn) || sn;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0]) continue;
      const bIdx = bulanOrder.indexOf(r[0]);
      if (bIdx < dariIdx || bIdx > sampaiIdx) continue;
      if (cabang && cabang !== 'all' && r[1] !== cabang) continue;
      allData.push({
        bulan: r[0], bIdx, cabang: r[1], brand: brandName,
        namaKOL: r[2], platform: r[8], campaign: r[9],
        totalCost: +r[15]||0, impressions: +r[16]||0, reach: +r[17]||0,
        views: +r[18]||0, likes: +r[19]||0, comments: +r[20]||0,
        saves: +r[21]||0, shares: +r[22]||0, totalEng: +r[23]||0,
        er: +r[24]||0, cpm: +r[25]||0, cpv: +r[26]||0, cpe: +r[27]||0
      });
    }
  });

  // Per cabang aggregate
  const cabangMap = {};
  allData.forEach(d => {
    const k = d.brand + '|' + d.cabang;
    if (!cabangMap[k]) cabangMap[k] = { brand: d.brand, cabang: d.cabang,
      totalViews:0, totalEng:0, count:0, ers:[], cpms:[], cpvs:[], cpes:[] };
    const c = cabangMap[k];
    c.totalViews += d.views; c.totalEng += d.totalEng; c.count++;
    if (d.er>0)  c.ers.push(d.er);
    if (d.cpm>0) c.cpms.push(d.cpm);
    if (d.cpv>0) c.cpvs.push(d.cpv);
    if (d.cpe>0) c.cpes.push(d.cpe);
  });
  const cabangStats = Object.values(cabangMap).map(c => ({
    ...c,
    avgER : avg(c.ers), avgCPM: avg(c.cpms),
    avgCPV: avg(c.cpvs), avgCPE: avg(c.cpes)
  }));

  // Top 3 KOL
  const kolMap = {};
  allData.forEach(d => {
    if (!kolMap[d.namaKOL]) kolMap[d.namaKOL] = { nama: d.namaKOL, ers:[], cpms:[], cpes:[] };
    if (d.er>0)  kolMap[d.namaKOL].ers.push(d.er);
    if (d.cpm>0) kolMap[d.namaKOL].cpms.push(d.cpm);
    if (d.cpe>0) kolMap[d.namaKOL].cpes.push(d.cpe);
  });
  const topKOL = Object.values(kolMap)
    .map(k => ({ nama: k.nama, avgER: avg(k.ers), avgCPM: avg(k.cpms), avgCPE: avg(k.cpes) }))
    .sort((a,b) => b.avgER - a.avgER).slice(0,3);

  // Trend per bulan
  const bulanMap = {};
  allData.forEach(d => {
    if (!bulanMap[d.bulan]) bulanMap[d.bulan] = { bulan: d.bulan, bIdx: d.bIdx, totalViews:0, ers:[] };
    bulanMap[d.bulan].totalViews += d.views;
    if (d.er>0) bulanMap[d.bulan].ers.push(d.er);
  });
  const trendBulan = Object.values(bulanMap)
    .sort((a,b) => a.bIdx - b.bIdx)
    .map(b => ({ bulan: b.bulan, avgER: avg(b.ers), totalViews: b.totalViews }));

  return { status: 'ok', cabangStats, topKOL, trendBulan };
}

// ---- HELPERS ----
function n(v) { return parseInt(v) || 0; }
function avg(arr) { return arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2) : 0; }

function status(val, good, ok, higherIsBetter) {
  if (higherIsBetter) return val >= good ? '🟢' : val >= ok ? '🟡' : '🔴';
  return val <= good ? '🟢' : val <= ok ? '🟡' : '🔴';
}

function applyColors(sh, row) {
  // Kolom 29-32 adalah status ER, CPM, CPV, CPE
  [29,30,31,32].forEach(col => {
    const cell = sh.getRange(row, col);
    const v    = cell.getValue();
    if (v === '🟢') cell.setBackground('#d4edda');
    else if (v === '🟡') cell.setBackground('#fff3cd');
    else if (v === '🔴') cell.setBackground('#f8d7da');
  });
}

function brandToSheet(brand) {
  if (brand.includes('Pecel')) return SHEETS.PECEL_LELE;
  if (brand.includes('Bolu'))  return SHEETS.BOLU_SUNYARAGI;
  if (brand.includes('Bakmi')) return SHEETS.BAKMI_JOWO;
  return SHEETS.PECEL_LELE;
}
