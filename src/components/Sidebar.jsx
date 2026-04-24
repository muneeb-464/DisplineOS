import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Lightbulb,
  Megaphone,
  SlidersHorizontal,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users,           label: "Customers" },
  { icon: DollarSign,      label: "Revenue" },
  { icon: TrendingUp,      label: "Performance" },
  { icon: RefreshCw,       label: "Retention" },
  { icon: Lightbulb,       label: "Insights" },
  { icon: Megaphone,       label: "Marketing" },
];

export const COLLAPSED_W = 64;
export const EXPANDED_W  = 200;

const BG        = "#1a1a1a";
const ACTIVE_BG = "#4a5240";

/**
 * Sidebar — collapsed (64px) by default, expands to 200px on hover.
 *
 * @param {function} onExpandChange  Optional callback fired with true/false when expand state changes.
 */
export default function Sidebar({ onExpandChange } = {}) {
  const [expanded, setExpanded] = useState(false);

  const handleEnter = () => {
    setExpanded(true);
    onExpandChange?.(true);
  };

  const handleLeave = () => {
    setExpanded(false);
    onExpandChange?.(false);
  };

  return (
    <aside
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        width: expanded ? EXPANDED_W : COLLAPSED_W,
        background: BG,
        transition: "width 250ms ease",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Logo dot ── */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            border: "1.5px solid rgba(255,255,255,0.2)",
            flexShrink: 0,
          }}
        />
      </div>

      {/* ── Nav items ── */}
      <nav
        style={{
          flex: 1,
          padding: "4px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <NavItem key={label} icon={Icon} label={label} active={active} expanded={expanded} />
        ))}
      </nav>

      {/* ── Bottom: Settings + User ── */}
      <div
        style={{
          padding: "8px 8px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <NavItem icon={SlidersHorizontal} label="Settings" expanded={expanded} />

        {/* User row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 44,
            padding: "0 12px",
            overflow: "hidden",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6b8f71, #4a5240)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "#fff",
              userSelect: "none",
            }}
          >
            SC
          </div>

          {/* Name — fades in with sidebar */}
          <span
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: "rgba(255,255,255,0.8)",
              opacity: expanded ? 1 : 0,
              transition: "opacity 200ms ease",
              transitionDelay: expanded ? "60ms" : "0ms",
              whiteSpace: "nowrap",
            }}
          >
            Sarah Chen
          </span>
        </div>
      </div>
    </aside>
  );
}

/** Single nav row — icon + optional label */
function NavItem({ icon: Icon, label, active = false, expanded }) {
  const [hovered, setHovered] = useState(false);

  const bg = active
    ? ACTIVE_BG
    : hovered
    ? "rgba(255,255,255,0.07)"
    : "transparent";

  const color = active || hovered ? "#ffffff" : "rgba(255,255,255,0.55)";

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 40,
        width: "100%",
        padding: "0 12px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        background: bg,
        color,
        transition: "background 150ms ease, color 150ms ease",
        textAlign: "left",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      <span
        style={{
          fontSize: 14,
          fontWeight: 400,
          opacity: expanded ? 1 : 0,
          transition: "opacity 200ms ease",
          transitionDelay: expanded ? "60ms" : "0ms",
        }}
      >
        {label}
      </span>
    </button>
  );
}
