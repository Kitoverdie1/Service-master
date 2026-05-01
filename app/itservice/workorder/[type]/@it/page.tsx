"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Computer, History, Wifi } from "lucide-react";
import Link from "next/link";

const menu = [
  {
    title: "แจ้งซ่อมทั่วไป",
    description: "HosXP4, Network, Website",
    url: "/itservice/workorder/it/order",
    history: "/itservice/workorder/it/order-history",
    icon: <Computer />,
    color: "text-emerald-500 hover:text-emerald-400",
    button: "bg-emerald-500 hover:bg-emerald-400 w-full sm:w-24",
  },
  {
    title: "ขอรหัสไวไฟ (วอร์ด)",
    description: "User, Password to Login UP-WIFI-Guest",
    url: "",
    history: "",
    icon: <Wifi />,
    color: "text-blue-500 hover:text-blue-400",
    button: "bg-blue-500 hover:bg-blue-400 w-full sm:w-24",
  },
];

export default function ITPage() {
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">แจ้งงาน</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>งานเทคโนโลยีสารสนเทศ</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main>
        <div className="flex flex-wrap flex-col sm:flex-row sm:item-center sm:justify-center gap-4 p-4">
          {menu.map((x) => {
            return (
              <Card key={x.title} className="w-full sm:w-80 shadow-xl">
                <CardHeader>
                  <CardTitle
                    className={`flex items-center justify-center sm:justify-start gap-2 ${x.color}`}
                  >
                    {x.icon} {x.title}
                  </CardTitle>
                  <CardDescription className="flex justify-center sm:justify-start">
                    {x.description}
                  </CardDescription>
                  <CardAction></CardAction>
                </CardHeader>
                <CardFooter className="flex flex-col sm:flex-row gap-2 mt-auto justify-center sm:justify-end">
                  <Link href={x.history}>
                    <Button
                      variant={"ghost"}
                      className="w-full sm:w-24 text-yellow-500 hover:text-white hover:bg-yellow-500"
                    >
                      <History />
                      ประวัติ
                    </Button>
                  </Link>
                  <Link href={x.url} className="w-full sm:w-24">
                    <Button className={`${x.button}`}>เลือกบริการ</Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>
    </SidebarInset>
  );
}
