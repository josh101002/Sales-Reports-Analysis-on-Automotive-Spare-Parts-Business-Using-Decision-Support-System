import { createContext, useContext, useState, ReactNode } from "react";

export interface Supplier {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  deliveryTime: string;
  reliability: number;
  totalOrders: number;
  totalSpent: number;
  status: string;
  contact: string;
  phone: string;
}

interface SuppliersContextType {
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, "id" | "totalOrders" | "totalSpent" | "reliability" | "status">) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
}

const SuppliersContext = createContext<SuppliersContextType | undefined>(undefined);

const initialSuppliers: Supplier[] = [
  {
    id: "SUP001",
    name: "BrakeTech Pro",
    category: "Brake Systems",
    location: "Detroit, MI",
    rating: 4.8,
    deliveryTime: "2-3 days",
    reliability: 98,
    totalOrders: 156,
    totalSpent: 89400,
    status: "Active",
    contact: "sales@braketech.com",
    phone: "(555) 123-4567"
  },
  {
    id: "SUP002", 
    name: "FilterMax Inc",
    category: "Filters & Fluids",
    location: "Chicago, IL",
    rating: 4.5,
    deliveryTime: "3-5 days", 
    reliability: 94,
    totalOrders: 98,
    totalSpent: 67200,
    status: "Active",
    contact: "orders@filtermax.com",
    phone: "(555) 234-5678"
  },
  {
    id: "SUP003",
    name: "IgniteCore",
    category: "Engine Parts",
    location: "Cleveland, OH",
    rating: 4.9,
    deliveryTime: "1-2 days",
    reliability: 99,
    totalOrders: 203,
    totalSpent: 124800,
    status: "Active", 
    contact: "support@ignitecore.com",
    phone: "(555) 345-6789"
  },
  {
    id: "SUP004",
    name: "LightTech Solutions",
    category: "Lighting",
    location: "Phoenix, AZ",
    rating: 4.2,
    deliveryTime: "4-6 days",
    reliability: 89,
    totalOrders: 45,
    totalSpent: 34500,
    status: "Warning",
    contact: "info@lighttech.com",
    phone: "(555) 456-7890"
  },
  {
    id: "SUP005",
    name: "AirFlow Pro",
    category: "Engine Parts",
    location: "Atlanta, GA", 
    rating: 4.6,
    deliveryTime: "2-4 days",
    reliability: 96,
    totalOrders: 78,
    totalSpent: 45600,
    status: "Active",
    contact: "sales@airflowpro.com",
    phone: "(555) 567-8901"
  }
];

const getStatus = (rating: number, reliability: number): string => {
  if (rating >= 4.5 && reliability >= 95) return "Active";
  if (rating >= 4.0 && reliability >= 90) return "Active";
  if (rating >= 3.5 || reliability >= 85) return "Warning";
  return "Inactive";
};

export function SuppliersProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);

  const addSupplier = (supplier: Omit<Supplier, "id" | "totalOrders" | "totalSpent" | "reliability" | "status">) => {
    const newId = `SUP${String(suppliers.length + 1).padStart(3, '0')}`;
    const status = getStatus(supplier.rating, 95); // Default reliability for new suppliers
    
    setSuppliers([...suppliers, { 
      ...supplier, 
      id: newId, 
      totalOrders: 0,
      totalSpent: 0,
      reliability: 95,
      status 
    }]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(suppliers.map(supplier => {
      if (supplier.id === id) {
        const updated = { ...supplier, ...updates };
        // Recalculate status if rating or reliability changed
        if (updates.rating !== undefined || updates.reliability !== undefined) {
          updated.status = getStatus(
            updated.rating, 
            updated.reliability
          );
        }
        return updated;
      }
      return supplier;
    }));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== id));
  };

  return (
    <SuppliersContext.Provider value={{ suppliers, addSupplier, updateSupplier, deleteSupplier }}>
      {children}
    </SuppliersContext.Provider>
  );
}

export function useSuppliers() {
  const context = useContext(SuppliersContext);
  if (context === undefined) {
    throw new Error("useSuppliers must be used within a SuppliersProvider");
  }
  return context;
}
