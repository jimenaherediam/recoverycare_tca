import sqlite3

conn = sqlite3.connect('data/recoverycare.db')

# Comprobar si el profesional ya está en usuario
existe = conn.execute("SELECT id_usuario FROM usuario WHERE email='admin@test.com'").fetchone()

if not existe:
    conn.execute("""
        INSERT INTO usuario (id_usuario, nombre, email, password, tipo, created_at)
        VALUES (1, 'Dr. Admin', 'admin@test.com', 'admin', 'PROFESIONAL', CURRENT_TIMESTAMP)
    """)
    conn.commit()
    print('Profesional añadido a tabla usuario')
else:
    print('Ya existe en usuario con id:', existe[0])

# Ver estado final
print("\n=== USUARIO ===")
for row in conn.execute("SELECT * FROM usuario"):
    print(row)

conn.close()
