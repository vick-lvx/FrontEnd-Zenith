import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Alert, ImageBackground, Pressable, Text } from 'react-native';
import imgFundo from '../../Res/img/FundoApp-Zenith.png';
import axios from 'axios';
import { Link } from '@react-navigation/native';
const ResetSenha = ({ navigation }) => {

    const [etapa, setEtapa] = useState(1);
    const [EMAIL, setEmail] = useState('');
    const [CODIGO, setCodigo] = useState('');
    const [NOVASENHA, setNovaSenha] = useState('');
    const [CONFIRMARSENHA, setConfirmarSenha] = useState('');
    const length = 6;
    const inputsRef = useRef([]);
    const handleBoxChange = (text, index) => {

        const cleanText = text.replace(/[^a-zA-Z0-9]/g, '');

        let codeArray = CODIGO.split('');
        codeArray[index] = cleanText;
        const newCode = codeArray.join('');
        setCodigo(newCode);

        if (cleanText && index < length - 1) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handleBoxKeyPress = (e, index) => {

        if (
            e.nativeEvent.key === 'Backspace' &&
            !CODIGO[index] &&
            index > 0
        ) {
            inputsRef.current[index - 1].focus();
        }
    };

    const handleVerificarEmail = async () => {

        if (!EMAIL) {
            Alert.alert(
                'Erro',
                'Por favor, insira seu e-mail.'
            );
            return;
        }

        try {

            const response = await axios.post(
                'http://10.0.2.2:3001/esqueceu-senha',
                { EMAIL }
            );

            if (response.status === 200) {

                Alert.alert(
                    'Sucesso',
                    'Um código foi enviado para o seu e-mail.'
                );

                setEtapa(2);
            }

        } catch (error) {

            Alert.alert(
                'Erro',
                'E-mail não encontrado. Verifique e tente novamente.'
            );
        }
    };

    const handleVerificarCodigo = async () => {

        if (!CODIGO || CODIGO.length < length) {

            Alert.alert(
                'Erro',
                `Por favor, insira o código completo de ${length} dígitos.`
            );

            return;
        }

        try {

            const response = await axios.post(
                'http://10.0.2.2:3001/validar-codigo',
                { EMAIL, CODIGO }
            );

            if (response.status === 200) {

                Alert.alert(
                    'Sucesso',
                    'Código verificado! Agora, redefina sua senha.'
                );

                setEtapa(3);

            } else {

                Alert.alert(
                    'Erro',
                    'Código inválido.'
                );
            }

        } catch (error) {

            Alert.alert(
                'Erro',
                'Código inválido ou expirado.'
            );
        }
    };

    const handleRedefinirSenha = async () => {

        if (!NOVASENHA || !CONFIRMARSENHA) {

            Alert.alert(
                'Erro',
                'Por favor, preencha ambos os campos de senha.'
            );

            return;
        }

        if (NOVASENHA !== CONFIRMARSENHA) {

            Alert.alert(
                'Erro',
                'As senhas não coincidem. Digite novamente.'
            );

            return;
        }

        try {

            const response = await axios.post(
                'http://10.0.2.2:3001/resetar-senha',
                {
                    EMAIL,
                    CODIGO,
                    NOVASENHA
                }
            );

            if (response.status === 200) {

                Alert.alert(
                    'Sucesso',
                    'Senha redefinida com sucesso!'
                );

                navigation.navigate('Login');
            }

        } catch (error) {

            Alert.alert(
                'Erro',
                'Não foi possível redefinir a senha. Tente novamente.'
            );
        }
    };

    return (

        <ImageBackground
            style={{ flex: 1 }}
            source={imgFundo}
            resizeMode="cover"
        >

            <View style={styles.container}>

                {etapa === 1 && (
                    <>

                        <Link
                            screen="Login"
                            style={styles.voltarEtapa1}
                        >
                            Voltar
                        </Link>

                        <Text style={styles.titulo}>
                            Crie uma nova Senha
                        </Text>

                        <Text style={styles.descricaoEtapa1}>
                            Digite seu email cadastrado para confirmar sua identidade.
                        </Text>

                        <Text style={styles.label}>
                            EMAIL
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="novasenha@zenith.com"
                            placeholderTextColor="#f0efff9e"
                            value={EMAIL}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />

                        <Pressable
                            onPress={handleVerificarEmail}
                            style={({ pressed }) => [
                                styles.botaoEntrar,
                                {
                                    opacity: pressed ? 0.85 : 1
                                }
                            ]}
                        >
                            <Text style={styles.textoBotao}>
                                Enviar Código
                            </Text>
                        </Pressable>

                    </>
                )}

                {etapa === 2 && (
                    <>

                        <Link
                            screen="Login"
                            style={styles.voltarEtapa2}
                        >
                            Voltar
                        </Link>

                        <Text style={styles.titulo}>
                            Código de acesso
                        </Text>

                        <Text style={styles.descricaoEtapa2}>
                            Digite o código enviado no seu email.
                        </Text>

                        <View style={styles.codigoContainer}>

                            {Array.from({ length }).map((_, index) => (

                                <TextInput
                                    key={index}
                                    style={styles.inputCodigo}
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    onChangeText={(text) =>
                                        handleBoxChange(text, index)
                                    }
                                    onKeyPress={(e) =>
                                        handleBoxKeyPress(e, index)
                                    }
                                    value={CODIGO[index] || ''}
                                    ref={(ref) =>
                                        (inputsRef.current[index] = ref)
                                    }
                                />

                            ))}

                        </View>

                        <Pressable
                            onPress={handleVerificarCodigo}
                            style={({ pressed }) => [
                                styles.botaoEntrar,
                                {
                                    opacity: pressed ? 0.85 : 1
                                }
                            ]}
                        >
                            <Text style={styles.textoBotao}>
                                Validar Código
                            </Text>
                        </Pressable>

                    </>
                )}

                {etapa === 3 && (
                    <>

                        <Link
                            screen="Login"
                            style={styles.voltarEtapa3}
                        >
                            Voltar
                        </Link>

                        <Text style={styles.titulo}>
                            Nova Senha
                        </Text>

                        <Text style={styles.descricaoEtapa3}>
                            Defina sua nova credencial de acesso.
                        </Text>

                        <Text style={styles.label}>
                            NOVA SENHA
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite sua nova senha"
                            placeholderTextColor="#f0efff9e"
                            secureTextEntry
                            value={NOVASENHA}
                            onChangeText={setNovaSenha}
                        />

                        <Text style={styles.labelConfirmarSenha}>
                            CONFIRMAR SENHA
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Confirme sua nova senha"
                            placeholderTextColor="#f0efff9e"
                            secureTextEntry
                            value={CONFIRMARSENHA}
                            onChangeText={setConfirmarSenha}
                        />

                        <Pressable
                            onPress={handleRedefinirSenha}
                            style={({ pressed }) => [
                                styles.botaoEntrar,
                                styles.botaoAtualizar,
                                {
                                    opacity: pressed ? 0.85 : 1
                                }
                            ]}
                        >
                            <Text style={styles.textoBotao}>
                                Atualizar Senha
                            </Text>
                        </Pressable>

                    </>
                )}

            </View>

        </ImageBackground>
    );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },

    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        color: '#fff',
        marginBottom: 10,
        marginTop: 5,
        marginStart: 30,
    },

    label: {
        color: '#8E939E',
        alignSelf: 'flex-start',
        marginStart: 32,
        marginBottom: 6,
    },

    labelConfirmarSenha: {
        color: '#8E939E',
        alignSelf: 'flex-start',
        marginStart: 32,
        marginBottom: 6,
        marginTop: 10,
    },

    input: {
        width: '87%',
        height: 52,
        backgroundColor: '#212e47ea',
        borderColor: '#8e939e73',
        borderRadius: 10,
        borderWidth: 1.77,
        marginBottom: 10,
        paddingHorizontal: 10,
        color: '#fff',
    },

    voltarEtapa1: {
        color: '#8E939E',
        alignSelf: 'flex-start',
        margin: 32,
        marginTop: 32,
        marginBottom: 110,
    },

    voltarEtapa2: {
        color: '#8E939E',
        alignSelf: 'flex-start',
        margin: 32,
        marginTop: 32,
        marginBottom: 86,
    },

    voltarEtapa3: {
        color: '#8E939E',
        alignSelf: 'flex-start',
        margin: 32,
        marginTop: 32,
        marginBottom: 50,
    },

    descricaoEtapa1: {
        color: '#8E939E',
        marginBottom: 50,
        marginStart: 32,
    },

    descricaoEtapa2: {
        color: '#8E939E',
        marginBottom: 40,
        alignSelf: 'flex-start',
        marginStart: 30,
    },

    descricaoEtapa3: {
        color: '#8E939E',
        marginBottom: 20,
        alignSelf: 'flex-start',
        marginStart: 30,
    },

    codigoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '87%',
        marginBottom: 30,
    },

    inputCodigo: {
        width: 56,
        height: 56,
        backgroundColor: '#212e47ea',
        borderColor: '#8e939e73',
        borderRadius: 10,
        borderWidth: 1.77,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },

    botaoEntrar: {
        width: '87%',
        height: 52,
        backgroundColor: '#5B25DA',
        borderRadius: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
    },

    botaoAtualizar: {
        marginTop: 20,
    },

    textoBotao: {
        color: '#fff',
        alignSelf: 'center',
        marginTop: 13,
        marginBottom: 10,
    },

});

export default ResetSenha;

