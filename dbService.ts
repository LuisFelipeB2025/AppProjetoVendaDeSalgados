import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native'; 

const DATABASE_NAME = 'salgados.db';

// ✅ CORREÇÃO FINAL: Usando 'any' para contornar o erro de tipagem no VS Code.
let db: any;

// Inicializa db apenas se não for a web
if (Platform.OS !== 'web') {
    db = SQLite.openDatabase(DATABASE_NAME); 
} else {
    // Para a web, garantimos que o "db" seja undefined (mock)
    console.warn("SQLite não inicializado: Ambiente Web. Usando mocks para operações de DB.");
}

export const executeSql = (sql: string, params: any[] = []): Promise<any> => {
    // TRATAMENTO WEB: Se db não estiver definido (estamos na web), resolve a Promise
    if (!db) {
        console.warn(`Simulando execução SQL na Web: ${sql}`);
        // Retorna um resultado simulado para evitar erros de leitura
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

export const initDatabase = (): Promise<void> => {
    // SOLUÇÃO CRÍTICA PARA A WEB: Se estiver na plataforma 'web' ou db for undefined, resolve.
    if (Platform.OS === 'web' || !db) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        db!.transaction(
            (tx: any) => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS produtos (
                        id TEXT PRIMARY KEY NOT NULL,
                        nome TEXT NOT NULL,
                        preco REAL NOT NULL,
                        imagem TEXT
                    );`,
                    [],
                    // Sucesso na criação da tabela
                    () => resolve(),
                    // Erro na transação
                    (txCallback: any, error: any) => {
                        console.error('Erro ao criar a tabela:', error);
                        reject(error);
                        return true;
                    }
                );
            },
            // Callback de erro da transação (caso a transação falhe ao iniciar)
            (error: any) => {
                reject(error);
            }
        );
    });
};