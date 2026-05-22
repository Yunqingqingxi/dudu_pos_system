import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Printer, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintReceipt } from "@/components/print/PrintReceipt";
import { fetchOrder, deleteOrder } from "@/api/client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">加载中...</div>;
  }

  if (!order) {
    return <div className="py-8 text-center text-muted-foreground">单据不存在</div>;
  }

  function handlePrint() {
    window.print();
  }

  async function handleDelete() {
    if (confirm("确定要删除该单据吗？此操作不可恢复。")) {
      await deleteOrder(order!.id);
      navigate("/orders");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">单据详情</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrint}>
            <Printer className="mr-1 h-4 w-4" />
            打印
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-1 h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="border-b bg-muted/30 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-muted-foreground">单号：</span>
              <span className="font-semibold">{order.order_no}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">日期：</span>
              <span>{formatDate(order.order_date)}</span>
            </div>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 w-12 px-4 text-left text-xs font-medium text-muted-foreground">行号</th>
              <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">品名</th>
              <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">规格型号</th>
              <th className="h-10 w-20 px-4 text-left text-xs font-medium text-muted-foreground">单位</th>
              <th className="h-10 w-20 px-4 text-right text-xs font-medium text-muted-foreground">数量</th>
              <th className="h-10 w-28 px-4 text-right text-xs font-medium text-muted-foreground">单价（元）</th>
              <th className="h-10 w-28 px-4 text-right text-xs font-medium text-muted-foreground">金额（元）</th>
              <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">备注</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="px-4 py-2 text-center text-muted-foreground">{item.row_num}</td>
                <td className="px-4 py-2">{item.product_name}</td>
                <td className="px-4 py-2">{item.spec || "-"}</td>
                <td className="px-4 py-2">{item.unit}</td>
                <td className="px-4 py-2 text-right tabular-nums">{item.qty}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatCurrency(item.price)}</td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">{formatCurrency(item.amount)}</td>
                <td className="px-4 py-2 text-muted-foreground">{item.remark || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end border-t bg-muted/30 px-6 py-4">
          <div className="w-72 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">合计数量：</span>
              <span className="font-semibold tabular-nums">{order.total_qty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">合计金额：</span>
              <span className="font-semibold tabular-nums">{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="flex justify-between border-t pt-1.5">
              <span className="text-muted-foreground">大写金额：</span>
              <span className="font-semibold">{order.amount_cn}</span>
            </div>
          </div>
        </div>
      </div>

      <PrintReceipt order={order} />
    </div>
  );
}