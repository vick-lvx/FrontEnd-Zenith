import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './Src/Screens/Login';
import VerificacaoEmail from './Src/Screens/ResetSenha';
import Cadastro from './Src/Screens/Cadastro';
import Route from './Src/Routes/Route';
import CadastroGastos from './Src/Screens/CadastroGastos';
import CadastroGanhos from './Src/Screens/CadastroGanhos';
import CadastroInvestimentos from './Src/Screens/CadastroInvestimentos';
import CadastroReservaEmergencia from './Src/Screens/CadastroReservaEmergencia';
import Home from './Src/Screens/Home';
const Stack = createNativeStackNavigator();

export default function Navigation() {
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