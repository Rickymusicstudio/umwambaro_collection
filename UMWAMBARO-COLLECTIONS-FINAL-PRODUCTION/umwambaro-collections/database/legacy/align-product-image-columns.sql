-- UMWAMBARO COLLECTIONS
-- Align the product image columns with the current application.
-- Run this ONCE if your products table was created with
-- image_url / hover_image_url by an earlier restore script.

begin;

alter table public.products
  add column if not exists image text,
  add column if not exists hover_image text;

update public.products
set image = image_url
where image is null
  and image_url is not null;

update public.products
set hover_image = hover_image_url
where hover_image is null
  and hover_image_url is not null;

notify pgrst, 'reload schema';

commit;

-- After verifying the application works, the old columns can be
-- removed in a separate controlled migration if desired:
-- alter table public.products drop column image_url;
-- alter table public.products drop column hover_image_url;
