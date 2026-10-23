import type { Locale } from './index';

export const SITE_URL: string =
  import.meta.env.PUBLIC_SITE_URL ??
  import.meta.env.SITE ??
  'https://www.trackora.web.id';

export function landingPath(locale: Locale): string {
  // Trailing slash mengikuti output build (en/index.html) dan URL di sitemap.
  return locale === 'id' ? '/' : `/${locale}/`;
}

export function landingUrl(locale: Locale): string {
  return new URL(landingPath(locale), SITE_URL).toString();
}

export type CardTone = 'overdue' | 'due-soon' | 'plain';

export interface SpineCard {
  readonly startDay: 1 | 2 | 3 | 4 | 5 | 6;
  readonly title: string;
  readonly due: string;
  readonly tone: CardTone;
}

export interface Capability {
  readonly label: string;
  readonly title: string;
  readonly body: string;
}

export interface LandingView {
  readonly id: 'board' | 'due' | 'overdue';
  readonly label: string;
  readonly title: string;
  readonly body: string;
}

export interface LandingPrinciple {
  readonly title: string;
  readonly body: string;
}

export interface LandingCopy {
  readonly htmlLang: string;
  readonly ogLocale: string;
  readonly documentTitle: string;
  readonly metaDescription: string;

  readonly eyebrow: string;
  readonly headline: string;
  readonly lede: string;
  readonly primaryCta: string;
  readonly secondaryCta: string;
  readonly signInCta: string;
  readonly themeLabel: string;
  readonly themeLight: string;
  readonly themeDark: string;
  readonly themeSystem: string;
  readonly weekEyebrow: string;
  readonly dayInitials: readonly string[];
  readonly todayLabel: string;
  readonly spineCards: readonly SpineCard[];
  readonly demoLists: readonly string[];
  readonly doneCardTitle: string;
  readonly doneLabel: string;

  readonly capabilitiesEyebrow: string;
  readonly capabilitiesHeading: string;
  readonly capabilities: readonly Capability[];

  readonly viewsEyebrow: string;
  readonly viewsHeading: string;
  readonly viewsBody: string;
  readonly views: readonly LandingView[];

  readonly principlesEyebrow: string;
  readonly principlesHeading: string;
  readonly principlesBody: string;
  readonly principles: readonly LandingPrinciple[];

  readonly ctaHeading: string;
  readonly ctaBody: string;

  readonly navOverview: string;
  readonly navHow: string;
  readonly navStart: string;
  readonly footerCardTitle: string;

  readonly localeEyebrow: string;
  readonly footerNote: string;
  readonly footerCta: string;
}

const idCopy: LandingCopy = {
  htmlLang: 'id',
  ogLocale: 'id_ID',
  documentTitle: 'Trackora · papan kerja pribadi',
  metaDescription:
    'Papan kerja pribadi yang menaruh setiap kartu di hari jatuh temponya. Buat papan, atur daftar, dan lihat apa yang mendesak dalam satu tampilan minggu.',

  eyebrow: 'Papan kerja pribadi',
  headline: 'Yang jatuh tempo minggu ini, terlihat sejak Senin.',
  lede: 'Trackora menaruh setiap kartu di hari jatuh temponya. Tidak ada daftar panjang yang harus dibaca ulang, cukup lihat minggunya.',
  primaryCta: 'Buka papan',
  secondaryCta: 'Buat akun',
  signInCta: 'Masuk',
  themeLabel: 'Tema',
  themeLight: 'Terang',
  themeDark: 'Gelap',
  themeSystem: 'Ikuti sistem',

  weekEyebrow: 'Minggu ini',
  dayInitials: ['S', 'S', 'R', 'K', 'J', 'S', 'M'],
  todayLabel: 'Hari ini',
  spineCards: [
    {
      startDay: 1,
      title: 'Revisi brief klien',
      due: 'Telat 2 hari',
      tone: 'overdue',
    },
    { startDay: 4, title: 'Kirim invoice', due: 'Besok', tone: 'due-soon' },
    { startDay: 6, title: 'Riset kompetitor', due: 'Sabtu', tone: 'plain' },
  ],
  demoLists: ['Belum mulai', 'Sedang jalan', 'Selesai'],
  doneCardTitle: 'Rapikan papan kerja',
  doneLabel: 'Selesai',

  capabilitiesEyebrow: 'Isi papan',
  capabilitiesHeading: 'Cukup untuk mengurus kerja sendiri, tanpa yang lain-lain.',
  capabilities: [
    {
      label: 'Papan',
      title: 'Daftar yang bisa digeser',
      body: 'Susun kolom sesuai alur kerja Anda, lalu pindahkan kartu antar kolom sambil jalan.',
    },
    {
      label: 'Jatuh tempo',
      title: 'Tanggal yang berubah warna',
      body: 'Kartu menguning saat mendekati tenggat dan memerah setelah lewat. Tidak perlu membuka satu per satu.',
    },
    {
      label: 'Label & anggota',
      title: 'Siapa mengerjakan apa',
      body: 'Beri label berwarna dan tugaskan orang, lalu saring papan sampai tersisa yang Anda cari.',
    },
    {
      label: 'Komentar & lampiran',
      title: 'Konteks menempel di kartunya',
      body: 'Diskusi dan berkas tinggal di kartu tempat keputusan diambil, bukan tercecer di tempat lain.',
    },
  ],

  viewsEyebrow: 'Tiga sudut pandang',
  viewsHeading: 'Satu papan, tiga cara membacanya.',
  viewsBody:
    'Papan yang sama bisa dilihat sebagai alur kerja, daftar tenggat hari ini, atau kartu yang sudah lewat. Tidak perlu menggandakan pekerjaan.',
  views: [
    {
      id: 'board',
      label: 'Papan',
      title: 'Alur kerja berdampingan',
      body: 'Semua daftar terlihat sekaligus. Geser kartu saat pekerjaan berpindah tahap, tanpa kehilangan urutan.',
    },
    {
      id: 'due',
      label: 'Jatuh tempo',
      title: 'Hari ini saja',
      body: 'Saring papan ke kartu yang jatuh tempo hari ini. Strip minggu di atas tetap menunjukkan hari lain yang perlu disiapkan.',
    },
    {
      id: 'overdue',
      label: 'Terlambat',
      title: 'Yang perlu dibereskan dulu',
      body: 'Kartu yang sudah lewat tenggat dikumpulkan di satu tampilan, jadi tidak tenggelam di dasar kolom.',
    },
  ],

  principlesEyebrow: 'Cara kerja',
  principlesHeading: 'Papan yang mengikuti ritme minggu, bukan tumpukan notifikasi.',
  principlesBody:
    'Trackora sengaja dibuat tenang. Tidak ada feed, tidak ada pengingat yang mengejar. Kamu membuka papan, melihat tujuh hari ke depan, lalu memutuskan apa yang dikerjakan.',
  principles: [
    {
      title: 'Satu papan per konteks',
      body: 'Pisahkan kerja, rumah, dan proyek pribadi. Pindah papan tanpa kehilangan urusan yang sedang berjalan.',
    },
    {
      title: 'Tenggat terlihat lebih dulu',
      body: 'Warna dan strip minggu menunjukkan mana yang mendesak sebelum kamu membuka kartunya.',
    },
    {
      title: 'Tidak ada yang hilang di kolom lama',
      body: 'Kartu yang selesai tetap ada, tapi tidak lagi mengganggu pandangan kerja yang sedang jalan.',
    },
  ],

  ctaHeading: 'Mulai dari satu papan.',
  ctaBody:
    'Buat papan pertama, susun daftar, lalu isi kartu yang sedang berjalan. Kamu bisa mengubah susunannya kapan saja.',

  navOverview: 'Tampilan',
  navHow: 'Cara kerja',
  navStart: 'Mulai',
  footerCardTitle: 'Buat papan pertama',

  localeEyebrow: 'Bahasa',
  footerNote:
    'Proyek pribadi. Dibangun dengan Astro, React, dan TypeScript di depan; Go dan PostgreSQL di belakang.',
  footerCta: 'Buat akun',
};

const enCopy: LandingCopy = {
  htmlLang: 'en',
  ogLocale: 'en_US',
  documentTitle: 'Trackora · a personal work board',
  metaDescription:
    'A personal work board that puts every card on the day it is due. Build boards, arrange lists, and see what is urgent in a single week view.',

  eyebrow: 'A personal work board',
  headline: "What's due this week is visible from Monday.",
  lede: 'Trackora puts every card on the day it falls due. No long list to re-read, just look at the week.',
  primaryCta: 'Open the board',
  secondaryCta: 'Create an account',
  signInCta: 'Sign in',
  themeLabel: 'Theme',
  themeLight: 'Light',
  themeDark: 'Dark',
  themeSystem: 'Follow system',

  weekEyebrow: 'This week',
  dayInitials: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  todayLabel: 'Today',
  spineCards: [
    {
      startDay: 1,
      title: 'Revise the client brief',
      due: '2 days late',
      tone: 'overdue',
    },
    { startDay: 4, title: 'Send the invoice', due: 'Tomorrow', tone: 'due-soon' },
    { startDay: 6, title: 'Competitor research', due: 'Saturday', tone: 'plain' },
  ],
  demoLists: ['Not started', 'In progress', 'Done'],
  doneCardTitle: 'Tidy the work board',
  doneLabel: 'Done',

  capabilitiesEyebrow: 'Inside the board',
  capabilitiesHeading: 'Enough to run your own work, and nothing beyond it.',
  capabilities: [
    {
      label: 'Boards',
      title: 'Lists you can rearrange',
      body: 'Shape columns around how you actually work, then move cards between them as things progress.',
    },
    {
      label: 'Due dates',
      title: 'Dates that change colour',
      body: 'Cards turn amber as a deadline approaches and red once it passes. You never have to open one to check.',
    },
    {
      label: 'Labels & people',
      title: 'Who is on what',
      body: 'Add coloured labels and assign people, then filter the board down to whatever you came looking for.',
    },
    {
      label: 'Comments & files',
      title: 'Context stays on the card',
      body: 'Discussion and attachments live on the card where the decision was made, not scattered somewhere else.',
    },
  ],

  viewsEyebrow: 'Three ways in',
  viewsHeading: 'One board, three ways to read it.',
  viewsBody:
    'The same board works as a workflow, a list of what is due today, or a pile of work that slipped. You do not need a second board.',
  views: [
    {
      id: 'board',
      label: 'Board',
      title: 'Workflow side by side',
      body: 'Every list stays visible. Move a card when the work changes stage, without losing its place.',
    },
    {
      id: 'due',
      label: 'Due',
      title: 'Today only',
      body: 'Filter the board to cards due today. The week strip above still shows the other days that need attention.',
    },
    {
      id: 'overdue',
      label: 'Overdue',
      title: 'What needs clearing first',
      body: 'Cards past their due date gather in one view, so nothing sinks to the bottom of an old column.',
    },
  ],

  principlesEyebrow: 'How it works',
  principlesHeading: 'A board that follows the week, not a pile of notifications.',
  principlesBody:
    'Trackora is deliberately quiet. No feed, no reminders chasing you. Open the board, look at the next seven days, then decide what to work on.',
  principles: [
    {
      title: 'One board per context',
      body: 'Keep work, home, and side projects separate. Move between boards without losing the thread.',
    },
    {
      title: 'Due dates come first',
      body: 'Colour and the week strip show what is urgent before you open a card.',
    },
    {
      title: 'Nothing hides in old columns',
      body: 'Finished cards stay put, but stop crowding the work that is still moving.',
    },
  ],

  ctaHeading: 'Start with one board.',
  ctaBody:
    'Create your first board, arrange the lists, then add the work in motion. You can rearrange it whenever the week changes.',

  navOverview: 'Views',
  navHow: 'How it works',
  navStart: 'Start',
  footerCardTitle: 'Create your first board',

  localeEyebrow: 'Language',
  footerNote:
    'A personal project. Astro, React, and TypeScript on the front; Go and PostgreSQL behind it.',
  footerCta: 'Create an account',
};

const zhCopy: LandingCopy = {
  htmlLang: 'zh-CN',
  ogLocale: 'zh_CN',
  documentTitle: 'Trackora · 个人工作看板',
  metaDescription:
    '把每张卡片放在它到期的那一天的个人工作看板。创建看板、整理清单，在一周视图里看清什么最紧急。',

  eyebrow: '个人工作看板',
  headline: '本周到期的事，周一就看得见。',
  lede: 'Trackora 把每张卡片放在它到期的那一天。不用反复翻长长的清单，看一眼这一周就够了。',
  primaryCta: '进入看板',
  secondaryCta: '注册账号',
  signInCta: '登录',
  themeLabel: '主题',
  themeLight: '浅色',
  themeDark: '深色',
  themeSystem: '跟随系统',

  weekEyebrow: '本周',
  dayInitials: ['一', '二', '三', '四', '五', '六', '日'],
  todayLabel: '今天',
  spineCards: [
    { startDay: 1, title: '修改客户提案', due: '逾期 2 天', tone: 'overdue' },
    { startDay: 4, title: '寄出发票', due: '明天', tone: 'due-soon' },
    { startDay: 6, title: '竞品调研', due: '周六', tone: 'plain' },
  ],
  demoLists: ['未开始', '进行中', '完成'],
  doneCardTitle: '整理工作看板',
  doneLabel: '完成',

  capabilitiesEyebrow: '看板里有什么',
  capabilitiesHeading: '够用来打理自己的工作，不多一分。',
  capabilities: [
    {
      label: '看板',
      title: '可以随手挪动的清单',
      body: '按你实际的做事顺序排列各栏，然后随着进展把卡片挪到下一栏。',
    },
    {
      label: '到期日',
      title: '会变色的日期',
      body: '临近截止时卡片转为琥珀色，过期后转为红色。不用逐张点开确认。',
    },
    {
      label: '标签与成员',
      title: '谁在做哪一件',
      body: '加上彩色标签、指派成员，再把看板筛到只剩你要找的那些。',
    },
    {
      label: '评论与附件',
      title: '上下文留在卡片上',
      body: '讨论和文件就留在做决定的那张卡片里，不会散落到别处。',
    },
  ],

  viewsEyebrow: '三种查看方式',
  viewsHeading: '一块看板，三种读法。',
  viewsBody:
    '同一块看板可以当作流程、今天到期的清单，或已经逾期的那一堆。不需要再建第二块看板。',
  views: [
    {
      id: 'board',
      label: '看板',
      title: '清单并排',
      body: '所有清单同时可见。工作进入下一阶段时，把卡片移过去，顺序不会乱。',
    },
    {
      id: 'due',
      label: '到期',
      title: '只看今天',
      body: '把看板筛到今天就到期的卡片。上方的一周条仍然显示其他需要留意的日子。',
    },
    {
      id: 'overdue',
      label: '逾期',
      title: '先处理这些',
      body: '所有过期卡片集中在一个视图里，不会沉到旧清单底部。',
    },
  ],

  principlesEyebrow: '工作方式',
  principlesHeading: '跟着一周节奏走，而不是跟着通知堆走。',
  principlesBody:
    'Trackora 刻意保持安静。没有信息流，也没有不停追你的提醒。打开看板，看一眼未来七天，再决定今天做什么。',
  principles: [
    {
      title: '每个场景一块看板',
      body: '工作、生活和副业分开。切换看板时，手上的事仍然清楚。',
    },
    {
      title: '先看到期日',
      body: '颜色和一周条会在打开卡片之前告诉你什么最急。',
    },
    {
      title: '旧清单里不会藏东西',
      body: '完成的卡片留在原处，但不再挤占仍在推进的工作。',
    },
  ],

  ctaHeading: '从一块看板开始。',
  ctaBody: '创建第一块看板，整理清单，再放进正在推进的工作。之后随时可以调整。',

  navOverview: '视图',
  navHow: '工作方式',
  navStart: '开始',
  footerCardTitle: '创建第一块看板',

  localeEyebrow: '语言',
  footerNote:
    '个人项目。前端使用 Astro、React 与 TypeScript，后端使用 Go 与 PostgreSQL。',
  footerCta: '注册账号',
};

export const LANDING_COPY: Record<Locale, LandingCopy> = {
  id: idCopy,
  en: enCopy,
  zh: zhCopy,
};
