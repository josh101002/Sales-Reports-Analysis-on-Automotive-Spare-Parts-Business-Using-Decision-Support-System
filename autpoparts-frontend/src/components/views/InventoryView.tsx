import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Package, AlertTriangle, TrendingDown, Search, Plus, DollarSign, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { GlobalFilters } from "../../App";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useInventory, InventoryItem } from "../../contexts/InventoryContext";

interface InventoryViewProps {
  globalFilters?: GlobalFilters;
}

export function InventoryView({ globalFilters }: InventoryViewProps) {
  const { inventory, addProduct, updateProduct, deleteProduct } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Form state for add/edit product
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    sku: "",
    currentStock: "",
    minimumStock: "",
    reorderPoint: "",
    unitCost: "",
    supplier: "",
    location: ""
  });

  const resetForm = () => {
    setProductForm({
      name: "",
      category: "",
      sku: "",
      currentStock: "",
      minimumStock: "",
      reorderPoint: "",
      unitCost: "",
      supplier: "",
      location: ""
    });
  };

  const handleAddProduct = () => {
    if (!productForm.name || !productForm.category || !productForm.sku) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    addProduct({
      name: productForm.name,
      category: productForm.category,
      sku: productForm.sku,
      currentStock: parseInt(productForm.currentStock) || 0,
      minimumStock: parseInt(productForm.minimumStock) || 0,
      reorderPoint: parseInt(productForm.reorderPoint) || 0,
      unitCost: parseFloat(productForm.unitCost) || 0,
      supplier: productForm.supplier,
      location: productForm.location
    });
    
    toast.success(`Product "${productForm.name}" added successfully!`);
    setAddProductOpen(false);
    resetForm();
  };

  const handleEditClick = (product: InventoryItem) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      sku: product.sku,
      currentStock: product.currentStock.toString(),
      minimumStock: product.minimumStock.toString(),
      reorderPoint: product.reorderPoint.toString(),
      unitCost: product.unitCost.toString(),
      supplier: product.supplier,
      location: product.location
    });
    setEditProductOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct || !productForm.name || !productForm.category || !productForm.sku) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    updateProduct(selectedProduct.id, {
      name: productForm.name,
      category: productForm.category,
      sku: productForm.sku,
      currentStock: parseInt(productForm.currentStock) || 0,
      minimumStock: parseInt(productForm.minimumStock) || 0,
      reorderPoint: parseInt(productForm.reorderPoint) || 0,
      unitCost: parseFloat(productForm.unitCost) || 0,
      supplier: productForm.supplier,
      location: productForm.location
    });
    
    toast.success(`Product "${productForm.name}" updated successfully!`);
    setEditProductOpen(false);
    setSelectedProduct(null);
    resetForm();
  };

  const handleDeleteProduct = (product: InventoryItem) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(product.id);
      toast.success(`Product "${product.name}" deleted successfully!`);
    }
  };

  // Handle column sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Render sort icon
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-40" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="w-4 h-4 ml-1 inline text-[#FF6B00]" />
      : <ArrowDown className="w-4 h-4 ml-1 inline text-[#FF6B00]" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        stiffness: 100,
        damping: 10
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "In Stock": "secondary",
      "Low Stock": "destructive",
      "Critical": "destructive"
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const filteredInventory = useMemo(() => {
    let result = [...inventory];
    
    // Apply local search
    const activeSearchTerm = globalFilters?.searchTerm || searchTerm;
    if (activeSearchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(activeSearchTerm.toLowerCase())
      );
    }
    
    // Apply global category filter
    if (globalFilters?.categories && globalFilters.categories.length > 0) {
      result = result.filter(item => globalFilters.categories.includes(item.category));
    }
    
    // Apply global status filter
    if (globalFilters?.status && globalFilters.status.length > 0) {
      result = result.filter(item => globalFilters.status.includes(item.status));
    }
    
    // Apply price range filter
    if (globalFilters?.priceRange) {
      result = result.filter(item => 
        item.unitCost >= globalFilters.priceRange.min && 
        item.unitCost <= globalFilters.priceRange.max
      );
    }

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortColumn) {
          case "product":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "sku":
            aValue = a.sku.toLowerCase();
            bValue = b.sku.toLowerCase();
            break;
          case "category":
            aValue = a.category.toLowerCase();
            bValue = b.category.toLowerCase();
            break;
          case "currentStock":
            aValue = a.currentStock;
            bValue = b.currentStock;
            break;
          case "minStock":
            aValue = a.minimumStock;
            bValue = b.minimumStock;
            break;
          case "unitCost":
            aValue = a.unitCost;
            bValue = b.unitCost;
            break;
          case "supplier":
            aValue = a.supplier.toLowerCase();
            bValue = b.supplier.toLowerCase();
            break;
          case "status":
            aValue = a.status.toLowerCase();
            bValue = b.status.toLowerCase();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [searchTerm, globalFilters, inventory, sortColumn, sortDirection]);

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === "Low Stock").length;
  const criticalItems = inventory.filter(item => item.status === "Critical").length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);

  // Get detailed data for modals
  const getTotalItemsData = () => inventory.map(item => ({
    ...item,
    totalValue: item.currentStock * item.unitCost
  }));

  const getLowStockData = () => inventory.filter(item => item.status === "Low Stock");
  const getCriticalStockData = () => inventory.filter(item => item.status === "Critical");
  const getInventoryValueData = () => inventory.map(item => ({
    ...item,
    totalValue: item.currentStock * item.unitCost
  })).sort((a, b) => b.totalValue - a.totalValue);

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex justify-between items-start" variants={itemVariants}>
        <div>
          <h1>Inventory Management</h1>
          <p className="text-muted-foreground">
            Monitor stock levels and manage automotive parts inventory
          </p>
        </div>
        <Button onClick={() => setAddProductOpen(true)} className="bg-gradient-to-r from-[#FF6B00] to-[#FF8A50]">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </motion.div>

      {/* Summary Cards - Horizontal and Clickable */}
      <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6" variants={containerVariants}>
        <motion.div 
          variants={itemVariants} 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all border-0 shadow-lg"
            onClick={() => setModalOpen("total")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Items</CardTitle>
              <div className="p-2 bg-gradient-to-br from-[#FF6B00] to-[#FF8A50] rounded-lg">
                <Package className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-1">{totalItems}</div>
              <p className="text-sm text-muted-foreground">
                Active products
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          variants={itemVariants} 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all border-0 shadow-lg"
            onClick={() => setModalOpen("lowstock")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Low Stock</CardTitle>
              <div className="p-2 bg-gradient-to-br from-[#607D8B] to-[#B0BEC5] rounded-lg">
                <TrendingDown className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-1">{lowStockItems}</div>
              <p className="text-sm text-muted-foreground">
                Need reordering
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all border-0 shadow-lg"
            onClick={() => setModalOpen("critical")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Critical Stock</CardTitle>
              <div className="p-2 bg-gradient-to-br from-[#212121] to-[#424242] rounded-lg">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-1">{criticalItems}</div>
              <p className="text-sm text-muted-foreground">
                Urgent action needed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all border-0 shadow-lg"
            onClick={() => setModalOpen("value")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Inventory Value</CardTitle>
              <div className="p-2 bg-gradient-to-br from-[#FFA726] to-[#FF6B00] rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-1">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              <p className="text-sm text-muted-foreground">
                Total stock value
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div className="flex items-center space-x-4" variants={itemVariants}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Inventory Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
            <CardDescription>
              All automotive parts with current stock levels
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("product")}
                  >
                    Product {renderSortIcon("product")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("sku")}
                  >
                    SKU {renderSortIcon("sku")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("category")}
                  >
                    Category {renderSortIcon("category")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("currentStock")}
                  >
                    Current Stock {renderSortIcon("currentStock")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("minStock")}
                  >
                    Min Stock {renderSortIcon("minStock")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("unitCost")}
                  >
                    Unit Cost {renderSortIcon("unitCost")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("supplier")}
                  >
                    Supplier {renderSortIcon("supplier")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("status")}
                  >
                    Status {renderSortIcon("status")}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        item.currentStock <= item.reorderPoint ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {item.currentStock} units
                      </span>
                    </TableCell>
                    <TableCell>{item.minimumStock} units</TableCell>
                    <TableCell>${item.unitCost}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(item)}
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(item)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals - Total, Low Stock, Critical, Value */}
      <Dialog open={modalOpen === "total"} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              All Inventory Items
            </DialogTitle>
            <DialogDescription>
              Complete list of all products with value calculations
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getTotalItemsData().map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.currentStock} units</TableCell>
                    <TableCell>${item.unitCost}</TableCell>
                    <TableCell className="font-medium">${item.totalValue.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalOpen === "lowstock"} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-orange-600" />
              Low Stock Items
            </DialogTitle>
            <DialogDescription>
              Products that need reordering soon
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Minimum Stock</TableHead>
                  <TableHead>Reorder Point</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getLowStockData().map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-orange-600 font-medium">{item.currentStock} units</TableCell>
                    <TableCell>{item.minimumStock} units</TableCell>
                    <TableCell>{item.reorderPoint} units</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Reorder</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalOpen === "critical"} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Critical Stock Alerts
            </DialogTitle>
            <DialogDescription>
              Urgent: Products requiring immediate attention
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Minimum Required</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCriticalStockData().map((item) => (
                  <TableRow key={item.id} className="bg-red-50">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-red-600 font-bold">{item.currentStock} units</TableCell>
                    <TableCell>{item.minimumStock} units</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell className="font-mono text-sm">{item.location}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive">Urgent Reorder</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalOpen === "value"} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Inventory Value Breakdown
            </DialogTitle>
            <DialogDescription>
              Products sorted by total inventory value
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock Quantity</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getInventoryValueData().map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.currentStock} units</TableCell>
                    <TableCell>${item.unitCost}</TableCell>
                    <TableCell className="font-bold">${item.totalValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {((item.totalValue / totalValue) * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter the details for the new inventory item
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  placeholder="e.g., Ceramic Brake Pads"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={productForm.category} onValueChange={(value: string) => setProductForm({...productForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engine Parts">Engine Parts</SelectItem>
                    <SelectItem value="Brake System">Brake System</SelectItem>
                    <SelectItem value="Filters">Filters</SelectItem>
                    <SelectItem value="Suspension">Suspension</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Lighting">Lighting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                  placeholder="e.g., BP-CER-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={productForm.supplier}
                  onChange={(e) => setProductForm({...productForm, supplier: e.target.value})}
                  placeholder="e.g., BrakeTech Pro"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={productForm.currentStock}
                  onChange={(e) => setProductForm({...productForm, currentStock: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumStock">Min Stock</Label>
                <Input
                  id="minimumStock"
                  type="number"
                  value={productForm.minimumStock}
                  onChange={(e) => setProductForm({...productForm, minimumStock: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderPoint">Reorder Point</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  value={productForm.reorderPoint}
                  onChange={(e) => setProductForm({...productForm, reorderPoint: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost ($)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  value={productForm.unitCost}
                  onChange={(e) => setProductForm({...productForm, unitCost: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Warehouse Location</Label>
              <Input
                id="location"
                value={productForm.location}
                onChange={(e) => setProductForm({...productForm, location: e.target.value})}
                placeholder="e.g., A1-B3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {setAddProductOpen(false); resetForm();}}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct} className="bg-gradient-to-r from-[#FF6B00] to-[#FF8A50]">
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  placeholder="e.g., Ceramic Brake Pads"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select value={productForm.category} onValueChange={(value: string) => setProductForm({...productForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engine Parts">Engine Parts</SelectItem>
                    <SelectItem value="Brake System">Brake System</SelectItem>
                    <SelectItem value="Filters">Filters</SelectItem>
                    <SelectItem value="Suspension">Suspension</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Lighting">Lighting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU *</Label>
                <Input
                  id="edit-sku"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                  placeholder="e.g., BP-CER-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-supplier">Supplier</Label>
                <Input
                  id="edit-supplier"
                  value={productForm.supplier}
                  onChange={(e) => setProductForm({...productForm, supplier: e.target.value})}
                  placeholder="e.g., BrakeTech Pro"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-currentStock">Current Stock</Label>
                <Input
                  id="edit-currentStock"
                  type="number"
                  value={productForm.currentStock}
                  onChange={(e) => setProductForm({...productForm, currentStock: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minimumStock">Min Stock</Label>
                <Input
                  id="edit-minimumStock"
                  type="number"
                  value={productForm.minimumStock}
                  onChange={(e) => setProductForm({...productForm, minimumStock: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reorderPoint">Reorder Point</Label>
                <Input
                  id="edit-reorderPoint"
                  type="number"
                  value={productForm.reorderPoint}
                  onChange={(e) => setProductForm({...productForm, reorderPoint: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unitCost">Unit Cost ($)</Label>
                <Input
                  id="edit-unitCost"
                  type="number"
                  step="0.01"
                  value={productForm.unitCost}
                  onChange={(e) => setProductForm({...productForm, unitCost: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Warehouse Location</Label>
              <Input
                id="edit-location"
                value={productForm.location}
                onChange={(e) => setProductForm({...productForm, location: e.target.value})}
                placeholder="e.g., A1-B3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {setEditProductOpen(false); setSelectedProduct(null); resetForm();}}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct} className="bg-gradient-to-r from-[#FF6B00] to-[#FF8A50]">
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
