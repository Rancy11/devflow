/* ─── Button ─── */
export function Btn({ variant = "primary", size = "md", children, loading, ...props }) {
  return (
    <button
      className={`df-btn df-btn--${variant} df-btn--${size}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className="df-spinner df-spinner--sm" />}
      {children}
    </button>
  );
}

/* ─── Spinner ─── */
export function Spinner({ size = "md" }) {
  return <span className={`df-spinner df-spinner--${size}`} />;
}

/* ─── Badge: status ─── */
export function StatusBadge({ status }) {
  const map = {
    TODO: { label: "Todo", cls: "todo" },
    IN_PROGRESS: { label: "In Progress", cls: "progress" },
    DONE: { label: "Done", cls: "done" },
  };
  const cfg = map[status] || map.TODO;
  return <span className={`df-badge df-badge--${cfg.cls}`}>{cfg.label}</span>;
}

/* ─── Badge: priority ─── */
export function PriorityDot({ priority = "medium" }) {
  const colors = { low: "var(--emerald)", medium: "var(--amber)", high: "var(--rose)" };
  return (
    <span
      style={{
        display: "inline-block",
        width: 8, height: 8,
        borderRadius: "50%",
        background: colors[priority] || colors.medium,
        flexShrink: 0,
      }}
    />
  );
}

/* ─── Progress Bar ─── */
export function ProgressBar({ value = 0 }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 80 ? "var(--emerald)" : pct >= 40 ? "var(--accent)" : "var(--amber)";
  return (
    <div className="df-progress-track">
      <div className="df-progress-fill" style={{ width: pct + "%", background: color }} />
    </div>
  );
}

/* ─── Modal ─── */
import { useEffect } from "react";
export function Modal({ open, onClose, title, children, maxWidth = 480 }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="df-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="df-modal" style={{ maxWidth }}>
        <div className="df-modal__head">
          <h2 className="df-modal__title">{title}</h2>
          <button className="df-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="df-modal__body">{children}</div>
      </div>
    </div>
  );
}

/* ─── Form helpers ─── */
export function Field({ label, error, children }) {
  return (
    <div className="df-field">
      {label && <label className="df-label">{label}</label>}
      {children}
      {error && <span className="df-field-error">{error}</span>}
    </div>
  );
}
export const Input = (props) => <input className="df-input" {...props} />;
export const Textarea = (props) => <textarea className="df-textarea" {...props} />;
export function Select({ children, ...props }) {
  return <select className="df-select" {...props}>{children}</select>;
}
