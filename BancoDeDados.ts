import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------
// 1. CONFIGURAÇÃO (Crie sua conta no Supabase.com para pegar isso)
// ---------------------------------------------------------
const SUPABASE_URL = 'https://enontzybkuxrbyrekswh.supabase.co'; // Ex: https://xyz.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub250enlia3V4cmJ5cmVrc3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzE2MjgsImV4cCI6MjA3OTE0NzYyOH0.RSJTgrQxTHq8KTPfLtvzHyEwvo9VzGbkqkeQwVVR-8Q'; // Ex: eyJhbGciOiJIUzI1NiIsInR5c...

// Adaptador para salvar o login de forma segura no celular
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Inicializa a conexão com a Nuvem
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ---------------------------------------------------------
// 2. FUNÇÕES DE BANCO DE DADOS (Substituindo o SQL manual)
// ---------------------------------------------------------

// Função para Inicializar (Não precisa criar tabelas via código, crie no site do Supabase)
export const initDatabase = async () => {
  console.log("Conectado ao Supabase (Nuvem)");
  // A verificação de conexão acontece na primeira chamada
};

// Função unificada para buscar dados (Exemplo: Login/Verificar Usuário)
// Substitui: "select * from usuarios where..."
export const buscarUsuarioPorEmail = async (email: string) => {
  // O ideal é usar o supabase.auth para login, mas se quiser buscar na tabela:
  const { data, error } = await supabase
    .from('usuarios') // Certifique-se de criar essa tabela no site
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 é "não encontrado"
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
  return data;
};

// Função para Salvar/Registrar Log de Acesso
// Atende seu requisito: "saber quem acessou, itens, data e hora"
export const registrarAcesso = async (acao: string, detalhes: object) => {
  // Pega o usuário logado atualmente pelo Auth do Supabase
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.warn("Nenhum usuário logado para registrar log.");
    return;
  }

  const { error } = await supabase
    .from('logs_acesso') // Crie essa tabela no site
    .insert({
      user_id: user.id,   // ID único seguro
      acao: acao,         // Ex: "LOGIN", "COMPRA"
      detalhes: detalhes, // JSON com o que foi feito
      email_usuario: user.email // Opcional, para facilitar leitura
      // A data (created_at) é preenchida automaticamente pelo banco
    });

  if (error) console.error("Erro ao salvar log:", error);
};

// Exemplo de como salvar um novo cadastro
export const cadastrarUsuarioBanco = async (dadosUsuario: any) => {
  const { error } = await supabase
    .from('usuarios')
    .insert(dadosUsuario);
  
  if (error) throw error;
};