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

export default function AtualizarInvestimentos({ navigation, route }) {
    const { registro } = route.params;

    const [nome, setNome] = useState(registro.NOME || '');
    const [tipo, setTipo] = useState(registro.TIPO || '');
    const [valor, setValor] = useState(formatarValor(registro.VALOR));
    const [valorGuardado, setValorGuardado] = useState(formatarValor(registro.VALOR_GUARDADO));
    const [diaAplicacao, setDiaAplicacao] = useState(String(registro.DIA_APLICACAO || ''));
    const [salvando, setSalvando] = useState(false);

    const salvarAlteracoes = async () => {
        if (!nome.trim() || !tipo.trim() || !valor.trim() || !valorGuardado.trim() || !diaAplicacao.trim()) {
            Alert.alert('Campos obrigatórios', 'Preencha todos os campos do investimento.');
            return;
        }

        const id = registro.ID_INVESTIMENTO ?? registro.ID_EXTRATO ?? registro.id_investimento ?? registro.ID ?? registro.id;

        if (!id) {
            Alert.alert('Não foi possível atualizar', 'O registro não possui um identificador disponível para a atualização.');
            return;
        }

        try {
            setSalvando(true);

            const usuarioId = await AsyncStorage.getItem('idUsuario');
            const token = await AsyncStorage.getItem('acessToken');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            await axios.put(`${API}/api/atualizar-investimentos/${id}`, {
                NOME: nome.trim(),
                TIPO: tipo.trim(),
                VALOR: valor.trim(),
                VALOR_GUARDADO: valorGuardado.trim(),
                DIA_APLICACAO: diaAplicacao.trim(),
                USUARIO_ID: usuarioId
            }, config);

            Alert.alert('Alterações salvas', 'O investimento foi atualizado.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (erro) {
            Alert.alert('Erro', erro.response?.data?.msg || 'Não foi possível atualizar o investimento.');
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

                    <Text style={styles.titulo}>Atualizar investimento</Text>
                    <Text style={styles.subtitulo}>Altere as informações do seu investimento.</Text>

                    <Text style={styles.label}>NOME DO INVESTIMENTO</Text>
                    <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex.: Tesouro Direto" placeholderTextColor="#8E9AB6" />

                    <Text style={styles.label}>TIPO DE INVESTIMENTO</Text>
                    <TextInput style={styles.input} value={tipo} onChangeText={setTipo} placeholder="Ex.: Renda fixa" placeholderTextColor="#8E9AB6" />

                    <Text style={styles.label}>VALOR TOTAL</Text>
                    <TextInput style={styles.input} value={valor} onChangeText={setValor} placeholder="R$ 0,00" placeholderTextColor="#8E9AB6" keyboardType="decimal-pad" />

                    <Text style={styles.label}>VALOR GUARDADO</Text>
                    <TextInput style={styles.input} value={valorGuardado} onChangeText={setValorGuardado} placeholder="R$ 0,00" placeholderTextColor="#8E9AB6" keyboardType="decimal-pad" />

                    <Text style={styles.label}>DIA DA APLICAÇÃO</Text>
                    <TextInput style={styles.input} value={diaAplicacao} onChangeText={setDiaAplicacao} placeholder="Ex.: 10" placeholderTextColor="#8E9AB6" keyboardType="numeric" />

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