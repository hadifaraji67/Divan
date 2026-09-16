const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 16;
const GROUP_SIZE = 4;

export function generateRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  let code = '';

  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARSET[bytes[i] % CHARSET.length];
    if ((i + 1) % GROUP_SIZE === 0 && i < CODE_LENGTH - 1) {
      code += '-';
    }
  }

  return code;
}

export function normalizeRecoveryCode(code: string): string {
  return code
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CODE_LENGTH);
}

export function formatRecoveryCode(code: string): string {
  const normalized = normalizeRecoveryCode(code);
  const groups: string[] = [];
  for (let i = 0; i < normalized.length; i += GROUP_SIZE) {
    groups.push(normalized.slice(i, i + GROUP_SIZE));
  }
  return groups.join('-');
}

export function isValidRecoveryCodeFormat(code: string): boolean {
  const normalized = normalizeRecoveryCode(code);
  if (normalized.length !== CODE_LENGTH) return false;
  return [...normalized].every(c => CHARSET.includes(c));
}

export function buildRecoveryQRText(code: string, username?: string): string {
  const payload = {
    v: 1,
    app: 'divan',
    type: 'recovery',
    code: normalizeRecoveryCode(code),
    user: username || '',
    createdAt: new Date().toISOString(),
  };
  return JSON.stringify(payload);
}

export function parseRecoveryQRText(text: string): { code: string; username?: string } | null {
  try {
    const data = JSON.parse(text);
    if (data.app !== 'divan' || data.type !== 'recovery' || !data.code) return null;
    return { code: data.code, username: data.user };
  } catch {
    return null;
  }
}
