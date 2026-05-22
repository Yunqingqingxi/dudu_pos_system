import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, ShoppingCart, CalendarDays, TrendingUp, ChevronRight, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDashboard, fetchChartData } from "@/api/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  const { data: chartData } = useQuery({
    queryKey: ["chartData"],
    queryFn: fetchChartData,
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">加载中...</div>;
  }

  const stats = [
    { title: "今日开单", value: data?.today_orders ?? 0, suffix: "单", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "今日销售额", value: formatCurrency(data?.today_amount ?? 0), suffix: "元", icon: ShoppingCart, color: "text-green-600", bg: "bg-green-50" },
    { title: "本月开单", value: data?.month_orders ?? 0, suffix: "单", icon: CalendarDays, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "本月销售额", value: formatCurrency(data?.month_amount ?? 0), suffix: "元", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const dailyData = (chartData?.daily_sales || []).map((d) => ({
    ...d,
    label: d.date.slice(5),
  }));

  const topProducts = chartData?.top_products || [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">仪表板</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <div className={"rounded-md p-1.5 " + s.bg}>
                <s.icon className={"h-4 w-4 " + s.color} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">
                {s.value}
                <span className="text-sm font-normal text-muted-foreground ml-1">{s.suffix}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              本月每日销售额
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                本月暂无销售数据
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dailyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" name="销售额" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              热销商品排行
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                暂无销售数据
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, topProducts.length * 32)}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total_qty" name="销量" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">最近单据</h2>
          <span className="text-sm text-primary cursor-pointer hover:underline" onClick={() => navigate("/orders")}>
            查看全部
          </span>
        </div>
        {(!data?.recent_orders || data.recent_orders.length === 0) ? (
          <div className="rounded-md border py-8 text-center text-sm text-muted-foreground">
            暂无单据，点击左侧「新建开单」开始使用
          </div>
        ) : (
          <div className="rounded-md border">
            {data.recent_orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate("/orders/" + order.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium text-sm">{order.order_no}</span>
                  <span className="text-sm text-muted-foreground">{formatDate(order.order_date)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm tabular-nums">
                    {order.total_qty} 件 / {formatCurrency(order.total_amount)} 元
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}