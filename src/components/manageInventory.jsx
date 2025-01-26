import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import Form from "./form";
import { useState } from "react";
import { editInventoryFormControls } from "@/config";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { updateInventoryItem } from "@/db";

function ManageInventory({ item, onReturn }) {
  const { _id, title, costPrice, minPrice, maxPrice, totalStock, supplier } =
    item;

  const initialFormData = {
    title: title,
    costPrice: costPrice,
    minPrice: minPrice,
    maxPrice: maxPrice,
  };
  const [formData, setFormData] = useState(initialFormData);
  const [addStock, setAddStock] = useState(0);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (addStock < 0) {
      toast("Stock number negative");
      return;
    }

    if (
      formData.costPrice < 0 ||
      formData.minPrice < 0 ||
      formData.maxPrice < 0
    ) {
      toast("Prices cannot be less than 0");
      return;
    }

    if (Number(formData.costPrice) > Number(formData.minPrice) || Number(formData.costPrice) > Number(formData.maxPrice)) {
      toast("Cost price cannot be greater than selling prices");
      return;
    }

    if (Number(formData.minPrice) > Number(formData.maxPrice)) {
      toast("Minimum Price cannot be more than cost price");
      return;
    }

    const newStock = parseInt(totalStock) + parseInt(addStock);

    const newData = {
      ...formData,
      totalStock: newStock,
    };

    try {
      const response = await updateInventoryItem(_id, newData);

      if (response) {
        toast("Data updated");
        onReturn();
        return;
      }

      toast("Error updating");
      return;

    } catch (error) {
      console.error(error);
    }
  };

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  return (
    <div>
      <Button onClick={onReturn} className="mb-2">
        <ArrowLeft /> <span>Back</span>
      </Button>
      <div>
        <div className="border p-2 w-full bg-gray-200">
          <Label>Supplier: {supplier}</Label>
        </div>
        <div className="mb-3">
          <Label>Current Stock: {totalStock}</Label>
          <div className="flex w-28 items-center">
            <Label>Add:</Label>
            <Input
              type="number"
              value={addStock}
              onChange={(e) => setAddStock(e.target.value)}
            />
          </div>
        </div>
        <Form
          onSubmit={onSubmit}
          formData={formData}
          setFormData={setFormData}
          formControls={editInventoryFormControls}
          isBtnDisabled={!isFormValid()}
        />
      </div>
    </div>
  );
}

export default ManageInventory;
