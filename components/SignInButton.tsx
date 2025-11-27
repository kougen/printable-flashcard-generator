"use client";

import {signIn} from "@/lib/auth-client";
import {Button} from "@/components/ui/button";

export default function SignInButton() {
  return <Button onClick={signIn}>
    Sign in with Google
  </Button>

}