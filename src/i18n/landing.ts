import type { Locale } from './index';

export const SITE_URL: string =
  import.meta.env.PUBLIC_SITE_URL ?? 'https://frontendtrackora.vercel.app';

export function landingPath(locale: Locale): string {
  return locale === 'id' ? '/' : `/${locale}`;
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
  readonly weekEyebrow: string;
  readonly dayInitials: readonly string[];
  readonly todayLabel: string;
  readonly spineCards: readonly SpineCard[];

  readonly capabilitiesEyebrow: string;
  readonly capabilitiesHeading: string;
  readonly capabilities: readonly Capability[];

  readonly localeEyebrow: string;
  readonly footerNote: string;
  readonly footerCta: string;
}

const idCopy: LandingCopy = {
  htmlLang: 'id',
  ogLocale: 'id_ID',
  documentTitle: 'Trackora — papan kerja pribadi',
  metaDescription:
    'Papan kerja pribadi yang menaruh setiap kartu di hari jatuh temponya. Buat papan, atur daftar, dan lihat apa yang mendesak dalam satu tampilan minggu.',

  eyebrow: 'Papan kerja pribadi',
  headline: 'Yang jatuh tempo minggu ini, terlihat sejak Senin.',
  lede: 'Trackora menaruh setiap kartu di hari jatuh temponya. Tidak ada daftar panjang yang harus dibaca ulang — cukup lihat minggunya.',
  primaryCta: 'Buka papan',
  secondaryCta: 'Buat akun',
  signInCta: 'Masuk',

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

  localeEyebrow: 'Bahasa',
  footerNote:
    'Proyek pribadi. Dibangun dengan Astro, React, dan TypeScript di depan; Go dan PostgreSQL di belakang.',
  footerCta: 'Mulai pakai',
};

const enCopy: LandingCopy = {
  htmlLang: 'en',
  ogLocale: 'en_US',
  documentTitle: 'Trackora — a personal work board',
  metaDescription:
    'A personal work board that puts every card on the day it is due. Build boards, arrange lists, and see what is urgent in a single week view.',

  eyebrow: 'A personal work board',
  headline: "What's due this week is visible from Monday.",
  lede: 'Trackora puts every card on the day it falls due. No long list to re-read — just look at the week.',
  primaryCta: 'Open the board',
  secondaryCta: 'Create an account',
  signInCta: 'Sign in',

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

  localeEyebrow: 'Language',
  footerNote:
    'A personal project. Astro, React, and TypeScript on the front; Go and PostgreSQL behind it.',
  footerCta: 'Get started',
};

const zhCopy: LandingCopy = {
  htmlLang: 'zh-CN',
  ogLocale: 'zh_CN',
  documentTitle: 'Trackora — 个人工作看板',
  metaDescription:
    '把每张卡片放在它到期的那一天的个人工作看板。创建看板、整理清单，在一周视图里看清什么最紧急。',

  eyebrow: '个人工作看板',
  headline: '本周到期的事，周一就看得见。',
  lede: 'Trackora 把每张卡片放在它到期的那一天。不用反复翻长长的清单——看一眼这一周就够了。',
  primaryCta: '进入看板',
  secondaryCta: '注册账号',
  signInCta: '登录',

  weekEyebrow: '本周',
  dayInitials: ['一', '二', '三', '四', '五', '六', '日'],
  todayLabel: '今天',
  spineCards: [
    { startDay: 1, title: '修改客户提案', due: '逾期 2 天', tone: 'overdue' },
    { startDay: 4, title: '寄出发票', due: '明天', tone: 'due-soon' },
    { startDay: 6, title: '竞品调研', due: '周六', tone: 'plain' },
  ],

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

  localeEyebrow: '语言',
  footerNote:
    '个人项目。前端使用 Astro、React 与 TypeScript，后端使用 Go 与 PostgreSQL。',
  footerCta: '开始使用',
};

export const LANDING_COPY: Record<Locale, LandingCopy> = {
  id: idCopy,
  en: enCopy,
  zh: zhCopy,
};
