import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { apartmentsApi } from '../../../api/apartments';
import { Screen } from '../../../components/layout/Screen';
import { Header } from '../../../components/layout/Header';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { LocationPicker, MapLocation } from '../../../components/maps/LocationPicker';
import { COLORS, FONT_SIZES } from '../../../theme';

const ratingSchema = z
  .string()
  .min(1, 'Rating is required')
  .regex(/^\\d+$/, 'Rating must be 0-10')
  .refine((val) => {
    const num = Number(val);
    return num >= 0 && num <= 10;
  }, 'Rating must be between 0 and 10');

const latitudeSchema = z
  .string()
  .min(1, 'Latitude is required')
  .regex(/^-?\\d+(\\.\\d+)?$/, 'Latitude must be a number')
  .refine((val) => {
    const num = Number(val);
    return num >= -90 && num <= 90;
  }, 'Latitude must be between -90 and 90');

const longitudeSchema = z
  .string()
  .min(1, 'Longitude is required')
  .regex(/^-?\\d+(\\.\\d+)?$/, 'Longitude must be a number')
  .refine((val) => {
    const num = Number(val);
    return num >= -180 && num <= 180;
  }, 'Longitude must be between -180 and 180');

const complexSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  locationText: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  locationLat: latitudeSchema,
  locationLng: longitudeSchema,
  walkabilityRating: ratingSchema,
  airQualityRating: ratingSchema,
  nearbyNote: z.string().optional(),
});

export type ComplexFormData = z.infer<typeof complexSchema>;

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

interface Props {
  mode: 'create' | 'edit';
  complexId?: string;
  onSuccess?: () => void;
}

export function ComplexFormScreen({ mode, complexId, onSuccess }: Props) {
  const isEdit = mode === 'edit';
  const queryClient = useQueryClient();

  const [banner, setBanner] = useState<UploadFile | null>(null);
  const [permission1, setPermission1] = useState<UploadFile | null>(null);
  const [permission2, setPermission2] = useState<UploadFile | null>(null);
  const [permission3, setPermission3] = useState<UploadFile | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const { data: complexData } = useQuery({
    queryKey: ['complex', complexId],
    queryFn: () => apartmentsApi.getComplexById(complexId || ''),
    enabled: isEdit && !!complexId,
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComplexFormData>({
    resolver: zodResolver(complexSchema),
    defaultValues: {
      title: '',
      description: '',
      locationText: '',
      city: '',
      locationLat: '',
      locationLng: '',
      walkabilityRating: '',
      airQualityRating: '',
      nearbyNote: '',
    },
  });

  useEffect(() => {
    if (complexData) {
      const title =
        typeof complexData.name === 'string'
          ? complexData.name
          : complexData.name?.uz || complexData.name?.en || complexData.name?.ru || '';
      const address =
        typeof complexData.address === 'string'
          ? complexData.address
          : (complexData.address as any)?.uz ||
            (complexData.address as any)?.en ||
            (complexData.address as any)?.ru ||
            '';
      reset({
        title: complexData.title || title,
        description: complexData.description || '',
        locationText: complexData.locationText || address || '',
        city: complexData.city || '',
        locationLat:
          complexData.locationLat?.toString() ||
          (complexData as any).latitude?.toString() ||
          '',
        locationLng:
          complexData.locationLng?.toString() ||
          (complexData as any).longitude?.toString() ||
          '',
        walkabilityRating:
          complexData.walkabilityRating?.toString() ||
          (complexData as any).walkabilityScore?.toString() ||
          '',
        airQualityRating:
          complexData.airQualityRating?.toString() ||
          (complexData as any).airQualityScore?.toString() ||
          '',
        nearbyNote: complexData.nearbyNote || '',
      });
    }
  }, [complexData, reset]);

  const locationLat = watch('locationLat');
  const locationLng = watch('locationLng');

  useEffect(() => {
    if (isEdit) return;
    if (locationLat || locationLng) return;
    setValue('locationLat', '41.3111');
    setValue('locationLng', '69.2797');
  }, [isEdit, locationLat, locationLng, setValue]);

  const mapLocation: MapLocation = useMemo(() => {
    const latNum = Number(locationLat);
    const lngNum = Number(locationLng);
    const lat = Number.isFinite(latNum) ? latNum : 41.3111;
    const lng = Number.isFinite(lngNum) ? lngNum : 69.2797;
    return { lat, lng };
  }, [locationLat, locationLng]);

  const handleMapChange = (value: MapLocation) => {
    setValue('locationLat', value.lat.toFixed(6), { shouldValidate: true });
    setValue('locationLng', value.lng.toFixed(6), { shouldValidate: true });
  };

  const handleUseMyLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied');
        setIsLocating(false);
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      handleMapChange({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch (err) {
      Alert.alert('Failed to get location');
    } finally {
      setIsLocating(false);
    }
  };

  const pickBanner = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setBanner({
        uri: asset.uri,
        name: asset.fileName || `banner-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const pickPermission = async (setter: (file: UploadFile | null) => void) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setter({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/pdf',
      });
    }
  };

  const buildFormData = (data: ComplexFormData) => {
    const formData = new FormData();
    const legacyNearby = data.nearbyNote || data.locationText;

    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('locationText', data.locationText);
    formData.append('city', data.city);
    formData.append('locationLat', data.locationLat);
    formData.append('locationLng', data.locationLng);
    formData.append('walkabilityRating', data.walkabilityRating);
    formData.append('airQualityRating', data.airQualityRating);
    if (data.nearbyNote) formData.append('nearbyNote', data.nearbyNote);

    formData.append('address', data.locationText);
    formData.append('latitude', data.locationLat);
    formData.append('longitude', data.locationLng);
    formData.append('walkabilityScore', data.walkabilityRating);
    formData.append('airQualityScore', data.airQualityRating);
    formData.append('nearbyInfrastructureText', legacyNearby);

    if (banner) {
      formData.append('banner', {
        uri: banner.uri,
        name: banner.name,
        type: banner.type,
      } as any);
    }
    if (permission1) {
      formData.append('permission1', {
        uri: permission1.uri,
        name: permission1.name,
        type: permission1.type,
      } as any);
      formData.append('permission_1', {
        uri: permission1.uri,
        name: permission1.name,
        type: permission1.type,
      } as any);
    }
    if (permission2) {
      formData.append('permission2', {
        uri: permission2.uri,
        name: permission2.name,
        type: permission2.type,
      } as any);
      formData.append('permission_2', {
        uri: permission2.uri,
        name: permission2.name,
        type: permission2.type,
      } as any);
    }
    if (permission3) {
      formData.append('permission3', {
        uri: permission3.uri,
        name: permission3.name,
        type: permission3.type,
      } as any);
      formData.append('permission_3', {
        uri: permission3.uri,
        name: permission3.name,
        type: permission3.type,
      } as any);
    }

    return formData;
  };

  const mutation = useMutation({
    mutationFn: async (data: ComplexFormData) => {
      if (mode === 'create') {
        if (!permission1 || !permission2 || !permission3) {
          throw new Error('Please upload all 3 permission files.');
        }
      }
      const formData = buildFormData(data);
      if (isEdit && complexId) {
        const response = await apiClient.patch(`/complexes/${complexId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }
      const response = await apiClient.post('/complexes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complexes'] });
      onSuccess?.();
    },
  });

  const onSubmit = (data: ComplexFormData) => {
    mutation.mutate(data);
  };

  return (
    <Screen>
      <Header title={isEdit ? 'Edit Complex' : 'Create Complex'} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <Button title={permission1 ? 'Permission 1 выбран' : 'Select Permission 1'} variant="outline" onPress={() => pickPermission(setPermission1)} />
        <Button title={permission2 ? 'Permission 2 выбран' : 'Select Permission 2'} variant="outline" onPress={() => pickPermission(setPermission2)} />
        <Button title={permission3 ? 'Permission 3 выбран' : 'Select Permission 3'} variant="outline" onPress={() => pickPermission(setPermission3)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Banner</Text>
        <Button title={banner ? 'Banner выбран' : 'Select Banner Image'} variant="outline" onPress={pickBanner} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Main Details</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <Input label="Title" value={value} onChangeText={onChange} error={errors.title?.message} />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Textarea label="Description" value={value} onChangeText={onChange} error={errors.description?.message} />
          )}
        />
        <Controller
          control={control}
          name="locationText"
          render={({ field: { onChange, value } }) => (
            <Input label="Address" value={value} onChangeText={onChange} error={errors.locationText?.message} />
          )}
        />
        <Controller
          control={control}
          name="city"
          render={({ field: { onChange, value } }) => (
            <Input label="City" value={value} onChangeText={onChange} error={errors.city?.message} />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Button
          title={isLocating ? 'Locating...' : 'Use My Location'}
          variant="outline"
          onPress={handleUseMyLocation}
          loading={isLocating}
        />
        <LocationPicker value={mapLocation} onChange={handleMapChange} />
        <Controller
          control={control}
          name="locationLat"
          render={({ field: { onChange, value } }) => (
            <Input label="Latitude" value={value} onChangeText={onChange} error={errors.locationLat?.message} keyboardType="numeric" />
          )}
        />
        <Controller
          control={control}
          name="locationLng"
          render={({ field: { onChange, value } }) => (
            <Input label="Longitude" value={value} onChangeText={onChange} error={errors.locationLng?.message} keyboardType="numeric" />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ratings</Text>
        <Controller
          control={control}
          name="walkabilityRating"
          render={({ field: { onChange, value } }) => (
            <Input label="Walkability (0-10)" value={value} onChangeText={onChange} error={errors.walkabilityRating?.message} keyboardType="numeric" />
          )}
        />
        <Controller
          control={control}
          name="airQualityRating"
          render={({ field: { onChange, value } }) => (
            <Input label="Air Quality (0-10)" value={value} onChangeText={onChange} error={errors.airQualityRating?.message} keyboardType="numeric" />
          )}
        />
      </View>

      <View style={styles.section}>
        <Controller
          control={control}
          name="nearbyNote"
          render={({ field: { onChange, value } }) => (
            <Textarea label="Nearby Note" value={value} onChangeText={onChange} error={errors.nearbyNote?.message} />
          )}
        />
      </View>

      {mutation.isError ? (
        <Text style={styles.errorText}>{(mutation.error as Error).message}</Text>
      ) : null}

      <Button
        title={mutation.isPending ? 'Saving...' : isEdit ? 'Update Complex' : 'Create Complex'}
        onPress={handleSubmit(onSubmit)}
        loading={mutation.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.sm,
  },
});
