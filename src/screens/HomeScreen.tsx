// src/screens/HomeScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, FlatList, ScrollView } from 'react-native';
import ProdutoCard from '../components/ProdutoCard';
import { Colors } from '../constants/Colors';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type Produto = {
  id: string;
  nome: string;
  preco: number;
};

// Dados para a FlatList
const PRODUTOS: Produto[] = [
  { id: '1', nome: 'Hambúrguer c/ catupiry e mussarela', preco: 6.00 },
  { id: '2', nome: 'X-burguer (carne, catupiry, mussarela e presunto)', preco: 6.00 },
  { id: '3', nome: 'Joelho de frango c/ catupiry e mussarela', preco: 6.00 },
  { id: '4', nome: 'Hambúrguer c/ cheddar e mussarela', preco: 6.00 },
  { id: '5', nome: 'Esfiha de frango c/catupiry', preco: 6.00 },
  { id: '6', nome: 'Joelho de queijo c/ presunto e catupiry', preco: 6.00 },
  { id: '7', nome: 'Esfiha de carne moída', preco: 6.00 },
  { id: '8', nome: 'Salsicha c/ cheddar e mussarela', preco: 6.00 },
  { id: '9', nome: 'Cachorro-quente', preco: 6.00 },
  { id: '10', nome: 'Ativ Plus', preco: 2.00 },
  { id: '11', nome: 'guaravita', preco: 2.00 },
];

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const route = useRoute<HomeScreenRouteProp>();
  const user = route.params?.user; // Informações do usuário logado

  const [quantidades, setQuantidades] = useState<Record<string, number>>({}); // useState na atribuição

  const handleQuantidade = (id: string, valor: number) => {
    setQuantidades({ ...quantidades, [id]: valor });
  };

  const enviarPedido = () => {
    let mensagem = `🍴 *Pedido de Salgados de ${user?.name || 'Cliente'}*\n\n`;
    let total = 0;
    
    PRODUTOS.forEach(produto => {
      const qtd = quantidades[produto.id] || 0;
      if (qtd > 0) {
        const subtotal = qtd * produto.preco;
        mensagem += `• ${produto.nome}: ${qtd} x R$${produto.preco.toFixed(2)} = R$${subtotal.toFixed(2)}\n`;
        total += subtotal;
      }
    });

    if (total === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    mensagem += `\n💰 *Total:* R$${total.toFixed(2)}\n`;
    mensagem += '\n📦 Enviado via Dunamis Salgados App';

    const numeroWhatsApp = '5521969714096';
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    Linking.openURL(url);
  };
  
  // Utilizando FlatList para a lista de produtos (funciona melhor que o ScrollView para grandes listas)
  // O ProdutoCard atua como o componente de item.
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Olá, {user?.name || 'Cliente'}!</Text>
      <Text style={styles.subtitulo}>Cardápio Dunamis Salgados/Assados</Text>

      <FlatList
        data={PRODUTOS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProdutoCard
            produto={item}
            quantidade={quantidades[item.id] || 0}
            setQuantidade={handleQuantidade}
          />
        )}
        numColumns={2} // Grid de 2 colunas
        contentContainerStyle={styles.flatListContent}
        style={styles.flatList}
      />

      <TouchableOpacity style={styles.botao} onPress={enviarPedido}>
        <Text style={styles.botaoTexto}>
          Enviar Pedido (R$ {(PRODUTOS.reduce((acc, p) => acc + (quantidades[p.id] || 0) * p.preco, 0)).toFixed(2)})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: Colors.primary,
  },
  subtitulo: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.text,
  },
  flatList: {
    width: '100%',
  },
  flatListContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Espaço para o botão flutuante
  },
  botao: {
    position: 'absolute', // Botão fixo/flutuante
    bottom: 0,
    left: 10,
    right: 10,
    backgroundColor: Colors.secondary,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  botaoTexto: {
    color: Colors.cardBackground,
    fontSize: 18,
    fontWeight: 'bold',
  },
});