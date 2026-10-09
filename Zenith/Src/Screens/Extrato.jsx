import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    ActivityIndicator, Alert, Modal, TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';



const API = 'http://10.0.2.2:3001';

const CATEGORIAS = {
    gastos: [
        { chave: 'fixos', titulo: 'Gastos fixos', rota: '/api/listar-id-gastos', tipo: 'gasto-fixo' },
        { chave: 'variados', titulo: 'Gastos variados', rota: '/api/listar-id-gastos', tipo: 'gasto-variado' },
        { chave: 'parcelas', titulo: 'Gastos parcelados', rota: '/api/listar-id-parcelas', tipo: 'parcela' }
    ],
    ganhos: [
        { chave: 'ganhosFixos', titulo: 'Ganhos fixos', rota: '/api/listar-id-ganhos', tipo: 'ganho-fixo' },
        { chave: 'ganhosVariados', titulo: 'Ganhos variados', rota: '/api/listar-id-ganhos', tipo: 'ganho-variado' }
    ],
    investimentos: [
        { chave: 'investimentos', titulo: 'Investimentos', rota: '/api/listar-id-investimentos', tipo: 'investimento' },
        { chave: 'reserva', titulo: 'Reserva de emergência', rota: '/api/listar-id-reserva', tipo: 'reserva' }
    ]
};


const TELAS_EDICAO = {
    'gasto-fixo': 'AtualizarGastosFixos',
    'gasto-variado': 'AtualizarGastosVariaveis',
    'ganho-fixo': 'AtualizarGanhosFixos',
    'ganho-variado': 'AtualizarGanhosVariados',
    investimento: 'AtualizarInvestimentos',
    reserva: 'AtualizarReservaEmergencia'
};


const ROTAS_EXCLUSAO = {
    'gasto-fixo': '/api/deletar-gastos/',
    'gasto-variado': '/api/deletar-gastos/',
    parcela: '/api/deletar-parcelas/',
    'ganho-fixo': '/api/deletar-ganhos/',
    'ganho-variado': '/api/deletar-ganhos/',
    investimento: '/api/deletar-investimentos/',
    reserva: '/api/deletar-reserva/'
};


const ROTAS_SITUACAO = {
    'gasto-fixo': '/api/atualizar-situacao-gastos/',
    'gasto-variado': '/api/atualizar-situacao-gastos/',
    parcela: '/api/atualizar-situacao-parcelas/',
    'ganho-fixo': '/api/atualizar-situacao-ganhos/',
    'ganho-variado': '/api/atualizar-situacao-ganhos/',
    investimento: '/api/atualizar-situacao-investimentos/',
    reserva: '/api/atualizar-situacao-reserva/'
};


const BOTOES_CADASTRO = {
    gastos: [
        { estilo: 'blue', titulo: 'Gasto variado', tela: 'CadastroGastosVariaveis' },
        { estilo: 'purple', titulo: 'Parcelado', tela: 'CadastroGastosParcelados' }
    ],
    ganhos: [
        { estilo: 'blue', titulo: 'Ganho fixo', tela: 'CadastroGanhosFixos' },
        { estilo: 'purple', titulo: 'Ganho variado', tela: 'CadastroGanhosVariaveis' }
    ],
    investimentos: [
        { estilo: 'blue', titulo: 'Investimento', tela: 'CadastroInvestimentos' },
        { estilo: 'purple', titulo: 'Reserva', tela: 'CadastroReservaEmergencia' }
    ]
};

const SITUACOES_CONCLUIDAS = ['P', 'PAGO', 'RECEBIDO'];


const pegarId = (item) => item.ID_EXTRATO ?? item.id_extrato ?? item.ID ?? item.id ?? null;

const formatarValor = (valor) => {
    const numero = Number(String(valor ?? 0).replace(',', '.'));
    return Number.isFinite(numero)
        ? numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : 'R$ 0,00';
};

const formatarData = (data) => {
    if (!data) return '';
    const texto = String(data).split('T')[0];
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return texto;
    const partes = texto.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : texto;
};

const validarData = (dataInformada) => {
    const partes = dataInformada.trim().split('/');
    return (
        partes.length === 3 &&
        partes[0].length === 2 && partes[1].length === 2 && partes[2].length === 4 &&
        Number(partes[0]) >= 1 && Number(partes[0]) <= 31 &&
        Number(partes[1]) >= 1 && Number(partes[1]) <= 12
    );
};

const paraISO = (dataInformada) => {
    const [dia, mes, ano] = dataInformada.trim().split('/');
    return `${ano}-${mes}-${dia}`;
};


export default function Extrato({ navigation }) {
   
    const [aba, setAba] = useState('gastos');
    const [registros, setRegistros] = useState({});
    const [abertas, setAbertas] = useState({});
    const [carregando, setCarregando] = useState(true);
    const [usuarioId, setUsuarioId] = useState(null);
    const [token, setToken] = useState(null);
    const [modalVisivel, setModalVisivel] = useState(false);
    const [dataInformada, setDataInformada] = useState('');
    const [acao, setAcao] = useState(null);

    const configAuth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    const carregarExtrato = async () => {
        try {
            setCarregando(true);
            const id = await AsyncStorage.getItem('idUsuario');
            const tokenSalvo = await AsyncStorage.getItem('acessToken');

            if (!id) {
                Alert.alert('Sessão não encontrada', 'Entre novamente na sua conta para consultar o extrato.');
                return;
            }

            setUsuarioId(id);
            setToken(tokenSalvo);
            const config = tokenSalvo ? { headers: { Authorization: `Bearer ${tokenSalvo}` } } : {};
            const categorias = Object.values(CATEGORIAS).flat();

            const respostas = await Promise.all(categorias.map(async (categoria) => {
                try {
                    const resposta = await axios.get(`${API}${categoria.rota}/${id}`, config);
                    return [categoria.chave, Array.isArray(resposta.data) ? resposta.data : []];
                } catch (erro) {
                    if (erro.response?.status !== 404) console.log(erro.message);
                    return [categoria.chave, []];
                }
            }));

            setRegistros(Object.fromEntries(respostas));
        } catch (erro) {
            Alert.alert('Erro', 'Não foi possível carregar o extrato.');
        } finally {
            setCarregando(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            carregarExtrato();
        }, [])
    );

    
    const abrirCategoria = (chave) => {
        setAbertas((estado) => ({ ...estado, [chave]: !estado[chave] }));
    };

    const excluirRegistro = async (categoria, id) => {
        try {
            await axios.delete(`${API}${ROTAS_EXCLUSAO[categoria.tipo]}${id}`, configAuth);
            Alert.alert('Registro excluído', 'O extrato foi atualizado.');
            carregarExtrato();
        } catch {
            Alert.alert('Não foi possível excluir', 'O servidor não confirmou a exclusão.');
        }
    };

    const editarRegistro = (categoria, item) => {
        const tela = TELAS_EDICAO[categoria.tipo];

        if (!tela) {
            Alert.alert('Indisponível', 'A edição desta categoria ainda não está disponível.');
            return;
        }

        navigation.navigate(tela, { registro: item });
    };

    const iniciarAcao = (tipoAcao, categoria, item) => {
        const id = pegarId(item);

        if (!id) {
            Alert.alert(
                'Identificador não encontrado',
                'Este registro não possui um identificador disponível. Não é possível continuar com segurança.'
            );
            return;
        }

        if (tipoAcao === 'editar') {
            editarRegistro(categoria, item);
            return;
        }

        if (tipoAcao === 'excluir') {
            Alert.alert('Excluir registro', 'Deseja realmente excluir este registro?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', style: 'destructive', onPress: () => excluirRegistro(categoria, id) }
            ]);
            return;
        }

        setAcao({ tipoAcao, categoria, id });
        setDataInformada('');
        setModalVisivel(true);
    };

    const atualizarSituacao = async (dataISO) => {
        if (!acao) return;

        try {
            await axios.put(
                `${API}${ROTAS_SITUACAO[acao.categoria.tipo]}${acao.id}`,
                { DATA_PAGO: dataISO, USUARIO_ID: usuarioId },
                configAuth
            );

            setModalVisivel(false);
            setAcao(null);
            Alert.alert('Atualizado', 'O servidor confirmou a atualização do registro.');
            carregarExtrato();
        } catch {
            Alert.alert('Não foi possível atualizar', 'O registro continua com a situação anterior.');
        }
    };

    const confirmarData = () => {
        if (!validarData(dataInformada)) {
            Alert.alert('Data inválida', 'Informe a data no formato DD/MM/AAAA.');
            return;
        }

        const recebimento = acao?.tipoAcao === 'receber';

        Alert.alert(
            'Confirmar',
            `Deseja confirmar o ${recebimento ? 'recebimento' : 'pagamento'} em ${dataInformada}?`,
            [
                { text: 'Voltar', style: 'cancel' },
                { text: 'Confirmar', onPress: () => atualizarSituacao(paraISO(dataInformada)) }
            ]
        );
    };

  
    const renderRegistro = (item, categoria, indice) => {
        const nome = item.NOME_REAL || item.NOME || item.nome || 'Registro financeiro';
        const valor = item.VALOR_REAL ?? item.VALOR ?? item.valor ?? 0;
        const situacao = String(item.SITUACAO || '').toUpperCase();
        const concluido = SITUACOES_CONCLUIDAS.includes(situacao);
        const ganho = categoria.tipo.startsWith('ganho');
        const data = concluido ? formatarData(item.DATA_PAGO) : '';
        const id = pegarId(item);

        return (
            <View key={`${categoria.chave}-${id || indice}`} style={styles.registro}>
                <View style={styles.linha}>
                    <View style={styles.nomeArea}>
                        <Text style={styles.nome}>{nome}</Text>
                        {!!(item.DESCRICAO_REAL || item.DESCRICAO) && (
                            <Text style={styles.descricao}>{item.DESCRICAO_REAL || item.DESCRICAO}</Text>
                        )}
                    </View>
                    <Text style={[styles.valor, { color: ganho ? '#2ED47A' : '#FF5B7F' }]}>
                        {ganho ? '+' : '-'}{formatarValor(valor)}
                    </Text>
                </View>

                {!!item.MES_ANO && <Text style={styles.detalhe}>Mês: {item.MES_ANO}</Text>}

                {categoria.tipo === 'parcela' && item.PARCELA_ATUAL != null && (
                    <Text style={styles.detalhe}>
                        Parcela {item.PARCELA_ATUAL} de {item.TOTAL_PARCELAS}
                    </Text>
                )}

                {categoria.tipo === 'parcela' && item.DIA_VENCIMENTO != null && (
                    <Text style={styles.detalhe}>Vencimento: dia {item.DIA_VENCIMENTO}</Text>
                )}

                {(categoria.tipo === 'investimento' || categoria.tipo === 'reserva') && item.VALOR_GUARDADO != null && (
                    <Text style={styles.detalhe}>Guardado: {formatarValor(item.VALOR_GUARDADO)}</Text>
                )}

                {categoria.tipo === 'investimento' && item.DIA_APLICACAO != null && (
                    <Text style={styles.detalhe}>Aplicação: dia {item.DIA_APLICACAO}</Text>
                )}

                <View style={styles.rodapeRegistro}>
                    <View style={[styles.status, concluido ? styles.statusPago : styles.statusPendente]}>
                        <Text style={[styles.textoStatus, concluido ? styles.textoPago : styles.textoPendente]}>
                            {concluido ? (data ? `Pago ${data}` : 'Pago') : 'Pendente'}
                        </Text>
                    </View>

                    <View style={styles.acoes}>
                        {!concluido && (
                            <Pressable style={styles.botaoEditar} onPress={() => iniciarAcao('editar', categoria, item)}>
                                <Text style={styles.textoEditar}>Editar</Text>
                            </Pressable>
                        )}
                        {!concluido && (
                            <Pressable style={styles.botaoExcluir} onPress={() => iniciarAcao('excluir', categoria, item)}>
                                <Text style={styles.textoExcluir}>Excluir</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {!concluido && (
                    <Pressable
                        style={[styles.botaoConcluir, ganho && styles.botaoReceber]}
                        onPress={() => iniciarAcao(ganho ? 'receber' : 'pagar', categoria, item)}
                    >
                        <Text style={styles.textoConcluir}>
                            {ganho ? 'Confirmar recebimento' : 'Confirmar pagamento'}
                        </Text>
                    </Pressable>
                )}
            </View>
        );
    };

    const renderCategoria = (categoria) => {
        const lista = registros[categoria.chave] || [];
        const aberta = !!abertas[categoria.chave];

        return (
            <View key={categoria.chave} style={styles.categoria}>
                <Pressable style={styles.cabecalhoCategoria} onPress={() => abrirCategoria(categoria.chave)}>
                    <View>
                        <Text style={[styles.tituloCategoria, aberta && styles.tituloCategoriaAberta]}>
                            {categoria.titulo}
                        </Text>
                        <Text style={styles.contagem}>{lista.length} registro(s)</Text>
                    </View>
                    <Text style={[styles.seta, aberta && styles.setaAberta]}>{aberta ? '▲' : '▼'}</Text>
                </Pressable>

                {aberta && (
                    <View style={styles.lista}>
                        {lista.length
                            ? lista.map((item, indice) => renderRegistro(item, categoria, indice))
                            : <Text style={styles.vazio}>Nenhum registro nesta categoria.</Text>}
                    </View>
                )}
            </View>
        );
    };

   
    return (
        <View style={styles.fundo}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.overlay}>
                {/* CABEÇALHO DO APP */}
                <View style={styles.cabecalho}>
                    <View>
                        <Text style={styles.titulo}>Extrato</Text>
                        <Text style={styles.subtitulo}>Resumo dos seus lançamentos financeiros</Text>
                    </View>
                    <Pressable style={styles.atualizar} onPress={carregarExtrato}>
                        <Text style={styles.iconeAtualizar}>⟳</Text>
                    </Pressable>
                </View>

             
                <View style={styles.containerCentral}>
                 
                    <View style={styles.rowCentralHeader}>
                        <Text style={styles.tituloCentral}>
                            {aba === 'gastos' ? 'Meus gastos' : aba === 'ganhos' ? 'Meus ganhos' : 'Investimentos'}
                        </Text>
                        <View style={styles.botoesCadastroArea}>
                            {(BOTOES_CADASTRO[aba] || []).map((botao) => (
                                <Pressable
                                    key={botao.tela}
                                    style={botao.estilo === 'blue' ? styles.btnCadastroBlue : styles.btnCadastroPurple}
                                    onPress={() => navigation.navigate(botao.tela)}
                                >
                                    <Text style={botao.estilo === 'blue' ? styles.txtCadastroBlue : styles.txtCadastroPurple}>
                                        {botao.titulo}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

              
                    <View style={styles.abas}>
                        <Pressable style={[styles.aba, aba === 'gastos' && styles.abaAtiva]} onPress={() => setAba('gastos')}>
                            <Text style={[styles.textoAba, aba === 'gastos' && styles.textoAbaAtivo]}>Gastos</Text>
                        </Pressable>
                        <Pressable style={[styles.aba, aba === 'ganhos' && styles.abaAtiva]} onPress={() => setAba('ganhos')}>
                            <Text style={[styles.textoAba, aba === 'ganhos' && styles.textoAbaAtivo]}>Ganhos</Text>
                        </Pressable>
                        <Pressable style={[styles.aba, aba === 'investimentos' && styles.abaAtiva]} onPress={() => setAba('investimentos')}>
                            <Text style={[styles.textoAba, aba === 'investimentos' && styles.textoAbaAtivo]}>Investimentos</Text>
                        </Pressable>
                    </View>

              
                    {carregando ? (
                        <View style={styles.carregando}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text style={styles.textoCarregando}>Carregando extrato...</Text>
                        </View>
                    ) : (
                        <View style={styles.conteudoScroll}>
                            {(CATEGORIAS[aba] || []).map(renderCategoria)}
                            
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal visible={modalVisivel} transparent animationType="fade" onRequestClose={() => setModalVisivel(false)}>
                <View style={styles.fundoModal}>
                    <View style={styles.modal}>
                        <Text style={styles.tituloModal}>
                            {acao?.tipoAcao === 'receber' ? 'Confirmar recebimento' : 'Confirmar pagamento'}
                        </Text>
                        <Text style={styles.subtituloModal}>Informe a data no formato DD/MM/AAAA.</Text>

                        <TextInput
                            style={styles.inputData}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor="#64748b"
                            value={dataInformada}
                            onChangeText={setDataInformada}
                            keyboardType="numeric"
                            maxLength={10}
                        />

                        <View style={styles.botoesModal}>
                            <Pressable style={styles.botaoCancelar} onPress={() => setModalVisivel(false)}>
                                <Text style={styles.textoCancelar}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={styles.botaoConfirmar} onPress={confirmarData}>
                                <Text style={styles.textoConfirmar}>Continuar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
  
    fundo: { flex: 1, 
        backgroundColor: '#0d0f14' 
    },
    overlay: { 
    paddingTop: 48, 
    paddingHorizontal: 16 
},
    scroll: { 
        flex: 1 
    },
    conteudoScroll: { 
        paddingBottom: 16
     },
    cabecalho: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16, 
        paddingHorizontal: 4 
    },
    titulo: { 
        color: '#FFFFFF', 
        fontSize: 26, 
        fontWeight: '700' 
    },
    subtitulo: { 
        color: '#9ba4b4', fontSize: 12, marginTop: 2 },
    atualizar: { padding: 6 },
    iconeAtualizar: { color: '#9ba4b4', fontSize: 22 },

    
    containerCentral: { flex: 1, backgroundColor: '#161a23', borderRadius: 20, borderWidth: 1, borderColor: '#242b3d', padding: 16 },
    rowCentralHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    tituloCentral: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
    botoesCadastroArea: { flexDirection: 'row', gap: 6 },

   
    btnCadastroBlue: { backgroundColor: '#242b3d', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    txtCadastroBlue: { color: '#60a5fa', fontSize: 10, fontWeight: '600' },
    btnCadastroPurple: { backgroundColor: '#211933', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    txtCadastroPurple: { color: '#a78bfa', fontSize: 10, fontWeight: '600' },

    abas: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#242b3d', marginBottom: 16 },
    aba: { flex: 1, paddingBottom: 10 },
    abaAtiva: { borderBottomWidth: 2, borderBottomColor: '#3b82f6' },
    textoAba: { color: '#9ba4b4', fontSize: 12, fontWeight: '500', textAlign: 'center' },
    textoAbaAtivo: { color: '#3b82f6' },


    categoria: { marginBottom: 10 },
    cabecalhoCategoria: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1c212d', borderWidth: 1, borderColor: '#242b3d', borderRadius: 12, padding: 14 },
    tituloCategoria: { color: '#e2e8f0', fontSize: 13, fontWeight: '500' },
    tituloCategoriaAberta: { color: '#818cf8' },
    contagem: { color: '#64748b', fontSize: 10, marginTop: 2 },
    seta: { color: '#64748b', fontSize: 12 },
    setaAberta: { color: '#818cf8' },
    lista: { marginTop: 6, paddingHorizontal: 2, gap: 8 },
    vazio: { color: '#64748b', fontSize: 11, textAlign: 'center', paddingVertical: 8 },

    registro: { backgroundColor: '#1e2433', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(36, 43, 61, 0.6)', padding: 14, marginTop: 2 },
    linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    nomeArea: { flex: 1, paddingRight: 8 },
    nome: { color: '#f1f5f9', fontSize: 13, fontWeight: '600' },
    descricao: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
    valor: { fontSize: 13, fontWeight: '700' },
    detalhe: { color: '#64748b', fontSize: 11, marginTop: 4 },


    rodapeRegistro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' },
    status: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
    statusPendente: { backgroundColor: 'rgba(255, 91, 127, 0.1)', borderColor: 'rgba(255, 91, 127, 0.2)' },
    statusPago: { backgroundColor: 'rgba(46, 212, 122, 0.1)', borderColor: 'rgba(46, 212, 122, 0.2)' },
    textoStatus: { fontSize: 10, fontWeight: '500' },
    textoPendente: { color: '#FF5B7F' },
    textoPago: { color: '#2ED47A' },

    acoes: { flexDirection: 'row', gap: 6 },
    botaoEditar: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    textoEditar: { color: '#60a5fa', fontSize: 10, fontWeight: '500' },
    botaoExcluir: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    textoExcluir: { color: '#f87171', fontSize: 10, fontWeight: '500' },
    botaoConcluir: { backgroundColor: '#242b3d', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 10 },
    botaoReceber: { backgroundColor: '#1b2c26', borderWidth: 1, borderColor: 'rgba(46, 212, 122, 0.2)' },
    textoConcluir: { color: '#e2e8f0', fontSize: 11, fontWeight: '500' },

    carregando: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    textoCarregando: { color: '#94a3b8', marginTop: 8, fontSize: 12 },
    rodape: { color: '#475569', textAlign: 'center', fontSize: 10, marginTop: 20, marginBottom: 10 },


    fundoModal: { flex: 1, backgroundColor: 'rgba(5, 5, 8, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modal: { backgroundColor: '#161a23', borderRadius: 16, borderWidth: 1, borderColor: '#242b3d', padding: 20, width: '100%', maxWidth: 320 },
    tituloModal: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
    subtituloModal: { color: '#94a3b8', fontSize: 12, marginBottom: 16 },
    inputData: { backgroundColor: '#0d0f14', borderWidth: 1, borderColor: '#242b3d', borderRadius: 8, padding: 12, color: '#ffffff', fontSize: 14, marginBottom: 16 },
    botoesModal: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    botaoCancelar: { paddingHorizontal: 14, paddingVertical: 8 },
    textoCancelar: { color: '#94a3b8', fontSize: 13 },
    botaoConfirmar: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    textoConfirmar: { color: '#ffffff', fontSize: 13, fontWeight: '600' },

    tabBarInferior: { backgroundColor: '#161a23', borderWidth: 1, borderColor: '#242b3d', borderRadius: 16, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 56, marginBottom: 12, marginTop: 10 },
    iconBar: { padding: 8 },
    iconBarAtivo: { backgroundColor: '#4d5bf7', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
    txtIconBar: { fontSize: 18, opacity: 0.6 },
    txtIconBarAtivo: { fontSize: 18 }
});