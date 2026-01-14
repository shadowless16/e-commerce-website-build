'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ onUpload, disabled }: ImageUploadProps) {
  return (
    <CldUploadWidget
      uploadPreset="ml_default" // You'll need to create this in Cloudinary
      onSuccess={(result: any) => {
        onUpload(result.info.secure_url);
      }}
    >
      {({ open }) => (
        <Button
          type="button"
          disabled={disabled}
          variant="outline"
          onClick={() => open()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
      )}
    </CldUploadWidget>
  );
}