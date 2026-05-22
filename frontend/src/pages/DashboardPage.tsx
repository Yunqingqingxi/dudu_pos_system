import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, ShoppingCart, CalendarDays, TrendingUp, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDashboard } from "@/api/client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">加载中...</div>;
  }

  const stats = [
    {
      title: "今日开单",
      value: data?.today_orders ?? 0,
      suffix: "单",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "今日销售额",
      value: formatCurrency(data?.today_amount ?? 0),
      suffix: "元",
      icon: ShoppingCart,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "本月开单",
      value: data?.month_orders ?? 0,
      suffix: "单",
      icon: CalendarDays,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "本月销售额",
      value: formatCurrency(data?.month_amount ?? 0),
      suffix: "元",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">仪表板</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <div className={`rounded-md p-1.5 ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
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

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">最近单据</h2>
          <span
            className="text-sm text-primary cursor-pointer hover:underline"
            onClick={() => navigate("/orders")}
          >
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
                onClick={() => navigate(`/orders/${order.id}`)}
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
