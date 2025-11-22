import React, { useState, useRef, useEffect } from 'react';
import {  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Animated, ActivityIndicator, ImageBackground, StatusBar 
} from 'react-native';
import { supabase } from '../BancoDeDados'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// NOVOS IMPORTS
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';

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
    const [gpsLoading, setGpsLoading] = useState(false); // Estado para o botão GPS
    
    const [isSuccess, setIsSuccess] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const insets = useSafeAreaInsets();
    const BACKGROUND_IMAGE = require("../assets/IMGF2.png");

    // --- FUNÇÃO PARA PEDIR PERMISSÃO E PEGAR LOCALIZAÇÃO ---
    const obterLocalizacaoAtual = async () => {
        setGpsLoading(true);
        try {
            // 1. Pede Permissão de GPS
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Precisamos da localização para preencher seu endereço.');
                setGpsLoading(false);
                return;
            }

            // 2. Pede Permissão de Contatos (Aproveitando o momento)
            const { status: contactsStatus } = await Contacts.requestPermissionsAsync();
            if (contactsStatus === 'granted') {
                console.log("Permissão de contatos concedida!");
                // Aqui você poderia ler os contatos com Contacts.getContactsAsync()
            }

            // 3. Pega a Posição Atual
            let location = await Location.getCurrentPositionAsync({});
            
            // 4. Transforma Latitude/Longitude em Endereço (Geocoding Reverso)
            let addressResponse = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (addressResponse.length > 0) {
                const endereco = addressResponse[0];
                // Preenche os campos automaticamente
                setRua(endereco.street || '');
                setBairro(endereco.district || endereco.subregion || '');
                setCep(endereco.postalCode || '');
                // setNumero(endereco.streetNumber || ''); // Às vezes não é preciso
                Alert.alert("Localização Encontrada", "Endereço preenchido com sucesso!");
            }

        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Não foi possível obter sua localização.");
        } finally {
            setGpsLoading(false);
        }
    };
    
    const validarSenha = (password: string): string | null => {
        if (password.length < 6) return "A senha deve ter no mínimo 6 caracteres.";
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
            }
        } catch (error) { } finally { setBuscandoCep(false); }
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

    const handleRegistro = async () => {
        if (loading) return;
        
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
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: senha,
            });

            if (authError) {
                if (authError.message.includes("already registered")) throw new Error("E-mail já cadastrado.");
                throw authError;
            }

            if (authData.user) {
                const { error: dbError } = await supabase
                    .from('usuarios')
                    .insert({
                        email: email,
                        nome: nome,
                        telefone: telefone,
                        cep: cep,
                        rua: rua,
                        numero: numero,
                        bairro: bairro,
                        last_login: new Date().toISOString()
                    });

                if (dbError) throw new Error("Erro ao salvar dados: " + dbError.message);

                setIsSuccess(true);
                Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
                setTimeout(() => onRegisterSuccess(), 2000);
            }
        } catch (error: any) {
            console.error('Erro:', error);
            Alert.alert('Erro no Cadastro', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <View style={styles.successContainer}>
                <Animated.View style={[styles.successContent, { opacity: fadeAnim }]}>
                    <View style={styles.successIconCircle}><Text style={styles.successCheckMark}>✓</Text></View>
                    <Text style={styles.successTitle}>Cadastro Concluído!</Text>
                    <ActivityIndicator size="small" color="#4CAF50" style={{ marginTop: 20 }} />
                </Animated.View>
            </View>
        );
    }

    return (
        <ImageBackground source={BACKGROUND_IMAGE} style={styles.backgroundImage} resizeMode="cover">
            <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <StatusBar barStyle="light-content" />
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.cardContainer}>
                            <Text style={styles.titulo}>Crie sua conta</Text>
                            
                            <View style={styles.inputGroup}><Text style={styles.label}>Nome Completo</Text><TextInput style={styles.input} placeholder="Ex: Maria Silva" placeholderTextColor="#aaa" value={nome} onChangeText={setNome} autoCapitalize="words" editable={!loading}/></View>
                            <View style={styles.inputGroup}><Text style={styles.label}>Telefone / WhatsApp</Text><TextInput style={styles.input} placeholder="(00) 90000-0000" placeholderTextColor="#aaa" value={telefone} onChangeText={handleTelefoneChange} keyboardType="phone-pad" maxLength={15} editable={!loading}/></View>
                            <View style={styles.inputGroup}><Text style={styles.label}>E-mail</Text><TextInput style={styles.input} placeholder="seu@email.com" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!loading}/></View>
                            
                            {/* BOTÃO PARA USAR GPS */}
                            <TouchableOpacity 
                                style={styles.gpsButton} 
                                onPress={obterLocalizacaoAtual}
                                disabled={gpsLoading}
                            >
                                <Text style={styles.gpsButtonText}>
                                    {gpsLoading ? "Buscando GPS..." : "📍 Usar minha localização atual"}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.inputGroup}><Text style={styles.label}>CEP {buscandoCep && <ActivityIndicator size="small" color="#4CAF50" />}</Text><TextInput style={styles.input} placeholder="00000-000" placeholderTextColor="#aaa" value={cep} onChangeText={handleCepChange} keyboardType="numeric" maxLength={9} editable={!loading}/></View>
                            
                            <View style={styles.rowContainer}>
                                <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}><Text style={styles.label}>Rua</Text><TextInput style={styles.input} placeholder="Rua" placeholderTextColor="#aaa" value={rua} onChangeText={setRua} editable={!loading}/></View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}><Text style={styles.label}>Número</Text><TextInput style={styles.input} placeholder="123" placeholderTextColor="#aaa" value={numero} onChangeText={setNumero} editable={!loading}/></View>
                            </View>
                            
                            <View style={styles.inputGroup}><Text style={styles.label}>Bairro</Text><TextInput style={styles.input} placeholder="Bairro" placeholderTextColor="#aaa" value={bairro} onChangeText={setBairro} editable={!loading}/></View>
                            
                            <View style={styles.rowContainer}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}><Text style={styles.label}>Senha</Text><TextInput style={styles.input} placeholder="******" placeholderTextColor="#aaa" value={senha} onChangeText={setSenha} secureTextEntry editable={!loading}/></View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}><Text style={styles.label}>Confirmar</Text><TextInput style={styles.input} placeholder="******" placeholderTextColor="#aaa" value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry editable={!loading}/></View>
                            </View>
                            
                            <Text style={styles.tipText}>Mínimo de 6 caracteres.</Text>

                            <TouchableOpacity style={[styles.botao, loading && styles.botaoDisabled]} onPress={handleRegistro} disabled={loading}><Text style={styles.botaoTexto}>{loading ? 'SALVANDO...' : 'CRIAR CONTA'}</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={loading}><Text style={styles.backText}>Já possui conta? <Text style={styles.backTextBold}>Voltar</Text></Text></TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, width: '100%', height: '100%' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    container: { flex: 1 },
    scrollContent: { padding: 20, flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
    cardContainer: { width: '100%', maxWidth: 450, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 20, padding: 30, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 }, android: { elevation: 8 }, web: { boxShadow: '0px 10px 30px rgba(0,0,0,0.2)' } as any }) },
    titulo: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 25 },
    rowContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8, marginLeft: 2 },
    input: { height: 50, backgroundColor: '#fff', borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, fontSize: 16, color: '#333' },
    tipText: { fontSize: 12, color: '#666', marginTop: -10, marginBottom: 20, textAlign: 'center' },
    
    // Estilo do botão GPS
    gpsButton: { 
        flexDirection: 'row', 
        backgroundColor: '#e3f2fd', 
        padding: 12, 
        borderRadius: 10, 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#2196f3'
    },
    gpsButtonText: { color: '#1976d2', fontWeight: 'bold', fontSize: 14 },

    botao: { backgroundColor: '#ff6600', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 5, shadowColor: '#ff6600', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4, ...Platform.select({ web: { cursor: 'pointer' } as any }) },
    botaoDisabled: { backgroundColor: '#ffccaa', elevation: 0 },
    botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    backButton: { marginTop: 20, alignItems: 'center', padding: 10, ...Platform.select({ web: { cursor: 'pointer' } as any }) },
    backText: { color: '#666', fontSize: 15 },
    backTextBold: { color: '#ff6600', fontWeight: 'bold' },
    successContainer: { flex: 1, backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center', padding: 20 },
    successContent: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 40, borderRadius: 20, width: '100%', maxWidth: 400, elevation: 5 },
    successIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 5 },
    successCheckMark: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
    successTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
});