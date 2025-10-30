import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import UserInfoScreen from '../screens/UserInfoScreen';
import { initDatabase } from '../database/db'; // Importar inicialização do SQLite
import { ActivityIndicator, TouchableOpacity, View, Text } from 'react-native';
import { Colors } from '../constants/Colors';

// 1. Definição dos Tipos (para o TypeScript)
export type User = {
    id: number;
    name: string;
    email: string;
    avatarUri?: string;
};

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: { user: User }; // Passa os dados do usuário
    UserInfo: { user: User }; // Passa os dados do usuário
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Tema moderno para a navegação
const ModernTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: Colors.background,
        primary: Colors.primary,
        card: Colors.cardBackground,
        text: Colors.text,
        border: Colors.placeholder,
    },
};

export default function AppNavigator() {
    const [isDbReady, setIsDbReady] = useState(false);

    useEffect(() => {
        // Inicializa o banco de dados SQLite
        initDatabase();
        setIsDbReady(true);
    }, []);
    
    // Mostra um loader enquanto o DB inicializa (muito rápido)
    if (!isDbReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer theme={ModernTheme}>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen 
                    name="Login" 
                    component={LoginScreen} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="Register" 
                    component={RegisterScreen} 
                    options={{ title: 'Cadastro' }} 
                />
                <Stack.Screen 
                    name="Home" 
                    component={HomeScreen} 
                    options={({ navigation, route }) => ({
                        title: 'Dunamis Salgados',
                        headerStyle: { backgroundColor: Colors.primary },
                        headerTintColor: Colors.cardBackground,
                        // Botão de Informações do Usuário no Header
                        headerRight: () => (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('UserInfo', { user: route.params.user })}
                                style={{ marginRight: 10, padding: 5 }}
                            >
                                <Text style={{ color: Colors.cardBackground, fontWeight: 'bold' }}>👤 Perfil</Text>
                            </TouchableOpacity>
                        ),
                        headerLeft: () => null, // Remove o botão de voltar após o login
                    })} 
                />
                 <Stack.Screen 
                    name="UserInfo" 
                    component={UserInfoScreen} 
                    options={{ title: 'Meu Perfil', headerStyle: { backgroundColor: Colors.secondary }, headerTintColor: Colors.cardBackground }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}