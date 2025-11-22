import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// IMPORTANTE: Importar o Provider aqui
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen'; 
import RegisterScreen from './screens/RegisterScreen'; 
import ProfileScreen from './screens/ProfileScreen'; 

import { initDatabase, supabase } from './BancoDeDados';

export default function App() {
  const [screen, setScreen] = useState<'login' | 'register' | 'home' | 'profile'>('login'); 
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const prepararApp = async () => {
      try {
        await initDatabase(); 

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: dadosCompletos } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (dadosCompletos) {
            setCurrentUser(dadosCompletos);
            setScreen('home'); 
          }
        }
      } catch (e) {
        console.error("Erro ao iniciar app:", e);
      } finally {
        setIsReady(true);
      }
    };

    prepararApp();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  return (
    // AQUI ESTÁ A CORREÇÃO: SafeAreaProvider envolvendo tudo
    <SafeAreaProvider>
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
          <RegisterScreen 
            onRegisterSuccess={() => setScreen('login')} 
            onBack={() => setScreen('login')} 
          />
        )}

        {screen === 'home' && (
          <HomeScreen 
            user={currentUser} 
            onLogout={() => { 
              supabase.auth.signOut();
              setCurrentUser(null); 
              setScreen('login'); 
            }} 
            onNavigateToProfile={() => setScreen('profile')} 
          />
        )}

        {screen === 'profile' && (
          <ProfileScreen 
            user={currentUser} 
            onBack={() => setScreen('home')} 
            onLogout={() => {
              setCurrentUser(null);
              setScreen('login');
            }}
          />
        )}

      </View>
    </SafeAreaProvider>
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