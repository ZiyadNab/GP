import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, ActivityIndicator, Text, Image, View } from 'react-native';
import { Fontisto, Entypo, Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../../database'
import { useRoute, CommonActions } from '@react-navigation/native';
import BottomSheet from '../helpers/BottomSheet'
import { GestureHandlerRootView, FlatList, ScrollView } from 'react-native-gesture-handler'
import {
    doc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    getDoc,
    arrayRemove,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function SessionDetails({ navigation }) {

    const renderItem = ({ item, index }) => (
        <View style={styles.item}>

            <View style={{
                flexDirection: 'row',
                width: '90%',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>

                <View style={{
                    flexDirection: 'row',
                }}>
                    <Image source={{ uri: item.icon }} style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                    }} />

                    <View style={{
                        flexDirection: 'column',
                        marginLeft: 20,
                        justifyContent: 'center'
                    }}>
                        <Text>{item.PlayerTotalBalance} Stock Profit</Text>
                        <Text style={{
                            fontWeight: 'bold',
                            fontSize: 18
                        }}>{item.PlayerName}</Text>
                    </View>
                </View>

                <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                }}>#{index + 1}</Text>

            </View>
        </View>
    );

    const bottomSheetRef = useRef(null);
    const [leaderBoard, setLeaderBoard] = useState([])
    const [loading, setLoading] = useState(true)
    const [balance, setBalance] = useState("0")
    const [profit, setProfit] = useState("0")
    const [startDate, setStartDate] = useState(null)
    const [sortedLeaderBoard, setSortedLeaderBoard] = useState([])
    const [endDate, setEndDate] = useState(null)
    const [sessionBalance, setSessionBalance] = useState(null)
    const [playersCount, setPlayersCount] = useState(null)
    const [owner, setOwner] = useState(null)
    const [sessionName, setSessionName] = useState(null)
    const [sessionImage, setSessionImage] = useState(null)
    const route = useRoute();
    const receivedData = route.params?.sessionId;

    useEffect(() => {
        bottomSheetRef.current?.scrollTo(-300)
        const docRef = doc(db, 'sessions', receivedData)

        const unsubscribe = onSnapshot(docRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                setSessionImage(docSnapshot.data().icon)
                setSessionName(docSnapshot.data().sessionName)
                setPlayersCount(docSnapshot.data().players.length)
                setSessionBalance(docSnapshot.data().startBalance)
                setEndDate(docSnapshot.data().endDate)
                setStartDate(docSnapshot.data().startDate)

                // Get owner data
                if (!owner) {
                    const docRef = doc(db, 'users', docSnapshot.data().owner)
                    const ownerData = await getDoc(docRef)
                    if (ownerData.exists()) setOwner(ownerData.data().fullname)
                    else setOwner("Unkown")
                }

                const newLeaderBoard = [];

                for (const e of docSnapshot.data().players) {
                    const playerStats = {
                        PlayerName: null,
                        PlayerTotalBalance: 0,
                        icon: null,
                        gain: 0,
                    };

                    const docRef = doc(db, 'users', e.userId);
                    const playerData = await getDoc(docRef);

                    if (playerData.exists()) {
                        playerStats.PlayerName = playerData.data().fullname;
                        playerStats.icon = playerData.data().icon;
                    }

                    if (e.userId === auth.currentUser.uid) setBalance(e.portfolio.balance.toString().split('.'))

                    // Use Promise.all to wait for all fetch operations to complete
                    await Promise.all(e.portfolio.assets.map(async (v) => {
                        const res = await fetch(`https://eodhd.com/api/real-time/${v.title}.${v.region}?api_token=659429ddd804e2.44750789&fmt=json`);
                        const json = await res.json();
                        const val = json.close * Number(v.amount);
                        playerStats.PlayerTotalBalance += val;
                    }));

                    newLeaderBoard.push(playerStats);
                }

                // Update the state with the newLeaderBoard array
                setLeaderBoard(newLeaderBoard);
                setLoading(false)
            }

        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    };

    async function leaveSession() {

        const docRef = doc(db, 'users', auth.currentUser.uid);
        const dataRef = await getDoc(docRef);
        if (dataRef.exists()) {
            await updateDoc(docRef, {
                "portfolio.sessions": arrayRemove(receivedData)
            })

            const doccRef = doc(db, 'sessions', receivedData)
            const sessionRef = await getDoc(doccRef);
            if (sessionRef.exists()) {
                if (sessionRef.data().players.length > 1) {
                    const indexToRemove = sessionRef.data().players.findIndex(player => player.userId === auth.currentUser.uid);
                    await updateDoc(doccRef, {
                        "players": arrayRemove(sessionRef.data().players[indexToRemove])
                    })
                } else await deleteDoc(doccRef)
            }

            navigation.goBack()
        }
    }

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function format(a) {
        const date = new Date(a);

        const dayOfWeek = daysOfWeek[date.getDay()];
        const month = months[date.getMonth()];
        const dayOfMonth = date.getDate();
        const year = date.getFullYear();

        return `${dayOfWeek}, ${month} ${dayOfMonth}, ${year}`
    };

    return (

        <GestureHandlerRootView style={styles.container}>

            <View style={{
                flexDirection: 'row',
                marginTop: 60,
                width: '90%',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>

                <View style={{
                    flexDirection: 'row',
                }}>
                    <Image source={{ uri: sessionImage }} style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                    }} />

                    <View style={{
                        flexDirection: 'column',
                        marginLeft: 20,
                    }}>
                        <Text>Welcome back</Text>
                        <Text style={{
                            fontWeight: 'bold',
                            fontSize: 18
                        }}>{sessionName}</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={() => leaveSession()}>
                    <MaterialIcons name="logout" size={30} color={"red"} />
                </TouchableOpacity>

            </View>

            <View style={{
                backgroundColor: '#434343',
                width: '90%',
                padding: 20,
                marginTop: 20,
                borderRadius: 5
            }}>

                <Text style={{
                    color: 'white'
                }}>Your total balance</Text>

                <Text style={{
                    fontSize: 25,
                    fontWeight: 'bold',
                    color: 'white'
                }}>

                    {"$" + balance[0]}
                    <Text style={{ fontSize: 15, color: 'white' }}>.{balance[1] ? balance[1].substring(0, 2) : '00'}</Text>
                </Text>

                <View style={{
                    backgroundColor: '#515151',
                    padding: 15,
                    marginTop: 20,
                    borderRadius: 2,
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    <Text style={{
                        color: 'white'
                    }}>Total Profit</Text>
                    <Text style={{
                        fontWeight: 'bold',
                        color: 'white'
                    }}>${profit}</Text>
                </View>

            </View>

            <View style={{ width: '90%', height: 100, margin: 20, flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>

                <View>
                    <View style={{ flexDirection: 'row', margin: 2 }}>
                        <FontAwesome name="calendar-check-o" size={20} color='green' />
                        <Text style={{ marginLeft: 4 }}>{`${format(startDate)}`}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', margin: 2 }}>
                        <FontAwesome name="calendar-times-o" size={20} color='red' />
                        <Text style={{ marginLeft: 4 }}>{`${format(endDate)}`}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', margin: 2 }}>
                        <Feather name="user" size={20} color='black' />
                        <Text style={{ marginLeft: 4, maxWidth: 150 }}>{`${owner}`}</Text>
                    </View>
                </View>

                <View>
                    <View style={{ flexDirection: 'row', margin: 2 }}>
                        <Feather name="users" size={20} color='black' />
                        <Text style={{ marginLeft: 4 }}>{`${playersCount} player`}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', margin: 2 }}>
                        <Fontisto name="dollar" size={20} color='black' />
                        <Text style={{ marginLeft: 4 }}>{`${sessionBalance}`}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', margin: 2 }}>
                        <Entypo name="newsletter" size={20} color='black' />
                        <Text style={{ marginLeft: 4 }}>{`${receivedData}`}</Text>
                    </View>
                </View>



            </View>
            <TouchableOpacity onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'WalletScreen' }))} style={{ width: '70%', height: 45, backgroundColor: '#0085FF', borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}
            >
                <Text style={{ fontSize: 20, color: 'white' }}> GO TO WALLET </Text>
            </TouchableOpacity>

            <BottomSheet ref={bottomSheetRef}>

                <View style={{ width: '100%', backgroundColor: 'lightgray', borderTopRightRadius: 30, borderTopLeftRadius: 30, marginBottom: '80%', height: 355 }}>
                    <FlatList
                        data={leaderBoard}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        style={{ borderTopRightRadius: 30, borderTopLeftRadius: 30 }}
                    />

                </View>
            </BottomSheet>

        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',

    },
    SessionNameStyle: {
        fontSize: 50,
        marginBottom: 10,
    },
    playerText: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingBottom: 10,
        textAlign: 'center',
    },
    item: {
        padding: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
});