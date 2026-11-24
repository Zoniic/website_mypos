"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CircleAlert } from "lucide-react";
import { CodeInput } from "../../CodeInput";
import { verifyTwoFactorLogin } from "./actions";

const inputClass =
  "w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2.5 text-center text-base tracking-widest text-text-1 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40";

export function TwoFactorForm({ email }: { email: string }) {
  const [error, formAction, isPending] = useActionState(verifyTwoFactorLogin, null);
  const [backup, setBackup] = useState(false);
  const [code, setCode] = useState("");
  const ready = backup ? code.replace(/[\s-]/g, "").length >= 10 : code.length === 6;
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <form action={formAction} className="flex w-full max-w-sm flex-col gap-3.5 rounded-2xl border border-border bg-surface-1 p-8">
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo */}
        <img src="/images/brand/logo.png" alt="MYPOS" className="h-5 w-auto self-start" />
        <h1 className="text-xl font-bold">{backup ? "ใส่รหัสสำรอง" : "ใส่รหัสจากแอปบนมือถือ"}</h1>
        <p className="text-sm text-text-2">
          {backup ? "ใส่รหัสสำรอง 1 ชุดที่บันทึกไว้ ใช้ได้ครั้งเดียว" : <>เปิดแอปรหัสที่ผูกไว้กับ <span className="break-all font-medium text-text-1">{email}</span></>}
        </p>
        {backup ? (
          <input
            name="code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase().slice(0, 16))}
            aria-label="รหัสสำรอง"
            placeholder="XXXXX-XXXXX"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            autoFocus
            className={inputClass}
          />
        ) : (
          <CodeInput id="code" label="รหัส 6 หลักจากแอป" value={code} onChange={setCode} autoFocus />
        )}
        <button
          type="submit"
          disabled={isPending || !ready}
          className="w-full rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
        >
          {isPending ? "กำลังตรวจรหัส..." : "ยืนยัน"}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-[13px] text-text-2">
          {backup ? "มีมือถือแล้ว?" : "ไม่มีมือถือ?"}
          <button
            type="button"
            onClick={() => {
              setBackup(!backup);
              setCode("");
            }}
            className="font-semibold text-primary-700 underline-offset-2 hover:underline"
          >
            {backup ? "ใช้รหัสจากแอป" : "ใช้รหัสสำรอง"}
          </button>
        </p>
        {error && (
          <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2.5 text-[13px] text-error">
            <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
            {error}
          </p>
        )}
        <Link href="/admin/login" className="flex items-center gap-1 text-[13px] text-text-2 hover:text-text-1">
          <ChevronLeft size={14} strokeWidth={1.75} aria-hidden="true" />
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </form>
    </div>
  );
}
