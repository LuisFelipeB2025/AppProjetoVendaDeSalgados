import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Alert } from 'react-native';

type Props = {
    user: any;
    onBack: () => void;
};

export default function ProfileScreen({ user, onBack }: Props) {
    const [showDetails, setShowDetails] = useState(false);

    const userName = user?.nome || 'Usuário';
    const userEmail = user?.email || 'Não cadastrado';
    const userTelefone = user?.telefone || '-';
    const userLastLogin = user?.last_login || 'Primeiro acesso';
    
    const rua = user?.rua || 'Rua não informada';
    const numero = user?.numero || 'S/N';
    const bairro = user?.bairro || 'Bairro não informado';
    const cep = user?.cep || 'CEP não informado';

    const handleToggleDetails = () => {
        // Se a segurança for alta, você pode pedir a senha aqui antes de mostrar.
        setShowDetails(!showDetails);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                    <Text style={styles.backText}>Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Meu Perfil</Text>
                <View style={{ width: 60 }} /> 
            </View>

            <View style={styles.content}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.userName}>{userName}</Text>

                <View style={styles.infoCard}>
                    {/* Linha: Último Acesso (Sempre Visível) */}
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>🕒 Último Acesso:</Text>
                        <Text style={styles.valueHighlight}>{userLastLogin}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Botão para revelar/ocultar detalhes */}
                    <TouchableOpacity 
                        style={styles.detailButton} 
                        onPress={handleToggleDetails}
                    >
                        <Text style={styles.detailButtonText}>
                            {showDetails ? 'Ocultar Detalhes Sensíveis ▲' : 'Mostrar Detalhes de Contato e Endereço ▼'}
                        </Text>
                    </TouchableOpacity>

                    {/* DETALHES SENSÍVEIS (Só aparecem se showDetails for true) */}
                    {showDetails && (
                        <View style={styles.detailsBlock}>
                            <View style={styles.dividerThin} />
                            
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>📧 E-mail:</Text>
                                <Text style={styles.value}>{userEmail}</Text>
                            </View>
                            <View style={styles.dividerThin} />

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>📱 Telefone:</Text>
                                <Text style={styles.value}>{userTelefone}</Text>
                            </View>
                            <View style={styles.dividerThin} />

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>📍 Endereço:</Text>
                                <View style={styles.addressBlock}>
                                    <Text style={styles.value}>{rua}, Nº {numero}</Text>
                                    <Text style={styles.valueSub}>{bairro}</Text>
                                    <Text style={styles.valueSub}>CEP: {cep}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f5f7fa' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 15, 
        paddingVertical: 15,
        backgroundColor: '#fff', 
        elevation: 2, 
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 2 },
        paddingTop: Platform.OS === 'android' ? 40 : 15 
    },
    backButton: { flexDirection: 'row', alignItems: 'center', padding: 5 },
    backArrow: { fontSize: 24, color: '#ff6600', marginRight: 5 },
    backText: { fontSize: 16, color: '#ff6600', fontWeight: 'bold' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    content: { flex: 1, alignItems: 'center', padding: 20 },
    avatarContainer: { 
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        backgroundColor: '#ff6600', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 15 
    },
    avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 30 },
    infoCard: { 
        width: '100%', 
        maxWidth: 500,
        backgroundColor: '#fff', 
        borderRadius: 15, 
        padding: 20, 
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5
    },
    infoRow: { marginBottom: 10 },
    label: { fontSize: 14, color: '#999', marginBottom: 4, fontWeight: '600' },
    value: { fontSize: 16, color: '#333', fontWeight: '500' },
    valueSub: { fontSize: 15, color: '#555', marginTop: 2, marginLeft: 15 },
    valueHighlight: { fontSize: 16, color: '#4CAF50', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
    dividerThin: { height: 1, backgroundColor: '#f5f5f5', marginVertical: 8 }, // Mais fina para detalhes
    addressBlock: { paddingLeft: 5, marginTop: 5 },

    // NOVOS ESTILOS PARA O BOTÃO DETALHES
    detailButton: {
        backgroundColor: '#f5f7fa',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        ...Platform.select({ web: { cursor: 'pointer' } as any })
    },
    detailButtonText: {
        color: '#ff6600',
        fontWeight: 'bold',
        fontSize: 15,
    },
    detailsBlock: {
        marginTop: 10,
        paddingTop: 5,
    }
});