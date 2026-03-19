import { Mail, ExternalLink, Shield, Users, MapPin, Share2, CheckCircle, HelpCircle, XCircle, Megaphone, Eye, Newspaper, AlertTriangle, Globe, Heart, Scale, BookOpen, MessageCircle } from "lucide-react";
import { CORRUPTION_TYPES } from "@/lib/constants";

export default function InfoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

      <Section icon={<Megaphone className="w-5 h-5 text-primary" />} title="'চোর কই' কী?">
        <p className="text-sm text-foreground leading-relaxed">
          <span className="font-semibold text-primary">'চোর কই'</span> হলো একটি crowd-powered দুর্নীতি রিপোর্টিং প্ল্যাটফর্ম — যেখানে যেকেউ বেনামে দুর্নীতির ঘটনা পোস্ট করতে পারেন, এবং সাধারণ মানুষ ভোট দিয়ে সেই রিপোর্ট যাচাই করতে পারেন। কোনো অ্যাকাউন্ট লাগে না, কোনো পরিচয় লুকানো দরকার নেই।
        </p>
      </Section>

      <Section icon={<Eye className="w-5 h-5 text-primary" />} title="আমাদের লক্ষ্য">
        <ul className="space-y-2">
          {[
            "দুর্নীতির রিপোর্ট crowd verify করা",
            "সোশ্যাল মিডিয়ায় দুর্নীতিবিরোধী আলোচনা ছড়িয়ে দেওয়া",
            "সাংবাদিক ও নিউজ মিডিয়ার দৃষ্টি আকর্ষণ করা",
            "জনসচেতনতা ও জবাবদিহিতা তৈরি করা",
            "স্থানীয় পর্যায়ে দুর্নীতি প্রতিরোধে সাধারণ মানুষকে ক্ষমতায়ন করা",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={<Share2 className="w-5 h-5 text-primary" />} title="এটি কীভাবে কাজ করে">
        <div className="space-y-3">
          {[
            { step: "রিপোর্ট করুন", desc: "যেকোনো দুর্নীতির ঘটনা দেখলে বেনামে রিপোর্ট পোস্ট করুন। ছবি, ভিডিও বা লিংক যুক্ত করুন।" },
            { step: "সবাই ভোট দেয়", desc: "অন্য ব্যবহারকারীরা রিপোর্টের সত্যতা নিয়ে মতামত দেন — সত্য, প্রমাণ চাই, বা মিথ্যা।" },
            { step: "ভেরিফাই হয়", desc: "যথেষ্ট ভোটের ভিত্তিতে রিপোর্ট ভেরিফাইড হিসেবে চিহ্নিত হয়।" },
            { step: "ম্যাপে দেখুন", desc: "সব রিপোর্ট ম্যাপে দেখুন — কোন এলাকায় কোন ধরনের দুর্নীতি বেশি।" },
            { step: "শেয়ার করুন", desc: "সোশ্যাল মিডিয়ায় ভাইরাল করুন, সাংবাদিকদের নজরে আনুন।" },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">{i + 1}</div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.step}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<CheckCircle className="w-5 h-5 text-primary" />} title="ভোটিং সিস্টেম">
        <div className="space-y-2">
          <VoteOption
            icon={<CheckCircle className="w-4 h-4" />}
            color="text-vote-truth"
            bg="bg-vote-truth/10 border-vote-truth/30"
            label="✅ সত্য"
            desc="রিপোর্টটি সত্য বলে বিশ্বাস করলে এই ভোট দিন।"
          />
          <VoteOption
            icon={<HelpCircle className="w-4 h-4" />}
            color="text-vote-proof"
            bg="bg-vote-proof/10 border-vote-proof/30"
            label="🔍 আরো প্রমাণ চাই"
            desc="নিশ্চিত নন — আরো তথ্য বা প্রমাণ দরকার মনে হলে।"
          />
          <VoteOption
            icon={<XCircle className="w-4 h-4" />}
            color="text-vote-fake"
            bg="bg-vote-fake/10 border-vote-fake/30"
            label="❌ মিথ্যা"
            desc="রিপোর্টটি মিথ্যা বা বানোয়াট মনে হলে।"
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
          প্রতিটি রিপোর্টে একজন ব্যবহারকারী একটিমাত্র ভোট দিতে পারবেন। ভোট দিতে কোনো অ্যাকাউন্ট বা লগইন লাগে না।
        </p>
      </Section>

      <Section icon={<BookOpen className="w-5 h-5 text-primary" />} title="দুর্নীতির ধরন সমূহ">
        <div className="grid grid-cols-2 gap-2">
          {CORRUPTION_TYPES.map((t) => (
            <div key={t.value} className="flex items-center gap-2 bg-muted/60 rounded-lg p-2.5 border border-border/50">
              <span className="text-lg">{t.icon}</span>
              <span className="text-xs font-medium text-foreground">{t.label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Shield className="w-5 h-5 text-primary" />} title="গোপনীয়তা ও নিরাপত্তা">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            { title: "সম্পূর্ণ বেনামে", desc: "কোনো ব্যক্তিগত তথ্য সংগ্রহ করা হয় না।" },
            { title: "মজার ছদ্মনাম", desc: "প্রতিটি রিপোর্টারকে স্বয়ংক্রিয়ভাবে বাংলা ছদ্মনাম দেওয়া হয়।" },
            { title: "কোনো অ্যাকাউন্ট নেই", desc: "সাইন আপ বা লগইন ছাড়াই রিপোর্ট করা যায়।" },
            { title: "নিরাপদ প্ল্যাটফর্ম", desc: "আপনার পরিচয় কখনো প্রকাশ পাবে না।" },
          ].map((item, i) => (
            <div key={i} className="bg-muted/60 rounded-lg p-3 border border-border/50">
              <p className="text-xs font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Globe className="w-5 h-5 text-primary" />} title="কিভাবে অবদান রাখবেন">
        <div className="space-y-2">
          {[
            "আপনার এলাকায় দুর্নীতি দেখলে রিপোর্ট করুন",
            "অন্যদের রিপোর্টে ভোট দিন — সত্যাসত্য যাচাই করুন",
            "সোশ্যাল মিডিয়ায় রিপোর্ট শেয়ার করুন — সচেতনতা বাড়ান",
            "সাংবাদিক বন্ধুদের জানান — তারা অনুসন্ধান করতে পারেন",
            "অ্যাপটি ইন্সটল করুন এবং নিয়মিত ব্যবহার করুন",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-foreground">
              <Heart className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Newspaper className="w-5 h-5 text-primary" />} title="সাংবাদিক ও মিডিয়ার জন্য">
        <p className="text-sm text-foreground leading-relaxed">
          আপনি যদি সাংবাদিক হন, এই প্ল্যাটফর্মের ভেরিফাইড রিপোর্টগুলো অনুসন্ধানী সাংবাদিকতার জন্য লিড হিসেবে ব্যবহার করতে পারেন। সোর্স হিসেবে <span className="font-semibold">'চোর কই'</span>-এর রেফারেন্স দিন। ম্যাপ ভিউতে নির্দিষ্ট এলাকায় দুর্নীতির প্যাটার্ন খুঁজুন।
        </p>
      </Section>

      <Section icon={<MessageCircle className="w-5 h-5 text-primary" />} title="প্রায়শই জিজ্ঞাসিত প্রশ্ন (FAQ)">
        <div className="space-y-3">
          {[
            { q: "রিপোর্ট করতে কি লগইন লাগে?", a: "না, সম্পূর্ণ বেনামে রিপোর্ট করা যায়। কোনো অ্যাকাউন্ট প্রয়োজন নেই।" },
            { q: "ভোট দিতে কি লগইন লাগে?", a: "না, যেকেউ ভোট দিতে পারেন।" },
            { q: "আমার পরিচয় কি প্রকাশ পাবে?", a: "না, কখনোই না। প্রতিটি রিপোর্টারকে একটি মজার ছদ্মনাম দেওয়া হয়।" },
            { q: "ভুল রিপোর্ট দিলে কি হবে?", a: "কমিউনিটি ভোটের মাধ্যমে মিথ্যা রিপোর্ট চিহ্নিত হয়। এডমিন মিথ্যা রিপোর্ট মুছে দিতে পারেন।" },
            { q: "অ্যাপটি কি ফ্রি?", a: "হ্যাঁ, সম্পূর্ণ বিনামূল্যে এবং সবার জন্য উন্মুক্ত।" },
          ].map((item, i) => (
            <div key={i} className="bg-muted/40 rounded-lg p-3 border border-border/50">
              <p className="text-xs font-semibold text-foreground mb-1">❓ {item.q}</p>
              <p className="text-xs text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SmallSection title="⚠️ দায় অস্বীকার">
          <p className="text-xs text-muted-foreground leading-relaxed">
            এখানে পোস্ট করা রিপোর্টগুলো ব্যবহারকারীদের দ্বারা তৈরি। 'চোর কই' কোনো রিপোর্টের সত্যতা নিশ্চিত করে না। তথ্য যাচাইয়ের দায়িত্ব পাঠকের।
          </p>
        </SmallSection>
        <SmallSection title="🚫 কনটেন্ট নীতি">
          <p className="text-xs text-muted-foreground leading-relaxed">
            ব্যক্তিগত আক্রমণ, ঘৃণাবাক্য, ধর্মীয় উসকানি বা মিথ্যা তথ্য ছড়ানো নিষিদ্ধ। এডমিন যেকোনো রিপোর্ট মুছে দেওয়ার অধিকার রাখেন।
          </p>
        </SmallSection>
      </div>

      <Section icon={<Scale className="w-5 h-5 text-primary" />} title="আইনি তথ্য">
        <p className="text-sm text-foreground leading-relaxed">
          এই প্ল্যাটফর্মে প্রকাশিত তথ্য জনস্বার্থে প্রচারিত। দুর্নীতি দমন কমিশন (দুদক) আইন ২০০৪ অনুযায়ী যেকোনো নাগরিক দুর্নীতির অভিযোগ করতে পারেন। তথ্য অধিকার আইন ২০০৯ অনুযায়ী প্রতিটি নাগরিকের তথ্য জানার অধিকার রয়েছে।
        </p>
      </Section>

      <Section icon={<CheckCircle className="w-5 h-5 text-primary" />} title="কেন 'চোর কই' ব্যবহার করবেন?">
        <div className="flex flex-wrap gap-2">
          {["সম্পূর্ণ বিনামূল্যে", "বেনামে রিপোর্ট", "Crowd Verification", "ম্যাপভিত্তিক রিপোর্টিং", "সোশ্যাল শেয়ারিং", "মিডিয়ার নজরে আনুন", "PWA সাপোর্ট", "অফলাইন ব্যবহার"].map((tag) => (
            <span key={tag} className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {tag}
            </span>
          ))}
        </div>
      </Section>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-display font-bold text-base mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          যোগাযোগ করুন
        </h2>
        <div className="space-y-2.5">
          <a href="mailto:ridoan.zisan@gmail.com" className="flex items-center gap-2.5 text-sm text-primary hover:underline">
            <Mail className="w-4 h-4 text-muted-foreground" />
            ridoan.zisan@gmail.com
          </a>
          <a href="https://www.facebook.com/ridoan.zisan" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-primary hover:underline">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            Facebook
          </a>
        </div>
      </div>

      <div className="border-t pt-5 text-center text-xs text-muted-foreground">
        <p>
          Developed by{" "}
          <a href="https://ridoan-zisan.netlify.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
            Md Ridoan Mahmud Zisan
          </a>
        </p>
        <p className="mt-1 text-muted-foreground/60">দুর্নীতিমুক্ত বাংলাদেশের স্বপ্নে</p>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border p-5 shadow-sm">
      <h2 className="font-display font-bold text-base mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function SmallSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm">
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      {children}
    </div>
  );
}

function VoteOption({
  icon, color, bg, label, desc,
}: {
  icon: React.ReactNode; color: string; bg: string; label: string; desc: string;
}) {
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${bg}`}>
      <span className={`mt-0.5 ${color}`}>{icon}</span>
      <div>
        <p className={`text-sm font-semibold ${color}`}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
