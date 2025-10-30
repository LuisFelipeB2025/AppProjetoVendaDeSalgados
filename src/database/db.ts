// src/database/db.ts

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('app_salgados.db');

export const initDatabase = () => {
  db.transaction(tx => {
    // Tabela para armazenar dados de usuários (cadastro)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY NOT NULL, 
        name TEXT NOT NULL, 
        email TEXT UNIQUE NOT NULL, 
        password TEXT NOT NULL,
        avatarUri TEXT
      );`,
      [],
      () => console.log('Tabela de usuários criada com sucesso!'),
      (_, error) => {
        console.error('Erro ao criar tabela de usuários:', error);
        return false;
      }
    );
  });
};

// Exemplo de função para cadastrar um novo usuário
export const registerUser = (name: string, email: string, password: string): Promise<boolean> => {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO users (name, email, password) VALUES (?, ?, ?);`,
        [name, email, password],
        () => resolve(true), // Sucesso
        (_, error) => {
          console.error('Erro ao cadastrar usuário:', error);
          resolve(false); // Falha
          return false;
        }
      );
    });
  });
};

// Exemplo de função para verificar login
export const checkLogin = (email: string, password_input: string): Promise<any | null> => {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT id, name, email, avatarUri FROM users WHERE email = ? AND password = ?;`,
        [email, password_input],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0)); // Retorna os dados do usuário
          } else {
            resolve(null); // Login falhou
          }
        },
        (_, error) => {
          console.error('Erro ao verificar login:', error);
          resolve(null);
          return false;
        }
      );
    });
  });
};