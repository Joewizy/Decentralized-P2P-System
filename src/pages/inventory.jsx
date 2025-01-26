import DataTable from "@/components/data-table";
import Form from "@/components/form";
import ManageInventory from "@/components/manageInventory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { addInventoryFormControls } from "@/config";
import {
  addInventory,
  deleteInventoryItem,
  getInventories,
  getSuppliers,
} from "@/db";
import { format } from "date-fns";
import { ArrowRight, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const initialFormData = {
  title: "",
  costPrice: "",
  minPrice: "",
  maxPrice: "",
  totalStock: "",
};

function Inventory() {
  const [supplierList, setsupplierList] = useState([]);
  const [checked, setChecked] = useState(false);
  const [selectedSupplier, setSetselectedSupplier] = useState(null);
  const navigate = useNavigate();
  const [data, setData] = useState([{}]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(null);

  const [isManageOpen, setIsManageOpen] = useState(false);
  const [currentInventoryItem, setCurrentInventoryItem] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const result = await getInventories();
        setData(result);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchInventory();
  }, [isManageOpen, navigate, toast]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const result = await getSuppliers();
        setsupplierList(result);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };

    fetchSuppliers();
  }, []);

  const filteredSuppliers = supplierList.filter((supplier) =>
    `${supplier.name} ${supplier.phoneno}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const columns = useMemo(
    () => [
      {
        id: "_id",
        header: "ID",
        accessorKey: "_id",
        cell: (info) => info.getValue(),
      },
      {
        id: "title",
        header: "Name",
        accessorKey: "title",
        cell: (info) => info.getValue(),
      },
      {
        id: "stock",
        header: "Stock",
        accessorKey: "totalStock",
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
        id: "costPrice",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Cost Price (CFA)
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        accessorKey: "costPrice",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        id: "maxPrice",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Max Price (CFA)
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        accessorKey: "maxPrice",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        id: "minPrice",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Min Price (CFA)
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        accessorKey: "minPrice",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        id: "supplier",
        header: "Supplier",
        accessorKey: "supplier",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
    ],
    []
  );

  const rowActions = (row) => {
    return (
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleManageInventoryItem(row.original)}
            >
              Manage
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenDialog(row.original._id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog
          open={openDialog === row.original._id}
          onOpenChange={() => setOpenDialog(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to delete {row.original.title} with{" "}
                {row.original.totalStock} total stock.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpenDialog(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(row.original._id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  function handleManageInventoryItem(item) {
    if (currentInventoryItem === item) return;
    setCurrentInventoryItem(item);
    setIsManageOpen(true);
  }

  function handleManageInventoryItemReturn() {
    setCurrentInventoryItem([]);
    setIsManageOpen(false);
  }

  const handleDelete = async (item) => {
    try {
      const response = await deleteInventoryItem(item);

      if (response) {
        toast("Item deleted successfully");
        return;
      }

      return;
    } catch (error) {
      console.error(error);
    }
  };

  const [openAddProducts, setOpenAddProducts] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  function onSubmit(event) {
    event.preventDefault();

    if (checked && selectedSupplier !== null) {
      const response = addInventory(formData, selectedSupplier);

      if (response) {
        toast("Data added");
        setFormData(initialFormData);
        setOpenAddProducts(false);
      }
    } else {
      const response = addInventory(formData);

      if (response) {
        toast("Data added");
        setFormData(initialFormData);
        setOpenAddProducts(false);
      }
    }
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  const handleCheck = () => {
    setChecked(!checked);
    setSetselectedSupplier(null);
  };

  return (
    <div>
      {isManageOpen ? (
        <ManageInventory
          item={currentInventoryItem}
          onReturn={handleManageInventoryItemReturn}
        />
      ) : (
        <Fragment>
          <div className="mb-5 flex justify-end w-full no-print">
            <div className="flex gap-6">
              <Button onClick={() => setOpenAddProducts(true)}>
                Add New Product
              </Button>
              <Button
                className="bg-blue-800 hover:bg-blue-950"
                onClick={() => navigate("/bulk")}
              >
                Add New Products - Bulk <ArrowRight />
              </Button>
            </div>
          </div>
          <div>
            <DataTable
              columns={columns}
              data={data}
              title="Inventory"
              actions={rowActions}
            />
          </div>
          <Sheet
            open={openAddProducts}
            onOpenChange={() => {
              setOpenAddProducts(false);
              setFormData(initialFormData);
              setSetselectedSupplier(null);
            }}
          >
            <SheetContent side="right" className="overflow-auto">
              <SheetHeader>
                <SheetTitle>Inventory</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <div className="mt-2 mb-3 p-1">
                  <Checkbox value={checked} onClick={() => handleCheck()} />
                  <span className="ml-4">Supplier?</span>
                  <Select
                    disabled={!checked}
                    value={selectedSupplier}
                    onValueChange={setSetselectedSupplier}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Search suppliers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                      {filteredSuppliers.map((supplier) => (
                        <SelectItem key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Form
                  onSubmit={onSubmit}
                  formData={formData}
                  setFormData={setFormData}
                  formControls={addInventoryFormControls}
                  isBtnDisabled={!isFormValid()}
                />
              </div>
            </SheetContent>
          </Sheet>
        </Fragment>
      )}
    </div>
  );
}

export default Inventory;
