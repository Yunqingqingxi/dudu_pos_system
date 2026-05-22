from database import SessionLocal, engine, Base
from models import Product

Base.metadata.create_all(bind=engine)

db = SessionLocal()

seed_products = [
    {"name": "富得1500圆桶", "spec": "", "unit": "箱", "reference_price": 63.0},
    {"name": "富得1000圆桶", "spec": "", "unit": "箱", "reference_price": 45.0},
    {"name": "富得850圆桶", "spec": "", "unit": "箱", "reference_price": 38.0},
    {"name": "富得650方桶", "spec": "", "unit": "箱", "reference_price": 54.0},
    {"name": "富得500方桶", "spec": "", "unit": "箱", "reference_price": 42.0},
    {"name": "纸碗500ml", "spec": "500ml", "unit": "箱", "reference_price": 55.0},
    {"name": "纸碗750ml", "spec": "750ml", "unit": "箱", "reference_price": 68.0},
    {"name": "纸碗1000ml", "spec": "1000ml", "unit": "箱", "reference_price": 80.0},
    {"name": "纸盒小号", "spec": "小号", "unit": "箱", "reference_price": 35.0},
    {"name": "纸盒中号", "spec": "中号", "unit": "箱", "reference_price": 48.0},
    {"name": "纸盒大号", "spec": "大号", "unit": "箱", "reference_price": 60.0},
    {"name": "塑料杯200ml", "spec": "200ml", "unit": "件", "reference_price": 28.0},
    {"name": "竹筷", "spec": "", "unit": "件", "reference_price": 12.0},
    {"name": "塑料袋小", "spec": "小号", "unit": "件", "reference_price": 8.0},
    {"name": "塑料袋大", "spec": "大号", "unit": "件", "reference_price": 15.0},
]

existing = db.query(Product).count()
if existing == 0:
    for p in seed_products:
        db.add(Product(**p))
    db.commit()
    print(f"Seeded {len(seed_products)} products.")

db.close()
