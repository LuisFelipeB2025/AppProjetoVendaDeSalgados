import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  LayoutAnimation, 
  Platform, 
  UIManager,
  Pressable
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Produto = {
  id: string;
  nome: string;
  preco: number;
  imagem?: any;
  descricao?: string;
};

type Props = {
  produto: Produto;
  quantidade: number;
  setQuantidade: (id: string, valor: number) => void;
};

export default function ProdutoCard({ produto, quantidade, setQuantidade }: Props) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <Pressable 
      style={styles.card} 
      onPress={toggleExpand}
      android_ripple={{ color: '#f0f0f0' }}
    >
      <View style={styles.headerContent}>
        {/* Imagem menor (70px) */}
        <View style={styles.imageContainer}>
            {produto.imagem ? (
            <Image source={produto.imagem} style={styles.imagemProduto} />
            ) : (
                <View style={[styles.imagemProduto, { backgroundColor: '#eee' }]} />
            )}
        </View>

        <View style={styles.infoContainer}>
            <View style={styles.titleRow}>
                <Text style={styles.nome} numberOfLines={expanded ? 0 : 2}>{produto.nome}</Text>
            </View>
            <Text style={styles.preco}>R$ {produto.preco.toFixed(2)}</Text>
            
            {!expanded && (
                <Text style={styles.dicaExpandir}>Toque para detalhes</Text>
            )}
        </View>

        {/* Controles compactos */}
        <View style={styles.controleCompacto}>
            <TouchableOpacity
                style={[styles.botaoControle, { backgroundColor: '#ff5252' }]}
                onPress={() => setQuantidade(produto.id, Math.max(quantidade - 1, 0))}
            >
                <Text style={styles.botaoTexto}>-</Text>
            </TouchableOpacity>

            <Text style={styles.quantidade}>{quantidade}</Text>

            <TouchableOpacity
                style={[styles.botaoControle, { backgroundColor: '#4CAF50' }]}
                onPress={() => setQuantidade(produto.id, quantidade + 1)}
            >
                <Text style={styles.botaoTexto}>+</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Descrição (Expandida) */}
      {expanded && (
        <View style={styles.descricaoContainer}>
            <Text style={styles.descricaoTexto}>
                {produto.descricao || "Ingredientes frescos e selecionados."}
            </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10, // Menos margem entre cards
    marginHorizontal: 10,
    padding: 10, // Padding interno reduzido
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...Platform.select({
        web: { cursor: 'pointer', transition: '0.2s ease' } as any
    })
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 70,  // Reduzido de 90 para 70
    height: 70, 
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  imagemProduto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 5,
  },
  titleRow: {
    flexDirection: 'row', 
    alignItems: 'flex-start'
  },
  nome: {
    fontWeight: '600',
    fontSize: 14, // Fonte levemente menor
    color: '#333',
    marginBottom: 2,
  },
  preco: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  dicaExpandir: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  descricaoContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  descricaoTexto: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  controleCompacto: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  botaoControle: {
    width: 28, 
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  quantidade: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
    minWidth: 16,
    textAlign: 'center',
  },
});