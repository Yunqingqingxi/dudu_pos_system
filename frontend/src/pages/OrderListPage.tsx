import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchOrders } from "@/api/client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OrderListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const { data, isLoading } = useQuery({
    queryKey: ["orders", keyword, startDate, endDate, page],
    queryFn: () =>
      fetchOrders({
        keyword,
        start: startDate,
        end: endDate,
        skip: page * pageSize,
        limit: pageSize,
      }),
  });

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">单据列表</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索单号..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
          className="w-40"
        />
        <span className="text-muted-foreground text-sm">至</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
          className="w-40"
        />
        <Button variant="outline" size="sm" onClick={() => { setStartDate(""); setEndDate(""); setKeyword(""); setPage(0); }}>
          清除
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">加载中...</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>单号</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead className="text-right">总数量</TableHead>
                  <TableHead className="text-right">总金额</TableHead>
                  <TableHead>备注</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      暂无单据
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => (
                    <TableRow
                      key={o.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/orders/${o.id}`)}
                    >
                      <TableCell className="font-medium">{o.order_no}</TableCell>
                      <TableCell>{formatDate(o.order_date)}</TableCell>
                      <TableCell className="text-right tabular-nums">{o.total_qty}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(o.total_amount)}</TableCell>
                      <TableCell className="text-muted-foreground max-w-40 truncate">{o.remark || "-"}</TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
