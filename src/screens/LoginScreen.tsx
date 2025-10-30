// src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator'; // Importar tipos
import StyledTextInput from '../components/StyledTextInput';
import { Colors } from '../constants/Colors';
import { checkLogin } from '../database/db'; // Importar função do SQLite

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// O componente agora espera a navegação, não a prop onLogin
export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('teste@email.com'); // useState na atribuição
  const [password, setPassword] = useState('123456'); // useState na atribuição

  const handleLoginPress = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    // 1. Verificar Login no SQLite
    const user = await checkLogin(email, password);

    if (user) {
      Alert.alert('Sucesso', 'Login realizado!');
      // 2. Navegar para a Home, passando os dados do usuário (simulando estado global)
      navigation.replace('Home', { user }); 
    } else {
      Alert.alert('Erro', 'E-mail ou senha inválidos.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}> 
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Bem-vindo 👋</Text>

          {/* Componente TextInput Customizado */}
          <StyledTextInput
            placeholder="Digite seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Componente TextInput Customizado */}
          <StyledTextInput
            placeholder="Digite sua senha"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
            <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background, // Fundo claro para o SafeAreaView
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 25,
    backgroundColor: Colors.cardBackground,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 30,
    color: Colors.text,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: Colors.cardBackground,
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    padding: 5,
  },
  linkText: {
    color: Colors.secondary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});