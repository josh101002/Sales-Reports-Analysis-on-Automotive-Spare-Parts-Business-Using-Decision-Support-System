import { useState } from "react";
import { TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";

const kpiData = [
  {
    title: "Total Revenue",
    value: "$248,500",
    change: "+12.5%",
    isPositive: true,
    icon: DollarSign,
    id: "revenue"
  },
  {
    title: "Units Sold",
    value: "1,847",
    change: "+8.2%",
    isPositive: true,
    icon: Package,
    id: "units"
  },
  {
    title: "Top Product",
    value: "Brake Pads",
    change: "425 units",
    isPositive: true,
    icon: TrendingUp,
    id: "topproduct"
  },
  {
    title: "Return Rate",
    value: "2.1%",
    change: "-0.5%",
    isPositive: true,
    icon: TrendingDown,
    id: "returns"
  },
];

const revenueData = [
  { month: "January", revenue: 42000, transactions: 245, avgOrder: 171 },
  { month: "February", revenue: 45000, transactions: 268, avgOrder: 168 },
  { month: "March", revenue: 48000, transactions: 289, avgOrder: 166 },
  { month: "April", revenue: 52000, transactions: 312, avgOrder: 167 },
  { month: "May", revenue: 49000, transactions: 298, avgOrder: 164 },
  { month: "June", revenue: 55000, transactions: 334, avgOrder: 165 },
  { month: "July", revenue: 61000, transactions: 368, avgOrder: 166 },
  { month: "August", revenue: 58000, transactions: 351, avgOrder: 165 },
  { month: "September", revenue: 64000, transactions: 387, avgOrder: 165 },
  { month: "October", revenue: 68500, transactions: 412, avgOrder: 166 },
];

const unitsData = [
  { product: "Ceramic Brake Pads", units: 425, revenue: 42500, category: "Brake System" },
  { product: "Premium Oil Filter", units: 380, revenue: 19000, category: "Filters" },
  { product: "Platinum Spark Plugs", units: 320, revenue: 16000, category: "Engine Parts" },
  { product: "Air Filter Standard", units: 280, revenue: 14000, category: "Filters" },
  { product: "Brake Rotors", units: 185, revenue: 37000, category: "Brake System" },
];

const topProductData = [
  { metric: "Total Units Sold", value: "425 units" },
  { metric: "Revenue Generated", value: "$42,500" },
  { metric: "Average Price", value: "$100" },
  { metric: "Market Share", value: "23.1%" },
  { metric: "Growth vs Last Month", value: "+12%" },
];

const returnData = [
  { reason: "Defective", count: 12, percentage: "28.5%" },
  { reason: "Wrong Part", count: 18, percentage: "42.8%" },
  { reason: "Customer Changed Mind", count: 8, percentage: "19.0%" },
  { reason: "Other", count: 4, percentage: "9.7%" },
];

export function KPICards() {
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <motion.div
            key={kpi.title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="hover:shadow-xl transition-all cursor-pointer border-0 shadow-lg"
              onClick={() => setModalOpen(kpi.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">
                  {kpi.title}
                </CardTitle>
                <div className="p-2 bg-gradient-to-br from-[#FF6B00] to-[#FF8A50] rounded-lg">
                  <kpi.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-1">{kpi.value}</div>
                <p className={`text-sm ${kpi.isPositive ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                  {kpi.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Modal */}
      <Dialog open={modalOpen === "revenue"} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Total Revenue Breakdown
            </DialogTitle>
            <DialogDescription>
              Monthly revenue performance analysis
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Avg Order Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell>${row.revenue.toLocaleString()}</TableCell>
                    <TableCell>{row.transactions}</TableCell>
                    <TableCell>${row.avgOrder}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Units Sold Modal */}
      <Dialog open={modalOpen === "units"} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Units Sold Breakdown
            </DialogTitle>
            <DialogDescription>
              Top products by units sold
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unitsData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.product}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.units} units</TableCell>
                    <TableCell>${row.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Product Modal */}
      <Dialog open={modalOpen === "topproduct"} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Top Product Performance
            </DialogTitle>
            <DialogDescription>
              Detailed performance metrics for Brake Pads
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProductData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.metric}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.value}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Return Rate Modal */}
      <Dialog open={modalOpen === "returns"} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <TrendingDown className="w-5 h-5 mr-2" />
              Return Rate Analysis
            </DialogTitle>
            <DialogDescription>
              Breakdown of product returns by reason
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return Reason</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.reason}</TableCell>
                    <TableCell>{row.count}</TableCell>
                    <TableCell>
                      <Badge variant={row.percentage.includes('42') ? "destructive" : "secondary"}>
                        {row.percentage}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
