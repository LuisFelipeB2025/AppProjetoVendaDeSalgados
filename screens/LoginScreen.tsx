import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

type LoginScreenProps = {
  onLogin: () => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPress = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha o e-mail e a senha.");
      return;
    }
  
    try {
      const response = await fetch('http://SEU_IP_LOCAL:4000/registrar-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log('Resposta do servidor:', responseData.message);
      } else {
        console.error('Erro do servidor:', responseData.message);
      }
    } catch (error) {
      console.error('Falha ao conectar com o servidor:', error);
      Alert.alert("Erro de Conexão", "Não foi possível registrar o login. Verifique o servidor.");
    }

    onLogin();
  };

  return (
    // O container principal agora serve como o fundo da tela
    <View style={styles.container}>
        {/* E criamos um container para o formulário, para aplicar a borda e a sombra */}
        <View style={styles.formContainer}>
            <Text style={styles.title}>Bem-vindo</Text>

            <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
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
  );
}

// ▼▼▼ STYLESHEET ATUALIZADO ▼▼▼
const styles = StyleSheet.create({
  // Estilo para a tela inteira, que centraliza o formulário
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Fundo branco, pode ser alterado
  },
  // Estilo para a caixa do formulário, traduzido do seu #form-login
  formContainer: {
    width: 320, // Um pouco maior para telas de celular
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Sombra para Android
    elevation: 5,
  },
  // Título, traduzido do #form-login h1
  title: {
    fontSize: 28, // Ajustado para celular
    fontWeight: 'bold',
    textAlign: 'center', // Propriedade correspondente
    marginBottom: 20,
  },
  // Inputs, traduzido do #form-login input[...]
  input: {
    width: '100%',
    height: 45, // Altura ajustada
    marginBottom: 20,
    paddingHorizontal: 10, // Padding horizontal no React Native
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5, // Borda arredondada
  },
  // Botão, traduzido do #form-login input[type="submit"]
  button: {
    width: '100%',
    height: 45,
    backgroundColor: '#4CAF50', // Cor verde do seu exemplo
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});