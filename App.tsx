import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
// Biblioteca de área segura (necessária para evitar o aviso de depreciação)
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Telas (assumindo que estão na pasta screens/ na raiz)
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen'; 
import RegisterScreen from './screens/RegisterScreen'; 
import ProfileScreen from './screens/ProfileScreen'; 
// Serviço de Banco de Dados (assumindo que está na raiz)
import { initDatabase } from './dbService';

export default function App() {
  // O estado 'screen' agora inclui a rota 'profile'
  const [screen, setScreen] = useState<'login' | 'register' | 'home' | 'profile'>('login');
  const [isDbReady, setIsDbReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Inicializa o banco de dados (SQLite ou localStorage)
    initDatabase()
      .then(() => setIsDbReady(true))
      .catch((e) => console.error("Erro ao inicializar o DB:", e));
  }, []);

  // Exibe tela de carregamento enquanto o DB não está pronto
  if (!isDbReady) {
      return (
          <View style={styles.center}>
              <ActivityIndicator size="large" color="#FF6600" />
          </View>
      );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {/* TELA DE LOGIN */}
        {screen === 'login' && (
          <LoginScreen 
            onLogin={(user: any) => { 
              setCurrentUser(user); 
              setScreen('home'); 
            }} 
            onNavigateToRegister={() => setScreen('register')}
          />
        )}

        {/* TELA DE REGISTRO */}
        {screen === 'register' && (
          <RegisterScreen 
            onRegisterSuccess={() => setScreen('login')}
            onBack={() => setScreen('login')} 
          />
        )}

        {/* TELA INICIAL (CATÁLOGO) */}
        {screen === 'home' && (
          <HomeScreen 
              user={currentUser} 
              onLogout={() => { 
                setCurrentUser(null); 
                setScreen('login'); 
              }} 
              // CONEXÃO COM O BOTÃO MEU PERFIL NO MENU HAMBÚRGUER
              onNavigateToProfile={() => setScreen('profile')}
          />
        )}

        {/* TELA DE PERFIL */}
        {screen === 'profile' && (
          <ProfileScreen 
            user={currentUser} 
            onBack={() => setScreen('home')} 
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