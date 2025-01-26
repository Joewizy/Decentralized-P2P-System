import DataTable from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import { getLogs } from "@/db";

function Logs() {
  const [data, setData] = useState([{}]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const result = await getLogs();
        setData(result);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "_id",
        header: "ID",
        accessorKey: "_id",
        cell: (info) => info.getValue(),
      },
      {
        id: "category",
        header: "Category",
        accessorKey: "category",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        id: "activity",
        header: "Activity",
        accessorKey: "activity",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        id: "message",
        header: "Message",
        accessorKey: "message",
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
    ],
    []
  );

  return (
    <Fragment>
      <div>
        <DataTable columns={columns} data={data} title="Logs" />
      </div>
    </Fragment>
  );
}

export default Logs;
