import { useState, useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
  totalRows: number;
  onChange: (key: number, field: string, value: string | number) => void;
  onRemove: (key: number) => void;
}

export function OrderRow({ index, row, products, totalRows, onChange, onRemove }: OrderRowProps) {
  const [open, setOpen] = useState(false);
  const [priceFlash, setPriceFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const amount = row.product_name.trim() && row.qty > 0
    ? Math.round(row.qty * row.price * 100) / 100
    : 0;

  const handleSelect = (p: Product) => {
    onChange(row.key, "product_name", p.name);
    onChange(row.key, "spec", p.spec);
    onChange(row.key, "unit", p.unit);
    onChange(row.key, "price", p.reference_price);
    setOpen(false);
    // Flash the price cell
    setPriceFlash(true);
    setTimeout(() => setPriceFlash(false), 600);
  };

  return (
    <tr className="border-b">
      <td className="px-3 py-2 text-center text-muted-foreground">{index + 1}</td>

      {/* Product name with Combobox */}
      <td className="px-3 py-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-1 text-sm text-left shadow-sm hover:bg-accent/50 transition-colors"
              onClick={() => setOpen(true)}
            >
              <span className={row.product_name ? "" : "text-muted-foreground"}>
                {row.product_name || "搜索或输入品名..."}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[360px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
            <Command>
              <CommandInput
                placeholder="搜索商品..."
                value={row.product_name}
                onValueChange={(v) => {
                  onChange(row.key, "product_name", v);
                }}
              />
              <CommandList>
                <CommandEmpty>
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    无匹配商品，将使用手动输入的品名
                  </div>
                </CommandEmpty>
                {products
                  .filter((p) =>
                    p.name.toLowerCase().includes(row.product_name.toLowerCase())
                  )
                  .slice(0, 15)
                  .map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.name}
                      onSelect={() => handleSelect(p)}
                    >
                      <span className="flex-1">{p.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                        {p.unit} / {formatCurrency(p.reference_price)}
                      </span>
                    </CommandItem>
                  ))}
              </CommandList>
            </Command>
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

      <td className={`px-3 py-2 text-right transition-colors duration-500 ${priceFlash ? "bg-yellow-100" : ""}`}>
        <Input
          className="h-8 text-sm text-right border-0 px-0 shadow-none bg-transparent"
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
        {totalRows > 1 && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(row.key)}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </td>
    </tr>
  );
}