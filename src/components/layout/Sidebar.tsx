import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar, ClipboardList, LayoutDashboard, BarChart3,
  NotebookPen, Settings as Cog, LogIn, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const navItems = [
  { to: "/", icon: Calendar, label: "Plan" },
  { to: "/log", icon: ClipboardList, label: "Log" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/reflect", icon: NotebookPen, label: "Reflect" },
  { to: "/settings", icon: Cog, label: "Settings" },
];

function isActive(to: string, pathname: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, isLoggedIn, signInWithGoogle, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate("/login", { replace: true });
  };

  const labelCls = cn(
    "text-sm whitespace-nowrap transition-opacity duration-150 delay-75",
    isHovered ? "opacity-100" : "opacity-0"
  );

  return (
    <>
      {/* ── Desktop sidebar (md+) ── */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "peer fixed z-50 overflow-hidden",
          "hidden md:flex md:flex-col",
          "md:left-4 md:top-4 md:bottom-4 md:h-auto",
          "md:rounded-2xl",
          "md:bg-[#0f0f0f] md:border md:border-white/[0.07]",
          "md:shadow-2xl md:shadow-black/60",
          isHovered ? "md:w-[220px]" : "md:w-[64px]",
          "transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-[18px] py-5 shrink-0">
          <div className="shrink-0 h-7 w-7 rounded-lg bg-[#c8d5b9]/10 border border-[#c8d5b9]/20 grid place-items-center">
            <div className="h-2.5 w-2.5 rounded-sm bg-[#c8d5b9]/80" />
          </div>
          <span className={cn(labelCls, "text-[13px] font-semibold tracking-wide text-white/80")}>
            DisciplineOS
          </span>
        </div>

        <div className="mx-3 mb-2 border-t border-white/[0.05]" />

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-2">
          {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => {
            const active = isActive(to, pathname);
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "relative flex items-center gap-3 px-[13px] h-10 rounded-xl transition-colors duration-150",
                  active
                    ? "bg-[#2d3728]/80 text-[#c8d5b9]"
                    : "text-white/35 hover:bg-white/[0.06] hover:text-white/80"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#c8d5b9]/70" />
                )}
                <Icon className="shrink-0 h-[18px] w-[18px]" />
                <span className={labelCls}>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto px-2 pb-4 flex flex-col gap-1">
          <div className="mx-1 mb-2 border-t border-white/[0.05]" />

          <NavLink
            to="/settings"
            className={({ isActive: a }) => cn(
              "flex items-center gap-3 px-[13px] h-10 rounded-xl transition-colors duration-150",
              a
                ? "bg-[#2d3728]/80 text-[#c8d5b9]"
                : "text-white/35 hover:bg-white/[0.06] hover:text-white/80"
            )}
          >
            <Cog className="shrink-0 h-[18px] w-[18px]" />
            <span className={labelCls}>Settings</span>
          </NavLink>

          {isLoggedIn && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-3 px-[13px] h-10 w-full rounded-xl transition-colors duration-150 text-white/50 hover:bg-white/[0.06] hover:text-white/80"
              >
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="shrink-0 h-6 w-6 rounded-full object-cover ring-1 ring-white/10"
                />
                <span className={cn(labelCls, "truncate")}>{user.name}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute z-50 w-56 rounded-xl p-2 bg-[#1a1a1a] border border-white/[0.08] shadow-2xl shadow-black/60 md:left-[calc(100%+10px)] md:bottom-0">
                  <div className="px-2 py-1.5 border-b border-white/[0.06] mb-1">
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="mt-1 flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-3 px-[13px] h-10 rounded-xl transition-colors duration-150 text-white/35 hover:bg-white/[0.06] hover:text-white/80"
            >
              <LogIn className="shrink-0 h-[18px] w-[18px]" />
              <span className={labelCls}>Sign in</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile bottom nav (< md): 5 main items + account ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f] border-t border-white/[0.07] flex items-center h-16">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => {
          const active = isActive(to, pathname);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "relative flex flex-col items-center justify-center gap-[3px] flex-1 h-full py-2 transition-colors duration-150",
                active ? "text-[#c8d5b9]" : "text-white/35"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-b-full bg-[#c8d5b9]/70" />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="text-[9px] font-medium leading-none">{label}</span>
            </NavLink>
          );
        })}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex flex-col items-center justify-center gap-[3px] flex-1 h-full py-2 transition-colors duration-150 text-white/35 hover:text-white/80"
        >
          {isDark ? <Sun className="h-[18px] w-[18px] shrink-0" /> : <Moon className="h-[18px] w-[18px] shrink-0" />}
          <span className="text-[9px] font-medium leading-none">Theme</span>
        </button>

        {/* Account / sign-in as 7th slot */}
        {isLoggedIn && user ? (
          <NavLink
            to="/settings"
            className={cn(
              "flex flex-col items-center justify-center gap-[3px] flex-1 h-full py-2 transition-colors duration-150",
              pathname === "/settings" ? "text-[#c8d5b9]" : "text-white/35"
            )}
          >
            <img
              src={user.profilePicture}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="h-[18px] w-[18px] rounded-full object-cover ring-1 ring-white/20"
            />
            <span className="text-[9px] font-medium leading-none">Account</span>
          </NavLink>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex flex-col items-center justify-center gap-[3px] flex-1 h-full py-2 transition-colors duration-150 text-white/35"
          >
            <LogIn className="h-[18px] w-[18px] shrink-0" />
            <span className="text-[9px] font-medium leading-none">Sign in</span>
          </button>
        )}
      </nav>
    </>
  );
}
