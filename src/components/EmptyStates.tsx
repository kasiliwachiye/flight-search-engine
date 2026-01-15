import clsx from "clsx";

type EmptyStateProps = {
  title: string;
  description: string;
  variant?: "neutral" | "error";
};

export function EmptyState({
  title,
  description,
  variant = "neutral",
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "rounded-3xl border px-6 py-8 text-sm",
        variant === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-border bg-white/70 text-muted"
      )}
    >
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}

