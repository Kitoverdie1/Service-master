"use client";
import CardPagination from "@/app/itservice/_components/pagination";
import { usePagination } from "@/app/itservice/_context/pagination";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Car, ChevronLeft, EllipsisVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchDataHistory, fetchShowDetail } from "./action";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { htmlToText } from "html-to-text";
import Link from "next/link";

type Data = {
  id: number;
  it_service_order_types: {
    id: number;
    order_type: string;
  };
  it_service_urgency: {
    id: number;
    urgency: string;
  };
  it_service_status: {
    id: number;
    status: string;
  };
  created_at: Date;
};

type Pagination = {
  totalPages: number;
  start: number;
  end: number;
  total: number;
};

type Detail = {
  id: number;
  order_id: string;
  it_service_order_types: {
    order_type: string;
  };
  it_service_departments: {
    department: string;
  };
  it_service_urgency: {
    urgency: string;
  };
  requester: string | null;
  it_service_status: {
    id: number;
    status: string;
  };
  description: string;
  operator: string | null;
  comment: string | null;
  contact: string;
  created_at: Date;
  updated_at: Date;
};

export default function ITOrderHistoryPage() {
  const { page } = usePagination();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<Data[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Pagination>({
    totalPages: 0,
    start: 0,
    end: 0,
    total: 0,
  });
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    handleFetchData();
  }, [page, filter]);

  const handleFetchData = async () => {
    const res = await fetchDataHistory({ page: page, filter: filter });
    setData(res.orders);
    setPagination(res.pagination);
    setLoading(false);
  };

  const hanldeShowDetail = async ({ id }: { id: number }) => {
    setIsDialogOpen(true);
    const res = await fetchShowDetail({ id: id });
    setDetail(res as Detail);
  };

  const handleCloseDialog = async () => {
    setDetail(null);
  };

  const cb = async () => {
    setLoading(false);
  };

  return (
    <main className="flex flex-col gap-4 p-5">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>ประวัติการแจ้งซ่อม</CardTitle>
          <CardDescription>รายการแจ้งซ่อมทั้งหมดของคุณ</CardDescription>
          <CardAction>
            <Link href={"/itservice/workorder/it"}>
              <Button variant={"ghost"}>
                <ChevronLeft />
                ย้อนกลับ
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between sm:justify-start items-center gap-2 py-4">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              className=""
              value={"all"}
              onClick={() => setFilter("all")}
            >
              ทั้งหมด
            </Button>
            <Button
              variant={filter === "1" ? "default" : "outline"}
              value={"1"}
              onClick={() => setFilter("1")}
            >
              รอดำเนินการ
            </Button>
            <Button
              variant={filter === "2" ? "default" : "outline"}
              value={"2"}
              onClick={() => setFilter("2")}
            >
              กำลังดำเนินการ
            </Button>
            <Button
              variant={filter === "3" ? "default" : "outline"}
              value={"3"}
              onClick={() => setFilter("3")}
            >
              สำเร็จ
            </Button>
            <Button
              variant={filter === "4" ? "default" : "outline"}
              value={"4"}
              onClick={() => setFilter("4")}
            >
              ส่งเคลม
            </Button>
            <Button
              variant={filter === "5" ? "default" : "outline"}
              value={"5"}
              onClick={() => setFilter("5")}
            >
              จำหน่าย
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                  ))
                ) : (
                  <>
                    <TableHead className="w-24 text-center">ลำดับ</TableHead>
                    <TableHead className="w-24">วันที่แจ้งงาน</TableHead>
                    <TableHead className="text-start">ประเภทงาน</TableHead>
                    <TableHead className="text-center">ความเร่งด่วน</TableHead>
                    <TableHead className="text-center">สถานะ</TableHead>
                    <TableHead className="text-center">จัดการ</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 10 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 5 }).map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data.map((x, i) => {
                    return (
                      <TableRow key={x.id}>
                        <TableCell className="w-24 text-center">
                          {(page - 1) * 10 + (i + 1)}
                        </TableCell>
                        <TableCell>
                          {new Date(x.created_at).toLocaleString("th-TH", {
                            timeZone: "UTC",
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="whitespace-normal break-words">
                          {x.it_service_order_types.order_type}
                        </TableCell>
                        <TableCell className="text-center">
                          {x.it_service_urgency.id === 1 ? (
                            <Badge className="bg-emerald-500/80">
                              {x.it_service_urgency.urgency}
                            </Badge>
                          ) : x.it_service_urgency.id === 2 ? (
                            <Badge className="bg-yellow-500/80">
                              {x.it_service_urgency.urgency}
                            </Badge>
                          ) : x.it_service_urgency.id === 3 ? (
                            <Badge className="bg-red-500/80">
                              {x.it_service_urgency.urgency}
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-center">
                          {x.it_service_status.id === 1 ? (
                            <Badge className="bg-amber-500/80">
                              {x.it_service_status.status}
                            </Badge>
                          ) : x.it_service_status.id === 2 ? (
                            <Badge className="bg-sky-500/80">
                              {x.it_service_status.status}
                            </Badge>
                          ) : x.it_service_status.id === 3 ? (
                            <Badge className="bg-emerald-500/80">
                              {x.it_service_status.status}
                            </Badge>
                          ) : x.it_service_status.id === 4 ? (
                            <Badge className="bg-zinc-500/80">
                              {x.it_service_status.status}
                            </Badge>
                          ) : x.it_service_status.id === 5 ? (
                            <Badge className="bg-red-500/80">
                              {x.it_service_status.status}
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <Tooltip>
                              <DropdownMenuTrigger asChild>
                                <TooltipTrigger asChild>
                                  <Button variant={"ghost"}>
                                    <EllipsisVertical />
                                  </Button>
                                </TooltipTrigger>
                              </DropdownMenuTrigger>
                              <TooltipContent>ดูเพิ่มเติม</TooltipContent>
                              <DropdownMenuContent>
                                <DropdownMenuLabel className="text-xs">
                                  กรุณาเลือกรายการ
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onSelect={() =>
                                    hanldeShowDetail({ id: x.id })
                                  }
                                >
                                  รายละเอียด
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </Tooltip>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <CardPagination data={pagination} cb={cb} />
        </CardFooter>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto w-full sm:max-w-3xl"
          onEscapeKeyDown={handleCloseDialog}
          onPointerDownOutside={handleCloseDialog}
        >
          <DialogHeader>
            <DialogTitle>รายละเอียดการแจ้งซ่อม</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row sm:flex-wrap p-5">
            <div className="w-full sm:w-1/2 mb-5">
              <Label>ประเภทงาน</Label>
              {detail?.it_service_order_types.order_type ? (
                <p className="p-3 text-sm">
                  - {detail?.it_service_order_types.order_type}
                </p>
              ) : (
                <Skeleton className="h-3" />
              )}
            </div>
            <div className="w-full sm:w-1/2 mb-5">
              <Label>ความเร่งด่วน</Label>
              {detail?.it_service_urgency.urgency ? (
                <p className="p-3 text-sm">
                  - {detail?.it_service_urgency.urgency}
                </p>
              ) : (
                <Skeleton className="h-3" />
              )}
            </div>
            <div className="w-full sm:w-1/2 mb-5">
              <Label>วันที่แจ้ง</Label>
              {detail?.created_at ? (
                <p className="p-3 text-sm">
                  -{" "}
                  {detail?.created_at &&
                    new Date(detail?.created_at).toLocaleString("th-TH", {
                      timeZone: "UTC",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </p>
              ) : (
                <Skeleton className="h-3" />
              )}
            </div>
            <div className="w-full sm:w-1/2 mb-5">
              <Label>ผู้แจ้ง</Label>
              {detail?.requester ? (
                <p className="p-3 text-sm">- {detail?.requester}</p>
              ) : (
                <Skeleton className="h-3" />
              )}
            </div>
            <div className="w-full sm:w-1/2 mb-5">
              <Label>เบอร์โทรศัพท์</Label>
              {detail?.contact ? (
                <p className="p-3 text-sm">- {detail?.contact}</p>
              ) : (
                <Skeleton className="h-3" />
              )}
            </div>
            <div className="w-full sm:w-1/2 mb-5">
              <Label>สถานะ</Label>
              {detail?.it_service_status.status ? (
                <p className="p-3 text-sm">
                  - {detail?.it_service_status.status}
                </p>
              ) : (
                <Skeleton className="h-3" />
              )}
            </div>
            <div className="w-full sm:w-full mb-5">
              <Label>รายละเอียด</Label>
              {detail?.description ? (
                <p className="p-3 text-sm">
                  -{" "}
                  {detail?.description &&
                    htmlToText(detail?.description, {
                      wordwrap: false,
                      selectors: [
                        {
                          selector: "a",
                          options: { hideLinkHrefIfSameAsText: true },
                        },
                        {
                          selector: "img",
                          format: "skip",
                        },
                      ],
                    })}
                </p>
              ) : (
                <Skeleton className="h-3" />
              )}
            </div>
            {detail?.it_service_status.id !== 1 && (
              <>
                <Separator className="mb-5" />
                <div className="w-full sm:w-1/2 mb-5">
                  <Label>ผู้รับงาน</Label>
                  {detail?.operator ? (
                    <p className="p-3 text-sm">- {detail?.operator}</p>
                  ) : (
                    <Skeleton className="h-3" />
                  )}
                </div>
                <div className="w-full sm:w-1/2 mb-5">
                  <Label>วันที่ดำเนินการ</Label>
                  {detail?.updated_at ? (
                    <p className="p-3 text-sm">
                      -{" "}
                      {detail?.updated_at &&
                        new Date(detail?.updated_at).toLocaleString("th-TH", {
                          timeZone: "UTC",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </p>
                  ) : (
                    <Skeleton className="h-3" />
                  )}
                </div>
                <div className="w-full mb-5">
                  <Label>หมายเหตุ</Label>
                  {detail?.comment ? (
                    <p className="p-5 text-sm">
                      -{" "}
                      {detail?.description &&
                        htmlToText(detail?.description, {
                          wordwrap: false,
                          selectors: [
                            {
                              selector: "a",
                              options: { hideLinkHrefIfSameAsText: true },
                            },
                            {
                              selector: "img",
                              format: "skip",
                            },
                          ],
                        })}
                    </p>
                  ) : (
                    <Skeleton className="h-3" />
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"outline"} onClick={handleCloseDialog}>
                ปิด
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
