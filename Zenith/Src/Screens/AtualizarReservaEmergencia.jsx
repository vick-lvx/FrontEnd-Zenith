import React, { useState } from 'react';
import { View, Text, TextInput, ImageBackground, TouchableOpacity, StyleSheet, Alert, StatusBar, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AtualizarReservaEmergencia({ navigation, route }) {
    const { registro } = route.params;

    const [valor, setValor] = useState(String(registro.VALOR ?? registro.valor ?? ''));
    const [valorGuardado, setValorGuardado] = useState(String(registro.VALOR_GUARDADO ?? registro.valor_guardado ?? ''));

    const formatarMoeda = (texto) => {
        const numeros = texto.replace(/\D/g, '');
        if (!numeros) return '';
        return (Number(numeros) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const salvarAlteracoes = async () => {
        if (!valor.trim() || !valorGuardado.trim()) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }

        const id = registro.ID ?? registro.id ?? registro.ID_RESERVA ?? registro.id_reserva ?? registro.ID_EXTRATO ?? registro.id_extrato;

        if (!id) {
            Alert.alert('Erro', 'Não foi possível identificar a reserva para atualizar.');
            return;
        }

        try {
            const usuarioId = await AsyncStorage.getItem('idUsuario');
            const token = await AsyncStorage.getItem('acessToken');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            await axios.put(`http://10.0.2.2:3001/api/atualizar-reserva-emergencia/${id}`, {
                VALOR: valor,
                VALOR_GUARDADO: valorGuardado,
                USUARIO_ID: usuarioId
            }, config);

            Alert.alert('Sucesso', 'Reserva de emergência atualizada!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (erro) {
            console.log(erro.response?.data || erro.message);
            Alert.alert('Erro', erro.response?.data?.msg || 'Não foi possível atualizar a reserva.');
        }
    };

    return (
        <ImageBackground source={require('../../Res/img/FundoApp-Zenith.png')} style={styles.fundo}>
            <StatusBar barStyle="light-content" />
            <View style={styles.overlay}>
                <ScrollView contentContainerStyle={styles.conteudo}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltar}>
                        <Text style={styles.textoVoltar}>‹ Voltar para o extrato</Text>
                    </TouchableOpacity>

                    <Text style={styles.titulo}>Atualizar reserva de emergência</Text>
                    <Text style={styles.subtitulo}>Mantenha os valores da sua reserva atualizados.</Text>

                    <Text style={styles.label}>Valor da reserva</Text>
                    <TextInput style={styles.input} value={valor} onChangeText={(texto) => setValor(formatarMoeda(texto))} keyboardType="numeric" placeholder="R$ 0,00" placeholderTextColor="#9298A8" />

                    <Text style={styles.label}>Valor guardado</Text>
                    <TextInput style={styles.input} value={valorGuardado} onChangeText={(texto) => setValorGuardado(formatarMoeda(texto))} keyboardType="numeric" placeholder="R$ 0,00" placeholderTextColor="#9298A8" />

                    <TouchableOpacity style={styles.botao} onPress={salvarAlteracoes}>
                        <Text style={styles.textoBotao}>Salvar alterações</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    fundo: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(13, 17, 23, 0.72)',
    },
    conteudo: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 55,
    },
    voltar: {
        marginBottom: 28,
    },
    textoVoltar: {
        color: '#C7C9FF',
        fontSize: 16,
    },
    titulo: {
        color: '#FFFFFF',
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitulo: {
        color: '#B8BDCC',
        fontSize: 14,
        marginBottom: 30,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 15,
        marginBottom: 9,
        marginTop: 12,
    },
    input: {
        backgroundColor: 'rgba(24, 35, 63, 0.95)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#343D60',
        color: '#FFFFFF',
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 15,
    },
    botao: {
        backgroundColor: '#6566E8',
        borderRadius: 14,
        padding: 17,
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 20,
    },
    textoBotao: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});