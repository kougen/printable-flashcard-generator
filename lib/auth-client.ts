import {createAuthClient} from "better-auth/react";

export const authClient = createAuthClient()

export const signIn = async () => {
  return await authClient.signIn.social({provider: "google", errorCallbackURL: "/error"});
}

export const {signOut, useSession} = authClient;
