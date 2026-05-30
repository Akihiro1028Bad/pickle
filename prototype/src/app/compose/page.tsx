"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { RequireAuth } from "@/components/RequireAuth";
import { RegionChips } from "@/components/RegionChips";

const PLACEHOLDER =
  "今日 19:00〜21:00 / PBT コート2\n中級ダブルス、あと1名募集！\n¥1,200/人・手ぶらOK🥒";

const DURATIONS = ["3時間", "5時間", "1日", "3日"];

export default function ComposePage() {
  return (
    <RequireAuth>
      <Composer />
    </RequireAuth>
  );
}

function Composer() {
  const router = useRouter();
  const { addPost } = useApp();
  const [text, setText] = useState("");
  const [duration, setDuration] = useState("1日");
  const [regions, setRegions] = useState<string[]>([]);

  const submit = () => {
    const body = text.trim();
    if (body) addPost(body, duration, regions);
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-5 py-3">
        <button
          onClick={() => router.back()}
          className="grid h-[34px] w-[34px] place-items-center rounded-full border border-white/10 bg-surface text-base text-ink"
        >
          ×
        </button>
        <span className="font-ja text-[15px] font-bold text-ink">投稿を作成</span>
        <span className="h-[34px] w-[34px]" />
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28">
        <div className="mb-2.5 font-ja text-[11px] font-bold uppercase tracking-wider text-muted">
          投稿内容
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          maxLength={300}
          className="min-h-[300px] w-full resize-none rounded-xl border border-white/10 bg-surface p-3.5 font-ja text-[13px] leading-8 text-ink outline-none placeholder:text-faint focus:border-accent/50"
        />
        <div className="mt-1 text-right font-display text-[11px] text-faint">{text.length} / 300</div>
        <p className="mt-3.5 font-ja text-[11px] leading-relaxed text-muted">
          日時・場所・レベル・人数・料金など、必要なことを
          <span className="font-bold text-accent">自由に</span>書いてください。
        </p>

        <div className="mt-6 font-ja text-[11px] font-bold uppercase tracking-wider text-muted">
          表示時間
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`rounded-full border px-3.5 py-1.5 font-ja text-[12px] font-bold ${
                duration === d ? "border-accent bg-accent text-on-accent" : "border-white/10 bg-surface text-ink-2"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="mt-2 font-ja text-[11px] leading-relaxed text-muted">
          選んだ時間が過ぎると自然に下がっていく目安です（手動の締め切り操作は不要）。
        </p>

        <div className="mt-6 font-ja text-[11px] font-bold uppercase tracking-wider text-muted">
          発信する地域（任意・複数選択可）
        </div>
        <p className="mb-2 mt-1 font-ja text-[11px] leading-relaxed text-muted">
          選ばない場合は <span className="font-bold text-accent">全国向け</span> として表示されます。
        </p>
        <RegionChips value={regions} onChange={setRegions} />
      </main>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg to-transparent px-5 pb-5 pt-4">
        <button
          onClick={submit}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-extrabold text-on-accent shadow-[0_8px_24px_rgba(246,255,84,0.28)]"
        >
          投稿する
          <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-on-accent text-[13px] text-accent">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
