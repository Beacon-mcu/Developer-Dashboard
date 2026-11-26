import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

// A notice inside a page. One look in every case: it uses the theme's own colors (surface, line, ink),
// so it follows light and dark mode without colors of its own.
//
//   <Alert title="Heads up">Mainnet uses real XLM.</Alert>
//   <Alert icon="mail" action={<Button>Resend</Button>} onClose={() => setOpen(false)}>Check your inbox.</Alert>
//   <Alert urgent>Could not save your changes.</Alert>   // read out at once by screen readers

type Props = {
  title?: ReactNode;
  children?: ReactNode;
  icon?: IconName | null; // null: no icon
  action?: ReactNode; // a button or link shown on the right
  onClose?: () => void; // shows a close button
  urgent?: boolean; // role="alert" instead of role="status"
  className?: string;
};

export function Alert({ title, children, icon = "info", action, onClose, urgent, className = "" }: Props) {
  return (
    <div
      role={urgent ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border border-line bg-subtle px-4 py-3 text-sm text-ink ${className}`}
    >
      {icon && <Icon name={icon} className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ink-soft" />}

      <div className="min-w-0 flex-1">
        {title && <p className="font-medium text-ink">{title}</p>}
        {children && <div className={`text-ink-soft ${title ? "mt-0.5" : ""}`}>{children}</div>}
      </div>

      {action && <div className="shrink-0 self-center">{action}</div>}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="-mr-1 shrink-0 rounded-md p-1 text-muted transition hover:bg-surface hover:text-ink"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
