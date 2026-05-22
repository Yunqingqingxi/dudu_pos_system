from datetime import date, datetime
from sqlalchemy.orm import Session
from models import Order, OrderItem
from schemas import OrderCreate


def _num_to_cn(num: float) -> str:
    """Convert a float amount to Chinese uppercase string, e.g. 2057.00 -> 贰仟零伍拾柒元整"""
    if num < 0:
        return "负" + _num_to_cn(-num)

    cn_digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]
    cn_units = ["", "拾", "佰", "仟", "万", "拾", "佰", "仟", "亿"]

    int_part = int(num)
    frac_part = round((num - int_part) * 100)

    if int_part == 0 and frac_part == 0:
        return "零元整"

    result = ""

    # Integer part
    if int_part > 0:
        digits = []
        while int_part > 0:
            digits.append(int_part % 10)
            int_part //= 10

        need_zero = False
        for i in range(len(digits) - 1, -1, -1):
            d = digits[i]
            if d == 0:
                need_zero = True
            else:
                if need_zero and result != "":
                    result += "零"
                need_zero = False
                result += cn_digits[d] + cn_units[i]

        result += "元"
    else:
        result += "零元"

    # Fractional part
    if frac_part == 0:
        result += "整"
    else:
        jiao = frac_part // 10
        fen = frac_part % 10
        if jiao > 0:
            result += cn_digits[jiao] + "角"
        if fen > 0:
            result += cn_digits[fen] + "分"

    return result


def generate_order_no(db: Session, order_date: date) -> str:
    """Generate order number: DD-YYYYMMDD-NNN"""
    prefix = f"DD-{order_date.strftime('%Y%m%d')}-"
    latest = (
        db.query(Order)
        .filter(Order.order_no.like(f"{prefix}%"))
        .order_by(Order.order_no.desc())
        .first()
    )
    if latest:
        try:
            seq = int(latest.order_no[-3:]) + 1
        except (ValueError, IndexError):
            seq = 1
    else:
        seq = 1
    return f"{prefix}{seq:03d}"


def create_order(db: Session, data: OrderCreate):
    order_no = generate_order_no(db, data.order_date)

    total_qty = sum(item.qty for item in data.items)
    total_amount = sum(item.amount for item in data.items)
    amount_cn = _num_to_cn(total_amount)

    order = Order(
        order_no=order_no,
        order_date=data.order_date,
        total_qty=total_qty,
        total_amount=round(total_amount, 2),
        amount_cn=amount_cn,
        remark=data.remark,
    )
    db.add(order)
    db.flush()

    for idx, item_data in enumerate(data.items, start=1):
        item = OrderItem(
            order_id=order.id,
            row_num=idx,
            product_name=item_data.product_name,
            spec=item_data.spec,
            unit=item_data.unit,
            qty=item_data.qty,
            price=item_data.price,
            amount=round(item_data.amount, 2),
            remark=item_data.remark,
        )
        db.add(item)

    db.commit()
    db.refresh(order)
    return order


def list_orders(
    db: Session,
    start_date: str = "",
    end_date: str = "",
    keyword: str = "",
    skip: int = 0,
    limit: int = 20,
):
    q = db.query(Order)
    if start_date:
        q = q.filter(Order.order_date >= date.fromisoformat(start_date))
    if end_date:
        q = q.filter(Order.order_date <= date.fromisoformat(end_date))
    if keyword:
        q = q.filter(Order.order_no.contains(keyword))
    total = q.count()
    items = q.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return items, total


def get_order(db: Session, order_id: int):
    return db.query(Order).filter(Order.id == order_id).first()

def delete_order(db: Session, order_id: int) -> bool:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return False
    db.delete(order)
    db.commit()
    return True