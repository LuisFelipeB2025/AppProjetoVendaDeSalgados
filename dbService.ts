import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native'; 

const DATABASE_NAME = 'salgados.db';
const STORAGE_KEY = 'rn_web_auth_data'; 

let db: any; 

// --- Funções Auxiliares para Web (Mock) ---
const getWebUsers = () => {
    if (typeof localStorage === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveWebUsers = (users: any[]) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
};

// --- Inicialização do Banco ---
if (Platform.OS !== 'web') { 
    db = SQLite.openDatabase(DATABASE_NAME); 
} else {
    console.warn("SQLite desativado: Ambiente Web. Usando localStorage para persistência.");
}

// --- Função Principal de Execução SQL ---
export const executeSql = (sql: string, params: any[] = []): Promise<any> => {
    // 1. LÓGICA PARA WEB (LocalStorage)
    if (Platform.OS === 'web') {
        const users = getWebUsers();
        const lowerSql = sql.toLowerCase();
        
        // Simulação de LOGIN (Select)
        if (lowerSql.includes('select') && lowerSql.includes('from usuarios')) {
            if (params.length >= 2 && lowerSql.includes('senha')) {
                const [email, senha] = params;
                const foundUser = users.find((u: any) => u.email === email && u.senha === senha);
                return Promise.resolve({ rows: { _array: foundUser ? [foundUser] : [] } });
            }
            // Verificação de email existente
            if (params.length === 1 || (params.length > 0 && !lowerSql.includes('senha'))) {
                const [email] = params;
                const foundUser = users.find((u: any) => u.email === email);
                return Promise.resolve({ rows: { _array: foundUser ? [foundUser] : [] } });
            }
        }

        // Simulação de CADASTRO (Insert)
        if (lowerSql.includes('insert into usuarios')) {
            // A ordem dos parâmetros deve bater com a do RegisterScreen.tsx:
            // [nome, cep, rua, numero, bairro, telefone, email, senha]
            const [nome, cep, rua, numero, bairro, telefone, email, senha] = params;
            
            if (users.some((u: any) => u.email === email)) {
                return Promise.reject(new Error("Email já cadastrado (Simulação Web)."));
            }
            
            const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
            const newUser = { id: newId, nome, cep, rua, numero, bairro, telefone, email, senha };
            
            users.push(newUser);
            saveWebUsers(users);
            
            return Promise.resolve({ rowsAffected: 1 });
        }
        
        return Promise.resolve({ rows: { _array: [] } }); 
    }

    // 2. LÓGICA PARA CELULAR (SQLite Nativo)
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

// --- Criação das Tabelas ---
export const initDatabase = (): Promise<void> => {
    if (Platform.OS === 'web' || !db) {
        return Promise.resolve(); 
    }

    return new Promise((resolve, reject) => {
        db!.transaction((tx: any) => {
            // Tabela de Produtos (Opcional, se for usar cache local de produtos)
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS produtos (id TEXT PRIMARY KEY NOT NULL, nome TEXT NOT NULL, preco REAL NOT NULL, imagem TEXT);`,
                [],
                () => {
                    // Tabela de Usuários (Com RUA, NUMERO e BAIRRO)
                    tx.executeSql(
                        `CREATE TABLE IF NOT EXISTS usuarios (
                            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
                            nome TEXT,
                            cep TEXT,
                            rua TEXT,
                            numero TEXT,
                            bairro TEXT,
                            telefone TEXT,
                            email TEXT UNIQUE NOT NULL, 
                            senha TEXT NOT NULL
                        );`,
                        [],
                        () => resolve(), 
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