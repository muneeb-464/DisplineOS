import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SignInModal() {
  const { signInPromptOpen, closeSignInPrompt, signInWithGoogle } = useAuth();

  return (
    <Dialog open={signInPromptOpen} onOpenChange={closeSignInPrompt}>
      <DialogContent className="sm:max-w-sm text-center">
        <div className="mx-auto mb-2 h-14 w-14 rounded-2xl bg-primary grid place-items-center shadow-lg shadow-primary/30">
          <div className="h-4 w-4 rounded-md bg-primary-foreground" />
        </div>
        <DialogTitle className="text-2xl font-bold font-display">Sign in required</DialogTitle>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Create a free account to use this feature and sync your data across devices.
        </p>
        <Button onClick={signInWithGoogle} className="w-full gap-3 h-11">
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>
        <button onClick={closeSignInPrompt} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
          Continue browsing as guest
        </button>
      </DialogContent>
    </Dialog>
  );
}
