import { useState } from "react";
import { Input } from "./ui/input";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./ui/table";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";

function GlobalFilter({ globalFilter, setGlobalFilter }) {
  return (
    <Input
      type="text"
      value={globalFilter || ""}
      onChange={(e) => setGlobalFilter(e.target.value)}
      placeholder="Search..."
    />
  );
}

const dateRangeFilter = (row, columnId, filterValue) => {
  if (!filterValue?.from && !filterValue.to) return true;

  const rowDate = new Date(row.getValue(columnId));
  const { from, to } = filterValue;

  if (from && to) {
    return (
      rowDate >= startOfDay(new Date(from)) && rowDate <= endOfDay(new Date(to))
    );
  }
  if (from) {
    return rowDate >= startOfDay(new Date(from));
  }
  if (to) {
    return rowDate <= endOfDay(new Date(to));
  }

  return true;
};

function DateRangeFilter({ table }) {
  const [range, setRange] = useState({ from: null, to: null });

  const handleDateChange = (dateRange) => {
    setRange(dateRange);

    const from = dateRange?.from ? new Date(dateRange?.from) : null;
    const to = dateRange?.to ? new Date(dateRange?.to) : null;

    table.setColumnFilters([
      {
        id: "date",
        value: { from, to },
      },
    ]);
  };

  const clearFilter = () => {
    setRange({ from: null, to: null });
    table.setColumnFilters((prev) =>
      prev.filter((filter) => filter.id !== "date")
    );
  };

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className="w-[300px] justify-start text-left font-normal"
          >
            <CalendarIcon />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "LLL dd, y")} -{" "}
                  {format(range.to, "LLL dd, y")}
                </>
              ) : (
                format(range.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={range}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Button variant="outline" onClick={clearFilter}>
        Reset Date
      </Button>
    </div>
  );
}

function DataTable({ columns, data, actions, title }) {
  const handleElectronPrint = async () => {
    try {
      const result = await window.electronAPI.print();

      if (result.success) {
        console.log("Printing started successfully");
      } else {
        console.error("Printing failed:", result.message);
      }
    } catch (error) {
      console.error("Error during printing:", error);
    }
  };

  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      pagination,
      columnFilters,
    },
    filterFns: {
      dateRange: dateRangeFilter,
    },
  });

  return (
    <div>
      <div className="no-print">
        <div className="flex flex-row gap-5 no-print">
          <GlobalFilter
            globalFilter={table.getState().globalFilter}
            setGlobalFilter={table.setGlobalFilter}
          />

          <DateRangeFilter table={table} />
          <Button variant="outline" onClick={handleElectronPrint}>
            Print
          </Button>
        </div>

        <div>
          <Table className="mt-4 border">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id} className="px-4 py-2 border">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableCell>
                  ))}
                  {actions ? <TableCell></TableCell> : null}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-2 border">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                    {actions ? <TableCell>{actions?.(row)}</TableCell> : null}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 no-print">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </Button>
          <span className="italic">
            {pagination.pageIndex + 1} {"of"} {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </Button>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 15, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} rows per page
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Hidden Div for Printing All Data */}
      <div className="hidden show-print">
        <div className="font-bold text-2xl">{title}</div>
        <Table className="mt-4 border">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} className="px-4 py-2 border">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* Use all rows from table.getRowModel().rows (ignoring page size) */}
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => {
                    const cellValue = row.getValue(column.id); // Access cell value
                    return (
                      <TableCell key={column.id} className="px-4 py-2 border">
                        {cellValue}{" "}
                        {/* You can use flexRender for custom rendering */}
                      </TableCell>
                    );
                  })}
                  {actions ? <TableCell>{actions(row)}</TableCell> : null}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DataTable;
