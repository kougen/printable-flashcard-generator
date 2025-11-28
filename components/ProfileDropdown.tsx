"use client";

import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

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
      <DropdownMenuItem>Log out</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}