"use client";

import { useId, useRef, useState, useTransition } from "react";

type DeleteProductDialogProps = {
  /** Shown in the heading so the user knows exactly what they are deleting. */
  productName: string;
  /** Your bound server action, e.g. deleteProduct.bind(null, product.id). */
  onConfirm: () => Promise<void> | void;
};

export default function DeleteProductDialog({
  productName,
  onConfirm,
}: DeleteProductDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // useId gives unique ids, so two dialogs on one page never clash.
  const titleId = useId();
  const descriptionId = useId();
  const errorId = useId();

  function openDialog() {
    setError(null);
    // A11y: showModal() (not the `open` attribute) is what traps focus inside
    // the dialog, makes the rest of the page inert for screen readers, and
    // lets Escape close it. It also returns focus to the trigger on close.
    dialogRef.current?.showModal();

    // A11y: start focus on the SAFE action. Landing on "Delete" means one
    // accidental Enter press destroys data.
    cancelRef.current?.focus();
  }

  function closeDialog() {
    // Don't let the user dismiss the dialog while the delete is running.
    if (isPending) return;
    dialogRef.current?.close();
  }

  function handleConfirm() {
    setError(null);

    startTransition(async () => {
      try {
        await onConfirm();
        dialogRef.current?.close();
      } catch {
        // Say what happened and what to do next. Don't just fail silently.
        setError("We couldn't delete this product. Check your connection and try again.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        // A11y: announces "has popup dialog" to screen reader users.
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
      >
        <TrashIcon />
        Delete product
      </button>

      <dialog
        ref={dialogRef}
        // A11y: the dialog's accessible name and description come from the
        // visible heading and text. Screen readers read both when it opens.
        aria-labelledby={titleId}
        aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
        aria-busy={isPending}
        // Escape key: block it while deleting, otherwise let the browser close it.
        onCancel={(event) => {
          if (isPending) event.preventDefault();
        }}
        // Click on the backdrop closes the dialog. The dialog itself has no
        // padding, so any click that lands on it directly is outside the panel.
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        // m-auto: Tailwind's reset removes the browser's default centering.
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span
              // Decorative, so it is hidden from assistive tech.
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700"
            >
              <WarningIcon />
            </span>

            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-lg font-bold tracking-tight text-slate-900"
              >
                Delete {productName}?
              </h2>

              <p
                id={descriptionId}
                className="mt-2 text-sm leading-relaxed text-slate-600"
              >
                This permanently removes the product from your store, including
                its listing and stock count. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* A11y: role="alert" is announced immediately when it appears. */}
          {error && (
            <p
              id={errorId}
              role="alert"
              className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
            >
              {error}
            </p>
          )}

          {/* A11y: polite live region so screen reader users hear progress.
              Visually hidden, because the button text already shows it. */}
          <p role="status" className="sr-only">
            {isPending ? `Deleting ${productName}, please wait.` : ""}
          </p>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              ref={cancelRef}
              type="button"
              onClick={closeDialog}
              disabled={isPending}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Deleting…" : "Delete product"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M12 3L2 20h20L12 3z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}