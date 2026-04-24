import Sidebar from "./Sidebar";
import GuestBanner from "@/components/GuestBanner";
import SignInModal from "@/components/SignInModal";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar has `peer` class — sibling selector drives the blur below */}
      <Sidebar />

      <div className="fixed top-4 right-5 z-40 hidden md:block">
        <ThemeToggle />
      </div>

      {/* peer-hover:blur-sm triggers when the sidebar (peer) is hovered.
          Pure CSS — no JS state, so React re-renders from navigation
          never cause a flicker or collapse/re-expand cycle. */}
      <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:ml-[84px] transition-[filter,opacity] duration-300 peer-hover:md:blur-sm peer-hover:md:opacity-60 peer-hover:md:pointer-events-none">
        <GuestBanner />
        <main className="flex-1">{children}</main>
      </div>

      <SignInModal />
    </div>
  );
}
