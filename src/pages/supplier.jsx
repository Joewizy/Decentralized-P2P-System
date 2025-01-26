import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { addSupplier, getSuppliers } from "@/db";
import DataTable from "@/components/data-table";
import Form from "@/components/form";
import HandleManageLoan from "@/components/loan";
import { addLoanFormControls, addSupplierFormControls } from "@/config";

const initialFormData = {
  name: "",
  phoneno: "",
  address: "",
};

function Suppliers() {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [checked, setChecked] = useState(false);
  const [openAddProducts, setOpenAddProducts] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const [openLoan, setOpenLoan] = useState(false);
  const [loanData, setLoanData] = useState(0);

  // Fetching suppliers data
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const result = await getSuppliers();
        setData(result);
        setAllData(result);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  // Columns for DataTable
  const columns = useMemo(
    () => [
      { id: "id", header: "ID", accessorKey: "_id" },
      { id: "name", header: "Name", accessorKey: "name" },
      { id: "phone", header: "Phone Number", accessorKey: "phoneno" },
      { id: "address", header: "Address", accessorKey: "address" },
      { id: "date", header: "Date", accessorKey: "timestamp" },
      { id: "loan", header: "Loan", accessorKey: "loan" },
    ],
    []
  );

  const handleCheck = () => {

    setChecked((prevChecked) => {
      const newChecked = !prevChecked;
      if (newChecked) {
        // Filter suppliers with loan > 0
        const filteredData = allData.filter((supplier) => supplier.loan > 0);
        setData(filteredData);
      } else {
        // Show all suppliers when unchecked
        setData(allData);
      }
      return newChecked;
    });
  };

  // Add supplier
  function onSubmit(event) {
    event.preventDefault();
    const response = addSupplier(formData);

    if (response) {
      toast("Supplier added");
      setFormData(initialFormData);
      setOpenAddProducts(false);
    }
  }

  function onSubmitLoan(event) {
    event.preventDefault();
    const response = addCustomer(formData);

    if (response) {
      toast("Loan added");
      setLoanData(0);
      setOpenLoan(false);
    }
  }

  // Check if form is valid
  function isFormValid() {
    return Object.values(formData).every((value) => value !== "");
  }

  // Row actions for DataTable
  const rowActions = (row) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleManageLoan(row.original)}>
          Manage
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleManageOrders(row.original)}>
          Orders
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const [isManageLoanOpen, setIsManageLoanOpen] = useState(false);
  const [isManageOrdersOpen, setIsManageOrdersOpen] = useState(false);
  const [dataToManage, setDataToManage] = useState({});

  const handleManageLoan = (info) => {
    setIsManageLoanOpen(true);
    setIsManageOrdersOpen(false);
    setDataToManage(info);
  };

  const handleManageOrders = (info) => {
    setIsManageLoanOpen(true);
    setIsManageOrdersOpen(true);
    setDataToManage(info);
  };

  const onDone = () => {
    setIsManageLoanOpen(false);
    setIsManageOrdersOpen(false);
    setDataToManage({});
  };

  return (
    <div>
      {isManageLoanOpen ? (
        <HandleManageLoan
          onDone={onDone}
          type="supplier"
          userData={dataToManage}
          manageOrder={isManageOrdersOpen}
        />
      ) : (
        <div>
          <div className="mb-5 flex justify-end w-full no-print gap-4">
            <Button onClick={() => setOpenAddProducts(true)}>
              Register Supplier
            </Button>
            <Button onClick={() => setOpenLoan(true)} className="bg-gray-600">
              Loan <Plus/>
            </Button>
          </div>
          <div className="items-top flex space-x-2 no-print">
            <Checkbox checked={checked} onClick={() => handleCheck()} />
            <Label>Show Suppliers we owe</Label>
          </div>
          <DataTable
            columns={columns}
            data={data}
            title="Suppliers"
            actions={rowActions}
          />
          <Sheet
            open={openAddProducts}
            onOpenChange={() => {
              setOpenAddProducts(false);
              setFormData(initialFormData);
            }}
          >
            <SheetContent side="right" className="overflow-auto">
              <SheetHeader>
                <SheetTitle>Register Supplier</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <Form
                  onSubmit={onSubmit}
                  formData={formData}
                  setFormData={setFormData}
                  isBtnDisabled={!isFormValid()}
                  formControls={addSupplierFormControls}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Loan Sheet*/}
          <Sheet
            open={openLoan}
            onOpenChange={() => {
              setOpenLoan(false);
              setLoanData(0);
            }}
          >
            <SheetContent side="right" className="overflow-auto">
              <SheetHeader>
                <SheetTitle>Add amount</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <Form
                  onSubmit={onSubmitLoan}
                  formData={loanData}
                  setFormData={setLoanData}
                  isBtnDisabled={!isFormValid()}
                  formControls={addLoanFormControls}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}

export default Suppliers;
