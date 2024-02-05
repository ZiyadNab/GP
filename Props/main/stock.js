import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Text, Dimensions } from 'react-native';
// import { CandlestickChart } from 'react-native-wagmi-charts';
import { useRoute } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { auth, db } from '../../database'
import Toast from 'react-native-toast-message'
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    arrayRemove,
    arrayUnion,
    getDoc,
} from "firebase/firestore";

const intervals = {
    '1 Hour': 60 * 60,
    '1 Day': 24 * 60 * 60,
    '7 Days': 7 * 24 * 60 * 60,
    '1 Month': 30 * 24 * 60 * 60,
    '6 Months': 6 * 30 * 24 * 60 * 60,
    '1 Year': 365 * 24 * 60 * 60,
};

export default function Stock({ navigation }) {
    const screenWidth = Dimensions.get('window').width * 0.9;
    const route = useRoute();
    const receivedData = route.params?.data;
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(null);
    const [selectedInterval, setSelectedInterval] = useState('1 Day');
    const [canbuy, setCanbuy] = useState(false)

    useEffect(() => {
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        fetch(`https://eodhd.com/api/intraday/${receivedData.title}.${receivedData.region}?from=${currentTimeInSeconds - intervals[selectedInterval]}&to=${currentTimeInSeconds}&interval=${selectedInterval === "1 Hour" ? '1m' : selectedInterval === "1 Day" ? '5m' : '1h'}&api_token=659429ddd804e2.44750789&fmt=json`)
            .then(async (res) => {
                const json = await res.json();
                setChartData(json);

                await fetch(`https://eodhd.com/api/exchange-details/${receivedData.region}?api_token=659429ddd804e2.44750789&fmt=json`)
                    .then(async (res) => {
                        const json = await res.json();
                        setCanbuy(json.isOpen);
                    });

                setLoading(false);
            });

    }, [selectedInterval]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={{
            alignItems: 'center',
            flex: 1
        }}>

            <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                maxWidth: 350,
                marginTop: 50
            }}>{receivedData.title}, {receivedData.name}</Text>

            {/* <View style={{
                margin: 10,
                backgroundColor: '#E8E8E8',
                borderRadius: 5,
                width: '90%'
            }}>
                <CandlestickChart.Provider data={chartData}>
                    <CandlestickChart width={screenWidth} height={screenWidth}>
                        <CandlestickChart.Candles />
                        <CandlestickChart.Crosshair>
                            <CandlestickChart.Tooltip />
                        </CandlestickChart.Crosshair>
                    </CandlestickChart>
                </CandlestickChart.Provider>
            </View> */}

            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
            }}>
                {Object.keys(intervals).map((interval, index) => (
                    <TouchableOpacity
                        style={{
                            marginHorizontal: 5,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 20,
                            marginBottom: index % 3 === 2 ? 10 : 0, // Add margin-bottom every third interval
                        }}
                        key={interval}
                        onPress={() => setSelectedInterval(interval)}
                    >
                        <View style={{
                            backgroundColor: selectedInterval === interval ? '#1573FE' : '#E3E3E3',
                            width: 75,
                            height: 30,
                            borderRadius: 5,
                        }}>
                            <Text
                                style={{
                                    color: selectedInterval === interval ? 'white' : 'black',
                                    textAlign: 'center',
                                    textAlignVertical: 'center',
                                    lineHeight: 30,
                                }}
                            >
                                {interval}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>


            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'center',
                position: 'absolute',
                bottom: 100,
            }}>
                <TouchableOpacity
                    disabled={canbuy}
                    onPress={() => navigation.navigate("marketWallet", { data: receivedData, type: 'trade' })}
                    style={{
                        height: 50,
                        width: '75%',
                        backgroundColor: canbuy ? '#1573FE' : 'red',
                        borderRadius: 5,
                        marginRight: 10,
                        alignItems: 'center',
                        justifyContent: 'center',

                    }}>
                    <Text style={{
                        width: '100%',
                        height: '100%',
                        color: 'white',
                        textAlign: 'center',
                        textAlignVertical: 'center',
                        fontSize: 25,
                        fontWeight: 'bold',
                        lineHeight: 50, // Set lineHeight to match the height of the TouchableOpacity
                    }}>Trade</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate("marketWallet", { data: receivedData, type: 'fav' })}
                    style={{
                        padding: 10,
                        width: 50,
                        height: 50,
                        backgroundColor: '#FFD700',
                        borderRadius: 5,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                    <AntDesign name="star" size={25} color='white' />
                </TouchableOpacity>
            </View>
            <Toast />
        </View>
    );
}
