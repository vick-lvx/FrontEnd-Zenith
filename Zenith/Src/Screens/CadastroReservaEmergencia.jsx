import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, Pressable, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import imgFundo from '../../Res/img/FundoApp-Zenith.png';

export default function CadastroReservaEmergencia({ navigation }) {
  const [VALOR, setVALOR] = useState('');
  const [VALOR_GUARDADO, setVALOR_GUARDADO] = useState('');
  const [carregando, setCarregando] = useState(false);

  const formatarValor = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (!apenasNumeros) return '';
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const converterValorParaNumero = (valor) => {
    return Number(valor.replace(/[R$\s.]/g, '').replace(',', '.'));
  };

  const cadastrarReserva = async () => {
    if (!VALOR || !VALOR_GUARDADO) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    const valorConvertido = converterValorParaNumero(VALOR);
    const valorGuardadoConvertido = converterValorParaNumero(VALOR_GUARDADO);

    if (isNaN(valorConvertido) || isNaN(valorGuardadoConvertido)) {
      Alert.alert('Atenção', 'Digite valores válidos.');
      return;
    }

    try {
      setCarregando(true);

      const idUsuarioSalvo = await AsyncStorage.getItem('idUsuario');
      const idUsuario = Number(idUsuarioSalvo);

      if (!idUsuarioSalvo || isNaN(idUsuario)) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        return;
      }

      const resposta = await axios.post('http://10.0.2.2:3001/api/cadastrar-reserva', {
        VALOR: valorConvertido.toFixed(2),
        VALOR_GUARDADO: valorGuardadoConvertido.toFixed(2),
        USUARIO_ID: idUsuario
      });

      if (resposta.status === 201) {
        Alert.alert('Sucesso', 'Reserva de emergência cadastrada com sucesso!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      }
    } catch (erro) {
      if (erro.response?.status === 400) {
        Alert.alert('Erro', erro.response.data?.msg || 'Não foi possível cadastrar a reserva.');
      } else if (erro.response?.status === 401) {
        Alert.alert('Erro', 'Sua sessão expirou. Faça login novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ImageBackground source={imgFundo} style={styles.fundo}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <View style={styles.topo}>
          <Pressable style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
            <Text style={styles.textoVoltar}>‹ Voltar</Text>
          </Pressable>
        </View>
        <Text style={styles.titulo}>Reserva de Emergência</Text>
        <Text style={styles.subtitulo}>Organize sua reserva financeira</Text>
        <Text style={styles.label}>VALOR DA RESERVA (R$)</Text>
        <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#65718D" keyboardType="numeric" value={VALOR} onChangeText={(texto) => setVALOR(formatarValor(texto))} />
        <Text style={styles.label}>VALOR JÁ GUARDADO (R$)</Text>
        <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#65718D" keyboardType="numeric" value={VALOR_GUARDADO} onChangeText={(texto) => setVALOR_GUARDADO(formatarValor(texto))} />
        <Pressable style={styles.botaoCadastrar} onPress={cadastrarReserva} disabled={carregando}>
          <Text style={styles.textoBotao}>{carregando ? 'Cadastrando...' : 'Adicionar Reserva'}</Text>
        </Pressable>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: '#0D1117'
  },
  conteudo: {
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 35
  },
  topo: {
    marginBottom: 8
  },
  botaoVoltar: {
    alignSelf: 'flex-start',
    paddingVertical: 2
  },
  textoVoltar: {
    color: '#A4AEC5',
    fontSize: 12
  },
  titulo: {
    color: '#F5F6FA',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8
  },
  subtitulo: {
    color: '#65718D',
    fontSize: 10,
    marginTop: 4,
    marginBottom: 20
  },
  label: {
    color: '#A4AEC5',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 1
  },
  input: {
    height: 44,
    backgroundColor: '#1B2745',
    borderRadius: 7,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 11,
    marginBottom: 12
  },
  botaoCadastrar: {
    height: 31,
    backgroundColor: '#4D38DD',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  }
});