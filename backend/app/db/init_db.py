import logging
import datetime
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.models.user import Base, User, Company, UserRole, CompanyType
from app.models.issue import Issue, IssueStatus, Urgency
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_initial_data(db: Session) -> None:
    # 1. Create Companies
    unitec = db.query(Company).filter(Company.name == "Unitec Foods").first()
    if not unitec:
        unitec = Company(
            name="Unitec Foods",
            representative_email="admin@unitecfoods.co.jp",
            type=CompanyType.UNITEC,
            address_default="東京都中央区日本橋..."
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
        db.refresh(admin_user)
        logger.info("Created User: admin@unitec.com (Pass: admin123)")

    # Client User (Client Admin)
    client_user = db.query(User).filter(User.email == "user@client-a.com").first()
    if not client_user:
        client_user = User(
            email="user@client-a.com",
            password_hash=get_password_hash("client123"),
            name="佐藤 健",
            role=UserRole.CLIENT_ADMIN,
            company_id=client_a.id
        )
        db.add(client_user)
        db.commit()
        db.refresh(client_user)
        logger.info("Created User: user@client-a.com (Pass: client123, Role: CLIENT_ADMIN)")
    
    # 3. Create Issues (Sample Data)
    if db.query(Issue).count() == 0:
        issue1 = Issue(
            issue_code="REQ-001",
            title="低糖質クッキーの食感改善",
            description="現在開発中の低糖質クッキーですが、どうしてもボソボソとした食感になってしまいます。\nしっとりとした食感を出すための添加剤や配合の提案をお願いしたいです。\n\nターゲット層：20-40代女性\n現状の課題：焼成後の水分保持力が低い",
            status=IssueStatus.UNTOUCHED,
            urgency=Urgency.HIGH,
            product_name="ロカボクッキー",
            category="texture",
            company_id=client_a.id,
            creator_id=client_user.id,
            desired_deadline=datetime.date.today() + datetime.timedelta(days=7),
            is_sample_provided=True,
            sample_shipping_info="ヤマト運輸 1234-5678-9012"
        )
        db.add(issue1)

        issue2 = Issue(
            issue_code="REQ-002",
            title="新商品向けイチゴフレーバーの提案",
            description="春向けの新商品として、桜餅のような和風のイチゴフレーバーを探しています。\nコストは抑えめでお願いします。",
            status=IssueStatus.IN_PROGRESS,
            urgency=Urgency.MIDDLE,
            product_name="春の桜餅風アイス",
            category="flavor",
            company_id=client_a.id,
            creator_id=client_user.id,
            desired_deadline=datetime.date.today() + datetime.timedelta(days=14),
            is_sample_provided=False
        )
        db.add(issue2)
        
        db.commit()
        logger.info("Created Sample Issues")

def init_db():
    # Create tables (with error handling for concurrent workers)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.warning(f"Table creation skipped or failed: {e}")
        # Continue even if tables already exist
    
    # Create initial data
    db = SessionLocal()
    try:
        create_initial_data(db)
    except Exception as e:
        logger.error(f"Failed to create initial data: {e}")
    finally:
        db.close()
