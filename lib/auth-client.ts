import {createAuthClient} from "better-auth/react";

export const authClient = createAuthClient()

export const signIn = async () => {
  return await authClient.signIn.social({provider: "google", errorCallbackURL: "/error"});
}

export const signOut = async () => {
  return await authClient.signOut();
}

export const {useSession} = authClient;
