import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'
import { auth, db } from '../../database'
import moment from 'moment';
import {
    doc,
    onSnapshot,
    getDoc,
} from "firebase/firestore";

export default function Wallet({ navigation }) {
    const [waletChosen, setWaletChosen] = useState(null)
    const [userSessions, setUserSessions] = useState([])
    const [wallets, setWallets] = useState([])
    const [loading, setLoading] = useState(true)

    const isContestActive = (endDate) => {
        const currentDate = moment();
        const contestEndDate = moment(endDate);

        return contestEndDate.isAfter(currentDate);
    };

    useEffect(() => {

        const docRef = doc(db, 'users', auth.currentUser.uid)

        const unsubscribe = onSnapshot(docRef, async (docSnapshot) => {
            if (docSnapshot.exists) {
                let allSessions = ["personal"]
                const userData = docSnapshot.data();
                userData.portfolio.sessions
                    .forEach(e => {
                        allSessions.push(e)
                    })

                const activeSessions = []
                setUserSessions(allSessions)
                await Promise.all(
                    allSessions.map(async (sessionId) => {
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
                    if (waletChosen === 0) setWaletChosen(null)
                    else setWaletChosen(0)

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
                                backgroundColor: waletChosen === 0 ? 'white' : '#E3EEFF',
                                borderColor: waletChosen === 0 ? '#1573FE' : '#C7DDFF',
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
                                            if (waletChosen === i + 1) setWaletChosen(null)
                                            else setWaletChosen(i + 1)

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
                                                        backgroundColor: waletChosen === i + 1 ? 'white' : '#E3EEFF',
                                                        borderColor: waletChosen === i + 1 ? '#1573FE' : '#C7DDFF',
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
                if (waletChosen != null) {
                    navigation.navigate("PortfolioScreen", { portfolio: userSessions[waletChosen] })

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
                    <Text style={{ color: 'white', fontSize: 17, textAlign: 'center' }}>Next</Text>
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