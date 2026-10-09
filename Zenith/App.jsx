
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './Src/Screens/Login';
import VerificacaoEmail from './Src/Screens/ResetSenha';
import Cadastro from './Src/Screens/Cadastro';
import Route from './Src/Routes/Route';
import CadastroGastosVariaveis from './Src/Screens/CadastroGastosVariaveis';
import CadastroGastosFixosV from './Src/Screens/CadastroGastosFixosV';
import CadastroGanhosFixos from './Src/Screens/CadastroGanhosFixos';
import CadastroGanhosVariaveis from './Src/Screens/CadastroGanhosVariaveis';
import CadastroInvestimentos from './Src/Screens/CadastroInvestimentos';
import CadastroReservaEmergencia from './Src/Screens/CadastroReservaEmergencia';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="VerificacaoEmail" component={VerificacaoEmail} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="Route" component={Route} />
        <Stack.Screen name="CadastroGastosVariaveis" component={CadastroGastosVariaveis} />
        <Stack.Screen name="CadastroGanhosFixos" component={CadastroGanhosFixos} />
        <Stack.Screen name="CadastroGanhosVariaveis" component={CadastroGanhosVariaveis} />
        <Stack.Screen name="CadastroInvestimentos" component={CadastroInvestimentos} />
        <Stack.Screen name="CadastroReservaEmergencia" component={CadastroReservaEmergencia} />
        <Stack.Screen name="CadastroGastosFixosV" component={CadastroGastosFixosV} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
