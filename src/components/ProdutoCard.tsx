// src/components/ProdutoCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type Produto = {
  id: string;
  nome: string;
  preco: number;
};

type ProdutoCardProps = {
  produto: Produto;
  quantidade: number;
  setQuantidade: (id: string, valor: number) => void;
};

//  <-- Placeholder para Imagem
const ProductImage = require('../assets/salgado.png'); 

export default function ProdutoCard({ produto, quantidade, setQuantidade }: ProdutoCardProps) {
  return (
    <View style={styles.card}>
      <Image 
        source={ProductImage} // Componente de Imagem
        style={styles.image} 
        resizeMode="cover" 
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>{produto.nome}</Text>
        <Text style={styles.price}>R$ {produto.preco.toFixed(2)}</Text>
      </View>
      <View style={styles.counterContainer}>
        <TouchableOpacity 
          style={styles.counterButton} 
          onPress={() => setQuantidade(produto.id, Math.max(0, quantidade - 1))}
        >
          <Text style={styles.counterButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantidade}</Text>
        <TouchableOpacity 
          style={styles.counterButton} 
          onPress={() => setQuantidade(produto.id, quantidade + 1)}
        >
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150, // Ajustado para grid 
    margin: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  infoContainer: {
    padding: 10,
    minHeight: 60,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  counterButton: {
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    color: Colors.cardBackground,
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
});