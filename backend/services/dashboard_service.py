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
