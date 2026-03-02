import React, { useState, useEffect } from 'react';
import { LoginPage } from "./components/LoginPage";
import { SalesHeader } from "./components/SalesHeader";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { LowStockModal } from "./components/LowStockModal";
import { Toaster } from "./components/ui/sonner";
import { InventoryProvider, useInventory } from "./contexts/InventoryContext";
import { SuppliersProvider } from "./contexts/SuppliersContext";
import { SalesReportsProvider } from "./contexts/SalesReportsContext";

// Import all view components
import { DashboardView } from "./components/views/DashboardView";
import { SalesReportsView } from "./components/views/SalesReportsView";
import { PredictionsTrendsView } from "./components/views/PredictionsTrendsView";
import { RecommendationsView } from "./components/views/RecommendationsView";
import { InventoryView } from "./components/views/InventoryView";
import { AnalyticsView } from "./components/views/AnalyticsView";
import { SuppliersView } from "./components/views/SuppliersView";
import { SettingsView } from "./components/views/SettingsView";
import { NotificationsView } from "./components/views/NotificationsView";

// 1. Define the "Shape" of your data for TypeScript [cite: 80, 196]
interface SalesRecord {
  report_id: number;
  date: string;
  order_number: string;
  category: string;
  total_amount: number;
}

const Dashboard: React.FC = () => {
  // 2. Create a "State" to hold your database data [cite: 1510]
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);

  // 3. The "useEffect" Hook (Put it here!) [cite: 1297]
  useEffect(() => {
    fetch('http://localhost:5000/api/sales') // Your Express Server URL
      .then((response) => response.json())
      .then((data) => {
        setSalesData(data); // This updates your UI with real data [cite: 263-265]
      })
      .catch((error) => console.error('Error fetching sales:', error));
  }, []);

  return (
    <div>
      {/* 4. Map through your data to show it in your UI [cite: 1299] */}
      {salesData.map((item) => (
        <div key={item.report_id}>
          {item.order_number} - {item.total_amount}
        </div>
      ))}
    </div>
  );
};

// export default app;
export interface GlobalFilters {
  searchTerm: string;
  dateRange: string;
  customDateRange?: { from: Date; to: Date };
  analyticsView: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  categories: string[];
  status: string[];
  priceRange: { min: number; max: number };
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const { inventory } = useInventory();

  // Global filters state
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
    searchTerm: "",
    dateRange: "october",
    customDateRange: undefined,
    analyticsView: "monthly",
    categories: [],
    status: [],
    priceRange: { min: 0, max: 1000 }
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Check for low stock items when user logs in
useEffect(() => {
  if (isAuthenticated && inventory.length > 0) {
    // Look for ANY item that is Critical or Low Stock
    const lowStockItems = inventory.filter(item => 
      item.status === "Critical" || item.status === "Low Stock"
    );

    if (lowStockItems.length > 0) {
      console.log("Low stock detected!", lowStockItems);
      setShowLowStockModal(true);
    }
  }
}, [isAuthenticated, inventory]); // This triggers every time inventory changes

  // Listen for filter updates from components
  useEffect(() => {
    const handleFilterUpdate = (event: any) => {
      updateFilters(event.detail);
    };

    const handleViewChange = (event: any) => {
      setActiveView(event.detail);
    };

    window.addEventListener('updateFilters', handleFilterUpdate as EventListener);
    window.addEventListener('changeView', handleViewChange as EventListener);
    return () => {
      window.removeEventListener('updateFilters', handleFilterUpdate as EventListener);
      window.removeEventListener('changeView', handleViewChange as EventListener);
    };
  }, []);

  const handleViewInventory = () => {
    setActiveView("inventory");
  };

  const updateFilters = (updates: Partial<GlobalFilters>) => {
    setGlobalFilters(prev => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setGlobalFilters({
      searchTerm: "",
      dateRange: "october",
      customDateRange: undefined,
      analyticsView: "monthly",
      categories: [],
      status: [],
      priceRange: { min: 0, max: 1000 }
    });
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView globalFilters={globalFilters} />;
      case "sales-reports":
        return <SalesReportsView globalFilters={globalFilters} />;
      case "predictions-trends":
        return <PredictionsTrendsView globalFilters={globalFilters} />;
      case "analytics":
        return <AnalyticsView globalFilters={globalFilters} />;
      case "recommendations":
        return <RecommendationsView globalFilters={globalFilters} />;
      case "inventory":
        return <InventoryView globalFilters={globalFilters} />;
      case "suppliers":
        return <SuppliersView />;
      case "settings":
        return <SettingsView />;
      case "notifications":
        return <NotificationsView />;
      default:
        return <DashboardView globalFilters={globalFilters} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar activeView={activeView} onViewChange={setActiveView} />
          <SidebarInset className="flex-1">
            <SalesHeader
              onLogout={handleLogout}
              globalFilters={globalFilters}
              onUpdateFilters={updateFilters}
              onClearFilters={clearFilters}
              activeView={activeView}
            />
            <main className="flex-1 p-6 bg-background">
              {renderView()}
            </main>
          </SidebarInset>

          {/* Low Stock Alert Modal */}
          <LowStockModal
            isOpen={showLowStockModal}
            onClose={() => setShowLowStockModal(false)}
            onViewInventory={handleViewInventory}
          />
        </div>
      </SidebarProvider>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <SuppliersProvider>
        <SalesReportsProvider>
          <AppContent />
        </SalesReportsProvider>
      </SuppliersProvider>
    </InventoryProvider>
  );
}
