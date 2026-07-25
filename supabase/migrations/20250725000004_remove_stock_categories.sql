-- Remove stock-type categories (stock tracking is now product-driven)
DELETE FROM categories WHERE type = 'stock';
