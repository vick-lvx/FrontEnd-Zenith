import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    ActivityIndicator, Alert, Modal, TextInput, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const API = 'http://10.0.2.2:3001';


const CATEGORIAS = {
    gastos: [
        { chave: 'fixos', titulo: 'Gastos fixos', rota: '/api/listar-id-gastos', tipo: 'GASTO_FIXO', icone: 'calendar-outline' },
        { chave: 'variados', titulo: 'Gastos variados', rota: '/api/listar-id-gastos', tipo: 'GASTO_VARIAVEL', icone: 'cash-outline' },
        { chave: 'parcelas', titulo: 'Gastos parcelados', rota: '/api/listar-id-parcelas', tipo: 'PARCELA', icone: 'layers-outline' }
    ],
    ganhos: [
        { chave: 'fixos', titulo: 'Ganhos fixos', rota: '/api/listar-id-ganhos', tipo: 'GANHO_FIXO', icone: 'calendar-outline' },
        { chave: 'variados', titulo: 'Ganhos variados', rota: '/api/listar-id-ganhos', tipo: 'GANHO_VARIAVEL', icone: 'cash-outline' }
    ],
    investimentos: [
        { chave: 'investimentos', titulo: 'Investimentos', rota: '/api/listar-id-investimentos', tipo: 'INVESTIMENTO', icone: 'trending-up-outline' },
        { chave: 'reserva', titulo: 'Reserva de emergência', rota: '/api/listar-id-reserva', tipo: 'RESERVA', icone: 'shield-checkmark-outline' }
    ]
};

const TELAS_EDICAO = {
    'gasto-fixo': 'AtualizarGastosFixos',
    'gasto-variado': 'AtualizarGastosVariaveis',
    'ganho-fixo': 'AtualizarGanhosFixos',
    'ganho-variado': 'AtualizarGanhosVariados',
    'investimento': 'AtualizarInvestimentos',
    'reserva': 'AtualizarReservaEmergencia'

    'GASTO_FIXO': 'AtualizarGastosFixos',
    'GASTO_VARIAVEL': 'AtualizarGastosVariaveis',
    'PARCELA': 'AtualizarGastosParcelados',
    'GANHO_FIXO': 'AtualizarGanhosFixos',
    'GANHO_VARIAVEL': 'AtualizarGanhosVariados',
    'INVESTIMENTO': 'AtualizarInvestimentos',
    'RESERVA': 'AtualizarReservaEmergencia'

};

const TELAS_CADASTRO = {
    'GASTO_FIXO': 'CadastroGastosFixosV',
    'GASTO_VARIAVEL': 'CadastroGastosVariaveis',
    'PARCELA': 'CadastroGastosParcelados',
    'GANHO_FIXO': 'CadastroGanhosFixos',
    'GANHO_VARIAVEL': 'CadastroGanhosVariaveis',
    'INVESTIMENTO': 'CadastroInvestimentos',
    'RESERVA': 'CadastroReservaEmergencia'
};

const ROTAS_EXCLUSAO = {
    'gasto-fixo': '/api/deletar-gastos/',
    'gasto-variado': '/api/deletar-gastos/',
    'parcela': '/api/deletar-parcelas/',
    'ganho-fixo': '/api/deletar-ganhos/',
    'ganho-variado': '/api/deletar-ganhos/',
    investimento: '/api/deletar-investimentos/',
    reserva: '/api/deletar-reserva/'

    'GASTO_FIXO': '/api/deletar-gastos-futuros/',
    'GASTO_VARIAVEL': '/api/deletar-gastos-futuros/',
    'PARCELA': '/api/deletar-parcelas-futuras/',
    'GANHO_FIXO': '/api/deletar-ganhos-futuros/',
    'GANHO_VARIAVEL': '/api/deletar-ganhos-futuros/',
    'INVESTIMENTO': '/api/deletar-investimentos-futuros/',
    'RESERVA': '/api/deletar-reservas-futuras/'
};

const ROTAS_SITUACAO = {
    'GASTO_FIXO': '/api/atualizar-situacao-gastos/',
    'GASTO_VARIAVEL': '/api/atualizar-situacao-gastos/',
    'PARCELA': '/api/atualizar-situacao-parcelas/',
    'GANHO_FIXO': '/api/atualizar-situacao-ganhos/',
    'GANHO_VARIAVEL': '/api/atualizar-situacao-ganhos/',
    'INVESTIMENTO': '/api/atualizar-situacao-investimentos/',
    'RESERVA': '/api/atualizar-situacao-reserva/'
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

// Função para filtrar registros por tipo
const filtrarPorTipo = (registros, tipo) => {
    if (!registros || !Array.isArray(registros)) return [];
    return registros.filter(item => {
        const itemTipo = item.TIPO_REGISTRO || item.tipo_registro || '';
        return itemTipo === tipo;
    });
};

export default function Extrato({ navigation }) {
    const [aba, setAba] = useState('gastos');
    const [subCategoriaSelecionada, setSubCategoriaSelecionada] = useState(null);
    const [registros, setRegistros] = useState({});
    const [abertas, setAbertas] = useState({});
    const [carregando, setCarregando] = useState(true);
    const [usuarioId, setUsuarioId] = useState(null);
    const [token, setToken] = useState(null);
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalExclusaoVisivel, setModalExclusaoVisivel] = useState(false);
    const [dataInformada, setDataInformada] = useState('');
    const [acao, setAcao] = useState(null);
    const [itemParaExcluir, setItemParaExcluir] = useState(null);
    const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);

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

    const selecionaSubCategoria = (categoria) => {
        setSubCategoriaSelecionada(subCategoriaSelecionada === categoria.chave ? null : categoria.chave);
    };

    const excluirRegistro = async (categoria, id, deletarTodos) => {
        try {
            const endpoint = ROTAS_EXCLUSAO[categoria.tipo];
            await axios.delete(`${API}${endpoint}${id}`, configAuth);
            Alert.alert('Registro excluído', deletarTodos ? 'Todos os registros futuros foram removidos.' : 'O registro foi removido.');
            carregarExtrato();
        } catch (erro) {
            console.log('Erro ao excluir:', erro);
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
            setItemParaExcluir(id);
            setCategoriaParaExcluir(categoria);
            setModalExclusaoVisivel(true);
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
        } catch (erro) {
            console.log('Erro ao atualizar situação:', erro);
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

    const confirmarExclusao = (deletarTodos) => {
        setModalExclusaoVisivel(false);
        if (itemParaExcluir && categoriaParaExcluir) {
            Alert.alert(
                'Confirmar exclusão',
                deletarTodos ? 'Deseja deletar este registro e todos os futuros?' : 'Deseja deletar apenas este registro?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Confirmar',
                        style: 'destructive',
                        onPress: () => excluirRegistro(categoriaParaExcluir, itemParaExcluir, deletarTodos)
                    }
                ]
            );
        }
    };

    const renderRegistro = (item, categoria, indice) => {
        const nome = item.NOME_REAL || item.NOME || item.nome || 'Registro financeiro';
        const valor = item.VALOR_REAL ?? item.VALOR ?? item.valor ?? 0;
        const situacao = String(item.SITUACAO || '').toUpperCase();
        const concluido = SITUACOES_CONCLUIDAS.includes(situacao);
        const ganho = categoria.tipo.startsWith('GANHO');
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

                {categoria.tipo === 'PARCELA' && item.PARCELA_ATUAL != null && (
                    <Text style={styles.detalhe}>
                        Parcela {item.PARCELA_ATUAL} de {item.TOTAL_PARCELAS}
                    </Text>
                )}

                {categoria.tipo === 'PARCELA' && item.DIA_VENCIMENTO != null && (
                    <Text style={styles.detalhe}>Vencimento: dia {item.DIA_VENCIMENTO}</Text>
                )}

                {(categoria.tipo === 'INVESTIMENTO' || categoria.tipo === 'RESERVA') && item.VALOR_GUARDADO != null && (
                    <Text style={styles.detalhe}>Guardado: {formatarValor(item.VALOR_GUARDADO)}</Text>
                )}

                {categoria.tipo === 'INVESTIMENTO' && item.DIA_APLICACAO != null && (
                    <Text style={styles.detalhe}>Aplicação: dia {item.DIA_APLICACAO}</Text>
                )}

                {categoria.tipo === 'PARCELA' && item.AGENCIA && (
                    <Text style={styles.detalhe}>Cartão: {item.AGENCIA}</Text>
                )}

                <View style={styles.rodapeRegistro}>
                    <View style={[styles.status, concluido ? styles.statusPago : styles.statusPendente]}>
                        <Text style={[styles.textoStatus, concluido ? styles.textoPago : styles.textoPendente]}>
                            {concluido ? (data ? `Pago ${data}` : 'Pago') : 'Pendente'}
                        </Text>
                    </View>

                    {!concluido && (
                        <View style={styles.acoes}>
                            <Pressable style={styles.botaoEditar} onPress={() => iniciarAcao('editar', categoria, item)}>
                                <Icon name="create-outline" size={16} color="#60a5fa" />
                                <Text style={styles.textoEditar}>Editar</Text>
                            </Pressable>
                            <Pressable style={styles.botaoExcluir} onPress={() => iniciarAcao('excluir', categoria, item)}>
                                <Icon name="trash-outline" size={16} color="#f87171" />
                                <Text style={styles.textoExcluir}>Excluir</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                {!concluido && (
                    <TouchableOpacity
                        style={[styles.botaoConcluir, ganho && styles.botaoReceber]}
                        onPress={() => iniciarAcao(ganho ? 'receber' : 'pagar', categoria, item)}
                    >
                        <Icon
                            name={ganho ? 'checkmark-circle-outline' : 'checkmark-circle-outline'}
                            size={16}
                            color="#ffffff"
                        />
                        <Text style={styles.textoConcluir}>
                            {ganho ? ' Confirmar recebimento' : ' Confirmar pagamento'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderSubCategoria = (categoria) => {
        const lista = registros[categoria.chave] || [];
        const filtrada = filtrarPorTipo(lista, categoria.tipo);
        const éSelecionada = subCategoriaSelecionada === categoria.chave;

        return (
            <View key={categoria.chave} style={styles.categoria}>
                <Pressable
                    style={[styles.cabecalhoCategoria, éSelecionada && styles.cabecalhoSelecionado]}
                    onPress={() => selecionaSubCategoria(categoria)}
                >
                    <View style={styles.cabecalhoConteudo}>
                        <Icon name={categoria.icone} size={20} color={éSelecionada ? '#3b82f6' : '#9ba4b4'} />
                        <View style={styles.tituloArea}>
                            <Text style={[styles.tituloCategoria, éSelecionada && styles.tituloCategoriaSelecionado]}>
                                {categoria.titulo}
                            </Text>
                            <Text style={styles.contagem}>{filtrada.length} registro(s)</Text>
                        </View>
                    </View>
                    <Icon
                        name={éSelecionada ? 'chevron-up-outline' : 'chevron-down-outline'}
                        size={20}
                        color={éSelecionada ? '#3b82f6' : '#9ba4b4'}
                    />
                </Pressable>

                {éSelecionada && (
                    <View style={styles.lista}>
                        {filtrada.length
                            ? filtrada.map((item, indice) => renderRegistro(item, categoria, indice))
                            : <Text style={styles.vazio}>Nenhum registro nesta categoria.</Text>}

                        <TouchableOpacity
                            style={styles.botaoCadastroSub}
                            onPress={() => navigation.navigate(TELAS_CADASTRO[categoria.tipo])}
                        >
                            <Icon name="add-outline" size={18} color="#ffffff" />
                            <Text style={styles.textoBotaoCadastroSub}>Cadastrar {categoria.titulo}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.fundo}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.overlay}>
                <View style={styles.cabecalho}>
                    <View>
                        <Text style={styles.titulo}>Extrato</Text>
                        <Text style={styles.subtitulo}>Resumo dos seus lançamentos financeiros</Text>
                    </View>
                    <Pressable style={styles.atualizar} onPress={carregarExtrato}>
                        <Icon name="sync-outline" size={24} color="#9ba4b4" />
                    </Pressable>
                </View>

                <View style={styles.containerCentral}>
                    <View style={styles.rowCentralHeader}>
                        <Text style={styles.tituloCentral}>
                            {aba === 'gastos' ? 'Meus gastos' : aba === 'ganhos' ? 'Meus ganhos' : 'Investimentos'}
                        </Text>
                    </View>

                    <View style={styles.abas}>
                        <Pressable style={[styles.aba, aba === 'gastos' && styles.abaAtiva]} onPress={() => setAba('gastos')}>
                            <Icon name="wallet-outline" size={18} color={aba === 'gastos' ? '#3b82f6' : '#9ba4b4'} />
                            <Text style={[styles.textoAba, aba === 'gastos' && styles.textoAbaAtivo]}>Gastos</Text>
                        </Pressable>
                        <Pressable style={[styles.aba, aba === 'ganhos' && styles.abaAtiva]} onPress={() => setAba('ganhos')}>
                            <Icon name="cash-outline" size={18} color={aba === 'ganhos' ? '#3b82f6' : '#9ba4b4'} />
                            <Text style={[styles.textoAba, aba === 'ganhos' && styles.textoAbaAtivo]}>Ganhos</Text>
                        </Pressable>
                        <Pressable style={[styles.aba, aba === 'investimentos' && styles.abaAtiva]} onPress={() => setAba('investimentos')}>
                            <Icon name="trending-up-outline" size={18} color={aba === 'investimentos' ? '#3b82f6' : '#9ba4b4'} />
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
                            {(CATEGORIAS[aba] || []).map(renderSubCategoria)}
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

            <Modal visible={modalExclusaoVisivel} transparent animationType="fade" onRequestClose={() => setModalExclusaoVisivel(false)}>
                <View style={styles.fundoModal}>
                    <View style={styles.modal}>
                        <Text style={styles.tituloModal}>Opções de exclusão</Text>
                        <Text style={styles.subtituloModal}>Escolha como deseja excluir este registro:</Text>

                        <View style={styles.opcoesExclusao}>
                            <TouchableOpacity
                                style={styles.opcaoExclusao}
                                onPress={() => confirmarExclusao(false)}
                            >
                                <Icon name="remove-circle-outline" size={20} color="#f87171" />
                                <Text style={styles.textoOpcao}>Deletar apenas este mês</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.opcaoExclusao}
                                onPress={() => confirmarExclusao(true)}
                            >
                                <Icon name="trash-bin-outline" size={20} color="#ef4444" />
                                <Text style={[styles.textoOpcao, {color: '#ef4444'}]}>Deletar permanentemente</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.botoesModal}>
                            <Pressable style={styles.botaoCancelar} onPress={() => setModalExclusaoVisivel(false)}>
                                <Text style={styles.textoCancelar}>Cancelar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    fundo: {
        flex: 1,
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
        color: '#9ba4b4',
        fontSize: 12,
        marginTop: 2
    },
    atualizar: {
        padding: 6
    },
<<<<<<< HEAD
    subtitulo: { 
        color: '#9ba4b4', 
        fontSize: 12, 
        marginTop: 2 
    },
    atualizar: { 
        padding: 6 
    },
    iconeAtualizar: { 
        color: '#9ba4b4', 
        fontSize: 22 
    },

    
    containerCentral: { 
        flex: 1,
        backgroundColor: '#161a23', 
        borderRadius: 20, 
        borderWidth: 1, 
        borderColor: '#242b3d', 
        padding: 16 
    },
    rowCentralHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
    },
    tituloCentral: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#ffffff' 
    },
    botoesCadastroArea: { 
        flexDirection: 'row', 
        gap: 6 
    },
    btnCadastroBlue: { 
    backgroundColor: '#242b3d', 
    borderWidth: 1, 
    borderColor: 'rgba(59, 130, 246, 0.2)', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8 
},
    txtCadastroBlue: {
    color: '#60a5fa', 
    fontSize: 10, 
    fontWeight: '600' 
},
    btnCadastroPurple: { 
        backgroundColor: '#211933', 
        borderWidth: 1, 
        borderColor: 'rgba(139, 92, 246, 0.2)', 
        paddingHorizontal: 10, 
        paddingVertical: 6, 
        borderRadius: 8 },
    txtCadastroPurple: { 
        color: '#a78bfa', 
        fontSize: 10, 
        fontWeight: '600' 
    },
    abas: { 
        flexDirection: 'row', 
        borderBottomWidth: 1, 
        borderBottomColor: '#242b3d', 
        marginBottom: 16 
    },
    aba: { 
        flex: 1, 
        paddingBottom: 10 
    },
    abaAtiva: { 
        borderBottomWidth: 2, 
        borderBottomColor: '#3b82f6' 
    },
    textoAba: {
         color: '#9ba4b4', 
         fontSize: 12, 
         fontWeight: '500', 
         textAlign: 'center' 
        },
    textoAbaAtivo: { 
        color: '#3b82f6' 
    },
    categoria: { 
        marginBottom: 10 
    },
    cabecalhoCategoria: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: '#1c212d', 
        borderWidth: 1, 
        borderColor: '#242b3d', 
        borderRadius: 12, 
        padding: 14 
    },
    tituloCategoria: { 
        color: '#e2e8f0', 
        fontSize: 13, 
        fontWeight: '500' 
    },
    tituloCategoriaAberta: { 
        color: '#818cf8' 
    },
    contagem: { 
        color: '#64748b', 
        fontSize: 10, 
        marginTop: 2 
    },
    seta: { 
        color: '#64748b', 
        fontSize: 12 
    },
    setaAberta: { 
        color: '#818cf8' 
    },
    lista: { 
        marginTop: 6, 
        paddingHorizontal: 2,
        gap: 8 },
    vazio: { 
        color: '#64748b', 
        fontSize: 11, 
        textAlign: 'center', 
        paddingVertical: 8 
    },

    registro: { 
        backgroundColor: '#1e2433', 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: 'rgba(36, 43, 61, 0.6)', 
        padding: 14, 
        marginTop: 2 },
    linha: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
    },
    nomeArea: { 
        flex: 1, 
        paddingRight: 8 
    },
    nome: { 
        color: '#f1f5f9', 
        fontSize: 13, 
        fontWeight: '600' },
    descricao: { 
        color: '#94a3b8', 
        fontSize: 11, 
        marginTop: 2 
    },
    valor: { 
        fontSize: 13, 
        fontWeight: '700' 
    },
       detalhe: { 
        color: '#64748b', 
        fontSize: 11, 
        marginTop: 4 
    },

    rodapeRegistro: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginTop: 12, 
        paddingTop: 8, 
        borderTopWidth: 1, 
        borderTopColor: 'rgba(255,255,255,0.04)' 
    },
    
    status: { 
        borderRadius: 6, 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderWidth: 1 
    },
    
    statusPendente: { 
        backgroundColor: 'rgba(255, 91, 127, 0.1)', 
        borderColor: 'rgba(255, 91, 127, 0.2)' 
    },
    
    statusPago: { 
        backgroundColor: 'rgba(46, 212, 122, 0.1)', 
        borderColor: 'rgba(46, 212, 122, 0.2)' 
    },
    
    textoStatus: { 
        fontSize: 10, 
        fontWeight: '500' 
    },
    
    textoPendente: { 
        color: '#FF5B7F' 
    },
    
    textoPago: { 
        color: '#2ED47A' 
    },

    acoes: { 
        flexDirection: 'row', 
        gap: 6 
    },
    
    botaoEditar: { 
        backgroundColor: 'rgba(59, 130, 246, 0.1)', 
        borderWidth: 1, 
        borderColor: 'rgba(59, 130, 246, 0.3)', 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 6 
    },
    
    textoEditar: { 
        color: '#60a5fa', 
        fontSize: 10, 
        fontWeight: '500' 
    },
    
    botaoExcluir: { 
        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
        borderWidth: 1, 
        borderColor: 'rgba(239, 68, 68, 0.3)', 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 6 
    },
    
    textoExcluir: { 
        color: '#f87171', 
        fontSize: 10, 
        fontWeight: '500' 
    },
    
    botaoConcluir: { 
        backgroundColor: '#242b3d', 
        borderRadius: 8, 
        paddingVertical: 8, 
        alignItems: 'center', 
        marginTop: 10 
    },
    
    botaoReceber: { 
        backgroundColor: '#1b2c26', 
        borderWidth: 1, 
        borderColor: 'rgba(46, 212, 122, 0.2)' 
    },
    
    textoConcluir: { 
        color: '#e2e8f0', 
        fontSize: 11, 
        fontWeight: '500' 
    },

    carregando: { 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    
    textoCarregando: { 
        color: '#94a3b8', 
        marginTop: 8, 
        fontSize: 12 
    },
    
    rodape: { 
        color: '#475569', 
        textAlign: 'center', 
        fontSize: 10, 
        marginTop: 20, 
        marginBottom: 10 
    },

    fundoModal: { 
        flex: 1, 
        backgroundColor: 'rgba(5, 5, 8, 0.85)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    
    modal: { 
        backgroundColor: '#161a23', 
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: '#242b3d', 
        padding: 20, 
        width: '100%', 
        maxWidth: 320 
    },
    
    tituloModal: { 
        color: '#ffffff', 
        fontSize: 16, 
        fontWeight: '600', 
        marginBottom: 4 
    },
    
    subtituloModal: { 
        color: '#94a3b8', 
        fontSize: 12, 
        marginBottom: 16 
    },
    
    inputData: { 
        backgroundColor: '#0d0f14', 
        borderWidth: 1, 
        borderColor: '#242b3d', 
        borderRadius: 8, 
        padding: 12, 
        color: '#ffffff', 
        fontSize: 14, 
        marginBottom: 16 
    },
    
    botoesModal: { 
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        gap: 10 
    },
    
    botaoCancelar: { 
        paddingHorizontal: 14, 
        paddingVertical: 8 
    },
    
    textoCancelar: { 
        color: '#94a3b8', 
        fontSize: 13 
    },
    
    botaoConfirmar: { 
        backgroundColor: '#3b82f6', 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: 8 
    },
    
    textoConfirmar: { 
        color: '#ffffff', 
        fontSize: 13, 
        fontWeight: '600' 
    },

    tabBarInferior: { 
        backgroundColor: '#161a23', 
        borderWidth: 1, 
        borderColor: '#242b3d', 
        borderRadius: 16, 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        height: 56, 
        marginBottom: 12, 
        marginTop: 10 
    },
    
    iconBar: { 
        padding: 8 
    },
    
    iconBarAtivo: { 
        backgroundColor: '#4d5bf7', 
        borderRadius: 10, 
        paddingHorizontal: 12, 
        paddingVertical: 6 
    },
    
    txtIconBar: { 
        fontSize: 18, 
        opacity: 0.6 
    },
    
    txtIconBarAtivo: { 
        fontSize: 18 
=======

    containerCentral: {
        flex: 1,
        backgroundColor: '#161a23',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#242b3d',
        padding: 16
    },
    rowCentralHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    tituloCentral: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff'
    },

    abas: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#242b3d',
        marginBottom: 16
    },
    aba: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        gap: 4
    },
    abaAtiva: {
        borderBottomWidth: 2,
        borderBottomColor: '#3b82f6'
    },
    textoAba: {
        color: '#9ba4b4',
        fontSize: 12,
        fontWeight: '500'
    },
    textoAbaAtivo: {
        color: '#3b82f6'
    },

    categoria: {
        marginBottom: 10
    },
    cabecalhoCategoria: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1c212d',
        borderWidth: 1,
        borderColor: '#242b3d',
        borderRadius: 12,
        padding: 14
    },
    cabecalhoSelecionado: {
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)'
    },
    cabecalhoConteudo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1
    },
    tituloArea: {
        flex: 1
    },
    tituloCategoria: {
        color: '#e2e8f0',
        fontSize: 14,
        fontWeight: '500'
    },
    tituloCategoriaSelecionado: {
        color: '#3b82f6'
    },
    contagem: {
        color: '#64748b',
        fontSize: 10,
        marginTop: 2
    },

    lista: {
        marginTop: 6,
        paddingHorizontal: 2,
        gap: 8
    },
    vazio: {
        color: '#64748b',
        fontSize: 11,
        textAlign: 'center',
        paddingVertical: 8
    },

    registro: {
        backgroundColor: '#1e2433',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(36, 43, 61, 0.6)',
        padding: 14,
        marginTop: 2
    },
    linha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    nomeArea: {
        flex: 1,
        paddingRight: 8
    },
    nome: {
        color: '#f1f5f9',
        fontSize: 14,
        fontWeight: '600'
    },
    descricao: {
        color: '#94a3b8',
        fontSize: 11,
        marginTop: 2
    },
    valor: {
        fontSize: 14,
        fontWeight: '700'
    },
    detalhe: {
        color: '#64748b',
        fontSize: 11,
        marginTop: 4
    },

    rodapeRegistro: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.04)'
    },
    status: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1
    },
    statusPendente: {
        backgroundColor: 'rgba(255, 91, 127, 0.1)',
        borderColor: 'rgba(255, 91, 127, 0.2)'
    },
    statusPago: {
        backgroundColor: 'rgba(46, 212, 122, 0.1)',
        borderColor: 'rgba(46, 212, 122, 0.2)'
    },
    textoStatus: {
        fontSize: 10,
        fontWeight: '500'
    },
    textoPendente: {
        color: '#FF5B7F'
    },
    textoPago: {
        color: '#2ED47A'
    },

    acoes: {
        flexDirection: 'row',
        gap: 6
    },
    botaoEditar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6
    },
    textoEditar: {
        color: '#60a5fa',
        fontSize: 10,
        fontWeight: '500'
    },
    botaoExcluir: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6
    },
    textoExcluir: {
        color: '#f87171',
        fontSize: 10,
        fontWeight: '500'
    },
    botaoConcluir: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 8,
        marginTop: 10
    },
    botaoReceber: {
        backgroundColor: '#22c55e'
    },
    textoConcluir: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500'
    },

    carregando: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textoCarregando: {
        color: '#94a3b8',
        marginTop: 8,
        fontSize: 12
    },

    fundoModal: {
        flex: 1,
        backgroundColor: 'rgba(5, 5, 8, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modal: {
        backgroundColor: '#161a23',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#242b3d',
        padding: 20,
        width: '100%',
        maxWidth: 320
    },
    tituloModal: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4
    },
    subtituloModal: {
        color: '#94a3b8',
        fontSize: 12,
        marginBottom: 16
    },
    inputData: {
        backgroundColor: '#0d0f14',
        borderWidth: 1,
        borderColor: '#242b3d',
        borderRadius: 8,
        padding: 12,
        color: '#ffffff',
        fontSize: 14,
        marginBottom: 16
    },
    botoesModal: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10
    },
    botaoCancelar: {
        paddingHorizontal: 14,
        paddingVertical: 8
    },
    textoCancelar: {
        color: '#94a3b8',
        fontSize: 13
    },
    botaoConfirmar: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8
    },
    textoConfirmar: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600'
    },

    // Estilos para o botão de cadastro em subcategorias
    botaoCadastroSub: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 8,
        paddingVertical: 10,
        marginTop: 8
    },
    textoBotaoCadastroSub: {
        color: '#60a5fa',
        fontSize: 12,
        fontWeight: '500'
    },

    // Estilos para modal de exclusão
    opcoesExclusao: {
        gap: 12,
        marginBottom: 16
    },
    opcaoExclusao: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    textoOpcao: {
        color: '#e2e8f0',
        fontSize: 13
>>>>>>> 06844f03aaa70fdfa8f31e591ec55f53f72d3e3b
    }
});