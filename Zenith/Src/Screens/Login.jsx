import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ImageBackground, Pressable, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import imgFundo from '../../Res/img/FundoApp-Zenith.png';

export default function Login({ navigation }) {
    const [CPF, setCPF] = useState('');
    const [SENHA, setSENHA] = useState('');
    const [carregando, setCarregando] = useState(false);

    function formatarCPF(texto) {
        const apenasNumeros = texto.replace(/\D/g, '');

        if (apenasNumeros.length <= 3) {
            setCPF(apenasNumeros);
            return;
        }

        if (apenasNumeros.length <= 6) {
            setCPF(`${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`);
            return;
        }

        if (apenasNumeros.length <= 9) {
            setCPF(`${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6)}`);
            return;
        }

        setCPF(`${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9, 11)}`);
    }

    async function fazerLogin() {
        if (!CPF.trim() || !SENHA.trim()) {
            Alert.alert('Atenção', 'Preencha o CPF e a senha para entrar.');
            return;
        }

        try {
            setCarregando(true);

            const resposta = await axios.post('http://10.0.2.2:3001/login', { CPF: CPF, SENHA: SENHA });

            const idUsuario = resposta.data.idUsuario;
            const acessToken = resposta.data.acessToken;
            const nomeUsuario = resposta.data.nomeUsuario || resposta.data.nome || 'Usuário';

            if (!idUsuario || !acessToken) {
                Alert.alert('Erro', 'O servidor não retornou os dados necessários para entrar.');
                return;
            }

            await AsyncStorage.setItem('idUsuario', String(idUsuario));
            await AsyncStorage.setItem('acessToken', acessToken);

            Alert.alert('Login concluído', `Bem-vindo, ${nomeUsuario}!`, 
              [{ text: 'Continuar', onPress: () => navigation.navigate('Route') }]);
        } catch (erro) {
            console.log('Erro ao fazer login:', erro.response?.data || erro.message);

            if (erro.response?.status === 401) {
                Alert.alert('Login inválido', 'CPF ou senha incorretos.');
            } else if (erro.response?.status === 404) {
                Alert.alert('Erro', 'Rota de login não encontrada no servidor.');
            } else {
                Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique se o back-end está ligado.');
            }
        } finally {
            setCarregando(false);
        }
    }

    return (
        <ImageBackground source={imgFundo} style={styles.fundo} resizeMode="cover">
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <Text style={styles.titulo}>ZENITH</Text>
                    <Text style={styles.subtitulo}>O topo é apenas o começo do seu crescimento</Text>

                    <View style={styles.formulario}>
                        <Text style={styles.label}>CPF</Text>
                        <TextInput style={styles.input} placeholder="000.000.000-00" placeholderTextColor="#8E97AE" value={CPF} onChangeText={formatarCPF} keyboardType="numeric" maxLength={14} />

                        <Text style={styles.label}>SENHA</Text>
                        <TextInput style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#8E97AE" value={SENHA} onChangeText={setSENHA} secureTextEntry />

                        <Pressable onPress={() => navigation.navigate('VerificacaoEmail')} style={styles.botaoEsqueci}>
                            <Text style={styles.textoEsqueci}>Esqueceu senha?</Text>
                        </Pressable>

                        <Pressable onPress={fazerLogin} disabled={carregando} style={({ pressed }) => [styles.botaoEntrar, { opacity: pressed || carregando ? 0.75 : 1 }]}>
                            <Text style={styles.textoBotao}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
                        </Pressable>

                        <View style={styles.areaCadastro}>
                            <Text style={styles.textoAindaNao}>Ainda não possui uma conta?</Text>
                            <Pressable onPress={() => navigation.navigate('Cadastro')}>
                                <Text style={styles.linkCadastro}>Cadastre-se</Text>
                            </Pressable>
                        </View>
                    </View>
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
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 35,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 25,
    },
    titulo: {
        color: '#FFFFFF',
        fontSize: 27,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitulo: {
        color: '#A4AEC5',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 35,
    },
    formulario: {
        width: '100%',
        alignItems: 'center',
    },
    label: {
        width: '87%',
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 7,
        marginTop: 10,
    },
    input: {
        width: '87%',
        height: 54,
        backgroundColor: '#212E47EA',
        borderColor: '#8E939E73',
        borderRadius: 10,
        borderWidth: 1.7,
        paddingHorizontal: 13,
        color: '#FFFFFF',
        fontSize: 15,
        marginBottom: 8,
    },
    botaoEsqueci: {
        width: '87%',
        alignItems: 'flex-end',
        marginTop: 4,
        marginBottom: 12,
    },
    textoEsqueci: {
        color: '#A9A5FF',
        fontSize: 13,
    },
    botaoEntrar: {
        width: '87%',
        height: 53,
        backgroundColor: '#5B25DA',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    textoBotao: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    areaCadastro: {
        alignItems: 'center',
        marginTop: 25,
    },
    textoAindaNao: {
        color: '#8E97AE',
        fontSize: 13,
        marginBottom: 5,
    },
    linkCadastro: {
        color: '#A9A5FF',
        fontSize: 14,
        fontWeight: '700',
    },
});
