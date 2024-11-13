import React, { useEffect, useState } from 'react';
import { Alert, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import databaseOperations from './databaseOperations';
import * as Location from 'expo-location';

export default function App() {
  const [markers, setMarkers] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState();

  const getMarkerAddressAsync = async (marker) => {
    const result = await Location.reverseGeocodeAsync({
      latitude: marker.latitude,
      longitude: marker.longitude,
    })
    if (result.length > 0) {
      const address = result[0];
      const addressFormatted = `${address.name}, ${address.city}, ${address.region}, ${address.country}`;
      return addressFormatted;
    } else {
      Alert.alert('Klaida!', 'Nepavyko rasti nurodyto žymeklio adresą');
      return undefined;
    }
  }

  const deleteMarker = async (marker) => {
    const showAlert = () => {
      return new Promise((resolve) => {
        Alert.alert(
          'Patvirtinimas', 
          'Ar norite ištrinti nurodytą žymeklį?', 
          [
            { text: 'Taip', onPress: () => resolve(true) },
            { text: 'Ne', onPress: () => resolve(false) }
          ]
        );
      });
    };
  
    const shouldDelete = await showAlert();
    if (!shouldDelete) {
      return;
    }

    databaseOperations.deleteMarkerById(marker.id);
    await fetchMarkers();
    setSelectedMarker(undefined);
  };
  
  const addMarker = async (coordinate) => {
    const address = await getMarkerAddressAsync(coordinate);
    if (!address) return;

    const newMarker = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      name: address,
    };

    setMarkers([...markers, newMarker]);
    databaseOperations.insertMarker(newMarker);
  };

  const fetchMarkers = async () => {
    try {
      const markers = await databaseOperations.getMarkers();
      setMarkers(markers);
    }
    catch (error) {
      console.log('error: ', error)
    }
    finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    databaseOperations.createMarkersTable();
    fetchMarkers();
  }, []);

  if (isFetching)
    return <View />

  return (
    <View style={styles.container}>
      <MapView
        style={{ flex: 1 }}
        showsUserLocation
        showsMyLocationButton
        showsScale
        showsTraffic
        showsIndoors
        focusable
        onLongPress={(event) => addMarker(event.nativeEvent.coordinate)}
      >
        {markers.map((marker, index) => (
          <Marker 
            key={index} 
            coordinate={marker} 
            title={marker.name} 
            onSelect={() => setSelectedMarker(marker)}
            onDeselect={() => setSelectedMarker(undefined)}
          />
        ))}
      </MapView>
      {selectedMarker &&
        <TouchableOpacity style={styles.deleteContainer} onPress={() => deleteMarker(selectedMarker)}>
          <Text style={styles.deleteText}>Ištrinti</Text>
        </TouchableOpacity>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deleteContainer: {
    display: 'flex',
    position: 'absolute',
    zIndex: 10000,
    width: 200,
    height: 80,
    margin: 20,
    borderColor: 'red',
    borderWidth: 3,
    borderRadius: 25,
    bottom: 0,
    right: 0
  },
  deleteText: {
    fontSize: 25,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto'
  }
});
