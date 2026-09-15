/**
 * ==============================================================================
 * SISTEM ADMINISTRASI KELAS 6 - MIS COKROAMINOTO PANYINGKIRAN (TP 2026/2027)
 * BACKEND REST API - GOOGLE APPS SCRIPT
 * ==============================================================================
 * Pengembang: System Analyst & Software Engineer
 * Tanggal Release: 2026
 * ==============================================================================
 */

// Global Config & Sheet Names
const SHEET_NAMES = {
  SISWA: 'SISWA',
  GURU: 'GURU',
  KELAS: 'KELAS',
  NILAI: 'NILAI',
  ABSENSI: 'ABSENSI',
  LOG: 'LOG',
  USERS: 'USERS'
};

/**
 * Mendapatkan instance Spreadsheet aktif
 */
function getDb() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Inisialisasi otomatis struktur sheet dan header jika belum tersedia
 */
function initDatabase() {
  const ss = getDb();
  
  const headersMap = {
    [SHEET_NAMES.SISWA]: ['ID', 'NISN', 'NIS', 'Nama Lengkap', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Kelas', 'Nama Ayah', 'Nama Ibu', 'No HP Orang Tua', 'Alamat', 'Status Siswa', 'Tanggal Input', 'Terakhir Diubah'],
    [SHEET_NAMES.GURU]: ['ID', 'NIP/NIK', 'Nama Guru', 'Jenis Kelamin', 'Mata Pelajaran', 'Jabatan', 'No HP', 'Email', 'Status'],
    [SHEET_NAMES.KELAS]: ['ID', 'Nama Kelas', 'Wali Kelas', 'Tahun Pelajaran', 'Jumlah Siswa'],
    [SHEET_NAMES.NILAI]: ['ID', 'NISN', 'Nama Siswa', 'Kelas', 'Mata Pelajaran', 'Nilai Tugas', 'Nilai STS', 'Nilai SAS', 'Nilai Akhir', 'Predikat', 'Keterangan'],
    [SHEET_NAMES.ABSENSI]: ['ID', 'NISN', 'Nama Siswa', 'Kelas', 'Tanggal', 'Status Kehadiran', 'Keterangan'],
    [SHEET_NAMES.LOG]: ['Timestamp', 'User', 'Aktivitas', 'Data', 'Status'],
    [SHEET_NAMES.USERS]: ['Username', 'PasswordHash', 'Nama', 'Role']
  };

  for (const [sheetName, headers] of Object.entries(headersMap)) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0f5132').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  }

  // Set default admin if USERS sheet is empty
  const userSheet = ss.getSheetByName(SHEET_NAMES.USERS);
  if (userSheet.getLastRow() <= 1) {
    userSheet.appendRow(['admin', 'admin123', 'Robby', 'Administrator']);
  }
}

/**
 * Standard JSON Response Builder
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * HTTP GET Endpoint
 */
function doGet(e) {
  initDatabase();
  const action = e.parameter.action || '';
  
  try {
    switch (action) {
      case 'getDashboardStats':
        return createJsonResponse(getDashboardStats());
      case 'getStudents':
        return createJsonResponse({ success: true, data: getAllRows(SHEET_NAMES.SISWA) });
      case 'getTeachers':
        return createJsonResponse({ success: true, data: getAllRows(SHEET_NAMES.GURU) });
      case 'getClasses':
        return createJsonResponse({ success: true, data: getAllRows(SHEET_NAMES.KELAS) });
      case 'getGrades':
        return createJsonResponse({ success: true, data: getAllRows(SHEET_NAMES.NILAI) });
      case 'getAttendance':
        return createJsonResponse({ success: true, data: getAllRows(SHEET_NAMES.ABSENSI) });
      case 'getLogs':
        return createJsonResponse({ success: true, data: getAllRows(SHEET_NAMES.LOG) });
      default:
        return createJsonResponse({ success: true, message: 'API Administrasi Kelas 6 MIS Cokroaminoto Panyingkiran Aktif' });
    }
  } catch (error) {
    return createJsonResponse({ success: false, message: 'Terjadi kesalahan server: ' + error.message });
  }
}

/**
 * HTTP POST Endpoint
 */
function doPost(e) {
  initDatabase();
  try {
    let requestData = {};
    if (e.postData && e.postData.contents) {
      requestData = JSON.parse(e.postData.contents);
    } else {
      requestData = e.parameter;
    }

    const action = requestData.action || '';
    const currentUser = requestData.currentUser || 'Robby';

    switch (action) {
      case 'login':
        return createJsonResponse(handleLogin(requestData.username, requestData.password));
      case 'addStudent':
        return createJsonResponse(addStudent(requestData.data, currentUser));
      case 'updateStudent':
        return createJsonResponse(updateStudent(requestData.id, requestData.data, currentUser));
      case 'deleteStudent':
        return createJsonResponse(deleteStudent(requestData.id, currentUser));
      case 'importStudents':
        return createJsonResponse(importStudents(requestData.students, currentUser));
      case 'addTeacher':
        return createJsonResponse(addTeacher(requestData.data, currentUser));
      case 'updateTeacher':
        return createJsonResponse(updateTeacher(requestData.id, requestData.data, currentUser));
      case 'deleteTeacher':
        return createJsonResponse(deleteTeacher(requestData.id, currentUser));
      case 'addGrade':
        return createJsonResponse(addGrade(requestData.data, currentUser));
      case 'updateGrade':
        return createJsonResponse(updateGrade(requestData.id, requestData.data, currentUser));
      case 'deleteGrade':
        return createJsonResponse(deleteGrade(requestData.id, currentUser));
      case 'addAttendance':
        return createJsonResponse(addAttendance(requestData.data, currentUser));
      case 'changePassword':
        return createJsonResponse(changePassword(requestData.username, requestData.oldPassword, requestData.newPassword, currentUser));
      case 'backupDatabase':
        return createJsonResponse(backupDatabase(currentUser));
      default:
        return createJsonResponse({ success: false, message: 'Aksi POST tidak valid.' });
    }
  } catch (error) {
    return createJsonResponse({ success: false, message: 'Gagal memproses permintaan: ' + error.message });
  }
}

// ==========================================
// DATA ACCESS & LOGIC HELPER FUNCTIONS
// ==========================================

function getAllRows(sheetName) {
  const sheet = getDb().getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let val = row[index];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      obj[header] = val;
    });
    return obj;
  });
}

function handleLogin(username, password) {
  const users = getAllRows(SHEET_NAMES.USERS);
  const found = users.find(u => String(u.Username).toLowerCase() === String(username).toLowerCase() && String(u.PasswordHash) === String(password));
  
  if (found) {
    addLogEntry(found.Nama, 'Login Administrator', 'Login Ke Sistem', 'BERHASIL');
    return {
      success: true,
      message: 'Login Berhasil',
      user: { username: found.Username, nama: found.Nama, role: found.Role }
    };
  } else {
    addLogEntry(username || 'Anonim', 'Login Administrator', 'Percobaan Login Gagal', 'GAGAL');
    return { success: false, message: 'Username atau Password salah!' };
  }
}

function addStudent(data, currentUser) {
  const sheet = getDb().getSheetByName(SHEET_NAMES.SISWA);
  const students = getAllRows(SHEET_NAMES.SISWA);
  
  // Validasi NISN ganda
  const exists = students.some(s => String(s.NISN).trim() === String(data.nisn).trim());
  if (exists) {
    addLogEntry(currentUser, 'Tambah Siswa', `Gagal: NISN ${data.nisn} sudah terdaftar`, 'GAGAL');
    return { success: false, message: 'NISN sudah terdaftar.' };
  }

  const id = 'SIS-' + new Date().getTime();
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

  const newRow = [
    id,
    data.nisn,
    data.nis || '-',
    data.nama,
    data.jk,
    data.tempatLahir || '-',
    data.tanggalLahir || '-',
    data.kelas || '6',
    data.namaAyah || '-',
    data.namaIbu || '-',
    data.noHpOrtu || '-',
    data.alamat || '-',
    data.status || 'Aktif',
    now,
    now
  ];

  sheet.appendRow(newRow);
  addLogEntry(currentUser, 'Tambah Siswa', `Menambahkan siswa: ${data.nama} (NISN: ${data.nisn})`, 'BERHASIL');
  return { success: true, message: 'Data siswa berhasil disimpan.' };
}

function updateStudent(id, data, currentUser) {
  const sheet = getDb().getSheetByName(SHEET_NAMES.SISWA);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf('ID');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) {
      const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
      
      sheet.getRange(i + 1, headers.indexOf('NISN') + 1).setValue(data.nisn);
      sheet.getRange(i + 1, headers.indexOf('NIS') + 1).setValue(data.nis);
      sheet.getRange(i + 1, headers.indexOf('Nama Lengkap') + 1).setValue(data.nama);
      sheet.getRange(i + 1, headers.indexOf('Jenis Kelamin') + 1).setValue(data.jk);
      sheet.getRange(i + 1, headers.indexOf('Tempat Lahir') + 1).setValue(data.tempatLahir);
      sheet.getRange(i + 1, headers.indexOf('Tanggal Lahir') + 1).setValue(data.tanggalLahir);
      sheet.getRange(i + 1, headers.indexOf('Kelas') + 1).setValue(data.kelas);
      sheet.getRange(i + 1, headers.indexOf('Nama Ayah') + 1).setValue(data.namaAyah);
      sheet.getRange(i + 1, headers.indexOf('Nama Ibu') + 1).setValue(data.namaIbu);
      sheet.getRange(i + 1, headers.indexOf('No HP Orang Tua') + 1).setValue(data.noHpOrtu);
      sheet.getRange(i + 1, headers.indexOf('Alamat') + 1).setValue(data.alamat);
      sheet.getRange(i + 1, headers.indexOf('Status Siswa') + 1).setValue(data.status);
      sheet.getRange(i + 1, headers.indexOf('Terakhir Diubah') + 1).setValue(now);

      addLogEntry(currentUser, 'Edit Siswa', `Mengubah data siswa ID: ${id} (${data.nama})`, 'BERHASIL');
      return { success: true, message: 'Data siswa berhasil diperbarui.' };
    }
  }
  return { success: false, message: 'Data siswa tidak ditemukan.' };
}

function deleteStudent(id, currentUser) {
  const sheet = getDb().getSheetByName(SHEET_NAMES.SISWA);
  const values = sheet.getDataRange().getValues();
  const idIndex = values[0].indexOf('ID');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) {
      const namaSiswa = values[i][values[0].indexOf('Nama Lengkap')];
      sheet.deleteRow(i + 1);
      addLogEntry(currentUser, 'Hapus Siswa', `Menghapus siswa ID: ${id} (${namaSiswa})`, 'BERHASIL');
      return { success: true, message: 'Data siswa berhasil dihapus.' };
    }
  }
  return { success: false, message: 'Data tidak ditemukan.' };
}

function importStudents(studentsList, currentUser) {
  const sheet = getDb().getSheetByName(SHEET_NAMES.SISWA);
  const existingStudents = getAllRows(SHEET_NAMES.SISWA);
  const existingNisns = new Set(existingStudents.map(s => String(s.NISN).trim()));

  let importedCount = 0;
  let skippedCount = 0;
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

  studentsList.forEach(item => {
    if (item.nisn && !existingNisns.has(String(item.nisn).trim())) {
      const id = 'SIS-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
      sheet.appendRow([
        id,
        item.nisn,
        item.nis || '-',
        item.nama,
        item.jk || 'L',
        item.tempatLahir || '-',
        item.tanggalLahir || '-',
        item.kelas || '6',
        item.namaAyah || '-',
        item.namaIbu || '-',
        item.noHpOrtu || '-',
        item.alamat || '-',
        item.status || 'Aktif',
        now,
        now
      ]);
      existingNisns.add(String(item.nisn).trim());
      importedCount++;
    } else {
      skippedCount++;
    }
  });

  addLogEntry(currentUser, 'Import Siswa Batch', `Import ${importedCount} data, terlewat/ganda ${skippedCount}`, 'BERHASIL');
  return {
    success: true,
    message: `Berhasil mengimpor ${importedCount} data siswa. (${skippedCount} diabaikan/ganda)`,
    importedCount,
    skippedCount
  };
}

function addTeacher(data, currentUser) {
  const sheet = getDb().getSheetByName(SHEET_NAMES.GURU);
  const id = 'GUR-' + new Date().getTime();

  sheet.appendRow([
    id,
    data.nip,
    data.nama,
    data.jk,
    data.mapel,
    data.jabatan,
    data.noHp,
    data.email,
    data.status || 'Aktif'
  ]);

  addLogEntry(currentUser, 'Tambah Guru', `Menambahkan guru: ${data.nama}`, 'BERHASIL');
  return { success: true, message: 'Data guru berhasil disimpan.' };
}

function updateTeacher(id, data, currentUser) {
  const sheet = getDb().getSheetByName(SHEET_NAMES.GURU);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf('ID');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) {
      sheet.getRange(i + 1, headers.indexOf('NIP/NIK') + 1).setValue(data.nip);
      sheet.getRange(i + 1, headers.indexOf('Nama Guru') + 1).setValue(data.nama);
      sheet.getRange(i + 1, headers.indexOf('Jenis Kelamin') + 1).setValue(data.jk);
      sheet.getRange(i + 1, headers.indexOf('Mata Pelajaran') + 1).setValue(data.mapel);
      sheet.getRange(i + 1, headers.indexOf('Jabatan') + 1).setValue(data.jabatan);
      sheet.getRange(i + 1, headers.indexOf('No HP') + 1).setValue(data.noHp);
      sheet.getRange(i + 1, headers.indexOf('Email') + 1).setValue(data.email);
      sheet.getRange(i + 1, headers.indexOf('Status') + 1).setValue(data.status);

      addLogEntry(currentUser, 'Edit Guru', `Memperbarui data guru: ${data.nama}`, 'BERHASIL');
      return { success: true, message: 'Data guru berhasil diperbarui.' };
    }
  }
  return { success: false, message: 'Data guru tidak ditemukan.' };
}

function deleteTeacher(id, currentUser) {
  const sheet = getDb().getSheetByName(SHEET_NAMES.GURU);
  const values = sheet.getDataRange().getValues();
  const idIndex = values[0].indexOf('ID');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      addLogEntry(currentUser, 'Hapus Guru', `Menghapus guru ID: ${id}`, 'BERHASIL');
      return { success: true, message: 'Data guru berhasil dihapus.' };
    }
  }
  return { success: false, message: 'Data guru tidak ditemukan.' };
}

function addGrade(data, currentUser) {
  const sheet = getDb().getSheetByName(SHEET_NAMES.NILAI);
  const id = 'NIL-' + new Date().getTime();

  const nTugas = parseFloat(data.tugas) || 0;
  const nSts = parseFloat(data.sts) || 0;
  const nSas = parseFloat(data.sas) || 0;
  const nAkhir = ((nTugas * 0.3) + (nSts * 0.3) + (nSas * 0.4)).toFixed(2);
  
  let predikat = 'D';
  if (nAkhir >= 90) predikat = 'A';
  else if (nAkhir >= 80) predikat = 'B';
  else if (nAkhir >= 70) predikat = 'C';

  const keterangan = nAkhir >= 75 ? 'Tuntas' : 'Perlu Remedial';

  sheet.appendRow([
    id,
    data.nisn,
    data.nama,
    data.kelas,
    data.mapel,
    nTugas,
    nSts,
    nSas,
    nAkhir,
    predikat,
    keterangan
  ]);

  addLogEntry(currentUser, 'Tambah Nilai', `Input Nilai ${data.mapel} - ${data.nama}`, 'BERHASIL');
  return { success: true, message: 'Data nilai berhasil disimpan.' };
}

function updateGrade(id, data, currentUser) {
  const sheet = getDb().getSheetByName(SHEET_NAMES.NILAI);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf('ID');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) {
      const nTugas = parseFloat(data.tugas) || 0;
      const nSts = parseFloat(data.sts) || 0;
      const nSas = parseFloat(data.sas) || 0;
      const nAkhir = ((nTugas * 0.3) + (nSts * 0.3) + (nSas * 0.4)).toFixed(2);
      
      let predikat = 'D';
      if (nAkhir >= 90) predikat = 'A';
      else if (nAkhir >= 80) predikat = 'B';
      else if (nAkhir >= 70) predikat = 'C';

      const keterangan = nAkhir >= 75 ? 'Tuntas' : 'Perlu Remedial';

      sheet.getRange(i + 1, headers.indexOf('Mata Pelajaran') + 1).setValue(data.mapel);
      sheet.getRange(i + 1, headers.indexOf('Nilai Tugas') + 1).setValue(nTugas);
      sheet.getRange(i + 1, headers.indexOf('Nilai STS') + 1).setValue(nSts);
      sheet.getRange(i + 1, headers.indexOf('Nilai SAS') + 1).setValue(nSas);
      sheet.getRange(i + 1, headers.indexOf('Nilai Akhir') + 1).setValue(nAkhir);
      sheet.getRange(i + 1, headers.indexOf('Predikat') + 1).setValue(predikat);
      sheet.getRange(i + 1, headers.indexOf('Keterangan') + 1).setValue(keterangan);

      addLogEntry(currentUser, 'Edit Nilai', `Mengubah Nilai ${data.mapel} - ID: ${id}`, 'BERHASIL');
      return { success: true, message: 'Data nilai berhasil diperbarui.' };
    }
  }
  return { success: false, message: 'Data nilai tidak ditemukan.' };
}

function deleteGrade(id, currentUser) {
  const sheet = getDb().getSheetByName(SHEET_NAMES.NILAI);
  const values = sheet.getDataRange().getValues();
  const idIndex = values[0].indexOf('ID');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      addLogEntry(currentUser, 'Hapus Nilai', `Menghapus Nilai ID: ${id}`, 'BERHASIL');
      return { success: true, message: 'Data nilai berhasil dihapus.' };
    }
  }
  return { success: false, message: 'Data tidak ditemukan.' };
}

function addAttendance(data, currentUser) {
  const sheet = getDb().getSheetByName(SHEET_NAMES.ABSENSI);
  const id = 'ABS-' + new Date().getTime();

  sheet.appendRow([
    id,
    data.nisn,
    data.nama,
    data.kelas,
    data.tanggal || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    data.status,
    data.keterangan || '-'
  ]);

  addLogEntry(currentUser, 'Presensi Siswa', `Absensi: ${data.nama} (${data.status})`, 'BERHASIL');
  return { success: true, message: 'Data presensi berhasil dicatat.' };
}

function getDashboardStats() {
  const students = getAllRows(SHEET_NAMES.SISWA);
  const attendance = getAllRows(SHEET_NAMES.ABSENSI);
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  const totalSiswa = students.length;
  const lakiLaki = students.filter(s => String(s['Jenis Kelamin']).toUpperCase() === 'L').length;
  const perempuan = students.filter(s => String(s['Jenis Kelamin']).toUpperCase() === 'P').length;

  const hadirHariIni = attendance.filter(a => a.Tanggal === today && String(a['Status Kehadiran']).toLowerCase() === 'hadir').length;

  // Kelompokkan berdasarkan kelas
  const perKelas = {};
  students.forEach(s => {
    const k = s.Kelas || 'Tanpa Kelas';
    perKelas[k] = (perKelas[k] || 0) + 1;
  });

  // Tambah data baru 7 hari terakhir
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const baruDitambahkan = students.filter(s => new Date(s['Tanggal Input']) >= sevenDaysAgo).length;

  return {
    success: true,
    data: {
      totalSiswa,
      lakiLaki,
      perempuan,
      hadirHariIni,
      perKelas,
      baruDitambahkan
    }
  };
}

function changePassword(username, oldPassword, newPassword, currentUser) {
  const sheet = getDb().getSheetByName(SHEET_NAMES.USERS);
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).toLowerCase() === String(username).toLowerCase() && String(values[i][1]) === String(oldPassword)) {
      sheet.getRange(i + 1, 2).setValue(newPassword);
      addLogEntry(currentUser, 'Ubah Password', 'Berhasil memperbarui password administrator', 'BERHASIL');
      return { success: true, message: 'Password berhasil diperbarui.' };
    }
  }
  return { success: false, message: 'Password lama tidak sesuai!' };
}

function backupDatabase(currentUser) {
  try {
    const ss = getDb();
    const backupName = `BACKUP_ADMINISTRASI_KELAS6_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss')}`;
    const backupFile = DriveApp.getFileById(ss.getId()).makeCopy(backupName);
    
    addLogEntry(currentUser, 'Backup Database', `Backup dibuat: ${backupName}`, 'BERHASIL');
    return {
      success: true,
      message: 'Backup database berhasil dibuat di Google Drive.',
      backupUrl: backupFile.getUrl()
    };
  } catch (err) {
    return { success: false, message: 'Gagal membuat backup: ' + err.message };
  }
}

function addLogEntry(user, aktivitas, dataInfo, status) {
  try {
    const sheet = getDb().getSheetByName(SHEET_NAMES.LOG);
    if (!sheet) return;
    const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    sheet.appendRow([now, user, aktivitas, dataInfo, status]);
  } catch (e) {
    Logger.log('Log Error: ' + e.message);
  }
}