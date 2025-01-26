import { useEffect, useMemo, useState } from "react";
import Form from "./form";
import {
  addCustomerFormControls,
  addSupplierFormControls,
  addSupplierLoanFormControls,
} from "@/config";
import DataTable from "./data-table";
import {
  addCustomerLoanData,
  addSupplieLoanData,
  getCustomerLoanData,
  getCustomerOrderData,
  getSupplierLoanData,
  getSupplierStockData,
} from "@/db";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRightCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { toast } from "sonner";

function HandleManageLoan({ type, userData, onDone, manageOrder }) {
  const { _id, name, phoneno, loan, address } = userData;

  const [formData, setFormData] = useState({
    name: name,
    phoneno: phoneno,
    address: address,
  });
  const [loanPay, setLoanPay] = useState(0);
  const [openPayLoan, setOpenPayLoan] = useState(false);

  const [data, setData] = useState([]);
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        if (type === "supplier") {
          const result = await getSupplierLoanData();
          const result2 = await getSupplierStockData();
          setData(result);
          setOrderData(result2);
        } else if (type === "customer") {
          const result = await getCustomerLoanData();
          const result2 = await getCustomerOrderData();
          setData(result);
          setOrderData(result2);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchLoanData();
  }, []);

  const columns = useMemo(
    () => [
      { id: "id", header: "ID", accessorKey: "_id" },
      { id: "amount", header: "Amount", accessorKey: "amount" },
      { id: "paymemtType", header: "Payment Type", accessorKey: "paymentType" },
      { id: "date", header: "Date", accessorKey: "timestamp" },
    ],
    []
  );

  const orderCustomerColumns = useMemo(
    () => [
      { id: "id", header: "ID", accessorKey: "_id" },
      { id: "items", header: "Items", accessorKey: "items" },
      { id: "amount", header: "Amount", accessorKey: "amount" },
      { id: "paymemtType", header: "Payment Type", accessorKey: "paymentType" },
      { id: "date", header: "Date", accessorKey: "timestamp" },
    ],
    []
  );

  const orderSupplierColumns = useMemo(
    () => [
      { id: "id", header: "ID", accessorKey: "_id" },
      { id: "items", header: "Items", accessorKey: "items" },
      { id: "amount", header: "Amount", accessorKey: "amount" },
      { id: "paymemtType", header: "Payment Type", accessorKey: "paymentType" },
      { id: "date", header: "Date", accessorKey: "timestamp" },
    ],
    []
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      if (type === "supplier") {
        const response = await updateInventoryItem(_id, formData);

        if (response) {
          toast("Data updated");
          return;
        }
      } else if (type === "customer") {
        const response = await updateInventoryItem(_id, formData);

        if (response) {
          toast("Data updated");
          return;
        }
      }

      toast("Error updating");
      return;
    } catch (error) {
      console.error(error);
    }
  };

  function isFormValid() {
    return Object.values(formData).every((value) => value !== "");
  }

  const handlePayLoan = () => {
    if (loan <= 0) {
      alert("No outstanding balance");
    } else {
      setOpenPayLoan(true);
    }
  };

  const payLoanNow = async (e) => {
    e.preventDefault();

    const payLoanData = {
      amount: payLoan,
      paymentType: "Cash",
    };

    try {
      if (payLoanData.amount < 0 || payLoanData.amount > loan) {
        toast("Payment amount cannot be more than outstanding loan");
        return;
      }

      if (type === "supplier") {
        const response = await addSupplieLoanData(_id, payLoanData);
        if (response) {
          toast("Loan amount paid");
          return;
        }
      } else if (type === "customer") {
        const response = await addCustomerLoanData(_id, payLoanData);
        if (response) {
          toast("Loan amount paid");
          return;
        }
      }
    } catch (error) {
      console.error("Error during loan payment:", error);
      toast("An error occurred while processing the loan payment.");
    }
  };

  return (
    <div>
      <div className="mb-4 no-print">
        <Button onClick={onDone}>
          <ArrowLeft /> <span>Back</span>
        </Button>
      </div>

      {type === "supplier" ? (
        <div>
          {" "}
          {manageOrder ? (
            <div>
              <div className="no-print">
                <div className="flex flex-col gap-4">
                  <Label>Name: <span>{name}</span></Label>
                  <Label>Phono Number: <span>{phoneno}</span></Label>
                  <Label>Address: <span>{address}</span></Label>
                </div>
              </div>
              <div className="mt-2">
                <DataTable
                  columns={orderSupplierColumns}
                  data={data}
                  title={`${name} Stock History`}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="no-print">
                <div>
                  <Form
                    onSubmit={onSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    isBtnDisabled={!isFormValid()}
                    formControls={addSupplierFormControls}
                    buttonText="Update"
                  />
                </div>
                <div className="p-4 items-center flex">
                  <Label>
                    Oustanding Loan: {""}CAF{loan}
                  </Label>
                  <span
                    className={`flex flex-row items-center ml-6 ${
                      loan > 0 ? "hover:text-green-600" : "hover:text-red-600"
                    }`}
                    onClick={() => handlePayLoan()}
                  >
                    <Label>
                      Pay <ArrowRightCircle />
                    </Label>
                  </span>
                </div>

                <Sheet
                  open={openPayLoan}
                  onOpenChange={() => {
                    setOpenPayLoan(false);
                    setLoanPay(0);
                  }}
                >
                  <SheetContent side="right" className="overflow-auto">
                    <SheetHeader>
                      <SheetTitle>Pay</SheetTitle>
                    </SheetHeader>
                    <div className="py-6">
                      <Input
                        type="number"
                        value={loanPay}
                        onChange={(e) => setLoanPay(e.target.value)}
                      />
                      <Button onClick={() => payLoanNow()}>Pay</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="mt-2">
                <DataTable
                  columns={columns}
                  data={data}
                  title={`${name} Loan History`}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="no-print">
            <div>
              <Form
                onSubmit={onSubmit}
                formData={formData}
                setFormData={setFormData}
                isBtnDisabled={!isFormValid()}
                formControls={addCustomerFormControls}
                buttonText="Update"
              />
            </div>
            <div className="p-4 items-center flex">
              <Label>
                Oustanding Loan: {""}CAF{loan}
              </Label>
              <span
                className={`flex flex-row items-center ml-6 ${
                  loan > 0 ? "hover:text-green-600" : "hover:text-red-600"
                }`}
                onClick={() => handlePayLoan()}
              >
                <Label>
                  Pay <ArrowRightCircle />
                </Label>
              </span>
            </div>

            <Sheet
              open={openPayLoan}
              onOpenChange={() => {
                setOpenPayLoan(false);
                setLoanPay(0);
              }}
            >
              <SheetContent side="right" className="overflow-auto">
                <SheetHeader>
                  <SheetTitle>Pay</SheetTitle>
                </SheetHeader>
                <div className="py-6">
                  <Input
                    type="number"
                    value={loanPay}
                    onChange={(e) => setLoanPay(e.target.value)}
                  />
                  <Button onClick={() => payLoanNow()}>Pay</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="mt-2">
            <DataTable
              columns={columns}
              data={data}
              title={`${name} Loan History`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default HandleManageLoan;
