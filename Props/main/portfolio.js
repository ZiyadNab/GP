import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native';
import { Settings, CalendarClock, ChevronUp } from 'lucide-react-native';
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
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
} from "react-native-reanimated";

export default function Portfolio({ navigation }) {

    const [portfolio, setPortfolio] = useState([])
    const [loading, setLoading] = useState(true)
    const route = useRoute();
    const receivedData = route.params?.portfolio;

    const footerVisibility = useSharedValue(1);
    const footerHeight = useDerivedValue(() => {
        return interpolate(footerVisibility.value, [0, 1], [370, 370]);
    });

    useEffect(() => {

        async function getData() {
            if (receivedData === "personal") {
                const docRef = doc(db, "users", auth.currentUser.uid)
                const docData = await getDoc(docRef)
                if (docData.exists()) {
                    setPortfolio(docData.data().portfolio)
                    setLoading(false)
                }
            } else {

                const docRef = doc(db, "sessions", receivedData)
                const docData = await getDoc(docRef)
                if (docData.exists()) {

                    docData.data().players.forEach((e) => {
                        if(e.userId === auth.currentUser.uid){
                            setPortfolio(e.portfolio)
                            setLoading(false)
                            return
                        }
                    })
                }
            }
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

                    <Settings style={{ top: 5 }} color='black' size={25} />
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
                                {"$" + portfolio.balance.toString().split('.')[0]}
                                <Text style={{ fontSize: 20, color: 'gray' }}>.{portfolio.balance.toString().split('.')[1] ? portfolio.balance.toString().split('.')[1].substring(0, 2) : '00'}</Text>
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

                    <TouchableOpacity onPress={() => { navigation.navigate("HistoryScreen") }} style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: 'white',
                        justifyContent: 'center',
                        alignItems: 'center',
                        top: 10
                    }}>
                        <CalendarClock color='black' size={25} />
                    </TouchableOpacity>
                </View>
            </View>



            <View style={{
                alignItems: 'center'
            }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '90%',
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
                    }}>View all</Text>
                </View>

                <View style={{ height: 200, }}>
                    <ScrollView showsHorizontalScrollIndicator={false} horizontal>
                        {portfolio.assets.length ? portfolio.assets.map((item, index) => (
                            <View key={index} style={{
                                backgroundColor: '#fff',
                                padding: 10,
                                elevation: 3,
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
                                                source={item.icon}
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: 25,
                                                }}
                                            />
                                            <View style={{ marginLeft: 10 }}>
                                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.title}</Text>
                                                <Text style={{ fontSize: 15 }}>{item.name}</Text>
                                            </View>
                                        </View>

                                        {item.rising ? <ChevronUp color='#0DA070' size={30} /> : <ChevronDown color='#E01B2A' size={30} />}
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                                        <Text style={{
                                            fontSize: 25,
                                            fontWeight: 'bold',
                                            color: 'black'
                                        }}>
                                            ${item.price.int}
                                            <Text style={{ fontSize: 20, color: '#757575' }}>.{item.price.decimal}</Text>
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
                                                ${item.single.int}
                                                <Text style={{ fontSize: 15, color: '#E0E0E0' }}>.{item.single.decimal}</Text>
                                            </Text>
                                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: item.rising ? '#0DA070' : '#E01B2A' }}>{item.percantage}%</Text>
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

            <View style={{ width: '100%', height: 215 }}>
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
                    }}>View all</Text>
                </View>

                {portfolio.watchlist.length ? (
                    <NotificationsList
                        footerVisibility={footerVisibility}
                        footerHeight={footerHeight}
                        watchlist={portfolio.watchlist}
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