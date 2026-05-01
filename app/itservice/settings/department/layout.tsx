import { checkSession } from "@/app/_libs/checksession";
import { SidebarInset } from "@/components/ui/sidebar";

export const metadata = {
  title: "ระบบงานแจ้งซ่อม - ตั้งค่า - หน่วยงาน",
};

export default async function SettingsDepartmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkSession();
  return <SidebarInset>{children}</SidebarInset>;
}
