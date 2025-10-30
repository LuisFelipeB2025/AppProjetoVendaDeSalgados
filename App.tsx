// App.tsx
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator'; // Importa o Navigator

export default function App() {
  return (
    // O AppNavigator já encapsula toda a navegação e o gerenciamento 
    // do estado de inicialização do SQLite.
    <AppNavigator /> 
  );
}