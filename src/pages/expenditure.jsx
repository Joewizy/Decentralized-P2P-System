import DataTable from "@/components/data-table";
import Form from "@/components/form";
import DateRangeCalculator from "@/components/PriceDateRange";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { addExpenditureFormControls } from "@/config";
import { addExpenditure, getExpenditures } from "@/db";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const initialFormData = {
  reason: "",
  name: "",
  amount: "",
};

function Expenditure() {
  const [data, setData] = useState([{}]);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const fetchExpenditures = async () => {
      try {
        const result = await getExpenditures();
        setData(result);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };

    fetchExpenditures();
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "reason",
        header: "Reason",
        accessorKey: "reason",
        cell: (info) => info.getValue(),
      },
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        cell: (info) => info.getValue(),
      },
      {
        id: "amount",
        header: "Amount",
        accessorKey: "amount",
        cell: (info) => (
          <span className="text-red-600">-{info.getValue()}</span>
        ),
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

  const [openAddProducts, setOpenAddProducts] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  function onSubmit(event) {
    event.preventDefault();

    const response = addExpenditure(formData);

    if (response) {
      toast("Expenditure added");
      setFormData(initialFormData);
      setOpenAddProducts(false);
    }
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  return (
    <Fragment>
      <div className="mb-5 flex justify-end w-full no-print">
        <Button onClick={() => setOpenAddProducts(true)}>
          Record Expenditure
        </Button>
      </div>
      <div className="no-print">
        <DateRangeCalculator
          data={data}
          valueField="amount"
          onTotalCalculated={(total) => setTotalSales(total)}
        />
        <p className="mt-4">Total Expenditure: CAF {totalSales}</p>
      </div>
      <div>
        <DataTable columns={columns} data={data} title="Expenditures" />
      </div>
      <Sheet
        open={openAddProducts}
        onOpenChange={() => {
          setOpenAddProducts(false);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Inventory</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <Form
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              formControls={addExpenditureFormControls}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default Expenditure;
