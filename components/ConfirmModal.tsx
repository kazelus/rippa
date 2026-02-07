"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = "Potwierdź akcję",
  message,
  confirmLabel = "Potwierdź",
  cancelLabel = "Anuluj",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [open, onCancel]);

  if (!open) return null;

  const variantStyles = {
    danger: {
      icon: "bg-red-500/10",
      iconColor: "text-red-400",
      btn: "bg-red-500 hover:bg-red-600 text-white",
    },
    warning: {
      icon: "bg-amber-500/10",
      iconColor: "text-amber-400",
      btn: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    info: {
      icon: "bg-[#0f9fdf]/10",
      iconColor: "text-[#0f9fdf]",
      btn: "bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white",
    },
  };

  const s = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6b7280] hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-xl ${s.icon} flex items-center justify-center mb-4`}
          >
            <AlertTriangle className={`w-6 h-6 ${s.iconColor}`} />
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-[#8b92a9] leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-white/[5%] border border-white/10 text-[#b0b0b0] hover:text-white hover:bg-white/[8%] font-medium rounded-xl transition-all text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 font-semibold rounded-xl transition-all text-sm ${s.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
