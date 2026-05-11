import { useState } from "react";
import useDebounce from "../Debounce/useDebounce";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constants/DataTableConstant";

export default function useDataTable() {
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [currentLimit, setCurrentLimit] = useState(DEFAULT_LIMIT);
  const [currentSearch, setCurrentSearch] = useState("");
  const [currentFilter, setCurrentFilter] = useState("");
  const debounce = useDebounce();

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const handleChangeLimit = (limit: number) => {
    setCurrentLimit(limit);
    setCurrentPage(DEFAULT_PAGE);
  };

  const handleChangeSearch = (search: string) => {
    debounce(() => {
      setCurrentSearch(search);
      setCurrentPage(DEFAULT_PAGE);
    }, 500);
  };

  const handleChangeFilter = (filter: string) => {
    setCurrentFilter(filter);
    setCurrentSearch("");
    setCurrentPage(DEFAULT_PAGE);
  };

  return {
    currentPage,
    handleChangePage,
    currentLimit,
    handleChangeLimit,
    currentSearch,
    handleChangeSearch,
    currentFilter,
    handleChangeFilter,
  };
}
