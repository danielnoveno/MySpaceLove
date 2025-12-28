import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { GripVertical, Loader2 } from "lucide-react";
import Modal from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary" | "neutral";
  icon?: ReactNode;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const toneClasses: Record<
  NonNullable<ConfirmDialogProps["tone"]>,
  {
    badge: string;
    confirm: string;
    confirmRing: string;
    iconWrap: string;
  }
> = {
  danger: {
    badge: "bg-rose-100 text-rose-600",
    confirm:
      "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 focus-visible:ring-rose-400",
    confirmRing: "ring-rose-200",
    iconWrap: "bg-rose-50 text-rose-500",
  },
  primary: {
    badge: "bg-indigo-100 text-indigo-600",
    confirm:
      "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus-visible:ring-indigo-400",
    confirmRing: "ring-indigo-200",
    iconWrap: "bg-indigo-50 text-indigo-500",
  },
  neutral: {
    badge: "bg-slate-100 text-slate-600",
    confirm: "bg-slate-800 hover:bg-slate-900 focus-visible:ring-slate-400",
    confirmRing: "ring-slate-200",
    iconWrap: "bg-slate-50 text-slate-500",
  },
};

type DragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
};

function isInteractiveTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;

  // Abaikan drag kalau user klik elemen interaktif
  return Boolean(
    el.closest(
      [
        "button",
        "a",
        "input",
        "textarea",
        "select",
        "option",
        "[role='button']",
        "[contenteditable='true']",
        "[data-no-drag]",
      ].join(",")
    )
  );
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  tone = "danger",
  icon,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const colors = toneClasses[tone];

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<DragState | null>(null);

  // reset posisi setiap modal dibuka
  useEffect(() => {
    if (open) {
      setPos({ x: 0, y: 0 });
      setIsDragging(false);
      dragRef.current = null;
    }
  }, [open]);

  // panelStyle dikirim ke Modal (yang menggeser panel/modal-nya)
  const panelStyle = useMemo(
    () =>
      ({
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        willChange: "transform",
        cursor: isDragging ? "grabbing" : "grab", // <— Opsi B: cursor untuk seluruh modal
      } as CSSProperties),
    [pos.x, pos.y, isDragging]
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    // Kalau klik tombol/input/link, jangan mulai drag
    if (isInteractiveTarget(e.target)) return;

    e.preventDefault();

    // Pointer capture: drag tetap jalan meski pointer keluar area modal
    e.currentTarget.setPointerCapture(e.pointerId);

    dragRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: pos.x,
      startY: pos.y,
    };

    setIsDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = dragRef.current;
    if (!st || st.pointerId !== e.pointerId) return;

    e.preventDefault();

    const dx = e.clientX - st.startClientX;
    const dy = e.clientY - st.startClientY;

    setPos({ x: st.startX + dx, y: st.startY + dy });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = dragRef.current;
    if (!st || st.pointerId !== e.pointerId) return;

    dragRef.current = null;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // no-op
    }
  };

  if (!open) return null;

  return (
    <Modal show={open} maxWidth="sm" onClose={onCancel} panelStyle={panelStyle}>
      <div
        className="relative overflow-hidden bg-white"
        style={{
          // penting untuk touch drag biar tidak dianggap scroll
          touchAction: "none",
          // opsional: cegah seleksi teks saat drag
          userSelect: isDragging ? "none" : "auto",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={() => {
          dragRef.current = null;
          setIsDragging(false);
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-br from-white via-transparent to-transparent opacity-90" />

        <div className="space-y-6 p-6">
          <div className="flex w-full justify-center">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 select-none shadow-sm">
              <GripVertical className="h-4 w-4" />
              Klik & seret (di mana saja)
            </div>
          </div>

          <div className="flex items-start gap-4 select-none">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-inner ${colors.iconWrap}`}
            >
              {icon ?? <span className="text-lg font-semibold">!</span>}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}
                >
                  Konfirmasi tindakan
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                  <GripVertical className="h-3.5 w-3.5" />
                  Drag
                </span>
              </div>

              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {title}
              </h3>

              {description && (
                <p className="mt-2 text-sm text-slate-600">{description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              data-no-drag
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              data-no-drag
              className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md transition focus-visible:outline-none focus-visible:ring-2 ${colors.confirm} ${colors.confirmRing} disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer`}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
