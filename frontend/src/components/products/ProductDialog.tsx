import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createProduct, updateProduct } from "@/api/client";
import type { Product } from "@/types";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess: () => void;
}

export function ProductDialog({ open, onOpenChange, product, onSuccess }: ProductDialogProps) {
  const [name, setName] = useState("");
  const [spec, setSpec] = useState("");
  const [unit, setUnit] = useState("箱");
  const [referencePrice, setReferencePrice] = useState("0");
  const [saving, setSaving] = useState(false);

  const isEdit = product !== null;

  useEffect(() => {
    if (open) {
      if (product) {
        setName(product.name);
        setSpec(product.spec);
        setUnit(product.unit);
        setReferencePrice(String(product.reference_price));
      } else {
        setName("");
        setSpec("");
        setUnit("箱");
        setReferencePrice("0");
      }
    }
  }, [open, product]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        spec: spec.trim(),
        unit: unit.trim() || "箱",
        reference_price: parseFloat(referencePrice) || 0,
      };
      if (isEdit && product) {
        await updateProduct(product.id, data);
      } else {
        await createProduct(data);
      }
      onSuccess();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑商品" : "新增商品"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">品名 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入品名"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spec">规格型号</Label>
            <Input
              id="spec"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="如：500ml、大号"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">单位</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="箱/件"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">参考单价（元）</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={referencePrice}
                onChange={(e) => setReferencePrice(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
