import { forwardRef } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./ui/table";

const PrintComponent = forwardRef(({ format, title, dateRange, data }, ref) => {
  return (
    <div
      ref={ref}
      className={`print-container ${
        format === "A4" ? "print-a4" : "print-pos"
      }`}
    >
      {format === "A4" && (
        <div>
          <h2>{title}</h2>
          <p>Invoice for {data.name}</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p>Total: {data.total.toFixed(2)}</p>
        </div>
      )}
      {format === "POS" && (
        <div>
          <h3>Receipt</h3>
          <p>Order ID: {data.orderId}</p>
          {data.items.map((item, index) => (
            <div key={index}>
              <p>
                {item.name} x {item.quantity}
              </p>
              <p>{item.price.toFixed(2)}</p>
            </div>
          ))}
          <p>Total: {data.total.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
});

export default PrintComponent;
