import { createContext, useContext, ReactNode } from "react";
import React, { useState, useEffect } from 'react';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  unitCost: number;
  supplier: string;
  location: string;
  status: string;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  setInventory: (inventory: InventoryItem[]) => void;
  addProduct: (product: Omit<InventoryItem, "id" | "status">) => Promise<void>;
  updateProduct: (id: string, product: Partial<InventoryItem>) => void;
  deleteProduct: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const getStatus = (current: number, min: number): string => {
  const currentStock = Number(current);
  const minStock = Number(min);

  if (currentStock <= minStock) return "Critical"; 
  return "In Stock";
};

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const fetchInventory = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const companyId = savedUser.company_id;

    if (!companyId) {
      setInventory([]); 
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/inventory?company_id=${companyId}`);
      const data = await response.json();
      
      const mappedData = data.map((item: any) => ({
        id: `INV${String(item.product_id).padStart(3, '0')}`,
        name: item.product_name,        
        category: item.category,
        sku: item.sku || "",
        currentStock: Number(item.current_stock), 
        minimumStock: Number(item.min_stock),
        unitCost: Number(item.unit_cost),
        supplier: item.supplier || "",
        status: item.status,
        location: item.location || ""
      }));
      
      setInventory(mappedData);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  // Listen for both initial mount and account switches
  useEffect(() => {
    fetchInventory();
    
    // Custom listener for login events triggered from App.tsx
    const handleReFetch = () => fetchInventory();
    window.addEventListener("userLogin", handleReFetch);
    
    return () => window.removeEventListener("userLogin", handleReFetch);
  }, []);

  const addProduct = async (product: Omit<InventoryItem, "id" | "status">) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const companyId = savedUser.company_id;

      if (!companyId) return;

      const payload = { 
        product_name: product.name,    
        category: product.category,
        current_stock: Number(product.currentStock), 
        unit_cost: Number(product.unitCost),         
        status: getStatus(product.currentStock, product.minimumStock),
        company_id: companyId,
        min_stock: Number(product.minimumStock),
        sku: product.sku,
        supplier: product.supplier,
        location: product.location
      };

      const response = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        const newProduct: InventoryItem = {
          ...product,
          id: `INV${String(result.id).padStart(3, '0')}`,
          status: payload.status
        };
        setInventory(prev => [...prev, newProduct]);
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const updateProduct = async (id: string, updates: Partial<InventoryItem>) => {
    // 1. STRIP PREFIX: Convert "INV014" to "14" so the DB can find it
    const numericId = id.replace('INV', '').replace(/^0+/, ''); 

    const itemToUpdate = inventory.find(i => i.id === id);
    if (!itemToUpdate) return;

    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedItem = { ...itemToUpdate, ...updates };
    
    const dataToSend = { 
      product_name: updatedItem.name,
      category: updatedItem.category,
      current_stock: Number(updatedItem.currentStock), 
      unit_cost: Number(updatedItem.unitCost), // Ensure this matches your interface
      status: getStatus(updatedItem.currentStock, updatedItem.minimumStock),
      user_id: savedUser.user_id || 0,
      user_name: savedUser.user_name || "Owner",
      role: savedUser.role
    };

    try {
      // 2. USE numericId: Send the clean number to the API
      const response = await fetch(`http://localhost:5000/api/inventory/${numericId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        // 3. UPDATE LOCAL STATE: Use the original 'id' ("INV014") for React's state
        setInventory(prev => prev.map(item => item.id === id ? updatedItem : item));
        console.log("Update successful for Product ID:", numericId);
      } else {
        const errorText = await response.text();
        console.error("Server update failed:", errorText);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
};

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setInventory(prev => prev.filter(item => item.id !== id));
        console.log("Deleted from Database");
      } else {
        console.error("Failed to delete from Database");
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    }
  };

  return (
    <InventoryContext.Provider value={{ inventory, setInventory, addProduct, updateProduct, deleteProduct }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
