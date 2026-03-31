# Cloudinary Setup Guide

## Quick Start

### 1. Install Dependencies
No additional dependencies needed! The implementation uses native `fetch` API.

### 2. Create Cloudinary Account & Configure

1. **Sign up** at [cloudinary.com](https://cloudinary.com)
2. **Get your Cloud Name** from the dashboard
3. **Create Unsigned Upload Preset**:
   - Go to: Settings → Upload → Upload presets
   - Click "Add upload preset"
   - Give it a name (e.g., `xccm-uploads`)
   - Set **Signing mode** to **"Unsigned"**
   - (Optional) Set folder to organize uploads
   - Save the preset

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

**Example:**
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz123abc
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=xccm-uploads
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Test

Navigate to:
- `/register` - Test user registration with photo upload
- Teacher profile - Test profile photo update
- Course creation - Test cover image upload

---

## File Structure

```
src/
├── types/
│   └── upload.ts                    # TypeScript types
├── lib/
│   └── services/
│       └── CloudinaryService.ts     # Core upload service
├── components/
│   └── upload/
│       └── ImageUploader.tsx        # Reusable component
└── app/
    └── register/
        └── page.tsx                 # ✅ Updated
    components/
    └── professor/
        └── ProfileCard.tsx          # ✅ Updated
    └── create-course/
        └── page.tsx                 # ✅ Updated
```

---

## Usage

### Option 1: Use ImageUploader Component (Recommended)

```tsx
import ImageUploader from '@/components/upload/ImageUploader';

function MyComponent() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <ImageUploader
      currentImageUrl={imageUrl}
      onUploadComplete={(url) => setImageUrl(url)}
      onUploadError={(error) => console.error(error)}
    />
  );
}
```

### Option 2: Use CloudinaryService Directly

```tsx
import { CloudinaryService } from '@/lib/services/CloudinaryService';

async function handleUpload(file: File) {
  const url = await CloudinaryService.uploadImage(file, {
    folder: 'avatars'
  });
  return url;
}
```

---

## Validation Rules

- **Accepted formats**: JPG, JPEG, PNG, WEBP
- **Max file size**: 5MB
- **Validated** client-side before upload

---

## Troubleshooting

### Error: "Configuration Cloudinary manquante"
✅ Create `.env.local` with both variables

### Upload fails with 400
✅ Ensure preset is "Unsigned" in Cloudinary dashboard

### Variables not loading
✅ Restart dev server after creating `.env.local`

---

## Security Notes

✅ No API secrets exposed on frontend  
✅ Unsigned preset controls upload permissions  
✅ Cloudinary handles all file processing  
✅ HTTPS secure URLs returned
