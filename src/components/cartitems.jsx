import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function CartItems({ cart, updateCart, total, submitCart }) {

  const handleQuantityChange = (item, amount) => {
    const updatedItems = cart
      .map((i) =>
        i._id === item._id
          ? { ...i, quantity: Math.max(1, i.quantity + amount) }
          : i
      )
      .filter((i) => i.quantity > 0); // Remove items with quantity 0
    updateCart(updatedItems);
  };

  const handleDeleteItem = (item) => {
    const updatedItems = cart.filter((i) => i._id !== item._id);
    updateCart(updatedItems);
  };

  const handlePriceChange = (item, newPrice) => {
    const clampedPrice = Math.min(Math.max(newPrice, item.minPrice), item.maxPrice);
    const updatedItems = cart.map((i) =>
      i._id === item._id ? { ...i, currentPrice: clampedPrice } : i
    );
    updateCart(updatedItems);
  };

  const countCart = () => {
    return cart?.length <= 0
  }

  return (
    <div>
      <div className="flex flex-col gap-2 text-sm max-h-[70vh] overflow-y-auto">
        {cart?.map((item) => (
          <div key={item._id} className="border-b p-1">
            <div className="flex p-1 justify-between">
              <div className="flex flex-col gap-2">
                <span>{item.title}</span>
                <div className="flex gap-2">
                  <span onClick={() => handleQuantityChange(item, -1)}>
                    <Minus className="w-4 h-4 cursor-pointer" />
                  </span>
                  <span className="ml-auto">{item.quantity}</span>
                  <span onClick={() => handleQuantityChange(item, 1)}>
                    <Plus className="w-4 h-4 cursor-pointer" />
                  </span>
                  <Trash className="w-4 h-4 cursor-pointer" onClick={() => handleDeleteItem(item)} />
                </div>
              </div>

              <div className="flex flex-col">
                <span>
                  CFA{item.minPrice} - CFA{item.maxPrice}
                </span>
                <div className="mt-2">
                  <Input
                    value={item.currentPrice || item.maxPrice}
                    type="number"
                    onChange={(e) =>
                      handlePriceChange(item,  parseFloat(e.target.value) || item.maxPrice)
                    }
                    min={item.minPrice}
                    max={item.maxPrice}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-2">
        <span>Total: CFA{total.toFixed(2)}</span>
        <Button className="w-full" disabled={countCart()} onClick={submitCart}>Submit</Button>
      </div>
    </div>
  );
}

export default CartItems;
