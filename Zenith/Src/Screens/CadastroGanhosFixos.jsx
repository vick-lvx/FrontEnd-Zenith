import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, Pressable, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import imgFundo from '../../Res/img/FundoApp-Zenith.png';

export default function CadastroGanhos({ navigation }) {
  const [NOME, setNOME] = useState('');
  const [VALOR, setVALOR] = useState('');
  const [DATA_GANHO, setDATA_GANHO] = useState('');
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

  function formatarData(texto) {
    const apenasNumeros = texto.replace(/\D/g, '');
    if (apenasNumeros.length <= 2) {
      setDATA_GANHO(apenasNumeros);
      return;
    }
    if (apenasNumeros.length <= 4) {
      setDATA_GANHO(`${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`);
      return;
    }
    setDATA_GANHO(`${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`);
  }

  function converterDataParaBanco(data) {
    const partes = data.split('/');
    if (partes.length !== 3) {
      return null;
    }
    const dia = partes[0];
    const mes = partes[1];
    const ano = partes[2];
    if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) {
      return null;
    }
    return `${ano}-${mes}-${dia}`;
  }

  function converterValorParaNumero(valorFormatado) {
    const valorSemSimbolos = valorFormatado.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    return Number(valorSemSimbolos);
  }

  async function cadastrarGanho() {
    if (!NOME.trim()) {
      Alert.alert('Atenção', 'Digite o nome do ganho.');
      return;
    }
    if (!VALOR.trim()) {
      Alert.alert('Atenção', 'Digite o valor do ganho.');
      return;
    }
    if (!DATA_GANHO.trim()) {
      Alert.alert('Atenção', 'Digite a data do ganho.');
      return;
    }
    const dataConvertida = converterDataParaBanco(DATA_GANHO);
    if (!dataConvertida) {
      Alert.alert('Atenção', 'Digite a data no formato DD/MM/AAAA.');
      return;
    }
    const valorConvertido = converterValorParaNumero(VALOR);
    if (!valorConvertido || valorConvertido <= 0) {
      Alert.alert('Atenção', 'Digite um valor válido.');
      return;
    }
    try {
      setCarregando(true);
      const idUsuarioSalvo = await AsyncStorage.getItem('idUsuario');
      if (!idUsuarioSalvo) {
        Alert.alert('Sessão não encontrada', 'Entre novamente na sua conta.');
        return;
      }
      const idUsuario = Number(idUsuarioSalvo);
      if (!idUsuario) {
        Alert.alert('Erro', 'O ID do usuário salvo não é válido.');
        return;
      }
      const dadosGanho = {
        NOME: NOME.trim(),
        VALOR: valorConvertido,
        DATA_GANHO: dataConvertida,
        DESCRICAO: DESCRICAO.trim(),
        USUARIO_ID: idUsuario,
      };
      const resposta = await axios.post('http://10.0.2.2:3001/api/cadastrar-ganhos', dadosGanho);
      if (resposta.status === 200 || resposta.status === 201) {
        Alert.alert('Sucesso', 'Ganho cadastrado com sucesso!', [
          {
            text: 'OK',
            onPress: () => {
              setNOME('');
              setVALOR('');
              setDATA_GANHO('');
              setDESCRICAO('');
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (erro) {
      console.log('Erro ao cadastrar ganho:', erro.response?.data || erro.message);
      if (erro.response?.status === 400) {
        Alert.alert('Erro', erro.response?.data?.mensagem || erro.response?.data?.msg || 'Verifique os dados informados.');
      } else if (erro.response?.status === 401) {
        Alert.alert('Sessão expirada', 'Entre novamente na sua conta.');
      } else {
        Alert.alert('Erro', 'Não foi possível cadastrar o ganho. Verifique se o servidor está ligado.');
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
          <Text style={styles.titulo}>Cadastrar ganhos</Text>
          <View style={styles.espacoTopo} />
        </View>
        <Text style={styles.subtitulo}>Registre seus ganhos e mantenha sua vida financeira organizada.</Text>
        <View style={styles.formulario}>
          <Text style={styles.label}>NOME DO GANHO</Text>
          <TextInput style={styles.input} placeholder="Ex: Salário" placeholderTextColor="#8E97AE" value={NOME} onChangeText={setNOME} maxLength={100} />
          <Text style={styles.label}>VALOR</Text>
          <TextInput style={styles.input} placeholder="R$ 0,00" placeholderTextColor="#8E97AE" value={VALOR} onChangeText={formatarValor} keyboardType="numeric" />
          <Text style={styles.label}>DATA DO GANHO</Text>
          <TextInput style={styles.input} placeholder="DD/MM/AAAA" placeholderTextColor="#8E97AE" value={DATA_GANHO} onChangeText={formatarData} keyboardType="numeric" maxLength={10} />
          <Text style={styles.label}>DESCRIÇÃO</Text>
          <TextInput style={[styles.input, styles.inputDescricao]} placeholder="Digite uma descrição" placeholderTextColor="#8E97AE" value={DESCRICAO} onChangeText={setDESCRICAO} multiline numberOfLines={4} textAlignVertical="top" maxLength={255} />
          <Pressable onPress={cadastrarGanho} disabled={carregando} style={({ pressed }) => [styles.botaoCadastrar, { opacity: pressed || carregando ? 0.75 : 1 }]}>
            <Text style={styles.textoBotao}>{carregando ? 'Cadastrando...' : 'Cadastrar ganho'}</Text>
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