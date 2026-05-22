from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ---- Product ----

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    spec: str = ""
    unit: str = "箱"
    reference_price: float = Field(default=0.0, ge=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    spec: Optional[str] = None
    unit: Optional[str] = None
    reference_price: Optional[float] = Field(None, ge=0)


class ProductResponse(BaseModel):
    id: int
    name: str
    spec: str
    unit: str
    reference_price: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int


# ---- Order Item ----

class OrderItemCreate(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=200)
    spec: str = ""
    unit: str = "箱"
    qty: int = Field(..., gt=0)
    price: float = Field(..., ge=0)
    amount: float = Field(..., ge=0)
    remark: str = ""


class OrderItemResponse(BaseModel):
    id: int
    row_num: int
    product_name: str
    spec: str
    unit: str
    qty: int
    price: float
    amount: float
    remark: str

    model_config = {"from_attributes": True}


# ---- Order ----

class OrderCreate(BaseModel):
    order_date: date = Field(default_factory=date.today)
    items: List[OrderItemCreate] = Field(..., min_length=1)
    remark: str = ""


class OrderResponse(BaseModel):
    id: int
    order_no: str
    order_date: date
    total_qty: int
    total_amount: float
    amount_cn: str
    remark: str
    created_at: datetime
    items: List[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: List[OrderResponse]
    total: int


# ---- Dashboard ----

class DashboardResponse(BaseModel):
    today_orders: int
    today_amount: float
    month_orders: int
    month_amount: float
    recent_orders: List[OrderResponse] = []
