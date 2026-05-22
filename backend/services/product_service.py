from sqlalchemy.orm import Session
from models import Product
from schemas import ProductCreate, ProductUpdate


def list_products(db: Session, search: str = "", skip: int = 0, limit: int = 100):
    q = db.query(Product)
    if search:
        q = q.filter(Product.name.contains(search))
    total = q.count()
    items = q.order_by(Product.id.asc()).offset(skip).limit(limit).all()
    return items, total


def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()


def create_product(db: Session, data: ProductCreate):
    product = Product(
        name=data.name,
        spec=data.spec,
        unit=data.unit,
        reference_price=data.reference_price,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, data: ProductUpdate):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> bool:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return False
    db.delete(product)
    db.commit()
    return True
