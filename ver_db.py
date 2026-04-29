import sqlite3

conn = sqlite3.connect('data/recoverycare.db')

print("=== PACIENTES ===")
for row in conn.execute("SELECT * FROM paciente"):
    print(row)

print("\n=== USUARIOS ===")
for row in conn.execute("SELECT id_usuario, nombre, email, tipo FROM usuario"):
    print(row)

print("\n=== PACIENTE_PROFESIONAL ===")
for row in conn.execute("SELECT * FROM paciente_profesional"):
    print(row)

print("\n=== PROFESIONAL ===")
for row in conn.execute("SELECT * FROM profesional"):
    print(row)

conn.close()
