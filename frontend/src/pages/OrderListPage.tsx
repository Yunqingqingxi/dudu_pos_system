import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImportExportBar } from "@/components/ImportExportBar";
import { fetchOrders, deleteOrder } from "@/api/client";
import { formatCurrency, formatDate } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function OrderListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", keyword, startDate, endDate, page],
    queryFn: () =>
      fetchOrders({ keyword, start: startDate, end: endDate, skip: page * PAGE_SIZE, limit: PAGE_SIZE }),
  });

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  async function handleDelete(id: number, orderNo: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("确定要删除单据 " + orderNo + " 吗？")) {
      await deleteOrder(id);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-semibold">单据列表</h1>
        <ImportExportBar type="orders" onImportDone={() => queryClient.invalidateQueries({ queryKey: ["orders"] })} />
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
        <div className="relative w-full sm:w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索单号..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(0); }} className="w-full sm:w-36" />
        <span className="text-muted-foreground text-sm text-center">至</span>
        <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(0); }} className="w-full sm:w-36" />
        <Button variant="outline" size="sm" onClick={() => { setStartDate(""); setEndDate(""); setKeyword(""); setPage(0); }}>清除</Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">加载中...</div>
      ) : (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">单号</TableHead>
                  <TableHead className="text-center">日期</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">总数量</TableHead>
                  <TableHead className="text-center">总金额</TableHead>
                  <TableHead className="text-center hidden md:table-cell">备注</TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">暂无单据</TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => (
                    <TableRow key={o.id} className="cursor-pointer" onClick={() => navigate("/orders/" + o.id)}>
                      <TableCell className="font-medium text-center">{o.order_no}</TableCell>
                      <TableCell className="text-center">{formatDate(o.order_date)}</TableCell>
                      <TableCell className="text-center tabular-nums hidden sm:table-cell">{o.total_qty}</TableCell>
                      <TableCell className="text-center tabular-nums">{formatCurrency(o.total_amount)}</TableCell>
                      <TableCell className="text-center text-muted-foreground max-w-32 truncate hidden md:table-cell">{o.remark || "-"}</TableCell>
                      <TableCell>
                        <button className="text-muted-foreground hover:text-destructive transition-colors" onClick={(e) => handleDelete(o.id, o.order_no, e)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
    </div>
  );
}