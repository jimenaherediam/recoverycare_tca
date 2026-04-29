import sqlite3

conn = sqlite3.connect('data/recoverycare.db')

# Obtener siguiente ID disponible
next_id = (conn.execute("SELECT MAX(id_usuario) FROM usuario").fetchone()[0] or 0) + 1

# Insertar profesional en usuario
conn.execute("""
    INSERT INTO usuario (id_usuario, nombre, email, password, tipo, created_at)
    VALUES (?, 'Dr. Admin', 'admin@test.com', 'admin', 'PROFESIONAL', CURRENT_TIMESTAMP)
""", (next_id,))

# Actualizar id en tabla profesional
conn.execute("UPDATE profesional SET id_profesional=? WHERE email='admin@test.com'", (next_id,))

# Actualizar vinculo paciente_profesional
conn.execute("UPDATE paciente_profesional SET profesional_id=? WHERE profesional_id=1", (next_id,))

conn.commit()
print(f'Profesional creado en usuario con id={next_id}')

print("\n=== USUARIO ===")
for row in conn.execute("SELECT * FROM usuario"):
    print(row)

print("\n=== PACIENTE_PROFESIONAL ===")
for row in conn.execute("SELECT * FROM paciente_profesional"):
    print(row)

conn.close()
