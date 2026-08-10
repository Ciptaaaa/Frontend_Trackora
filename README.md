# Trackora — Frontend

Papan kerja pribadi bergaya Trello. Frontend untuk
[Project-Management API](https://github.com/Ciptaaaa/Project-Management)
(Go + Fiber v3 + GORM + PostgreSQL).

## Stack

| Bagian    | Teknologi                                |
| --------- | ---------------------------------------- |
| Framework | Astro 5                                  |
| UI        | React 19 (island, `client:load`)         |
| Bahasa    | TypeScript strict — nol `any`            |
| Styling   | Tailwind CSS 4 (`@tailwindcss/vite`)     |
| Tema      | Light / dark / ikut sistem               |
| Bahasa UI | Indonesia · English · 中文 (i18n sendiri)  |

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + build
```

## Arah desain

Palet **mineral & petrol**: kertas kehijauan dingin (`paper`), tinta petrol
gelap (`ink`/`petrol`), safron untuk perhatian, berry untuk terlambat. Sengaja
menghindari kombinasi slate + indigo yang jadi default dashboard.

Tipografi tiga peran: **Bricolage Grotesque** (display, dipakai hemat — hanya
judul board dan judul kartu di panel detail), **Archivo** (body/UI), **JetBrains
Mono** (angka: tanggal, jumlah kartu, hitungan). Semua angka pakai `tabular-nums`
supaya tidak bergeser saat berubah.

### Elemen signature: week spine

Strip di bawah topbar. Tujuh hari ke depan, tiap hari menampilkan *beban kerja*
sebagai tumpukan tick yang makin tinggi — sekali lihat langsung tahu hari mana
yang berat, tanpa membuka satu list pun. Klik satu hari untuk **menyorot** kartu
yang jatuh tempo hari itu; klik lagi untuk melepas sorotan.

**Menyorot, bukan memfilter.** Kartu yang cocok dapat ring petrol, sisanya
diredupkan, tapi tidak ada yang hilang dari board. Header tiap kolom juga
menampilkan badge berisi jumlah kartu di kolom itu yang jatuh tempo pada hari
yang disorot, jadi pekerjaan hari itu tetap gampang dicari tanpa harus
mengosongkan kolom lain.

Versi sebelumnya benar-benar menyembunyikan kartu yang tidak cocok, dan itu
salah untuk board kanban: kolom yang terfilter tidak bisa dibedakan dari kolom
kosong, jadi board-nya terbaca seperti kehilangan data. Refleks pertama orang
adalah me-refresh — yang "berhasil" hanya karena refresh ikut mereset
pilihannya, bukan karena datanya kembali. Menyorot menghapus seluruh kelas bug
itu: tidak ada lagi kartu yang lenyap setelah due date-nya dipindah, jadi tidak
perlu lagi logika yang melepas filter otomatis setelah edit.

Selama sorotan aktif, banner di bawah strip menyebut tanggal yang dipilih,
berapa kartu yang sedang disorot (atau bahwa hari itu kosong), dan satu tombol
**Lepas sorotan**.

Alasan memilih ini: board memberi tahu *apa* yang dikerjakan, tapi tidak pernah
*kapan* semuanya menumpuk. Karena backend punya `due_date` di card, informasi itu
sudah ada — cuma belum pernah ditampilkan sebagai satu garis waktu.

Urgensi juga dibawa di **tepi kiri tiap kartu** sebagai bilah warna (berry =
terlambat, safron = hari ini/dekat, petrol = masih jauh), bukan pill tambahan,
supaya kolom tetap mudah dipindai.

## Struktur (atomic design)

```
src/
├── components/
│   ├── atoms/       Button IconButton Icon LabelChip Avatar TextField TextArea
│   │                Logo Spinner
│   ├── molecules/   NavItem SearchField BoardSwitcher DueBadge AvatarGroup DayCell
│   │                AddCardForm AddListForm PasswordField ThemeToggle LocaleSwitcher
│   │                Modal MenuPopover DetailSection
│   ├── organisms/   Sidebar Topbar WeekSpine TaskCard BoardColumn CardDetail
│   │                BoardDialog LabelManager LabelPicker AssigneePicker
│   │                CommentThread AuthForm AccountMenu SettingsDialog MobileIsland
│   └── templates/   TrackoraApp AppShell AuthScreen
├── i18n/            dictionaries.ts · index.ts · LocaleContext.tsx
├── layouts/Layout.astro
├── lib/             date.ts (due state, week spine) · completion.ts (kolom selesai)
│                    view.ts (filter due/overdue) · useDismissable.ts
│                    api.ts · config.ts · theme.ts · errors.ts · scrollLock.ts
├── pages/index.astro
├── styles/global.css   @theme token + override .dark
└── types/domain.ts     tipe yang mencerminkan API
```

Semua panggilan HTTP tinggal di `src/lib/api.ts`. Di situlah selisih antara
bentuk JSON backend dan tipe domain frontend diselesaikan — komponen tidak perlu
tahu soal typo field `assigness`, tabel pivot, atau key PascalCase.

## Kontrak data

`src/types/domain.ts` mengikuti API apa adanya: `snake_case`, resource
diidentifikasi `public_id` (UUID), plus amplop `ApiSuccess<T>` /
`ApiError` / `PaginationMeta`. Jadi response backend bisa dipakai langsung tanpa
lapisan penerjemah.

Field `labels`, `assignees`, `attachments` di `Card` mengikuti
`GET /api/v1/cards/:id` yang sudah menyertakan relasi tersebut.

## Fitur

Board: buat, ubah judul/deskripsi/jatuh tempo, tambah anggota lewat pencarian
user. Tombol `+` ada di sidebar (rail maupun full) dan di topbar; ikon pensil di
topbar membuka board yang sedang aktif.

Kolom: tambah lewat slot bertitik di ujung board, ganti nama inline, geser
kiri/kanan, hapus — semuanya dari menu `⋯` di header kolom.

Kartu: tambah inline — judul dulu, lalu tautan "Deskripsi & jatuh tempo" membuka
dua field opsional supaya kartu bisa lahir lengkap tanpa perlu dibuka lagi.
Selain itu drag & drop antar kolom, dan panel detail yang bisa diedit penuh —
judul, deskripsi, jatuh tempo, label, assignee, lampiran, dan komentar.

Label: kelola global (buat, ganti nama, ganti warna, hapus) lewat ikon tag di
topbar; pasang/lepas per kartu dari panel detail.

Lain-lain: filter pencarian (judul, deskripsi, nama label) dengan `/` untuk
fokus dan `Esc` untuk bersihkan, filter Due/Overdue dari sidebar maupun island,
sorotan per hari lewat week spine, drawer di layar kecil dengan rail tablet yang
bisa dibuka, island navigasi di bawah untuk ponsel, menu akun dengan pengaturan
profil, tema light/dark/ikut sistem, dan bahasa ID/EN/中文 — tiga yang terakhir
tersimpan di `localStorage`.

### Batasan yang datang dari backend

Tidak ada endpoint untuk **membaca** anggota board (hanya add dan remove), jadi
daftar anggota di dialog board hanya menampilkan yang kamu tambahkan saat itu.
UI menyebut ini apa adanya lewat teks `board.membersHint` ketimbang membiarkan
daftar kosong terbaca sebagai "board ini tidak punya anggota".

Komentar tidak punya route update, jadi hanya bisa ditambah dan dihapus.
Mengedit lewat hapus-lalu-buat-ulang tidak dilakukan karena akan memindahkan
komentar ke dasar thread.

`GET /boards/:id/lists` menjawab **404** (`Failed to get list order: record not
found`) untuk board yang baris `list_positions`-nya belum pernah ditulis — yaitu
setiap board yang baru dibuat. Itu keadaan normal, bukan kegagalan, jadi
`getListsOnBoard` menerjemahkannya jadi daftar kosong. Kalau tidak, board baru
selalu terbuka dengan banner error.

Tabel pivot `card_labels` dan `card_assignees` memakai primary key gabungan,
jadi memasang label yang sudah terpasang ditolak dengan duplicate-key, bukan
diabaikan. Karena itu panel detail kartu menaikkan setiap perubahan label dan
assignee ke state board lewat `onUpdate` — kalau tidak, board tetap memegang
kartu versi lama, panel yang dibuka ulang membaca dari sana, dan pemasangan
berikutnya mengira labelnya belum ada lalu mengirim POST kedua.

Kolom `due_date` di card dan board bertipe `time.Time`, bukan pointer, jadi
kartu yang dibuat tanpa tanggal kembali membawa `0001-01-01T00:00:00Z` — zero
value Go — bukan `null`. Dibiarkan apa adanya, tanggal itu terbaca sebagai dua
ribu tahun terlambat: kartunya dapat bilah berry, ikut hitungan overdue, dan
menampilkan badge terlambat untuk tanggal yang tidak pernah diisi. `api.ts`
melipatnya jadi `null` lewat `nullableDate()` di titik JSON berubah jadi tipe
domain, karena seluruh lapisan tanggal sudah membaca `null` sebagai "belum
dijadwalkan".

`due_date` disimpan sebagai instant padahal yang dimaksud tanggal kalender, jadi
`toApiDate()` mengirim **tengah hari UTC** (`T12:00:00Z`), bukan tengah malam.
Di `T00:00:00Z`, backend atau database yang mengembalikan kolom itu dalam zona
di belakang UTC akan menggeser tanggalnya mundur satu hari — kartu jatuh tempo
tanggal 12 terbaca tanggal 11 dan jatuh ke slot yang salah di week spine. Tengah
hari menyisakan sebelas jam di kedua arah, cukup untuk semua offset dari UTC-11
sampai UTC+12. Pemotongan hari dari string tanggal juga dipusatkan di
`dueDay()` supaya filter, spine, dan badge tidak pernah membacanya beda.

Model card di backend tidak punya kolom status atau `completed` — yang ada hanya
`due_date`, yang menjawab "kapan ini seharusnya kelar", bukan "apakah ini sudah
kelar". Menambahkannya berarti migrasi di backend yang bukan milik frontend ini,
jadi selesai dibaca dari **posisi kartu**: kolom berjudul `Selesai`, `Done`,
`Completed`, `Finished`, atau `完成` dianggap tumpukan selesai, sesuai konvensi
Trello. Pencocokannya ada di `lib/completion.ts`, dilakukan setelah judul
dinormalkan (huruf kecil, tanda baca dan emoji dibuang) supaya `✅ Done` ikut
kena — tapi judul bernegasi seperti `Not done` sengaja tidak.

Konsekuensinya di UI: kartu di kolom selesai tampil redup dengan judul dicoret,
bilah urgensinya diganti warna tenang, dan badge jatuh tempo ditukar jadi chip
"Selesai". Kartu-kartu itu juga keluar dari hitungan overdue dan week spine —
tugas yang telat dikerjakan tetap sudah dikerjakan, dan kalau tetap dihitung
angka overdue tidak akan pernah bisa kembali ke nol.

## Menyambung ke backend

Frontend ini sudah terhubung ke [Project-Management API](https://github.com/Ciptaaaa/Project-Management). 
Konfigurasi endpoint di `src/lib/config.ts`:

```typescript
export const API_BASE_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3030';
```

Bisa override lewat environment variable `PUBLIC_API_URL` di `.env`:

```bash
PUBLIC_API_URL=http://localhost:3030
```

### Endpoint yang dipakai

| Aksi di UI            | Endpoint                                   |
| --------------------- | ------------------------------------------ |
| Login                 | `POST /v1/auth/login`                      |
| Register              | `POST /v1/auth/register`                   |
| Muat board            | `GET /api/v1/boards/my`                    |
| Buat board            | `POST /api/v1/boards`                      |
| Ubah board            | `PUT /api/v1/boards/:id`                   |
| Tambah anggota board  | `POST /api/v1/boards/:id/members`          |
| Muat kolom            | `GET /api/v1/boards/:board_id/lists`       |
| Buat kolom            | `POST /api/v1/lists`                       |
| Ganti nama kolom      | `PUT /api/v1/lists/:id`                    |
| Hapus kolom           | `DELETE /api/v1/lists/:id`                 |
| Geser urutan kolom    | `PUT /api/v1/boards/:board_id/position`    |
| Muat kartu            | `GET /api/v1/lists/:list_id/cards`         |
| Buat kartu            | `POST /api/v1/cards`                       |
| Ubah kartu            | `PUT /api/v1/cards/:id`                    |
| Hapus kartu           | `DELETE /api/v1/cards/:id`                 |
| Pindah kartu (drop)   | `PUT /api/v1/cards/:id`, lalu `PUT /api/v1/lists/:list_id/positions` |
| Pasang label          | `POST /api/v1/cards/:id/labels`            |
| Lepas label           | `DELETE /api/v1/cards/:id/labels`          |
| Pasang assignee       | `POST /api/v1/cards/:id/assignees`         |
| Lepas assignee        | `DELETE /api/v1/cards/:id/assignees`       |
| Upload lampiran       | `POST /api/v1/cards/:id/attachments`       |
| Hapus lampiran        | `DELETE /api/v1/cards/:card_id/attachments/:attachment_id` |
| Muat komentar         | `GET /api/v1/cards/:id/comments`           |
| Tambah komentar       | `POST /api/v1/cards/:id/comments`          |
| Hapus komentar        | `DELETE /api/v1/cards/:card_id/comments/:comment_id` |
| Muat semua label      | `GET /api/v1/labels`                       |
| Buat label            | `POST /api/v1/labels`                      |
| Ubah label            | `PUT /api/v1/labels/:id`                   |
| Hapus label           | `DELETE /api/v1/labels/:id`                |
| Cari user             | `GET /api/v1/users/page?filter=...`        |

Gerakan kartu dan kolom optimistic: state lokal berubah dulu, panggilan API
menyusul. Kalau API nolak, revert ke posisi semula.

### CORS

Sudah dikonfigurasi di sisi backend (`main.go`) untuk origin
`http://localhost:4321`. Kalau kamu menjalankan dev server di port lain,
tambahkan origin itu ke `AllowOrigins` di sana. Perhatikan `AllowMethods`
backend tidak memuat `PATCH`, jadi semua update di frontend memakai `PUT` —
dan `PUT` di API ini adalah **full replace**: kirim juga field yang tidak
berubah, kalau tidak field itu akan ter-reset.

## Autentikasi

Session disimpan di `localStorage` (key: `trackora.v1.session`). 
`src/lib/api.ts` inject `Authorization: Bearer <token>` ke setiap request 
yang butuh auth.

## Responsif: tiga tingkat

| Lebar          | Navigasi                        | Board                          |
| -------------- | ------------------------------- | ------------------------------ |
| `< 768px`      | Drawer + **island bawah**       | 1 kolom penuh layar, swipe snap |
| `768–1023px`   | **Rail ikon, selalu terlihat**  | ~2 kolom                       |
| `≥ 1024px`     | Sidebar penuh + label + akun    | 3+ kolom                       |

Sidebar tidak hilang di tablet — itu jawaban untuk pertanyaan "baiknya ada atau
tidak". Tablet punya ruang horizontal cukup untuk rail 64px, jadi navigasi tetap
terlihat dan berpindah board tetap satu ketukan. Di rail, board jadi tombol
berinisial. Hanya di bawah 768px navigasi disembunyikan ke drawer, karena di sana
setiap piksel horizontal dipakai kolom board.

**Rail di tablet bisa dibuka.** Sebelumnya rail cuma tampil kecil tanpa cara
melebarkannya — itu bug, bukan desain. Sekarang logo di rail berfungsi sebagai
tombol expand. Rail yang terbuka muncul sebagai **overlay** di atas board, bukan
melebar di tempat: di layar 768px, melebar di tempat akan memampatkan kolom board
sampai tidak terbaca. Tutup dengan klik luar, tombol tutup, `Esc`, atau setelah
memilih board.

### Kenapa kolom board dulu tumpang tindih di tablet/ponsel

Baris kolom board punya tiga properti yang wajib ada. Kalau salah satu hilang,
kolomnya menumpuk begitu tidak muat lagi — dan itu hanya kelihatan di layar
sempit, karena di desktop kontennya masih muat jadi tidak ada yang menyusut:

- `w-max` di baris kolom. Flex container defaultnya `width: auto`, yang di sini
  resolve ke lebar **kontainer**, bukan lebar konten. Barisnya jadi lebih sempit
  daripada anak-anaknya sendiri.
- `shrink-0` di tiap wrapper kolom. Flex item defaultnya boleh menyusut. Di baris
  yang kesempitan, wrapper-nya dipaksa mengecil sementara `<section>` di dalamnya
  lebarnya tetap — jadi kolomnya saling menimpa.
- `overflow-y-hidden` di `<main>`. Tiap kolom sudah men-scroll kartunya sendiri,
  jadi board tidak boleh menumbuhkan scrollbar vertikal kedua.

Efeknya di tablet 768px: wrapper menyusut dari 280px jadi ~125px (tumpang tindih
155px per kolom), lima kolom menumpuk di 672px pertama, tapi area scroll-nya tetap
1448px — sisanya ~776px jadi **ruang kosong** saat di-scroll ke kanan. Di desktop
1920px penyusutannya 0px, jadi tampilannya rapi. Itu sebabnya bug ini cuma muncul
di layar kecil.

Padding horizontalnya ditaruh di baris, bukan di `<main>`, karena Chrome dan
Safari mengabaikan `padding-right` pada scroll container — tanpa itu kolom
terakhir menempel ke tepi.

Detail kartu jadi **bottom sheet** di ponsel (tombol tutup dan isi pertama
terjangkau ibu jari) dan panel samping mulai `sm`. Week spine tetap bisa
di-scroll horizontal di layar sempit, tidak dimampatkan — tick beban kerjanya
akan hilang kalau dipaksa muat.

## Navigasi & akun

Item **Due** dan **Overdue** di sidebar dulu cuma dekorasi: angkanya benar, tapi
menekannya tidak melakukan apa-apa. Sekarang keduanya jadi filter board, dan
menekan item yang sedang aktif mengembalikan tampilan ke seluruh board — jadi
satu tombol dipakai untuk masuk dan keluar, tidak perlu kontrol "bersihkan"
terpisah. Filternya ada di `lib/view.ts`.

Ini kebalikan sengaja dari week spine. Memilih hari di spine hanya **menyorot**
kartu di tempatnya, karena minggu yang dilihat masih utuh. Due dan Overdue
menjawab "sekarang apa", jadi sisanya justru gangguan yang ditanyakan — kartunya
memang dibuang dari tampilan. Karena menyembunyikan kartu di board kanban gampang
terbaca sebagai kehilangan data, selalu ada banner di atas kolom selama filter
menyala, plus pesan tersendiri kalau hasilnya kosong. Filter ini juga hanya
menghitung kartu yang belum selesai, sama seperti angka di sidebar: tugas telat
yang sudah dikerjakan tidak muncul lagi di Overdue.

Item **Archive** dihapus, bukan diperbaiki. Backend tidak punya kolom arsip dan
tidak punya endpoint untuk mengisinya, jadi baris itu menjanjikan tempat yang
tidak ada. Kartu diselesaikan dengan memindahkannya ke kolom selesai.

**Foto profil sekarang membuka menu, bukan langsung logout.** Sebelumnya, baik
chevron di sidebar maupun avatar di topbar terhubung lurus ke `logout` — ikon
yang terbaca "tutup panel" mengerjakan satu-satunya aksi yang tidak bisa
dibatalkan di seluruh navigasi. `AccountMenu` sekarang menampilkan identitas yang
sedang masuk, pintasan ke pengaturan, tema, bahasa, lalu keluar di paling bawah.
Tidak ada dialog konfirmasi: membuka menu lalu memilih baris terakhir sudah
merupakan langkah sadar.

**Pengaturan** (`SettingsDialog`) mengubah nama dan email lewat
`PUT /v1/users/:id`, jadi menu itu benar-benar punya isi tanpa menyentuh backend.
Hanya `name` dan `email` yang dikirim, karena endpoint-nya bind seluruh model
user — mengirim semuanya berarti form ini bisa ikut menulis `role`. Hasil simpan
dinaikkan ke `TrackoraApp` yang memegang session, kalau tidak nama baru tersimpan
di server tapi avatar di layar masih yang lama sampai reload.

**Island bawah di ponsel.** Di bawah `md`, satu-satunya navigasi adalah hamburger
di pojok kiri atas — sudut terjauh dari ibu jari — dan akun tidak terlihat sama
sekali, jadi "cara ganti session di HP" tidak punya jawaban yang kelihatan.
`MobileIsland` menaruh Board · Due · Overdue · Profil sebagai pil mengambang di
bawah. Mengambang, bukan menempel di tepi, supaya kolom board terlihat lewat di
belakangnya — board tetap subjeknya. Hitungan menempel di ikon sebagai badge,
karena alasan menekan Overdue hampir selalu angkanya bukan nol. Labelnya hanya
muncul di segmen aktif (tiga label tidak muat di layar 360px tanpa terpotong
semua), dan yang tidak aktif tetap punya `sr-only`. Baris kolom board dapat
`pb-20` di bawah `md` supaya kartu terakhir tidak tertutup pil.

Dropdown board, bahasa, dan akun sama-sama perlu "tutup saat klik di luar atau
`Esc`". Dua salinan sudah ada dan yang ketiga hampir dibuat, jadi logikanya
pindah ke `lib/useDismissable.ts`. Hook itu memakai `mousedown`, bukan `click`:
klik yang dimulai di dalam lalu lepas di luar (seleksi teks, jari meleset)
sebaiknya tidak dihitung sebagai "klik di luar".

## Aksesibilitas & responsif

Fokus keyboard terlihat di semua kontrol, ikon tanpa teks punya `aria-label`,
tumpukan tick di spine punya padanan teks untuk screen reader, dan
`prefers-reduced-motion` dihormati. Layout diuji turun sampai lebar ~360px:
sidebar jadi drawer, search pindah ke barisnya sendiri, kolom board tetap
scroll horizontal.

## Tema light / dark

`paper-*` dan `ink-*` bukan warna literal, tapi **ramp semantik**:
`paper` = permukaan (50 = kartu terangkat, 200 = latar aplikasi), `ink` = teks
(400 = redup, 900 = paling kuat). Di dark mode, variabel yang sama didefinisikan
ulang di `.dark`, jadi `bg-paper-50` otomatis jadi permukaan gelap dan
`text-ink-900` jadi mendekati putih — **arah kontras terjaga**, tanpa perlu
menambah varian `dark:` di setiap elemen.

Itu menjawab kekhawatiran "kalau light mode tulisannya putih, jadi tidak
kelihatan": tidak ada satu pun teks yang dikunci ke putih. Yang dulu
`text-white` sekarang `text-onaccent`, dan `--color-onaccent` ikut berubah
(terang di light mode, gelap di dark mode) mengikuti warna isian di bawahnya.

Tiga token sengaja **tidak** ikut berubah, karena permukaannya gelap di kedua
tema: `nav-*` (sidebar dan panel brand di halaman login), `nav-accent` (baris
board aktif), dan `scrim` (latar modal). Kalau ikut berubah, sidebar akan jadi
gelap-di-atas-gelap.

Kontrol tema ada tiga posisi (terang / gelap / ikut sistem), bukan switch dua
posisi — "ikut sistem" itu preferensi nyata dan akan hilang kalau dipaksa biner.
Ada skrip kecil inline di `Layout.astro` yang jalan **sebelum paint**, jadi
pengguna dark mode tidak kena kedip putih saat halaman dibuka.

Semua pasangan warna teks/latar sudah dihitung rasio kontrasnya dan **lulus WCAG
AA (≥ 4.5:1) di kedua tema**. Dua pasangan light mode awalnya masih 4.2–4.3
(`petrol-400` dan `saffron-600`), jadi nilainya digelapkan sedikit.

## i18n

Tiga bahasa: Indonesia (default), English, 中文. Pemilihnya ada di topbar dan di
halaman login, tersimpan di `localStorage`, dan `<html lang>` ikut disesuaikan.

Kamus `id` adalah sumber kebenaran; tipe `TranslationKey` diturunkan darinya:

```ts
export type TranslationKey = keyof typeof id;
export type Dictionary = Record<TranslationKey, string>;
```

Karena `en` dan `zh` bertipe `Dictionary`, **key yang lupa diterjemahkan jadi
error saat compile**, bukan string kosong yang baru ketahuan di layar. Saat ini
190 key, ketiganya lengkap.

Tanggal tidak di-hardcode: nama hari dan bulan diambil dari `Intl`
(`id-ID` / `en-GB` / `zh-CN`), jadi week spine ikut berubah bahasanya. Font
`Noto Sans SC` dimuat sebagai fallback supaya teks Mandarin tidak jatuh ke font
sistem yang tidak serasi.

## Catatan build

`node_modules` di repo ini terpasang dari Windows, jadi binary native
(`@tailwindcss/oxide`, `@rollup/rollup-*`) hanya cocok untuk Windows. Jalankan
`npm run dev` / `npm run build` **di host**, bukan di container Linux.

Type-check jalan di mana saja karena `tsc` murni JavaScript:

```bash
node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json
```

`tsconfig.json` menyalakan `exactOptionalPropertyTypes`,
`noUncheckedIndexedAccess`, `noUnusedLocals`, dan `noUnusedParameters` di atas
preset strict Astro.
