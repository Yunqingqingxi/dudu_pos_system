import { useRef, useState, useEffect } from "react";
import { Trash2, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

interface RowState {
  key: number;
  product_name: string;
  spec: string;
  unit: string;
  qty: number;
  price: number;
  remark: string;
}

interface OrderRowProps {
  index: number;
  row: RowState;
  products: Product[];
  onChange: (key: number, field: string, value: string | number) => void;
  onRemove: (key: number) => void;
}

export function OrderRow({ index, row, products, onChange, onRemove }: OrderRowProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const amount = row.product_name.trim() && row.qty > 0
    ? Math.round(row.qty * row.price * 100) / 100
    : 0;

  const handleSelectProduct = (p: Product) => {
    onChange(row.key, "product_name", p.name);
    onChange(row.key, "spec", p.spec);
    onChange(row.key, "unit", p.unit);
    onChange(row.key, "price", p.reference_price);
    setPopoverOpen(false);
    setSearchTerm("");
  };

  return (
    <tr className="border-b">
      <td className="px-3 py-2 text-center text-muted-foreground">{index + 1}</td>

      {/* Product name with autocomplete popover */}
      <td className="px-3 py-2">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer">
              <input
                ref={inputRef}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="输入或搜索品名..."
                value={row.product_name}
                onChange={(e) => {
                  onChange(row.key, "product_name", e.target.value);
                  setSearchTerm(e.target.value);
                  if (e.target.value) setPopoverOpen(true);
                }}
                onFocus={() => {
                  if (products.length > 0) setPopoverOpen(true);
                }}
              />
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            <div className="p-2">
              <Input
                placeholder="搜索商品..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground text-center">无匹配商品</div>
              ) : (
                filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between"
                    onClick={() => handleSelectProduct(p)}
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.unit} / {formatCurrency(p.reference_price)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </td>

      <td className="px-3 py-2">
        <Input
          className="h-8 text-sm border-0 px-0 shadow-none"
          value={row.spec}
          onChange={(e) => onChange(row.key, "spec", e.target.value)}
          placeholder="规格"
        />
      </td>

      <td className="px-3 py-2">
        <Input
          className="h-8 text-sm border-0 px-0 shadow-none"
          value={row.unit}
          onChange={(e) => onChange(row.key, "unit", e.target.value)}
        />
      </td>

      <td className="px-3 py-2 text-right">
        <Input
          className="h-8 text-sm text-right border-0 px-0 shadow-none"
          type="number"
          min="1"
          value={row.qty}
          onChange={(e) => onChange(row.key, "qty", parseInt(e.target.value) || 0)}
        />
      </td>

      <td className="px-3 py-2 text-right">
        <Input
          className="h-8 text-sm text-right border-0 px-0 shadow-none"
          type="number"
          step="0.01"
          min="0"
          value={row.price}
          onChange={(e) => onChange(row.key, "price", parseFloat(e.target.value) || 0)}
        />
      </td>

      <td className="px-3 py-2 text-right font-medium tabular-nums">
        {formatCurrency(amount)}
      </td>

      <td className="px-3 py-2">
        <Input
          className="h-8 text-sm border-0 px-0 shadow-none"
          value={row.remark}
          onChange={(e) => onChange(row.key, "remark", e.target.value)}
          placeholder="备注"
        />
      </td>

      <td className="px-3 py-2 text-center">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(row.key)}>
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
        </Button>
      </td>
    </tr>
  );
}
