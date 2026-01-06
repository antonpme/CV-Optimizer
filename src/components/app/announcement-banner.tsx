import type { FC } from 'react';

export type AnnouncementSeverity = 'info' | 'warning' | 'success';

type Props = {
  message: string;
  severity: AnnouncementSeverity;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  formAction?: () => Promise<void>;
  dismissLabel?: string;
};

const severityStyles: Record<AnnouncementSeverity, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
};

export const AnnouncementBanner: FC<Props> = ({
  message,
  severity,
  ctaLabel,
  ctaUrl,
  formAction,
  dismissLabel = 'Dismiss',
}) => {
  const style = severityStyles[severity] ?? severityStyles.info;

  return (
    <div className={`flex flex-col gap-3 rounded-md border px-4 py-3 text-sm ${style}`} role="status">
      <p>{message}</p>
      <div className="flex flex-wrap items-center gap-3">
        {ctaLabel && ctaUrl ? (
          <a
            href={ctaUrl}
            className="inline-flex items-center rounded-md border border-current px-3 py-1 text-xs font-semibold hover:bg-white/30"
          >
            {ctaLabel}
          </a>
        ) : null}
        {formAction ? (
          <form action={formAction} className="inline">
            <button
              type="submit"
              className="text-xs font-medium underline underline-offset-2"
            >
              {dismissLabel}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
};
