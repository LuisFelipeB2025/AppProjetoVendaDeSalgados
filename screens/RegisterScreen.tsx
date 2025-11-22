import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform,
    Animated, 
    ActivityIndicator,
    ImageBackground, 
    StatusBar
} from 'react-native';

// ---------------------------------------------------------
// MUDANÇA 1: Importamos o cliente do Supabase e removemos o SQL antigo
// Certifique-se de que o caminho '../services/database' está correto
import { supabase } from '../BancoDeDados'; 
// ---------------------------------------------------------

import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = { onRegisterSuccess: () => void; onBack: () => void; };

export default function RegisterScreen({ onRegisterSuccess, onBack }: Props) {
    const [nome, setNome] = useState('');
    const [cep, setCep] = useState('');
    const [rua, setRua] = useState(''); 
    const [numero, setNumero] = useState(''); 
    const [bairro, setBairro] = useState(''); 
    const [telefone, setTelefone] = useState(''); 
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [buscandoCep, setBuscandoCep] = useState(false); 
    
    const [isSuccess, setIsSuccess] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const insets = useSafeAreaInsets();
    const BACKGROUND_IMAGE = require("../assets/IMGF2.png");
    
    // --- Validações e Formatações (Mantidas iguais) ---
    const validarSenha = (password: string): string | null => {
        if (password.length > 11) return "A senha deve ter no máximo 11 caracteres.";
        const allowedCharsRegex = /^[a-zA-Z0-9!@#$%&*?]+$/;
        if (!allowedCharsRegex.test(password)) return "Contém caracteres não permitidos. Use apenas letras, números e !@#$%&*?.";
        const specialCharCount = (password.match(/[!@#$%&*?]/g) || []).length;
        if (specialCharCount !== 2) return "A senha deve conter exatamente 2 símbolos especiais (!@#$%&*?).";
        if (!(/[a-zA-Z]/.test(password) && /\d/.test(password))) return "A senha deve conter pelo menos uma letra e um número.";
        return null; 
    };

    const buscarEndereco = async (cepDigitado: string) => {
        const cepLimpo = cepDigitado.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;
        setBuscandoCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();
            if (!data.erro) { 
                setRua(data.logradouro || ''); 
                setBairro(data.bairro || ''); 
            } else {
                Alert.alert("Atenção", "CEP não encontrado.");
            }
        } catch (error) {
            // Silencioso ou alert
        } finally { 
            setBuscandoCep(false); 
        }
    };

    const handleCepChange = (text: string) => {
        const numeric = text.replace(/\D/g, '');
        let formatted = numeric;
        if (numeric.length > 5) formatted = numeric.replace(/^(\d{5})(\d)/, '$1-$2');
        setCep(formatted);
        if (numeric.length === 8) buscarEndereco(numeric);
    };
    
    const handleTelefoneChange = (text: string) => {
        let cleaned = text.replace(/\D/g, '');
        if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
        if (cleaned.length > 7) formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        setTelefone(formatted);
    };

    // --- NOVA LÓGICA DE REGISTRO COM SUPABASE ---
    const handleRegistro = async () => {
        if (loading) return;
        
        // 1. Validações Básicas
        if (!nome || !cep || !rua || !numero || !bairro || !telefone || !email || !senha) {
            Alert.alert('Atenção', 'Todos os campos são obrigatórios.');
            return;
        }
        if (senha !== confirmarSenha) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }
        const erroSenha = validarSenha(senha);
        if (erroSenha) {
            Alert.alert('Senha Inválida', erroSenha);
            return;
        }

        setLoading(true);

        try {
            // 2. Cria o usuário no sistema de Autenticação do Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: senha,
            });

            if (authError) {
                // Tratamento de erro específico do Supabase
                if (authError.message.includes("already registered") || authError.status === 422) {
                    throw new Error("Este e-mail já está cadastrado.");
                }
                throw authError;
            }

            if (authData.user) {
                // 3. Se o login foi criado, salva os dados do perfil na tabela 'usuarios'
                const { error: dbError } = await supabase
                    .from('usuarios')
                    .insert({
                        // Não precisamos mandar ID se for auto-increment, 
                        // mas se quiser vincular ao login: user_id: authData.user.id
                        nome: nome,
                        email: email,
                        telefone: telefone,
                        cep: cep,
                        rua: rua,
                        numero: numero,
                        bairro: bairro,
                        // created_at é automático
                    });

                if (dbError) {
                    // Se der erro ao salvar o perfil (ex: telefone duplicado se tiver unique key)
                    throw new Error("Erro ao salvar dados do perfil: " + dbError.message);
                }

                // 4. Sucesso!
                setIsSuccess(true);
                Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
                
                // Opcional: Registrar Log de novo cadastro
                // await registrarAcesso('NOVO_CADASTRO', { email: email });

                setTimeout(() => onRegisterSuccess(), 2000);
            }

        } catch (error: any) {
            console.error('Erro:', error);
            Alert.alert('Erro no Cadastro', error.message || 'Verifique sua conexão e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <View style={styles.successContainer}>
                <Animated.View style={[styles.successContent, { opacity: fadeAnim }]}>
                    <View style={styles.successIconCircle}>
                        <Text style={styles.successCheckMark}>✓</Text>
                    </View>
                    <Text style={styles.successTitle}>Cadastro Concluído!</Text>
                    <Text style={styles.successSub}>Sua conta foi criada na nuvem com sucesso.</Text>
                    <ActivityIndicator size="small" color="#4CAF50" style={{ marginTop: 20 }} />
                </Animated.View>
            </View>
        );
    }

    return (
        <ImageBackground source={BACKGROUND_IMAGE} style={styles.backgroundImage} resizeMode="cover">
            <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <StatusBar barStyle="light-content" />
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.cardContainer}>
                            <Text style={styles.titulo}>Crie sua conta</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nome Completo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Maria Silva"
                                    placeholderTextColor="#aaa" 
                                    value={nome}
                                    onChangeText={setNome}
                                    autoCapitalize="words"
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Telefone / WhatsApp</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="(00) 90000-0000"
                                    placeholderTextColor="#aaa" 
                                    value={telefone}
                                    onChangeText={handleTelefoneChange}
                                    keyboardType="phone-pad"
                                    maxLength={15} 
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>E-mail</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="seu@email.com"
                                    placeholderTextColor="#aaa"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>CEP {buscandoCep && <ActivityIndicator size="small" color="#4CAF50" />}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="00000-000"
                                    placeholderTextColor="#aaa" 
                                    value={cep}
                                    onChangeText={handleCepChange}
                                    keyboardType="numeric"
                                    maxLength={9} 
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.rowContainer}>
                                <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
                                    <Text style={styles.label}>Rua</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nome da Rua"
                                        placeholderTextColor="#aaa"
                                        value={rua}
                                        onChangeText={setRua}
                                        editable={!loading}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Número</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="123"
                                        placeholderTextColor="#aaa"
                                        value={numero}
                                        onChangeText={setNumero}
                                        editable={!loading}
                                        keyboardType="default"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Bairro</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Bairro"
                                    placeholderTextColor="#aaa"
                                    value={bairro}
                                    onChangeText={setBairro}
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.rowContainer}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>Senha</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="******"
                                        placeholderTextColor="#aaa"
                                        value={senha}
                                        onChangeText={setSenha}
                                        secureTextEntry 
                                        editable={!loading}
                                    />
                                    <Text style={styles.tipText}>Máx. 11, letras, nums e 2 símbolos (ex: !@).</Text>
                                </View>

                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Confirmar</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="******"
                                        placeholderTextColor="#aaa"
                                        value={confirmarSenha}
                                        onChangeText={setConfirmarSenha}
                                        secureTextEntry
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity 
                                style={[styles.botao, loading && styles.botaoDisabled]} 
                                onPress={handleRegistro}
                                disabled={loading}
                            >
                                <Text style={styles.botaoTexto}>{loading ? 'SALVANDO NA NUVEM...' : 'CRIAR CONTA'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={loading}>
                                <Text style={styles.backText}>Já possui conta? <Text style={styles.backTextBold}>Voltar</Text></Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)', 
    },
    container: { 
        flex: 1, 
    },
    scrollContent: { 
        padding: 20, 
        flexGrow: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
    },
    cardContainer: { 
        width: '100%', 
        maxWidth: 450, 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        borderRadius: 20, 
        padding: 30, 
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
            android: { elevation: 8 },
            web: { boxShadow: '0px 10px 30px rgba(0,0,0,0.2)' } as any
        })
    },
    titulo: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#333', 
        textAlign: 'center', 
        marginBottom: 25, 
    },
    rowContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
    },
    inputGroup: { 
        marginBottom: 18, 
    },
    label: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: '#444', 
        marginBottom: 8, 
        marginLeft: 2, 
    },
    input: { 
        height: 50, 
        backgroundColor: '#fff', 
        borderColor: '#e0e0e0', 
        borderWidth: 1, 
        borderRadius: 12, 
        paddingHorizontal: 15, 
        fontSize: 16, 
        color: '#333', 
    },
    tipText: {
        fontSize: 11,
        color: '#ff6600',
        marginTop: 5,
        marginLeft: 2,
    },
    botao: { 
        backgroundColor: '#ff6600', 
        paddingVertical: 16, 
        borderRadius: 12, 
        alignItems: 'center', 
        marginTop: 20, 
        shadowColor: '#ff6600', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 5, 
        elevation: 4,
        ...Platform.select({ web: { cursor: 'pointer' } as any })
    },
    botaoDisabled: { 
        backgroundColor: '#ffccaa', 
        elevation: 0, 
    },
    botaoTexto: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold', 
        letterSpacing: 1, 
    },
    backButton: { 
        marginTop: 20, 
        alignItems: 'center', 
        padding: 10,
        ...Platform.select({ web: { cursor: 'pointer' } as any })
    },
    backText: { 
        color: '#666', 
        fontSize: 15, 
    },
    backTextBold: { 
        color: '#ff6600', 
        fontWeight: 'bold', 
    },
    successContainer: { 
        flex: 1, 
        backgroundColor: '#f5f7fa', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20, 
    },
    successContent: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#fff', 
        padding: 40, 
        borderRadius: 20, 
        width: '100%', 
        maxWidth: 400, 
        elevation: 5, 
    },
    successIconCircle: { 
        width: 80, 
        height: 80, 
        borderRadius: 40, 
        backgroundColor: '#4CAF50', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 20, 
        elevation: 5, 
    },
    successCheckMark: { 
        fontSize: 40, 
        color: '#fff', 
        fontWeight: 'bold', 
    },
    successTitle: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#333', 
        marginBottom: 10, 
        textAlign: 'center', 
    },
    successSub: { 
        fontSize: 16, 
        color: '#666', 
        textAlign: 'center', 
    },
});