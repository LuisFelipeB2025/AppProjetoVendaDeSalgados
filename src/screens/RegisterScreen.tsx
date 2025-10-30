// src/screens/RegisterScreen.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import StyledTextInput from '../components/StyledTextInput';
import { Colors } from '../constants/Colors';
import { registerUser } from '../database/db'; // Importar função do SQLite

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    // Salvamento Local (SQLite)
    const success = await registerUser(name, email, password);

    if (success) {
      Alert.alert('Sucesso', 'Cadastro realizado! Faça seu login agora.');
      navigation.navigate('Login'); // Volta para o login após o cadastro
    } else {
      Alert.alert('Erro', 'Não foi possível cadastrar. O e-mail já pode estar em uso.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Criar Conta</Text>

          <StyledTextInput placeholder="Nome" value={name} onChangeText={setName} />
          <StyledTextInput placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <StyledTextInput placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
            <Text style={styles.linkText}>Voltar ao login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, padding: 20 },
  formContainer: { width: '100%', maxWidth: 400, padding: 25, backgroundColor: Colors.cardBackground, borderRadius: 15, elevation: 8 },
  title: { fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 30, color: Colors.text },
  button: { width: '100%', height: 50, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 10 },
  buttonText: { color: Colors.cardBackground, fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 20, padding: 5 },
  linkText: { color: Colors.primary, textAlign: 'center', fontSize: 16, fontWeight: '600' },
});