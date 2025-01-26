import Form from "@/components/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addInventoryFormControls } from "@/config";
import { addBulkInventory, getSuppliers } from "@/db";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function BulkInventoryAdd() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [formData, setFormData] = useState([]);
  const [supplierList, setsupplierList] = useState([]);
  const [selectedSupplier, setSetselectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const addNewForm = () => {
    setFormData([...formData, {}]);
  };

  const updateFormData = (index, newData) => {
    const updatedFormsData = [...formData];
    updatedFormsData[index] = newData;

    setFormData(updatedFormsData);
  };

  const deleteForm = (index) => {
    const updatedFormsData = formData.filter((_, i) => i !== index);

    setFormData(updatedFormsData);
  };

  const handleSave = (event) => {
    event.preventDefault();

    const isValid = formData.every((data) => data.title);
    if (!isValid) {
      toast("Enter all fields");
      return;
    }
    if (checked && selectedSupplier !== null) {
      const response = addBulkInventory(formData, selectedSupplier);

      if (response) {
        toast("Data added");
        setFormData([]);
        setChecked(false);
      } else {
        toast("Error saving documents");
      }
    } else {
      const response = addBulkInventory(formData);
      if (response) {
        toast("Data added");
        setFormData([]);
        setChecked(false);
      } else {
        toast("Error saving documents");
      }
    }
  };

  const handleCheck = () => {
    setChecked(!checked);
    setSetselectedSupplier(null);
  };

  return (
    <div className="container">
      <Button onClick={() => navigate("/inventory")}>
        <ArrowLeft /> <span>Back</span>
      </Button>
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
      <div>
        <form onSubmit={handleSave} className="grid grid-cols-4 gap-4">
          {formData.map((formDatas, index) => (
            <div key={index} className="border p-4 relative">
              <div className="flex gap-3">
                <h2>Product {index + 1}</h2>{" "}
                <Button
                  onClick={() => deleteForm(index)}
                  className="bg-red-600"
                >
                  Delete
                </Button>
              </div>

              <Form
                formData={formDatas}
                setFormData={(newData) => updateFormData(index, newData)}
                formControls={addInventoryFormControls}
                buttonText=""
                isBtnDisabled={true}
                hiddenBtn={true}
                onSubmit={(e) => e.preventDefault()}
              />
            </div>
          ))}
          <div className="flex gap-6">
            <Button onClick={addNewForm}>Add Another Product</Button>
            <Button type="submit">Save All</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BulkInventoryAdd;
