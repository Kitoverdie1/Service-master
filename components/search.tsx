import { usePagination } from "@/app/itservice/_context/pagination";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon, X } from "lucide-react";

export default function Search({cb}: {cb: () => void}) {
  const [value, setValue] = useState<string>("");
  const { setPage, setSearch } = usePagination();

  const handleSearch = useDebouncedCallback((e) => {
    setPage(1);
    setSearch(e);
    cb()
  }, 800);

  const handleClear = async () => {
    setValue("");
    setPage(1);
    setSearch("");
    cb()
  };

  return (
    <div className="flex justify-end mb-4">
      <InputGroup className="w-50">
        <InputGroupInput
          placeholder="ค้นหา..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            handleSearch(e.target.value);
          }}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={handleClear}>
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
