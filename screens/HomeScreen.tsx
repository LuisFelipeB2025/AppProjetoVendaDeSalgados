import React, { useState, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Image, 
  // SafeAreaView removido
  StatusBar,
  TouchableOpacity,
  Text,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  TextInput,
  Linking
} from 'react-native';

import ProdutoCard from '../components/ProdutoCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // NOVO IMPORT

type Props = {
  onLogout?: () => void;
  user?: any;
  onNavigateToProfile?: () => void; // Propriedade de navegação
};

// NÚMERO DO WHATSAPP DA LOJA
const NUMERO_DA_LOJA = '5521969714096'; 

const PRODUTOS_SALGADOS = [
  { 
    id: '1', 
    nome: 'Hambúrguer c/ Catupiry', 
    preco: 6.0, 
    imagem: require('../assets/H1.png'),
    descricao: 'Um clássico irresistível! Hambúrguer suculento envolto em nossa massa artesanal macia.'
  },
  { 
    id: '2', 
    nome: 'Hambúrguer c/ Cheddar', 
    preco: 6.0, 
    imagem: require('../assets/H2.png'), 
    descricao: 'Para os amantes de queijo! Carne de hambúrguer saborosa assada na massa douradinha.'
  },
  { 
    id: '3', 
    nome: 'Mini Burger c/ Cheddar', 
    preco: 6.0, 
    imagem: require('../assets/MA1.png'), 
    descricao: 'A versão compacta do nosso sucesso. Perfeito para um lanche rápido.'
  },
  { 
    id: '4', 
    nome: 'Mini Joelho (Q. e Presunto)', 
    preco: 6.0, 
    imagem: require('../assets/MA2.png'), 
    descricao: 'O famoso Joelho em versão especial. Massa leve recheada com presunto e queijo.'
  },
  { 
    id: '5', 
    nome: 'Mini Salsicha c/ Cheddar', 
    preco: 6.0, 
    imagem: require('../assets/MA3.png'), 
    descricao: 'O favorito da garotada! Salsicha de primeira enrolada em massa com cheddar.'
  },
  { 
    id: '6', 
    nome: 'Enroladinho Salsicha', 
    preco: 6.0, 
    imagem:  require('../assets/S1.png'), 
    descricao: 'Enroladinho de salsicha tamanho grande. Maravilhoso!'
  },
];

export default function HomeScreen({ onLogout, user, onNavigateToProfile }: Props) {
  const [quantidades, setQuantidades] = useState<{[key: string]: number}>({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Hook para obter as margens seguras (topo e fundo)
  const insets = useSafeAreaInsets(); 

  const handleSetQuantidade = (id: string, valor: number) => {
    setQuantidades(prev => ({ ...prev, [id]: valor }));
  };

  const handleLogout = () => {
    setMenuVisible(false);
    if (!onLogout) return;

    if (Platform.OS === 'web') {
        if (window.confirm("Tem certeza que deseja sair da conta?")) {
            onLogout();
        }
    } else {
        Alert.alert("Sair da Conta", "Tem certeza que deseja sair?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Sair", style: 'destructive', onPress: () => onLogout() }
        ]);
    }
  };

  const produtosFiltrados = useMemo(() => {
    if (!searchText) return PRODUTOS_SALGADOS;
    return PRODUTOS_SALGADOS.filter(p => 
        p.nome.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const totalItens = Object.values(quantidades).reduce((acc, qtd) => acc + qtd, 0);
  const totalValor = PRODUTOS_SALGADOS.reduce((acc, produto) => {
    const qtd = quantidades[produto.id] || 0;
    return acc + (produto.preco * qtd);
  }, 0);

  const handleFinalizarCompra = () => {
    if (totalItens === 0) {
        Alert.alert("Carrinho Vazio", "Selecione pelo menos um salgado para continuar.");
        return;
    }

    let mensagem = `*NOVO PEDIDO - Dunamis Salgados/Assados*\n\n`;
    
    // Dados do Cliente
    mensagem += `*Cliente:* ${user?.nome || 'Não informado'}\n`;
    mensagem += `*Telefone:* ${user?.telefone || 'Não informado'}\n\n`;
    
    // Endereço Completo
    const rua = user?.rua || 'Rua não informada';
    const numero = user?.numero || 'S/N';
    const bairro = user?.bairro || 'Bairro não informado';
    
    mensagem += `📍 *Endereço de Entrega:*\n`;
    mensagem += `${rua}, Nº ${numero}\n`;
    mensagem += `${bairro}\n`;
    if (user?.cep) {
        mensagem += `📮 CEP: ${user.cep}\n`;
    }
    mensagem += `\n`;
    
    mensagem += `*ITENS DO PEDIDO:*\n`;

    PRODUTOS_SALGADOS.forEach(produto => {
        const qtd = quantidades[produto.id] || 0;
        if (qtd > 0) {
            const subtotal = produto.preco * qtd;
            mensagem += `• ${qtd}x ${produto.nome} (R$ ${subtotal.toFixed(2)})\n`;
        }
    });

    mensagem += `\n💰 *TOTAL A PAGAR: R$ ${totalValor.toFixed(2)}*\n`;
    mensagem += `\nAguardo a confirmação!`;

    const encodedMsg = encodeURIComponent(mensagem);
    const cleanPhone = NUMERO_DA_LOJA.replace(/\D/g, '');
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;

    Linking.openURL(whatsappUrl).catch(err => {
        console.error("Erro ao abrir WhatsApp:", err);
        Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
    });
  };

  return (
    // Aplica a margem segura superior no container principal
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        
        <Image 
          source={require('../assets/LGT.png')} 
          style={styles.logo}
        />
        
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* BARRA DE PESQUISA */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput 
                style={styles.searchInput}
                placeholder="Buscar salgados..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                    <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>

      {/* LISTA */}
      <FlatList
        data={produtosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, totalItens > 0 && styles.listContentWithFooter]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProdutoCard 
            produto={item}
            quantidade={quantidades[item.id] || 0}
            setQuantidade={handleSetQuantidade}
          />
        )}
        ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
        }
      />

      {/* RODAPÉ DE COMPRA (APLICA INSETS INFERIORES) */}
      <View style={[styles.checkoutContainer, { paddingBottom: insets.bottom + 15 }]}>
          <View style={styles.checkoutInfo}>
              <Text style={styles.checkoutLabel}>Total a Pagar</Text>
              <Text style={[
                  styles.checkoutValue, 
                  totalItens === 0 && { color: '#999' }
              ]}>
                  R$ {totalValor.toFixed(2)}
              </Text>
          </View>
          
          <TouchableOpacity 
            style={[
                styles.checkoutButton, 
                totalItens === 0 && styles.checkoutButtonDisabled
            ]} 
            onPress={handleFinalizarCompra}
            disabled={totalItens === 0}
          >
              <Text style={styles.checkoutButtonText}>
                  {totalItens === 0 ? 'Escolha Itens' : `Finalizar (${totalItens})`}
              </Text>
          </TouchableOpacity>
      </View>

      {/* MODAL DO MENU */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                <View style={styles.menuHeader}>
                    <Text style={styles.menuTitle}>Menu</Text>
                    <TouchableOpacity onPress={() => setMenuVisible(false)}>
                        <Text style={styles.closeIcon}>✕</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.menuItems}>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.nome || 'Visitante'}</Text>
                        <Text style={styles.userPhone}>{user?.telefone || ''}</Text>
                    </View>
                    <View style={styles.divider} />
                    
                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                        setMenuVisible(false);
                        if (onNavigateToProfile) onNavigateToProfile();
                    }}>
                        <Text style={styles.menuItemText}>👤  Meu Perfil</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <Text style={[styles.menuItemText, styles.logoutText]}>🚪  Sair da conta</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.menuFooter}>
                    <Text style={styles.versionText}>Versão 1.0.0</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    width: '100%',
    height: 100, 
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    zIndex: 10,
    // paddingTop: Platform.OS === 'android' ? 10 : 0, - REMOVIDO: margem já está no container
  },
  menuButton: { padding: 5 },
  menuIcon: { fontSize: 28, color: '#333' },
  logo: { 
    width: 250,
    height: 90,
    resizeMode: 'contain' 
  },
  headerRightPlaceholder: { width: 30 },
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#333', fontSize: 15, height: '100%' },
  clearIcon: { fontSize: 16, color: '#999', padding: 4 },
  listContent: {
    paddingHorizontal: 5, 
    paddingTop: 10,
    paddingBottom: 20,
  },
  listContentWithFooter: {
    paddingBottom: 100,
  },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 100,
    // paddingBottom será ajustado dinamicamente pelo insets
  },
  checkoutInfo: {
    flexDirection: 'column',
  },
  checkoutLabel: {
    fontSize: 12,
    color: '#666',
  },
  checkoutValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 2,
    ...Platform.select({
        web: { cursor: 'pointer', transition: '0.2s' } as any
    })
  },
  checkoutButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' },
  menuContainer: { width: '75%', height: '100%', backgroundColor: '#fff', padding: 20, elevation: 5 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: Platform.OS === 'ios' ? 40 : 10 },
  menuTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  closeIcon: { fontSize: 24, color: '#999', padding: 5 },
  menuItems: { flex: 1 },
  userInfo: { marginBottom: 10, paddingLeft: 5 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  userPhone: { fontSize: 14, color: '#666' },
  menuItem: { paddingVertical: 15 },
  menuItemText: { fontSize: 18, color: '#444', fontWeight: '500' },
  logoutText: { color: '#d32f2f' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  menuFooter: { paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center' },
  versionText: { color: '#999', fontSize: 14 },
});