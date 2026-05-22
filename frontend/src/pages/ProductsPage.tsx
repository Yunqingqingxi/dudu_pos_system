import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImportExportBar } from "@/components/ImportExportBar";
import { ProductDialog } from "@/components/products/ProductDialog";
import { fetchProducts, deleteProduct } from "@/api/client";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, page],
    queryFn: () => fetchProducts(search, page * PAGE_SIZE, PAGE_SIZE),
  });

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingProduct(null);
    setDialogOpen(true);
  }

  function handleDelete(id: number) {
    if (confirm("确定要删除该商品吗？")) {
      deleteMutation.mutate(id);
    }
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-semibold">商品库</h1>
        <div className="flex items-center gap-2">
          <ImportExportBar type="products" onImportDone={() => queryClient.invalidateQueries({ queryKey: ["products"] })} importLabel="导入商品" />
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            新增商品
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索品名..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">加载中...</div>
      ) : (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">ID</TableHead>
                  <TableHead className="text-center">品名</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">规格型号</TableHead>
                  <TableHead className="text-center">单位</TableHead>
                  <TableHead className="text-center">参考单价</TableHead>
                  <TableHead className="w-20 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      暂无商品数据
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-center text-muted-foreground">{p.id}</TableCell>
                      <TableCell className="text-center font-medium">{p.name}</TableCell>
                      <TableCell className="text-center hidden sm:table-cell">{p.spec || "-"}</TableCell>
                      <TableCell className="text-center">{p.unit}</TableCell>
                      <TableCell className="text-center">{formatCurrency(p.reference_price)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>上一页</Button>
              <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}（共{total}条）</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>下一页</Button>
            </div>
          )}
        </>
      )}

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
      />
    </div>
  );
}