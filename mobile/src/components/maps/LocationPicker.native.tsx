import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';

export interface MapLocation {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: MapLocation;
  onChange: (value: MapLocation) => void;
  height?: number;
}

const DEFAULT_CENTER: MapLocation = { lat: 41.3111, lng: 69.2797 };

export function LocationPicker({ value, onChange, height = 260 }: LocationPickerProps) {
  const center = useMemo(() => {
    if (Number.isFinite(value.lat) && Number.isFinite(value.lng)) {
      return value;
    }
    return DEFAULT_CENTER;
  }, [value]);

  const region: Region = {
    latitude: center.lat,
    longitude: center.lng,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };

  const handlePress = (event: MapPressEvent) => {
    onChange({
      lat: event.nativeEvent.coordinate.latitude,
      lng: event.nativeEvent.coordinate.longitude,
    });
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView style={StyleSheet.absoluteFill} region={region} onPress={handlePress}>
        <Marker
          coordinate={{ latitude: center.lat, longitude: center.lng }}
          draggable
          onDragEnd={(event) =>
            onChange({
              lat: event.nativeEvent.coordinate.latitude,
              lng: event.nativeEvent.coordinate.longitude,
            })
          }
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
