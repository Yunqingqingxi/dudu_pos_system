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

  const { data: prodData } = useQuery({
    queryKey: ["products", ""],
    queryFn: () => fetchProducts("", 0, 200),
  });
  const products = prodData?.items ?? [];

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => navigate("/orders/" + order.id),
  });

  const updateRow = useCallback((key: number, field: string, value: string | number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.key !== key) return r;
        const updated = { ...r, [field]: value };
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
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)));
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
    createMutation.mutate({
      order_date: new Date().toISOString().slice(0, 10),
      items: validRows.map((r) => ({
        product_name: r.product_name.trim(),
        spec: r.spec,
        unit: r.unit || "箱",
        qty: r.qty,
        price: r.price,
        amount: Math.round(r.qty * r.price * 100) / 100,
        remark: r.remark,
      })),
      remark,
    });
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-semibold">新建开单</h1>
        <span className="text-sm text-muted-foreground">
          日期：{new Date().toISOString().slice(0, 10)}
        </span>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full caption-bottom text-base min-w-[780px] table-fixed">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground" style={{width: '4%'}}>#</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground" style={{width: '18%'}}>品名</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground" style={{width: '9%'}}>规格</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground" style={{width: '6%'}}>单位</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground" style={{width: '8%'}}>数量</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground" style={{width: '10%'}}>单价</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground" style={{width: '13%'}}>金额</th>
              <th className="h-10 px-3 text-center text-sm font-medium text-muted-foreground" style={{width: '20%'}}>备注</th>
              <th className="h-10 px-1" style={{width: '4%'}}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <OrderRow
                key={row.key}
                index={idx}
                row={row}
                products={products}
                totalRows={rows.length}
                onChange={updateRow}
                onRemove={removeRow}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-start gap-4">
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-1 h-4 w-4" />
          添加商品行
        </Button>

        <div className="w-full sm:w-80 space-y-3">
          <OrderSummary totalQty={totals.qty} totalAmount={totals.amount} />
          <div className="space-y-2">
            <Label>备注</Label>
            <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="整单备注（可选）" />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "保存中..." : "保存单据"}
          </Button>
        </div>
      </div>
    </div>
  );
}