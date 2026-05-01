import { checkSession } from "@/app/_libs/checksession";
import { SidebarInset } from "@/components/ui/sidebar";
import React from "react";

export const metadata = {
  title: "ระบบงานแจ้งซ่อม - ตั้งค่า - ประเภทงาน",
};

export default async function SettingsTypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkSession();

  return <SidebarInset>{children}</SidebarInset>;
}
