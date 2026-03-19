import { FUNNY_NAMES, CORRUPTION_TYPES } from "@/lib/constants";

export function getAnonymousName(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return FUNNY_NAMES[Math.abs(hash) % FUNNY_NAMES.length];
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getCorruptionIcon(type: string): string {
  const found = CORRUPTION_TYPES.find((c) => c.value === type);
  return found?.icon || "📋";
}

export function getDominantVote(votes: { truth: number; needProve: number; fake: number }): "truth" | "needProve" | "fake" | "neutral" {
  const { truth, needProve, fake } = votes;
  const total = truth + needProve + fake;
  if (total === 0) return "neutral";
  if (truth >= needProve && truth >= fake) return "truth";
  if (fake >= truth && fake >= needProve) return "fake";
  return "needProve";
}

export function getShareText(title: string): string {
  const savageCaptions = [
    // ঐতিহাসিক রেফারেন্স — emotional punch
    "🎋 তিতুমীর বাঁশের কেল্লা বানিয়েছিলেন এই চোরদের বিরুদ্ধেই! আজ আমরা শেয়ার করি! 🔥👇",
    "💣 ক্ষুদিরাম ফাঁসি নিয়েছিল, আর এরা দেশের টাকা নিয়ে ঘুরছে! লজ্জা নেই? 😤👇",
    "🩸 ভাষার জন্য শহীদরা রক্ত দিয়েছেন — এই দুর্নীতিবাজরা সেই দেশ খাচ্ছে! 😭👇",
    "🔫 সূর্যসেন অস্ত্র তুলেছিলেন, আমরা অন্তত কলম তুলি! এই চোরকে EXPOSE করুন 👇",
    "⚡ প্রীতিলতা নারী হয়ে লড়েছিলেন — আর এই পুরুষরা জনগণকে লুটছে! শেয়ার করুন 😡👇",

    // ধর্মীয় ন্যায়বিচারের রেফারেন্স
    "⚔️ হযরত ওমর (রা.) রাতে মানুষের খোঁজ নিতেন — এই শাসকরা রাতে টাকা গোনে! 😈👇",
    "🦁 সালাহউদ্দিন আইয়ুবী সাম্রাজ্য পরিষ্কার করেছিলেন — আমরা পারব না? SHARE দিন! 🔥👇",
    "🐎 খালিদ বিন ওয়ালিদ বলতেন সত্যের পথ ছাড়া নেই — এই সত্য রিপোর্ট দেখুন 👇",
    "🏛️ ন্যায়বিচার চাই! এই দুর্নীতি দেখলে খোদ বিচারকেরাও লজ্জা পেতেন 😤👇",

    // কমিক কিন্তু emotional
    "🐀 ইঁদুর ধরা পড়েছে! দেশের গুদাম খালি করে ফেলছিল! 🧀👇",
    "😈 মুখোশ খুলে গেছে! ভেতরে ছিল আসল চেহারা — দেখুন এবং শেয়ার করুন! 🎭👇",
    "💀 এত সাহস?! জনগণের টাকায় রাজত্ব করছে! VIRAL করুন, জানাও সবাইকে 💣👇",
    "🚨 EXPOSED! ক্ষমা নেই, ছাড় নেই — প্রমাণসহ রিপোর্ট দেখুন 😤👇",
    "🕵️ গোপন তথ্য ফাঁস! এই রিপোর্ট শেয়ার না করলে আপনিও দায়ী! 🔍👇",
    "💰 জনগণের ঘামের টাকা — এই চোরের পকেটে! চিনে রাখুন! 🤬👇",
  ];

  const caption = savageCaptions[Math.floor(Math.random() * savageCaptions.length)];
  return `${caption}\n\n"${title}"\n\n#চোরকই #দুর্নীতি #ChorKoi #ভাইরাল`;
}
