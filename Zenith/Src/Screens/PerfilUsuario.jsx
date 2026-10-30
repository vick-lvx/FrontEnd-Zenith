import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ImageBackground, Pressable, TextInput, ScrollView, Modal, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PerfilUsuario = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const [usuario, setUsuario] = useState(null);
    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [formUsuario, setFormUsuario] = useState({
        NOME: '',
        SOBRENOME: '',
        CPF: '',
        RG: '',
        EMAIL: '',
        DATA_NASCIMENTO: '',
        TELEFONE: '',
        SALARIO_LIQUIDO: '',
        DIA_PAGAMENTO: ''
    });

    const [cartoes, setCartoes] = useState([]);
    const [modalCartaoVisivel, setModalCartaoVisivel] = useState(false);
    const [editandoCartao, setEditandoCartao] = useState(false);
    const [cartaoSelecionado, setCartaoSelecionado] = useState(null);
    const [formCartao, setFormCartao] = useState({
        NOME_TITULAR: '',
        TIPO: '',
        AGENCIA: '',
        NUMERO: '',
        CVV: '',
        VALIDADE: ''
    });

    const [parcelas, setParcelas] = useState([]);

    const buscarDadosUsuario = async () => {
        try {
            const usuarioSalvo = await AsyncStorage.getItem('usuario');
            const tokenSalvo = await AsyncStorage.getItem('token');

            if (usuarioSalvo && tokenSalvo) {
                const usuarioData = JSON.parse(usuarioSalvo);
                const response = await axios.get(
                    `http://10.0.2.2:3001/api/listar-id-usuario/${usuarioData.ID}`,
                    {
                        headers: {
                            Authorization: `Bearer ${tokenSalvo}`
                        }
                    }
                );

                if (response.status === 200) {
                    const dados = response.data[0];
                    setUsuario(dados);
                    setFormUsuario({
                        NOME: dados.NOME || '',
                        SOBRENOME: dados.SOBRENOME || '',
                        CPF: dados.CPF || '',
                        RG: dados.RG || '',
                        EMAIL: dados.EMAIL || '',
                        DATA_NASCIMENTO: dados.DATA_NASCIMENTO ? new Date(dados.DATA_NASCIMENTO).toLocaleDateString('pt-BR') : '',
                        TELEFONE: dados.TELEFONE || '',
                        SALARIO_LIQUIDO: dados.SALARIO_LIQUIDO ? dados.SALARIO_LIQUIDO.toString() : '',
                        DIA_PAGAMENTO: dados.DIA_PAGAMENTO ? dados.DIA_PAGAMENTO.toString() : ''
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
        }
    };


    const buscarCartoes = async () => {
        try {
            const usuarioSalvo = await AsyncStorage.getItem('usuario');
            const tokenSalvo = await AsyncStorage.getItem('token');

            if (usuarioSalvo && tokenSalvo) {
                const usuarioData = JSON.parse(usuarioSalvo);
                const response = await axios.get(
                    `http://10.0.2.2:3001/api/listar-id-cartao/${usuarioData.ID}`,
                    {
                        headers: {
                            Authorization: `Bearer ${tokenSalvo}`
                        }
                    }
                );

                if (response.status === 200) {
                    setCartoes(response.data);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar cartões:', error);
        }
    };

    const buscarParcelas = async () => {
        try {
            const usuarioSalvo = await AsyncStorage.getItem('usuario');
            const tokenSalvo = await AsyncStorage.getItem('token');

            if (usuarioSalvo && tokenSalvo) {
                const usuarioData = JSON.parse(usuarioSalvo);
                const response = await axios.get(
                    `http://10.0.2.2:3001/api/listar-id-parcelas/${usuarioData.ID}`,
                    {
                        headers: {
                            Authorization: `Bearer ${tokenSalvo}`
                        }
                    }
                );

                if (response.status === 200) {
                    setParcelas(response.data);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar parcelas:', error);
        }
    };

    useEffect(() => {
        buscarDadosUsuario();
        buscarCartoes();
        buscarParcelas();
    }, []);

    const cartaoEmUso = (cartaoId) => {
        return parcelas.some(parcela => parcela.CARTAO_ID === cartaoId && parcela.SITUACAO !== 'P');
    };

    // Atualizar dados do usuário
    const handleAtualizarPerfil = async () => {
        try {
            const usuarioSalvo = await AsyncStorage.getItem('usuario');
            const tokenSalvo = await AsyncStorage.getItem('token');

            if (!usuarioSalvo || !tokenSalvo) {
                Alert.alert('Erro', 'Usuário não autenticado.');
                return;
            }

            const usuarioData = JSON.parse(usuarioSalvo);

            if (!formUsuario.NOME || !formUsuario.SOBRENOME || !formUsuario.EMAIL ||
                !formUsuario.CPF || !formUsuario.DATA_NASCIMENTO || !formUsuario.SALARIO_LIQUIDO ||
                !formUsuario.RG || !formUsuario.TELEFONE || !formUsuario.DIA_PAGAMENTO) {
                Alert.alert('Erro', 'Todos os campos são obrigatórios.');
                return;
            }

            const response = await axios.put(
                `http://10.0.2.2:3001/api/atualizar-usuario/${usuarioData.ID}`,
                {
                    NOME: formUsuario.NOME,
                    SOBRENOME: formUsuario.SOBRENOME,
                    CPF: formUsuario.CPF,
                    RG: formUsuario.RG,
                    EMAIL: formUsuario.EMAIL,
                    DATA_NASCIMENTO: formUsuario.DATA_NASCIMENTO,
                    TELEFONE: formUsuario.TELEFONE,
                    SALARIO_LIQUIDO: formUsuario.SALARIO_LIQUIDO,
                    DIA_PAGAMENTO: formUsuario.DIA_PAGAMENTO
                },
                {
                    headers: {
                        Authorization: `Bearer ${tokenSalvo}`
                    }
                }
            );

            if (response.status === 200) {
                Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
                setEditandoPerfil(false);
                buscarDadosUsuario();
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
        }
    };

    const handleCadastrarCartao = () => {
        setEditandoCartao(false);
        setCartaoSelecionado(null);
        setFormCartao({
            NOME_TITULAR: '',
            TIPO: '',
            AGENCIA: '',
            NUMERO: '',
            CVV: '',
            VALIDADE: ''
        });
        setModalCartaoVisivel(true);
    };

    const handleEditarCartao = (cartao) => {
        setEditandoCartao(true);
        setCartaoSelecionado(cartao);
        setFormCartao({
            NOME_TITULAR: cartao.NOME_TITULAR || '',
            TIPO: cartao.TIPO || '',
            AGENCIA: cartao.AGENCIA || '',
            NUMERO: cartao.NUMERO || '',
            CVV: cartao.CVV || '',
            VALIDADE: cartao.VALIDADE || ''
        });
        setModalCartaoVisivel(true);
    };

    const handleSalvarCartao = async () => {
        try {
            const usuarioSalvo = await AsyncStorage.getItem('usuario');
            const tokenSalvo = await AsyncStorage.getItem('token');

            if (!usuarioSalvo || !tokenSalvo) {
                Alert.alert('Erro', 'Usuário não autenticado.');
                return;
            }

            const usuarioData = JSON.parse(usuarioSalvo);

            if (!formCartao.NOME_TITULAR || !formCartao.TIPO || !formCartao.AGENCIA ||
                !formCartao.NUMERO || !formCartao.CVV || !formCartao.VALIDADE) {
                Alert.alert('Erro', 'Todos os campos são obrigatórios.');
                return;
            }

            if (editandoCartao) {
    
                const response = await axios.put(
                    `http://10.0.2.2:3001/api/atualizar-cartao/${cartaoSelecionado.ID}`,
                    {
                        NOME_TITULAR: formCartao.NOME_TITULAR,
                        TIPO: formCartao.TIPO,
                        AGENCIA: formCartao.AGENCIA,
                        NUMERO: formCartao.NUMERO,
                        CVV: formCartao.CVV,
                        VALIDADE: formCartao.VALIDADE,
                        USUARIO_ID: usuarioData.ID
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${tokenSalvo}`
                        }
                    }
                );

                if (response.status === 200) {
                    Alert.alert('Sucesso', 'Cartão atualizado com sucesso!');
                    setModalCartaoVisivel(false);
                    buscarCartoes();
                }
            } else {
              
                const response = await axios.post(
                    'http://10.0.2.2:3001/api/cadastrar-cartao',
                    {
                        NOME_TITULAR: formCartao.NOME_TITULAR,
                        TIPO: formCartao.TIPO,
                        AGENCIA: formCartao.AGENCIA,
                        NUMERO: formCartao.NUMERO,
                        CVV: formCartao.CVV,
                        VALIDADE: formCartao.VALIDADE,
                        USUARIO_ID: usuarioData.ID
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${tokenSalvo}`
                        }
                    }
                );

                if (response.status === 201) {
                    Alert.alert('Sucesso', 'Cartão cadastrado com sucesso!');
                    setModalCartaoVisivel(false);
                    buscarCartoes();
                }
            }
        } catch (error) {
            console.error('Erro ao salvar cartão:', error);
            if (error.response && error.response.data && error.response.data.msg) {
                Alert.alert('Erro', error.response.data.msg);
            } else {
                Alert.alert('Erro', 'Não foi possível salvar o cartão.');
            }
        }
    };

    const handleAtualizarStatusCartao = async (cartao) => {
        try {
            if (cartaoEmUso(cartao.ID)) {
                Alert.alert(
                    'Aviso',
                    'Não é possível desativar este cartão pois está sendo usado para pagar algum gasto parcelado.'
                );
                return;
            }

            const novoStatus = cartao.STATUS === 'A' ? 'I' : 'A';
            const acao = novoStatus === 'I' ? 'desativar' : 'ativar';

            Alert.alert(
                'Confirmação',
                `Deseja realmente ${acao} este cartão?`,
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel'
                    },
                    {
                        text: 'Confirmar',
                        onPress: async () => {
                            try {
                                const usuarioSalvo = await AsyncStorage.getItem('usuario');
                                const tokenSalvo = await AsyncStorage.getItem('token');

                                if (!usuarioSalvo || !tokenSalvo) {
                                    Alert.alert('Erro', 'Usuário não autenticado.');
                                    return;
                                }

                                const response = await axios.put(
                                    `http://10.0.2.2:3001/api/atualizar-status-cartao/${cartao.ID}`,
                                    {},
                                    {
                                        headers: {
                                            Authorization: `Bearer ${tokenSalvo}`
                                        }
                                    }
                                );

                                if (response.status === 200) {
                                    Alert.alert('Sucesso', `Cartão ${acao} com sucesso!`);
                                    buscarCartoes();
                                }
                            } catch (error) {
                                console.error('Erro ao atualizar status:', error);
                                Alert.alert('Erro', `Não foi possível ${acao} o cartão.`);
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    };

    const formatarNumeroCartao = (numero) => {
        if (!numero) return '';
        const ultimosQuatro = numero.slice(-4);
        return `**** **** **** ${ultimosQuatro}`;
    };

    const formatarValidade = (validade) => {
        if (!validade) return '';
        if (validade.length >= 4) {
            return `${validade.slice(0, 2)}/${validade.slice(2)}`;
        }
        return validade;
    };

    const formatarSalario = (valor) => {
        if (!valor) return 'R$ 0,00';
        return Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(valor));
    };

    return (
        <ImageBackground
            style={{ flex: 1 }}
            source={require('../../Res/img/FundoApp-Zenith.png')}
            resizeMode="cover"
        >
            <ScrollView style={styles.container}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Meu Perfil</Text>

                    {!editandoPerfil ? (
              
                        <View style={styles.profileInfoContainer}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Nome:</Text>
                                <Text style={styles.infoValue}>{usuario?.NOME} {usuario?.SOBRENOME}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>CPF:</Text>
                                <Text style={styles.infoValue}>{usuario?.CPF}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>RG:</Text>
                                <Text style={styles.infoValue}>{usuario?.RG}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Email:</Text>
                                <Text style={styles.infoValue}>{usuario?.EMAIL}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Data de Nascimento:</Text>
                                <Text style={styles.infoValue}>{usuario?.DATA_NASCIMENTO ? new Date(usuario.DATA_NASCIMENTO).toLocaleDateString('pt-BR') : ''}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Telefone:</Text>
                                <Text style={styles.infoValue}>{usuario?.TELEFONE}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Salário Líquido:</Text>
                                <Text style={styles.infoValue}>{formatarSalario(usuario?.SALARIO_LIQUIDO)}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Dia de Pagamento:</Text>
                                <Text style={styles.infoValue}>{usuario?.DIA_PAGAMENTO}</Text>
                            </View>

                            <Pressable
                                onPress={() => setEditandoPerfil(true)}
                                style={({ pressed }) => [
                                    styles.editButton,
                                    {
                                        opacity: pressed ? 0.85 : 1
                                    }
                                ]}
                            >
                                <Text style={styles.editButtonText}>Editar</Text>
                            </Pressable>
                        </View>
                    ) : (
                      
                        <View style={styles.formContainer}>
                            <View style={styles.formRow}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Nome</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formUsuario.NOME}
                                        onChangeText={(text) => setFormUsuario({...formUsuario, NOME: text})}
                                        placeholder="Digite seu nome"
                                        placeholderTextColor="#f0efff9e"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Sobrenome</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formUsuario.SOBRENOME}
                                        onChangeText={(text) => setFormUsuario({...formUsuario, SOBRENOME: text})}
                                        placeholder="Digite seu sobrenome"
                                        placeholderTextColor="#f0efff9e"
                                    />
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>CPF</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formUsuario.CPF}
                                        onChangeText={(text) => setFormUsuario({...formUsuario, CPF: text})}
                                        placeholder="Digite seu CPF"
                                        placeholderTextColor="#f0efff9e"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>RG</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formUsuario.RG}
                                        onChangeText={(text) => setFormUsuario({...formUsuario, RG: text})}
                                        placeholder="Digite seu RG"
                                        placeholderTextColor="#f0efff9e"
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formUsuario.EMAIL}
                                    onChangeText={(text) => setFormUsuario({...formUsuario, EMAIL: text})}
                                    placeholder="Digite seu email"
                                    placeholderTextColor="#f0efff9e"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Data de Nascimento</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formUsuario.DATA_NASCIMENTO}
                                    onChangeText={(text) => setFormUsuario({...formUsuario, DATA_NASCIMENTO: text})}
                                    placeholder="DD/MM/AAAA"
                                    placeholderTextColor="#f0efff9e"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Telefone</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formUsuario.TELEFONE}
                                    onChangeText={(text) => setFormUsuario({...formUsuario, TELEFONE: text})}
                                    placeholder="Digite seu telefone"
                                    placeholderTextColor="#f0efff9e"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.formRow}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Salário Líquido</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formUsuario.SALARIO_LIQUIDO}
                                        onChangeText={(text) => setFormUsuario({...formUsuario, SALARIO_LIQUIDO: text})}
                                        placeholder="R$ 0,00"
                                        placeholderTextColor="#f0efff9e"
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Dia de Pagamento</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formUsuario.DIA_PAGAMENTO}
                                        onChangeText={(text) => setFormUsuario({...formUsuario, DIA_PAGAMENTO: text})}
                                        placeholder="Dia"
                                        placeholderTextColor="#f0efff9e"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.buttonGroup}>
                                <Pressable
                                    onPress={() => setEditandoPerfil(false)}
                                    style={({ pressed }) => [
                                        styles.cancelButton,
                                        {
                                            opacity: pressed ? 0.85 : 1
                                        }
                                    ]}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </Pressable>

                                <Pressable
                                    onPress={handleAtualizarPerfil}
                                    style={({ pressed }) => [
                                        styles.saveButton,
                                        {
                                            opacity: pressed ? 0.85 : 1
                                        }
                                    ]}
                                >
                                    <Text style={styles.saveButtonText}>Salvar</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>

              
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Meus Cartões</Text>

                    <Pressable
                        onPress={handleCadastrarCartao}
                        style={({ pressed }) => [
                            styles.addCardButton,
                            {
                                opacity: pressed ? 0.85 : 1
                            }
                        ]}
                    >
                        <Text style={styles.addCardButtonText}>Cadastrar Cartão</Text>
                    </Pressable>

                    {cartoes.length === 0 ? (
                        <Text style={styles.noCardsText}>Nenhum cartão cadastrado</Text>
                    ) : (
                        cartoes.map((cartao, index) => (
                            <View key={index} style={styles.cardContainer}>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardTitle}>{cartao.NOME_TITULAR}</Text>
                                    <Text style={styles.cardNumber}>{formatarNumeroCartao(cartao.NUMERO)}</Text>
                                    <Text style={styles.cardDetails}>
                                        {cartao.TIPO} | Vencimento: {formatarValidade(cartao.VALIDADE)}
                                    </Text>
                                    <Text style={[styles.cardStatus, cartao.STATUS === 'A' ? styles.activeStatus : styles.inactiveStatus]}>
                                        {cartao.STATUS === 'A' ? 'Ativo' : 'Inativo'}
                                    </Text>
                                </View>

                                <View style={styles.cardButtons}>
                                    <Pressable
                                        onPress={() => handleEditarCartao(cartao)}
                                        style={({ pressed }) => [
                                            styles.cardButton,
                                            styles.editCardButton,
                                            {
                                                opacity: pressed ? 0.85 : 1
                                            }
                                        ]}
                                    >
                                        <Text style={styles.cardButtonText}>Editar</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={() => handleAtualizarStatusCartao(cartao)}
                                        style={({ pressed }) => [
                                            styles.cardButton,
                                            cartao.STATUS === 'A' ? styles.deactivateButton : styles.activateButton,
                                            {
                                                opacity: pressed ? 0.85 : 1
                                            }
                                        ]}
                                    >
                                        <Text style={styles.cardButtonText}>
                                            {cartao.STATUS === 'A' ? 'Desativar' : 'Ativar'}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    )}
                </View>

             
                <Modal
                    visible={modalCartaoVisivel}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setModalCartaoVisivel(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>
                                {editandoCartao ? 'Editar Cartão' : 'Cadastrar Cartão'}
                            </Text>

                            <ScrollView style={styles.modalForm}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Nome do Titular</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formCartao.NOME_TITULAR}
                                        onChangeText={(text) => setFormCartao({...formCartao, NOME_TITULAR: text})}
                                        placeholder="Digite o nome do titular"
                                        placeholderTextColor="#f0efff9e"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Tipo</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formCartao.TIPO}
                                        onChangeText={(text) => setFormCartao({...formCartao, TIPO: text})}
                                        placeholder="Ex: Crédito, Débito"
                                        placeholderTextColor="#f0efff9e"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Agência</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formCartao.AGENCIA}
                                        onChangeText={(text) => setFormCartao({...formCartao, AGENCIA: text})}
                                        placeholder="Digite a agência"
                                        placeholderTextColor="#f0efff9e"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Número do Cartão</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formCartao.NUMERO}
                                        onChangeText={(text) => setFormCartao({...formCartao, NUMERO: text})}
                                        placeholder="Digite o número do cartão"
                                        placeholderTextColor="#f0efff9e"
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.formRow}>
                                    <View style={[styles.formGroup, { flex: 1, marginRight: 5 }]}>
                                        <Text style={styles.label}>CVV</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formCartao.CVV}
                                            onChangeText={(text) => setFormCartao({...formCartao, CVV: text})}
                                            placeholder="CVV"
                                            placeholderTextColor="#f0efff9e"
                                            keyboardType="numeric"
                                            secureTextEntry
                                        />
                                    </View>

                                    <View style={[styles.formGroup, { flex: 1, marginLeft: 5 }]}>
                                        <Text style={styles.label}>Validade</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formCartao.VALIDADE}
                                            onChangeText={(text) => setFormCartao({...formCartao, VALIDADE: text})}
                                            placeholder="MM/AA"
                                            placeholderTextColor="#f0efff9e"
                                        />
                                    </View>
                                </View>

                                <View style={styles.modalButtonGroup}>
                                    <Pressable
                                        onPress={() => setModalCartaoVisivel(false)}
                                        style={({ pressed }) => [
                                            styles.cancelButton,
                                            {
                                                opacity: pressed ? 0.85 : 1
                                            }
                                        ]}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={handleSalvarCartao}
                                        style={({ pressed }) => [
                                            styles.saveButton,
                                            {
                                                opacity: pressed ? 0.85 : 1
                                            }
                                        ]}
                                    >
                                        <Text style={styles.saveButtonText}>
                                            {editandoCartao ? 'Atualizar' : 'Cadastrar'}
                                        </Text>
                                    </Pressable>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },

    sectionContainer: {
        marginBottom: 30,
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },


    profileInfoContainer: {
        backgroundColor: '#212e47ea',
        borderRadius: 10,
        padding: 15,
        borderWidth: 1.77,
        borderColor: '#8e939e73',
    },

    infoRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },

    infoLabel: {
        color: '#8E939E',
        fontSize: 14,
        width: 150,
    },

    infoValue: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
    },

    editButton: {
        width: '100%',
        height: 45,
        backgroundColor: '#5B25DA',
        borderRadius: 10,
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },

    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    formContainer: {
        backgroundColor: '#212e47ea',
        borderRadius: 10,
        padding: 15,
        borderWidth: 1.77,
        borderColor: '#8e939e73',
    },

    formRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },

    formGroup: {
        marginBottom: 10,
        flex: 1,
    },

    label: {
        color: '#8E939E',
        fontSize: 14,
        marginBottom: 5,
    },

    input: {
        width: '100%',
        height: 45,
        backgroundColor: '#212e47ea',
        borderColor: '#8e939e73',
        borderRadius: 10,
        borderWidth: 1.77,
        paddingHorizontal: 10,
        color: '#fff',
    },

    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },

    cancelButton: {
        width: '48%',
        height: 45,
        backgroundColor: '#333',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    saveButton: {
        width: '48%',
        height: 45,
        backgroundColor: '#5B25DA',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Estilos para cartões
    addCardButton: {
        width: '100%',
        height: 45,
        backgroundColor: '#5B25DA',
        borderRadius: 10,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },

    addCardButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    noCardsText: {
        color: '#8E939E',
        textAlign: 'center',
        marginTop: 10,
    },

    cardContainer: {
        backgroundColor: '#212e47ea',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1.77,
        borderColor: '#8e939e73',
    },

    cardInfo: {
        marginBottom: 10,
    },

    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },

    cardNumber: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 5,
    },

    cardDetails: {
        color: '#8E939E',
        fontSize: 12,
        marginBottom: 5,
    },

    cardStatus: {
        fontSize: 12,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 5,
        alignSelf: 'flex-start',
    },

    activeStatus: {
        backgroundColor: '#4CAF50',
        color: '#fff',
    },

    inactiveStatus: {
        backgroundColor: '#F44336',
        color: '#fff',
    },

    cardButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

    cardButton: {
        height: 35,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
        marginLeft: 10,
    },

    editCardButton: {
        backgroundColor: '#2196F3',
    },

    deactivateButton: {
        backgroundColor: '#F44336',
    },

    activateButton: {
        backgroundColor: '#4CAF50',
    },

    cardButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },

    // Estilos para modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#1a1a2e',
        borderRadius: 15,
        padding: 20,
        borderWidth: 1.77,
        borderColor: '#8e939e73',
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },

    modalForm: {
        flex: 1,
    },

    modalButtonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
});

export default PerfilUsuario;