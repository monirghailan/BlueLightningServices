"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { NewTicketForm } from "@/components/portal/NewTicketForm";

interface NewTicketModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (key: string) => void;
}

export function NewTicketModal({ open, onClose, onCreated }: NewTicketModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleCreated(key: string) {
    onCreated(key);
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-lg rounded-2xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/60 open:flex open:flex-col"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">New ticket</h2>
          <p className="mt-1 text-sm text-muted">
            New items land in your backlog list for prioritization.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-6 py-5">
        <NewTicketForm onCreated={handleCreated} onCancel={onClose} />
      </div>
    </dialog>
  );
}
