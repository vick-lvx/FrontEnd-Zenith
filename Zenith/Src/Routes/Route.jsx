
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Screens/Home';
import Extrato from '../Screens/Extrato';
import PerfilUsuario from '../Screens/PerfilUsuario';
import BarraNavegacao from '../components/BarraNavegacao';

const Tab = createBottomTabNavigator();

function Route() {
    return (
        <Tab.Navigator initialRouteName="Home" tabBar={(props) => <BarraNavegacao {...props} />} screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Extrato" component={Extrato} />
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Perfil" component={PerfilUsuario} />
        </Tab.Navigator>
    );
}

export default Route;
