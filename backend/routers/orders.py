from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas import OrderCreate, OrderResponse, OrderListResponse
from services import order_service
from fastapi import HTTPException

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("", response_model=OrderListResponse)
def list_orders(
    start: str = Query(""),
    end: str = Query(""),
    keyword: str = Query(""),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = order_service.list_orders(
        db,
        start_date=start,
        end_date=end,
        keyword=keyword,
        skip=skip,
        limit=limit,
    )
    return OrderListResponse(items=items, total=total)


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    return order_service.create_order(db, data)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = order_service.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="单据不存在")
    return order

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    ok = order_service.delete_order(db, order_id)
    if not ok:
        raise HTTPException(status_code=404, detail="单据不存在")
    return {"message": "ok"}