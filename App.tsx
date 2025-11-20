import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen'; 
import RegistroScreen from './screens/RegisterScreen'; 
import { initDatabase } from './dbService';

export default function App() {
  const [screen, setScreen] = useState<'login' | 'register' | 'home'>('login');
  const [isDbReady, setIsDbReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    initDatabase()
      .then(() => setIsDbReady(true))
      .catch((e) => console.error("Erro DB:", e));
  }, []);

  if (!isDbReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {screen === 'login' && (
        <LoginScreen 
          onLogin={(user: any) => {
            setCurrentUser(user);
            setScreen('home');
          }} 
          onNavigateToRegister={() => setScreen('register')}
        />
      )}

      {screen === 'register' && (
        <RegistroScreen 
          onRegisterSuccess={() => setScreen('login')}
          onBack={() => setScreen('login')} 
        />
      )}

      {screen === 'home' && (
        <HomeScreen 
          user={currentUser} 
          onLogout={() => {
            setCurrentUser(null);
            setScreen('login');
          }} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});