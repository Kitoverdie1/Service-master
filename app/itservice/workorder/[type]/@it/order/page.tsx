"use client";
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { fetchTypesUrgencys } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Tiptap from "@/components/tiptap";
import { addOrder } from "./actions";
import { toast } from "sonner";

type Types = {
  id: number;
  order_type: string;
};

type Urgencys = {
  id: number;
  urgency: string;
};

type AddOrderForm = {
  type: string;
  urgency: string;
  description: string;
  contact: string;
};

export default function ITAddOrderPage() {
  const [types, setTypes] = useState<Types[]>([]);
  const [urgencys, setUrgencys] = useState<Urgencys[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pending, startTransition] = useTransition();

  const form = useForm<AddOrderForm>({
    defaultValues: {
      type: "",
      urgency: "",
      description: "",
      contact: "",
    },
  });

  useEffect(() => {
    handleFetchTypesUrgencys();
  }, []);

  const handleFetchTypesUrgencys = async () => {
    const res = await fetchTypesUrgencys();
    setTypes(res.types);
    setUrgencys(res.urgencys);
    setLoading(false);
  };

  const handleAddOrder = async (value: AddOrderForm) => {
    startTransition(async () => {
      const res = await addOrder(value);
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

      form.reset();
    });
  };

  return (
    <main className="flex p-5 w-full sm:w-3/4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>แจ้งซ่อมทั่วไป (งานเทคโนโลยีสารสนเทศ)</CardTitle>
          <CardDescription>กรุณากรอกข้อมูลให้ครบถ้วน</CardDescription>
          <CardAction>
            <Link href={"/itservice/workorder/it"}>
              <Button variant={"ghost"}>
                <ChevronLeft />
                ย้อนกลับ
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
        {loading ? (
          <CardContent>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-5 mb-5">
                <Skeleton className="h-4 w-1/2 sm:w-24" />
                <Skeleton className="h-4 w-full sm:w-1/2" />
              </div>
            ))}
          </CardContent>
        ) : (
          <form id="addorder" onSubmit={form.handleSubmit(handleAddOrder)}>
            <CardContent>
              <FieldSet className="mb-5">
                <FieldGroup>
                  <Controller
                    name="type"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>ประเภทงาน</FieldLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="กรุณาเลือกประเภทงาน" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>ประเภทงาน</SelectLabel>
                              {types.map((x) => (
                                <SelectItem key={x.id} value={x.id.toString()}>
                                  {x.order_type}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="urgency"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>ความเร่งด่วน</FieldLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="กรุณาเลือกความเร่งด่วน" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>ความเร่งด่วน</SelectLabel>
                              {urgencys.map((x) => (
                                <SelectItem key={x.id} value={x.id.toString()}>
                                  {x.urgency}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>รายละเอียดงาน</FieldLabel>
                        <Tiptap value={field.value} onChange={field.onChange} />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="contact"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>เบอร์โทรศัพท์</FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="เบอร์โทรศัพท์สำหรับการติดต่อกลับ"
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled={pending} form="addorder">
                <Save />
                บันทึกการแจ้งงาน
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  );
}
