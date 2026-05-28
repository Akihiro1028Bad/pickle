import Image from "next/image";
import Link from "next/link";

const OFFICIAL_SITE = "https://www.thepicklebang.com/";
const LABOLA_URL = "https://labola.jp/r/";

const FACILITY = [
  { icon: "📍", label: "アクセス", value: "本八幡駅 徒歩1分" },
  { icon: "🎾", label: "コート", value: "屋内 3コート" },
  { icon: "🕒", label: "営業", value: "早朝〜深夜（24時間利用可）※仮" },
];

const SERVICES = [
  { t: "コートレンタル", d: "1時間単位でコートを予約。手ぶらOK・パドルレンタルあり。" },
  { t: "レッスン & クリニック", d: "初心者から経験者まで。基礎・戦術を体系的に。" },
  { t: "大会 & イベント", d: "リーグ戦・交流会・初心者デーなどを定期開催。" },
];

export default function AboutPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-5 py-3">
        <Link
          href="/court"
          className="grid h-[34px] w-[34px] place-items-center rounded-full border border-white/10 bg-surface text-base text-ink"
        >
          ‹
        </Link>
        <span className="font-ja text-[15px] font-bold text-ink">PBTについて</span>
        <span className="h-[34px] w-[34px]" />
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-10">
        {/* ヒーロー */}
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-court to-court-2 p-5">
          <Image
            src="/logos/yoko-neon.png"
            alt="THE PICKLE BANG THEORY"
            width={200}
            height={74}
            className="h-9 w-auto drop-shadow-[0_0_24px_rgba(48,110,195,0.45)]"
            priority
          />
          <p className="mt-4 font-ja text-[15px] font-bold leading-relaxed text-white">
            ピックルボールのビッグバンが、ここから始まる。
          </p>
          <p className="mt-2 font-display text-[12px] tracking-wide text-white/70">Small Dink, Big Match.</p>
        </div>

        {/* 施設情報 */}
        <div className="mb-2 mt-6 font-ja text-[11px] font-bold uppercase tracking-wider text-muted">施設情報</div>
        <div className="flex flex-col gap-px overflow-hidden rounded-2xl border border-white/8 bg-surface">
          {FACILITY.map((f) => (
            <div key={f.label} className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0">
              <span className="text-base">{f.icon}</span>
              <span className="w-20 font-ja text-[11px] text-muted">{f.label}</span>
              <span className="flex-1 font-ja text-[13px] text-ink">{f.value}</span>
            </div>
          ))}
        </div>

        {/* できること */}
        <div className="mb-2 mt-6 font-ja text-[11px] font-bold uppercase tracking-wider text-muted">できること</div>
        <div className="flex flex-col gap-2">
          {SERVICES.map((s) => (
            <div key={s.t} className="rounded-2xl border border-white/8 bg-surface p-4">
              <div className="font-ja text-[13px] font-bold text-ink">{s.t}</div>
              <div className="mt-1 font-ja text-[12px] leading-relaxed text-muted">{s.d}</div>
            </div>
          ))}
        </div>

        {/* 初心者歓迎 */}
        <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/[0.07] p-4">
          <div className="font-ja text-[13px] font-bold text-accent">🔰 初心者、大歓迎です</div>
          <p className="mt-1 font-ja text-[12px] leading-relaxed text-ink-2">
            ルールが分からなくても大丈夫。レンタルパドルで手ぶらで来て、まずは打ってみるところから。
          </p>
        </div>

        {/* リンク */}
        <div className="mt-6 flex flex-col gap-2">
          <a
            href={OFFICIAL_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-extrabold text-on-accent"
          >
            公式サイトを見る ↗
          </a>
          <a
            href={LABOLA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-surface text-sm font-bold text-ink"
          >
            コートを予約する（LaBOLA）↗
          </a>
        </div>

        <p className="mt-4 font-ja text-[11px] leading-relaxed text-faint">
          ※ 施設情報は仮の内容を含みます。正式な情報・最新の営業時間は公式サイトをご確認ください。
        </p>
      </main>
    </div>
  );
}
