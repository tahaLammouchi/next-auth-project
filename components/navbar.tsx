"use client";

import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";
import UserButton from "./user-button";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav
      className="bg-secondary flex flex-col md:flex-row justify-between
      items-center p-4 rounded-xl w-full md:w-[600px] mx-auto shadow-sm"
    >
      <div className="flex gap-x-2 mb-4 md:mb-0">
        <Button
          asChild
          variant={pathname === "/server" ? "default" : "outline"}
        >
          <Link href="/server">Server</Link>
        </Button>

        <Button
          asChild
          variant={pathname === "/client" ? "default" : "outline"}
        >
          <Link href="/client">Client</Link>
        </Button>

        <Button asChild variant={pathname === "/admin" ? "default" : "outline"}>
          <Link href="/admin">Admin</Link>
        </Button>

        <Button
          asChild
          variant={pathname === "/settings" ? "default" : "outline"}
        >
          <Link href="/settings">Settings</Link>
        </Button>
      </div>
      <UserButton />
    </nav>
  );
}
