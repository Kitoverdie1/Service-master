"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  ClipboardPlus,
  Home,
  LogIn,
  LogOut,
  Settings,
  User,
  UserPen,
  Warehouse,
  ClipboardCheck,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { fetchProfile, loginM365, logOut, updateProfile } from "../actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState, useTransition } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

type ProfileForm = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  department: string;
};

type Department = {
  id: number;
  department: string;
};

const userMenu = [
  {
    title: "แจ้งงาน",
    url: "#",
    icon: <ClipboardPlus />,
    items: [
      {
        name: "งานเทคโนโลยีสารสนเทศ",
        url: "/itservice/workorder/it",
        icon: "",
      },
      {
        name: "งานโครงสร้างพื้นฐาน",
        url: "/itservice/workorder/mt",
        icon: "",
      },
    ],
  },
];

const adminMenu = [
  {
    title: "ตั้งค่า",
    icon: <Settings />,
    url: "#",
    items: [
      {
        name: "ผู้ใช้งาน",
        url: "/itservice/settings/users",
        icon: <User />,
      },
      {
        name: "แผนก",
        url: "/itservice/settings/department",
        icon: <Warehouse />,
      },
      {
        name: "ประเภทงาน",
        url: "/itservice/settings/types",
        icon: <ClipboardCheck />,
      },
    ],
  },
];

export default function AppsideBar() {
  const { isMobile } = useSidebar();
  const [department, setDepartment] = useState<Department[]>([]);
  const [selectDep, setSelectDep] = useState<boolean>(false);
  const [isProfile, setIsProfile] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  const [pending, startTransition] = useTransition();

  const { data: session } = useSession();

  const form = useForm<ProfileForm>({
    defaultValues: {
      id: 0,
      username: "",
      first_name: "",
      last_name: "",
      department: "",
    },
  });

  const handleUpdateProfile = async (v: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    department: string;
  }) => {
    startTransition(async () => {
      const res = await updateProfile(v);
      if (res?.errors) {
        return Object.entries(res.errors).forEach(([fieldName, messages]) => {
          form.setError(fieldName as keyof typeof v, {
            message: messages?.[0],
          });
        });
      }

      if (res.status === true) {
        toast.success(res.messages);
        setIsProfile(false);
      } else {
        toast.error(res.messages);
      }
    });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/itservice">
                <Avatar>
                  <AvatarImage src={"/logo/logo2.png"} />
                  <AvatarFallback>Logo</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">ระบบงานแจ้งซ่อม</span>
                  <span className="truncate text-xs">
                    โรงพยาบาลมหาวิทยาลัยพะเยา
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เมนู</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/itservice">
                    <Home />
                    หน้าหลัก
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {session?.user.id &&
                session?.user.first_name &&
                session?.user.last_name &&
                session?.user.department &&
                userMenu.map((x) => (
                  <React.Fragment key={x.title}>
                    {x.items ? (
                      <Collapsible
                        className="group/collapsible"
                        key={x.title}
                        asChild
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton asChild tooltip={x.title}>
                              <Link href="">
                                {x.icon}
                                <span>{x.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </Link>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {x.items &&
                                x.items.map((y) => (
                                  <SidebarMenuSubItem key={y.name}>
                                    <SidebarMenuSubButton asChild>
                                      <Link href={y.url}>
                                        <span>{y.name}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    ) : (
                      <SidebarMenuItem key={x.title}>
                        <SidebarMenuButton asChild>
                          <Link href={x.url}>
                            {x.icon} <span>{x.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </React.Fragment>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {session?.user.role === "Admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>ผู้ดูแลระบบ</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenu.map((x) => (
                  <Collapsible
                    className="group/collapsible"
                    key={x.title}
                    asChild
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton asChild tooltip={x.title}>
                          <Link href="">
                            {x.icon}
                            <span>{x.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </Link>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {x.items.map((y) => (
                            <SidebarMenuSubItem key={y.name}>
                              <SidebarMenuSubButton asChild>
                                <Link href={y.url}>
                                  <span>{y.name}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size={"lg"}
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={""} alt={"profile"} />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {session.user.first_name + " " + session.user.last_name}
                      </span>
                      <span className="truncate text-xs">
                        {session.user.department}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "bottom"}
                  align="end"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={async () => {
                        setIsProfile(true);
                        setIsLoadingProfile(true);
                        const res = await fetchProfile(session.user.id);
                        form.reset({
                          id: res?.employee?.id,
                          username: res?.employee?.username,
                          first_name: res?.employee?.first_name ?? "",
                          last_name: res?.employee?.last_name ?? "",
                          department: res?.employee?.department ?? "",
                        });
                        setDepartment(res.department);
                        setIsLoadingProfile(false);
                      }}
                    >
                      <UserPen />
                      ข้อมูลส่วนตัว
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => logOut()}
                  >
                    <LogOut />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton asChild>
                <Button onClick={() => loginM365()}>
                  <LogIn />
                  เข้าสู่ระบบ
                </Button>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <Dialog open={isProfile} onOpenChange={setIsProfile}>
        <DialogContent className="sm:max-w-3xl">
          <form id="profile" onSubmit={form.handleSubmit(handleUpdateProfile)}>
            <DialogHeader className="mb-3">
              <DialogTitle>ข้อมูลส่วนตัว;</DialogTitle>
              <DialogDescription>
                กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน
              </DialogDescription>
            </DialogHeader>
            <div className="w-full mb-5">
              {isLoadingProfile ? (
                <>
                  <div className="space-y-2 mb-5">
                    <Skeleton className="h-4 w-25" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 mb-5">
                      <Skeleton className="h-4 w-25" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="space-y-2  mb-5">
                      <Skeleton className="h-4 w-25" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-5s">
                    <Skeleton className="h-4 w-25" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </>
              ) : (
                <FieldGroup>
                  <Controller
                    name="username"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>ชื่อผู้ใช้งาน</FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="กรุณากรอกชื่อผู้ใช้งาน"
                          readOnly
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      name="first_name"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>ชื่อ</FieldLabel>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            placeholder="กรุณากรอกชื่อ"
                          />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name="last_name"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>นามสกุล</FieldLabel>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            placeholder="กรุณากรอกนามสกุล"
                          />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>
                  <Controller
                    name="department"
                    control={form.control}
                    render={({ field, fieldState }) => {
                      const current = field.value ?? "";
                      return (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>หน่วยงาน</FieldLabel>
                          <Popover open={selectDep} onOpenChange={setSelectDep}>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                role="combobox"
                                aria-expanded={selectDep}
                                className="w-full justify-between"
                              >
                                {form.getValues("department")
                                  ? department?.find(
                                      (x) =>
                                        x.id.toString() ===
                                        form.getValues("department"),
                                    )?.department
                                  : "กรุณาเลือกหน่วยงาน"}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <Command>
                                <CommandInput
                                  placeholder="กรุณาเลือกหน่วยงาน"
                                  className="h-9"
                                />
                                <CommandList
                                  onWheelCapture={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <CommandEmpty>
                                    ไม่มีหน่วยงานที่ระบุ
                                  </CommandEmpty>
                                  <CommandGroup heading="หน่วยงาน">
                                    {department?.map((x) => (
                                      <CommandItem
                                        key={x.id}
                                        value={x.id.toString()}
                                        onSelect={(v) => {
                                          field.onChange(
                                            v === current ? current : v,
                                          );
                                          setSelectDep(false);
                                        }}
                                      >
                                        {x.department}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      );
                    }}
                  />
                </FieldGroup>
              )}
            </div>
            {!isLoadingProfile && (
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant={"outline"}>ปิด</Button>
                </DialogClose>
                <Button type="submit" form="profile" disabled={pending}>
                  {pending ? <Spinner /> : "บันทึก"}
                </Button>
              </DialogFooter>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
