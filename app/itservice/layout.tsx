import AppsideBar from "@/app/itservice/_components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PaginationProvider } from "./_context/pagination";

export const metadata = {
  title: "ระบบงานแจ้งซ่อม - หน้าหลัก"
}

export default function ItserviceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppsideBar />
      <PaginationProvider>{children}</PaginationProvider>
    </SidebarProvider>
  );
}
