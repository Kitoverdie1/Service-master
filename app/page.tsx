import Image from "next/image";
import Link from "next/link";
import { Camera, MonitorCog, Stethoscope, Activity } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ServiceCard = {
  title: string;
  description: string;
  detail: string;
  url: string;
  color: string;
  icon: React.ElementType;
};

const data: ServiceCard[] = [
  {
    title: "ระบบงานสื่อสารองค์กร",
    description: "สื่อสารองค์กร",
    detail: "ขอใช้บริการประชาสัมพันธ์และสื่อสารองค์กร",
    url: "/prservice",
    color: "text-green-500",
    icon: Camera,
  },
  {
    title: "ระบบงานแจ้งซ่อม",
    description: "งานโครงสร้างพื้นฐาน, งานเทคโนโลยีสารสนเทศ",
    detail: "ระบบแจ้งซ่อมงานโครงสร้างพื้นฐานและงานเทคโนโลยีสารสนเทศ",
    url: "/itservice",
    color: "text-blue-500",
    icon: MonitorCog,
  },
  {
    title: "ระบบบริหารจัดการครุภัณฑ์และเครื่องมือทางการแพทย์",
    description: "หน่วยงานครุภัณฑ์และเครื่องมือแพทย์",
    detail: "ระบบจัดการ ตรวจสอบ และติดตามครุภัณฑ์",
    url: "/memsystem",
    color: "text-emerald-600",
    icon: Stethoscope,
  },
  {
    // 🔥 กล่องที่ 4 (ใหม่)
    title: "Anesthesia Dashboard",
    description: "Intra-operative Record",
    detail: "ระบบบันทึกข้อมูลวิสัญญีระหว่างผ่าตัด (Dashboard)",
    url: "/anesthesia",
    color: "text-purple-600",
    icon: Activity,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-prompt">
      <main className="w-full max-w-5xl bg-white px-16 py-20">
        <Image src="/logo/logo2.png" alt="logo" width={100} height={100} />

        <div className="mb-6 mt-6 text-center">
          <h1 className="text-3xl font-semibold text-violet-800">
            ยินดีต้อนรับเข้าสู่โรงพยาบาลมหาวิทยาลัยพะเยา
          </h1>
          <p>กรุณาเลือกบริการที่ท่านต้องการใช้งาน</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {data.map((x, i) => {
            const Icon = x.icon;
            return (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${x.color}`}>
                    <Icon className="h-5 w-5" />
                    {x.title}
                  </CardTitle>
                  <CardDescription>
                    หน่วยงาน: {x.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <p>{x.detail}</p>
                </CardContent>

                <CardFooter className="justify-end">
                  <Link href={x.url}>
                    <Button>เลือกบริการ</Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}

    // <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    //   <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
    //     <Image
    //       className="dark:invert"
    //       src="/next.svg"
    //       alt="Next.js logo"
    //       width={100}
    //       height={20}
    //       priority
    //     />
    //     <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
    //       <h1 className="w-full text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
    //        ยินดีต้อนรับเข้าสู่โรงพยาบาลมหาวิทยาลัยพะเยา
    //       </h1>
    //       {/* <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
    //         Looking for a starting point or more instructions? Head over to{" "}
    //         <a
    //           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
    //           className="font-medium text-zinc-950 dark:text-zinc-50"
    //         >
    //           Templates
    //         </a>{" "}
    //         or the{" "}
    //         <a
    //           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
    //           className="font-medium text-zinc-950 dark:text-zinc-50"
    //         >
    //           Learning
    //         </a>{" "}
    //         center.
    //       </p> */}
    //       <Card className="w-1/2">
    //         <CardHeader>
    //           <CardTitle>IT SERVICES</CardTitle>
    //         </CardHeader>
    //       </Card>
    //     </div>
    //     <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
    //       <a
    //         className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
    //         href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <Image
    //           className="dark:invert"
    //           src="/vercel.svg"
    //           alt="Vercel logomark"
    //           width={16}
    //           height={16}
    //         />
    //         Deploy Now
    //       </a>
    //       <a
    //         className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
    //         href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         Documentation
    //       </a>
    //     </div>
    //   </main>
    // </div>