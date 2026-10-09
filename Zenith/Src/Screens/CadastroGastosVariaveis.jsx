
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, Pressable, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import imgFundo from '../../Res/img/FundoApp-Zenith.png';

export default function CadastroGastosVariaveis({ navigation }) {
    const [NOME, setNOME] = useState('');
    const [VALOR, setVALOR] = useState('');
    const [DESCRICAO, setDESCRICAO] = useState('');
    const [carregando, setCarregando] = useState(false);

    function formatarValor(texto) {
        const apenasNumeros = texto.replace(/\D/g, '');

        if (apenasNumeros === '') {
            setVALOR('');
            return;
        }

        const numero = Number(apenasNumeros) / 100;
        setVALOR(numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    }

    async function cadastrarGasto() {
        if (!NOME.trim()) {
            Alert.alert('Atenção', 'Digite o nome do gasto.');
            return;
        }

        if (!VALOR.trim()) {
            Alert.alert('Atenção', 'Digite o valor do gasto.');
            return;
        }

        const valorNumerico = Number(VALOR.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());

        if (!valorNumerico || valorNumerico <= 0) {
            Alert.alert('Atenção', 'Digite um valor válido.');
            return;
        }

        try {
            setCarregando(true);

            const idUsuarioSalvo = await AsyncStorage.getItem('idUsuario');
            const acessToken = await AsyncStorage.getItem('acessToken');

            if (!idUsuarioSalvo) {
                Alert.alert('Sessão não encontrada', 'Entre novamente na sua conta.');
                return;
            }

            const idUsuario = Number(idUsuarioSalvo);

            if (!idUsuario) {
                Alert.alert('Erro', 'O ID do usuário salvo não é válido.');
                return;
            }

            const dadosGasto = {
                USUARIO_ID: idUsuario,
                NOME_REAL: NOME.trim(),
                DESCRICAO_REAL: DESCRICAO.trim(),
                VALOR_REAL: VALOR,
            };

            const resposta = await axios.post('http://10.0.2.2:3001/api/cadastrar-gastos-variaveis', dadosGasto, {
                headers: acessToken ? { Authorization: `Bearer ${acessToken}` } : {},
            });

            if (resposta.status === 200 || resposta.status === 201) {
                Alert.alert('Sucesso', 'Gasto variável cadastrado com sucesso!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            setNOME('');
                            setVALOR('');
                            setDESCRICAO('');
                            navigation.goBack();
                        },
                    },
                ]);
            }
        } catch (erro) {
            console.log('Erro ao cadastrar gasto variável:', erro.response?.data || erro.message);

            if (erro.response?.status === 400) {
                Alert.alert('Erro', erro.response?.data?.mensagem || erro.response?.data?.msg || 'Verifique os dados informados.');
            } else if (erro.response?.status === 401) {
                Alert.alert('Sessão expirada', 'Entre novamente na sua conta.');
            } else if (erro.response?.status === 404) {
                Alert.alert('Erro', 'A rota de cadastro de gastos variáveis não foi encontrada.');
            } else {
                Alert.alert('Erro', 'Não foi possível cadastrar o gasto. Verifique se o back-end está ligado.');
            }
        } finally {
            setCarregando(false);
        }
    }

    return (
        <ImageBackground source={imgFundo} style={styles.fundo} resizeMode="cover">
            <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
                <View style={styles.topo}>
                    <Pressable style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
                        <Text style={styles.textoVoltar}>‹</Text>
                    </Pressable>
                    <Text style={styles.titulo}>Gastos variáveis</Text>
                    <View style={styles.espacoTopo} />
                </View>

                <Text style={styles.subtitulo}>Registre seus gastos variáveis e mantenha sua vida financeira organizada.</Text>

                <View style={styles.formulario}>
                    <Text style={styles.label}>NOME DO GASTO</Text>
                    <TextInput style={styles.input} placeholder="Ex: Mercado" placeholderTextColor="#8E97AE" value={NOME} onChangeText={setNOME} maxLength={100} />

                    <Text style={styles.label}>VALOR</Text>
                    <TextInput style={styles.input} placeholder="R$ 0,00" placeholderTextColor="#8E97AE" value={VALOR} onChangeText={formatarValor} keyboardType="numeric" />

                    <Text style={styles.label}>DESCRIÇÃO</Text>
                    <TextInput style={[styles.input, styles.inputDescricao]} placeholder="Digite uma descrição" placeholderTextColor="#8E97AE" value={DESCRICAO} onChangeText={setDESCRICAO} multiline numberOfLines={4} textAlignVertical="top" maxLength={255} />

                    <Pressable onPress={cadastrarGasto} disabled={carregando} style={({ pressed }) => [styles.botaoCadastrar, { opacity: pressed || carregando ? 0.75 : 1 }]}>
                        <Text style={styles.textoBotao}>{carregando ? 'Cadastrando...' : 'Cadastrar gasto'}</Text>
                    </Pressable>
                </View>
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
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 35,
        paddingBottom: 35,
    },
    topo: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    botaoVoltar: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#17213D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textoVoltar: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '300',
        marginTop: -5,
    },
    titulo: {
        color: '#FFFFFF',
        fontSize: 23,
        fontWeight: '700',
    },
    espacoTopo: {
        width: 42,
        height: 42,
    },
    subtitulo: {
        color: '#A4AEC5',
        fontSize: 14,
        lineHeight: 21,
        marginBottom: 28,
    },
    formulario: {
        width: '100%',
    },
    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 9,
        marginLeft: 3,
    },
    input: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        backgroundColor: '#18233F',
        borderWidth: 1,
        borderColor: '#293654',
        color: '#FFFFFF',
        fontSize: 15,
        paddingHorizontal: 17,
        marginBottom: 21,
    },
    inputDescricao: {
        height: 115,
        paddingTop: 16,
        paddingBottom: 16,
    },
    botaoCadastrar: {
        height: 58,
        borderRadius: 18,
        backgroundColor: '#6566E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    textoBotao: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
