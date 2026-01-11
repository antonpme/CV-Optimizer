---
name: supabase-storage
description: Expert guide for Supabase Storage including bucket management, file operations, URL generation, and RLS policies. Use when working with file uploads/downloads, creating public or private buckets, generating signed URLs, implementing storage RLS policies, handling resumable uploads, image transformations, or any Supabase Storage-related tasks.
---

# Supabase Storage Expert

You are an expert in Supabase Storage, specializing in file management, bucket configuration, access control, and Row Level Security (RLS) policies for storage objects.

## 1. Storage Architecture Overview

Supabase Storage provides S3-compatible object storage with built-in CDN, image transformations, and Row Level Security integration.

**Key Components:**
- **Buckets**: Containers for organizing files (public or private)
- **Objects**: Files stored within buckets
- **RLS Policies**: Security rules controlling access to buckets and objects
- **Helper Functions**: SQL functions for path manipulation and access control

---

## 2. Bucket Management

### Creating Buckets

#### JavaScript
```javascript
const { data, error } = await supabase.storage.createBucket('avatars', {
  public: true,
  allowedMimeTypes: ['image/*'],
  fileSizeLimit: '1MB',
})
```

#### SQL
```sql
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);
```

### Bucket Operations

**Get Bucket:**
```javascript
const { data, error } = await supabase.storage.getBucket('avatars')
```

**List Buckets:**
```javascript
const { data, error } = await supabase.storage.listBuckets()
```

**Update Bucket:**
```javascript
const { data, error } = await supabase.storage.updateBucket('avatars', {
  public: false,
  allowedMimeTypes: ['image/png', 'image/jpeg'],
  fileSizeLimit: '5MB'
})
```

**Delete Bucket:**
```javascript
const { data, error } = await supabase.storage.deleteBucket('avatars')
```

**Empty Bucket:**
```javascript
const { data, error } = await supabase.storage.emptyBucket('avatars')
```

---

## 3. File Operations

### Upload Files

#### Standard Upload
```javascript
const avatarFile = event.target.files[0]
const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload('public/avatar1.png', avatarFile, {
    cacheControl: '3600',
    upsert: false
  })
```

#### TypeScript Upload Function
```typescript
async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Math.random()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return { path: data.path, url: urlData.publicUrl }
}
```

### Download Files

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .download('folder/avatar1.png')
```

### List Files

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .list('folder', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  })
```

### Remove Files

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .remove(['folder/avatar1.png', 'folder/avatar2.png'])
```

---

## 4. URL Generation

### Public URLs

```javascript
const { data } = supabase
  .storage
  .from('public-bucket')
  .getPublicUrl('folder/avatar1.png')
```

### Signed URLs (Private Buckets)

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .createSignedUrl('folder/avatar1.png', 60) // 60 seconds
```

**Create Multiple Signed URLs:**
```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .createSignedUrls(['folder/avatar1.png', 'folder/avatar2.png'], 60)
```

---

## 5. Row Level Security (RLS) Policies

### Public Bucket Policies

**Allow Public Viewing:**
```sql
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');
```

**Allow Authenticated Uploads:**
```sql
create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );
```

**User-Specific Updates:**
```sql
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    auth.uid()::text = (storage.foldername(name))[1]
    AND bucket_id = 'avatars'
  );
```

### Private Bucket Policies

```sql
create policy "Users can access own private files"
  on storage.objects for select
  using (
    bucket_id = 'private-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 6. Storage Helper Functions

### `storage.foldername(name)`

Extracts folder path components from object name.

```sql
(storage.foldername('folder1/folder2/file.png'))[1] -- 'folder1'
```

### `storage.extension(name)`

Extracts file extension from object name.

```sql
storage.extension('file.png') -- 'png'
```

---

## 7. Best Practices

### Security
1. Always enable RLS on storage.objects
2. Use separate buckets for public and private content
3. Organize files by user ID in folder structure
4. Validate file types and sizes at both client and policy level
5. Use signed URLs for temporary access to private files

### Performance
1. Use public buckets for static assets
2. Set appropriate cache control headers
3. Use image transformations instead of uploading multiple sizes
4. Implement resumable uploads for large files (>6MB)

### Organization
1. Name buckets descriptively
2. Use folder structure for logical organization
3. Include metadata in upload options
4. Set file size limits on buckets
