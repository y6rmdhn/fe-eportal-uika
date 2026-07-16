import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginationDatatable from "./PaginationTable";
import type { ReactNode } from "react";
import { LIMIT_LISTS } from "@/constants/DataTableConstant";
import { Loader2 } from "lucide-react"; // <-- Import icon loading

const DataTable = ({
  header,
  data,
  isLoading,
  totalPages,
  currentPage,
  currentLimit,
  onChangePage,
  onChangeLimit,
}: {
  header: string[];
  data: (string | ReactNode)[][];
  isLoading?: boolean;
  totalPages: number;
  currentPage: number;
  currentLimit: number;
  onChangePage: (page: number) => void;
  onChangeLimit: (limit: number) => void;
}) => {
  return (
    <div className="w-full flex flex-col gap-5 p-2">
      {/* ── CARD TABEL ── */}
      <Card className="p-0 border-none shadow-none rounded-xl overflow-hidden bg-white">
        <Table className="w-full">
          <TableHeader className="bg-gray-50/80 border-b border-gray-100 sticky top-0 z-10">
            <TableRow className="hover:bg-transparent">
              {header.map((column) => (
                <TableHead
                  key={`th-${column}`}
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-normal"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading State */}
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={header.length} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-emerald-600 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="text-sm font-medium text-gray-500">
                      Memuat data...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.length > 0 ? (
              /* Data Rows */
              data.map((row, rowIndex) => (
                <TableRow
                  key={`tr-${rowIndex}`}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                >
                  {row.map((column, columnIndex) => (
                    <TableCell
                      key={`tc-${rowIndex}-${columnIndex}`}
                      className="px-6 py-3.5 align-middle whitespace-normal break-words"
                    >
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              /* Empty State */
              <TableRow>
                <TableCell colSpan={header.length} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-1">
                    <span className="text-lg font-semibold text-gray-700">
                      Tidak ada data
                    </span>
                    <span className="text-sm">
                      Data yang Anda cari tidak ditemukan.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ── FOOTER: LIMIT & PAGINATION ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-2 border-t border-gray-100">
        {/* Selector Limit */}
        <div className="flex items-center gap-3">
          <Label className="text-sm font-semibold text-gray-500">
            Tampilkan:
          </Label>
          <Select
            value={currentLimit.toString()}
            onValueChange={(value) => {
              onChangeLimit(Number(value));
            }}
          >
            <SelectTrigger className="w-[100px] h-9 rounded-lg border-gray-200 bg-gray-50 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-sm">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-lg">
              <SelectGroup>
                <SelectLabel className="text-xs text-gray-400 font-bold uppercase tracking-wider px-2 py-1.5">
                  Limit Baris
                </SelectLabel>
                {LIMIT_LISTS.map((limit) => (
                  <SelectItem
                    key={limit}
                    value={limit.toString()}
                    className="font-medium cursor-pointer focus:bg-emerald-50 focus:text-emerald-700"
                  >
                    {limit} Baris
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end">
            <PaginationDatatable
              currentPage={currentPage}
              onChangePage={onChangePage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
