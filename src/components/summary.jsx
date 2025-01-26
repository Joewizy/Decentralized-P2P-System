import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getCustomers } from "@/db";
import { Checkbox } from "./ui/checkbox";

function CartSummary({ cart, onSubmit, onEdit }) {
  const [checked, setChecked] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCheck = () => {
    setChecked(!checked);
    setSelectedCustomer(null);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const result = await getCustomers();
        setCustomers(result);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.phoneno}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getTotalPrice = useMemo(() => {
    return cart.items.reduce(
      (acc, item) => acc + item.currentPrice * item.quantity,
      0
    );
  }, [cart]);

  const handleCustomerSelection = () => {
    return selectedCustomer !== null ? false : true;
  };

  const handleSubmitCart = () => {
    onSubmit(selectedCustomer);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <div>
        <h3>
          <Checkbox value={checked} onClick={() => handleCheck()} />
          <i className="ml-4">Add Customer to Order</i>
        </h3>

        <Select
          disabled={!checked}
          value={selectedCustomer?.id || ""}
          onValueChange={(value) => {
            const selected = customers.find(
              (customer) => customer._id === value
            );
            setSelectedCustomer({
              id: selected?._id,
              name: selected?.name,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pick a customer" />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            {filteredCustomers.map((customer) => (
              <SelectItem key={customer._id} value={customer._id}>
                {customer.name} - {customer.phoneno}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <h2 className="text-lg font-bold">Order Summary</h2>
      <div className="mt-3">
        <div className="flex justify-between border-b py-2">
          <span></span>
          <span>Actual Price</span>
          <i>Given Price</i>
        </div>
        {cart.items.map((item, index) => (
          <div key={index} className="flex justify-between border-b py-2">
            <span>{item.title}</span>
            <span>CFA{item.maxPrice}</span>
            <i>CFA{item.currentPrice}</i>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 font-bold">
        <span>Total:</span>
        <span>CFA{getTotalPrice}</span>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={onEdit} className="w-full">
          Edit Cart
        </Button>
        <Button
          disabled={handleCustomerSelection()}
          onClick={handleSubmitCart}
          className="bg-green-500 w-full"
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

export default CartSummary;
