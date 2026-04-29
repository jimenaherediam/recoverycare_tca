import sqlite3

conn = sqlite3.connect('data/recoverycare.db')

# Obtener el siguiente ID disponible
row = conn.execute("SELECT MAX(id_profesional) FROM profesional").fetchone()
next_id = (row[0] or 0) + 1

conn.execute("""
    INSERT INTO profesional (id_profesional, nombre, email, password, especialidad)
    VALUES (?, 'Dr. Admin', 'admin@test.com', 'admin', 'PSICÓLOGO')
""", (next_id,))
conn.commit()
print(f'Profesional creado OK con id={next_id}')
conn.close()
