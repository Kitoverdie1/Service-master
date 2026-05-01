import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { usePagination } from "@/app/itservice/_context/pagination";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type PaginationType = {
    totalPages: number;
    start: number;
    end: number;
    total: number;
};

export default function CardPagination({ data, cb }: { data: PaginationType, cb: () => void }) {
  const { page, setPage } = usePagination();

  const pageRange = 5;
  const half = Math.floor(pageRange / 2);

  let startPage = page - half;
  let endPage = page + half;

  if (startPage < 1) {
    startPage = 1;
    endPage = Math.min(pageRange, data?.totalPages);
  }

  if (endPage > data?.totalPages) {
    endPage = data?.totalPages;
    startPage = Math.max(1, data?.totalPages - pageRange + 1);
  }

  const handlePage = (page: number) => {
    setPage(page);
    cb()
  };

  return (
    <>
      <Label className="w-full text-sm items-center justify-center sm:justify-start">
        รายการ {data?.start} - {data?.end} จาก {data?.total} รายการ
      </Label>
      <Pagination className="w-full sm:w-auto sm:ml-auto text-sm">
        <PaginationContent>
          {page > 1 && (
            <>
              <PaginationItem>
                <PaginationFirst onClick={() => handlePage(1)} />
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    if (page <= 1) return;
                    handlePage(page - 1);
                  }}
                />
              </PaginationItem>
            </>
          )}

          {Array.from(
            { length: endPage - startPage + 1 },
            (_, index) => startPage + index
          ).map((p) => (
            <PaginationItem key={p}>
              <PaginationLink onClick={() => handlePage(p)}>
                {p === page ? <Button size="sm">{p}</Button> : p}
              </PaginationLink>
            </PaginationItem>
          ))}

          {page != data?.totalPages && data?.totalPages !== 0 && (
            <>
              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    if (page >= data?.totalPages) return;
                    handlePage(page + 1);
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLast onClick={() => handlePage(data?.totalPages)} />
              </PaginationItem>
            </>
          )}
        </PaginationContent>
      </Pagination>
    </>
  );
}
