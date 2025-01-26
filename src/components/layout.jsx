import { Outlet } from "react-router-dom";
import Header from "./header";
import SideBar from "./sidebar";
import { Toaster } from "./ui/sonner";

function AppLayout() {
  return (
    <div className="flex h-screen w-full">
      <SideBar />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Header />
        <main className="p-6">
          <Outlet />
          <Toaster />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
