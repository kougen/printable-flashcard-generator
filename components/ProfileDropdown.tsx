"use client";

import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {signOut} from "@/lib/auth-client";

type ProfileDropdownProps = {
  email: string;
  image?: string | null;
}

export default function ProfileDropdown({email, image}: ProfileDropdownProps) {
  return <DropdownMenu>
    <DropdownMenuTrigger>
      <Avatar>
        <AvatarImage src={image || ""} alt={email}/>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>History</DropdownMenuItem>
      <DropdownMenuItem onClick={signOut}>Log out</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}