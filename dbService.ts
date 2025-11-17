import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native'; 

const DATABASE_NAME = 'salgados.db';
// Chave usada para armazenar os dados no localStorage
const STORAGE_KEY = 'rn_web_auth_data'; 

// Usando 'any' para evitar erros de tipo do VS Code
let db: any; 

// Funções de mock para a web usando localStorage
const getWebUsers = () => {
    // Usa localStorage para persistência de dados
    if (typeof localStorage === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveWebUsers = (users: any[]) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
};

if (Platform.OS !== 'web') {
    db = SQLite.openDatabase(DATABASE_NAME); 
} else {
    // Mock para Web: Não inicializamos o SQLite.
    console.warn("SQLite desativado: Ambiente Web. Usando localStorage para persistência.");
}

/**
 * Executa um comando SQL, simulando a operação no web com localStorage.
 */
export const executeSql = (sql: string, params: any[] = []): Promise<any> => {
    // 🛑 LÓGICA DE MOCK para WEB (LocalStorage)
    if (Platform.OS === 'web') {
        const users = getWebUsers();
        const lowerSql = sql.toLowerCase();
        
        // --- 1. LOGIN CHECK / EMAIL EXISTENCE CHECK ---
        if (lowerSql.includes('select') && lowerSql.includes('from usuarios')) {
            const [email, senha] = params;
            
            // Lógica de Login (params.length === 2)
            if (params.length === 2) {
                const foundUser = users.find((u: any) => u.email === email && u.senha === senha);
                return Promise.resolve({ rows: { _array: foundUser ? [{ id: foundUser.id || 1 }] : [] } });
            }
            
            // Lógica de Verificação de Email Único (params.length === 1)
            if (params.length === 1) {
                const foundUser = users.find((u: any) => u.email === email);
                return Promise.resolve({ rows: { _array: foundUser ? [{ id: foundUser.id || 1 }] : [] } });
            }
        }

        // --- 2. REGISTRATION / INSERT ---
        if (lowerSql.includes('insert into usuarios')) {
            const [email, senha] = params;
            
            // Verifica unicidade
            if (users.some((u: any) => u.email === email)) {
                return Promise.reject(new Error("Email já cadastrado (Simulação Web)."));
            }
            
            // Adiciona o novo usuário
            const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
            const newUser = { id: newId, email, senha };
            
            users.push(newUser);
            saveWebUsers(users);
            
            return Promise.resolve({ rowsAffected: 1 });
        }
        
        // Fallback
        return Promise.resolve({ rows: { _array: [] } }); 
    }
    // ------------------------------------------------------------------------

    // Lógica NATIVA (SQLITE)
    if (!db) {
        return Promise.resolve({ rows: { _array: [] } }); 
    }

    return new Promise((resolve, reject) => {
        db!.transaction((tx: any) => { 
            tx.executeSql(
                sql,
                params,
                (txCallback: any, result: any) => resolve(result), 
                (txCallback: any, error: any) => { 
                    console.error(`Erro ao executar SQL: ${sql}`, error);
                    reject(error);
                    return true; 
                }
            );
        });
    });
};


/**
 * Inicializa o banco de dados (Apenas cria as tabelas no Nativo).
 */
export const initDatabase = (): Promise<void> => {
    if (Platform.OS === 'web' || !db) {
        return Promise.resolve(); 
    }

    // Lógica Nativa: Criação de Tabelas
    return new Promise((resolve, reject) => {
        db!.transaction((tx: any) => {
            
            // Passo 1: Criar Tabela 'produtos'
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS produtos (id TEXT PRIMARY KEY NOT NULL, nome TEXT NOT NULL, preco REAL NOT NULL, imagem TEXT);`,
                [],
                () => {
                    // Passo 2: SUCESSO. Agora, criar Tabela 'usuarios'
                    tx.executeSql(
                        `CREATE TABLE IF NOT EXISTS usuarios (
                            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
                            email TEXT UNIQUE NOT NULL, 
                            senha TEXT NOT NULL
                        );`,
                        [],
                        () => resolve(), // SUCESSO FINAL
                        (t: any, e: any) => { 
                            console.error('Falha CRÍTICA ao criar tabela usuarios:', e);
                            reject(e);
                            return true;
                        }
                    );
                },
                (t: any, e: any) => { 
                    console.error('Falha CRÍTICA ao criar tabela produtos:', e);
                    reject(e);
                    return true;
                }
            );
        },
        (error: any) => { 
            console.error("Erro na transação de init (geral):", error);
            reject(error);
        });
    });
};
