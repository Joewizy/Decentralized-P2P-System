import DataTable from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import { getSales } from "@/db";
import DateRangeCalculator from "@/components/PriceDateRange";

function Sales() {
  const [data, setData] = useState([{}]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const result = await getSales();
        setData(result);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };

    fetchSales();
  }, []);

  const [totalSales, setTotalSales] = useState(0);
  const [dateRangeForPrice, setDateRangeForPrice] = useState();
  

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "_id",
        cell: (info) => info.getValue(),
      },
      {
        id: "items",
        header: "Items",
        accessorKey: "items.length",
        cell: (info) => info.getValue(),
      },
      {
        id: "paymentType",
        header: "Payment Type",
        accessorKey: "paymentType",
        cell: (info) => info.getValue(),
        enableSorting: true,
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
              Price (CFA)
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        accessorKey: "amount",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
    ],
    []
  );

  return (
    <Fragment>
      <div className="no-print">
        <DateRangeCalculator
          data={data}
          valueField="amount"
          onTotalCalculated={(total) =>
            setTotalSales(total)
          }
          forDateRange={(range) => console.log(range)}
        />
        <p className="mt-4">Total Sales: CAF {totalSales} {dateRangeForPrice}</p>
      </div>
      <div>
        <DataTable columns={columns} data={data} title="Sales" />
      </div>
    </Fragment>
  );
}

export default Sales;
