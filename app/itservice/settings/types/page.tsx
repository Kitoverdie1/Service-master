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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleAlert, Monitor, Plus, SquarePen, Wrench } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import CardPagination from "../../_components/pagination";
import { usePagination } from "../../_context/pagination";
import { useEffect, useState, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { createTypes, fetchData, updateTypes } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Types = {
  id: number;
  order_type: string;
  category_id: number;
};

type TypesForm = {
  id: string;
  order_type: string;
  category_id: string;
};

type Pagination = {
  totalPages: number;
  start: number;
  end: number;
  total: number;
};

export default function SettingsTypesPage() {
  const { page, limit, search } = usePagination();
  const [data, setData] = useState<Types[]>([]);
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<Pagination>({
    totalPages: 0,
    start: 0,
    end: 0,
    total: 0,
  });
  const [filterCategory, setFilterCategory] = useState<string[]>([]);

  const resetForm = {
    id: "",
    order_type: "",
    category_id: "",
  };

  const form = useForm<TypesForm>({
    defaultValues: resetForm,
  });

  useEffect(() => {
    handleFetchData();
  }, [page, search, filterCategory]);

  const handleFetchData = async () => {
    const res = await fetchData({
      page: page,
      limit: limit,
      search: search,
      category: filterCategory,
    });
    setData(res.types);
    setPagination(res.pagination);
    setLoading(false);
  };

  const handleCreateDepartment = async (value: {
    order_type: string;
    category_id: string;
  }) => {
    startTransition(async () => {
      const res = await createTypes(value);
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
    order_type: string;
    category_id: string;
  }) => {
    startTransition(async () => {
      const res = await updateTypes(value);
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
    form.reset(resetForm);
    setLoading(true);
    handleFetchData();
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
                <BreadcrumbPage>ป่ระเภทงาน</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-col p-4">
        <Card>
          <CardHeader>
            <CardTitle>ประเภทงาน</CardTitle>
            <CardDescription>ข้อมูลประเภทงานทั้งหมด</CardDescription>
            <CardAction>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus /> เพิ่มประเภทงาน
                  </Button>
                </DialogTrigger>
                <DialogContent onEscapeKeyDown={cb} onPointerDownOutside={cb}>
                  <form
                    id="create"
                    onSubmit={form.handleSubmit(handleCreateDepartment)}
                  >
                    <DialogHeader>
                      <DialogTitle>เพิ่มประเภทงาน</DialogTitle>
                      <DialogDescription>
                        กรุณากรอกข้อมูลให้ครบถ้วน
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <FieldGroup>
                        <Controller
                          name="order_type"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel>ชื่อประเภทงาน</FieldLabel>
                              <Input
                                {...field}
                                aria-invalid={fieldState.invalid}
                                placeholder="กรุณากรอกชื่อประเภทงาน"
                              />
                              {fieldState.error && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                        <Controller
                          name="category_id"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel>หน่วยงาน</FieldLabel>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="กรุณาเลือกหน่วยงาน" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">ไม่ระบุ</SelectItem>
                                  <SelectItem value="1">
                                    งานโครงสร้างพื้นฐาน
                                  </SelectItem>
                                  <SelectItem value="2">
                                    งานเทคโนโลยีสารสนเทศ
                                  </SelectItem>
                                </SelectContent>
                              </Select>
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
                        <Button type="button" variant={"outline"} onClick={cb}>
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
            <ToggleGroup
              type="multiple"
              variant={"outline"}
              spacing={2}
              size={"sm"}
              onValueChange={setFilterCategory}
              className="flex flex-wrap mb-5"
            >
              <ToggleGroupItem
                value="0"
                aria-label="Toggle 0"
                className="data-[state=on]:bg-destructive data-[state=on]:*:[svg]:fill-destructive data-[state=on]:*:[svg]:stroke-white data-[state=on]:text-white"
              >
                <CircleAlert />
                ไม่ระบุ
              </ToggleGroupItem>
              <ToggleGroupItem
                value="1"
                aria-label="Toggle 1"
                className="data-[state=on]:bg-yellow-500 data-[state=on]:*:[svg]:fill-white data-[state=on]:*:[svg]:stroke-white data-[state=on]:text-white"
              >
                <Wrench />
                งานโครงสร้างพื้นฐาน
              </ToggleGroupItem>
              <ToggleGroupItem
                value="2"
                aria-label="Toggle 2"
                className="data-[state=on]:bg-blue-500 data-[state=on]:*:[svg]:fill-white data-[state=on]:*:[svg]:stroke-white data-[state=on]:text-white"
              >
                <Monitor />
                งานเทคโนโลยีสารสนเทศ
              </ToggleGroupItem>
            </ToggleGroup>
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
                      <TableHead className="w-[100px]">ชื่อประเภทงาน</TableHead>
                      <TableHead className="text-center">หน่วยงาน</TableHead>
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
                            {x.order_type}
                          </TableCell>
                          <TableCell className="text-center">
                            {x.category_id === 0 ? (
                              <Badge
                                variant={"destructive"}
                                className="opacity-75"
                              >
                                ไม่ระบุ
                              </Badge>
                            ) : x.category_id === 1 ? (
                              <Badge className="bg-orange-500 opacity-75">
                                งานโครงสร้างพื้นฐาน
                              </Badge>
                            ) : x.category_id === 2 ? (
                              <Badge
                                variant={"secondary"}
                                className="bg-blue-500 opacity-75 text-white"
                              >
                                งานเทคโนโลยีสารสนเทศ
                              </Badge>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-center">
                            <Dialog>
                              <Tooltip>
                                <DialogTrigger asChild>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      size={"icon"}
                                      onClick={() => {
                                        form.reset({
                                          id: x.id.toString(),
                                          order_type: x.order_type,
                                          category_id: x.category_id.toString(),
                                        });
                                      }}
                                    >
                                      <SquarePen />
                                    </Button>
                                  </TooltipTrigger>
                                </DialogTrigger>
                                <TooltipContent>แก้ไข</TooltipContent>
                                <DialogContent
                                  onEscapeKeyDown={cb}
                                  onPointerDownOutside={cb}
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
                                          name="order_type"
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
                                        <Controller
                                          name="category_id"
                                          control={form.control}
                                          render={({ field, fieldState }) => (
                                            <Field
                                              data-invalid={fieldState.invalid}
                                            >
                                              <FieldLabel>หน่วยงาน</FieldLabel>
                                              <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue placeholder="กรุณาเลือกหน่วยงาน" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="0">
                                                    ไม่ระบุ
                                                  </SelectItem>
                                                  <SelectItem value="1">
                                                    งานโครงสร้างพื้นฐาน
                                                  </SelectItem>
                                                  <SelectItem value="2">
                                                    งานเทคโนโลยีสารสนเทศ
                                                  </SelectItem>
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
                                      </FieldGroup>
                                    </div>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button
                                          type="button"
                                          variant={"outline"}
                                          onClick={cb}
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
