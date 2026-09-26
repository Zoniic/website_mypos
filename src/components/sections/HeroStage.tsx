"use client";

import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { MachineArt, type MachineKind } from "@/components/ui/MachineArt";

export type HeroCallout = { href: string; label: string; left: string; top: string };

// Positions as % of a 640×360 floor plan, machines in their real relative
// sizes, laid out as the path an order takes: self-order kiosk, a counter
// with the POS and the kitchen screen (KDS), the queue display on the wall
// above it, and a vending machine selling round the clock.
const machines: { kind: MachineKind; left: string; top: string; width: string; height: string }[] = [
  { kind: "kiosk", left: "3.75%", top: "11.11%", width: "18.75%", height: "83.33%" },
  { kind: "queue", left: "36.72%", top: "2.22%", width: "25.23%", height: "29.03%" },
  { kind: "pos", left: "30.63%", top: "35%", width: "21.88%", height: "30.56%" },
  { kind: "kds", left: "53.13%", top: "40.56%", width: "16.88%", height: "25%" },
  { kind: "vending", left: "74.69%", top: "11.11%", width: "24.22%", height: "83.33%" },
];

const ease = [0.25, 1, 0.5, 1] as const;

/**
 * The hero's machine lineup: each machine rises onto the floor in turn on
 * load, then the whole stage leans slightly with the pointer — machines and
 * labels at different depths. Motion is transform-only, so the drawing is
 * fully visible even before JavaScript runs.
 */
export function HeroStage({ callouts }: { callouts: HeroCallout[] }) {
  const reduceMotion = useReducedMotion();
  const px = useSpring(0, { stiffness: 80, damping: 20 });
  const py = useSpring(0, { stiffness: 80, damping: 20 });
  const machinesX = useTransform(px, (v) => v * -8);
  const machinesY = useTransform(py, (v) => v * -4);
  const labelsX = useTransform(px, (v) => v * 14);
  const labelsY = useTransform(py, (v) => v * 8);

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    py.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function reset() {
    px.set(0);
    py.set(0);
  }

  return (
    <div className="absolute inset-0" onPointerMove={handleMove} onPointerLeave={reset}>
      <motion.div
        className="absolute inset-x-[4%] bottom-[6%] aspect-[16/9]"
        style={{ x: machinesX, y: machinesY }}
      >
        <span aria-hidden className="absolute inset-x-0 top-[94.58%] h-px bg-text-1/20" />
        {/* Counter carrying the POS and the kitchen screen. */}
        <motion.div
          aria-hidden
          className="absolute"
          style={{ left: "27.5%", top: "65.56%", width: "43.75%", height: "34.44%" }}
          initial={{ y: 30 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
        >
          <span className="absolute inset-x-0 top-0 h-[8%] rounded-[2px] bg-[#16181d]" />
          <span className="absolute inset-x-[3.8%] bottom-0 top-[8%] bg-[#16181d]/15" />
        </motion.div>
        {machines.map((machine, index) => (
          <motion.div
            key={machine.kind}
            aria-hidden
            className="absolute flex items-end justify-center"
            style={{ left: machine.left, top: machine.top, width: machine.width, height: machine.height }}
            initial={{ y: 36 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 + index * 0.09, ease }}
          >
            <MachineArt kind={machine.kind} className="h-full" />
          </motion.div>
        ))}
      </motion.div>

      <motion.ul className="absolute inset-0 hidden sm:block" style={{ x: labelsX, y: labelsY }}>
        {callouts.map((item, index) => (
          <motion.li
            key={item.href}
            className="absolute -translate-x-1/2"
            style={{ left: item.left, top: item.top }}
            initial={{ y: 10, scale: 0.92 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.08, ease }}
          >
            <Link
              href={item.href}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-text-1 shadow-[0_2px_8px_rgba(17,19,24,0.18)] outline-offset-2 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary-600" />
              {item.label}
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
