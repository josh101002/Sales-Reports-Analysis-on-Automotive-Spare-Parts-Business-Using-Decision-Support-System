import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface SalesReport {
  id: string;
  reportDate: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  paymentMethod: string;
  status: "Completed" | "Pending" | "Cancelled";
  orderNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface SalesReportsContextType {
  salesReports: SalesReport[];
  addSalesReport: (report: Omit<SalesReport, "id" | "createdAt" | "updatedAt">) => void;
  updateSalesReport: (id: string, report: Partial<SalesReport>) => void;
  deleteSalesReport: (id: string) => void;
  importFromCSV: (csvData: string) => void;
  getSalesReportById: (id: string) => SalesReport | undefined;
}

const SalesReportsContext = createContext<SalesReportsContextType | undefined>(undefined);

// Initial mock sales reports data
const initialSalesReports: SalesReport[] = [
  {
    id: "SR-001",
    reportDate: "2025-10-20",
    productName: "Ceramic Brake Pads",
    category: "Brake System",
    quantity: 2,
    unitPrice: 100,
    totalAmount: 200,
    customerName: "ABC Motors",
    paymentMethod: "Credit Card",
    status: "Completed",
    orderNumber: "ORD-1847",
    notes: "Premium brake pads for sedan",
    createdAt: "2025-10-20T08:30:00Z",
    updatedAt: "2025-10-20T08:30:00Z"
  },
  {
    id: "SR-002",
    reportDate: "2025-10-20",
    productName: "Premium Oil Filter",
    category: "Filters",
    quantity: 5,
    unitPrice: 50,
    totalAmount: 250,
    customerName: "AutoZone Services",
    paymentMethod: "Bank Transfer",
    status: "Pending",
    orderNumber: "ORD-1846",
    notes: "Bulk order for service center",
    createdAt: "2025-10-20T09:15:00Z",
    updatedAt: "2025-10-20T09:15:00Z"
  },
  {
    id: "SR-003",
    reportDate: "2025-10-19",
    productName: "Platinum Spark Plugs",
    category: "Engine Parts",
    quantity: 8,
    unitPrice: 50,
    totalAmount: 400,
    customerName: "Quick Fix Auto",
    paymentMethod: "Cash",
    status: "Completed",
    orderNumber: "ORD-1845",
    notes: "High performance spark plugs",
    createdAt: "2025-10-19T14:20:00Z",
    updatedAt: "2025-10-19T14:20:00Z"
  },
  {
    id: "SR-004",
    reportDate: "2025-10-19",
    productName: "Air Filter",
    category: "Filters",
    quantity: 3,
    unitPrice: 35,
    totalAmount: 105,
    customerName: "Elite Motors",
    paymentMethod: "Credit Card",
    status: "Completed",
    orderNumber: "ORD-1844",
    notes: "Standard air filters",
    createdAt: "2025-10-19T11:45:00Z",
    updatedAt: "2025-10-19T11:45:00Z"
  },
  {
    id: "SR-005",
    reportDate: "2025-10-18",
    productName: "Brake Rotors",
    category: "Brake System",
    quantity: 4,
    unitPrice: 200,
    totalAmount: 800,
    customerName: "Pro Auto Parts",
    paymentMethod: "Credit Card",
    status: "Completed",
    orderNumber: "ORD-1843",
    notes: "Heavy duty brake rotors",
    createdAt: "2025-10-18T10:30:00Z",
    updatedAt: "2025-10-18T10:30:00Z"
  },
  {
    id: "SR-006",
    reportDate: "2025-10-18",
    productName: "Engine Oil 5W-30",
    category: "Engine Parts",
    quantity: 12,
    unitPrice: 45,
    totalAmount: 540,
    customerName: "ABC Motors",
    paymentMethod: "Bank Transfer",
    status: "Completed",
    orderNumber: "ORD-1842",
    notes: "Synthetic engine oil",
    createdAt: "2025-10-18T15:00:00Z",
    updatedAt: "2025-10-18T15:00:00Z"
  },
  {
    id: "SR-007",
    reportDate: "2025-10-17",
    productName: "Battery 12V",
    category: "Electrical",
    quantity: 1,
    unitPrice: 150,
    totalAmount: 150,
    customerName: "Quick Fix Auto",
    paymentMethod: "Cash",
    status: "Completed",
    orderNumber: "ORD-1841",
    notes: "Car battery replacement",
    createdAt: "2025-10-17T13:20:00Z",
    updatedAt: "2025-10-17T13:20:00Z"
  },
  {
    id: "SR-008",
    reportDate: "2025-10-17",
    productName: "Windshield Wipers",
    category: "Accessories",
    quantity: 6,
    unitPrice: 30,
    totalAmount: 180,
    customerName: "AutoZone Services",
    paymentMethod: "Credit Card",
    status: "Completed",
    orderNumber: "ORD-1840",
    notes: "Premium wiper blades",
    createdAt: "2025-10-17T09:10:00Z",
    updatedAt: "2025-10-17T09:10:00Z"
  },
  {
    id: "SR-009",
    reportDate: "2025-10-16",
    productName: "Headlight Bulbs H7",
    category: "Lighting",
    quantity: 10,
    unitPrice: 25,
    totalAmount: 250,
    customerName: "Elite Motors",
    paymentMethod: "Bank Transfer",
    status: "Completed",
    orderNumber: "ORD-1839",
    notes: "LED headlight bulbs",
    createdAt: "2025-10-16T16:30:00Z",
    updatedAt: "2025-10-16T16:30:00Z"
  },
  {
    id: "SR-010",
    reportDate: "2025-10-16",
    productName: "Transmission Fluid",
    category: "Engine Parts",
    quantity: 7,
    unitPrice: 55,
    totalAmount: 385,
    customerName: "Pro Auto Parts",
    paymentMethod: "Credit Card",
    status: "Completed",
    orderNumber: "ORD-1838",
    notes: "ATF transmission fluid",
    createdAt: "2025-10-16T12:00:00Z",
    updatedAt: "2025-10-16T12:00:00Z"
  }
];

export function SalesReportsProvider({ children }: { children: ReactNode }) {
  const [salesReports, setSalesReports] = useState<SalesReport[]>(initialSalesReports);

  const addSalesReport = (report: Omit<SalesReport, "id" | "createdAt" | "updatedAt">) => {
    const newReport: SalesReport = {
      ...report,
      id: `SR-${String(salesReports.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSalesReports(prev => [newReport, ...prev]);
    toast.success("Sales report added successfully!");
  };

  const updateSalesReport = (id: string, updates: Partial<SalesReport>) => {
    setSalesReports(prev =>
      prev.map(report =>
        report.id === id
          ? { ...report, ...updates, updatedAt: new Date().toISOString() }
          : report
      )
    );
    toast.success("Sales report updated successfully!");
  };

  const deleteSalesReport = (id: string) => {
    setSalesReports(prev => prev.filter(report => report.id !== id));
    toast.success("Sales report deleted successfully!");
  };

  const importFromCSV = (csvData: string) => {
    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const newReports: SalesReport[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length === headers.length) {
          const report: any = {};
          headers.forEach((header, index) => {
            report[header] = values[index];
          });
          
          // Map CSV data to SalesReport format
          const salesReport: SalesReport = {
            id: `SR-${String(salesReports.length + i).padStart(3, "0")}`,
            reportDate: report.reportDate || report.date || new Date().toISOString().split('T')[0],
            productName: report.productName || report.product || "Unknown Product",
            category: report.category || "Uncategorized",
            quantity: parseInt(report.quantity || "1"),
            unitPrice: parseFloat(report.unitPrice || report.price || "0"),
            totalAmount: parseFloat(report.totalAmount || report.total || "0"),
            customerName: report.customerName || report.customer || "Unknown Customer",
            paymentMethod: report.paymentMethod || report.payment || "Cash",
            status: (report.status as any) || "Completed",
            orderNumber: report.orderNumber || report.order || `ORD-${Date.now()}`,
            notes: report.notes || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          newReports.push(salesReport);
        }
      }
      
      if (newReports.length > 0) {
        setSalesReports(prev => [...newReports, ...prev]);
        toast.success(`Successfully imported ${newReports.length} sales reports!`);
      } else {
        toast.error("No valid data found in CSV file");
      }
    } catch (error) {
      toast.error("Failed to import CSV file. Please check the format.");
      console.error("CSV Import Error:", error);
    }
  };

  const getSalesReportById = (id: string) => {
    return salesReports.find(report => report.id === id);
  };

  return (
    <SalesReportsContext.Provider
      value={{
        salesReports,
        addSalesReport,
        updateSalesReport,
        deleteSalesReport,
        importFromCSV,
        getSalesReportById
      }}
    >
      {children}
    </SalesReportsContext.Provider>
  );
}

export function useSalesReports() {
  const context = useContext(SalesReportsContext);
  if (context === undefined) {
    throw new Error("useSalesReports must be used within a SalesReportsProvider");
  }
  return context;
}
