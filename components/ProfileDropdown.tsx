"use client";

import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {signOut} from "@/lib/auth-client";

type ProfileDropdownProps = {
  email: string;
  image?: string | null;
}

export default function ProfileDropdown({email, image}: ProfileDropdownProps) {

  const handleSignOut = () => {
    signOut().catch(console.error);
  }

  return <DropdownMenu>
    <DropdownMenuTrigger>
      <Avatar>
        <AvatarImage src={image || ""} alt={email}/>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>History</DropdownMenuItem>
      <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}