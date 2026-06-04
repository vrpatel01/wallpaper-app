import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Switch, StatusBar, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyModule from './modules/my-module/src/MyModule';

const BACKGROUND_FETCH_TASK = 'background-wallpaper-task';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const poolJson = await AsyncStorage.getItem('wallpaperPool');
    if (poolJson) {
      const pool = JSON.parse(poolJson);
      if (pool.length > 0) {
        const randomImage = pool[Math.floor(Math.random() * pool.length)];
        await MyModule.setWallpaper(randomImage, 'both');
        return BackgroundFetch.BackgroundFetchResult.NewData;
      }
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [enableCropping, setEnableCropping] = useState(false);
  const [screenType, setScreenType] = useState('both');
  const [isRegistered, setIsRegistered] = useState(false);
  const [poolSize, setPoolSize] = useState(0);

  useEffect(() => {
    checkStatusAsync();
    loadPoolSize();
  }, []);

  const loadPoolSize = async () => {
    const poolJson = await AsyncStorage.getItem('wallpaperPool');
    if (poolJson) {
      setPoolSize(JSON.parse(poolJson).length);
    }
  };

  const checkStatusAsync = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    setIsRegistered(isRegistered);
  };

  const toggleFetchTask = async () => {
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    } else {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 15, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
    checkStatusAsync();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: enableCropping,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const applyWallpaper = async () => {
    if (!selectedImage) return Alert.alert('Error', 'Please select an image first.');
    try {
      await MyModule.setWallpaper(selectedImage, screenType);
      Alert.alert('Success', 'Wallpaper changed successfully!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const addToPool = async () => {
    if (!selectedImage) return Alert.alert('Error', 'Please select an image first.');
    const poolJson = await AsyncStorage.getItem('wallpaperPool');
    let pool = poolJson ? JSON.parse(poolJson) : [];
    pool.push(selectedImage);
    await AsyncStorage.setItem('wallpaperPool', JSON.stringify(pool));
    setPoolSize(pool.length);
    Alert.alert('Success', 'Added to background rotation pool!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>AOPPA Wallpaper</Text>
      
      <View style={styles.glassCard}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}><Text style={styles.placeholderText}>No Image Selected</Text></View>
        )}
        
        <View style={styles.row}>
          <Text style={styles.label}>Enable Cropping</Text>
          <Switch value={enableCropping} onValueChange={setEnableCropping} trackColor={{ false: '#444', true: '#007AFF' }}/>
        </View>

        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Select from Gallery</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.glassCard}>
        <Text style={styles.sectionTitle}>Apply Instantly</Text>
        <View style={styles.row}>
          {['home', 'lock', 'both'].map((type) => (
            <TouchableOpacity 
              key={type} 
              style={[styles.chip, screenType === type && styles.chipActive]} 
              onPress={() => setScreenType(type)}
            >
              <Text style={[styles.chipText, screenType === type && styles.chipTextActive]}>{type.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={applyWallpaper}>
          <Text style={styles.buttonText}>Set Wallpaper</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.glassCard}>
        <Text style={styles.sectionTitle}>Background Automation</Text>
        <Text style={styles.statsText}>Images in Pool: {poolSize}</Text>
        
        <TouchableOpacity style={styles.button} onPress={addToPool}>
          <Text style={styles.buttonText}>Add Current Image to Pool</Text>
        </TouchableOpacity>

        <View style={[styles.row, { marginTop: 15 }]}>
          <Text style={styles.label}>Auto-Rotate (Every 15m)</Text>
          <Switch value={isRegistered} onValueChange={toggleFetchTask} trackColor={{ false: '#444', true: '#34C759' }} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0F0F13',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 30,
    letterSpacing: 1.2,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 15,
  },
  placeholder: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  placeholderText: {
    color: '#888',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: '#FFF',
  },
  chipText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#000',
  },
  statsText: {
    color: '#AAA',
    marginBottom: 15,
  }
});
