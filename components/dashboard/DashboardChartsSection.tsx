"use client";

import React, { useState } from "react";
import {
  DailySalesPoint,
  MonthlyRevenuePoint,
  CategorySalesPoint,
  BrandSalesPoint,
  PhoneModelSalesPoint,
} from "@/lib/types/dashboard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Smartphone,
  Award,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils/formatCurrency";

interface DashboardChartsSectionProps {
  dailySales: DailySalesPoint[];
  monthlyRevenue: MonthlyRevenuePoint[];
  categorySales: CategorySalesPoint[];
  topBrands: BrandSalesPoint[];
  topModels: PhoneModelSalesPoint[];
}

export const DashboardChartsSection: React.FC<DashboardChartsSectionProps> = ({
  dailySales,
  monthlyRevenue,
  categorySales,
  topBrands,
  topModels,
}) => {
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");

  const formatCurrencyLocal = (val: number) => {
    return formatCurrencyCompact(val);
  };

  return (
    <div className="space-y-6">
      {/* Top 2 Main Charts Row (Daily Sales / Monthly Revenue + Sales By Category) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Daily Sales / Monthly Revenue Toggle Chart (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {activeTab === "daily" ? "Daily Sales & Order Volume" : "Monthly Revenue vs Cost vs Profit"}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTab === "daily"
                  ? "Real-time revenue performance over the last 14 days"
                  : "Historical financial performance and gross profit growth"}
              </p>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <button
                onClick={() => setActiveTab("daily")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeTab === "daily"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Daily Sales
              </button>
              <button
                onClick={() => setActiveTab("monthly")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeTab === "monthly"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Monthly Revenue
              </button>
            </div>
          </div>

          {/* Chart Display Area */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "daily" ? (
                <AreaChart data={dailySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415522" />
                  <XAxis dataKey="dayLabel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={formatCurrencyLocal} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as DailySalesPoint;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                            <p className="font-bold text-slate-300">{data.date}</p>
                            <p className="text-indigo-400 font-extrabold text-sm">
                              Sales: {formatCurrency(data.sales)}
                            </p>
                            <p className="text-slate-400">Orders Processed: {data.orders}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415522" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={formatCurrencyLocal} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as MonthlyRevenuePoint;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                            <p className="font-bold text-slate-300">{data.month} 2026</p>
                            <p className="text-indigo-400 font-bold">Revenue: {formatCurrency(data.revenue)}</p>
                            <p className="text-rose-400 font-medium">COGS: {formatCurrency(data.cost)}</p>
                            <p className="text-emerald-400 font-bold">Gross Profit: {formatCurrency(data.grossProfit)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} name="Revenue" />
                  <Bar dataKey="grossProfit" fill="#10b981" radius={[6, 6, 0, 0]} name="Gross Profit" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Sales by Category */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Sales by Category
                </h3>
              </div>
              <Badge variant="purple" size="sm">Distribution</Badge>
            </div>

            {/* Category Donut & Progress Bars */}
            <div className="h-44 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="sales"
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), "Sales"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {categorySales.map((cat) => (
              <div key={cat.category} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="truncate max-w-[140px]">{cat.category}</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{cat.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom 2 Secondary Charts Row (Top Selling Brands + Top Selling Phone Models) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Brands Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Top Selling Brands
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">By Revenue</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topBrands} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#33415522" />
                <XAxis type="number" tickFormatter={formatCurrencyLocal} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis dataKey="brand" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as BrandSalesPoint;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold">{data.brand}</p>
                          <p className="text-indigo-400 font-semibold">Revenue: {formatCurrency(data.sales)}</p>
                          <p className="text-slate-300">Units Sold: {data.unitsSold.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sales" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Phone Models List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Top Selling Phone Models
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Volume & Growth</span>
          </div>

          <div className="space-y-3">
            {topModels.map((model, idx) => (
              <div
                key={model.model}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-500/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {model.model}
                    </h4>
                    <p className="text-[11px] text-slate-400">{model.brand} Compatibility Parts</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(model.revenue)}
                  </p>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[10px] text-slate-400 font-medium">{model.unitsSold} units</span>
                    <span
                      className={`text-[10px] font-bold ${
                        model.growthRate >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {model.growthRate >= 0 ? `+${model.growthRate}%` : `${model.growthRate}%`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
