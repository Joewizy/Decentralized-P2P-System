import {
  ArrowRightToLine,
  CircleGauge,
  FileClock,
  LayoutDashboard,
  LogOut,
  Logs,
  ShoppingBag,
  ShoppingCart,
  TicketCheck,
  TicketPlus,
  Truck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function SideBar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSideBar, setActiveSideBar] = useState("");

  useEffect(() => {
    setActiveSideBar(location.pathname);
  }, [location.pathname]);

  const MenuItems = [
    {
      id: "",
      label: "Dashboard",
      path: "/",
      logo: <CircleGauge />,
    },
    {
      id: "cart",
      label: "Cart",
      path: "/cart",
      logo: <ShoppingCart />,
    },
    {
      id: "inventory",
      label: "Inventory",
      path: "/inventory",
      logo: <ShoppingBag />,
    },
    {
      id: "receipts",
      label: "Receipts",
      path: "/receipts",
      logo: <TicketPlus />,
      gap: true,
    },
    {
      id: "sales",
      label: "Sales",
      path: "/sales",
      logo: <TicketCheck />,
    },
    {
      id: "expenditure",
      label: "Expenditure",
      path: "/expenditure",
      logo: <WalletCards />,
    },
    {
      id: "reports",
      label: "Reports",
      path: "/reports",
      logo: <FileClock />,
    },
    {
      id: "suppliers",
      label: "Suppliers",
      path: "/suppliers",
      logo: <Truck />,
      gap: true,
    },
    {
      id: "customers",
      label: "Customers",
      path: "/customers",
      logo: <UserRound />,
    },
    {
      id: "logs",
      label: "Logs",
      path: "/logs",
      logo: <Logs />,
      gap: true,
    },
  ];

  const { logout } = useAuth();
  return (
    <div
      className={`${
        open ? "w-52" : "w-20"
      } duration-300 pt-8 p-5 bg-blue-500 relative border-r flex-col max-h-[100vh] no-print`}
    >
      <div>
        <ArrowRightToLine
          color="white"
          className={`absolute cursor-pointer -right-3 top-14 w-7 border-2 bg-black rounded-full ${
            !open && "rotate-180"
          }`}
          onClick={() => setOpen(!open)}
        />
      </div>
      <div className="flex gap-x-4 items-center">
        <LayoutDashboard className={`cursor-pointer duration-500`} />
        <h1
          className={`text-white origin-left font-medium text-xl duration-300 ${
            !open && "scale-0"
          }`}
        >
          Warehouse
        </h1>
      </div>
      <ul className="pt-6">
        {MenuItems.map((menu, index) => (
          <li
            key={index}
            className={`text-gray-200 text-md flex  items-center gap-x-5 cursor-pointer p-2 ${
              activeSideBar === menu.path ? "bg-blue-700" : ""
            } hover:bg-blue-700 rounded-md ${menu.gap ? "mt-4" : "mt-1"} group`}
            onClick={() => navigate(`/${menu.id}`)}
          >
            {menu.logo}
            <span className={`${!open && "hidden"} origin-left duration-200`}>
              {menu.label}
            </span>
            {!open && (
              <span
                className={`${
                  open
                    ? "hidden"
                    : "absolute left-full ml-2 opacity-0 group-hover:opacity-100"
                } transition-opacity duration-200 text-sm bg-gray-700 text-white p-1 rounded py-1 px-2`}
              >
                {menu.label}
              </span>
            )}
          </li>
        ))}
        <li
          className={`text-gray-200 text-md flex  items-center gap-x-5 cursor-pointer p-2 hover:bg-blue-700 rounded-md "mt-4" group`}
          onClick={logout}
        >
          <LogOut />
          <span className={`${!open && "hidden"} origin-left duration-200`}>
            Logout
          </span>
          {!open && (
            <span
              className={`${
                open
                  ? "hidden"
                  : "absolute left-full ml-2 opacity-0 group-hover:opacity-100"
              } transition-opacity duration-200 text-sm bg-gray-700 text-white p-1 rounded py-1 px-2`}
            >
              Logout
            </span>
          )}
        </li>
      </ul>
    </div>
  );
}

export default SideBar;
