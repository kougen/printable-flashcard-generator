"use client";

import {signIn} from "@/lib/auth-client";

export default function SignInButton() {
  return <button onClick={signIn} className="px-4 py-2 bg-blue-600 text-white rounded">
    Sign in with Google
  </button>

}