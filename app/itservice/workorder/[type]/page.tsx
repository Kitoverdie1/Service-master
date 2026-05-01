"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { Home, Lock } from "lucide-react";
import { redirect } from "next/navigation";
import { useTransition } from "react";

export default function WorkOrderPage() {
  const [pending, startTransition] = useTransition();
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>ไม่พบหน้าที่ระบุ</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center mb-5">
            <div className="relative">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full text-destructive">
                <Lock size={50} strokeWidth={3} />
              </div>
            </div>
          </div>
          <h2 className="mb-5 text-3xl font-bold tracking-tight text-destructive">
            ไม่พบหน้าที่ระบุ
          </h2>
          <p className="mb-5 text-slate-500">
            ขออภัย ไม่มีหน้าที่ท่านทำการระบุ
            โปรดตรวจหน้าการใช้งานของคุณหรือติดต่อผู้ดูแลระบบเพื่อขอรับความช่วยเหลือ
          </p>
          <div className="justify-center gap-3">
            <Button
              variant={"destructive"}
              onClick={() => startTransition(() => redirect("/itservice"))}
              disabled={pending}
            >
              {pending ? (
                <Spinner />
              ) : (
                <>
                  <Home />
                  กลับหน้าหลัก
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </SidebarInset>
  );
}
