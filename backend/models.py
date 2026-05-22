from datetime import date, datetime
from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime,
    ForeignKey, Text,
)
from sqlalchemy.orm import relationship
from database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False, comment="品名")
    spec = Column(String(200), default="", comment="规格型号")
    unit = Column(String(50), default="箱", comment="单位")
    reference_price = Column(Float, default=0.0, comment="参考单价")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_no = Column(String(50), unique=True, nullable=False, comment="单号")
    order_date = Column(Date, default=date.today, comment="开单日期")
    total_qty = Column(Integer, default=0, comment="总数量")
    total_amount = Column(Float, default=0.0, comment="总金额")
    amount_cn = Column(String(200), default="", comment="中文大写金额")
    remark = Column(Text, default="", comment="备注")
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    row_num = Column(Integer, nullable=False, comment="行号")
    product_name = Column(String(200), nullable=False, comment="品名")
    spec = Column(String(200), default="", comment="规格型号")
    unit = Column(String(50), default="箱", comment="单位")
    qty = Column(Integer, nullable=False, default=1, comment="数量")
    price = Column(Float, nullable=False, default=0.0, comment="单价")
    amount = Column(Float, nullable=False, default=0.0, comment="金额")
    remark = Column(Text, default="", comment="备注")

    order = relationship("Order", back_populates="items")
