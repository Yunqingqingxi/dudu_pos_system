from datetime import date
from sqlalchemy.orm import Session
from models import Order


def get_dashboard(db: Session):
    today = date.today()

    today_orders = (
        db.query(Order).filter(Order.order_date == today).all()
    )
    today_count = len(today_orders)
    today_amount = sum(o.total_amount for o in today_orders)

    month_orders = (
        db.query(Order)
        .filter(
            Order.order_date >= today.replace(day=1),
            Order.order_date <= today,
        )
        .all()
    )
    month_count = len(month_orders)
    month_amount = sum(o.total_amount for o in month_orders)

    recent = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "today_orders": today_count,
        "today_amount": round(today_amount, 2),
        "month_orders": month_count,
        "month_amount": round(month_amount, 2),
        "recent_orders": recent,
    }

from sqlalchemy import func
from models import OrderItem

def get_chart_data(db: Session):
    today = date.today()
    month_start = today.replace(day=1)

    # Daily sales for current month
    daily_sales = []
    current = month_start
    while current <= today:
        day_orders = (
            db.query(Order)
            .filter(Order.order_date == current)
            .all()
        )
        daily_sales.append({
            "date": current.isoformat(),
            "amount": round(sum(o.total_amount for o in day_orders), 2),
            "orders": len(day_orders),
        })
        from datetime import timedelta
        current += timedelta(days=1)

    # Top products by quantity sold this month
    top_rows = (
        db.query(
            OrderItem.product_name,
            func.sum(OrderItem.qty).label("total_qty"),
            func.sum(OrderItem.amount).label("total_amount"),
        )
        .join(Order)
        .filter(Order.order_date >= month_start, Order.order_date <= today)
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.qty).desc())
        .limit(10)
        .all()
    )
    top_products = [
        {"name": row.product_name, "total_qty": int(row.total_qty), "total_amount": round(float(row.total_amount), 2)}
        for row in top_rows
    ]

    return {
        "daily_sales": daily_sales,
        "top_products": top_products,
    }