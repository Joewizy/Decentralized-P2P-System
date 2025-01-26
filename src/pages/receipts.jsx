import DataTable from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getReceipts } from "@/db";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CartReceipt from "@/components/receipt";
import RePrintReceipt from "@/components/printReceipt";

function Receipts() {
  const [data, setData] = useState([{}]);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [checked, setChecked] = useState(false);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const result = await getReceipts();
        setData(result);
        setAllData(result);
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
    };

    fetchReceipts();
  }, [isReceiptOpen, orderReceipt]);

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "Receipt ID",
        accessorKey: "_id",
        cell: (info) => info.getValue(),
      },
      {
        id: "salesid",
        header: "Sales ID",
        accessorKey: "SalesID",
        cell: (info) => info.getValue(),
      },
      {
        id: "date",
        header: "Date",
        accessorKey: "timestamp",
        cell: (info) => info.getValue(),
        enableSorting: true,
        filterFn: "dateRange",
      },
      {
        id: "price",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Price
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        accessorKey: "order.amount",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
    ],
    []
  );

  const rowActions = (row) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleRePrint(row.original)}>
            Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const handleRePrint = (orderData) => {
    setOrderReceipt(orderData);
    setIsReceiptOpen(true);
  };

  const handlePrintLater = () => {
    setOrderReceipt(null);
    setIsReceiptOpen(false);
  };

  const handleCheck = () => {
    setChecked((prevChecked) => {
      const newChecked = !prevChecked;
      if (newChecked) {
        // Filter customers with loan > 0
        const filteredData = allData.filter(
          (receipt) => receipt.printed === false
        );
        setData(filteredData);
      } else {
        // Show all customers when unchecked
        setData(allData);
      }
      return newChecked;
    });
  };

  return (
    <div>
      {isReceiptOpen ? (
        <RePrintReceipt order={orderReceipt} printLater={handlePrintLater} />
      ) : (
        <Fragment>
          <div className="items-top flex space-x-2 no-print">
            <Checkbox checked={checked} onClick={() => handleCheck()} />
            <Label>Show unprinted receipts only</Label>
          </div>
          <div>
            <DataTable
              columns={columns}
              data={data}
              title="Receipts"
              actions={rowActions}
            />
          </div>
        </Fragment>
      )}
    </div>
  );
}

export default Receipts;
