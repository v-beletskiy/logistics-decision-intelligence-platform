/* @name InsertUserAccount */
INSERT INTO administration.users (
  id,
  tenant_id,
  email,
  password_hash,
  roles,
  active
)
VALUES (
  :id!,
  :tenantId!,
  :email!,
  :passwordHash!,
  :roles!,
  :active!
);
