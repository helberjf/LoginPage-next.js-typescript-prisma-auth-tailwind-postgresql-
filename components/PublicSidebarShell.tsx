"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import SidebarMobile from "@/components/SidebarMobile";
import { adminSidebar, customerSidebar, publicSidebar, staffSidebar } from "@/sidebar.config";

export default function PublicSidebarShell() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role;
  const items =
    role === "ADMIN"
      ? adminSidebar
      : role === "STAFF"
        ? staffSidebar
        : role === "CUSTOMER"
          ? customerSidebar
          : publicSidebar;

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <>
      <SidebarMobile items={items} />
    </>
  );
}