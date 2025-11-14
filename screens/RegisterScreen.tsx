import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// IMPORTANTE: Assumindo que dbService está em um nível acima
import { executeSql } from '../dbService'; 

type Props = {
    onRegisterSuccess: () => void; 
};

export default function RegistroScreen({ onRegisterSuccess }: Props) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegistro = async () => {
        if (loading) return;
        setLoading(true);

        if (!nome || !email || !senha || !confirmarSenha) {
            Alert.alert('Erro', 'Todos os campos são obrigatórios.');
            setLoading(false);
            return;
        }
        if (senha !== confirmarSenha) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            setLoading(false);
            return;
        }
        
        try {
            // 1. VERIFICA SE O EMAIL JÁ EXISTE
            const checkSql = `SELECT id FROM usuarios WHERE email = ?`;
            const checkResult = await executeSql(checkSql, [email]);

            if (checkResult.rows._array.length > 0) {
                Alert.alert('Erro', 'Este e-mail já está cadastrado.');
                setLoading(false);
                return;
            }

            // 2. INSERE O NOVO USUÁRIO
            // Nota: O campo 'nome' não é salvo pois a tabela 'usuarios' no DB Service tem apenas 'email' e 'senha'.
            const insertSql = `INSERT INTO usuarios (email, senha) VALUES (?, ?)`;
            await executeSql(insertSql, [email, senha]);

            // Sucesso
            Alert.alert('Sucesso', 'Usuário registrado com sucesso! Você pode fazer login agora.');
            
            // Limpa os campos após o registro
            setNome('');
            setEmail('');
            setSenha('');
            setConfirmarSenha('');
            
            onRegisterSuccess();

        } catch (error: any) {
            console.error('Erro no registro do usuário:', error);
            
            let errorMessage = 'Falha ao registrar usuário. Tente novamente.';
            
            // Diagnóstico específico para o erro de tabela ausente
            if (error && typeof error.message === 'string' && error.message.includes('no such table')) {
                 errorMessage = "Erro crítico: A tabela de usuários não foi encontrada. Por favor, REINICIE o aplicativo e limpe o cache para forçar a criação das tabelas.";
            }

            Alert.alert('Erro', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Criar Nova Conta</Text>

            {/* Input de Nome */}
            <TextInput
                style={styles.input}
                placeholder="Nome Completo"
                placeholderTextColor="#999"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                editable={!loading}
            />

            {/* Input de Email */}
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
            />

            {/* Input de Senha */}
            <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#999"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry 
                editable={!loading}
            />

            {/* Input de Confirmar Senha */}
            <TextInput
                style={styles.input}
                placeholder="Confirme a Senha"
                placeholderTextColor="#999"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                editable={!loading}
            />

            {/* Botão de Registro */}
            <TouchableOpacity 
                style={[styles.botao, loading && { backgroundColor: '#adb5bd' }]} 
                onPress={handleRegistro}
                disabled={loading}
            >
                <Text style={styles.botaoTexto}>
                    {loading ? 'REGISTRANDO...' : 'REGISTRAR'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 30,
        backgroundColor: '#fff',
    },
    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ff6600', 
        marginBottom: 40,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        color: '#333',
    },
    botao: {
        backgroundColor: '#28a745', 
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    botaoTexto: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});