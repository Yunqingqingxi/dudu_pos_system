import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderRow } from "@/components/orders/OrderRow";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { fetchProducts, createOrder } from "@/api/client";
import type { OrderItemInput } from "@/types";

interface RowState {
  key: number;
  product_name: string;
  spec: string;
  unit: string;
  qty: number;
  price: number;
  remark: string;
}

let nextRowKey = 1;

export default function OrderNewPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<RowState[]>([
    { key: nextRowKey++, product_name: "", spec: "", unit: "箱", qty: 1, price: 0, remark: "" },
  ]);
  const [remark, setRemark] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["products", ""],
    queryFn: () => fetchProducts(""),
  });

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      navigate(`/orders/${order.id}`);
    },
  });

  const updateRow = useCallback((key: number, field: string, value: string | number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.key !== key) return r;
        const updated = { ...r, [field]: value };

        // If product name changed from product selector, auto-fill unit and price
        if (field === "product_name") {
          const product = products.find((p) => p.name === value);
          if (product) {
            updated.spec = product.spec;
            updated.unit = product.unit;
            updated.price = product.reference_price;
          }
        }

        return updated;
      })
    );
  }, [products]);

  const removeRow = useCallback((key: number) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((r) => r.key !== key);
    });
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      { key: nextRowKey++, product_name: "", spec: "", unit: "箱", qty: 1, price: 0, remark: "" },
    ]);
  }, []);

  function handleSubmit() {
    const validRows = rows.filter((r) => r.product_name.trim() && r.qty > 0);
    if (validRows.length === 0) {
      alert("请至少填写一行商品信息");
      return;
    }

    const items: OrderItemInput[] = validRows.map((r) => ({
      product_name: r.product_name.trim(),
      spec: r.spec,
      unit: r.unit || "箱",
      qty: r.qty,
      price: r.price,
      amount: Math.round(r.qty * r.price * 100) / 100,
      remark: r.remark,
    }));

    createMutation.mutate({
      order_date: new Date().toISOString().slice(0, 10),
      items,
      remark,
    });
  }

  // Calculate totals
  const totals = rows.reduce(
    (acc, r) => {
      if (!r.product_name.trim() || r.qty <= 0) return acc;
      const amount = Math.round(r.qty * r.price * 100) / 100;
      return { qty: acc.qty + r.qty, amount: acc.amount + amount };
    },
    { qty: 0, amount: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">新建开单</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            日期：{new Date().toISOString().slice(0, 10)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 w-12 px-3 text-left text-xs font-medium text-muted-foreground">行号</th>
              <th className="h-10 px-3 text-left text-xs font-medium text-muted-foreground">品名</th>
              <th className="h-10 w-28 px-3 text-left text-xs font-medium text-muted-foreground">规格型号</th>
              <th className="h-10 w-20 px-3 text-left text-xs font-medium text-muted-foreground">单位</th>
              <th className="h-10 w-24 px-3 text-right text-xs font-medium text-muted-foreground">数量</th>
              <th className="h-10 w-28 px-3 text-right text-xs font-medium text-muted-foreground">单价（元）</th>
              <th className="h-10 w-28 px-3 text-right text-xs font-medium text-muted-foreground">金额（元）</th>
              <th className="h-10 w-32 px-3 text-left text-xs font-medium text-muted-foreground">备注</th>
              <th className="h-10 w-12 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <OrderRow
                key={row.key}
                index={idx}
                row={row}
                products={products}
                onChange={updateRow}
                onRemove={removeRow}
                totalRows={rows.length}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-start">
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-1 h-4 w-4" />
          添加商品行
        </Button>

        <div className="w-80 space-y-3">
          <OrderSummary totalQty={totals.qty} totalAmount={totals.amount} />

          <div className="space-y-2">
            <Label>备注</Label>
            <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="整单备注（可选）" />
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "保存中..." : "保存单据"}
          </Button>
        </div>
      </div>
    </div>
  );
}
