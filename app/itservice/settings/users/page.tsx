"use client";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState, useTransition } from "react";
import { fetchData, fetchDepartment, updateUser } from "./actions";
import { usePagination } from "../../_context/pagination";
import { ChevronsUpDownIcon, Save, SquarePen, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
} from "@/components/ui/command";
import CardPagination from "@/app/itservice/_components/pagination";
import Search from "@/components/search";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

type Users = {
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  role: string;
};

type Department = {
  id: number;
  department: string;
};

type Pagination = {
  totalPages: number;
  start: number;
  end: number;
  total: number;
};

export default function SettingsUsersPage() {
  const { page, limit, search } = usePagination();
  const [data, setData] = useState<Users[]>([]);
  const [department, setDepartment] = useState<Department[]>();
  const [pagination, setPagination] = useState<Pagination>({
    totalPages: 0,
    start: 0,
    end: 0,
    total: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [pending, startTransition] = useTransition();
  const [selectDep, setSelectDep] = useState<boolean>(false);

  const form = useForm({
    defaultValues: {
      id: "",
      username: "",
      first_name: "",
      last_name: "",
      department: "",
      role: "",
    },
  });

  const resetForm = {
    id: "",
    username: "",
    first_name: "",
    last_name: "",
    department: "",
    role: "",
  };

  const onSubmit = async (value: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    department: string;
    role: string;
  }) => {
    startTransition(async () => {
      const res = await updateUser(value);
      if (res?.errors) {
        return Object.entries(res.errors).forEach(([fieldName, messages]) => {
          form.setError(fieldName as keyof typeof value, {
            message: messages?.[0],
          });
        });
      }

      if (res.status === false) {
        toast.error(res.messages);
      } else {
        toast.success(res.messages);
      }
    });
  };

  useEffect(() => {
    handleFetchData();
    handleFetchDepartment();
  }, [page, search]);

  const handleFetchData = async () => {
    const res = await fetchData({ page: page, limit: limit, search: search });
    setData(res.users);
    setPagination(res.pagination);
    setLoading(false);
  };

  const handleFetchDepartment = async () => {
    const res = await fetchDepartment();
    setDepartment(res);
  };

  const cb = async () => {
    setLoading(true);
  };

  const handleCloae = async () => {
    setLoading(true);
    form.reset(resetForm);
    handleFetchData();
  };

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
                <BreadcrumbLink href="#">ตั้งค่า</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>ผู้ใช้งาน</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>ผู้ใช้งาน</CardTitle>
            <CardDescription>ข้อมูลผู้ใช้งานระบบ</CardDescription>
            <CardAction>
              <Search cb={cb} />
            </CardAction>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {Array.from({ length: 10 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 6 }).map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] text-center">
                      ลำดับ
                    </TableHead>
                    <TableHead className="w-[100px]">บัญชี</TableHead>
                    <TableHead>ชื่อ - นามสกุล</TableHead>
                    <TableHead>หน่วยงาน</TableHead>
                    <TableHead className="text-center">สิทธิ์</TableHead>
                    <TableHead className="text-center">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((x, i) => {
                    return (
                      <TableRow key={x.id}>
                        <TableCell className="text-center">
                          {(page - 1) * limit + (i + 1)}
                        </TableCell>
                        <TableCell>{x.username}</TableCell>
                        <TableCell>
                          {x.first_name ? x.first_name + " " + x.last_name : ""}
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-center">{x.role}</TableCell>
                        <TableCell className="text-center">
                          <Dialog>
                            <Tooltip>
                              <DialogTrigger asChild>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    size={"icon"}
                                    onClick={() =>
                                      form.reset({
                                        id: x.id.toString() ?? "",
                                        username: x.username ?? "",
                                        first_name: x.first_name ?? "",
                                        last_name: x.last_name ?? "",
                                        department: x.department ?? "",
                                        role: x.role ?? "",
                                      })
                                    }
                                  >
                                    <SquarePen />
                                  </Button>
                                </TooltipTrigger>
                              </DialogTrigger>
                              <TooltipContent>แก้ไข</TooltipContent>
                              <DialogContent
                                className="sm:max-w-3xl"
                                onEscapeKeyDown={handleCloae}
                                onPointerDownOutside={handleCloae}
                              >
                                <form
                                  id="edit"
                                  onSubmit={form.handleSubmit(onSubmit)}
                                >
                                  <DialogHeader>
                                    <DialogTitle>แก้ไขข้อมูล</DialogTitle>
                                    <DialogDescription>
                                      กรุณากรอกข้อมูลให้ครบถ้วน
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="mb-5">
                                    <FieldGroup>
                                      <Controller
                                        name="username"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                          <Field
                                            data-invalid={fieldState.invalid}
                                          >
                                            <FieldLabel>ชื่อบัญชี</FieldLabel>
                                            <Input
                                              {...field}
                                              aria-invalid={fieldState.invalid}
                                              placeholder="ชื่อบัญชี"
                                              readOnly
                                            />
                                            {fieldState.error && (
                                              <FieldError
                                                errors={[fieldState.error]}
                                              />
                                            )}
                                          </Field>
                                        )}
                                      />
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Controller
                                          name="first_name"
                                          control={form.control}
                                          render={({ field, fieldState }) => (
                                            <Field
                                              data-invalid={fieldState.invalid}
                                            >
                                              <FieldLabel>ชื่อ</FieldLabel>
                                              <Input
                                                {...field}
                                                aria-invalid={
                                                  fieldState.invalid
                                                }
                                                placeholder="กรุณากรอกชื่อ"
                                              />
                                              {fieldState.error && (
                                                <FieldError
                                                  errors={[fieldState.error]}
                                                />
                                              )}
                                            </Field>
                                          )}
                                        />
                                        <Controller
                                          name="last_name"
                                          control={form.control}
                                          render={({ field, fieldState }) => (
                                            <Field
                                              data-invalid={fieldState.invalid}
                                            >
                                              <FieldLabel>นามสกุล</FieldLabel>
                                              <Input
                                                {...field}
                                                aria-invalid={
                                                  fieldState.invalid
                                                }
                                                placeholder="กรุณากรอกนามสกุล"
                                              />
                                              {fieldState.error && (
                                                <FieldError
                                                  errors={[fieldState.error]}
                                                />
                                              )}
                                            </Field>
                                          )}
                                        />
                                        <Controller
                                          name="department"
                                          control={form.control}
                                          render={({ field, fieldState }) => {
                                            const current = field.value ?? "";
                                            return (
                                              <Field
                                                data-invalid={
                                                  fieldState.invalid
                                                }
                                              >
                                                <FieldLabel>
                                                  หน่วยงาน
                                                </FieldLabel>
                                                <Popover
                                                  open={selectDep}
                                                  onOpenChange={setSelectDep}
                                                >
                                                  <PopoverTrigger asChild>
                                                    <Button
                                                      variant={"outline"}
                                                      role="combobox"
                                                      className="w-full justify-between"
                                                    >
                                                      {form.getValues(
                                                        "department"
                                                      )
                                                        ? department?.find(
                                                            (x) =>
                                                              x.id.toString() ===
                                                              form.getValues(
                                                                "department"
                                                              )
                                                          )?.department
                                                        : "กรุณาเลือกหน่วยงาน"}
                                                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                                          {department?.map(
                                                            (x) => (
                                                              <CommandItem
                                                                key={x.id}
                                                                value={x.id.toString()}
                                                                onSelect={(
                                                                  v
                                                                ) => {
                                                                  field.onChange(
                                                                    v ===
                                                                      current
                                                                      ? current
                                                                      : v
                                                                  );
                                                                  setSelectDep(
                                                                    false
                                                                  );
                                                                }}
                                                              >
                                                                {x.department}
                                                              </CommandItem>
                                                            )
                                                          )}
                                                        </CommandGroup>
                                                      </CommandList>
                                                    </Command>
                                                  </PopoverContent>
                                                </Popover>
                                                {fieldState.error && (
                                                  <FieldError
                                                    errors={[fieldState.error]}
                                                  />
                                                )}
                                              </Field>
                                            );
                                          }}
                                        />
                                        <Controller
                                          name="role"
                                          control={form.control}
                                          render={({ field, fieldState }) => (
                                            <Field
                                              data-invalid={fieldState.invalid}
                                            >
                                              <FieldLabel>
                                                สิทธิ์การใช้งาน
                                              </FieldLabel>
                                              <Select value={x.role}>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="กรุณาเลือกสิทธิ์การใช้งาน" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectGroup>
                                                    <SelectLabel>
                                                      สิทธิ์การใช้งาน
                                                    </SelectLabel>
                                                    <SelectItem value="Admin">
                                                      ผู้ดูแลระบบ
                                                    </SelectItem>
                                                    <SelectItem value="User">
                                                      ผู้ใช้งานระบบ
                                                    </SelectItem>
                                                  </SelectGroup>
                                                </SelectContent>
                                              </Select>
                                              {fieldState.error && (
                                                <FieldError
                                                  errors={[fieldState.error]}
                                                />
                                              )}
                                            </Field>
                                          )}
                                        />
                                      </div>
                                    </FieldGroup>
                                  </div>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button
                                        type="button"
                                        variant={"outline"}
                                        onClick={handleCloae}
                                      >
                                        ยกเลิก
                                      </Button>
                                    </DialogClose>
                                    <Button
                                      type="submit"
                                      form="edit"
                                      disabled={pending}
                                    >
                                      {pending ? (
                                        <>
                                          <Spinner />
                                          กำลังบันทึก
                                        </>
                                      ) : (
                                        "บันทึก"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Tooltip>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <CardPagination data={pagination} cb={cb} />
          </CardFooter>
        </Card>
      </div>
    </SidebarInset>
  );
}
