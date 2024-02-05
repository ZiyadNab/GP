import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import React, { useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import NotificationsList from "../helpers/NotificationList";
import { auth, db } from '../../database'
import {
    doc,
    onSnapshot,
    getDoc,
} from "firebase/firestore";
import Animated, {
    interpolate,
    useDerivedValue,
    useSharedValue,
} from "react-native-reanimated";

export default function Portfolio({ navigation }) {

    const [watchlist, setWatchlist] = useState([])
    const [assets, setAssets] = useState([])
    const [balance, setBalance] = useState(0)
    const [time, setTime] = useState('05:00');
    const [loading, setLoading] = useState(true)
    const route = useRoute();
    const receivedData = route.params?.portfolio;

    const footerVisibility = useSharedValue(1);
    const footerHeight = useDerivedValue(() => {
        return interpolate(footerVisibility.value, [0, 1], [300, 300]);
    });

    useEffect(() => {

        async function getData() {
            if (receivedData === "personal") {
                const docRef = doc(db, "users", auth.currentUser.uid)
                const unsubscribePersonal = onSnapshot(docRef, async (docData) => {

                    if (docData.exists()) {
                        setBalance(docData.data().portfolio.balance)
                        const updatedWatchlist = [];
                        for (const e of docData.data().portfolio.watchlist) {
                            const res = await fetch(`https://eodhd.com/api/real-time/${e.title}.${e.region}?api_token=659429ddd804e2.44750789&fmt=json`);
                            const json = await res.json();
                            json.icon = e.icon;
                            json.name = e.name;
                            json.title = e.title;
                            json.region = e.region;
                            updatedWatchlist.push(json);
                        }

                        setWatchlist(updatedWatchlist);

                        const updatedAssets = [];
                        let prof = 0;

                        for (const e of docData.data().portfolio.assets) {
                            const res = await fetch(`https://eodhd.com/api/real-time/${e.title}.${e.region}?api_token=659429ddd804e2.44750789&fmt=json`);
                            const json = await res.json();
                            json.icon = e.icon;
                            json.name = e.name;
                            json.title = e.title;
                            json.amount = e.amount;
                            json.price = e.price;
                            json.region = e.region;
                            updatedAssets.push(json);
                            prof += json.amount * json.close;
                        }

                        setAssets(updatedAssets);
                        setLoading(false)
                    }
                })
            } else {

                const docRef = doc(db, "sessions", receivedData)
                const docData = await getDoc(docRef)
                if (docData.exists()) {

                    docData.data().players.forEach(async (l) => {
                        if (l.userId === auth.currentUser.uid) {

                            setBalance(l.portfolio.balance)
                            const updatedWatchlist = [];
                            for (const e of l.portfolio.watchlist) {
                                const res = await fetch(`https://eodhd.com/api/real-time/${e.title}.${e.region}?api_token=659429ddd804e2.44750789&fmt=json`);
                                const json = await res.json();
                                json.icon = e.icon;
                                json.name = e.name;
                                json.title = e.title;
                                json.region = e.region;
                                updatedWatchlist.push(json);
                            }

                            setWatchlist(updatedWatchlist);

                            const updatedAssets = [];
                            for (const e of l.portfolio.assets) {
                                const res = await fetch(`https://eodhd.com/api/real-time/${e.title}.${e.region}?api_token=659429ddd804e2.44750789&fmt=json`);
                                const json = await res.json();
                                json.icon = e.icon;
                                json.name = e.name;
                                json.title = e.title;
                                json.amount = e.amount;
                                json.price = e.price;
                                json.region = e.region;
                                updatedAssets.push(json);
                            }

                            setAssets(updatedAssets);
                            setLoading(false)
                            return
                        }
                    })
                }
            }

            // Set up the countdown timer interval
            const timer = setInterval(() => {
                setTime((prevTime) => {
                    const [minutes, seconds] = prevTime.split(':').map(Number);

                    if (minutes === 0 && seconds === 0) {
                        clearInterval(timer);
                        // Trigger your function when the countdown expires
                        handleCountdownExpiration();

                        // Reset the timer to 1:00
                        return '05:00';
                    } else {
                        const newTime =
                            seconds === 0
                                ? `${String(minutes - 1).padStart(2, '0')}:59`
                                : `${String(minutes).padStart(2, '0')}:${String(seconds - 1).padStart(2, '0')}`;

                        return newTime;
                    }
                });
            }, 1000);

            const handleCountdownExpiration = async () => {

                const updatedAssets = [];
                let prof = 0;

                for (const e of assets) {
                    const res = await fetch(`https://eodhd.com/api/real-time/${e.title}.${e.region}?api_token=659429ddd804e2.44750789&fmt=json`);
                    const json = await res.json();
                    json.icon = e.icon;
                    json.name = e.name;
                    json.title = e.title;
                    json.amount = e.amount;
                    json.price = e.price;
                    json.region = e.region;
                    updatedAssets.push(json);
                    prof += json.amount * json.close;
                }

                setProfit(prof.toFixed(2));
                setAssets(updatedAssets);

                const updatedWatchlist = [];

                for (const e of watchlist) {
                    const res = await fetch(`https://eodhd.com/api/real-time/${e.title}.${e.region}?api_token=659429ddd804e2.44750789&fmt=json`);
                    const json = await res.json();
                    json.icon = e.icon;
                    json.name = e.name;
                    json.title = e.title;
                    json.region = e.region;
                    updatedWatchlist.push(json);
                }

                setWatchlist(updatedWatchlist);
            };

            return () => {
                clearInterval(timer);
                unsubscribePersonal();
            };
        }

        getData()
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={{
                backgroundColor: '#DFF1FF',
                aspectRatio: '3/1.7',
                justifyContent: 'flex-end',
                padding: 5,
                paddingBottom: 15

            }}>
                <View style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    marginHorizontal: 20,
                    marginBottom: 40
                }}>
                    <Text style={{
                        fontSize: 30,
                        fontWeight: 'bold'
                    }}>Portfolio</Text>

                    <Feather name="settings" style={{ top: 5 }} color='black' size={25} />
                </View>

                <View style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    marginHorizontal: 20,
                }}>

                    <View>
                        <Text style={{
                            color: 'gray'
                        }}
                        >Portfolio Balance</Text>
                        <View style={{
                            flexDirection: 'row',
                        }}>
                            <Text style={{
                                fontSize: 30,
                                fontWeight: 'bold'
                            }}>
                                {"$" + balance.toString().split('.')[0]}
                                <Text style={{ fontSize: 20, color: 'gray' }}>.{balance.toString().split('.')[1] ? balance.toString().split('.')[1].substring(0, 2) : '00'}</Text>
                            </Text>

                            {/* <View style={{
                                backgroundColor: '#049C6B',
                                width: 70,
                                height: 30,
                                borderRadius: 12,
                                marginHorizontal: 10,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: 5,
                                paddingHorizontal: 10
                            }}>
                                <ChevronUp color='white' size={15} />
                                <Text style={{
                                    color: 'white',
                                    fontWeight: 'bold',
                                    marginHorizontal: 5
                                }}>810%</Text>
                            </View> */}
                        </View>
                    </View>
                </View>
            </View>





            <View style={{
            }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 20,
                    marginTop: 10
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                    }}>Portfolio</Text>

                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#F6227D'
                    }}>{time}</Text>
                </View>

                <View style={{ height: 200 }}>
                    <ScrollView showsHorizontalScrollIndicator={false} horizontal>
                        {assets.length ? assets.map((item, index) => (
                            <View key={index} style={{
                                backgroundColor: '#fff',
                                padding: 10,
                                elevation: 3,
                                shadowOffset: { width: 0, height: 3 / 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 3 / 2,
                                margin: 10,
                                marginLeft: 20,
                                borderRadius: 10,
                                height: 150,
                                width: 250,
                            }}>
                                <View style={{ flex: 1 }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between'
                                    }}>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                            <Image
                                                source={{ uri: item.icon }}
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: 25,
                                                    resizeMode: 'contain'
                                                }}
                                            />
                                            <View style={{ marginLeft: 10 }}>
                                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.title}</Text>
                                                <Text style={{ fontSize: 15, maxWidth: 150 }}>{item.name}</Text>
                                            </View>
                                        </View>

                                        {(item.amount * item.price) === (item.amount * item.close) ? <Entypo name="minus" color='blue' size={30} /> : (item.amount * item.price) < (item.amount * item.close) ? <Entypo name="chevron-up" color='#0DA070' size={30} /> : <Entypo name="chevron-down" color='#E01B2A' size={30} />}
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                                        <Text style={{
                                            fontSize: 25,
                                            fontWeight: 'bold',
                                            color: 'black'
                                        }}>
                                            ${(item.close * Number(item.amount)).toString().split('.')[0]}
                                            <Text style={{ fontSize: 20, color: '#757575' }}>.{(item.close * Number(item.amount)).toString().split('.')[1] ? (item.close * Number(item.amount)).toString().split('.')[1] : "00"}</Text>
                                        </Text>

                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            margin: 1
                                        }}>
                                            <Text style={{
                                                fontSize: 15,
                                                fontWeight: 'bold',
                                                color: '#A8A8A8',
                                                marginRight: 5
                                            }}>
                                                ${item.close.toString().split('.')[0]}
                                                <Text style={{ fontSize: 15, color: '#E0E0E0' }}>.{item.close.toString().split('.')[1] ? item.close.toString().split('.')[1] : "00"}</Text>
                                            </Text>
                                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: item.change_p > 0 ? '#0DA070' : '#E01B2A' }}>{item.change_p.toFixed(2)}%</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                        )) : (
                            <View style={{
                                backgroundColor: '#fff',
                                padding: 10,
                                margin: 10,
                                borderRadius: 10,
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                            }}>

                                <LottieView
                                    style={{
                                        width: 150,
                                        height: 150,
                                    }}
                                    loop={true}
                                    autoPlay={true}
                                    source={require('../../assets/Lottie/PLanding.json')}
                                />

                                <Text>Errr, too early. Please make a purchase first</Text>
                            </View>

                        )}
                    </ScrollView>

                </View>


            </View>

            <View style={{ width: '100%', height: 300 }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 20,
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                    }}>Watchlist</Text>

                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#F6227D'
                    }}>{time}</Text>
                </View>

                {watchlist.length ? (
                    <NotificationsList
                        footerVisibility={footerVisibility}
                        footerHeight={footerHeight}
                        watchlist={watchlist}
                    />
                ) : (
                    <View style={{
                        backgroundColor: '#fff',
                        paddingHorizontal: 75,
                        flexDirection: 'row',
                        marginTop: 30,
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                    }}>

                        <LottieView
                            style={{
                                width: 100,
                                height: 100,
                                marginRight: 40
                            }}
                            loop={true}
                            autoPlay={true}
                            source={require('../../assets/Lottie/WLanding.json')}
                        />

                        <Text style={{
                            marginTop: 50,
                            maxWidth: 200,
                            textAlign: 'left'
                        }}>Your watch list appears to be empty., select a few favorites, and then recheck</Text>
                    </View>
                )}


            </View>


            {/* Set an animation */}
            {/* <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <LottieView
                    style={{
                        width: 300,
                        height: 300,
                    }}
                    loop={true}
                    autoPlay={true}
                    source={require('../../assets/Lottie/NoAssets.json')}
                />

                <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold'
                }}>Not Yet Ordered</Text>
                <Text style={{
                    color: 'gray',
                    marginHorizontal: 30,
                    textAlign: 'center'
                }}>There is no recent stocks you order, let's make your first investment!</Text>

                <TouchableOpacity onPress={() => navigation.navigate("Stock")} style={{
                    marginVertical: 20,
                    width: '90%',
                    backgroundColor: '#1573FE',
                    padding: 15,
                    borderRadius: 10,
                }}>
                    <Text style={{ color: 'white', fontSize: 17, textAlign: 'center' }}>View Stocks</Text>
                </TouchableOpacity>
            </View> */}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

});