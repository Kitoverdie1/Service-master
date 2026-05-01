"use client";
import Search from "@/components/search";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
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
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState, useTransition } from "react";
import { usePagination } from "../../_context/pagination";
import { createDepartment, fetchData, updateDepartment } from "./actions";
import CardPagination from "../../_components/pagination";
import { Button } from "@/components/ui/button";
import { Plus, SquarePen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DialogClose } from "@radix-ui/react-dialog";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

type Data = {
  id: number;
  department: string;
};

type Pagination = {
  totalPages: number;
  start: number;
  end: number;
  total: number;
};

type departmentForm = {
  id: string;
  department: string;
};

const resetForm = {
  id: "",
  department: "",
};

export default function SettingsDepartment() {
  const { page, limit, search } = usePagination();
  const [data, setData] = useState<Data[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalPages: 0,
    start: 0,
    end: 0,
    total: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [pending, startTransition] = useTransition();

  const form = useForm<departmentForm>({
    defaultValues: resetForm,
  });

  useEffect(() => {
    handleFetchData();
  }, [page, search]);

  const handleFetchData = async () => {
    const res = await fetchData({ page: page, limit: limit, search: search });
    setData(res.department);
    setPagination(res.pagination);
    setLoading(false);
  };

  const handleCreateDepartment = async (value: { department: string }) => {
    startTransition(async () => {
      const res = await createDepartment(value);
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

      form.reset(resetForm);
    });
  };

  const handleUpdateData = async (value: {
    id: string;
    department: string;
  }) => {
    startTransition(async () => {
      const res = await updateDepartment(value);
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

  const cb = () => {
    setLoading(true);
  };

  return (
    <main>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="ml-1" />
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
                <BreadcrumbPage>หน่วยงาน</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-col p-4">
        <Card>
          <CardHeader>
            <CardTitle>หน่วยงาน</CardTitle>
            <CardDescription>ข้อมูลหน่วยงานทั้งหมด</CardDescription>
            <CardAction>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus /> เพิ่มหน่วยงาน
                  </Button>
                </DialogTrigger>
                <DialogContent
                  onEscapeKeyDown={() => {
                    form.reset(resetForm);
                    setLoading(true);
                    handleFetchData();
                  }}
                  onPointerDownOutside={() => {
                    form.reset(resetForm);
                    setLoading(true);
                    handleFetchData();
                  }}
                >
                  <form
                    id="create"
                    onSubmit={form.handleSubmit(handleCreateDepartment)}
                  >
                    <DialogHeader>
                      <DialogTitle>เพิ่มหน่วยงาน</DialogTitle>
                      <DialogDescription>
                        กรุณากรอกข้อมูลให้ครบถ้วน
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <FieldGroup>
                        <Controller
                          name="department"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel>ชื่อหน่วยงาน</FieldLabel>
                              <Input
                                {...field}
                                aria-invalid={fieldState.invalid}
                                placeholder="กรุณากรอกชื่อหน่วยงาน"
                              />
                              {fieldState.error && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      </FieldGroup>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant={"outline"}
                          onClick={() => {
                            form.reset(resetForm);
                            setLoading(true);
                            handleFetchData();
                          }}
                        >
                          ยกเลิก
                        </Button>
                      </DialogClose>
                      <Button type="submit" form="create" disabled={pending}>
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
              </Dialog>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Search cb={cb} />
            <Table>
              <TableHeader>
                <TableRow>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                    ))
                  ) : (
                    <>
                      <TableHead className="w-[100px] text-center">
                        ลำดับ
                      </TableHead>
                      <TableHead className="w-[100px]">ชื่อหน่วยงาน</TableHead>
                      <TableHead className="text-center">จัดการ</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 10 }).map((_, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Array.from({ length: 3 }).map((_, colIndex) => (
                          <TableCell key={colIndex}>
                            <Skeleton className="h-10 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : data.map((x, i) => {
                      return (
                        <TableRow key={x.id}>
                          <TableCell className="w-[100px] text-center">
                            {(page - 1) * limit + (i + 1)}
                          </TableCell>
                          <TableCell className="w-[100px]">
                            {x.department}
                          </TableCell>
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
                                          id: x.id.toString(),
                                          department: x.department,
                                        })
                                      }
                                    >
                                      <SquarePen />
                                    </Button>
                                  </TooltipTrigger>
                                </DialogTrigger>
                                <TooltipContent>แก้ไข</TooltipContent>
                                <DialogContent
                                  onEscapeKeyDown={() => {
                                    form.reset(resetForm);
                                    setLoading(true);
                                    handleFetchData();
                                  }}
                                  onPointerDownOutside={() => {
                                    form.reset(resetForm);
                                    setLoading(true);
                                    handleFetchData();
                                  }}
                                >
                                  <form
                                    id="edit"
                                    onSubmit={form.handleSubmit(
                                      handleUpdateData
                                    )}
                                  >
                                    <DialogHeader>
                                      <DialogTitle>แก้ไขข้อมูล</DialogTitle>
                                      <DialogDescription>
                                        กรุณากรอกข้อมูลให้ครบถ้วน
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-3">
                                      <FieldGroup>
                                        <Controller
                                          name="department"
                                          control={form.control}
                                          render={({ field, fieldState }) => (
                                            <Field
                                              data-invalid={fieldState.invalid}
                                            >
                                              <FieldLabel>
                                                ชื่อหน่วยงาน
                                              </FieldLabel>
                                              <Input
                                                {...field}
                                                aria-invalid={
                                                  fieldState.invalid
                                                }
                                                placeholder="กรุณากรอกชื่อหน่วยงาน"
                                              />
                                              {fieldState.error && (
                                                <FieldError
                                                  errors={[fieldState.error]}
                                                />
                                              )}
                                            </Field>
                                          )}
                                        />
                                      </FieldGroup>
                                    </div>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button
                                          type="button"
                                          variant={"outline"}
                                          onClick={() => {
                                            form.reset(resetForm);
                                            setLoading(true);
                                            handleFetchData();
                                          }}
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
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <CardPagination data={pagination} cb={cb} />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
