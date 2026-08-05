"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  BarChart,
  LineChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  DailySalesData,
  RevenueVsCostData,
  ProfitMarginData,
  TopCustomerData,
} from "@/lib/types/sales";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, DollarSign, Award, ArrowUpRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils/formatCurrency";

interface SalesChartsSectionProps {
  dailySales: DailySalesData[];
  revenueVsCost: RevenueVsCostData[];
  profitMargins: ProfitMarginData[];
  topCustomers: TopCustomerData[];
}

export const SalesChartsSection: React.FC<SalesChartsSectionProps> = ({
  dailySales,
  revenueVsCost,
  profitMargins,
  topCustomers,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<"daily" | "revenue" | "profit">("daily");

  return (
    <div className="space-y-6">
      {/* Upper Grid: Primary Interactive Chart + Top Customers Leaderboard */}
      <div className="grid grid-[1fr] lg:grid-cols-3 gap-6">
        {/* Main Chart Card (Spans 2 columns) */}
        <Card className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                  Sales Telemetry Analytics
                </h3>
                <Badge variant="purple" size="sm">
                  Live Feed
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time tracking of revenue velocity, gross profit margins, and daily target pacing.
              </p>
            </div>

            {/* Chart View Switcher */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setActiveChartTab("daily")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeChartTab === "daily"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Daily Sales
              </button>
              <button
                onClick={() => setActiveChartTab("revenue")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeChartTab === "revenue"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Revenue vs Cost
              </button>
              <button
                onClick={() => setActiveChartTab("profit")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeChartTab === "profit"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Profit Margin
              </button>
            </div>
          </div>

          {/* 1. Daily Sales Velocity Chart */}
          {activeChartTab === "daily" && (
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                <span>Daily Revenue vs Daily Target Line</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs Target Avg
                </span>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="wholesaleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="retailGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                    <XAxis dataKey="dayLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => formatCurrencyCompact(v)} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                      }}
                      formatter={(value: any) => [formatCurrency(Number(value)), undefined]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Bar dataKey="wholesaleSales" name="Wholesale B2B Revenue" fill="url(#wholesaleGrad)" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="retailSales" name="Retail & POS Revenue" fill="url(#retailGrad)" radius={[4, 4, 0, 0]} stackId="a" />
                    <Line type="monotone" dataKey="target" name={`Daily Target (${formatCurrencyCompact(12500)})`} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 2. Revenue vs Cost Chart */}
          {activeChartTab === "revenue" && (
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                <span>Monthly Gross Revenue vs Cost of Goods Sold (COGS)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(revenueVsCost.reduce((sum, item) => sum + item.revenue, 0))} Total Revenue</span>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueVsCost} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => formatCurrencyCompact(v)} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [formatCurrency(Number(val)), undefined]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#4f46e5" strokeWidth={2.5} fill="url(#revGrad)" />
                    <Area type="monotone" dataKey="cost" name="COGS Cost" stroke="#f59e0b" strokeWidth={2} fill="url(#costGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 3. Profit Margin Chart */}
          {activeChartTab === "profit" && (
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                <span>Monthly Gross Profit and Net Margin % Trend</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{profitMargins.length > 0 ? Math.round(profitMargins.reduce((sum, item) => sum + item.netMarginPercentage, 0) / profitMargins.length) : 35}% Avg Margin</span>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={profitMargins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => formatCurrencyCompact(v)} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Bar yAxisId="left" dataKey="grossProfit" name="Gross Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="netMarginPercentage" name="Gross Margin %" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>

        {/* Top Customers Leaderboard Card */}
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                    Top Customer Leaderboard
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">By total revenue contribution</p>
                </div>
              </div>
              <Badge variant="warning" size="sm">B2B Heavy</Badge>
            </div>

            {/* Customer Roster */}
            <div className="space-y-3.5">
              {topCustomers.map((cust, idx) => (
                <div
                  key={cust.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-black text-slate-400 w-4 text-center">
                      #{idx + 1}
                    </span>
                    <div className={`w-8 h-8 rounded-full ${cust.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {cust.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{cust.ordersCount} orders</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" /> {cust.paymentReliabilityScore}% paid score
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono block">
                      {formatCurrency(cust.totalSpent)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ~{formatCurrency(cust.avgOrderValue)}/ord
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold">
            <span>View All B2B Accounts</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Card>
      </div>
    </div>
  );
};
