// src/screens/UserInfoScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Camera, CameraType, CameraView } from 'expo-camera'; // Componente Avançado
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

type UserInfoScreenRouteProp = RouteProp<RootStackParamList, 'UserInfo'>;

//  <-- Placeholder para Avatar Padrão
const DefaultAvatar = require('../assets/default_avatar.png');

export default function UserInfoScreen() {
  const route = useRoute<UserInfoScreenRouteProp>();
  const { user } = route.params;

  const [avatarUri, setAvatarUri] = useState(user.avatarUri || DefaultAvatar);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
      });

      if (photo?.uri) {
        setAvatarUri(photo.uri);
        setIsCameraOpen(false);
        // Implementar lógica de salvamento do avatarUri no SQLite aqui
        Alert.alert('Sucesso', 'Foto de perfil capturada! (Salvar no DB pendente)');
      }
    }
  };

  if (hasPermission === null) {
    return <View style={styles.loadingContainer}><Text>Aguardando permissão da Câmera...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.loadingContainer}><Text>Acesso à câmera negado.</Text></View>;
  }

  if (isCameraOpen) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraControls}>
             <TouchableOpacity style={styles.flipButton} onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}>
              <Text style={styles.textButton}>Virar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInnerCircle} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsCameraOpen(false)}>
              <Text style={styles.textButton}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Meu Perfil</Text>
        
        {/* Componente de Imagem (Avatar) */}
        <Image 
          source={typeof avatarUri === 'string' ? { uri: avatarUri } : DefaultAvatar} 
          style={styles.avatar} 
        />

        <TouchableOpacity style={styles.changePictureButton} onPress={() => setIsCameraOpen(true)}>
          <Text style={styles.changePictureText}>Mudar Foto de Perfil (Câmera)</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>{user.name}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        
        {/* Adicione mais informações aqui, se houver */}
        
        <TouchableOpacity style={styles.logoutButton} onPress={() => Alert.alert('Sair', 'Implementar Logout aqui (navigation.replace("Login"))')}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, alignItems: 'center', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 30, fontWeight: 'bold', marginBottom: 30, color: Colors.text },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, borderWidth: 3, borderColor: Colors.primary },
  changePictureButton: { padding: 10, marginBottom: 30 },
  changePictureText: { color: Colors.secondary, fontSize: 16, fontWeight: 'bold' },
  infoBox: { width: '90%', padding: 15, backgroundColor: Colors.cardBackground, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  label: { fontSize: 14, color: Colors.placeholder, marginBottom: 5 },
  value: { fontSize: 18, fontWeight: '600', color: Colors.text },
  logoutButton: { width: '90%', padding: 15, backgroundColor: Colors.error, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  buttonText: { color: Colors.cardBackground, fontSize: 18, fontWeight: 'bold' },
  // Estilos da Câmera
  cameraContainer: { flex: 1 },
  camera: { flex: 1, justifyContent: 'flex-end' },
  cameraControls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'transparent', marginBottom: 40 },
  captureButton: { width: 70, height: 70, borderRadius: 35, borderWidth: 5, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  captureInnerCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white' },
  flipButton: { padding: 10 },
  closeButton: { padding: 10 },
  textButton: { fontSize: 18, color: 'white' }
});