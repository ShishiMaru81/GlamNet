import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { isFirebaseConfigured } from '../services/firebase';

/**
 * Temporary landing screen for Step 1 (scaffold).
 * Replaced by auth + role-based navigation in later migration steps.
 */
export default function HomeScreen() {
  const firebaseReady = isFirebaseConfigured();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GlamNet</Text>
      <Text style={styles.subtitle}>Expo + TypeScript + Firebase</Text>
      <Text style={styles.body}>
        Mobile scaffold is running. Original MERN web app remains under /backend and /frontend.
      </Text>
      <View style={[styles.badge, firebaseReady ? styles.badgeOk : styles.badgePending]}>
        <Text style={styles.badgeText}>
          {firebaseReady
            ? 'Firebase env configured'
            : 'Firebase placeholders — fill mobile/.env before Auth/Firestore'}
        </Text>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#7a3e4a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5c5c5c',
    marginBottom: 20,
  },
  body: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  badgeOk: {
    backgroundColor: '#d8f5e3',
  },
  badgePending: {
    backgroundColor: '#ffe8cc',
  },
  badgeText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
});
