import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message'
import { auth, db } from '../../database'
import moment from 'moment';
import {
    doc,
    onSnapshot,
    updateDoc,
    arrayRemove,
    arrayUnion,
    getDoc,
} from "firebase/firestore";

export default function WalletMarket({ navigation }) {
    const route = useRoute();
    const receivedData = route.params?.data;
    const dType = route.params?.type
    const [waletChosen, setWaletChosen] = useState([])
    const [userSessions, setUserSessions] = useState([])
    const [wallets, setWallets] = useState([])
    const [loading, setLoading] = useState(true)
    const [addedFav, setAddedFav] = useState(false)

    const isContestActive = (endDate) => {
        const currentDate = moment();
        const contestEndDate = moment(endDate);

        return contestEndDate.isAfter(currentDate);
    };

    async function addFav() {

        Toast.show({
            type: 'info',
            text1: 'Please Wait',
            text2: `We are working to update your watch list please wait!`,
            visibilityTime: 5000,
            autoHide: true
        })

        if (!waletChosen.includes(0)) {
            const docRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(docRef, {
                'portfolio.watchlist': arrayRemove({
                    icon: receivedData.icon,
                    name: receivedData.name,
                    region: receivedData.region,
                    title: receivedData.title,
                })
            })

        } else {
            const docRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(docRef, {
                'portfolio.watchlist': arrayUnion({
                    icon: receivedData.icon,
                    name: receivedData.name,
                    region: receivedData.region,
                    title: receivedData.title,
                })
            })

        }

        waletChosen.map(async (e, i) => {
            if (e !== 0) {
                const sessionRef = doc(db, "sessions", userSessions[e]);
                const sessionSnap = await getDoc(sessionRef);
                if (sessionSnap.exists()) {
                    const sessionData = sessionSnap.data();

                    const playersArray = []
                    sessionData.players.forEach(async (l, i) => {
                        if (l.userId === auth.currentUser.uid) {

                            const updatedWatchlist = l.portfolio.watchlist
                            const existingIndex = updatedWatchlist.findIndex(
                                (obj) => obj.title === receivedData.title && obj.region === receivedData.region
                            );

                            if (existingIndex === -1) {
                                
                                updatedWatchlist.push({
                                    icon: receivedData.icon,
                                    name: receivedData.name,
                                    region: receivedData.region,
                                    title: receivedData.title,
                                });

                            } else {
                                updatedWatchlist.splice(existingIndex, 1)
                            }
                            
                            playersArray.push(l)

                        } else playersArray.push(l)
                    })

                    await updateDoc(sessionRef, {
                        'players': playersArray
                    })
                }
            }
        })

        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: `Your watchlist has been updated!`,
            visibilityTime: 5000,
            autoHide: true
        })

        // if (addedFav) {

        //     try {

        //         Toast.show({
        //             type: 'success',
        //             text1: 'Success',
        //             text2: `The ${receivedData.title}, ${receivedData.name} has been removed to your watchlist successfully!`,
        //             visibilityTime: 5000,
        //             autoHide: true
        //         })

        //         await updateDoc(docRef, {
        //             'portfolio.watchlist': arrayRemove({
        //                 icon: receivedData.icon,
        //                 name: receivedData.name,
        //                 region: receivedData.region,
        //                 title: receivedData.title,
        //             })
        //         })

        //     } catch (error) {
        //         // Handle any errors that occur during the update (optional)
        //         console.error("Error updating user information:", error);
        //     }
        // } else {

        //     try {

        //         Toast.show({
        //             type: 'success',
        //             text1: 'Success',
        //             text2: `The ${receivedData.title}, ${receivedData.name} has been added to your watchlist successfully!`,
        //             visibilityTime: 5000,
        //             autoHide: true
        //         })

        //         await updateDoc(docRef, {
        //             'portfolio.watchlist': arrayUnion({
        //                 icon: receivedData.icon,
        //                 name: receivedData.name,
        //                 region: receivedData.region,
        //                 title: receivedData.title,
        //             })
        //         })

        //     } catch (error) {
        //         // Handle any errors that occur during the update (optional)
        //         console.error("Error updating user information:", error);
        //     }
        // }


    }

    useEffect(() => {
        const docRef = doc(db, 'users', auth.currentUser.uid)

        const unsubscribe = onSnapshot(docRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                let allSessions = ["personal"]
                const userData = docSnapshot.data();
                userData.portfolio.sessions
                    .forEach(e => {
                        allSessions.push(e)
                    })

                if (dType === "fav") {
                    userData.portfolio.watchlist
                        .map(e => {
                            if (e.title === receivedData.title && e.region === receivedData.region) setWaletChosen((prevWaletChosen) => [...prevWaletChosen, 0]);

                        })
                }

                const activeSessions = []
                setUserSessions(allSessions)

                await Promise.all(
                    allSessions.map(async (sessionId, index) => {
                        const sessionRef = doc(db, 'sessions', sessionId);
                        const sessionSnap = await getDoc(sessionRef);

                        if (sessionSnap.exists()) {
                            const sessionData = sessionSnap.data();
                            if (isContestActive(sessionData.endDate)) {
                                activeSessions.push({
                                    walletName: sessionData.sessionName,
                                    walletDescription: `Buy assets to ${sessionData.sessionName} wallet`,
                                    image: sessionData.icon,
                                    isRequire: false
                                });

                                sessionData.players
                                    .map(e => {

                                        if (e.userId === auth.currentUser.uid) {
                                            e.portfolio.watchlist
                                                .map(e => {
                                                    if (e.title === receivedData.title && e.region === receivedData.region) setWaletChosen((prevWaletChosen) => [...prevWaletChosen, index]);

                                                })
                                        }


                                    })
                            }
                        }
                    })
                );

                setWallets([...activeSessions]);
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
    }

    return (
        <View style={{
            flex: 1,
            backgroundColor: '#F3F8FF',
            justifyContent: 'space-between',  // Set justifyContent to 'space-between'
        }}>

            <View style={{
                alignItems: 'center',
                marginTop: 50
            }}>
                <Text style={{
                    fontSize: 25,
                    fontWeight: 'bold'
                }}>Choose a wallet</Text>
            </View>

            <View style={{
                marginTop: 50,
                flex: 1  // Make the ScrollView take up the remaining space
            }}>
                <TouchableOpacity onPress={() => {

                    if (dType === "trade") {
                        if (waletChosen === 0) setWaletChosen(null)
                        else setWaletChosen(0)
                    } else {
                        if (waletChosen.includes(0)) setWaletChosen((prevWaletChosen) => prevWaletChosen.filter(value => value !== 0));
                        else setWaletChosen((prevWaletChosen) => [...prevWaletChosen, 0]);
                    }

                }} style={{
                    justifyContent: 'center',
                    padding: 5,
                    height: 80,
                    backgroundColor: 'white',
                    marginHorizontal: 20,
                    borderRadius: 10,
                    elevation: 1,
                    shadowOffset: { width: 0, height: 1 / 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 1 / 2
                }}>
                    <View style={{
                        justifyContent: 'center',
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <Image style={{ width: 65, height: 65, borderRadius: 5 }} source={require('../../assets/wallet.png')} />
                            <View style={{
                                flexDirection: 'column',
                            }}>
                                <Text style={{
                                    fontWeight: 'bold',
                                    fontSize: 19
                                }}>Personal wallet</Text>
                                <Text style={{
                                    fontSize: 10,
                                    maxWidth: 200
                                }}>Buy assets to your personal wallet</Text>
                            </View>

                            <View style={{
                                width: 25,
                                height: 25,
                                borderRadius: 12.5,
                                backgroundColor: dType === "trade" ? waletChosen === 0 ? 'white' : '#E3EEFF' : waletChosen.includes(0) ? 'white' : '#E3EEFF',
                                borderColor: dType === "trade" ? waletChosen === 0 ? '#1573FE' : '#C7DDFF' : waletChosen.includes(0) ? '#1573FE' : '#C7DDFF',
                                borderWidth: 5,
                                marginRight: 10,  // Add margin to push it away from the right edge
                            }}>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>

                {wallets.length ? (
                    <View>
                        <Text style={{ marginHorizontal: 20, fontWeight: 'bold', fontSize: 15, marginTop: 40, marginBottom: 20, color: '#03314B' }}>Session wallets</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {
                                wallets.map((e, i) => (
                                    <View key={i} style={{
                                        marginBottom: 5,
                                    }}>
                                        <TouchableOpacity onPress={() => {
                                            if (dType === "trade") {
                                                if (waletChosen === i + 1) setWaletChosen(null)
                                                else setWaletChosen(i + 1)
                                            } else {
                                                if (waletChosen.includes(i + 1)) setWaletChosen((prevWaletChosen) => prevWaletChosen.filter(value => value !== i + 1));
                                                else setWaletChosen((prevWaletChosen) => [...prevWaletChosen, i + 1]);

                                            }

                                        }} style={{
                                            justifyContent: 'center',
                                            padding: 5,
                                            height: 80,
                                            backgroundColor: 'white',
                                            marginHorizontal: 20,
                                            borderRadius: 10,
                                            elevation: 1,
                                            shadowOffset: { width: 0, height: 1 / 2 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 1 / 2
                                        }}>
                                            <View style={{
                                                justifyContent: 'center',
                                            }}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}>
                                                    {e.isRequire ? (
                                                        <Image style={{ width: 65, height: 65, borderRadius: 5 }} source={e.image} />) : (
                                                        <Image style={{ width: 65, height: 65, borderRadius: 5 }} source={{ uri: e.image }} />
                                                    )
                                                    }
                                                    <View style={{
                                                        flexDirection: 'column',
                                                    }}>
                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            fontSize: 19
                                                        }}>{e.walletName}</Text>
                                                        <Text style={{
                                                            fontSize: 10,
                                                            maxWidth: 200
                                                        }}>{e.walletDescription}</Text>
                                                    </View>

                                                    <View style={{
                                                        width: 25,
                                                        height: 25,
                                                        borderRadius: 12.5,
                                                        backgroundColor: dType === "trade" ? waletChosen === i + 1 ? 'white' : '#E3EEFF' : waletChosen.includes(i + 1) ? 'white' : '#E3EEFF',
                                                        borderColor: dType === "trade" ? waletChosen === i + 1 ? '#1573FE' : '#C7DDFF' : waletChosen.includes(i + 1) ? '#1573FE' : '#C7DDFF',
                                                        borderWidth: 5,
                                                        marginRight: 10,  // Add margin to push it away from the right edge
                                                    }}>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            }
                        </ScrollView>
                    </View>
                ) : null}

            </View>

            <TouchableOpacity onPress={() => {
                if (waletChosen != null && waletChosen.length !== 0 && dType === "trade") {
                    navigation.navigate("Trade", { data: { asset: receivedData, wallet: userSessions[waletChosen] } })

                } else if (waletChosen != null && dType === "fav") {
                    addFav()
                } else Toast.show({
                    type: 'info',
                    text1: 'You left something',
                    text2: "A wallet much be chosen in order to proceed.",
                    visibilityTime: 5000,
                    autoHide: true
                })
            }}>
                <View style={{
                    backgroundColor: '#1573FE',
                    padding: 15,
                    borderRadius: 10,
                    marginHorizontal: 20,
                    marginTop: 5,
                    marginBottom: 100,  // Add marginBottom to push it away from the bottom edge
                }}>
                    <Text style={{ color: 'white', fontSize: 17, textAlign: 'center' }}>{dType === "trade" ? "Next" : "Update Favourite List"}</Text>
                </View>
            </TouchableOpacity>

            <Toast />

        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#03314B',
    },

});