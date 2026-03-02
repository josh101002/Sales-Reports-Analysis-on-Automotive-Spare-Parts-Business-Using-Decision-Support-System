import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, TrendingDown, Calendar, Target, LineChart, BarChart3, Activity, AlertTriangle } from "lucide-react";
import { LineChart as RechartsLine, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { motion } from "motion/react";

// Mock data for sales predictions
const monthlyForecast = [
  { month: "Nov 2024", actual: 245000, predicted: 250000, upper: 265000, lower: 235000 },
  { month: "Dec 2024", actual: 268000, predicted: 275000, upper: 290000, lower: 260000 },
  { month: "Jan 2025", actual: 230000, predicted: 235000, upper: 250000, lower: 220000 },
  { month: "Feb 2025", actual: 240000, predicted: 245000, upper: 260000, lower: 230000 },
  { month: "Mar 2025", actual: null, predicted: 265000, upper: 285000, lower: 250000 },
  { month: "Apr 2025", actual: null, predicted: 285000, upper: 305000, lower: 270000 },
  { month: "May 2025", actual: null, predicted: 295000, upper: 315000, lower: 280000 },
  { month: "Jun 2025", actual: null, predicted: 310000, upper: 335000, lower: 295000 },
];

// Trend analysis data
const categoryTrends = [
  { category: "Brake Parts", q1: 85000, q2: 92000, q3: 88000, q4: 95000, growth: 12 },
  { category: "Engine Parts", q1: 65000, q2: 68000, q3: 72000, q4: 76000, growth: 17 },
  { category: "Filters", q1: 42000, q2: 45000, q3: 44000, q4: 48000, growth: 14 },
  { category: "Lighting", q1: 38000, q2: 35000, q3: 32000, q4: 30000, growth: -21 },
  { category: "Suspension", q1: 55000, q2: 58000, q3: 62000, q4: 67000, growth: 22 },
];

// Weekly trends
const weeklyTrends = [
  { week: "Week 1", sales: 58000, orders: 245, avgOrder: 237 },
  { week: "Week 2", sales: 62000, orders: 268, avgOrder: 231 },
  { week: "Week 3", sales: 59000, orders: 252, avgOrder: 234 },
  { week: "Week 4", sales: 65000, orders: 285, avgOrder: 228 },
  { week: "Week 5", sales: 67000, orders: 292, avgOrder: 230 },
  { week: "Week 6", sales: 70000, orders: 305, avgOrder: 230 },
];

// Seasonal patterns
const seasonalPattern = [
  { month: "Jan", avg2023: 220000, avg2024: 235000, predicted2025: 245000 },
  { month: "Feb", avg2023: 225000, avg2024: 240000, predicted2025: 250000 },
  { month: "Mar", avg2023: 245000, avg2024: 260000, predicted2025: 275000 },
  { month: "Apr", avg2023: 260000, avg2024: 275000, predicted2025: 290000 },
  { month: "May", avg2023: 270000, avg2024: 285000, predicted2025: 300000 },
  { month: "Jun", avg2023: 285000, avg2024: 300000, predicted2025: 320000 },
  { month: "Jul", avg2023: 295000, avg2024: 310000, predicted2025: 330000 },
  { month: "Aug", avg2023: 280000, avg2024: 295000, predicted2025: 310000 },
  { month: "Sep", avg2023: 265000, avg2024: 280000, predicted2025: 295000 },
  { month: "Oct", avg2023: 255000, avg2024: 270000, predicted2025: 285000 },
  { month: "Nov", avg2023: 240000, avg2024: 255000, predicted2025: 270000 },
  { month: "Dec", avg2023: 250000, avg2024: 265000, predicted2025: 280000 },
];

export function PredictionsTrendsView() {
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

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <motion.div variants={itemVariants}>
        <h1>Predictions & Trends Analysis</h1>
        <p className="text-muted-foreground">
          AI-powered sales forecasting, demand predictions, and comprehensive trend analysis
        </p>
      </motion.div>
      
      {/* Key Prediction Metrics */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants}>
        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Next Month Forecast</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">$285K</div>
            <p className="text-xs text-green-600 mt-1">+15% predicted growth</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Confidence: 92%
            </div>
          </CardContent>
        </Card>
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Q2 2025 Forecast</CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">$890K</div>
            <p className="text-xs text-blue-600 mt-1">Seasonal peak expected</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Confidence: 88%
            </div>
          </CardContent>
        </Card>
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Fastest Growing</CardTitle>
            <Target className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">Suspension</div>
            <p className="text-xs text-purple-600 mt-1">+22% YoY growth trend</p>
            <div className="mt-2 text-xs text-muted-foreground">
              High demand forecast
            </div>
          </CardContent>
        </Card>
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
        <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Risk Alert</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">Lighting</div>
            <p className="text-xs text-red-600 mt-1">-21% declining trend</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Consider action plan
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>

      {/* Tabbed Analysis Section */}
      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sales Forecast
          </TabsTrigger>
          <TabsTrigger value="category" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Category Trends
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Weekly Analysis
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Seasonal Patterns
          </TabsTrigger>
        </TabsList>

        {/* Sales Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>8-Month Sales Forecast with Confidence Intervals</CardTitle>
              <CardDescription>
                Predicted sales based on historical data, market trends, and seasonal patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={monthlyForecast}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => {
                      if (value === null || value === undefined) return 'N/A';
                      return `${(value / 1000).toFixed(0)}K`;
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    fill="#8b5cf6"
                    stroke="#8b5cf6"
                    strokeWidth={1}
                    fillOpacity={0.1}
                    name="Confidence Range"
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    fill="#ffffff"
                    stroke="#8b5cf6"
                    strokeWidth={1}
                    fillOpacity={1}
                    name=""
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    name="Actual Sales"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    name="Predicted Sales"
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Forecast Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Last Month</span>
                      <span className="text-green-600">96.2%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '96.2%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Last Quarter</span>
                      <span className="text-blue-600">94.5%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: '94.5%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>YTD Average</span>
                      <span className="text-purple-600">92.8%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '92.8%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                    <p>Summer season (Jun-Jul) expected to be strongest performing period</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p>March shows recovery pattern after winter slowdown</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <p>Plan inventory increase by 18% for Q2 peak demand</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Category Trends Tab */}
        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Category Performance Trends</CardTitle>
              <CardDescription>
                Year-over-year growth analysis across product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="category" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Legend />
                  <Bar dataKey="q1" fill="#3b82f6" name="Q1" />
                  <Bar dataKey="q2" fill="#8b5cf6" name="Q2" />
                  <Bar dataKey="q3" fill="#ec4899" name="Q3" />
                  <Bar dataKey="q4" fill="#10b981" name="Q4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category Growth Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryTrends.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat.category}</span>
                      <span className={cat.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                        {cat.growth > 0 ? '+' : ''}{cat.growth}% YoY
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${cat.growth > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                        style={{ width: `${Math.abs(cat.growth) * 4}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Analysis Tab */}
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trends</CardTitle>
              <CardDescription>
                Recent weekly sales patterns and order metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'sales') return `$${(value / 1000).toFixed(0)}K`;
                      return value;
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    name="Sales ($)"
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Week-over-Week Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-2">+8.2%</div>
                <p className="text-sm text-green-600">Sales increasing steadily</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Avg Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-2">$230</div>
                <p className="text-sm text-muted-foreground">Stable order size</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-2">+19.1%</div>
                <p className="text-sm text-green-600">More customers ordering</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Seasonal Patterns Tab */}
        <TabsContent value="seasonal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Year Seasonal Pattern Analysis</CardTitle>
              <CardDescription>
                Historical seasonal trends and 2025 predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLine data={seasonalPattern}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avg2023"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={false}
                    name="2023 Average"
                  />
                  <Line
                    type="monotone"
                    dataKey="avg2024"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="2024 Average"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted2025"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    name="2025 Predicted"
                  />
                </RechartsLine>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seasonal Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Summer Peak (Jun-Jul)</p>
                    <p className="text-muted-foreground">Highest sales period - increase inventory by 25%</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Spring Growth (Mar-May)</p>
                    <p className="text-muted-foreground">Steady increase as maintenance season begins</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingDown className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Winter Slowdown (Jan-Feb)</p>
                    <p className="text-muted-foreground">Annual low point - optimize promotions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">YoY Growth Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  +10.5%
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Expected overall growth for 2025 compared to 2024
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Best Month: July</span>
                    <span className="text-green-600">+15.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worst Month: February</span>
                    <span className="text-orange-600">+4.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Growth:</span>
                    <span className="text-purple-600">+10.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
