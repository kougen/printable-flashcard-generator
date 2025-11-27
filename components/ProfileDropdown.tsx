import {Avatar, AvatarImage} from "@/components/ui/avatar";

type ProfileDropdownProps = {
  email: string;
  image?: string | null;
}

export default function ProfileDropdown({email, image}: ProfileDropdownProps) {
  return <Avatar>
    <AvatarImage src={image || ""} alt={email}/>
  </Avatar>
}