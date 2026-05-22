import { amountToChinese } from "@/lib/cn-currency";
import { formatCurrency } from "@/lib/utils";

interface OrderSummaryProps {
  totalQty: number;
  totalAmount: number;
}

export function OrderSummary({ totalQty, totalAmount }: OrderSummaryProps) {
  return (
    <div className="rounded-md border bg-muted/30 p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">合计数量：</span>
        <span className="font-semibold tabular-nums">{totalQty}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">合计金额：</span>
        <span className="font-semibold tabular-nums">{formatCurrency(totalAmount)}</span>
      </div>
      <div className="flex justify-between text-sm border-t pt-2">
        <span className="text-muted-foreground">大写金额：</span>
        <span className="font-semibold">{amountToChinese(totalAmount)}</span>
      </div>
    </div>
  );
}
