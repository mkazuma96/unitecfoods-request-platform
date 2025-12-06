from app.models.user import Base
from app.models.issue import Base
from app.db.session import engine

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)

