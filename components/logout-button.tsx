"use client"

import { logout } from "@/lib/actions/auth.actions";

export default function LogoutButton({ children } : { children: React.ReactNode}) {
    async function onClick() {
    await logout();
    }

  return (
    <span onClick={onClick} className="cursor-pointer">
        {children}
    </span>
  )
}
