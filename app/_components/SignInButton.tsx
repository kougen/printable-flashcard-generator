"use client";

import {authClient} from "@/lib/auth-client";

export default function SignInButton() {
  const onClick = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      errorCallbackURL: "/error",
      newUserCallbackURL: "/welcome",
    });
  }

  return <button onClick={onClick} className="px-4 py-2 bg-blue-600 text-white rounded">
    Sign in with Google
  </button>

}