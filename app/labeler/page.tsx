'use client';
// pages/index.tsx
import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Label {
  id: string; 
  size: string;
  treadDepth: string;
  brand: string;
  condition: string;
  timestamp: string;
  imagePath: string;
}

export default function TyreLabelingTool() {
  const [image, setImage] = useState<string | null>(null);
  const [labels, setLabels] = useState<Label>({
    id: '',
    size: '',
    treadDepth: '',
    brand: '',
    condition: '',
    timestamp: '',
    imagePath: ''
  });
  const [savedLabels, setSavedLabels] = useState<Label[]>([]);  // Change this line
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLabels = () => {
    if (image) {
      // Generate unique ID for the image
      const imageId = `tire_${Date.now()}`;
      
      // 1. Save the image file
      const imageBlob = dataURLtoBlob(image);
      const imageLink = document.createElement('a');
      imageLink.href = URL.createObjectURL(imageBlob);
      imageLink.download = `tyre_dataset_${imageId}.jpg`; 
      imageLink.click();

      // 2. Create the label data (without the base64 image)
      const labelWithTimestamp = {
        id: imageId,
        size: labels.size,
        treadDepth: labels.treadDepth,
        brand: labels.brand,
        condition: labels.condition,
        timestamp: new Date().toISOString(),
        imagePath: `images/${imageId}.jpg`
      };

      // 3. Add to saved labels
      const updatedLabels = [...savedLabels, labelWithTimestamp];
      setSavedLabels(updatedLabels);
      
      // 4. Download labels.json
      const dataStr = JSON.stringify(updatedLabels, null, 2);
      const jsonBlob = new Blob([dataStr], { type: 'application/json' });
      const jsonLink = document.createElement('a');
      jsonLink.href = URL.createObjectURL(jsonBlob);
      jsonLink.download = `tyre_dataset_labels.json`; 
      jsonLink.click();

      // Reset form
      setLabels({
        id: '',
        size: '',
        treadDepth: '',
        brand: '',
        condition: '',
        timestamp: '',
        imagePath: ''
      });
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper function to convert base64 to blob
  const dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Tyre Image Labeling Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer block"
              >
                {image ? (
                  <img
                    src={image}
                    alt="Uploaded tyre"
                    className="max-h-64 mx-auto"
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <span className="text-gray-500">Click to upload image</span>
                  </div>
                )}
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tyre Size</label>
                <input
                  type="text"
                  value={labels.size}
                  onChange={(e) => setLabels({...labels, size: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="e.g., 225/45R17"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tread Depth (mm)</label>
                <input
                  type="text"
                  value={labels.treadDepth}
                  onChange={(e) => setLabels({...labels, treadDepth: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="e.g., 7.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <input
                  type="text"
                  value={labels.brand}
                  onChange={(e) => setLabels({...labels, brand: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="e.g., Michelin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Condition</label>
                <select
                  value={labels.condition}
                  onChange={(e) => setLabels({...labels, condition: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="">Select condition...</option>
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <button
                onClick={handleSaveLabels}
                disabled={!image}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
              >
                Save Labels
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}