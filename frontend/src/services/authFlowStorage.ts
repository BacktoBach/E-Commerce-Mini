export type EmailOtpFlow = "signup" | "recovery";

interface PendingOtpFlow {
  email: string;
  sentAt: number;
}

const FLOW_KEY_PREFIX = "nightfood.auth.otp";
const RECOVERY_VERIFIED_KEY = "nightfood.auth.recovery-verified-at";
const RECOVERY_WINDOW_MS = 15 * 60 * 1000;

function sessionStorageOrNull(): Storage | null {
  try {
    return globalThis.sessionStorage;
  } catch {
    return null;
  }
}

function flowKey(flow: EmailOtpFlow): string {
  return `${FLOW_KEY_PREFIX}.${flow}`;
}

function readFlow(flow: EmailOtpFlow): PendingOtpFlow | null {
  const raw = sessionStorageOrNull()?.getItem(flowKey(flow));
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "email" in parsed &&
      "sentAt" in parsed &&
      typeof parsed.email === "string" &&
      typeof parsed.sentAt === "number"
    ) {
      return { email: parsed.email, sentAt: parsed.sentAt };
    }
  } catch {
    sessionStorageOrNull()?.removeItem(flowKey(flow));
  }

  return null;
}

export const authFlowStorage = {
  start(flow: EmailOtpFlow, email: string, sentAt = Date.now()): void {
    const pending: PendingOtpFlow = { email: email.trim().toLowerCase(), sentAt };
    sessionStorageOrNull()?.setItem(flowKey(flow), JSON.stringify(pending));
  },

  get(flow: EmailOtpFlow): PendingOtpFlow | null {
    return readFlow(flow);
  },

  clear(flow: EmailOtpFlow): void {
    sessionStorageOrNull()?.removeItem(flowKey(flow));
  },

  markRecoveryVerified(verifiedAt = Date.now()): void {
    sessionStorageOrNull()?.setItem(RECOVERY_VERIFIED_KEY, String(verifiedAt));
  },

  hasValidRecovery(checkedAt = Date.now()): boolean {
    const raw = sessionStorageOrNull()?.getItem(RECOVERY_VERIFIED_KEY);
    if (!raw) return false;

    const verifiedAt = Number(raw);
    const isValid = Number.isFinite(verifiedAt) && checkedAt - verifiedAt <= RECOVERY_WINDOW_MS;
    if (!isValid) sessionStorageOrNull()?.removeItem(RECOVERY_VERIFIED_KEY);
    return isValid;
  },

  clearRecovery(): void {
    sessionStorageOrNull()?.removeItem(RECOVERY_VERIFIED_KEY);
    sessionStorageOrNull()?.removeItem(flowKey("recovery"));
  }
};
