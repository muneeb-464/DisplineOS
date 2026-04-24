import { useAuth } from "@/context/AuthContext";

export default function GuestBanner() {
  const { isLoggedIn, openSignInPrompt } = useAuth();
  if (isLoggedIn) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">
        You're browsing as a guest — data won't be saved.
      </span>
      <button
        onClick={openSignInPrompt}
        className="shrink-0 text-primary font-medium hover:underline"
      >
        Sign in →
      </button>
    </div>
  );
}
