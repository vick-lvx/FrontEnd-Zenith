import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import routes from '../Routes/Route'


const BarraNavegacao = ({ state, descriptors, navigation }) => {

    const icones = {
        Extrato: 'document-text-outline',
        Home: 'home-outline',
        Perfil: 'person-outline',
    };

    return (
        <View style={styles.container}>

            <View style={styles.barra}>

                {state.routes.map((route, index) => {

                    const isFocused = state.index === index;

                    const onPress = () => {

                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }

                    };

                    const icone = icones[route.name];

                    return (
                        <Pressable key={route.key} onPress={onPress} style={styles.botao}>

                            {isFocused ? (
                                <LinearGradient colors={['#1B1D7C', '#7879FA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconeSelecionado}>
                                    <Ionicons name={icone} size={23} color="#FFFFFF"/>
                                </LinearGradient>
                                 ):

                                (
                                <View style={styles.iconeNormal}>
                                    <Ionicons name={icone} size={23} color="#5A6A8A" />
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>

        </View>
    );
};

const styles = StyleSheet.create({

    container: {
        position: 'absolute',
        bottom: 20,
        left: 15,
        right: 15,
        height: 62,
    },

    barra: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',

        backgroundColor: '#0E1832',

        borderWidth: 1.76,
        borderColor: '#FFFFFF17',

        borderRadius: 25,

        overflow: 'hidden',

        shadowColor: '#FFFFFF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.10,
        shadowRadius: 8,

        elevation: 8,
    },

    botao: {
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconeSelecionado: {
        width: 36,
        height: 36,
        borderRadius: 18,

        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: '#7879FA',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.45,
        shadowRadius: 7,

        elevation: 7,
    },

    iconeNormal: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },

});

export default BarraNavegacao;