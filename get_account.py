import bcrypt

password = "12345"
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

emails = [
    'test1@gmail.com',
    'test2@gmail.com',
    'test3@gmail.com',
    'test4@gmail.com',
    'test5@gmail.com',
    'test6@gmail.com',
    'test7@gmail.com',
    'test8@gmail.com',
]

print("-- Run this in PostgreSQL:")
print()
for email in emails:
    print(f"INSERT INTO accounts (email, password, is_verified) VALUES ('{email}', '{hashed}', TRUE);")