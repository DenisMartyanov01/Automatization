import time
import os
from sqlalchemy import create_engine, text
from pathlib import Path

# Получаем путь к директории, где находится текущий скрипт (или YAML файл)
current_dir = Path(__file__).parent.absolute()
db_url = os.getenv('SQLALCHEMY_DATABASE_URL')

while True:
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            print('✅ Database connected!')
            break
    except Exception as e:
        print(f'⏳ Waiting for database... {e}')
        time.sleep(2)

sql_files = ['main.sql', 'DataUsers.sql', 'DataEvent.sql', 'DataComment.sql', 'DataAdmin.sql']

for sql_file in sql_files:
    try:
        # Формируем полный путь относительно директории скрипта
        file_path = current_dir / 'BD' / 'SQL' / sql_file
        print(f'📁 Executing {file_path}...')
        
        with open(file_path, 'r', encoding='utf-8') as f:
            sql = f.read()
        
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        print(f'✅ {sql_file} executed successfully!')
        
    except FileNotFoundError:
        print(f'❌ File {sql_file} not found at {file_path}!')
    except Exception as e:
        print(f'❌ Error in {sql_file}: {e}')

print('🎉 All SQL files executed successfully!')