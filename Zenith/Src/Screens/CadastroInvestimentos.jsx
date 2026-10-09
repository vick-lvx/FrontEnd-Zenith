
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, Pressable, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import imgFundo from '../../Res/img/FundoApp-Zenith.png';

export default function CadastroInvestimentos({ navigation }) {
    const [NOME, setNOME] = useState('');
    const [TIPO, setTIPO] = useState('');
    const [DIA_APLICACAO, setDIA_APLICACAO] = useState('');
    const [VALOR, setVALOR] = useState('');
    const [VALOR_GUARDADO, setVALOR_GUARDADO] = useState('');
    const [carregando, setCarregando] = useState(false);

    function formatarValor(texto) {
        const apenasNumeros = texto.replace(/\D/g, '');

        if (apenasNumeros === '') {
            return '';
        }

        const numero = Number(apenasNumeros) / 100;
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function converterValorParaNumero(valorFormatado) {
        return Number(valorFormatado.replace(/[R$\s.]/g, '').replace(',', '.'));
    }

    async function cadastrarInvestimento() {
        if (!NOME.trim() || !TIPO.trim() || !DIA_APLICACAO || !VALOR || !VALOR_GUARDADO) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }

        const dia = Number(DIA_APLICACAO);
        const valorConvertido = converterValorParaNumero(VALOR);
        const valorGuardadoConvertido = converterValorParaNumero(VALOR_GUARDADO);

        if (!Number.isInteger(dia) || dia < 1 || dia > 31) {
            Alert.alert('Atenção', 'Digite um dia válido entre 1 e 31.');
            return;
        }

        if (!Number.isFinite(valorConvertido) || valorConvertido <= 0 || !Number.isFinite(valorGuardadoConvertido) || valorGuardadoConvertido < 0) {
            Alert.alert('Atenção', 'Digite valores válidos. O valor já guardado pode ser zero.');
            return;
        }

        try {
            setCarregando(true);

            const idUsuarioSalvo = await AsyncStorage.getItem('idUsuario');
            const acessToken = await AsyncStorage.getItem('acessToken');

            if (!idUsuarioSalvo || !Number(idUsuarioSalvo)) {
                Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
                return;
            }

            const dadosInvestimento = {
                NOME: NOME.trim(),
                TIPO: TIPO.trim(),
                VALOR: VALOR,
                VALOR_GUARDADO: VALOR_GUARDADO,
                USUARIO_ID: Number(idUsuarioSalvo),
                DIA_APLICACAO: dia,
            };

            const resposta = await axios.post(
                'http://10.0.2.2:3001/api/cadastrar-investimentos',
                dadosInvestimento,
                { headers: acessToken ? { Authorization: `Bearer ${acessToken}` } : {} }
            );

            if (resposta.status === 200 || resposta.status === 201) {
                Alert.alert('Sucesso', 'Investimento cadastrado com sucesso!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            setNOME('');
                            setTIPO('');
                            setDIA_APLICACAO('');
                            setVALOR('');
                            setVALOR_GUARDADO('');
                            navigation.goBack();
                        },
                    },
                ]);
            }
        } catch (erro) {
            console.log('Erro ao cadastrar investimento:', erro.response?.data || erro.message);

            if (erro.response?.status === 400) {
                Alert.alert('Erro', erro.response?.data?.msg || erro.response?.data?.mensagem || 'Verifique os dados informados.');
            } else if (erro.response?.status === 401) {
                Alert.alert('Sessão expirada', 'Faça login novamente.');
            } else if (erro.response?.status === 404) {
                Alert.alert('Erro', 'A rota de investimentos não foi encontrada no servidor.');
            } else {
                Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique se ele está ligado.');
            }
        } finally {
            setCarregando(false);
        }
    }

    return (
        <ImageBackground source={imgFundo} style={styles.fundo} resizeMode="cover">
            <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
                <View style={styles.topo}>
                    <Pressable style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
                        <Text style={styles.textoVoltar}>‹ Voltar</Text>
                    </Pressable>
                </View>

                <Text style={styles.titulo}>Novo Investimento</Text>
                <Text style={styles.subtitulo}>Registre um ativo ou aplicação</Text>

                <Text style={styles.label}>NOME</Text>
                <TextInput style={styles.input} placeholder="Ex: CDB Nubank 113% CDI" placeholderTextColor="#65718D" value={NOME} onChangeText={setNOME} maxLength={100} />

                <Text style={styles.label}>TIPO</Text>
                <TextInput style={styles.input} placeholder="Ex: Renda Fixa, Ações, FII, Cripto" placeholderTextColor="#65718D" value={TIPO} onChangeText={setTIPO} maxLength={100} />

                <Text style={styles.label}>DIA DA APLICAÇÃO</Text>
                <TextInput style={styles.input} placeholder="Ex: 15" placeholderTextColor="#65718D" keyboardType="numeric" value={DIA_APLICACAO} onChangeText={(texto) => setDIA_APLICACAO(texto.replace(/\D/g, '').slice(0, 2))} maxLength={2} />

                <Text style={styles.label}>VALOR A INVESTIR (R$)</Text>
                <TextInput style={styles.input} placeholder="R$ 0,00" placeholderTextColor="#65718D" keyboardType="numeric" value={VALOR} onChangeText={(texto) => setVALOR(formatarValor(texto))} />

                <Text style={styles.label}>VALOR JÁ INVESTIDO / GUARDADO (R$)</Text>
                <TextInput style={styles.input} placeholder="R$ 0,00" placeholderTextColor="#65718D" keyboardType="numeric" value={VALOR_GUARDADO} onChangeText={(texto) => setVALOR_GUARDADO(formatarValor(texto))} />

                <Pressable style={[styles.botaoCadastrar, { opacity: carregando ? 0.75 : 1 }]} onPress={cadastrarInvestimento} disabled={carregando}>
                    <Text style={styles.textoBotao}>{carregando ? 'Cadastrando...' : 'Adicionar Investimento'}</Text>
                </Pressable>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    fundo: {
        flex: 1,
        backgroundColor: '#0D1117',
    },
    conteudo: {
        paddingHorizontal: 12,
        paddingTop: 18,
        paddingBottom: 35,
    },
    topo: {
        marginBottom: 8,
    },
    botaoVoltar: {
        alignSelf: 'flex-start',
        paddingVertical: 2,
    },
    textoVoltar: {
        color: '#A4AEC5',
        fontSize: 12,
    },
    titulo: {
        color: '#F5F6FA',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
    },
    subtitulo: {
        color: '#65718D',
        fontSize: 10,
        marginTop: 4,
        marginBottom: 20,
    },
    label: {
        color: '#A4AEC5',
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 6,
        marginTop: 1,
    },
    input: {
        height: 44,
        backgroundColor: '#1B2745',
        borderRadius: 7,
        paddingHorizontal: 12,
        color: '#FFFFFF',
        fontSize: 11,
        marginBottom: 12,
    },
    botaoCadastrar: {
        height: 31,
        backgroundColor: '#4D38DD',
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 3,
    },
    textoBotao: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});