
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import Login from './Src/Screens/Login';
import VerificacaoEmail from './Src/Screens/ResetSenha';
import Cadastro from './Src/Screens/Cadastro';
import Home from './Src/Screens/Home';
import Route from './Src/Routes/Route';
import CadastroGastosVariaveis from './Src/Screens/CadastroGastosVariaveis';
import CadastroGastosFixosV from './Src/Screens/CadastroGastosFixosV';
import CadastroGanhosFixos from './Src/Screens/CadastroGanhosFixos';
import CadastroGanhosVariaveis from './Src/Screens/CadastroGanhosVariaveis';
import CadastroInvestimentos from './Src/Screens/CadastroInvestimentos';
import CadastroReservaEmergencia from './Src/Screens/CadastroReservaEmergencia';
import AtualizarGanhosFixos from './Src/Screens/AtualizarGanhosFixos';
import AtualizarGanhosVariados from './Src/Screens/AtualizarGanhosVariados'
import AtualizarGastosFixos from './Src/Screens/AtualizarGastosFixos';
import AtualizarGastosVariados from './Src/Screens/AtualizarGastosVariados';
import AtualizarInvestimentos from './Src/Screens/AtualizarInvestimentos';
import AtualizarReservaEmergencia from './Src/Screens/AtualizarReservaEmergencia';
import { createAsyncStorage } from "@react-native-async-storage/async-storage";
Stack = createNativeStackNavigator()
export default function Navigation() {

  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function buscaDados() {
      try {
        const tokenSalvo = await storage.getItem('token');
        const usuarioSalvo = await storage.getItem('usuario');
        setToken(tokenSalvo);
        setUsuario(usuarioSalvo);
      } catch (erro) {
        console.log(erro);
      }
    }
    buscaDados();
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="VerificacaoEmail" component={VerificacaoEmail} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Route" component={Route} />
        <Stack.Screen name="CadastroGastosVariaveis" component={CadastroGastosVariaveis} />
        <Stack.Screen name="CadastroGanhosFixos" component={CadastroGanhosFixos} />
        <Stack.Screen name="CadastroGanhosVariaveis" component={CadastroGanhosVariaveis} />
        <Stack.Screen name="CadastroInvestimentos" component={CadastroInvestimentos} />
        <Stack.Screen name="CadastroReservaEmergencia" component={CadastroReservaEmergencia} />
        <Stack.Screen name="CadastroGastosFixosV" component={CadastroGastosFixosV} />
        <Stack.Screen name="AtualizarGastosVariados" component={AtualizarGastosVariados} />
        <Stack.Screen name="AtualizarGastosFixos" component={AtualizarGastosFixos} />
        <Stack.Screen name="AtualizarGanhosVariados" component={AtualizarGanhosVariados} />
        <Stack.Screen name="AtualizarGanhosFixos" component={AtualizarGanhosFixos} />
        <Stack.Screen name="AtualizarInvestimentos" component={AtualizarInvestimentos} />
        <Stack.Screen name="AtualizarReservaEmergencia" component={AtualizarReservaEmergencia} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
