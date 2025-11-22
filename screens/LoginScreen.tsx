import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Platform, 
    KeyboardAvoidingView, 
    ScrollView, 
    ImageBackground, 
    Image, 
    StatusBar,
    Alert
} from 'react-native';

// 1. IMPORT DO SUPABASE (Substituindo o dbService antigo)
import { supabase } from '../BancoDeDados';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LoginScreenProps = { onLogin: (user: any) => void; onNavigateToRegister: () => void; };

export default function LoginScreen({ onLogin, onNavigateToRegister }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    
    const insets = useSafeAreaInsets(); 

    const BACKGROUND_IMAGE = require('../assets/IMGF.png'); 
    const LOGO_IMAGE = require('../assets/LGT.png');

    // --- NOVA LÓGICA DE LOGIN (SUPABASE) ---
    const handleLoginPress = async () => {
        setLoginError('');
        
        if (!email || !senha) { 
            setLoginError("Preencha e-mail e senha."); 
            return; 
        }
    
        setLoading(true);
        try {
            // PASSO 1: Autenticar (Verifica Email e Senha no Auth do Supabase)
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: senha,
            });

            if (authError) {
                throw new Error("E-mail ou senha incorretos.");
            }

            // PASSO 2: Buscar dados completos na tabela 'usuarios'
            // O auth só devolve ID e Email. Se você precisa do Nome/Telefone, buscamos aqui:
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .single(); // Pega apenas 1

            if (userError || !userData) {
                throw new Error("Usuário autenticado, mas perfil não encontrado.");
            }

            // PASSO 3: Atualizar 'last_login' na nuvem (Opcional, mas mantém sua lógica antiga)
            const now = new Date().toISOString(); // Supabase prefere formato ISO
            await supabase
                .from('usuarios')
                .update({ last_login: now }) // Precisaria ter essa coluna no banco (se não tiver, comente essa linha)
                .eq('id', userData.id);

            // Sucesso! Passa o usuário completo para o App
            onLogin({ ...userData, last_login: now });

        } catch (error: any) {
            console.error(error);
            setLoginError(error.message || "Erro no login. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <ImageBackground source={BACKGROUND_IMAGE} style={styles.backgroundImage} resizeMode="cover">
             <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
                
                    <StatusBar barStyle="light-content" />
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : "height"} 
                        style={styles.container}
                    >
                        <ScrollView contentContainerStyle={styles.scrollContainer}>
                            <View style={styles.logoContainer}>
                                <Image source={LOGO_IMAGE} style={styles.logo} />
                            </View>
                            
                            <View style={styles.formContainer}>
                                <Text style={styles.title}>Bem-vindo</Text>
                                
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>E-mail</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="exemplo@email.com" 
                                        placeholderTextColor="#999"
                                        keyboardType="email-address" 
                                        autoCapitalize="none"
                                        value={email} 
                                        onChangeText={setEmail} 
                                        editable={!loading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Senha</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="******" 
                                        secureTextEntry 
                                        value={senha} 
                                        onChangeText={setSenha} 
                                        editable={!loading}
                                    />
                                </View>

                                {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}
                                
                                <TouchableOpacity style={styles.button} onPress={handleLoginPress} disabled={loading}>
                                    <Text style={styles.buttonText}>{loading ? "Entrando..." : "Entrar"}</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={styles.registerLink} onPress={onNavigateToRegister} disabled={loading}>
                                    <Text style={styles.registerText}>Criar conta</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                
            </View>
        </ImageBackground>
    );
}

// ------------------------------------------------------------------
// ESTILOS VISUAIS (Idênticos ao seu original)
// ------------------------------------------------------------------
const styles = StyleSheet.create({ 
    backgroundImage: { flex: 1, width: '100%', height: '100%' }, 
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }, 
    container: { flex: 1 }, 
    scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }, 
    logoContainer: { marginBottom: 25, alignItems: 'center' }, 
    logo: { width: 140, height: 140, resizeMode: 'contain', borderRadius: 70 }, 
    formContainer: { width: '100%', maxWidth: 400, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 24, padding: 32 }, 
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }, 
    inputGroup: { marginBottom: 18 }, 
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 }, 
    input: { width: '100%', height: 52, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e1e1e1', borderRadius: 12, paddingHorizontal: 16, fontSize: 16 }, 
    errorText: { color: 'red', textAlign: 'center', marginBottom: 10 }, 
    button: { width: '100%', height: 54, backgroundColor: '#ff6600', justifyContent: 'center', alignItems: 'center', borderRadius: 12 }, 
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }, 
    registerLink: { marginTop: 24, alignItems: 'center' }, 
    registerText: { color: '#666' } 
});