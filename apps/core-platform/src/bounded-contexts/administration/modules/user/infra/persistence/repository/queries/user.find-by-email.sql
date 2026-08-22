/* @name FindUserAccountByEmail */
SELECT id, tenant_id, email, password_hash, roles, active
FROM administration.users
WHERE email = :email!;
