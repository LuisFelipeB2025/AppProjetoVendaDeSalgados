import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// IMPORTANTE: Assumindo que dbService está em um nível acima
import { executeSql } from '../dbService'; 

// Adicionei o tipo AuthMode que estava no App.tsx para tipagem correta
type LoginScreenProps = {
    onLogin: () => void;
    onNavigateToRegister: () => void;
};

export default function LoginScreen({ onLogin, onNavigateToRegister }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    // Renomeado para 'senha' para consistência com a tabela 'usuarios'
    const [senha, setSenha] = useState(''); 
    const [loginError, setLoginError] = useState('');

    const handleLoginPress = async () => {
        setLoginError(''); // Limpa erros anteriores
        
        if (!email || !senha) {
            setLoginError("Por favor, preencha o e-mail e a senha.");
            return;
        }
    
        try {
            // 1. Consulta SQL para verificar se o par email/senha existe na tabela 'usuarios'
            const sql = `SELECT id FROM usuarios WHERE email = ? AND senha = ?`;
            const result = await executeSql(sql, [email, senha]);

            if (result.rows._array.length > 0) {
                // SUCESSO: Credenciais válidas encontradas
                onLogin();
            } else {
                // FALHA: Credenciais não encontradas
                setLoginError("Usuário ou senha inválidos.");
            }
        } catch (error) {
            console.error('Falha ao verificar login no DB:', error);
            setLoginError("Erro ao tentar conectar com o banco de dados.");
        }
    };

    return (
        <View style={styles.container}>
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
                    value={senha}
                    onChangeText={setSenha}
                />

                {/* Exibe a mensagem de erro aqui */}
                {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
                    <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.registerLink} 
                    onPress={onNavigateToRegister}
                >
                    <Text style={styles.registerText}>Não tem conta? Cadastre-se</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    formContainer: {
        width: 320,
        padding: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 45,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    button: {
        width: '100%',
        height: 45,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    registerLink: {
        marginTop: 15,
        alignItems: 'center',
    },
    registerText: {
        color: '#007bff',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    // NOVO ESTILO: Mensagem de erro
    errorText: {
        color: '#e74c3c', // Cor vermelha para erro
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 14,
        fontWeight: '500',
    }
});