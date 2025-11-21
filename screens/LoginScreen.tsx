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
    // SafeAreaView removido
    ImageBackground, 
    Image, 
    StatusBar 
} from 'react-native';
import { executeSql } from '../dbService'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type LoginScreenProps = { onLogin: (user: any) => void; onNavigateToRegister: () => void; };

export default function LoginScreen({ onLogin, onNavigateToRegister }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    
    const insets = useSafeAreaInsets(); 

    // PADRÃO DE IMAGENS APLICADO
    const BACKGROUND_IMAGE = require('../assets/IMGF.png'); 
    const LOGO_IMAGE = require('../assets/LGT.png');

    const handleLoginPress = async () => {
        setLoginError('');
        if (!email || !senha) { setLoginError("Preencha e-mail e senha."); return; }
    
        setLoading(true);
        try {
            // SELECT por EMAIL
            const sql = `SELECT * FROM usuarios WHERE email = ? AND senha = ?`;
            const result = await executeSql(sql, [email, senha]);

            if (result.rows._array.length > 0) {
                const user = result.rows._array[0];
                
                // ATUALIZAR LAST_LOGIN
                const now = new Date().toLocaleString('pt-BR');
                // IMPORTANTE: O UPDATE deve usar o ID (chave primária)
                await executeSql(`UPDATE usuarios SET last_login = ? WHERE id = ?`, [now, user.id]);
                
                user.last_login = now; 
                onLogin(user);
            } else {
                setLoginError("E-mail ou senha inválidos.");
            }
        } catch (error) {
            console.error(error);
            setLoginError("Erro no login. Tente novamente.");
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
                                    />
                                </View>

                                {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}
                                
                                <TouchableOpacity style={styles.button} onPress={handleLoginPress} disabled={loading}>
                                    <Text style={styles.buttonText}>{loading ? "Entrando..." : "Entrar"}</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={styles.registerLink} onPress={onNavigateToRegister}>
                                    <Text style={styles.registerText}>Criar conta</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                
            </View>
        </ImageBackground>
    );
}

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