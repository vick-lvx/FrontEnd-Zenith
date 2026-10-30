import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-gifted-charts';
import { BarChart } from 'react-native-gifted-charts';

function Home() {
    const data1 = [
        { value: 70 },
        { value: 36 },
        { value: 50 },
        { value: 40 },
        { value: 18 },
        { value: 38 },
    ];
    const data2 = [
        { value: 50 },
        { value: 10 },
        { value: 45 },
        { value: 30 },
        { value: 45 },
        { value: 18 },
    ];

    const ptData = [
        { value: 160, date: '1 Apr 2022' },
        { value: 180, date: '2 Apr 2022' },
        { value: 190, date: '3 Apr 2022' },
        { value: 180, date: '4 Apr 2022' },
        { value: 140, date: '5 Apr 2022' },
        { value: 145, date: '6 Apr 2022' },
        { value: 160, date: '7 Apr 2022' },
        { value: 200, date: '8 Apr 2022' },

        { value: 220, date: '9 Apr 2022' },
        {
            value: 240,
            date: '10 Apr 2022',
            label: '10 Apr',
            labelTextStyle: { color: 'lightgray', width: 60 },
        },
        { value: 280, date: '11 Apr 2022' },
        { value: 260, date: '12 Apr 2022' },
        { value: 340, date: '13 Apr 2022' },
        { value: 385, date: '14 Apr 2022' },
        { value: 280, date: '15 Apr 2022' },
        { value: 390, date: '16 Apr 2022' },

        { value: 370, date: '17 Apr 2022' },
        { value: 285, date: '18 Apr 2022' },
        { value: 295, date: '19 Apr 2022' },
        {
            value: 300,
            date: '20 Apr 2022',
            label: '20 Apr',
            labelTextStyle: { color: 'lightgray', width: 60 },
        },
        { value: 280, date: '21 Apr 2022' },
        { value: 295, date: '22 Apr 2022' },
        { value: 260, date: '23 Apr 2022' },
        { value: 255, date: '24 Apr 2022' },

        { value: 190, date: '25 Apr 2022' },
        { value: 220, date: '26 Apr 2022' },
        { value: 205, date: '27 Apr 2022' },
        { value: 230, date: '28 Apr 2022' },
        { value: 210, date: '29 Apr 2022' },
        {
            value: 200,
            date: '30 Apr 2022',
            label: '30 Apr',
            labelTextStyle: { color: 'lightgray', width: 60 },
        },
        { value: 240, date: '1 May 2022' },
        { value: 250, date: '2 May 2022' },
        { value: 280, date: '3 May 2022' },
        { value: 250, date: '4 May 2022' },
        { value: 210, date: '5 May 2022' },
    ];

    return (
        <View style={styles.fundo}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.overlay}>
                {/* CABEÇALHO DO APP */}
                <View style={styles.cabecalho}>
                    <View>
                        <Text style={styles.bem_vindo}>Bem-vindo(a) de volta</Text>
                        <Text style={styles.nome_usuario}>Usuario</Text>
                    </View>
                    <Pressable style={styles.botao}>
                        <Ionicons style={styles.icone_olho} name='eye-outline' size={16} color="#ffffffad"></Ionicons>
                        <Text style={styles.ocultar}>Ocultar</Text>
                    </Pressable>
                </View>
                <View>
                    <Text style={styles.titulo}>Início</Text>
                    <View style={styles.card}>
                        <View style={[styles.card_saldo, styles.coluna]}>
                            <LinearGradient colors={['#131A2A', '#1A2235', '#131A2A']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.card_saldo}>
                                <Text style={styles.texto_saldo}>SALDO ATUAL</Text>
                                <Text style={styles.texto_sifrao_saldo}>R$</Text>
                                <Text style={styles.texto_dinheiro_saldo}>8.400,75</Text>
                            </LinearGradient>
                        </View>
                        <View style={styles.coluna}>
                            <LinearGradient colors={['#5b25da1a', '#3c208f5c', '#131a2a']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.card_reserva}>
                                <Text style={styles.texto_reserva}>RESERVA DE</Text>
                                <Text style={styles.texto_emergencia}>EMERGÊNCIA</Text>
                                <Text style={styles.texto_sifrao}>R$</Text>
                                <Text style={styles.texto_dinheiro}>15.400,00</Text>
                            </LinearGradient>
                        </View>
                    </View>
                    <View>
                        <View
                            style={{
                                paddingVertical: 100,
                                paddingLeft: 20,
                                backgroundColor: '#1C1C1C',
                            }}>
                            <LineChart
                                areaChart
                                curved
                                data={data1}
                                data2={data2}
                                hideDataPoints
                                spacing={68}
                                color1="#8a56ce"
                                color2="#56acce"
                                startFillColor1="#8a56ce"
                                startFillColor2="#56acce"
                                endFillColor1="#8a56ce"
                                endFillColor2="#56acce"
                                startOpacity={0.9}
                                endOpacity={0.2}
                                initialSpacing={0}
                                noOfSections={4}
                                yAxisColor="white"
                                yAxisThickness={0}
                                rulesType="solid"
                                rulesColor="gray"
                                yAxisTextStyle={{ color: 'gray' }}
                                yAxisLabelSuffix="%"
                                xAxisColor="lightgray"
                                pointerConfig={{
                                    pointerStripUptoDataPoint: true,
                                    pointerStripColor: 'lightgray',
                                    pointerStripWidth: 2,
                                    strokeDashArray: [2, 5],
                                    pointerColor: 'lightgray',
                                    radius: 4,
                                    pointerLabelWidth: 100,
                                    pointerLabelHeight: 120,
                                    pointerLabelComponent: items => {
                                        return (
                                            <View
                                                style={{
                                                    height: 120,
                                                    width: 100,
                                                    backgroundColor: '#282C3E',
                                                    borderRadius: 4,
                                                    justifyContent: 'center',
                                                    paddingLeft: 16,
                                                }}>
                                                <Text style={{ color: 'lightgray', fontSize: 12 }}>{2018}</Text>
                                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{items[0].value}</Text>
                                                <Text style={{ color: 'lightgray', fontSize: 12, marginTop: 12 }}>{2019}</Text>
                                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{items[1].value}</Text>
                                            </View>
                                        );
                                    },
                                }}
                            />
                        </View>

                    </View>
                    <View>
                        <View
                            style={{
                                paddingVertical: 100,
                                paddingLeft: 20,
                                backgroundColor: '#1C1C1C',
                            }}>
                            <LineChart
                                areaChart
                                data={ptData}
                                rotateLabel
                                width={300}
                                hideDataPoints
                                spacing={10}
                                color="#00ff83"
                                thickness={2}
                                startFillColor="rgba(20,105,81,0.3)"
                                endFillColor="rgba(20,85,81,0.01)"
                                startOpacity={0.9}
                                endOpacity={0.2}
                                initialSpacing={0}
                                noOfSections={6}
                                maxValue={600}
                                yAxisColor="white"
                                yAxisThickness={0}
                                rulesType="solid"
                                rulesColor="gray"
                                yAxisTextStyle={{ color: 'gray' }}
                                yAxisSide='right'
                                xAxisColor="lightgray"
                                pointerConfig={{
                                    pointerStripHeight: 160,
                                    pointerStripColor: 'lightgray',
                                    pointerStripWidth: 2,
                                    pointerColor: 'lightgray',
                                    radius: 6,
                                    pointerLabelWidth: 100,
                                    pointerLabelHeight: 90,
                                    activatePointersOnLongPress: true,
                                    autoAdjustPointerLabelPosition: false,
                                    pointerLabelComponent: items => {
                                        return (
                                            <View
                                                style={{
                                                    height: 90,
                                                    width: 100,
                                                    justifyContent: 'center',
                                                    marginTop: -30,
                                                    marginLeft: -40,
                                                }}>
                                                <Text style={{ color: 'white', fontSize: 14, marginBottom: 6, textAlign: 'center' }}>
                                                    {items[0].date}
                                                </Text>

                                                <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: 'white' }}>
                                                    <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                        {'$' + items[0].value + '.0'}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    },
                                }}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fundo: {
        flex: 1,
        backgroundColor: '#0d0f14'
    },
    overlay: {
        paddingTop: 35,
    },
    scroll: {
        flex: 1
    },
    conteudoScroll: {
        paddingBottom: 16
    },
    cabecalho: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#131a2ac3',
        width: '100%',
        height: 50,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ffffff14',
    },
    bem_vindo: {
        color: '#8E939E',
        fontSize: 12,
    },
    nome_usuario: {
        color: '#F0EFFF',
        fontSize: 17,
        marginTop: 2,
        fontWeight: 'semibold',
    },
    ocultar: {
        color: '#ffffffad',
        fontSize: 11,
        marginStart: 6
    },
    botao: {
        flexDirection: 'row',
        backgroundColor: '#ffffff1e',
        padding: 6,
        paddingEnd: 10,
        paddingStart: 10,
        borderRadius: 59459600,
    },
    titulo: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginStart: 32,
        marginTop: 16,
        marginBottom: 8
    },
    card: {
        flexDirection: 'row',
        width: '100%',
        height: 100,
    },
    coluna: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card_saldo: {
        flexDirection: 'column',
        width: 165,
        height: 125,
        borderRadius: 16,
    },
    card_reserva: {
        flexDirection: 'column',
        width: 165,
        height: 125,
        borderRadius: 16,
        marginTop: 25,
    },
    texto_saldo: {
        color: '#8E939E',
        fontSize: 10,
        marginTop: 20,
        marginStart: 16
    },
    texto_reserva: {
        color: '#8E939E',
        fontSize: 10,
        marginTop: 12,
        marginStart: 10
    },
    texto_emergencia: {
        color: '#8E939E',
        fontSize: 10,
        marginStart: 10
    },
    texto_sifrao: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#F0EFFF',
        marginStart: 12,
        marginTop: 7
    },
    texto_dinheiro: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#F0EFFF',
        marginStart: 12,
    },
    texto_sifrao_saldo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#F0EFFF',
        marginStart: 12,
        marginTop: 12
    },
    texto_dinheiro_saldo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#F0EFFF',
        marginStart: 12,
    }
});

export default Home;