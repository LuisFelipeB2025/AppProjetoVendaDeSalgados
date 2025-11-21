import { Platform } from 'react-native'; 
import * as SQLite from 'expo-sqlite'; 

const DATABASE_NAME = 'salgados.db';
const STORAGE_KEY = 'rn_web_auth_data'; 

// Variáveis que serão definidas dinamicamente
let executeSql: (sql: string, params?: any[]) => Promise<any>;
let initDatabase: () => Promise<void>;

// Variável que armazena a conexão SQLite APENAS no nativo
let dbNative: any; 


// --- LÓGICA PARA WEB (LocalStorage Mock) ---
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

const initDatabaseWeb = async () => {
    console.warn("SQLite desativado: Ambiente Web. Usando localStorage para persistência.");
};

const executeSqlWeb = (sql: string, params: any[] = []): Promise<any> => {
    const users = getWebUsers();
    const lowerSql = sql.toLowerCase();
    
    // Simulação de LOGIN (Select)
    if (lowerSql.includes('select') && lowerSql.includes('from usuarios')) {
        if (params.length >= 2 && lowerSql.includes('senha')) {
            const [email, senha] = params;
            const foundUser = users.find((u: any) => u.email === email && u.senha === senha);
            return Promise.resolve({ rows: { _array: foundUser ? [foundUser] : [] } });
        }
        // Verificação de duplicidade (Email ou Telefone)
        if (lowerSql.includes('email = ?') || lowerSql.includes('telefone = ?')) {
             const value = params[0];
             const foundUser = users.find((u: any) => u.email === value || u.telefone === value);
             return Promise.resolve({ rows: { _array: foundUser ? [foundUser] : [] } });
        }
    }

    // UPDATE LAST LOGIN
    if (lowerSql.includes('update usuarios set last_login')) {
        const [data, id] = params;
        const userIndex = users.findIndex((u: any) => u.id === id);
        if (userIndex >= 0) {
            users[userIndex].last_login = data;
            saveWebUsers(users);
        }
        return Promise.resolve({ rowsAffected: 1 });
    }

    // CADASTRO (Insert)
    if (lowerSql.includes('insert into usuarios')) {
        const [nome, cep, rua, numero, bairro, telefone, email, senha] = params;
        
        if (users.some((u: any) => u.telefone === telefone || u.email === email)) {
            return Promise.reject(new Error("Telefone/Email já cadastrado."));
        }
        
        const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
        const newUser = { id: newId, nome, cep, rua, numero, bairro, telefone, email, senha, last_login: new Date().toLocaleString('pt-BR') };
        
        users.push(newUser);
        saveWebUsers(users);
        
        return Promise.resolve({ rowsAffected: 1 });
    }
    
    return Promise.resolve({ rows: { _array: [] } }); 
};


// --- LÓGICA PARA NATIVO (SQLite) ---

const initDatabaseNative = (): Promise<void> => {
    // Inicialização da conexão SQLite
    dbNative = SQLite.openDatabase(DATABASE_NAME); 

    return new Promise((resolve, reject) => {
        dbNative!.transaction((tx: any) => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS produtos (id TEXT PRIMARY KEY NOT NULL, nome TEXT NOT NULL, preco REAL NOT NULL, imagem TEXT);`,
                [],
                () => {
                    // Tabela de Usuários Completa
                    tx.executeSql(
                        `CREATE TABLE IF NOT EXISTS usuarios (
                            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
                            nome TEXT,
                            cep TEXT,
                            rua TEXT,
                            numero TEXT,
                            bairro TEXT,
                            telefone TEXT UNIQUE NOT NULL, 
                            email TEXT, 
                            senha TEXT NOT NULL,
                            last_login TEXT
                        );`,
                        [],
                        () => resolve(), 
                        (t: any, e: any) => { 
                            console.error('Falha CRÍTICA tabelas:', e);
                            reject(e);
                            return true;
                        }
                    );
                }
            );
        },
        (error: any) => { reject(error); });
    });
};

const executeSqlNative = (sql: string, params: any[] = []): Promise<any> => {
    if (!dbNative) return Promise.reject(new Error("Database not initialized.")); 

    return new Promise((resolve, reject) => {
        dbNative!.transaction((tx: any) => { 
            tx.executeSql(
                sql,
                params,
                (txCallback: any, result: any) => resolve(result), 
                (txCallback: any, error: any) => { 
                    console.error(`Erro SQL: ${sql}`, error);
                    reject(error);
                    return true; 
                }
            );
        });
    });
};

// --- Atribuição Final de Funções (Usando Platform.OS) ---
if (Platform.OS === 'web') {
    executeSql = executeSqlWeb;
    initDatabase = initDatabaseWeb;
} else {
    executeSql = executeSqlNative;
    initDatabase = initDatabaseNative;
}

// Exportações
export { executeSql, initDatabase };