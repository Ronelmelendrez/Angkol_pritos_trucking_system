-- Fix categories unique constraint: allow same name for different types

ALTER TABLE categories DROP CONSTRAINT categories_name_key;
ALTER TABLE categories ADD CONSTRAINT categories_name_type_unique UNIQUE (name, type);
