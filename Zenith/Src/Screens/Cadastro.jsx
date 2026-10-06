import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, ImageBackground, Pressable, Text, ScrollView } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import imgFundo from '../../Res/img/FundoApp-Zenith.png';
import axios from 'axios';
import { Link } from '@react-navigation/native';


const Cadastro = ({ navigation }) => {

    const [etapa, setEtapa] = useState(1);


    const [NOME, setNome] = useState('');
    const [SOBRENOME, setSobrenome] = useState('');
    const [CPF, setCpf] = useState('');
    const [RG, setRg] = useState('');
    const [EMAIL, setEmail] = useState('');
    const [TELEFONE, setTelefone] = useState('');
    const [DATA_NASCIMENTO, setDataNascimento] = useState('');
    const [SENHA, setSenha] = useState('');
    const [CONFIRMARSENHA, setConfirmarSenha] = useState('');

    const [SALARIO_LIQUIDO, setSalarioLiquido] = useState('');
    const [DIA_PAGAMENTO, setDiaPagamento] = useState('');
    const [SALDO_INICIAL, setSaldoInicial] = useState('');

    function formatarCPF(texto) {
        const apenasNumeros = texto.replace(/\D/g, '');

        if (apenasNumeros.length <= 3) {
            setCpf(apenasNumeros);
            return;
        }

        if (apenasNumeros.length <= 6) {
            setCpf(
                `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`
            );
            return;
        }

        if (apenasNumeros.length <= 9) {
            setCpf(
                `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6)}`
            );
            return;
        }

        setCpf(
            `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9, 11)}`
        );
    }

    const handleEtapa1 = () => {

        if (
            !NOME ||
            !SOBRENOME ||
            !CPF ||
            !RG ||
            !EMAIL ||
            !TELEFONE ||
            !DATA_NASCIMENTO ||
            !SENHA ||
            !CONFIRMARSENHA
        ) {
            Alert.alert(
                'Erro',
                'Por favor, preencha todos os campos.'
            );

            return;
        }

        if (SENHA !== CONFIRMARSENHA) {
            Alert.alert(
                'Erro',
                'As senhas não coincidem. Digite novamente.'
            );

            return;
        }

        setEtapa(2);
    };

    const handleCadastro = async () => {

        if (!SALARIO_LIQUIDO || !DIA_PAGAMENTO || !SALDO_INICIAL) {
            Alert.alert(
                'Erro',
                'Por favor, preencha todos os campos.'
            );

            return;
        }

        try {

            const data = {
                NOME,
                SOBRENOME,
                CPF,
                RG,
                EMAIL,
                SENHA,
                DATA_NASCIMENTO,
                TELEFONE,
                SALARIO_LIQUIDO,
                DIA_PAGAMENTO,
                SALDO_INICIAL
            };

            const response = await axios.post(
                'http://10.0.2.2:3001/cadastrar-usuario',
                data
            );

            if (response.status === 201) {
                setEtapa(3);
            }

        } catch (error) {

            if (error.response) {

                if (error.response.status === 409) {

                    Alert.alert(
                        'Erro',
                        error.response.data.msg
                    );

                } else {

                    Alert.alert(
                        'Erro',
                        'Não foi possível realizar o cadastro. Tente novamente.'
                    );

                }

            } else {

                Alert.alert(
                    'Erro',
                    'Não foi possível conectar ao servidor. Tente novamente.'
                );

            }

        }
    };

    const IndicadorEtapas = () => {

        return (
            <View style={styles.indicadorContainer}>

                {/* ETAPA 1 */}
                <View
                    style={[
                        styles.circulo,
                        etapa >= 1
                            ? styles.circuloAtivo
                            : styles.circuloInativo
                    ]}
                >
                    {etapa > 1 ? (
                        <Ionicons
                            name="checkmark"
                            size={16}
                            color="#3DDB75"
                        />
                    ) : (
                        <Text
                            style={[
                                styles.numero,
                                etapa === 1
                                    ? styles.numeroAtivo
                                    : styles.numeroInativo
                            ]}
                        >
                            1
                        </Text>
                    )}
                </View>

                <View style={styles.linha} />

                {/* ETAPA 2 */}
                <View
                    style={[
                        styles.circulo,
                        etapa >= 2
                            ? styles.circuloAtivo
                            : styles.circuloInativo
                    ]}
                >
                    {etapa > 2 ? (
                        <Ionicons
                            name="checkmark"
                            size={16}
                            color="#3DDB75"
                        />
                    ) : (
                        <Text
                            style={[
                                styles.numero,
                                etapa === 2
                                    ? styles.numeroAtivo
                                    : styles.numeroInativo
                            ]}
                        >
                            2
                        </Text>
                    )}
                </View>

                <View style={styles.linha} />


                <View style={styles.circulo}>
                    {etapa === 3 ? (
                        <Ionicons
                            name="checkmark"
                            size={16}
                            color="#3DDB75"
                        />
                    ) : (
                        <Text style={styles.numeroInativo}>
                            3
                        </Text>
                    )}
                </View>

            </View>
        );
    };

    return (

        <ImageBackground
            style={{ flex: 1 }}
            source={imgFundo}
            resizeMode="cover"
        >


            {etapa === 1 && (

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >

                    <View style={styles.container}>
                        
                        <Link
                            screen="Login"
                            style={styles.voltar}
                        >
                            Voltar para Login
                        </Link>

                        <IndicadorEtapas />

                        <Text style={styles.titulo}>
                            Cadastre-se
                        </Text>

                        <Text style={styles.label}>
                            NOME
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu nome"
                            placeholderTextColor="#f0efff9e"
                            value={NOME}
                            onChangeText={setNome}
                        />

                        <Text style={styles.label}>
                            SOBRENOME
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu sobrenome"
                            placeholderTextColor="#f0efff9e"
                            value={SOBRENOME}
                            onChangeText={setSobrenome}
                        />

                        <Text style={styles.label}>
                            CPF
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="000.000.000-00"
                            placeholderTextColor="#8E97AE"
                            value={CPF}
                            onChangeText={formatarCPF}
                            keyboardType="numeric"
                            maxLength={14}
                        />

                        <Text style={styles.label}>
                            RG
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu RG"
                            placeholderTextColor="#f0efff9e"
                            value={RG}
                            onChangeText={setRg}
                            keyboardType="numeric"
                            maxLength={11}
                        />

                        <Text style={styles.label}>
                            EMAIL
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu email"
                            placeholderTextColor="#f0efff9e"
                            value={EMAIL}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>
                            TELEFONE
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="(00) 00000-0000"
                            placeholderTextColor="#f0efff9e"
                            value={TELEFONE}
                            onChangeText={setTelefone}
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.label}>
                            DATA DE NASCIMENTO
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="00/00/0000"
                            placeholderTextColor="#f0efff9e"
                            value={DATA_NASCIMENTO}
                            onChangeText={setDataNascimento}
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>
                            SENHA
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite sua senha"
                            placeholderTextColor="#f0efff9e"
                            secureTextEntry
                            value={SENHA}
                            onChangeText={setSenha}
                        />

                        <Text style={styles.label}>
                            CONFIRMAR SENHA
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Confirme sua senha"
                            placeholderTextColor="#f0efff9e"
                            secureTextEntry
                            value={CONFIRMARSENHA}
                            onChangeText={setConfirmarSenha}
                        />

                        <Pressable
                            onPress={handleEtapa1}
                            style={({ pressed }) => [
                                styles.botaoEntrar,
                                {
                                    opacity: pressed ? 0.85 : 1
                                }
                            ]}
                        >
                            <Text style={styles.textoBotao}>
                                Continuar
                            </Text>
                        </Pressable>

                    </View>

                </ScrollView>

            )}


            {etapa === 2 && (

                <View style={styles.container}>

                    <Pressable
                        onPress={() => setEtapa(1)}
                        style={styles.voltarBotao}
                    >
                        <Text style={styles.voltar}>
                            Voltar para etapa 1
                        </Text>
                    </Pressable>

                    <IndicadorEtapas />

                    <Text style={styles.titulo}>
                        Concluir cadastro
                    </Text>

                    <Text style={styles.label}>
                        SALÁRIO LÍQUIDO
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="R$ 0,00"
                        placeholderTextColor="#f0efff9e"
                        value={SALARIO_LIQUIDO}
                        onChangeText={setSalarioLiquido}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>
                        DATA DE PAGAMENTO
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Digite o dia do pagamento"
                        placeholderTextColor="#f0efff9e"
                        value={DIA_PAGAMENTO}
                        onChangeText={setDiaPagamento}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>
                        SALDO ATUAL
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="R$ 0,00"
                        placeholderTextColor="#f0efff9e"
                        value={SALDO_INICIAL}
                        onChangeText={setSaldoInicial}
                        keyboardType="numeric"
                    />

                    <Pressable
                        onPress={handleCadastro}
                        style={({ pressed }) => [
                            styles.botaoEntrar,
                            {
                                opacity: pressed ? 0.85 : 1,
                                marginTop: 20
                            }
                        ]}
                    >
                        <Text style={styles.textoBotao}>
                            Concluir cadastro
                        </Text>
                    </Pressable>

                </View>

            )}

            {etapa === 3 && (

                <View style={styles.containerSucesso}>


                    <View style={styles.checkGrande}>
                        <Ionicons
                            name="checkmark"
                            size={42}
                            color="#3DDB75"
                        />
                    </View>

                    <Text style={styles.tituloSucesso}>
                        Cadastro realizado!
                    </Text>

                    <Text style={styles.textoSucesso}>
                        Sua conta foi criada com sucesso.
                    </Text>

                    <Pressable
                        onPress={() => navigation.navigate('Login')}
                        style={({ pressed }) => [
                            styles.botaoEntrar,
                            {
                                opacity: pressed ? 0.85 : 1
                            }
                        ]}
                    >
                        <Text style={styles.textoBotao}>
                            Ir para Login
                        </Text>
                    </Pressable>

                </View>

            )}

        </ImageBackground>
    );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },

    scrollContainer: {
        paddingBottom: 30,
    },

    voltar: {
        color: '#8E939E',
        alignSelf: 'flex-start',
        marginTop: 32,
        marginBottom: 25,
    },

    voltarBotao: {
        alignSelf: 'flex-start',
    },

    indicadorContainer: {
        width: '87%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },

    circulo: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#202637',
        alignItems: 'center',
        justifyContent: 'center',
    },

    circuloAtivo: {
        backgroundColor: '#202637',
    },

    circuloInativo: {
        backgroundColor: '#202637',
    },

    numero: {
        fontSize: 13,
        fontWeight: 'bold',
    },

    numeroAtivo: {
        color: '#fff',
    },

    numeroInativo: {
        color: '#8E939E',
    },

    linha: {
        height: 1.5,
        backgroundColor: '#202637',
        flex: 1,
        marginHorizontal: 18,
    },

    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        color: '#fff',
        marginBottom: 15,
        marginTop: 5,
        marginStart: 30,
    },

    label: {
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

    botaoEntrar: {
        width: '87%',
        height: 52,
        backgroundColor: '#5B25DA',
        borderRadius: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
        marginTop: 20,
    },

    textoBotao: {
        color: '#fff',
        alignSelf: 'center',
        marginTop: 13,
        marginBottom: 10,
    },

    containerSucesso: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },

    checkGrande: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#202637',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
        marginTop: 20,
    },

    tituloSucesso: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    textoSucesso: {
        color: '#8E939E',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
    },

});

export default Cadastro;