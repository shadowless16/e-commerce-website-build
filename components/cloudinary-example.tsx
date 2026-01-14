'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/image-upload';
import { CloudinaryImage } from '@/components/cloudinary-image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CloudinaryExample() {
  const [imageUrl, setImageUrl] = useState<string>('');

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Cloudinary Integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUpload onUpload={setImageUrl} />
        
        {imageUrl && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Uploaded Image:</p>
            <CloudinaryImage
              src={imageUrl}
              alt="Uploaded image"
              width={300}
              height={200}
              className="rounded-lg"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}