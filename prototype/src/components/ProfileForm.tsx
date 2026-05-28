"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";

const LEVELS = ["初級", "中級", "上級"];
const AVAILABILITY_OPTIONS = ["平日朝", "平日昼", "平日夜", "土日午前", "土日午後", "土日夜"];

export interface ProfileValues {
  name: string;
  level: string;
  dupr: string;
  bio: string;
  area: string;
  availability: string[];
  avatarUrl?: string;
}

interface ProfileFormProps {
  initial: ProfileValues;
  submitLabel: string;
  onSubmit: (values: ProfileValues) => void;
}

export function ProfileForm({ initial, submitLabel, onSubmit }: ProfileFormProps) {
  const [name, setName] = useState(initial.name);
  const [level, setLevel] = useState(initial.level);
  const [dupr, setDupr] = useState(initial.dupr);
  const [bio, setBio] = useState(initial.bio);
  const [area, setArea] = useState(initial.area);
  const [availability, setAvailability] = useState<string[]>(initial.availability);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initial.avatarUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleAvailability = (slot: string) =>
    setAvailability((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));

  const canSubmit = name.trim() && level;

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), level, dupr: dupr.trim(), bio: bio.trim(), area: area.trim(), availability, avatarUrl });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* アバター */}
      <div className="flex items-center gap-4">
        <Avatar name={name || "?"} src={avatarUrl} size="xl" className="ring-2 ring-white/15" />
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-white/15 bg-surface px-3 py-1.5 font-ja text-[12px] font-bold text-ink"
          >
            画像を選択
          </button>
          {avatarUrl && (
            <button onClick={() => setAvatarUrl(undefined)} className="font-ja text-[11px] text-ember">
              画像を削除（頭文字に戻す）
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
        </div>
      </div>

      <Field label="表示名" required>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例）Akihiro T."
          className="pf-input"
        />
      </Field>

      <Field label="レベル" required>
        <div className="flex gap-2">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              onClick={() => setLevel(lv)}
              className={`rounded-lg border px-4 py-2 font-ja text-[13px] font-bold ${
                level === lv
                  ? "border-accent bg-accent text-on-accent"
                  : "border-white/10 bg-surface text-ink-2"
              }`}
            >
              {lv}
            </button>
          ))}
        </div>
        <p className="mt-2 font-ja text-[11px] leading-relaxed text-muted">
          相手が参加しやすさを判断できるようにするための目安です。
        </p>
      </Field>

      <Field label="DUPR（任意）">
        <input
          value={dupr}
          onChange={(e) => setDupr(e.target.value)}
          placeholder="例）3.45"
          inputMode="decimal"
          className="pf-input"
        />
        <p className="mt-2 font-ja text-[11px] leading-relaxed text-muted">
          未入力でも使えます。分からない場合は空欄で問題ありません。
        </p>
      </Field>

      <Field label="自己紹介・一言（任意）">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="例）平日夜によく打ってます。初級さんも歓迎🥒"
          maxLength={120}
          className="pf-input min-h-[72px] resize-none"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["平日夜によく打ちます", "初級さん歓迎", "ゲーム形式が好き"].map((sample) => (
            <button
              key={sample}
              onClick={() => setBio((prev) => (prev ? prev : sample))}
              className="rounded-full border border-white/10 bg-surface px-2 py-1 font-ja text-[10px] font-bold text-ink-2"
            >
              {sample}
            </button>
          ))}
        </div>
      </Field>

      <Field label="よく打つエリア（任意）">
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="例）本八幡 / 市川 / 船橋"
          className="pf-input"
        />
        <p className="mt-2 font-ja text-[11px] leading-relaxed text-muted">
          相手が「近いか」を判断しやすくなります。
        </p>
      </Field>

      <Field label="よく空いている時間（任意）">
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_OPTIONS.map((slot) => {
            const on = availability.includes(slot);
            return (
              <button
                key={slot}
                onClick={() => toggleAvailability(slot)}
                className={`rounded-full border px-3 py-1.5 font-ja text-[12px] font-bold ${
                  on ? "border-accent bg-accent text-on-accent" : "border-white/10 bg-surface text-ink-2"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </Field>

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="mt-1 flex h-[50px] w-full items-center justify-center rounded-md bg-accent text-sm font-extrabold text-on-accent disabled:opacity-40"
      >
        {submitLabel}
      </button>

      <style>{`
        .pf-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: var(--color-surface);
          padding: 12px 14px;
          font-family: var(--font-ja);
          font-size: 13px;
          color: var(--color-ink);
          outline: none;
        }
        .pf-input::placeholder { color: var(--color-faint); }
        .pf-input:focus { border-color: rgba(246,255,84,0.5); }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 font-ja text-[11px] font-bold uppercase tracking-wider text-muted">
        {label}
        {required && <span className="text-ember">必須</span>}
      </span>
      {children}
    </label>
  );
}
