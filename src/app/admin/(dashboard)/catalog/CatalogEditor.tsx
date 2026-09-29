"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  createBusinessType,
  createSolution,
  deleteBusinessType,
  deleteSolution,
  updateBusinessType,
  updateSolution,
} from "./actions";
import { inputClass, primaryButton } from "../navigation/ui";

type Option = { value: string; label: string };
export type SolutionRow = {
  slug: string;
  key: string;
  name: string;
  machine: string;
  group: string;
  builtIn: boolean;
  published: boolean;
};
export type BusinessTypeRow = { slug: string; name: string; icon: string; builtIn: boolean; published: boolean };

const smallSelect = "rounded-lg border border-border bg-bg px-2 py-1 text-xs";

function Status({ status }: { status: string | null }) {
  if (!status) return null;
  return status === "saved" ? (
    <p className="text-sm text-success">บันทึกแล้ว</p>
  ) : (
    <p className="whitespace-pre-line text-sm text-error">{status}</p>
  );
}

function PublishBadge({ builtIn, published }: { builtIn: boolean; published: boolean }) {
  if (builtIn) return <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-text-2">ในระบบ</span>;
  return published ? (
    <span className="rounded bg-success/15 px-1.5 py-0.5 text-xs font-semibold text-success-strong">เผยแพร่แล้ว</span>
  ) : (
    <span className="rounded bg-primary-50 px-1.5 py-0.5 text-xs font-semibold text-primary-700">ฉบับร่าง</span>
  );
}

/** th/en/zh name inputs. */
function NameInputs({ value, onChange, label }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void; label: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {(["th", "en", "zh"] as const).map((l) => (
        <label key={l} className="block text-xs font-semibold text-text-2">
          {label} ({l}){l === "th" && " *"}
          <input className={inputClass} value={value[l] ?? ""} onChange={(e) => onChange({ ...value, [l]: e.target.value })} />
        </label>
      ))}
    </div>
  );
}

export function SolutionsCatalog({
  rows,
  machines,
  groups,
}: {
  rows: SolutionRow[];
  machines: Option[];
  groups: Option[];
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: "", template: rows[0]?.slug ?? "", machine: "kiosk", group: groups[0]?.value ?? "" });
  const [names, setNames] = useState<Record<string, string>>({});
  const [blurb, setBlurb] = useState<Record<string, string>>({});
  const run = (fn: () => Promise<string>) => startTransition(async () => setStatus(await fn()));
  const machineLabel = new Map(machines.map((m) => [m.value, m.label]));
  const groupLabel = new Map(groups.map((g) => [g.value, g.label]));

  function create() {
    run(async () => {
      const result = await createSolution({ ...form, names, blurb });
      if (result === "saved") {
        setForm({ ...form, slug: "" });
        setNames({});
        setBlurb({});
      }
      return result;
    });
  }

  return (
    <section className="rounded-xl border border-border p-4">
      <h2 className="text-lg font-semibold">สายสินค้า / โซลูชัน</h2>
      <p className="mt-1 text-sm text-text-2">
        แต่ละสายมีหน้าของตัวเองที่ /solutions/&lt;slug&gt; และเป็นหมวดสินค้าให้ติ๊กในหน้า Products
      </p>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-xs text-text-2">
            <tr>
              <th className="px-3 py-2 font-medium">ชื่อ</th>
              <th className="px-3 py-2 font-medium">ภาพเครื่อง</th>
              <th className="px-3 py-2 font-medium">กลุ่มเมนู</th>
              <th className="px-3 py-2 font-medium">สถานะ</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.slug}>
                <td className="px-3 py-2">
                  <p className="font-medium text-text-1">{row.name}</p>
                  <p className="font-mono text-xs text-text-3">/solutions/{row.slug}</p>
                </td>
                <td className="px-3 py-2">
                  {row.builtIn ? (
                    machineLabel.get(row.machine)
                  ) : (
                    <select className={smallSelect} value={row.machine} disabled={isPending} onChange={(e) => run(() => updateSolution(row.slug, { machine: e.target.value }))} aria-label={`ภาพเครื่องของ ${row.name}`}>
                      {machines.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-3 py-2">
                  {row.builtIn ? (
                    groupLabel.get(row.group)
                  ) : (
                    <select className={smallSelect} value={row.group} disabled={isPending} onChange={(e) => run(() => updateSolution(row.slug, { group: e.target.value }))} aria-label={`กลุ่มเมนูของ ${row.name}`}>
                      {groups.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-3 py-2">
                  <PublishBadge builtIn={row.builtIn} published={row.published} />
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-xs">
                  <a href={`/th/solutions/${row.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-700 hover:underline">
                    ดูหน้า ↗
                  </a>
                  {!row.builtIn && (
                    <>
                      <button
                        type="button"
                        className="ml-3 font-semibold text-primary-700 hover:underline disabled:opacity-50"
                        disabled={isPending}
                        onClick={() => run(() => updateSolution(row.slug, { published: !row.published }))}
                      >
                        {row.published ? "ยกเลิกเผยแพร่" : "เผยแพร่"}
                      </button>
                      <button
                        type="button"
                        className="ml-3 text-error hover:underline disabled:opacity-50"
                        disabled={isPending}
                        onClick={() => confirm(`ลบ "${row.name}" และข้อความของหน้านี้? (ย้อนกลับไม่ได้)`) && run(() => deleteSolution(row.slug))}
                      >
                        ลบ
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="mt-4 rounded-lg border border-dashed border-border-strong p-3">
        <summary className="cursor-pointer text-sm font-semibold text-primary-700">+ เพิ่มสายสินค้าใหม่</summary>
        <div className="mt-3 space-y-3">
          <NameInputs value={names} onChange={setNames} label="ชื่อ" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs font-semibold text-text-2">
              Slug (URL) *
              <input className={`${inputClass} font-mono`} placeholder="self-checkout" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </label>
            <label className="block text-xs font-semibold text-text-2">
              คัดลอกข้อความจากหน้า
              <select className={inputClass} value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })}>
                {rows.map((r) => (
                  <option key={r.slug} value={r.slug}>{r.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-text-2">
              ภาพเครื่อง (ก่อนมีรูปจริง)
              <select className={inputClass} value={form.machine} onChange={(e) => setForm({ ...form, machine: e.target.value })}>
                {machines.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-text-2">
              กลุ่มในเมนูโซลูชัน
              <select className={inputClass} value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
                {groups.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </label>
          </div>
          <NameInputs value={blurb} onChange={setBlurb} label="คำอธิบายสั้นบนการ์ด" />
          <button type="button" className={primaryButton} disabled={isPending} onClick={create}>
            {isPending ? "กำลังสร้าง..." : "สร้างเป็นฉบับร่าง"}
          </button>
          <p className="text-xs text-text-3">
            หน้าใหม่จะเป็นฉบับร่าง: เปิดดูได้แต่ Google ไม่เก็บ และยังไม่ขึ้นในเมนู แก้ข้อความที่{" "}
            <Link href="/admin/content/solutions" className="text-primary-700 hover:underline">ข้อความทุกหน้า → solutions</Link>{" "}
            (หัวข้อที่ขึ้นต้นด้วยชื่อสายใหม่) ใส่รูปที่ &quot;รูปภาพและโลโก้&quot; แล้วกด &quot;เผยแพร่&quot;
          </p>
        </div>
      </details>
      <div className="mt-2">
        <Status status={status} />
      </div>
    </section>
  );
}

export function BusinessTypesCatalog({ rows, icons }: { rows: BusinessTypeRow[]; icons: Option[] }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: "", template: rows[0]?.slug ?? "", icon: "generic" });
  const [names, setNames] = useState<Record<string, string>>({});
  const run = (fn: () => Promise<string>) => startTransition(async () => setStatus(await fn()));

  function create() {
    run(async () => {
      const result = await createBusinessType({ ...form, names });
      if (result === "saved") {
        setForm({ ...form, slug: "" });
        setNames({});
      }
      return result;
    });
  }

  return (
    <section className="rounded-xl border border-border p-4">
      <h2 className="text-lg font-semibold">ประเภทธุรกิจ</h2>
      <p className="mt-1 text-sm text-text-2">
        แต่ละประเภทมีหน้า /industries/&lt;slug&gt; ใช้ติ๊กในหน้าสินค้าและผลงานลูกค้า ระบบที่แนะนำตั้งได้ที่ &quot;เมนูและลิงก์&quot;
      </p>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-xs text-text-2">
            <tr>
              <th className="px-3 py-2 font-medium">ชื่อ</th>
              <th className="px-3 py-2 font-medium">ไอคอน</th>
              <th className="px-3 py-2 font-medium">สถานะ</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.slug}>
                <td className="px-3 py-2">
                  <p className="font-medium text-text-1">{row.name}</p>
                  <p className="font-mono text-xs text-text-3">/industries/{row.slug}</p>
                </td>
                <td className="px-3 py-2">
                  {row.builtIn ? (
                    <span className="text-text-3">—</span>
                  ) : (
                    <select className={smallSelect} value={row.icon} disabled={isPending} onChange={(e) => run(() => updateBusinessType(row.slug, { icon: e.target.value }))} aria-label={`ไอคอนของ ${row.name}`}>
                      {icons.map((i) => (
                        <option key={i.value} value={i.value}>{i.label}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-3 py-2">
                  <PublishBadge builtIn={row.builtIn} published={row.published} />
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-xs">
                  <a href={`/th/industries/${row.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-700 hover:underline">
                    ดูหน้า ↗
                  </a>
                  {!row.builtIn && (
                    <>
                      <button
                        type="button"
                        className="ml-3 font-semibold text-primary-700 hover:underline disabled:opacity-50"
                        disabled={isPending}
                        onClick={() => run(() => updateBusinessType(row.slug, { published: !row.published }))}
                      >
                        {row.published ? "ยกเลิกเผยแพร่" : "เผยแพร่"}
                      </button>
                      <button
                        type="button"
                        className="ml-3 text-error hover:underline disabled:opacity-50"
                        disabled={isPending}
                        onClick={() => confirm(`ลบ "${row.name}" และข้อความของหน้านี้? (ย้อนกลับไม่ได้)`) && run(() => deleteBusinessType(row.slug))}
                      >
                        ลบ
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="mt-4 rounded-lg border border-dashed border-border-strong p-3">
        <summary className="cursor-pointer text-sm font-semibold text-primary-700">+ เพิ่มประเภทธุรกิจใหม่</summary>
        <div className="mt-3 space-y-3">
          <NameInputs value={names} onChange={setNames} label="ชื่อ" />
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="block text-xs font-semibold text-text-2">
              Slug (URL) *
              <input className={`${inputClass} font-mono`} placeholder="hospital" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </label>
            <label className="block text-xs font-semibold text-text-2">
              คัดลอกข้อความจากหน้า
              <select className={inputClass} value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })}>
                {rows.map((r) => (
                  <option key={r.slug} value={r.slug}>{r.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-text-2">
              ไอคอน
              <select className={inputClass} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                {icons.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </label>
          </div>
          <button type="button" className={primaryButton} disabled={isPending} onClick={create}>
            {isPending ? "กำลังสร้าง..." : "สร้างเป็นฉบับร่าง"}
          </button>
          <p className="text-xs text-text-3">
            แก้ข้อความที่{" "}
            <Link href="/admin/content/industries" className="text-primary-700 hover:underline">ข้อความทุกหน้า → industries</Link>{" "}
            ตั้งระบบที่แนะนำที่ &quot;เมนูและลิงก์&quot; ใส่รูปที่ &quot;รูปภาพและโลโก้&quot; แล้วกด &quot;เผยแพร่&quot;
          </p>
        </div>
      </details>
      <div className="mt-2">
        <Status status={status} />
      </div>
    </section>
  );
}
