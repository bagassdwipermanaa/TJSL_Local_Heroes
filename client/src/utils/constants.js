export const SDGS_OPTIONS = [
  "1. Tanpa Kemiskinan",
  "2. Tanpa Kelaparan",
  "3. Kehidupan Sehat dan Sejahtera",
  "4. Pendidikan Berkualitas",
  "5. Kesetaraan Gender",
  "6. Air Bersih dan Sanitasi Layak",
  "7. Energi Bersih dan Terjangkau",
  "8. Pekerjaan Layak dan Pertumbuhan Ekonomi",
  "9. Industri, Inovasi dan Infrastruktur",
  "10. Berkurangnya Kesenjangan",
  "11. Kota dan Permukiman Berkelanjutan",
  "12. Konsumsi dan Produksi Bertanggung Jawab",
  "13. Penanganan Perubahan Iklim",
  "14. Ekosistem Lautan",
  "15. Ekosistem Daratan",
  "16. Perdamaian, Keadilan dan Kelembagaan Tangguh",
  "17. Kemitraan untuk Mencapai Tujuan"
];

export const PILAR_OPTIONS = [
  "Sosial",
  "Ekonomi",
  "Lingkungan",
  "Hukum & Tata Kelola"
];

export const KATEGORI_OPTIONS = [
  "Individu",
  "Komunitas"
];

export const ADMIN_CHECKLIST = [
  {
    group: "Pengusul",
    items: [
      {
        id: "adm-1",
        title: "Pegawai/TAD aktif PLN Electricity Services",
        evidence: "Kartu pegawai / SK / kontrak TAD"
      },
      {
        id: "adm-2",
        title: "Berperan langsung sebagai penggagas, penggerak, atau pelaksana aktif (bukan hanya donatur)",
        evidence: "Uraian peran dan dokumentasi kegiatan"
      },
      {
        id: "adm-3",
        title: "Mendapat rekomendasi atasan langsung atau pimpinan unit",
        evidence: "Surat rekomendasi / persetujuan resmi"
      }
    ]
  },
  {
    group: "Bukti Implementasi",
    items: [
      {
        id: "adm-4",
        title: "Kegiatan berjalan minimal 6 bulan secara berkesinambungan dan masih aktif",
        evidence: "Logbook, jadwal rutin, atau laporan berkala"
      },
      {
        id: "adm-5",
        title: "Dokumentasi kegiatan dengan keterangan waktu dan lokasi dari beberapa periode",
        evidence: "Foto / video dokumentasi representatif"
      },
      {
        id: "adm-6",
        title: "Lokasi kegiatan dapat dikunjungi dan bersedia diverifikasi lapangan",
        evidence: "Surat kesediaan / pernyataan keterbukaan lokasi"
      }
    ]
  },
  {
    group: "Kesesuaian Program",
    items: [
      {
        id: "adm-7",
        title: "Sukarela, bukan tugas kedinasan atau proyek TJSL korporat yang didanai penuh",
        evidence: "Surat pernyataan inisiatif mandiri"
      },
      {
        id: "adm-8",
        title: "Bebas dari politik praktis, SARA, dan kepentingan komersial pribadi",
        evidence: "Surat pernyataan netralitas & kepatuhan etika"
      },
      {
        id: "adm-9",
        title: "Pernyataan keaslian seluruh berkas dan dokumen yang dilampirkan",
        evidence: "Surat pernyataan bermeterai cukup"
      }
    ]
  }
];

export const TOTAL_ADMIN_ITEMS = ADMIN_CHECKLIST.reduce((acc, g) => acc + g.items.length, 0);

export const CRITERIA = [
  {
    id: 0,
    title: "Relevansi dengan Pembangunan Berkelanjutan & Pilar TJSL",
    desc: "Keterkaitan jelas dengan TPB/SDGs dan 4 Pilar TJSL; menjawab kebutuhan riil masyarakat."
  },
  {
    id: 1,
    title: "Dampak & Manfaat bagi Masyarakat",
    desc: "Jumlah penerima manfaat; dampak perubahan sosial/ekonomi/lingkungan terukur; data valid."
  },
  {
    id: 2,
    title: "Keberlanjutan Program (Sustainability)",
    desc: "Lama program berjalan; kemandirian penerima manfaat; rencana jangka panjang; kaderisasi penerus."
  },
  {
    id: 3,
    title: "Peran & Kontribusi Langsung Pegawai",
    desc: "Peran inisiator/penggerak utama; konsistensi dedikasi; waktu, tenaga, pikiran; kepemimpinan teladan."
  },
  {
    id: 4,
    title: "Inovasi & Kreativitas Solusi",
    desc: "Pendekatan unik; adopsi teknologi tepat guna atau kearifan lokal; efisiensi penggunaan sumber daya."
  },
  {
    id: 5,
    title: "Kolaborasi & Partisipasi Pemangku Kepentingan",
    desc: "Keterlibatan aktif warga, relawan, pemerintah desa, komunitas, institusi pendidikan atau UMKM."
  },
  {
    id: 6,
    title: "Potensi Replikasi & Daya Inspirasi",
    desc: "Mudah direplikasi ke wilayah lain; terdokumentasi rapi; menjadi inspirasi positif bagi insan PLN."
  }
];

export const WEIGHTS = {
  default: [15, 25, 20, 15, 10, 10, 5],
  Individu: [15, 25, 20, 20, 10, 5, 5],
  Komunitas: [15, 25, 20, 10, 10, 15, 5]
};

export const STAGES = [
  { key: "porto", label: "Portofolio Berkas", weight: 40 },
  { key: "lapangan", label: "Verifikasi Lapangan", weight: 30 },
  { key: "final", label: "Presentasi & Wawancara", weight: 30 }
];

export const BONUS_ITEMS = [
  {
    id: 0,
    title: "Pengakuan atau penghargaan dari pihak eksternal / instansi resmi",
    points: 2
  },
  {
    id: 1,
    title: "Menyasar kelompok rentan (disabilitas, lansia, yatim/piatu, prasejahtera)",
    points: 1
  },
  {
    id: 2,
    title: "Terkait langsung isu energi / ketenagalistrikan / EBT / keselamatan listrik",
    points: 1
  },
  {
    id: 3,
    title: "Dilaksanakan di wilayah 3T (Tertinggal, Terdepan, Terluar)",
    points: 1
  }
];

export const REKOMENDASI_OPTIONS = [
  "Lanjut ke tahap berikutnya",
  "Tidak lanjut",
  "Diusulkan sebagai pemenang"
];

export const UNSUR_JURI_OPTIONS = [
  "Manajemen PLN ES",
  "Fungsi TJSL",
  "Eksternal"
];

export const STORAGE_KEY = "tjsl-local-heroes-data-v2";
export const AUDIT_LOG_KEY = "tjsl-local-heroes-audit-logs";
