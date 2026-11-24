"use client";
import { useActionState, useState } from "react";
import { Check, CircleAlert, Copy, Download, KeyRound, ShieldCheck, ShieldOff } from "lucide-react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";
import { CodeInput } from "../../CodeInput";
import {
  changeOwnPassword,
  confirmTwoFactorSetup,
  disableTwoFactorAction,
  startTwoFactorSetup,
  type FormState,
  type SetupState,
} from "./actions";

type Pending = { qrDataUrl: string; manualKey: string };

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";
const primaryButton =
  "inline-flex items-center justify-center gap-1.5 rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50";
const secondaryButton =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-strong px-3 py-1.5 text-sm text-text-2 outline-offset-2 hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 disabled:opacity-50";
const cardClass = "rounded-xl border border-border bg-bg p-5";

function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-[13px] text-error">
      <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
      {message}
    </p>
  );
}

function CopyButton({ text, label = "คัดลอก" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={secondaryButton}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check size={16} strokeWidth={1.75} aria-hidden="true" /> : <Copy size={16} strokeWidth={1.75} aria-hidden="true" />}
      {copied ? "คัดลอกแล้ว" : label}
    </button>
  );
}

function BackupCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const download = () => {
    const body = ["รหัสสำรองสำหรับเข้าสู่ระบบหลังบ้าน MYPOS", "ใช้ได้ชุดละ 1 ครั้ง เก็บไว้ในที่ปลอดภัย", "", ...codes, ""].join("\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "mypos-backup-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className={`${cardClass} border-primary-400/50`} aria-labelledby="backup-title">
      <h2 id="backup-title" className="text-base font-semibold">
        เก็บรหัสสำรองไว้ในที่ปลอดภัย
      </h2>
      <p className="mt-1 text-sm text-text-2">ใช้แทนรหัสจากแอปได้ชุดละ 1 ครั้ง หน้านี้จะแสดงแค่ครั้งเดียว</p>
      <ul data-testid="backup-codes" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {codes.map((code) => (
          <li key={code} className="rounded-lg border border-border-strong bg-surface-0 px-2 py-2 text-center font-mono text-sm font-semibold tracking-wider">
            {code}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={secondaryButton} onClick={download}>
          <Download size={16} strokeWidth={1.75} aria-hidden="true" />
          ดาวน์โหลดเป็นไฟล์
        </button>
        <CopyButton text={codes.join("\n")} />
        <span className="flex-1" />
        <button type="button" className={primaryButton} onClick={onDone}>
          เก็บแล้ว
        </button>
      </div>
    </section>
  );
}

function StartCard({ available }: { available: boolean }) {
  return (
    <section className={cardClass} aria-labelledby="sec-title">
      <h2 id="sec-title" className="text-base font-semibold">ความปลอดภัยของบัญชี</h2>
      <p className="mt-3 flex items-center gap-2 text-sm font-medium text-text-2" data-testid="2fa-status">
        <ShieldOff size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-text-3" />
        รหัส 2 ขั้นตอนยังไม่เปิด
      </p>
      <p className="mt-1 text-sm text-text-2">ถ้ามีคนรู้รหัสผ่าน ก็ยังเข้าไม่ได้ถ้าไม่มีมือถือของคุณ ไม่บังคับ เปิดเฉพาะบัญชีของคุณเมื่อพร้อม</p>
      {available ? (
        <form action={startTwoFactorSetup} className="mt-4">
          <button type="submit" className={primaryButton}>
            <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
            เริ่มตั้งค่ารหัส 2 ขั้นตอน
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-text-2">ยังเปิดไม่ได้ เพราะเซิร์ฟเวอร์ยังไม่ได้ตั้งค่ากุญแจเข้ารหัส ติดต่อเจ้าของเว็บไซต์</p>
      )}
    </section>
  );
}

function SetupCard({ pending, setup, formAction, isPending }: { pending: Pending; setup: SetupState; formAction: (formData: FormData) => void; isPending: boolean }) {
  const [code, setCode] = useState("");
  return (
    <section className={cardClass} aria-labelledby="setup-title">
      <h2 id="setup-title" className="text-base font-semibold">ความปลอดภัยของบัญชี</h2>
      <p className="mt-3 flex items-center gap-2 text-sm font-medium text-text-2" data-testid="2fa-status">
        <ShieldOff size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-text-3" />
        รหัส 2 ขั้นตอนยังไม่เปิด
      </p>
      <p className="mt-1 text-sm text-text-2">ถ้ามีคนรู้รหัสผ่าน ก็ยังเข้าไม่ได้ถ้าไม่มีมือถือของคุณ</p>

      <div className="mt-5 flex gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">1</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">สแกนคิวอาร์ด้วยแอปรหัสบนมือถือ</p>
          <div className="mt-3 flex flex-wrap items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL, not a static asset */}
            <img src={pending.qrDataUrl} alt="คิวอาร์สำหรับแอปรหัส" width={176} height={176} className="rounded-lg border border-border bg-white" />
            <div className="min-w-0 flex-1 text-sm text-text-2">
              <p>เปิดแอป แตะ เพิ่มบัญชี แล้วสแกนคิวอาร์นี้</p>
              <p className="mt-3">สแกนไม่ได้ ใส่รหัสนี้ในแอปแทน</p>
              <p data-testid="manual-key" className="mt-1 break-all font-mono text-base font-semibold tracking-wider text-text-1">{pending.manualKey}</p>
              <div className="mt-2">
                <CopyButton text={pending.manualKey.replace(/\s/g, "")} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={submitWithoutReset(formAction)} className="mt-6 flex gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">2</span>
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm font-semibold">ใส่รหัส 6 หลักที่แอปแสดง</p>
          <div className="max-w-xs">
            <CodeInput id="setup-code" label="รหัส 6 หลักจากแอป" value={code} onChange={setCode} />
          </div>
          <p className="text-xs text-text-3">รหัสเปลี่ยนทุก 30 วินาที</p>
          <ErrorLine message={setup.error} />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={isPending || code.length !== 6} className={primaryButton}>
              <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
              {isPending ? "กำลังตรวจรหัส..." : "เปิดใช้รหัส 2 ขั้นตอน"}
            </button>
            {code.length !== 6 && <span className="text-xs text-text-3">ใส่ให้ครบ 6 หลักก่อน</span>}
          </div>
        </div>
      </form>
    </section>
  );
}

function EnabledCard({ remaining }: { remaining: number }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(disableTwoFactorAction, { error: null, done: false });
  const [open, setOpen] = useState(false);
  return (
    <section className={cardClass} aria-labelledby="on-title">
      <h2 id="on-title" className="text-base font-semibold">ความปลอดภัยของบัญชี</h2>
      <p className="mt-3 flex items-center gap-2 text-sm font-medium text-success" data-testid="2fa-status">
        <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
        เปิดรหัส 2 ขั้นตอนแล้ว ครั้งต่อไปตอนเข้าสู่ระบบจะถามรหัสจากแอป
      </p>
      <p className="mt-1 text-sm text-text-2">รหัสสำรองที่ยังไม่ได้ใช้: {remaining} ชุด</p>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">ปิดรหัส 2 ขั้นตอน</p>
            <p className="text-sm text-text-2">ต้องใส่รหัสผ่านและรหัสจากแอปก่อน</p>
          </div>
          {!open && (
            <button type="button" className={secondaryButton} onClick={() => setOpen(true)}>
              ปิด
            </button>
          )}
        </div>
        {open && (
          <form onSubmit={submitWithoutReset(formAction)} className="mt-4 max-w-md space-y-3">
            <label className="block">
              <span className={labelClass}>รหัสผ่านปัจจุบัน</span>
              <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>รหัสจากแอป (หรือรหัสสำรอง 1 ชุด)</span>
              <input name="code" type="text" inputMode="text" autoComplete="one-time-code" autoCapitalize="characters" spellCheck={false} required className={inputClass} />
            </label>
            <ErrorLine message={state.error} />
            <div className="flex gap-2">
              <button type="submit" disabled={isPending} className={primaryButton}>
                {isPending ? "กำลังปิด..." : "ปิดรหัส 2 ขั้นตอน"}
              </button>
              <button type="button" className={secondaryButton} onClick={() => setOpen(false)}>
                ยกเลิก
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function PasswordCard() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(changeOwnPassword, { error: null, done: false });
  const [open, setOpen] = useState(false);
  const showForm = open && !state.done;
  return (
    <section className={cardClass} aria-labelledby="pw-title">
      <div className="flex items-center gap-3">
        <KeyRound size={20} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-text-3" />
        <div className="min-w-0 flex-1">
          <h2 id="pw-title" className="text-base font-semibold">รหัสผ่าน</h2>
          <p className="text-sm text-text-2">เปลี่ยนแล้ว เครื่องอื่นจะออกจากระบบทันที</p>
        </div>
        {!showForm && (
          <button type="button" className={secondaryButton} onClick={() => setOpen(true)}>
            เปลี่ยนรหัสผ่าน
          </button>
        )}
      </div>
      {state.done && (
        <p role="status" className="mt-3 flex items-center gap-2 text-sm text-success">
          <Check size={16} strokeWidth={1.75} aria-hidden="true" />
          เปลี่ยนรหัสผ่านแล้ว
        </p>
      )}
      {showForm && (
        <form onSubmit={submitWithoutReset(formAction)} className="mt-4 max-w-md space-y-3">
          <label className="block">
            <span className={labelClass}>รหัสผ่านปัจจุบัน</span>
            <input name="currentPassword" type="password" autoComplete="current-password" required className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)</span>
            <input name="newPassword" type="password" autoComplete="new-password" required className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>ใส่รหัสผ่านใหม่อีกครั้ง</span>
            <input name="confirmPassword" type="password" autoComplete="new-password" required className={inputClass} />
          </label>
          <ErrorLine message={state.error} />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className={primaryButton}>
              {isPending ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
            </button>
            <button type="button" className={secondaryButton} onClick={() => setOpen(false)}>
              ยกเลิก
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export function AccountSecurity({
  enabled,
  pending,
  available,
  backupRemaining,
}: {
  enabled: boolean;
  pending: Pending | null;
  available: boolean;
  backupRemaining: number;
}) {
  // The backup codes live only in this component's state, so a reload never shows them again.
  const [setup, formAction, isPending] = useActionState<SetupState, FormData>(confirmTwoFactorSetup, { error: null, codes: null });
  const [dismissed, setDismissed] = useState<string[] | null>(null);
  const showCodes = enabled && setup.codes !== null && dismissed !== setup.codes;
  return (
    <div className="mt-6 max-w-2xl space-y-5">
      {showCodes && setup.codes && <BackupCodes codes={setup.codes} onDone={() => setDismissed(setup.codes)} />}
      {enabled ? (
        <EnabledCard remaining={backupRemaining} />
      ) : pending ? (
        <SetupCard pending={pending} setup={setup} formAction={formAction} isPending={isPending} />
      ) : (
        <StartCard available={available} />
      )}
      <PasswordCard />
    </div>
  );
}
