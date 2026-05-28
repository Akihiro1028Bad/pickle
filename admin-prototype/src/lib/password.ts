/** パスワードポリシー（プロトタイプ） */
export const PASSWORD_MIN_LENGTH = 8;

// 紛らわしい文字 (O/0, l/1/I など) を除外
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%&*?";
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

function randomInt(maxExclusive: number): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

function pick(chars: string): string {
  return chars[randomInt(chars.length)];
}

/** 各種別を最低1文字含む強パスワードを生成して返す */
export function generatePassword(length = 14): string {
  const required = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)];
  const rest = Array.from({ length: Math.max(length, PASSWORD_MIN_LENGTH) - required.length }, () =>
    pick(ALL),
  );
  const chars = [...required, ...rest];
  // Fisher-Yates シャッフル
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
