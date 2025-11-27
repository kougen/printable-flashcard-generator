"use client";

import ProfileDropdown from "@/components/ProfileDropdown";
import SignInButton from "@/components/SignInButton";
import {useSession} from "@/lib/auth-client";

export default function Header() {
  const {data} = useSession();
  return (<div>
      {data?.user ? (
        <ProfileDropdown email={data.user.email} image={data.user.image}/>
      ) : (
        <SignInButton/>
      )}
    </div>
  )
}