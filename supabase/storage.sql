-- Solo MVP v1.1 – Supabase Storage Bucket & Policies

-- Create private bucket for CV uploads (works even if storage.create_bucket is unavailable)
insert into storage.buckets (id, name, public)
select 'cv-uploads', 'cv-uploads', false
where not exists (select 1 from storage.buckets where id = 'cv-uploads');

-- Storage policies on storage.objects
-- Allow users to manage their own files in the cv-uploads bucket
drop policy if exists "cv-uploads owners read" on storage.objects;
create policy "cv-uploads owners read" on storage.objects
  for select using (
    bucket_id = 'cv-uploads' and auth.uid() = owner
  );

drop policy if exists "cv-uploads owners insert" on storage.objects;
create policy "cv-uploads owners insert" on storage.objects
  for insert with check (
    bucket_id = 'cv-uploads' and auth.uid() = owner
  );

drop policy if exists "cv-uploads owners update" on storage.objects;
create policy "cv-uploads owners update" on storage.objects
  for update using (
    bucket_id = 'cv-uploads' and auth.uid() = owner
  ) with check (
    bucket_id = 'cv-uploads' and auth.uid() = owner
  );

drop policy if exists "cv-uploads owners delete" on storage.objects;
create policy "cv-uploads owners delete" on storage.objects
  for delete using (
    bucket_id = 'cv-uploads' and auth.uid() = owner
  );
