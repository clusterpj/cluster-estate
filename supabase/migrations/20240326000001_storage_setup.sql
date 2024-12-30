-- Create storage bucket for property images
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true);

-- Allow public access to property images
create policy "Property images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'property-images' );

-- Allow authenticated users to upload images
create policy "Users can upload property images"
  on storage.objects for insert
  with check (
    bucket_id = 'property-images'
    and auth.role() = 'authenticated'
  );

-- Allow users to update their own images
create policy "Users can update their own property images"
  on storage.objects for update
  using (
    bucket_id = 'property-images'
    and auth.uid() = owner
  );

-- Allow users to delete their own images
create policy "Users can delete their own property images"
  on storage.objects for delete
  using (
    bucket_id = 'property-images'
    and auth.uid() = owner
  );
