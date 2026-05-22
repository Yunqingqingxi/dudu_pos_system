import { formatDate } from "@/lib/utils";
import type { Order } from "@/types";

function formatYuan(amount: number): string {
  return '¥' + amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface PrintReceiptProps {
  order: Order;
}

export function PrintReceipt({ order }: PrintReceiptProps) {
  return (
    <div className="print-only">
      <div className="max-w-[260mm] mx-auto text-black text-base">

        <table className="w-full border-collapse table-fixed">
          {/* Store name title bar */}
          <thead>
            <tr>
              <th colSpan={8} className="bg-blue-900 text-white font-bold text-lg py-3 text-center border border-gray-400">
                广信区都嘟百货店
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Order info row */}
            <tr>
              <td colSpan={8} className="py-2 px-2 border border-gray-400">
                <div className="flex justify-between">
                  <span>单号：{order.order_no}</span>
                  <span>日期：{formatDate(order.order_date)}</span>
                </div>
              </td>
            </tr>

            {/* Column headers */}
            <tr className="bg-blue-100">
              <th className="py-2 px-2 text-center text-blue-900 font-bold whitespace-nowrap border border-gray-400" style={{width: '5%'}}>行号</th>
              <th className="py-2 px-2 text-center text-blue-900 font-bold whitespace-nowrap border border-gray-400" style={{width: '17%'}}>品名</th>
              <th className="py-2 px-2 text-center text-blue-900 font-bold whitespace-nowrap border border-gray-400" style={{width: '11%'}}>规格型号</th>
              <th className="py-2 px-2 text-center text-blue-900 font-bold whitespace-nowrap border border-gray-400" style={{width: '7%'}}>单位</th>
              <th className="py-2 px-2 text-center text-blue-900 font-bold whitespace-nowrap border border-gray-400" style={{width: '8%'}}>数量</th>
              <th className="py-2 px-2 text-center text-blue-900 font-bold whitespace-nowrap border border-gray-400" style={{width: '11%'}}>单价（元）</th>
              <th className="py-2 px-2 text-center text-blue-900 font-bold whitespace-nowrap border border-gray-400" style={{width: '12%'}}>金额（元）</th>
              <th className="py-2 px-2 text-center text-blue-900 font-bold whitespace-nowrap border border-gray-400" style={{width: '29%'}}>备注</th>
            </tr>

            {/* Data rows */}
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2 px-2 text-center border border-gray-300">{item.row_num}</td>
                <td className="py-2 px-2 text-center border border-gray-300">{item.product_name}</td>
                <td className="py-2 px-2 text-center border border-gray-300">{item.spec || ""}</td>
                <td className="py-2 px-2 text-center border border-gray-300">{item.unit}</td>
                <td className="py-2 px-2 text-center border border-gray-300">{item.qty}</td>
                <td className="py-2 px-2 text-center border border-gray-300">{item.price.toFixed(2)}</td>
                <td className="py-2 px-2 text-center border border-gray-300">{formatYuan(item.amount)}</td>
                <td className="py-2 px-2 text-center border border-gray-300">{item.remark || ""}</td>
              </tr>
            ))}

            {/* Total row */}
            <tr className="border-t-2 border-gray-500">
              <td className="py-2 px-2 text-center border border-gray-300">总计大写</td>
              <td colSpan={3} className="py-2 px-2 text-center border border-gray-300">{order.amount_cn}</td>
              <td className="py-2 px-2 text-center border border-gray-300">{order.total_qty}</td>
              <td className="py-2 px-2 text-center border border-gray-300">合计</td>
              <td className="py-2 px-2 text-center border border-gray-300">{formatYuan(order.total_amount)}</td>
              <td className="py-2 px-2 text-center border border-gray-300"></td>
            </tr>

            {/* Payment info row */}
            <tr>
              <td className="py-2 px-2 text-center border border-gray-300">收款账户</td>
              <td className="py-2 px-2 text-center border border-gray-300"></td>
              <td className="py-2 px-2 text-center border border-gray-300"></td>
              <td className="py-2 px-2 text-center border border-gray-300">收款金额</td>
              <td className="py-2 px-2 text-center border border-gray-300"></td>
              <td className="py-2 px-2 text-center border border-gray-300">优惠金额</td>
              <td className="py-2 px-2 text-center border border-gray-300"></td>
              <td className="py-2 px-2 text-center border border-gray-300"></td>
            </tr>
          </tbody>
        </table>

        {order.remark && (
          <div className="mt-4 text-sm text-gray-600">
            备注：{order.remark}
          </div>
        )}
      </div>
    </div>
  );
}
