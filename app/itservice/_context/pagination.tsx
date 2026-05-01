"use client";
import { createContext, useContext, useState } from "react";

type paginationType = {
  page: number;
  limit: number;
  search: string;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
};

const PaginationContext = createContext<paginationType | undefined>(undefined);

export function PaginationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  return (
    <PaginationContext.Provider
      value={{ page, limit, search, setPage, setLimit, setSearch }}
    >
      {children}
    </PaginationContext.Provider>
  );
}

export function usePagination(): paginationType {
  const ctx = useContext(PaginationContext);
  if (!ctx) {
    throw new Error("usePagination must be used within PaginationProvider");
  }
  return ctx;
}
