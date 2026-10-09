import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ImageBackground, Pressable, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API = 'http://10.0.2.2:3001';

const formatarValor = (valor) => {
    if (valor == null || valor === '') return '';
    if (String(valor).includes('R$')) return String(valor);
    const numero = Number(String(valor).replace(',', '.'));
    return Number.isFinite(numero) ? numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : String(valor);
};

export default function AtualizarGanhosFixos({ navigation, route }) {
    const { registro } = route.params;

    const [nome, setNome] = useState(registro.NOME || registro.NOME_REAL || '');
    const [valor, setValor] = useState(formatarValor(registro.VALOR ?? registro.VALOR_REAL));
    const [descricao, setDescricao] = useState(registro.DESCRICAO || registro.DESCRICAO_REAL || '');
    const [salvando, setSalvando] = useState(false);

    const salvarAlteracoes = async () => {
        if (!nome.trim() || !valor.trim()) {
            Alert.alert('Campos obrigatórios', 'Preencha o nome e o valor do ganho.');
            return;
        }

        const id = registro.ID_EXTRATO ?? registro.id_extrato ?? registro.ID ?? registro.id;

        if (!id) {
            Alert.alert('Não foi possível atualizar', 'O registro não possui um identificador disponível para a atualização.');
            return;
        }

        try {
            setSalvando(true);

            const usuarioId = await AsyncStorage.getItem('idUsuario');
            const token = await AsyncStorage.getItem('acessToken');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            await axios.put(`${API}/api/atualizar-ganhos-fixos/${id}`, {
                NOME: nome.trim(),
                VALOR: valor.trim(),
                DESCRICAO: descricao.trim(),
                USUARIO_ID: usuarioId
            }, config);

            Alert.alert('Alterações salvas', 'O ganho fixo foi atualizado.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (erro) {
            Alert.alert('Erro', erro.response?.data?.msg || 'Não foi possível atualizar o ganho fixo.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <ImageBackground source={require('../../Res/img/FundoApp-Zenith.png')} style={styles.fundo} resizeMode="cover">
            <View style={styles.overlay}>
                <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
                    <Pressable onPress={() => navigation.goBack()} style={styles.voltar}>
                        <Text style={styles.textoVoltar}>‹ Voltar ao extrato</Text>
                    </Pressable>

                    <Text style={styles.titulo}>Atualizar ganho fixo</Text>
                    <Text style={styles.subtitulo}>Altere as informações do seu registro.</Text>

                    <Text style={styles.label}>NOME DO GANHO</Text>
                    <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex.: Salário" placeholderTextColor="#8E9AB6" />

                    <Text style={styles.label}>VALOR</Text>
                    <TextInput style={styles.input} value={valor} onChangeText={setValor} placeholder="R$ 0,00" placeholderTextColor="#8E9AB6" keyboardType="decimal-pad" />

                    <Text style={styles.label}>DESCRIÇÃO</Text>
                    <TextInput style={[styles.input, styles.inputDescricao]} value={descricao} onChangeText={setDescricao} placeholder="Adicione uma descrição" placeholderTextColor="#8E9AB6" multiline />

                    <Pressable style={[styles.botaoSalvar, salvando && styles.botaoDesativado]} onPress={salvarAlteracoes} disabled={salvando}>
                        <Text style={styles.textoBotao}>{salvando ? 'Salvando...' : '✓  Salvar Alterações'}</Text>
                    </Pressable>
                </ScrollView>
            </View>
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
        backgroundColor: 'rgba(8,13,29,0.78)'
    },
    conteudo: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 55,
        paddingBottom: 35
    },
    voltar: {
        alignSelf: 'flex-start',
        marginBottom: 30
    },
    textoVoltar: {
        color: '#B8BAFF',
        fontSize: 14
    },
    titulo: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 8
    },
    subtitulo: {
        color: '#AAB4D0',
        fontSize: 14,
        marginBottom: 28
    },
    label: {
        color: '#AAB4D0',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12
    },
    input: {
        width: '100%',
        minHeight: 52,
        backgroundColor: '#18233F',
        borderColor: 'rgba(142,147,158,0.35)',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        color: '#FFFFFF',
        fontSize: 14
    },
    inputDescricao: {
        minHeight: 90,
        textAlignVertical: 'top',
        paddingTop: 14
    },
    botaoSalvar: {
        width: '100%',
        minHeight: 52,
        backgroundColor: '#5B25DA',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30
    },
    botaoDesativado: {
        opacity: 0.6
    },
    textoBotao: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700'
    }
});