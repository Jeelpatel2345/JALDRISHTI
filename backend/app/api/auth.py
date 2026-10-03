from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token
from ..models.models import User
from ..schemas.schemas import UserLogin, UserCreate, Token, UserResponse, DemoSwitchRequest
from .deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Roles"])

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    token = create_access_token(data={"sub": user.email, "role": user.role, "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "district": user.district,
            "state": user.state
        }
    }

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role,
        district=user_data.district,
        state=user_data.state
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/demo-switch", response_model=Token)
def demo_switch(req: DemoSwitchRequest, db: Session = Depends(get_db)):
    """Allows hackathon evaluators to instantly switch operational personas."""
    role_email_map = {
        "district_officer": "rajkot.officer@jaldrishti.gov.in",
        "field_surveyor": "field.surveyor@jaldrishti.gov.in",
        "analyst": "analyst@jaldrishti.gov.in",
        "reviewer": "auditor@jaldrishti.gov.in",
        "super_admin": "admin@jaldrishti.gov.in"
    }
    target_email = role_email_map.get(req.role, "rajkot.officer@jaldrishti.gov.in")
    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        user = db.query(User).first()

    token = create_access_token(data={"sub": user.email, "role": user.role, "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "district": user.district,
            "state": user.state
        }
    }

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
