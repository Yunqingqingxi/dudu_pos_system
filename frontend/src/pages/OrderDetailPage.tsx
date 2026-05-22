import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">单据详情</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      <div className="rounded-md border overflow-x-auto">
        <div className="border-b bg-muted/30 px-4 sm:px-6 py-4">
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
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground whitespace-nowrap w-12">#</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground whitespace-nowrap">品名</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground whitespace-nowrap hidden sm:table-cell">规格</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground whitespace-nowrap">单位</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground whitespace-nowrap">数量</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground whitespace-nowrap">单价</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground whitespace-nowrap">金额</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground whitespace-nowrap hidden md:table-cell">备注</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="px-3 py-2 text-center text-muted-foreground text-base">{item.row_num}</td>
                <td className="px-3 py-2 text-center text-base">{item.product_name}</td>
                <td className="px-3 py-2 text-center hidden sm:table-cell text-base">{item.spec || "-"}</td>
                <td className="px-3 py-2 text-center text-base">{item.unit}</td>
                <td className="px-3 py-2 text-center tabular-nums text-base">{item.qty}</td>
                <td className="px-3 py-2 text-center tabular-nums text-base">{formatCurrency(item.price)}</td>
                <td className="px-3 py-2 text-center tabular-nums font-medium text-base">{formatCurrency(item.amount)}</td>
                <td className="px-3 py-2 text-center text-muted-foreground hidden md:table-cell text-base">{item.remark || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end border-t bg-muted/30 px-4 sm:px-6 py-4">
          <div className="w-64 sm:w-72 space-y-1.5 text-sm">
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

      {createPortal(
        <PrintReceipt order={order} />,
        document.getElementById("print-root") || document.body
      )}
    </div>
  );
}