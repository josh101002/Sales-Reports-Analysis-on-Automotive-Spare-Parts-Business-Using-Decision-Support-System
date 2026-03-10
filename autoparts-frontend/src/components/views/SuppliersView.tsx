import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Truck, MapPin, Star, TrendingUp, AlertCircle, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { spring } from "motion";
import { toast } from "sonner";
import { useSuppliers, Supplier } from "../../contexts/SuppliersContext";

const recentOrders = [
  {
    orderId: "PO-2024-1089",
    supplier: "BrakeTech Pro",
    items: "Ceramic Brake Pads x50",
    amount: 4499.50,
    orderDate: "2024-10-01",
    expectedDelivery: "2024-10-03",
    status: "Delivered"
  },
  {
    orderId: "PO-2024-1090", 
    supplier: "IgniteCore",
    items: "Spark Plugs x100",
    amount: 4599.00,
    orderDate: "2024-10-02",
    expectedDelivery: "2024-10-04",
    status: "In Transit"
  },
  {
    orderId: "PO-2024-1091",
    supplier: "FilterMax Inc", 
    items: "Oil Filters x75",
    amount: 1837.50,
    orderDate: "2024-10-03",
    expectedDelivery: "2024-10-07",
    status: "Processing"
  }
];

export function SuppliersView() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState("");
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [editSupplierOpen, setEditSupplierOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  
  // Form state for add supplier
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    category: "",
    location: "",
    contact: "",
    phone: "",
    deliveryTime: "",
    rating: 4.0
  });

  // Form state for edit supplier
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    location: "",
    contact: "",
    phone: "",
    deliveryTime: "",
    rating: 4.0,
    reliability: 95,
    totalOrders: 0,
    totalSpent: 0
  });

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.category || !newSupplier.contact) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    addSupplier(newSupplier);
    
    toast.success(`Supplier "${newSupplier.name}" added successfully!`);
    
    setAddSupplierOpen(false);
    // Reset form
    setNewSupplier({
      name: "",
      category: "",
      location: "",
      contact: "",
      phone: "",
      deliveryTime: "",
      rating: 4.0
    });
  };

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditForm({
      name: supplier.name,
      category: supplier.category,
      location: supplier.location,
      contact: supplier.contact,
      phone: supplier.phone,
      deliveryTime: supplier.deliveryTime,
      rating: supplier.rating,
      reliability: supplier.reliability,
      totalOrders: supplier.totalOrders,
      totalSpent: supplier.totalSpent
    });
    setEditSupplierOpen(true);
  };

  const handleUpdateSupplier = () => {
    if (!selectedSupplier) return;
    
    if (!editForm.name || !editForm.category || !editForm.contact) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    updateSupplier(selectedSupplier.id, editForm);
    
    toast.success(`Supplier "${editForm.name}" updated successfully!`);
    
    setEditSupplierOpen(false);
    setSelectedSupplier(null);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedSupplier) return;
    
    deleteSupplier(selectedSupplier.id);
    
    toast.success(`Supplier "${selectedSupplier.name}" deleted successfully!`);
    
    setDeleteDialogOpen(false);
    setSelectedSupplier(null);
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
        type: spring,
        stiffness: 100,
        damping: 10
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "Active": "secondary",
      "Warning": "destructive", 
      "Inactive": "outline"
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getOrderStatusBadge = (status: string) => {
    const variants = {
      "Delivered": "secondary",
      "In Transit": "default",
      "Processing": "outline"
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSuppliers = suppliers.filter(s => s.status === "Active").length;
  const avgRating = suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length) : 0;
  const totalSpend = suppliers.reduce((sum, s) => sum + s.totalSpent, 0);
  const avgReliability = suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.reliability, 0) / suppliers.length) : 0;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex justify-between items-start" variants={itemVariants}>
        <div>
          <h1>Supplier Management</h1>
          <p className="text-muted-foreground">
            Manage relationships with automotive parts suppliers
          </p>
        </div>
        <Button onClick={() => setAddSupplierOpen(true)} className="bg-gradient-to-r from-[#FF6B00] to-[#FF8A50]">
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </motion.div>

      {/* Summary Cards - Clickable with Modals */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={containerVariants}>
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card 
            className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            onClick={() => setModalOpen("active")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Active Suppliers</CardTitle>
              <div className="p-2 bg-gradient-to-br from-[#FF6B00] to-[#FF8A50] rounded-lg">
                <Truck className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-1">{activeSuppliers}</div>
              <p className="text-sm text-muted-foreground">
                {suppliers.length} total suppliers
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card 
            className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            onClick={() => setModalOpen("spend")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Spend</CardTitle>
              <div className="p-2 bg-gradient-to-br from-[#212121] to-[#424242] rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-1">${(totalSpend / 1000).toFixed(1)}K</div>
              <p className="text-sm text-muted-foreground">
                This year
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Tabs defaultValue="suppliers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="suppliers">All Suppliers</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Suppliers Table */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Delivery Time</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">{supplier.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{supplier.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                          {supplier.location}
                        </div>
                      </TableCell>
                      <TableCell>{supplier.deliveryTime}</TableCell>
                      <TableCell>{supplier.totalOrders}</TableCell>
                      <TableCell>${supplier.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(supplier)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(supplier)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Purchase Orders</CardTitle>
              <CardDescription>
                Latest orders placed with suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>{order.supplier}</TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>${order.amount.toLocaleString()}</TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{order.expectedDelivery}</TableCell>
                      <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Top Performing Suppliers</CardTitle>
                <CardDescription>
                  Based on total spare parts delivered and delivery performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers
                    .sort((a, b) => {
                      // Sort by total orders first, then by reliability
                      const orderDiff = b.totalOrders - a.totalOrders;
                      if (orderDiff !== 0) return orderDiff;
                      return b.reliability - a.reliability;
                    })
                    .slice(0, 5)
                    .map((supplier, index) => (
                      <div key={supplier.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B00] to-[#FF8A50] rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-muted-foreground">{supplier.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{supplier.totalOrders} parts</p>
                          <p className="text-xs text-muted-foreground">{supplier.reliability}% on-time</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
                <CardDescription>
                  Average delivery times by supplier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{supplier.name}</span>
                        <span className="text-sm">{supplier.deliveryTime}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            supplier.deliveryTime.includes('1-2') ? 'bg-green-600' :
                            supplier.deliveryTime.includes('2-3') || supplier.deliveryTime.includes('2-4') ? 'bg-blue-600' :
                            supplier.deliveryTime.includes('3-5') ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ 
                            width: `${Math.max(20, 100 - (parseInt(supplier.deliveryTime) * 15))}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Supplier Dialog */}
      <Dialog open={addSupplierOpen} onOpenChange={setAddSupplierOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Enter the details for the new supplier
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier Name *</Label>
                <Input
                  id="supplierName"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  placeholder="e.g., BrakeTech Pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierCategory">Category *</Label>
                <Select value={newSupplier.category} onValueChange={(value: string) => setNewSupplier({...newSupplier, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brake Systems">Brake Systems</SelectItem>
                    <SelectItem value="Engine Parts">Engine Parts</SelectItem>
                    <SelectItem value="Filters & Fluids">Filters & Fluids</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Lighting">Lighting</SelectItem>
                    <SelectItem value="Suspension">Suspension</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierContact">Contact Email *</Label>
                <Input
                  id="supplierContact"
                  type="email"
                  value={newSupplier.contact}
                  onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                  placeholder="sales@supplier.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierPhone">Phone Number</Label>
                <Input
                  id="supplierPhone"
                  type="tel"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierLocation">Location</Label>
                <Input
                  id="supplierLocation"
                  value={newSupplier.location}
                  onChange={(e) => setNewSupplier({...newSupplier, location: e.target.value})}
                  placeholder="City, State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierDelivery">Delivery Time</Label>
                <Select value={newSupplier.deliveryTime} onValueChange={(value: string) => setNewSupplier({...newSupplier, deliveryTime: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 days">1-2 days</SelectItem>
                    <SelectItem value="2-3 days">2-3 days</SelectItem>
                    <SelectItem value="3-5 days">3-5 days</SelectItem>
                    <SelectItem value="5-7 days">5-7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierRating">Initial Rating</Label>
              <Select value={newSupplier.rating.toString()} onValueChange={(value: string) => setNewSupplier({...newSupplier, rating: parseFloat(value)})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5.0">5.0 - Excellent</SelectItem>
                  <SelectItem value="4.5">4.5 - Very Good</SelectItem>
                  <SelectItem value="4.0">4.0 - Good</SelectItem>
                  <SelectItem value="3.5">3.5 - Average</SelectItem>
                  <SelectItem value="3.0">3.0 - Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSupplierOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSupplier} className="bg-gradient-to-r from-[#FF6B00] to-[#FF8A50]">
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={editSupplierOpen} onOpenChange={setEditSupplierOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update supplier information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editSupplierName">Supplier Name *</Label>
                <Input
                  id="editSupplierName"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSupplierCategory">Category *</Label>
                <Select value={editForm.category} onValueChange={(value: string) => setEditForm({...editForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brake Systems">Brake Systems</SelectItem>
                    <SelectItem value="Engine Parts">Engine Parts</SelectItem>
                    <SelectItem value="Filters & Fluids">Filters & Fluids</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Lighting">Lighting</SelectItem>
                    <SelectItem value="Suspension">Suspension</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editSupplierContact">Contact Email *</Label>
                <Input
                  id="editSupplierContact"
                  type="email"
                  value={editForm.contact}
                  onChange={(e) => setEditForm({...editForm, contact: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSupplierPhone">Phone Number</Label>
                <Input
                  id="editSupplierPhone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editSupplierLocation">Location</Label>
                <Input
                  id="editSupplierLocation"
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSupplierDelivery">Delivery Time</Label>
                <Select value={editForm.deliveryTime} onValueChange={(value: string) => setEditForm({...editForm, deliveryTime: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 days">1-2 days</SelectItem>
                    <SelectItem value="2-3 days">2-3 days</SelectItem>
                    <SelectItem value="3-5 days">3-5 days</SelectItem>
                    <SelectItem value="5-7 days">5-7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editSupplierRating">Rating</Label>
                <Select value={editForm.rating.toString()} onValueChange={(value: string) => setEditForm({...editForm, rating: parseFloat(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5.0">5.0 - Excellent</SelectItem>
                    <SelectItem value="4.5">4.5 - Very Good</SelectItem>
                    <SelectItem value="4.0">4.0 - Good</SelectItem>
                    <SelectItem value="3.5">3.5 - Average</SelectItem>
                    <SelectItem value="3.0">3.0 - Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSupplierReliability">Reliability (%)</Label>
                <Input
                  id="editSupplierReliability"
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.reliability}
                  onChange={(e) => setEditForm({...editForm, reliability: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editSupplierOrders">Total Orders</Label>
                <Input
                  id="editSupplierOrders"
                  type="number"
                  min="0"
                  value={editForm.totalOrders}
                  onChange={(e) => setEditForm({...editForm, totalOrders: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSupplierSpent">Total Spent ($)</Label>
                <Input
                  id="editSupplierSpent"
                  type="number"
                  min="0"
                  value={editForm.totalSpent}
                  onChange={(e) => setEditForm({...editForm, totalSpent: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSupplierOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSupplier} className="bg-gradient-to-r from-[#FF6B00] to-[#FF8A50]">
              Update Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the supplier "{selectedSupplier?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Active Suppliers Modal */}
      <Dialog open={modalOpen === "active"} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              All Active Suppliers
            </DialogTitle>
            <DialogDescription>
              Complete list of active supplier partnerships
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.category}</TableCell>
                    <TableCell>{supplier.location}</TableCell>
                    <TableCell>{supplier.rating}</TableCell>
                    <TableCell>{supplier.totalOrders}</TableCell>
                    <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Modal */}
      <Dialog open={modalOpen === "rating"} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Supplier Ratings
            </DialogTitle>
            <DialogDescription>
              Performance ratings for all suppliers
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Reliability</TableHead>
                  <TableHead>Delivery Time</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.sort((a, b) => b.rating - a.rating).map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {supplier.rating}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.reliability >= 95 ? "secondary" : "default"}>
                        {supplier.reliability}%
                      </Badge>
                    </TableCell>
                    <TableCell>{supplier.deliveryTime}</TableCell>
                    <TableCell>{supplier.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spend Modal */}
      <Dialog open={modalOpen === "spend"} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Total Spend Analysis
            </DialogTitle>
            <DialogDescription>
              Spending breakdown by supplier
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Avg Order Value</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.sort((a, b) => b.totalSpent - a.totalSpent).map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.totalOrders}</TableCell>
                    <TableCell className="font-bold">${supplier.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>${supplier.totalOrders > 0 ? Math.round(supplier.totalSpent / supplier.totalOrders).toLocaleString() : 0}</TableCell>
                    <TableCell>{supplier.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery Modal */}
      <Dialog open={modalOpen === "delivery"} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              On-Time Delivery Performance
            </DialogTitle>
            <DialogDescription>
              Delivery reliability and timings
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Reliability</TableHead>
                  <TableHead>Delivery Time</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>On-Time Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.sort((a, b) => b.reliability - a.reliability).map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <Badge variant={supplier.reliability >= 95 ? "secondary" : supplier.reliability >= 90 ? "default" : "destructive"}>
                        {supplier.reliability}%
                      </Badge>
                    </TableCell>
                    <TableCell>{supplier.deliveryTime}</TableCell>
                    <TableCell>{supplier.totalOrders}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {Math.round(supplier.totalOrders * (supplier.reliability / 100))} orders
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
