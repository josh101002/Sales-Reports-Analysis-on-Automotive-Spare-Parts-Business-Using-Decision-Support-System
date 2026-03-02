import { createContext, useContext, ReactNode } from "react";
import React, { useState, useEffect } from 'react';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
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

const getStatus = (current: number, min: number, reorder: number): string => {
  // Convert to numbers to ensure math works
  const currentStock = Number(current);
  const minStock = Number(min);
  const reorderPoint = Number(reorder);

  if (currentStock <= minStock) return "Critical"; // Changed for safety
  if (currentStock <= reorderPoint) return "Low Stock";
  return "In Stock";
};

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Load Data from Database
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/inventory');
        if (response.ok) {
          const data = await response.json();
          // Inside InventoryContext.tsx -> fetchInventory mapping
        // Inside fetchInventory in InventoryContext.tsx
        const formattedData = data.map((item: any) => {
          // Use the actual DB values for math
          const current = Number(item.current_stock);
          const min = Number(item.min_stock);
          const reorder = min * 1.2;

          return {
            id: `INV${String(item.product_id).padStart(3, '0')}`,
            name: item.product_name,
            category: item.category,
            sku: item.sku,
            currentStock: current,
            minimumStock: min, // <--- FIX: Stop hardcoding 300
            reorderPoint: reorder,
            unitCost: item.unit_cost,
            supplier: item.supplier_name || "N/A",
            status: getStatus(current, min, reorder) // Calculate correctly
          };
        });
          
          setInventory(formattedData);
        }
      } catch (error) {
        console.error("Error loading inventory:", error);
      }
    };
    fetchInventory();
  }, []);

  // Updated addProduct with Database connection
  const addProduct = async (product: Omit<InventoryItem, "id" | "status">) => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Use the ID returned from MySQL for the local state
        const newProduct: InventoryItem = {
          ...product,
          id: `INV${String(result.id).padStart(3, '0')}`,
          status: getStatus(product.currentStock, product.minimumStock, product.reorderPoint)
        };
        
        setInventory([...inventory, newProduct]);
        console.log("Product saved to database successfully!");
      } else {
        console.error("Failed to save to database");
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

const updateProduct = async (id: string, updates: Partial<InventoryItem>) => {
  const itemToUpdate = inventory.find(i => i.id === id);
  if (!itemToUpdate) return;

  // Merge existing item with updates to ensure no data is lost
  const updatedItem = { ...itemToUpdate, ...updates };
  
  // Recalculate status
  const newStatus = getStatus(
    updatedItem.currentStock, 
    updatedItem.minimumStock, 
    updatedItem.minimumStock * 1.2
  );
  
  const dataToSend = { ...updatedItem, status: newStatus };

  try {
    const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    });

    if (response.ok) {
      // Update UI state
      setInventory(prev => prev.map(item => 
        item.id === id ? dataToSend : item
      ));
      console.log("Database and UI updated successfully");
    } else {
      console.error("Server rejected the update");
    }
  } catch (error) {
    console.error("Network error during update:", error);
  }
};

  // Update this function in your InventoryContext.tsx
const deleteProduct = async (id: string) => {
    try {
        // 1. Send the DELETE request to your Express server (Port 5000)
        const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            // 2. Only if the DB delete works, update the frontend UI
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