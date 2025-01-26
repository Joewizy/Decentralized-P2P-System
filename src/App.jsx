import { HashRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout";
import DashBoard from "./pages/dashboard";
import Cart from "./pages/cart";
import Inventory from "./pages/inventory";
import Receipts from "./pages/receipts";
import Sales from "./pages/sales";
import Expenditure from "./pages/expenditure";
import Reports from "./pages/report";
import Suppliers from "./pages/supplier";
import Customers from "./pages/customers";
import Logs from "./pages/logs";
import Login from "./pages/login";
import BulkInventoryAdd from "./pages/bulk-inv";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashBoard />} />
            <Route path="cart" element={<Cart />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="bulk" element={<BulkInventoryAdd />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="sales" element={<Sales />} />
            <Route path="expenditure" element={<Expenditure />} />
            <Route path="reports" element={<Reports />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="customers" element={<Customers />} />
            <Route path="logs" element={<Logs />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
