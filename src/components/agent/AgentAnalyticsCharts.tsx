import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Sale {
  id: string;
  sale_amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

interface AgentAnalyticsChartsProps {
  sales: Sale[];
  totalReferrals?: number;
  convertedReferrals?: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const AgentAnalyticsCharts = ({ sales, totalReferrals = 0, convertedReferrals = 0 }: AgentAnalyticsChartsProps) => {
  // Process sales data for trends chart (last 30 days)
  const salesTrends = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const salesByDate = sales.reduce((acc, sale) => {
      const date = sale.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = { sales: 0, commission: 0 };
      }
      acc[date].sales += Number(sale.sale_amount);
      acc[date].commission += Number(sale.commission_amount);
      return acc;
    }, {} as Record<string, { sales: number; commission: number }>);

    return last30Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: salesByDate[date]?.sales || 0,
      commission: salesByDate[date]?.commission || 0,
    }));
  }, [sales]);

  // Commission history by month
  const commissionHistory = useMemo(() => {
    const monthlyData = sales.reduce((acc, sale) => {
      const month = new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += Number(sale.commission_amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyData)
      .map(([month, commission]) => ({ month, commission }))
      .slice(-6);
  }, [sales]);

  // Referral conversion data
  const conversionData = useMemo(() => {
    const nonConverted = Math.max(0, totalReferrals - convertedReferrals);
    return [
      { name: "Converted", value: convertedReferrals },
      { name: "Not Converted", value: nonConverted },
    ];
  }, [totalReferrals, convertedReferrals]);

  const conversionRate = totalReferrals > 0 
    ? ((convertedReferrals / totalReferrals) * 100).toFixed(1) 
    : "0";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Sales Trends Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Sales & Commission Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrends}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₵${value}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`₵${value.toFixed(2)}`, '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#salesGradient)" 
                  name="Sales"
                />
                <Area 
                  type="monotone" 
                  dataKey="commission" 
                  stroke="hsl(var(--chart-2))" 
                  fill="url(#commissionGradient)" 
                  name="Commission"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Commission History */}
      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commissionHistory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₵${value}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`₵${value.toFixed(2)}`, 'Commission']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="commission" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Referral Conversion */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex flex-col items-center justify-center">
            {totalReferrals > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={conversionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {conversionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-2">
                  <p className="text-3xl font-bold text-primary">{conversionRate}%</p>
                  <p className="text-sm text-muted-foreground">
                    {convertedReferrals} of {totalReferrals} referrals converted
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>No referral data yet</p>
                <p className="text-sm">Share your referral link to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentAnalyticsCharts;
