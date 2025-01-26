import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useLocation } from "react-router-dom";
import { RefreshCcw, RefreshCwOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { destroyDB, syncWithCouchDB } from "@/db";

function Header() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline) {
      alert("Connection lost!");
      return;
    }

    try {
      await syncWithCouchDB();
    } catch (error) {
      console.error("Error with sync:", error);
      alert("Error while syncing, try again!");
    }
  };

  const handleDestroyDb = () => {
    destroyDB();
  };

  const location = useLocation();

  function getPathName(a) {
    let title = null;
    switch (a) {
      case "/":
        title = "DASHBOARD";
        break;
      case "/cart":
        title = "CART";
        break;
      case "/inventory":
        title = "INVENTORY";
        break;
      case "/receipts":
        title = "RECEIPTS";
        break;
      case "/sales":
        title = "SALES";
        break;
      case "/expenditure":
        title = "EXPENDITURE";
        break;
      case "/reports":
        title = "REPORTS";
        break;
      case "/suppliers":
        title = "SUPPLIERS";
        break;
      case "/customers":
        title = "CUSTOMERS";
        break;
      case "/logs":
        title = "LOGS";
        break;

      default:
        break;
    }

    return <h1 className="text-2xl font-extrabold">{title}</h1>;
  }

  return (
    <header className="w-full border-b no-print">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div>{getPathName(location.pathname)}</div>
        {/* <button onClick={() => handleDestroyDb()}>Destroy </button> */}
        {isOnline ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <RefreshCcw color="green" />
                  </TooltipTrigger>
                  <TooltipContent>Connected to Internet</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Connected</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Last sync:</DropdownMenuItem>
              <DropdownMenuItem>Sync Now?</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <RefreshCwOff color="red" />
                  </TooltipTrigger>
                  <TooltipContent>No Internet</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>No Internet connection</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Last Sync:</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

export default Header;
