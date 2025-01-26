import ChartLong from "@/components/long-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomers, getReports, getSuppliers } from "@/db";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { useEffect, useState } from "react";

function DashBoard() {
  const [data, setData] = useState([]);
  const [supplierData, setSupplierData] = useState([]); // For supplier loans
  const [customerData, setCustomerData] = useState([]); // For customer loans
  const [profitData, setProfitData] = useState({ today: 0, yesterday: 0 });
  const [supplierLoan, setSupplierLoan] = useState(0);
  const [customerLoan, setCustomerLoan] = useState(0);

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const result = await getReports();
        setData(result);
        calculateProfits(result); // Calculate profits once data is fetched
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  // Fetch suppliers data
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const result = await getSuppliers();
        setSupplierData(result);
        calculateSupplierLoan(result); // Calculate supplier loan once data is fetched
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const result = await getCustomers();
        setCustomerData(result);
        calculateCustomerLoan(result); // Calculate customer loan once data is fetched
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  // Function to calculate profit for a given date range
  const calculateProfits = (data) => {
    if (!data || !Array.isArray(data)) return;

    // Calculate today's profit
    const todayProfit = calculateProfitForRange(startOfDay(new Date()), endOfDay(new Date()), data);
    // Calculate yesterday's profit
    const yesterdayProfit = calculateProfitForRange(
      startOfDay(subDays(new Date(), 1)),
      endOfDay(subDays(new Date(), 1)),
      data
    );

    // Update the profit data state
    setProfitData({ today: todayProfit, yesterday: yesterdayProfit });
  };

  // Function to calculate the profit for a specific range
  const calculateProfitForRange = (from, to, data) => {
    return data
      .filter((item) => {
        const itemDate = new Date(item.timestamp); // Assumes `timestamp` field for dates
        return itemDate >= from && itemDate <= to;
      })
      .reduce((sum, item) => {
        const amount = Number(item.amount) || 0;
        const type = item.type;

        // Add sales, subtract expenditures (losses)
        if (type === "sales") {
          return sum + amount;
        } else if (type === "expenditures") {
          return sum - amount;
        }

        return sum;
      }, 0);
  };

   // Calculate total supplier loan amount
   const calculateSupplierLoan = (supplierData) => {
    if (!supplierData || !Array.isArray(supplierData)) return 0;
    const totalLoan = supplierData.reduce((sum, supplier) => {
      return sum + (Number(supplier.loan) || 0);
    }, 0);
    setSupplierLoan(totalLoan);
  };

  // Calculate total customer loan amount
  const calculateCustomerLoan = (customerData) => {
    if (!customerData || !Array.isArray(customerData)) return 0;
    const totalLoan = customerData.reduce((sum, customer) => {
      return sum + (Number(customer.loan) || 0);
    }, 0);
    setCustomerLoan(totalLoan);
  };


  return (
    <div>
      <div>
        <ChartLong />
      </div>
      <div className="grid grid-cols-4 w-full mt-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Profit</CardTitle>
          </CardHeader>
          <CardContent>{profitData.today} CFA</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Yesterday's Profit</CardTitle>
          </CardHeader>
          <CardContent>{profitData.yesterday} CFA</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Supplier Loan</CardTitle>
          </CardHeader>
          <CardContent>{supplierLoan} CFA</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer Loan</CardTitle>
          </CardHeader>
          <CardContent>{customerLoan} CFA</CardContent>
        </Card>
      </div>
     
    </div>
  );
}

export default DashBoard;
