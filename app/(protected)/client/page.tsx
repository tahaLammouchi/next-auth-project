"use client"

import { auth } from "@/auth"
import UserInfo from "@/components/user-info";
import useCurrentUser from "@/hooks/use-curent-user";

export default function Client() {
    const user = useCurrentUser();
  return (
    <UserInfo user={user} label="💻 Client Component" />
  )
}
