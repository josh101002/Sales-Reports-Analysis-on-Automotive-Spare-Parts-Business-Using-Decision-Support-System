// salesreportcontext.tsx - FIXED MAPPING
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
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
}

interface SalesReportsContextType {
  salesReports: SalesReport[];
  addSalesReport: (report: any) => Promise<void>;
  updateSalesReport: (id: string, report: any) => Promise<void>;
  deleteSalesReport: (id: string) => Promise<void>;
  importFromCSV: (csvData: string) => Promise<void>;
  fetchSales: () => Promise<void>;
}

const SalesReportsContext = createContext<SalesReportsContextType | undefined>(undefined);

export function SalesReportsProvider({ children }: { children: ReactNode }) {
  const [salesReports, setSalesReports] = useState<SalesReport[]>([]);

  const fetchSales = useCallback(async () => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const companyId = savedUser.company_id;

    if (!companyId) {
      setSalesReports([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/sales?company_id=${companyId}`);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      
      const mapped = data.map((s: any) => ({
        id: `SR-${String(s.report_id || s.id).padStart(3, "0")}`,
        reportDate: s.date ? new Date(s.date).toISOString().split('T')[0] : "2026-01-01",
        productName: s.product_name || "Unknown",
        category: s.category || "General",
        quantity: Number(s.quantity) || 0,
        unitPrice: Number(s.unit_price) || 0,
        totalAmount: Number(s.total_amount) || 0,
        customerName: s.customer_type || "Walk-in",
        paymentMethod: s.payment_method || "Cash",
        orderNumber: s.order_number || "N/A",
        status: s.status || "Completed"
      }));
      
      setSalesReports(mapped);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchSales();
    const handleLogin = () => fetchSales();
    window.addEventListener("userLogin", handleLogin);
    return () => window.removeEventListener("userLogin", handleLogin);
  }, [fetchSales]);

  const addSalesReport = async (report: any) => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    try {
      // Map frontend keys to DB keys
      const dbReport = {
        date: report.reportDate,
        product_name: report.productName,
        category: report.category,
        quantity: report.quantity,
        unit_price: report.unitPrice,
        total_amount: report.totalAmount,
        customer_type: report.customerName,
        payment_method: report.paymentMethod,
        order_number: report.orderNumber,
        company_id: savedUser.company_id,
        status: report.status || "Completed"
      };

      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports: [dbReport] }),
      });

      if (response.ok) {
        toast.success("Sale recorded successfully!");
        await fetchSales();
      }
    } catch (err) {
      toast.error("Failed to save to database");
    }
  };

  // 6. IMPORT CSV (Strict formatting and backend mapping)
  const importFromCSV = async (csvData: string) => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.company_id) return;

    const lines = csvData.trim().split('\n');
    
    // Strip quotes and \r from headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["\r]/g, ''));
    
    const reportsToImport = lines.slice(1).map(line => {
      if (!line.trim()) return null; // Skip empty lines at the end of the file
      
      const values = line.split(',').map(v => v.trim().replace(/["\r]/g, ''));
      const row: any = {};
      headers.forEach((header, index) => { row[header] = values[index]; });

      // CRITICAL FIX: These keys must exactly match your MySQL table columns
      return {
        date: row.date || new Date().toISOString().split('T')[0],
        product_name: row.product_name || row.product_line || "Unknown",
        category: row.category || row.product_line || "General",
        quantity: Number(row.quantity) || 1,
        unit_price: Number(row.unit_price) || 0,
        total_amount: Number(row.total_amount) || Number(row.total) || 0,
        customer_type: row.customer_type || row.client_type || "Retail",
        payment_method: row.payment_method || row.payment || "Cash",
        order_number: row.order_number || `IMP-${Date.now()}`,
        company_id: savedUser.company_id
      };
    }).filter(Boolean); // Remove null rows

    try {
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports: reportsToImport }),
      });

      if (response.ok) {
        toast.success(`Imported ${reportsToImport.length} records!`);
        await fetchSales(); 
      } else {
        toast.error("Database rejected the format");
      }
    } catch (err) {
      toast.error("Import failed");
    }
  };

  const updateSalesReport = async (id: string, report: any) => {
    // Extract the numeric ID from "SR-001"
    const dbId = id.replace("SR-", "");
    
    try {
      const response = await fetch(`http://localhost:5000/api/sales/${dbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportDate: report.reportDate,
          orderNumber: report.orderNumber,
          productName: report.productName,
          category: report.category,
          quantity: report.quantity,
          unitPrice: report.unitPrice,
          totalAmount: report.totalAmount,
          customerName: report.customerName,
          paymentMethod: report.paymentMethod,
          status: report.status
        }),
      });

      if (response.ok) {
        toast.success("Report updated successfully");
        await fetchSales(); // This refreshes the UI
      } else {
        const errorData = await response.json();
        console.error("Server Error:", errorData);
        toast.error("Failed to update on server");
      }
    } catch (err) {
      console.error("Network Error:", err);
      toast.error("Network error: Could not reach server");
    }
  };

  const deleteSalesReport = async (id: string) => {
    const dbId = id.replace("SR-", "");
    try {
      const response = await fetch(`http://localhost:5000/api/sales/${dbId}`, { method: 'DELETE' });
      if (response.ok) { await fetchSales(); toast.success("Deleted"); }
    } catch (err) { toast.error("Delete failed"); }
  };

  return (
    <SalesReportsContext.Provider value={{ salesReports, addSalesReport, updateSalesReport, deleteSalesReport, importFromCSV, fetchSales }}>
      {children}
    </SalesReportsContext.Provider>
  );
}

export const useSalesReports = () => {
  const context = useContext(SalesReportsContext);
  if (!context) throw new Error("useSalesReports must be used within SalesReportsProvider");
  return context;
};