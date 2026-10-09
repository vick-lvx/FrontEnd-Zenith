import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import Login from './Src/Screens/Login';
import VerificacaoEmail from './Src/Screens/ResetSenha';
import Cadastro from './Src/Screens/Cadastro';
import Route from './Src/Routes/Route';
import CadastroGastos from './Src/Screens/CadastroGastos';
import CadastroGanhos from './Src/Screens/CadastroGanhos';
import CadastroInvestimentos from './Src/Screens/CadastroInvestimentos';
import CadastroReservaEmergencia from './Src/Screens/CadastroReservaEmergencia';
import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import Home from './Src/Screens/Home';
const Stack = createNativeStackNavigator();
const storage = createAsyncStorage('Zenith');
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
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="VerificacaoEmail" component={VerificacaoEmail} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Cadastro" component={Cadastro} options={{ headerShown: false }} />
        <Stack.Screen name="Route" component={Route} options={{ headerShown: false }} />
        <Stack.Screen name="CadastroGastos" component={CadastroGastos} options={{ headerShown: false }} />
        <Stack.Screen name="CadastroGanhos" component={CadastroGanhos} options={{ headerShown: false }} />
        <Stack.Screen name="CadastroInvestimentos" component={CadastroInvestimentos} options={{ headerShown: false }} />
        <Stack.Screen name="CadastroReservaEmergencia" component={CadastroReservaEmergencia} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}