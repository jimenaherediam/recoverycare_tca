import sqlite3
import re
from pathlib import Path

def convert_mysql_to_sqlite(sql_file, db_path):
    """Convierte un archivo SQL de MySQL a SQLite (Versión Final Definitiva)"""

    # 1. Borrar la base de datos vieja si existe para evitar "table already exists"
    if Path(db_path).exists():
        Path(db_path).unlink()
        print("🗑️  Base de datos anterior eliminada. Creando una nueva...")

    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    statements = []
    current_statement = ""
    in_multiline_comment = False

    for line in sql_content.split('\n'):
        line = line.strip()
        
        line = line.split('--')[0].strip()

        if line.startswith('/*'): 
            in_multiline_comment = True
        if '*/' in line:
            in_multiline_comment = False
            continue
            
        if line == '' or line.startswith('SET ') or in_multiline_comment:
            continue

        current_statement += line + " "

        if line.endswith(';'):
            statements.append(current_statement.strip())
            current_statement = ""

    sqlite_statements = []

    for stmt in statements:
        stmt = stmt.replace('`', '"')

        stmt = re.sub(r'enum\([^)]+\)', 'TEXT', stmt, flags=re.IGNORECASE)
        stmt = re.sub(r'int\(\d+\)', 'INTEGER', stmt, flags=re.IGNORECASE)
        stmt = re.sub(r'varchar\(\d+\)', 'TEXT', stmt, flags=re.IGNORECASE)
        stmt = re.sub(r'tinyint\(\d+\)', 'BOOLEAN', stmt, flags=re.IGNORECASE)
        stmt = re.sub(r'datetime', 'TEXT', stmt, flags=re.IGNORECASE)
        stmt = re.sub(r'date', 'TEXT', stmt, flags=re.IGNORECASE)
        stmt = re.sub(r'longtext', 'TEXT', stmt, flags=re.IGNORECASE) # Fix para cuestionario

        stmt = re.sub(r'AUTO_INCREMENT', 'AUTOINCREMENT', stmt, flags=re.IGNORECASE)
        stmt = re.sub(r'INTEGER NOT NULL AUTOINCREMENT', 'INTEGER PRIMARY KEY AUTOINCREMENT', stmt, flags=re.IGNORECASE)
        stmt = re.sub(r',\s*PRIMARY KEY\s*\([^)]+\)', '', stmt, flags=re.IGNORECASE)

        stmt = re.sub(r'ENGINE=[^;]+', '', stmt, flags=re.IGNORECASE)
        stmt = re.sub(r'DEFAULT CHARSET=[^;]+', '', stmt, flags=re.IGNORECASE)
        stmt = re.sub(r'COLLATE\s+[^;,\s]+', '', stmt, flags=re.IGNORECASE)
        stmt = re.sub(r'CHARACTER SET\s+[^;,\s]+', '', stmt, flags=re.IGNORECASE)
        
        # Elimina los constraints CHECK (incluyendo los que tienen parentesis anidados)
        stmt = re.sub(r'CHECK\s*\([^)]+\)', '', stmt, flags=re.IGNORECASE)
        stmt = stmt.replace(') )', ')') # Limpia el paréntesis huérfano

        if stmt.upper().startswith('CREATE TABLE'):
            sqlite_statements.append(stmt)

    for stmt in sqlite_statements:
        try:
            print(f"Ejecutando: {stmt[:60]}...")
            cursor.execute(stmt)
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print(f"Statement: {stmt}\n")

    conn.commit()
    conn.close()
    print(f"\n✅ Base de datos creada con éxito en: {db_path}")

if __name__ == "__main__":
    sql_file = Path(__file__).parent / "recoverycare.sql"
    db_path = Path(__file__).parent / "data" / "recoverycare.db"

    if sql_file.exists():
        convert_mysql_to_sqlite(sql_file, db_path)
    else:
        print(f"Archivo SQL no encontrado: {sql_file}")