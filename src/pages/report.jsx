import DataTable from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import { getReports } from "@/db";
import DateRangeCalculator from "@/components/PriceDateRange";

function Reports() {
  const [data, setData] = useState([{}]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const result = await getReports();
        setData(result);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };

    fetchReports();
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "_id",
        cell: (info) => info.getValue(),
      },
      {
        id: "type",
        header: "Category",
        accessorKey: "type",
        cell: (info) => info.getValue(),
      },
      {
        id: "amount",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Amount (CFA)
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        accessorKey: "amount",
        cell: (info) => {
          const type = info.row.original.type;
          const amount = Number(info.getValue());
          const color = type === "sales" ? "text-green-500" : "text-red-500";

          return <span className={color}>{amount.toLocaleString()} CFA</span>;
        },
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
    ],
    []
  );

  const [totalSales, setTotalSales] = useState(0);

  return (
    <Fragment>
      <div className="no-print">
        <DateRangeCalculator
          data={data}
          valueField="amount"
          onTotalCalculated={(total) =>
            setTotalSales(total)
          }
        />
        <p className="mt-4">
          {totalSales >= 0
            ? `Net Gain: +${totalSales.toLocaleString()} CFA`
            : `Net Loss: ${totalSales.toLocaleString()} CFA`}
        </p>
      </div>
      <div>
        <DataTable columns={columns} data={data} title="Reports" />
      </div>
    </Fragment>
  );
}

export default Reports;
