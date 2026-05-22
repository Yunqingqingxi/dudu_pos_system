import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

interface PrintReceiptProps {
  order: Order;
}

export function PrintReceipt({ order }: PrintReceiptProps) {
  return (
    <div className="print-only">
      <div className="max-w-[190mm] mx-auto text-black">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">广信区都嘟百货店</h2>
          <h3 className="text-base font-semibold mt-1">销 售 单</h3>
        </div>

        {/* Order info */}
        <div className="flex justify-between text-sm mb-3 px-2">
          <span>单号：{order.order_no}</span>
          <span>日期：{formatDate(order.order_date)}</span>
        </div>

        {/* Table */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y-2 border-black">
              <th className="py-1.5 px-2 text-center w-10">行号</th>
              <th className="py-1.5 px-2 text-left">品名</th>
              <th className="py-1.5 px-2 text-left w-20">规格型号</th>
              <th className="py-1.5 px-2 text-center w-14">单位</th>
              <th className="py-1.5 px-2 text-right w-16">数量</th>
              <th className="py-1.5 px-2 text-right w-20">单价（元）</th>
              <th className="py-1.5 px-2 text-right w-24">金额（元）</th>
              <th className="py-1.5 px-2 text-left w-24">备注</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="py-1.5 px-2 text-center">{item.row_num}</td>
                <td className="py-1.5 px-2">{item.product_name}</td>
                <td className="py-1.5 px-2">{item.spec || ""}</td>
                <td className="py-1.5 px-2 text-center">{item.unit}</td>
                <td className="py-1.5 px-2 text-right">{item.qty}</td>
                <td className="py-1.5 px-2 text-right">{formatCurrency(item.price)}</td>
                <td className="py-1.5 px-2 text-right">{formatCurrency(item.amount)}</td>
                <td className="py-1.5 px-2">{item.remark || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mt-3 text-sm">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>合计数量：</span>
              <span className="font-semibold">{order.total_qty}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>合计金额：</span>
              <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>大写金额：</span>
              <span className="font-semibold">{order.amount_cn}</span>
            </div>
          </div>
        </div>

        {order.remark && (
          <div className="mt-4 text-sm text-gray-600">
            备注：{order.remark}
          </div>
        )}
      </div>
    </div>
  );
}
