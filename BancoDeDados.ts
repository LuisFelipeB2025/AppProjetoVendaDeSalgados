import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native'; 

declare const process: { env: { [key: string]: string | undefined } };

const SUPABASE_URL = ''; 
const SUPABASE_ANON_KEY = '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("🚨 ERRO CRÍTICO: Chaves do Supabase não definidas no código!");
}

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') return Promise.resolve(null);
      return Promise.resolve(localStorage.getItem(key));
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const initDatabase = async () => {
  console.log(`[DB] Conectado ao Supabase (${Platform.OS === 'web' ? 'Modo Web' : 'Modo Nativo'})`);
};

export const buscarUsuarioPorEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
  return data;
};

export const cadastrarUsuarioBanco = async (dadosUsuario: any) => {
  const { error } = await supabase
    .from('usuarios')
    .insert(dadosUsuario);
  
  if (error) throw error;
};

export const registrarAcesso = async (acao: string, detalhes: object) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('logs_acesso')
    .insert({
      user_id: user.id,
      acao: acao,
      detalhes: detalhes,
      email_usuario: user.email
    });

  if (error) console.error("Erro ao salvar log:", error);
};