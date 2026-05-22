from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    return dashboard_service.get_dashboard(db)
