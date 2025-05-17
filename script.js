let questions = [];
let current = 0;
let score = 0;
let userAnswers = [];
let timerInterval;

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const sekolahInput = document.getElementById("sekolah");
const kurikulumSelect = document.getElementById("kurikulum");
const kelasSelect = document.getElementById("kelas");
const mapelInput = document.getElementById("mapel");
const babInput = document.getElementById("bab");
const paketInput = document.getElementById("paket");
const jumlahSoalInput = document.getElementById("jumlahSoal");
const durasiInput = document.getElementById("durasi");
const passwordInput = document.getElementById("password");
const startBtn = document.getElementById("start-btn");
const passwordMessage = document.getElementById("password-message");
const identityForm = document.getElementById("identity-form");
const quizBox = document.getElementById("quiz-box");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const navigation = document.getElementById("navigation");


// Autofill data berdasarkan email
emailInput.addEventListener("blur", () => {
  if (typeof pesertaList === "undefined") {
    alert("Data peserta belum dimuat. Silakan refresh halaman.");
    return;
  }
  const email = emailInput.value.trim().toLowerCase();
  const peserta = pesertaList.find(p => p.email.toLowerCase() === email);

  if (peserta) {
    nameInput.value = peserta.nama;
    sekolahInput.value = peserta.asalSekolah;
    nameInput.readOnly = true;
    sekolahInput.readOnly = true;
    kelasSelect.disabled = false;
  } else {
    nameInput.value = "";
    sekolahInput.value = "";
    kelasSelect.value = "";
    nameInput.readOnly = false;
    sekolahInput.readOnly = false;
    kelasSelect.disabled = false;
    alert("Email tidak ditemukan dalam daftar peserta.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadKurikulumList();
  loadSheetList();
  loadKelasList();
});

function loadKurikulumList() {
  const kurikulumSelect = document.getElementById("kurikulum");
  kurikulumSelect.innerHTML = '<option value="">Memuat kurikulum...</option>';

  fetch("https://script.google.com/macros/s/AKfycbwCS7TO6PbBYJRIZ5PRtzPhMMOuPHvATP-QLJhV3C86_GQ53Ec0zPAeDYEgjc4NvMlX/exec/exec") // Ganti dengan URL Web App kamu
    .then(res => res.json())
    .then(folderNames => {
      kurikulumSelect.innerHTML = '<option value="">Pilih Kurikulum Pendidikan</option>';
      folderNames.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        kurikulumSelect.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Gagal memuat daftar kurikulum:", err);
      kurikulumSelect.innerHTML = '<option value="">Gagal memuat kurikulum</option>';
    });
}
kurikulumSelect.addEventListener("change", function () {
  const selectedFolder = kurikulumSelect.value;
  if (selectedFolder) {
    loadKelasListFromKurikulum(selectedFolder);
  } else {
    kelasSelect.innerHTML = '<option value="">Pilih Kelas</option>';
  }
});

//INPUT NAMA KURIKULUM DAN NAMA KELAS
function loadKelasListFromKurikulum(kurikulumName) {
  const url = `https://script.google.com/macros/s/AKfycbxidDqrSCxyADypsYvr0kuL-t3-DmuWVuI8EGrd9yzYmkleq_87Lc6RJNXPTjpGxpalHA/exec?folder=${encodeURIComponent(kurikulumName)}`;
  kelasSelect.innerHTML = '<option value="">Memuat daftar kelas...</option>';
  fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(spreadsheetList => {
    if (!Array.isArray(spreadsheetList) || spreadsheetList.length === 0) {
      kelasSelect.innerHTML = '<option value="">Tidak ada kelas ditemukan</option>';
      return;
    }

    kelasSelect.innerHTML = '<option value="">Pilih Kelas</option>';
    spreadsheetList.forEach(nama => {
      const option = document.createElement("option");
      option.value = nama;
      option.textContent = nama;
      kelasSelect.appendChild(option);
    });
  })
  .catch(err => {
    console.error("Gagal memuat daftar spreadsheet:", err);
    kelasSelect.innerHTML = '<option value="">❌ Gagal memuat kelas</option>';
  });
}
kelasSelect.addEventListener("change", () => {
  const selectedKelas = kelasSelect.value;
  if (selectedKelas) {
    loadMapelList(selectedKelas);
  }
});

//INPUT NAMA MATA PELAJARAN
function loadMapelList(kelas) {
  const mapelInput = document.getElementById("mapel"); // pastikan id-nya sesuai

  const url = `https://script.google.com/macros/s/AKfycbzcFz3Tm6C9-TPHK7M5NqNykCEiXxROkOtYxZxTpaPsmnS1cxsfprG89cfz9C9DukGc/exec?kelas=${encodeURIComponent(kelas)}`;

  mapelInput.innerHTML = '<option>Memuat...</option>';

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.error("Error dari server:", data.error);
        mapelInput.innerHTML = `<option value="">${data.error}</option>`;
        return;
      }

      if (!Array.isArray(data) || data.length === 0) {
        mapelInput.innerHTML = '<option value="">Tidak ada file ditemukan</option>';
        return;
      }

      mapelInput.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
      data.forEach(nama => {
        const option = document.createElement("option");
        option.value = nama;
        option.textContent = nama;
        mapelInput.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Fetch error:", err);
      mapelInput.innerHTML = '<option value="">Gagal memuat mapel</option>';
    });
}


//INPUT NAMA BAB MATERI
const selectedSpreadsheetName = mapelInput.value; // ambil nama dari input
const sheetApiBaseUrl = "https://script.google.com/macros/s/AKfycbxMuFkeVk7gN6anQ79i37Whstx2k95FMWoaqOAwX8-6OaGjlj6_E66eDGczG8M9CTZO5Q/exec";


function loadSheetList(selectedSpreadsheetName) {
  if (!selectedSpreadsheetName) {
    babInput.innerHTML = '<option value="">Pilih Materi</option>';
    return;
  }

  // Buat URL dinamis berdasarkan pilihan mata pelajaran
  const sheetApiUrl = `${sheetApiBaseUrl}?action=getSheets&spreadsheetName=${encodeURIComponent(selectedSpreadsheetName)}`;

  babInput.innerHTML = '<option value="">Memuat Bab Materi...</option>';

  fetch(sheetApiUrl)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(sheetNames => {
      babInput.innerHTML = '<option value="">Pilih Bab Materi</option>';

      if (Array.isArray(sheetNames) && sheetNames.length > 0) {
        sheetNames
      .filter(name => !/^Sheet\d*/i.test(name)) // menyaring nama sheet yang diawali "Sheet"
      .forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        babInput.appendChild(option);
      });
      } else {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Bab Materi tidak ditemukan";
        babInput.appendChild(option);
      }
    })
    .catch(err => {
      console.error("Gagal memuat daftar BAB:", err);
      babInput.innerHTML = '<option value="">Gagal memuat bab</option>';
    });
}

// Listener untuk perubahan pada input MATA PELAJARAN
if (mapelInput) {
  mapelInput.addEventListener("change", function() {
    const selectedSpreadsheet = mapelInput.value;
    loadSheetList(selectedSpreadsheet);
  });
}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const sheetURL = "https://opensheet.elk.sh/1-XMEFrfkLfxd9AWi-EfLuGo8dnjO_kzYUCJ2gy9C-zs/Sheet2";

babInput.addEventListener("change", () => {
  const selectedBab = babInput.value.trim();

  if (!selectedBab) {
    jumlahSoalInput.value = "";
    durasiInput.value = "";
    return;
  }

  fetch(sheetURL)
    .then(response => response.json())
    .then(data => {
      const matchedRow = data.find(row => row["Nama Sheet"]?.trim() === selectedBab);

      if (matchedRow) {
        jumlahSoalInput.value = matchedRow["Jumlah Soal Per Paket"] || "";
        durasiInput.value = matchedRow["Durasi"] || "";
      } else {
        jumlahSoalInput.value = "";
        durasiInput.value = "";
        console.warn("BAB MATERI tidak ditemukan di Sheet2.");
      }
    })
    .catch(error => {
      console.error("Gagal mengambil data dari spreadsheet:", error);
      jumlahSoalInput.value = "";
      durasiInput.value = "";
    });
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
async function updatePaketDropdown(babMateriDipilih) {
  const paketInput = document.getElementById("paket");
  if (!paketInput) return;

  paketInput.innerHTML = '<option value="">Memuat Paket...</option>';

  try {
    const response = await fetch('https://opensheet.elk.sh/1-XMEFrfkLfxd9AWi-EfLuGo8dnjO_kzYUCJ2gy9C-zs/Sheet2');
    const data = await response.json();

    const baris = data.find(row =>
      row["Nama Sheet"]?.trim().toLowerCase() === babMateriDipilih.trim().toLowerCase()
    );

    paketInput.innerHTML = '<option value="">Pilih Paket</option>';

    if (baris) {
      const jumlahPaket = parseInt(baris["Paket Ke"]);
      if (!isNaN(jumlahPaket)) {
        for (let i = 1; i <= jumlahPaket; i++) {
          const option = document.createElement("option");
          option.value = i;
          option.textContent = i;
          paketInput.appendChild(option);
        }
      } else {
        console.warn("Paket Ke bukan angka:", baris["Paket Ke"]);
      }
    } else {
      console.warn("Tidak ada baris cocok untuk BAB:", babMateriDipilih);
    }
  } catch (error) {
    console.error("Gagal ambil data:", error);
  }
}

// URL sheet menggunakan OpenSheet
const pesertaSheetURL = "https://opensheet.elk.sh/18mQe0-u4ma9mEemc5L6zN6AWe6IbfopdDIlhUKM1WEE/PESERTA";

// Fungsi validasi password berdasarkan email
function validatePassword() {
  const email = emailInput.value.trim();
  const enteredPassword = passwordInput.value.trim();

  if (!email || !enteredPassword) {
    passwordMessage.textContent = "";
    startBtn.disabled = true;
    return;
  }

  fetch(pesertaSheetURL)
    .then(response => response.json())
    .then(data => {
      const user = data.find(row => row["Email"]?.trim().toLowerCase() === email.toLowerCase());

      if (!user) {
        passwordMessage.textContent = "Email tidak ditemukan.";
        startBtn.disabled = true;
      } else if (user["Password"]?.trim() === enteredPassword) {
        passwordMessage.textContent = "";
        startBtn.disabled = false;
      } else {
        passwordMessage.textContent = "SALAH PASSWORD";
        startBtn.disabled = true;
      }
    })
    .catch(error => {
      console.error("Gagal mengambil data password:", error);
      passwordMessage.textContent = "Terjadi kesalahan saat memeriksa password.";
      startBtn.disabled = true;
    });
}

// Event listener saat password atau email berubah
passwordInput.addEventListener("input", validatePassword);
emailInput.addEventListener("input", validatePassword);


function toProperCase(text) {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
startBtn.addEventListener("click", () => {
  if (
    !nameInput.value ||
    !emailInput.value ||
    !sekolahInput.value ||
    !kurikulumSelect.value || // tambahkan ini
    !kelasSelect.value ||
    !mapelInput.value ||
    !babInput.value ||
    !paketInput.value ||
    !durasiInput.value
  ) {
    alert("Harap lengkapi semua data terlebih dahulu!");
    return;
  }
//TOMBOL MULAI KUIZ
  startQuiz();
  
});

//MASUK KE HALAMAN KUIZ
function startQuiz() {
  fetchQuestions().then(() => {
    
  // Tampilkan label info peserta

document.getElementById("label-nama-siswa").textContent = (toProperCase(nameInput.value) || '').substring(0, 15);
document.getElementById("label-asal-sekolah").textContent = (sekolahInput.value || '').substring(0, 15);
document.getElementById("label-kelas").textContent = (kelasSelect.value || '').substring(0, 15);
document.getElementById("label-nama-paket").textContent = (paketInput.value || '').substring(0, 15);
document.getElementById("label-bab-materi").textContent = (babInput.value || '').substring(0, 15);

  identityForm.style.display = "none";
    quizBox.style.display = "flex";
    userAnswers = Array(questions.length).fill(null);
    createNavigation();
    loadQuestion(0);
    startTimer(parseInt(durasiInput.value));
  });
}

function fetchQuestions() {
  const bab = babInput.value.trim();
  const mapel = mapelInput.value.trim();
 
  const mappingUrl = `https://opensheet.elk.sh/15R8bAIdfe9kGQu__Uois7Myc0fFY9rPzP5KBKZjxkY0/Sheet2`;
 
  console.log("Memfetch mapping dari:", mappingUrl);
 
  return fetch(mappingUrl)
    .then(mappingResponse => mappingResponse.json())
    .then(mappingData => {
      console.log("Data mapping:", mappingData);
 
      const mapping = mappingData.find(row => row.MataPelajaran === mapel);
 
      if (!mapping) {
        alert(`❌ Mata pelajaran "${mapel}" tidak ditemukan di data mapping.`);
        throw new Error('Mata pelajaran tidak ditemukan');
      }
 
      console.log("Spreadsheet ID ditemukan:", mapping.ID);
 
      const spreadsheetId = mapping.ID;
      const soalUrl = `https://opensheet.elk.sh/${spreadsheetId}/${bab}`;
 
      console.log("URL soal:", soalUrl);
 
      return fetch(soalUrl);
    })
    .then(soalResponse => soalResponse.json())
    .then(soalData => {
      console.log("Data soal:", soalData);
 
      const paketKe = parseInt(paketInput.value);
      //BANYAK SOAL PER PAKET
      const soalPerPaket = parseInt(document.getElementById("jumlahSoal").value) || 0;
      const startIndex = 1 + (paketKe - 1) * soalPerPaket;
      const endIndex = startIndex + soalPerPaket;
      const slicedData = soalData.slice(startIndex, endIndex);
 
     questions = slicedData.map(row => {
  const keyMap = { A: "1", B: "2", C: "3", D: "4", E: "5" };
  const answerKey = keyMap[row.Kunci?.toUpperCase()] || "1";

  const rawOptions = [
    { key: "1", value: row.Option1, explanation: row.PenjelasanOpsiA },
    { key: "2", value: row.Option2, explanation: row.PenjelasanOpsiB },
    { key: "3", value: row.Option3, explanation: row.PenjelasanOpsiC },
    { key: "4", value: row.Option4, explanation: row.PenjelasanOpsiD },
    { key: "5", value: row.Option5, explanation: row.PenjelasanOpsiE }
  ].filter(opt => opt.value); // only include options with content

  const shuffled = rawOptions.sort(() => Math.random() - 0.5);

  const labeledOptions = shuffled.map((opt, index) => ({
    ...opt,
    label: String.fromCharCode(65 + index) // A-E
  }));

  const formattedExplanation = labeledOptions.map(opt => {
    const icon = opt.key === answerKey ? "✅" : "❌";
    return `${icon} <strong>Pilihan ${opt.label}</strong><br> ${opt.explanation}`;
  }).join("<br><br>");

  return {
    question: row.Soal,
    image: row["gambar soal"] || null,
    options: labeledOptions,
    answer: answerKey,
    explanation: formattedExplanation,
    pembahasanImageUrl: row["gambar penyelesaian"] || null
  };
});


    })
    .catch(err => {
      console.error('Error detail:', err);
      alert(`❌ Gagal mengambil soal. Pastikan data tersedia dan formatnya benar.`);
    });
}


//MEMBUAT TOMBOL NAVIGASI SOAL
function createNavigation() {
  navigation.innerHTML = "";

  // Tambahkan tombol nomor soal
  questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.id = `nav-btn-${i}`;
    btn.textContent = i + 1;
    btn.addEventListener("click", () => loadQuestion(i));
    navigation.appendChild(btn);
  });

  // Kontainer untuk tombol navigasi bawah
 // Baris 1: KEMBALI dan LANJUT
const navTopRow = document.createElement("div");
navTopRow.className = "nav-controls";

const backBtn = document.createElement("button");
backBtn.textContent = "⬅️ KEMBALI";
backBtn.addEventListener("click", () => {
  if (current > 0) loadQuestion(current - 1);
});

const nextBtn = document.createElement("button");
nextBtn.textContent = "LANJUT ➡️";
nextBtn.addEventListener("click", () => {
  if (current < questions.length - 1) loadQuestion(current + 1);
});

navTopRow.appendChild(backBtn);
navTopRow.appendChild(nextBtn);

// Baris 2: REFRESH dan SELESAI
const navBottomRow = document.createElement("div");
navBottomRow.className = "nav-controls";

const refreshBtn = document.createElement("button");
refreshBtn.textContent = "🔄 REFRESH";
refreshBtn.addEventListener("click", () => {
  const konfirmasi = confirm("Kembali ke halaman identitas? Semua jawaban akan hilang.");
  if (konfirmasi) {
    clearInterval(timerInterval); // hentikan timer
    quizBox.style.display = "none";
    identityForm.style.display = "block";
    navigation.innerHTML = ""; // bersihkan navigasi soal
    userAnswers = [];
    score = 0;
    current = 0;
    scoreEl.textContent = "Skor: 0";
    timerEl.textContent = "00:00";
  }

});

const finishBtn = document.createElement("button");
finishBtn.textContent = "✅ SELESAI";
finishBtn.addEventListener("click", () => {
  const yakin = confirm("Yakin ingin keluar dari aplikasi?");
  if (yakin) {
    window.open('', '_self').close(); // Coba tutup tab/jendela

    // Fallback: arahkan ke halaman kosong jika close() gagal
    setTimeout(() => {
      window.location.href = "about:blank";
    }, 100);
  }
});

navBottomRow.appendChild(refreshBtn);
navBottomRow.appendChild(finishBtn);

// Tambahkan keduanya ke navigasi
navigation.appendChild(navTopRow);
navigation.appendChild(navBottomRow);
}

//ACAK OPTION SOAL
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

//MULAI TAMPILKAN SOAL
function loadQuestion(index) {
  current = index;
  const q = questions[current];

  questionEl.innerHTML = `
    <h3>Soal ${index + 1}</h3>
    ${q.image ? `<img src="${q.image}" alt="Gambar Soal" style="max-width: 50%; margin: 10px 0;" />` : ""}
    <p>${q.question}</p>
  `;
  optionsEl.innerHTML = "";
  feedbackEl.innerHTML = "";

  q.options.forEach((opt, i) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="radio" name="option" value="${opt.key}" data-label="${opt.label}">
      ${opt.label}. ${opt.value}
    `;
    optionsEl.appendChild(label);
  });

  const inputs = optionsEl.querySelectorAll("input");

  // Jika sudah pernah dijawab sebelumnya
  if (userAnswers[current] !== null) {
    showAnswerResult(q, userAnswers[current], inputs, current);
  } else {
    inputs.forEach(input => {
      input.addEventListener("click", () => {
        const userConfirmed = confirm("Apakah kamu yakin dengan jawabanmu?");
        if (!userConfirmed) {
          input.checked = false;
          return;
        }

        const selectedKey = input.value;
        const isCorrect = selectedKey === q.answer;

        userAnswers[current] = {
          isCorrect,
          selectedKey
        };

        if (isCorrect) {
          score++;
          scoreEl.textContent = `Skor: ${score}`;
        }

        inputs.forEach(inp => inp.disabled = true);
        document.getElementById(`nav-btn-${current}`).classList.add("answered");

        showAnswerResult(q, userAnswers[current], inputs, current);

        if (userAnswers.every(ans => ans !== null)) {
          clearInterval(timerInterval);
          showSummary();
        }
      });
    });
  }
}


function showAnswerResult(q, answerObj, inputs, index) {
  const { isCorrect, selectedKey } = answerObj;

  inputs.forEach(input => {
    const isSelected = input.value === selectedKey;
    const isCorrectAnswer = input.value === q.answer;

    input.disabled = true;

    if (isCorrectAnswer) {
      input.closest("label").classList.add("correct"); // Hijau
    }

    if (isSelected && !isCorrectAnswer) {
      input.closest("label").classList.add("selected"); // Merah
    }

    if (isSelected) {
      input.checked = true;
    }
  });

  // Warna tombol navigasi
  const navBtn = document.getElementById(`nav-btn-${index}`);
  if (navBtn) {
    navBtn.classList.remove("answered");
    navBtn.classList.add(isCorrect ? "correct-answer" : "wrong-answer");
  }

  // Tampilkan feedback dan pembahasan
  feedbackEl.innerHTML = `
    <span style="font-size: 24px;">${isCorrect ? "✅ Benar!" : "❌ Salah!"}</span><br>
    ${q.pembahasanImageUrl ? `<img src="${q.pembahasanImageUrl}" alt="Gambar Pembahasan" style="max-width: 50%; height: auto; margin-top: 10px;"><br>` : ""}
    <strong style="display: block; margin-top: 20px;">Pembahasan:</strong><br>
    <p style="margin-top: 0px;">${q.explanation}</p>
  `;
  feedbackEl.style.color = isCorrect ? "green" : "green";
}





function startTimer(duration) {
  let timeLeft = duration * 60;
  updateTimer(timeLeft);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showSummary();
    }
  }, 1000);
}

function updateTimer(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  timerEl.textContent = `${m}:${s}`;
}

// Fungsi showSummary diperbaiki untuk mengirim hasil ke spreadsheet
function showSummary() {
  const selesai = new Date();
  const durasiMenit = parseInt(durasiInput.value);
  const waktuSelesai = selesai.toLocaleString("id-ID"); // Format lokal

  const jumlahSoal = questions.length;
  const jumlahBenar = userAnswers.filter(a => a && a.isCorrect).length;
  const jumlahSalah = jumlahSoal - jumlahBenar;
  const nilai = Math.round((jumlahBenar / jumlahSoal) * 100);

  const dataHasil = {
    nama: nameInput.value,
    email: emailInput.value,
    sekolah: sekolahInput.value,
    kurikulum: kurikulumSelect.value,
    kelas: kelasSelect.value,
    mapel: mapelInput.value,
    bab: babInput.value,
    paket: paketInput.value,
    jumlah_soal: jumlahBenar + jumlahSalah,
    benar: jumlahBenar,
    salah: jumlahSalah,
    nilai: nilai,
    waktu_selesai: waktuSelesai,
    durasi: durasiMenit
  };

  console.log("Mengirim data:", dataHasil);

  fetch("https://script.google.com/macros/s/AKfycbwiqaI9IKl2jOgm_iEiwT1SZOW5niPEg0fepR26rLGqeBXvrc2KKdWSuipDmhnC0SZ5/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(dataHasil)
   
  })
  .then(() => {
    alert(`Kuis selesai!\nSkor akhir: ${nilai}/${100}\nJawaban Benar: ${jumlahBenar}, Salah: ${jumlahSalah}`);
    console.log("✅ Data hasil kuis berhasil dikirim.");
  })
  .catch(error => {
    alert("❌ Gagal mengirim hasil: " + error);
    console.error("Gagal kirim data:", error);
  });
}
// Tambahkan di bawah semua event listener lainnya
document.getElementById("exit-btn").addEventListener("click", function () {
  if (confirm("Yakin ingin keluar dari aplikasi?")) {
    window.open('', '_self');
    window.close();
  }
});




