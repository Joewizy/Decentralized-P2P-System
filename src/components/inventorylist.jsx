import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

function InventoryList({ inventory, onAddToCart }) {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredInventory = useMemo(() => {
    let filtered = inventory.filter((item) =>
      item.title.toLowerCase().includes(filter.toLowerCase())
    );

    if (sortKey) {
      filtered = filtered.sort((a, b) => {
        const valueA = a[sortKey];
        const valueB = b[sortKey];

        if (sortOrder === "asc") {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
    }

    return filtered;
  }, [inventory, filter, sortKey, sortOrder]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const InventoryItem = ({ item }) => (
    <div
      className="justify-between items-center p-2 border-b cursor-pointer hover:bg-slate-400"
      onClick={() => {
        onAddToCart(item);
        toast("Item added");
      }}
    >
      <div>
        <h4 className="font-bold text-sm">{item.title}</h4>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-green-600 font-bold text-sm">
          CFA{item.maxPrice}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-green-600 font-bold text-sm">
          Stock: {item.totalStock}
        </span>
      </div>
    </div>
  );

  useEffect(() => {
    if (!inventory.length) {
      console.log("No inventory");
    }
  }, [inventory]);

  return (
    <div className="p-4 border rounded-lg max-h-[80vh] overflow-y-auto">
      <div className="mb-4 flex gap-2">
        <Input
          type="text"
          placeholder="Search Inventory..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 w-full"
        />
        <Button onClick={() => setFilter("")}>Clear</Button>
      </div>
      {/* <div className="flex justify-between mb-2">
        <Button
          onClick={() => handleSort("name")}
          className={`${
            sortKey === "name" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          Sort by Name
        </Button>
        <Button
          onClick={() => handleSort("price")}
          className={`${
            sortKey === "price" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          Sort by Price
        </Button>
      </div> */}
      {filteredInventory.length > 0 ? (
        <div className="grid grid-cols-3">
          {filteredInventory.map((item) => (
            <InventoryItem key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No items found.</div>
      )}
    </div>
  );
}

export default InventoryList;
