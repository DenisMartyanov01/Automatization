import sys
import os

# Добавляем текущую директорию в PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import create_test_user, SessionLocal, engine, Base

def init_database():
    print("🔄 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created!")
    
    print("🔄 Creating test user...")
    create_test_user()
    print("✅ Test user created!")

if __name__ == "__main__":
    init_database()