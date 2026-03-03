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
  // 1. Authentication and User States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ role: string; company_id: number; email: string; user_name?: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); 

  const [activeView, setActiveView] = useState("dashboard");
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const { inventory, setInventory } = useInventory(); 

  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
    searchTerm: "",
    dateRange: "october",
    customDateRange: undefined,
    analyticsView: "monthly",
    categories: [],
    status: [],
    priceRange: { min: 0, max: 1000 }
  });

  // 2. FIXED: Check localStorage on Mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(false); // Must be true to enter the app
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.removeItem("user");
      }
    }
    // Ensure checking state is disabled after the check
    setIsCheckingAuth(false);
  }, []);

  // 3. UPDATED: Single handleLogin to trigger immediate transition
const handleLogin = (userData: any) => {
  setUser(userData);
  setIsAuthenticated(true);
  localStorage.setItem("user", JSON.stringify(userData));
  
  // Clear inventory state to prepare for fresh company data
  if (setInventory) setInventory([]); 

  // Dispatch event so InventoryContext knows to fetch for the NEW company_id
  window.dispatchEvent(new Event("userLogin"));
};

  const handleLogout = () => {
    localStorage.removeItem("user");
    // Clear inventory state so the next business doesn't see old data
    if (setInventory) setInventory([]); 
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = "/"; 
  };

  // 4. NEW: Monitor user changes for debugging/tracking
  useEffect(() => {
    if (isAuthenticated && user?.company_id) {
        console.log("Active session for company:", user.company_id);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && inventory.length > 0) {
      const lowStockItems = inventory.filter(item => 
        item.status === "Critical" || item.status === "Low Stock"
      );

      if (lowStockItems.length > 0) {
        setShowLowStockModal(true);
      }
    }
  }, [isAuthenticated, inventory]);

  useEffect(() => {
    const handleFilterUpdate = (event: any) => updateFilters(event.detail);
    const handleViewChange = (event: any) => setActiveView(event.detail);

    window.addEventListener('updateFilters', handleFilterUpdate as EventListener);
    window.addEventListener('changeView', handleViewChange as EventListener);
    return () => {
      window.removeEventListener('updateFilters', handleFilterUpdate as EventListener);
      window.removeEventListener('changeView', handleViewChange as EventListener);
    };
  }, []);

  const updateFilters = (updates: Partial<GlobalFilters>) => {
    setGlobalFilters(prev => ({ ...prev, ...updates }));
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView globalFilters={globalFilters} />;
      case "sales-reports":
        return <SalesReportsView globalFilters={globalFilters} />;
      case "predictions-trends":
        return <PredictionsTrendsView />; 
      case "analytics":
        return <AnalyticsView globalFilters={globalFilters} />;
      case "recommendations":
        return <RecommendationsView globalFilters={globalFilters} />;
      case "inventory":
        return <InventoryView globalFilters={globalFilters} />;
      case "suppliers":
        return <SuppliersView />;
      case "settings":
        // Role-based access control
        if (user?.role === 'admin') {
          return <SettingsView />;
        }
        return <DashboardView globalFilters={globalFilters} />;
      case "notifications":
        return <NotificationsView />;
      default:
        return <DashboardView globalFilters={globalFilters} />;
    }
  };

  // LOADING GUARD: Prevents dashboard flicker
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#212121]">
        <div className="text-white text-xl animate-pulse">Checking Session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* UPDATED: Passing the 'user' object here to show business name */}
          <AppSidebar 
            activeView={activeView} 
            onViewChange={setActiveView} 
            user={user} 
          />
          <SidebarInset className="flex-1">
            <SalesHeader
              onLogout={handleLogout}
              globalFilters={globalFilters}
              onUpdateFilters={updateFilters}
              onClearFilters={() => {}}
              activeView={activeView}
            />
            <main className="flex-1 p-6 bg-background">
              {renderView()}
            </main>
          </SidebarInset>

          <LowStockModal
            isOpen={showLowStockModal}
            onClose={() => setShowLowStockModal(false)}
            onViewInventory={() => setActiveView("inventory")}
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