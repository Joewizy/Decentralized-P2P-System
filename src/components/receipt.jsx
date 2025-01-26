
import { Button } from "./ui/button";
import { toast } from "sonner";
import { updateReceiptPrintStatus } from "@/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

function CartReceipt({ order, printLater, printSuccess }) {
  
  const { items, amount, paymentType, customerID, customerName } = order.newOrder.order;
  const receiptId = order.receiptId;
  const date = order.date;

  const handleElectronPrint = async () => {
    try {
      const result = await window.electronAPI.print();

      if (result.success) {
        console.log("Printing started successfully");
        updateReceiptStatus();
      } else {
        console.error("Printing failed:", result.message);
      }
    } catch (error) {
      console.error("Error during printing:", error);
    }
  };

  const updateReceiptStatus = async () => {
    const response = await updateReceiptPrintStatus(receiptId);

    if (response) {
      toast("Receipt printed");
      printSuccess();
    }
  };

  return (
    <div>
      <div className="p-4 bg-white rounded-md shadow-md no-print">
        <h2 className="mt-3">Receipt</h2>
        <div className="mt-3">
          <div className="grid grid-cols-2">
            <p>
              <strong>Order ID:</strong> {receiptId}
            </p>
            <p>
              <strong>Customer ID:</strong> {customerID}
            </p>
            <p>
              <strong>Customer Name:</strong> {customerName}
            </p>
            <p>
              <strong>Date:</strong> {new Date(date).toLocaleString()}
            </p>
          </div>

          <p>
            <strong>Payment Type:</strong> {paymentType}
          </p>
          <div className="mt-3 border-t pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>x{item.quantity}</TableCell>
                    <TableCell>{item.currentPrice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between mt-4 font-bold">
            <span>Total:</span>
            <span>{amount} CFA</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={handleElectronPrint} className="w-full">
            Print
          </Button>
          <Button onClick={printLater} className="bg-green-500 w-full">
            Print Later
          </Button>
        </div>
      </div>
      <div className="hidden show-print">
        <h2 className="text-xl">ASHANTI AND BROS COMMERCIAL ENTERPRISE</h2>
        <br />
        <div className="grid grid-cols-2">
          <div className="gap-3">
            <p>
              <strong>Order ID:</strong> {receiptId}
            </p>
            <p>
              <strong>Customer ID:</strong> {customerID}
            </p>
            <p>
              <strong>Customer Name:</strong> {customerName}
            </p>
          </div>
          <div className="gap-3">
            <p>
              <strong>Company Address:</strong> Commercial Avenue, Kumba,
              Cameroon
            </p>
            <p>
              <strong>Company Number:</strong> 677959910/676192924
            </p>
            <p>
              <strong>Date:</strong> {new Date(date).toLocaleString()}
            </p>
          </div>
        </div>

        <p>
          <strong>Payment Type:</strong> {paymentType}
        </p>
        <div className="mt-3 border-t pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>x{item.quantity}</TableCell>
                  <TableCell>{item.currentPrice}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between mt-4 font-bold">
          <span>Total:</span>
          <span>{amount} CFA</span>
        </div>
      </div>
    </div>
  );
}

export default CartReceipt;
