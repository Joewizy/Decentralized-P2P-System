import CartItems from "@/components/cartitems";
import InventoryList from "@/components/inventorylist";
import CartReceipt from "@/components/receipt";
import CartSummary from "@/components/summary";
import { Button } from "@/components/ui/button";
import {
  addReceipt,
  addSales,
  getInventories,
  updateInventoryItem,
} from "@/db";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

function Cart() {
  const [cartTabs, setCartTabs] = useState(() => {
    const savedTabs = localStorage.getItem("cartTabs");

    return savedTabs
      ? JSON.parse(savedTabs)
      : [{ id: uuidv4(), name: "Cart 1", items: [] }];
  });
  const [activeTabId, setActiveTabId] = useState(cartTabs[0]?.id || null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    localStorage.setItem("cartTabs", JSON.stringify(cartTabs));
  }, [cartTabs]);

  const activeCart = useMemo(
    () => cartTabs.find((tab) => tab.id === activeTabId) || null,
    [cartTabs, activeTabId]
  );

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
  }, [activeCart, activeTabId]);

  

  const handleAddItem = useCallback(
    (item) => {
      if (!activeCart) return;

      if (item.totalStock <= 0) {
      toast("Sorry, this item is out of stock.");
      return;
    }

      setCartTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.id !== activeTabId) return tab;

          const existingItemIndex = tab.items.findIndex(
            (i) => i._id === item._id
          );
          if (existingItemIndex !== -1) {
            // Increment quantity for existing item
            const updatedItems = [...tab.items];
            updatedItems[existingItemIndex].quantity += 1;
            return { ...tab, items: updatedItems };
          }

          // Add new item with quantity and currentPrice set to maxPrice
          return {
            ...tab,
            items: [
              ...tab.items,
              { ...item, quantity: 1, currentPrice: item.maxPrice },
            ],
          };
        })
      );
    },
    [activeTabId, activeCart]
  );

  const handleCartUpdate = (updatedItems) => {
    setCartTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, items: updatedItems } : tab
      )
    );
  };

  const getTotalPrice = useMemo(() => {
    return (
      activeCart?.items.reduce(
        (acc, item) => acc + item.currentPrice * item.quantity,
        0
      ) || 0
    );
  }, [activeCart]);

  const handleAddNewCart = () => {
    if (cartTabs.length >= 3) {
      alert("You can only have a maximum of 3 carts at a time.");
      return;
    }

    const newCart = {
      id: uuidv4(),
      name: `Cart ${cartTabs.length + 1}`,
      items: [],
    };
    setCartTabs((prevTabs) => [...prevTabs, newCart]);
    setActiveTabId(newCart.id);
  };

  const handleSwitchCart = (tabId) => {
    setActiveTabId(tabId);
  };

  const handleDeleteCart = (tabId) => {
    if (cartTabs.length > 1) {
      const updatedTabs = cartTabs.filter((tab) => tab.id !== tabId);
      setCartTabs(updatedTabs);
      if (tabId === activeTabId) {
        setActiveTabId(updatedTabs[0]?.id || null);
      }
    }
  };

  
  

  const handleSubmitCart = async (customerDetails) => {
    const order = {
      items: activeCart.items,
      customerID: customerDetails.id,
      customerName: customerDetails.name,
      amount: activeCart.items.reduce(
        (acc, item) => acc + item.currentPrice * item.quantity,
        0
      ),
      paymentType: "Cash",
    };

    const response = await addSales(order);

    if (response.success) {
      toast("Sale successful");

      for (let item of activeCart.items) {
        const updatedItem = {
          ...item,
          totalStock: item.totalStock - item.quantity,
        };

        await updateInventoryItem(item._id, updatedItem);
      }

      setCartTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId ? { ...tab, items: [] } : tab
        )
      );

      const saleId = response.id;

      const newOrder = {
        SalesID: saleId,
        order,
      };

      const orderResponse = await addReceipt(newOrder);

      if (orderResponse.success) {
        const receiptId = orderResponse.id;
        const date = orderResponse.date;

        const newReceipt = {
          receiptId: receiptId,
          date: date,
          newOrder,
        };
        setOrderReceipt(newReceipt);
        setIsReceiptOpen(true);
      }
    }

    setIsSummaryOpen(false);
  };

  const handleShowSummary = () => {
    setIsSummaryOpen(true);
  };

  const handlePrintLater = () => {
    setIsReceiptOpen(false);
    setOrderReceipt(null);
  };

  const handlePrintSuccess = () => {
    setIsReceiptOpen(false);
    setOrderReceipt(null);
  };

  const CartTabs = () => (
    <div className="flex gap-2 mb-2">
      {cartTabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => handleSwitchCart(tab.id)}
          className={`px-4 py-1 ${
            tab.id === activeTabId ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          {tab.name}
          <span
            className="ml-2 text-red-600 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCart(tab.id);
            }}
          >
            x
          </span>
        </Button>
      ))}
      <Button
        onClick={handleAddNewCart}
        className={`px-4 py-1 ${
          cartTabs.length >= 5
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-green-500"
        }`}
      >
        + Add Cart
      </Button>
    </div>
  );
  return (
    <div>
      {isSummaryOpen ? (
        <CartSummary
          cart={activeCart}
          onSubmit={handleSubmitCart}
          onEdit={() => setIsSummaryOpen(false)}
        />
      ) : isReceiptOpen ? (
        <CartReceipt order={orderReceipt} printLater={handlePrintLater} printSuccess={handlePrintSuccess} />
      ) : (
        <div>
          <CartTabs />
          <div className="grid grid-cols-9 p-0">
            <div className="col-span-6">
              <InventoryList inventory={data} onAddToCart={handleAddItem} />
            </div>
            <div className="col-span-3">
              {activeCart ? (
                <CartItems
                  cart={activeCart.items}
                  updateCart={handleCartUpdate}
                  total={getTotalPrice}
                  submitCart={handleShowSummary}
                />
              ) : (
                <div>Empty cart</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
