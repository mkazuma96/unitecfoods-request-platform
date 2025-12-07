import logging
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User, Company, UserRole, CompanyType
from app.models.issue import Issue # Import Issue to ensure SQLAlchemy registry is populated
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    # 1. Create Companies
    unitec = db.query(Company).filter(Company.name == "Unitec Foods").first()
    if not unitec:
        unitec = Company(
            name="Unitec Foods",
            representative_email="admin@unitecfoods.co.jp",
            type=CompanyType.UNITEC,
            address_default="東京都中央区..."
        )
        db.add(unitec)
        db.commit()
        db.refresh(unitec)
        logger.info("Created Company: Unitec Foods")
    
    client_a = db.query(Company).filter(Company.name == "テックゼロ食品株式会社").first()
    if not client_a:
        client_a = Company(
            name="テックゼロ食品株式会社",
            representative_email="contact@tech0-foods.com",
            type=CompanyType.CLIENT,
            address_default="東京都港区..."
        )
        db.add(client_a)
        db.commit()
        db.refresh(client_a)
        logger.info("Created Company: テックゼロ食品株式会社")

    # 2. Create Users
    # Unitec Admin
    admin_user = db.query(User).filter(User.email == "admin@unitec.com").first()
    if not admin_user:
        admin_user = User(
            email="admin@unitec.com",
            password_hash=get_password_hash("admin123"),
            name="Unitec Admin",
            role=UserRole.UNITEC_ADMIN,
            company_id=unitec.id
        )
        db.add(admin_user)
        db.commit()
        logger.info("Created User: admin@unitec.com (Pass: admin123)")

    # Client User
    client_user = db.query(User).filter(User.email == "user@client-a.com").first()
    if not client_user:
        client_user = User(
            email="user@client-a.com",
            password_hash=get_password_hash("client123"),
            name="Client A User",
            role=UserRole.CLIENT_MEMBER,
            company_id=client_a.id
        )
        db.add(client_user)
        db.commit()
        logger.info("Created User: user@client-a.com (Pass: client123)")

def main() -> None:
    logger.info("Creating initial data")
    db = SessionLocal()
    init_db(db)
    logger.info("Initial data created")

if __name__ == "__main__":
    main()

