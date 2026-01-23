import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, GripVertical } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageUploadProps {
  existingImages: Array<{ id: string; url: string; order: number }>;
  newImages: File[];
  onNewImagesChange: (files: File[]) => void;
  onImageDelete?: (imageId: string) => void;
  onReorder?: (imageIds: string[]) => void;
  maxFiles?: number;
}

interface SortableImageProps {
  image: { id: string; url: string };
  onDelete?: (imageId: string) => void;
}

const SortableImage: React.FC<SortableImageProps> = ({ image, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <img
        src={image.url}
        alt="Apartment"
        className="w-full h-48 object-cover rounded-lg"
      />
      
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg">
        <div className="absolute top-2 right-2">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete?.(image.id)}
          >
            <X size={16} />
          </Button>
        </div>
        
        <div className="absolute top-2 left-2 cursor-move" {...attributes} {...listeners}>
          <GripVertical className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  existingImages,
  newImages,
  onNewImagesChange,
  onImageDelete,
  onReorder,
  maxFiles = 10
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = maxFiles - (existingImages.length + newImages.length);
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    
    if (filesToAdd.length > 0) {
      onNewImagesChange([...newImages, ...filesToAdd]);
    }
  }, [existingImages.length, newImages, maxFiles, onNewImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: existingImages.length + newImages.length >= maxFiles
  });

  const handleRemoveNewImage = (index: number) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    onNewImagesChange(updated);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = existingImages.findIndex(img => img.id === active.id);
      const newIndex = existingImages.findIndex(img => img.id === over.id);
      
      const newOrder = arrayMove(existingImages, oldIndex, newIndex);
      onReorder?.(newOrder.map(img => img.id));
    }
  };

  const totalImages = existingImages.length + newImages.length;
  const canUploadMore = totalImages < maxFiles;

  return (
    <div className="space-y-4">
      {/* Existing Images - Sortable */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Current Images</h4>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={existingImages.map(img => img.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {existingImages.map((image) => (
                  <SortableImage
                    key={image.id}
                    image={image}
                    onDelete={onImageDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* New Images */}
      {newImages.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">New Images to Upload</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {newImages.map((file, index) => (
              <div key={`new-${index}`} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New ${index}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveNewImage(index)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            
            {isDragActive ? (
              <p className="text-blue-500">Drop the images here...</p>
            ) : (
              <>
                <p className="text-gray-600">
                  Drag & drop images here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, GIF, WEBP up to 10MB each
                </p>
                <p className="text-sm text-gray-500">
                  {totalImages} of {maxFiles} images uploaded
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Max Files Warning */}
      {!canUploadMore && (
        <Card className="bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800 text-center">
            Maximum of {maxFiles} images reached. Delete some images to upload more.
          </p>
        </Card>
      )}
    </div>
  );
};
