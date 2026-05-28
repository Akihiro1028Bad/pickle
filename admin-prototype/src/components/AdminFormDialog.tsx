"use client";

import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { ADMIN_ROLES, ADMIN_ROLE_LABEL, ADMIN_ROLE_DESC, type AdminRole } from "@/lib/mock";
import { generatePassword, PASSWORD_MIN_LENGTH } from "@/lib/password";

export interface AdminFormValues {
  name: string;
  email: string;
  role: AdminRole;
  /** 発行/変更する初期パスワード。空文字は「変更なし」 */
  password: string;
}

interface AdminFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: { name: string; email: string; role: AdminRole };
  onClose: () => void;
  onSubmit: (values: AdminFormValues) => void;
}

const fieldClass =
  "h-10 w-full rounded-lg border border-white/10 bg-surface-2 px-3 font-ja text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent/50";
const labelClass = "mb-1 block font-ja text-[12px] font-semibold text-ink-2";
const miniBtn =
  "h-10 shrink-0 rounded-lg bg-surface px-3 font-ja text-[12px] font-semibold text-ink-2 hover:text-ink";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const baseDefaults = { name: "", email: "", role: "moderator" as AdminRole };

export function AdminFormDialog({ open, mode, initial, onClose, onSubmit }: AdminFormDialogProps) {
  const isCreate = mode === "create";

  const [values, setValues] = useState<AdminFormValues>({ ...baseDefaults, password: "" });
  const [touched, setTouched] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState(false);

  // ダイアログを開くたびに初期化。作成時は初期パスワードを自動発行しておく
  useEffect(() => {
    if (!open) return;
    setValues({
      name: initial?.name ?? "",
      email: initial?.email ?? "",
      role: initial?.role ?? "moderator",
      password: isCreate ? generatePassword() : "",
    });
    setTouched(false);
    setShowPw(isCreate);
    setCopied(false);
  }, [open, initial, isCreate]);

  const nameError = !values.name.trim() ? "氏名を入力してください" : "";
  const emailError = !values.email.trim()
    ? "メールアドレスを入力してください"
    : !EMAIL_RE.test(values.email.trim())
      ? "メールアドレスの形式が正しくありません"
      : "";
  // パスワード: 作成時は必須、編集時は空欄なら変更なし。入力時は最低文字数を要求
  const pwError =
    isCreate && !values.password
      ? "パスワードを発行してください"
      : values.password && values.password.length < PASSWORD_MIN_LENGTH
        ? `パスワードは${PASSWORD_MIN_LENGTH}文字以上にしてください`
        : "";
  const valid = !nameError && !emailError && !pwError;

  const regenerate = () => {
    setValues((v) => ({ ...v, password: generatePassword() }));
    setShowPw(true);
    setCopied(false);
  };

  const copyPassword = async () => {
    if (!values.password) return;
    try {
      await navigator.clipboard.writeText(values.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role,
      password: values.password,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCreate ? "管理者を招待" : "管理者を編集"}
      desc={isCreate ? "メール宛に招待を送り、一覧に追加します" : "氏名・メール・ロール・パスワードを変更します"}
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 rounded-lg bg-surface-2 px-4 font-ja text-[13px] font-semibold text-ink-2 hover:text-ink"
          >
            キャンセル
          </button>
          <button
            onClick={submit}
            disabled={touched && !valid}
            className="h-9 rounded-lg bg-accent px-4 font-ja text-[13px] font-bold text-on-accent hover:opacity-90 disabled:opacity-40"
          >
            {isCreate ? "招待を送る" : "変更を保存"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor="admin-name">氏名</label>
          <input
            id="admin-name"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            placeholder="例：山田 太郎"
            className={fieldClass}
          />
          {touched && nameError && <p className="mt-1 font-ja text-[11px] text-ember">{nameError}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="admin-email">メールアドレス</label>
          <input
            id="admin-email"
            type="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            placeholder="例：taro@pbt.jp"
            className={fieldClass}
          />
          {touched && emailError && <p className="mt-1 font-ja text-[11px] text-ember">{emailError}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="admin-role">ロール</label>
          <select
            id="admin-role"
            value={values.role}
            onChange={(e) => setValues((v) => ({ ...v, role: e.target.value as AdminRole }))}
            className={fieldClass}
          >
            {ADMIN_ROLES.map((r) => (
              <option key={r} value={r}>
                {ADMIN_ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          <p className="mt-1 font-ja text-[11px] text-muted">{ADMIN_ROLE_DESC[values.role]}</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="admin-password">
            {isCreate ? "初期パスワード" : "新しいパスワード（変更する場合のみ）"}
          </label>
          <div className="flex gap-2">
            <input
              id="admin-password"
              type={showPw ? "text" : "password"}
              value={values.password}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
              placeholder={isCreate ? "" : "空欄なら変更しません"}
              className={`${fieldClass} font-mono`}
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} className={miniBtn}>
              {showPw ? "隠す" : "表示"}
            </button>
            <button type="button" onClick={regenerate} className={miniBtn}>
              自動生成
            </button>
            <button
              type="button"
              onClick={copyPassword}
              disabled={!values.password}
              className={`${miniBtn} disabled:opacity-40`}
            >
              {copied ? "コピー済" : "コピー"}
            </button>
          </div>
          {touched && pwError ? (
            <p className="mt-1 font-ja text-[11px] text-ember">{pwError}</p>
          ) : (
            <p className="mt-1 font-ja text-[11px] text-muted">
              発行したパスワードはこの画面でのみ確認できます。本番ではメール通知＋初回ログイン時に変更を促します。
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
