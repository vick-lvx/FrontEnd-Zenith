
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

  const formatarValor = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (!apenasNumeros) return '';
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (data) => {
    const apenasNumeros = data.replace(/\D/g, '').slice(0, 8);
    if (apenasNumeros.length <= 2) return apenasNumeros;
    if (apenasNumeros.length <= 4) return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4)}`;
  };

  const converterDataParaBanco = (data) => {
    const partes = data.split('/');
    if (partes.length !== 3) return '';
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  };

  const converterValorParaNumero = (valor) => {
    return Number(valor.replace(/[R$\s.]/g, '').replace(',', '.'));
  };

  const cadastrarInvestimento = async () => {
    if (!NOME.trim() || !TIPO.trim() || !DIA_APLICACAO || !VALOR || !VALOR_GUARDADO) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    const dataConvertida = converterDataParaBanco(DIA_APLICACAO);
    const valorConvertido = converterValorParaNumero(VALOR);
    const valorGuardadoConvertido = converterValorParaNumero(VALOR_GUARDADO);

    if (!dataConvertida || DIA_APLICACAO.length !== 10) {
      Alert.alert('Atenção', 'Digite uma data válida.');
      return;
    }

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

      const resposta = await axios.post('http://10.0.2.2:3001/api/cadastrar-investimentos', {
        NOME: NOME.trim(),
        TIPO: TIPO.trim(),
        VALOR: valorConvertido.toFixed(2),
        VALOR_GUARDADO: valorGuardadoConvertido.toFixed(2),
        USUARIO_ID: idUsuario,
        DIA_APLICACAO: dataConvertida
      });

      if (resposta.status === 201) {
        Alert.alert('Sucesso', 'Investimento cadastrado com sucesso!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      }
    } catch (erro) {
      if (erro.response?.status === 400) {
        Alert.alert('Erro', erro.response.data?.msg || 'Não foi possível cadastrar o investimento.');
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
        <Text style={styles.titulo}>Novo Investimento</Text>
        <Text style={styles.subtitulo}>Registre um ativo ou aplicação</Text>
        <Text style={styles.label}>NOME</Text>
        <TextInput style={styles.input} placeholder="Ex: CDB Nubank 113% CDI" placeholderTextColor="#65718D" value={NOME} onChangeText={setNOME} />
        <Text style={styles.label}>TIPO</Text>
        <TextInput style={styles.input} placeholder="Ex: Renda Fixa, Ações, FII, Cripto" placeholderTextColor="#65718D" value={TIPO} onChangeText={setTIPO} />
        <Text style={styles.label}>DATA</Text>
        <TextInput style={styles.input} placeholder="DD/MM/AAAA" placeholderTextColor="#65718D" keyboardType="numeric" value={DIA_APLICACAO} onChangeText={(texto) => setDIA_APLICACAO(formatarData(texto))} maxLength={10} />
        <Text style={styles.label}>VALOR A INVESTIR (R$)</Text>
        <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#65718D" keyboardType="numeric" value={VALOR} onChangeText={(texto) => setVALOR(formatarValor(texto))} />
        <Text style={styles.label}>VALOR JÁ INVESTIDO / GUARDADO (R$)</Text>
        <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#65718D" keyboardType="numeric" value={VALOR_GUARDADO} onChangeText={(texto) => setVALOR_GUARDADO(formatarValor(texto))} />
        <Pressable style={styles.botaoCadastrar} onPress={cadastrarInvestimento} disabled={carregando}>
          <Text style={styles.textoBotao}>{carregando ? 'Cadastrando...' : 'Adicionar Investimento'}</Text>
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