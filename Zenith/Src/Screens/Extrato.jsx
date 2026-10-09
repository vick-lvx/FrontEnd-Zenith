import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View, Text, StyleSheet, ImageBackground, ScrollView, Pressable,
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
            const chaves = Object.values(CATEGORIAS).flat();

            const respostas = await Promise.all(chaves.map(async (categoria) => {
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
        const rotas = {
            'gasto-fixo': '/api/deletar-gastos/',
            'gasto-variado': '/api/deletar-gastos/',
            parcela: '/api/deletar-parcelas/',
            'ganho-fixo': '/api/deletar-ganhos/',
            'ganho-variado': '/api/deletar-ganhos/',
            investimento: '/api/deletar-investimentos/',
            reserva: '/api/deletar-reserva/'
        };

        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            await axios.delete(`${API}${rotas[categoria.tipo]}${id}`, config);
            Alert.alert('Registro excluído', 'O extrato foi atualizado.');
            carregarExtrato();
        } catch {
            Alert.alert('Não foi possível excluir', 'O servidor não confirmou a exclusão.');
        }
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
        const telas = {
            'gasto-fixo': 'AtualizarGastosFixos',
            'gasto-variado': 'AtualizarGastosVariaveis',
            'ganho-fixo': 'AtualizarGanhosFixos',
            'ganho-variado': 'AtualizarGanhosVariaveis',
            investimento: 'AtualizarInvestimentos',
            reserva: 'AtualizarReservaEmergencia'
        };

        const tela = telas[categoria.tipo];

        if (!tela) {
            Alert.alert('Indisponível', 'A edição desta categoria ainda não está disponível.');
            return;
        }

        navigation.navigate(tela, { registro: item });
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
    const confirmarData = () => {
        const partes = dataInformada.trim().split('/');

        if (
            partes.length !== 3 || partes[0].length !== 2 ||
            partes[1].length !== 2 || partes[2].length !== 4 ||
            Number(partes[0]) < 1 || Number(partes[0]) > 31 ||
            Number(partes[1]) < 1 || Number(partes[1]) > 12
        ) {
            Alert.alert('Data inválida', 'Informe a data no formato DD/MM/AAAA.');
            return;
        }

        const dataISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
        const recebimento = acao?.tipoAcao === 'receber';

        Alert.alert(
            'Confirmar',
            `Deseja confirmar o ${recebimento ? 'recebimento' : 'pagamento'} em ${dataInformada}?`,
            [
                { text: 'Voltar', style: 'cancel' },
                { text: 'Confirmar', onPress: () => atualizarSituacao(dataISO) }
            ]
        );
    };

    const atualizarSituacao = async (dataISO) => {
        if (!acao) return;

        const rotas = {
            'gasto-fixo': '/api/atualizar-situacao-gastos/',
            'gasto-variado': '/api/atualizar-situacao-gastos/',
            parcela: '/api/atualizar-situacao-parcelas/',
            'ganho-fixo': '/api/atualizar-situacao-ganhos/',
            'ganho-variado': '/api/atualizar-situacao-ganhos/',
            investimento: '/api/atualizar-situacao-investimentos/',
            reserva: '/api/atualizar-situacao-reserva/'
        };

        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            await axios.put(
                `${API}${rotas[acao.categoria.tipo]}${acao.id}`,
                { DATA_PAGO: dataISO, USUARIO_ID: usuarioId },
                config
            );

            setModalVisivel(false);
            setAcao(null);
            Alert.alert('Atualizado', 'O servidor confirmou a atualização do registro.');
            carregarExtrato();
        } catch {
            Alert.alert('Não foi possível atualizar', 'O registro continua com a situação anterior.');
        }
    };

    const renderRegistro = (item, categoria, indice) => {
        const nome = item.NOME_REAL || item.NOME || item.nome || 'Registro financeiro';
        const valor = item.VALOR_REAL ?? item.VALOR ?? item.valor ?? 0;
        const situacao = String(item.SITUACAO || '').toUpperCase();
        const concluido = ['P', 'PAGO', 'RECEBIDO'].includes(situacao);
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
                    <Text style={[styles.valor, { color: ganho ? '#7FE0A1' : '#FF8297' }]}>
                        {formatarValor(valor)}
                    </Text>
                </View>

                {!!item.MES_ANO && <Text style={styles.detalhe}>Mês: {item.MES_ANO}</Text>}
                {categoria.tipo === 'parcela' && item.PARCELA_ATUAL != null && (
                    <Text style={styles.detalhe}>Parcela {item.PARCELA_ATUAL} de {item.TOTAL_PARCELAS}</Text>
                )}
                {categoria.tipo === 'parcela' && item.DIA_VENCIMENTO != null && (
                    <Text style={styles.detalhe}>Vencimento: dia {item.DIA_VENCIMENTO}</Text>
                )}
                {(categoria.tipo === 'investimento' || categoria.tipo === 'reserva') && item.VALOR_GUARDADO != null && (
                    <Text style={styles.detalhe}>Valor acumulado: {formatarValor(item.VALOR_GUARDADO)}</Text>
                )}
                {categoria.tipo === 'investimento' && item.DIA_APLICACAO != null && (
                    <Text style={styles.detalhe}>Dia da aplicação: {item.DIA_APLICACAO}</Text>
                )}

                <View style={styles.rodapeRegistro}>
                    <View style={[styles.status, concluido ? styles.statusPago : styles.statusPendente]}>
                        <Text style={[styles.textoStatus, concluido ? styles.textoPago : styles.textoPendente]}>
                            {concluido ? `Concluído${data ? ` • ${data}` : ''}` : 'Pendente'}
                        </Text>
                    </View>

                    {!concluido && (
                        <View style={styles.acoes}>
                            <Pressable style={styles.botaoEditar} onPress={() => iniciarAcao('editar', categoria, item)}>
                                <Text style={styles.textoEditar}>Editar</Text>
                            </Pressable>
                            <Pressable style={styles.botaoExcluir} onPress={() => iniciarAcao('excluir', categoria, item)}>
                                <Text style={styles.textoExcluir}>Excluir</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                {!concluido && (
                    <Pressable
                        style={[styles.botaoConcluir, ganho && styles.botaoReceber]}
                        onPress={() => iniciarAcao(ganho ? 'receber' : 'pagar', categoria, item)}
                    >
                        <Text style={styles.textoConcluir}>{ganho ? 'Marcar como recebido' : 'Marcar como pago'}</Text>
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
                        <Text style={styles.tituloCategoria}>{categoria.titulo}</Text>
                        <Text style={styles.contagem}>{lista.length} {lista.length === 1 ? 'registro' : 'registros'}</Text>
                    </View>
                    <Text style={styles.seta}>{aberta ? '−' : '+'}</Text>
                </Pressable>

                {aberta && (
                    <View style={styles.lista}>
                        {lista.length ? lista.map((item, i) => renderRegistro(item, categoria, i)) :
                            <Text style={styles.vazio}>Nenhum registro encontrado nesta categoria.</Text>}
                    </View>
                )}
            </View>
        );
    };

    return (
        <ImageBackground source={require('../../Res/img/FundoApp-Zenith.png')} style={styles.fundo} resizeMode="cover">
            <View style={styles.overlay}>
                <View style={styles.cabecalho}>
                    <View>
                        <Text style={styles.titulo}>Extrato</Text>
                        <Text style={styles.subtitulo}>Gerencie suas finanças</Text>
                    </View>
                    <Pressable style={styles.atualizar} onPress={carregarExtrato}>
                        <Text style={styles.iconeAtualizar}>↻</Text>
                    </Pressable>
                </View>

                <View style={styles.abas}>
                    <Pressable style={[styles.aba, aba === 'gastos' && styles.abaGastos]} onPress={() => setAba('gastos')}>
                        <Text style={[styles.textoAba, aba === 'gastos' && styles.textoAbaAtivo]}>Gastos</Text>
                    </Pressable>
                    <Pressable style={[styles.aba, aba === 'ganhos' && styles.abaGanhos]} onPress={() => setAba('ganhos')}>
                        <Text style={[styles.textoAba, aba === 'ganhos' && styles.textoAbaAtivo]}>Ganhos</Text>
                    </Pressable>
                    <Pressable style={[styles.aba, aba === 'investimentos' && styles.abaInvestimentos]} onPress={() => setAba('investimentos')}>
                        <Text style={[styles.textoAba, aba === 'investimentos' && styles.textoAbaAtivo]}>Invest./Emerg.</Text>
                    </Pressable>
                </View>

                {carregando ? (
                    <View style={styles.carregando}>
                        <ActivityIndicator size="large" color="#8587FF" />
                        <Text style={styles.textoCarregando}>Carregando extrato...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.scroll} contentContainerStyle={styles.conteudoScroll} showsVerticalScrollIndicator={false}>
                        {(CATEGORIAS[aba] || []).map(renderCategoria)}
                        <Text style={styles.rodape}>Zenith • Seu dinheiro, organizado.</Text>
                    </ScrollView>
                )}
            </View>

            <Modal visible={modalVisivel} transparent animationType="fade" onRequestClose={() => setModalVisivel(false)}>
                <View style={styles.fundoModal}>
                    <View style={styles.modal}>
                        <Text style={styles.tituloModal}>{acao?.tipoAcao === 'receber' ? 'Data do recebimento' : 'Data do pagamento'}</Text>
                        <Text style={styles.subtituloModal}>Informe a data real no formato DD/MM/AAAA.</Text>
                        <TextInput
                            style={styles.inputData}
                            value={dataInformada}
                            onChangeText={setDataInformada}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor="#7E89A6"
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
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    fundo: {
        flex: 1,
        backgroundColor: '#0D1117'
    },
    overlay: {
        flex: 1,
        paddingTop: 54,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(8, 13, 29, 0.72)'
    },
    cabecalho: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 22
    },
    titulo: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: '700'
    },
    subtitulo: {
        color: '#AAB4D0',
        fontSize: 14,
        marginTop: 4
    },
    atualizar: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(120,121,250,0.18)',
        borderWidth: 1,
        borderColor: 'rgba(140,145,255,0.35)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconeAtualizar: {
        color: '#B8BAFF',
        fontSize: 28,
        lineHeight: 31
    },
    abas: {
        flexDirection: 'row',
        backgroundColor: 'rgba(16,25,48,0.92)',
        borderRadius: 16,
        padding: 5,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: 'rgba(122,139,190,0.16)'
    },
    aba: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    abaGastos: {
        backgroundColor: 'rgba(255,105,132,0.18)'
    },
    abaGanhos: {
        backgroundColor: 'rgba(89,209,143,0.18)'
    },
    abaInvestimentos: {
        backgroundColor: 'rgba(120,121,250,0.22)'
    },
    textoAba: {
        color: '#8F9BB9',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center'
    },
    textoAbaAtivo: {
        color: '#FFFFFF'
    },
    scroll: {
        flex: 1
    },
    conteudoScroll: {
        paddingBottom: 28
    },
    categoria: {
        backgroundColor: 'rgba(16,26,50,0.92)',
        borderRadius: 17,
        borderWidth: 1,
        borderColor: 'rgba(123,141,197,0.18)',
        marginBottom: 12,
        overflow: 'hidden'
    },
    cabecalhoCategoria: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 17,
        paddingHorizontal: 17
    },
    tituloCategoria: {
        color: '#F4F6FF',
        fontSize: 15,
        fontWeight: '600'
    },
    contagem: {
        color: '#8794B6',
        fontSize: 11,
        marginTop: 5
    },
    seta: {
        color: '#A7AAFF',
        fontSize: 26,
        marginLeft: 12
    },
    lista: {
        paddingHorizontal: 12,
        paddingBottom: 12
    },
    registro: {
        backgroundColor: 'rgba(7,13,29,0.62)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(123,141,197,0.12)',
        padding: 13,
        marginTop: 9
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
        color: '#F4F6FF',
        fontSize: 14,
        fontWeight: '600'
    },
    descricao: {
        color: '#8794B6',
        fontSize: 12,
        marginTop: 5
    },
    valor: {
        fontSize: 14,
        fontWeight: '700'
    },
    detalhe: {
        color: '#A0ABC6',
        fontSize: 11,
        marginTop: 6
    },
    rodapeRegistro: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginTop: 12,
        gap: 8
    },
    status: {
        borderRadius: 20,
        paddingHorizontal: 9,
        paddingVertical: 6
    },
    statusPendente: {
        backgroundColor: 'rgba(174,151,103,0.12)'
    },
    statusPago: {
        backgroundColor: 'rgba(91,210,143,0.12)'
    },
    textoStatus: {
        fontSize: 10,
        fontWeight: '600'
    },
    textoPendente: {
        color: '#D4B36E'
    },
    textoPago: {
        color: '#65D99B'
    },
    acoes: {
        flexDirection: 'row',
        gap: 7
    },
    botaoEditar: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(137,145,255,0.35)'
    },
    textoEditar: {
        color: '#B8BAFF',
        fontSize: 11,
        fontWeight: '600'
    },
    botaoExcluir: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: 'rgba(255,105,132,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,105,132,0.25)'
    },
    textoExcluir: {
        color: '#FF8DA1',
        fontSize: 11,
        fontWeight: '600'
    },
    botaoConcluir: {
        backgroundColor: 'rgba(255,105,132,0.12)',
        borderColor: 'rgba(255,105,132,0.32)',
        borderWidth: 1,
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 10,
        marginTop: 12
    },
    botaoReceber: {
        backgroundColor: 'rgba(91,210,143,0.12)',
        borderColor: 'rgba(91,210,143,0.3)'
    },
    textoConcluir: {
        color: '#F1F3FF',
        fontSize: 12,
        fontWeight: '600'
    },
    vazio: {
        color: '#8995B3',
        fontSize: 12,
        textAlign: 'center',
        paddingVertical: 18,
        paddingHorizontal: 10
    },
    rodape: {
        color: '#687594',
        textAlign: 'center',
        fontSize: 11,
        marginTop: 12,
        marginBottom: 12
    },
    carregando: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textoCarregando: {
        color: '#AAB4D0',
        marginTop: 12,
        fontSize: 13
    },
    fundoModal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.72)',
        justifyContent: 'center',
        paddingHorizontal: 24
    },
    modal: {
        backgroundColor: '#111B33',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(137,145,255,0.3)',
        padding: 20
    },
    tituloModal: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '700'
    },
    subtituloModal: {
        color: '#AAB4D0',
        fontSize: 12,
        lineHeight: 18,
        marginTop: 8,
        marginBottom: 16
    },
    inputData: {
        color: '#FFFFFF',
        backgroundColor: '#0B1225',
        borderRadius: 11,
        borderWidth: 1,
        borderColor: 'rgba(137,145,255,0.3)',
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15
    },
    botoesModal: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 18
    },
    botaoCancelar: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(133,146,177,0.12)'
    },
    textoCancelar: {
        color: '#C3CBE0',
        fontSize: 13,
        fontWeight: '600'
    },
    botaoConfirmar: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: '#696CF0'
    },
    textoConfirmar: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700'
    }
});