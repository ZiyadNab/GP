import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Text, Dimensions, Modal, Image, ScrollView } from 'react-native';
import { CandlestickChart, LineChart } from 'react-native-wagmi-charts';
import { useRoute } from '@react-navigation/native';
import { Star, StarIcon } from 'lucide-react-native';
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
    '1 Day': 24 * 60 * 60, // 1 day in seconds
    '7 Days': 7 * 24 * 60 * 60, // 7 days in seconds
    '1 Month': 30 * 24 * 60 * 60, // 1 month (approximation) in seconds
};

export default function Stock({ navigation }) {
    const screenWidth = Dimensions.get('window').width * 0.9;
    const route = useRoute();
    const receivedData = route.params?.data;
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(null);
    const [selectedInterval, setSelectedInterval] = useState('1 Day');
    const [addedFav, setAddedFav] = useState(false)
    console.log(receivedData)

    async function addFav() {

        // Update the Firestore document
        const docRef = doc(db, "users", auth.currentUser.uid);

        if (addedFav) {

            try {
                await updateDoc(docRef, {
                    'portfolio.watchlist': arrayRemove(receivedData)
                })

                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: `The ${receivedData.title}, ${receivedData.name} has been removed to your watchlist successfully!`,
                    visibilityTime: 5000,
                    autoHide: true
                })

            } catch (error) {
                // Handle any errors that occur during the update (optional)
                console.error("Error updating user information:", error);
            }
        } else {

            try {
                await updateDoc(docRef, {
                    'portfolio.watchlist': arrayUnion(receivedData)
                })

                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: `The ${receivedData.title}, ${receivedData.name} has been added to your watchlist successfully!`,
                    visibilityTime: 5000,
                    autoHide: true
                })

            } catch (error) {
                // Handle any errors that occur during the update (optional)
                console.error("Error updating user information:", error);
            }
        }

        setAddedFav(!addedFav)

    }

    useEffect(() => {
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        fetch(`https://eodhd.com/api/intraday/${receivedData.title}.${receivedData.region}?from=${currentTimeInSeconds - intervals[selectedInterval]}&to=${currentTimeInSeconds}&interval=1h&api_token=659429ddd804e2.44750789&fmt=json`)
            .then(async (res) => {
                const json = await res.json();
                setChartData(json);
                setLoading(false);
            });

        const docRef = doc(db, "users", auth.currentUser.uid);
        getDoc(docRef)
            .then(async res => {
                setAddedFav(res.data().portfolio.watchlist.some(item => item.title === receivedData.title))

            })

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
            justifyContent: 'center',

        }}>

            <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                maxWidth: 350,
                marginTop: 50
            }}>{receivedData.title}, {receivedData.name}</Text>

            <View style={{
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
            </View>

            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {Object.keys(intervals).map((interval) => (
                    <TouchableOpacity
                        style={{
                            marginHorizontal: 5,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        key={interval}
                        onPress={() => setSelectedInterval(interval)}
                    >
                        <Text
                            style={{
                                backgroundColor: selectedInterval === interval ? '#1573FE' : '#E3E3E3',
                                color: selectedInterval === interval ? 'white' : 'black',
                                width: 75,
                                height: 30,
                                textAlign: 'center',
                                textAlignVertical: 'center',
                                borderRadius: 5,
                            }}
                        >
                            {interval}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'center',
                marginTop: 200
            }}>
                <TouchableOpacity onPress={() => navigation.navigate("marketWallet", { data: receivedData }) } style={{
                    height: 50,
                    width: '75%',
                    backgroundColor: '#1573FE',
                    borderRadius: 5,
                    marginRight: 10
                }}>
                    <Text style={{
                        width: '100%',
                        height: '100%',
                        color: 'white',
                        textAlign: 'center',
                        textAlignVertical: 'center',
                        fontSize: 25,
                        fontWeight: 'bold'
                    }}>Trade</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addFav} style={{
                    padding: 10,
                    width: '13%',
                    backgroundColor: '#FFD700',
                    borderRadius: 5,
                }}>
                    {
                        addedFav ? (
                            <Star size={30} fill='white' color='white' />
                        ) : (
                            <Star size={30} color='white' />
                        )
                    }
                </TouchableOpacity>
            </View>

            <Toast />
        </View>
    );
}
