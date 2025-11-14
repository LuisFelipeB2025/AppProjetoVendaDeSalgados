import React, { useState, useEffect } from 'react';
// Removido SafeAreaView da importação
import { Text, View, StyleSheet } from 'react-native'; 
// Importações presumidas, certifique-se de que os caminhos estão corretos
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen'; 
import RegisterScreen from './screens/RegisterScreen';
import { initDatabase } from './dbService';
// Importação de estilos presumida (mantenha seu AppStyle.ts original)
import { styles } from './AppStyle';  

type AuthMode = 'login' | 'register' | 'home';

export default function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('login'); 
  const [dbIsReady, setDbIsReady] = useState(false);

  // Funções de navegação
  const goToHome = () => setAuthMode('home');
  const goToRegister = () => setAuthMode('register');
  const goToLogin = () => setAuthMode('login');

  // Inicialização do DB na montagem
  useEffect(() => {
    // initDatabase() agora resolve instantaneamente na web, prevenindo a tela branca
    initDatabase()
      .then(() => setDbIsReady(true))
      .catch(error => {
        // Este catch agora será acionado APENAS se houver um erro real (mesmo com o mock)
        console.error("Falha na inicialização do DB, mesmo com fallback web:", error);
      });
  }, []);

  // Se dbIsReady for false, exibe o loader
  if (!dbIsReady) {
    return (
      <View style={[styles.loadingContainer, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Carregando dados do aplicativo...</Text> 
      </View>
    );
  }

  const renderScreen = () => {
    switch (authMode) {
      case 'home':
        return <HomeScreen />;
      case 'register':
        return <RegisterScreen onRegisterSuccess={goToLogin} />; 
      case 'login':
      default:
        return (
          <LoginScreen 
            onLogin={goToHome} 
            onNavigateToRegister={goToRegister}
          />
        );
    }
  };

  return (
    // Usando View padrão e garantindo que ocupe 100% da tela com flex: 1
    <View style={[styles.container, { flex: 1 }]}>
      {renderScreen()}
    </View>
  );
}