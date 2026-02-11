import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apartmentsApi, UploadFile, Complex } from '../../../api/apartments';
import { Screen } from '../../../components/layout/Screen';
import { Header } from '../../../components/layout/Header';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { COLORS, FONT_SIZES } from '../../../theme';

const apartmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  rooms: z.string().min(1, 'Rooms is required'),
  area: z.string().min(1, 'Area is required'),
  floor: z.string().min(1, 'Floor is required'),
  address: z.string().min(1, 'Address is required'),
  developerName: z.string().min(1, 'Developer is required'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  complexId: z.string().optional(),
});

type ApartmentFormData = z.infer<typeof apartmentSchema>;

interface Props {
  onSuccess?: () => void;
}

export function ApartmentFormScreen({ onSuccess }: Props) {
  const [images, setImages] = useState<UploadFile[]>([]);

  const { data: complexes = [] } = useQuery<Complex[]>({
    queryKey: ['complexes'],
    queryFn: () => apartmentsApi.getComplexes(),
  });

  const { control, handleSubmit, formState, watch, setValue } = useForm<ApartmentFormData>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      rooms: '',
      area: '',
      floor: '',
      address: '',
      developerName: '',
      contactPhone: '',
      complexId: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ApartmentFormData) => {
      const payload = {
        title: { uz: data.title, ru: data.title, en: data.title },
        description: data.description
          ? { uz: data.description, ru: data.description, en: data.description }
          : undefined,
        price: Number(data.price),
        rooms: Number(data.rooms),
        area: Number(data.area),
        floor: Number(data.floor),
        address: data.address,
        developerName: data.developerName,
        contactPhone: data.contactPhone,
        complexId: data.complexId || undefined,
      };
      return apartmentsApi.createApartment(payload, images);
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const next = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `image-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      }));
      setImages(next);
    }
  };

  const selectedComplexId = watch('complexId') || '';

  return (
    <Screen>
      <Header title="Create Apartment" subtitle="Publish a new listing" />

      <Button title="Select Images" variant="outline" onPress={pickImages} />
      {images.length > 0 && (
        <Text style={styles.helper}>{images.length} images selected</Text>
      )}

      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value } }) => (
          <Input label="Title" value={value} onChangeText={onChange} error={formState.errors.title?.message} />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <Textarea label="Description" value={value} onChangeText={onChange} error={formState.errors.description?.message} />
        )}
      />
      <Controller
        control={control}
        name="price"
        render={({ field: { onChange, value } }) => (
          <Input label="Price" value={value} onChangeText={onChange} error={formState.errors.price?.message} keyboardType="numeric" />
        )}
      />
      <Controller
        control={control}
        name="rooms"
        render={({ field: { onChange, value } }) => (
          <Input label="Rooms" value={value} onChangeText={onChange} error={formState.errors.rooms?.message} keyboardType="numeric" />
        )}
      />
      <Controller
        control={control}
        name="area"
        render={({ field: { onChange, value } }) => (
          <Input label="Area (m²)" value={value} onChangeText={onChange} error={formState.errors.area?.message} keyboardType="numeric" />
        )}
      />
      <Controller
        control={control}
        name="floor"
        render={({ field: { onChange, value } }) => (
          <Input label="Floor" value={value} onChangeText={onChange} error={formState.errors.floor?.message} keyboardType="numeric" />
        )}
      />
      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, value } }) => (
          <Input label="Address" value={value} onChangeText={onChange} error={formState.errors.address?.message} />
        )}
      />
      <Controller
        control={control}
        name="developerName"
        render={({ field: { onChange, value } }) => (
          <Input label="Developer Name" value={value} onChangeText={onChange} error={formState.errors.developerName?.message} />
        )}
      />
      <Controller
        control={control}
        name="contactPhone"
        render={({ field: { onChange, value } }) => (
          <Input label="Contact Phone" value={value} onChangeText={onChange} error={formState.errors.contactPhone?.message} />
        )}
      />

      <Select
        label="Complex (optional)"
        value={selectedComplexId}
        options={[
          { label: 'None', value: '' },
          ...complexes.map((complex) => ({
            label:
              complex.title ||
              (typeof complex.name === 'string'
                ? complex.name
                : complex.name?.uz || complex.name?.en || complex.name?.ru || 'Complex'),
            value: complex.id,
          })),
        ]}
        onChange={(value) => setValue('complexId', value)}
      />

      {mutation.isError ? (
        <Text style={styles.errorText}>{(mutation.error as Error).message}</Text>
      ) : null}

      <Button
        title={mutation.isPending ? 'Saving...' : 'Create Apartment'}
        onPress={handleSubmit((data) => mutation.mutate(data))}
        loading={mutation.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  helper: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.sm,
  },
});
