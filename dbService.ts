import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native'; 

const DATABASE_NAME = 'salgados.db';
// Usando 'any' para evitar os erros de tipo do VS Code
let db: any; 

if (Platform.OS !== 'web') {
    db = SQLite.openDatabase(DATABASE_NAME); 
} else {
    // Mock para Web
    console.warn("SQLite não inicializado: Ambiente Web. Usando mocks para operações de DB.");
}

/**
 * 🛑 FUNÇÃO DE RESET (SOLUÇÃO TEMPORÁRIA)
 * Esta função APAGA (DROP) as tabelas para forçar uma recriação limpa
 * e corrigir o estado corrompido do banco de dados.
 */
export const resetDatabase = (): Promise<void> => {
    // Se estiver na web ou o db não foi inicializado, não faz nada
    if (Platform.OS === 'web' || !db) {
        return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
        db!.transaction(
            (tx: any) => {
                // Apaga a tabela de usuários se ela existir
                tx.executeSql(`DROP TABLE IF EXISTS usuarios;`, [], null, 
                    (t: any, e: any) => { 
                        console.error("Erro ao dropar tabela usuarios", e); 
                        reject(e); 
                        return true; // Indica que o erro foi tratado
                    }
                );
                
                // Apaga a tabela de produtos se ela existir
                tx.executeSql(`DROP TABLE IF EXISTS produtos;`, [], 
                    () => resolve(), // Sucesso ao dropar
                    (txCallback: any, error: any) => {
                        console.error("Erro ao dropar tabela produtos", error);
                        reject(error);
                        return true; // Indica que o erro foi tratado
                    }
                );
            },
            (error: any) => { 
                console.error("Erro na transação de reset", error);
                reject(error); 
            }
        );
    });
};


/**
 * Inicializa o banco de dados e cria as tabelas se não existirem.
 */
export const initDatabase = (): Promise<void> => {
    if (Platform.OS === 'web' || !db) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        db!.transaction(
            (tx: any) => {
                // Tabela de Produtos
                tx.executeSql(`CREATE TABLE IF NOT EXISTS produtos (id TEXT PRIMARY KEY NOT NULL, nome TEXT NOT NULL, preco REAL NOT NULL, imagem TEXT);`, [], null, 
                    (t: any, e: any) => { 
                        console.error('Erro ao criar tabela produtos:', e); 
                        reject(e); 
                        return true; 
                    }
                );
                
                // Tabela de Usuários (ESSENCIAL PARA O LOGIN)
                // Usamos AUTOINCREMENT para que o ID seja gerenciado pelo SQLite
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS usuarios (
                        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
                        email TEXT UNIQUE NOT NULL, 
                        senha TEXT NOT NULL
                    );`,
                    [], 
                    () => resolve(), // Sucesso
                    (txCallback: any, error: any) => {
                        console.error('Erro ao criar a tabela usuarios:', error);
                        reject(error);
                        return true;
                    }
                );
            },
            (error: any) => { 
                console.error("Erro na transação de init", error);
                reject(error); 
            }
        );
    });
};

/**
 * Executa um comando SQL.
 */
export const executeSql = (sql: string, params: any[] = []): Promise<any> => {
    if (!db) {
        // Mock para Web: Retorna um resultado simulado
        return Promise.resolve({ rows: { _array: [] } }); 
    }

    return new Promise((resolve, reject) => {
        db!.transaction((tx: any) => { 
            tx.executeSql(
                sql,
                params,
                (txCallback: any, result: any) => resolve(result), 
                (txCallback: any, error: any) => { 
                    console.error("Erro na execução SQL:", error);
                    reject(error);
                    return true; 
                }
            );
        });
    });
};