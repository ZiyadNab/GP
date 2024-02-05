import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator, Text, Image, View, KeyboardAvoidingView, RefreshControl, ScrollView, TextInput, ImageBackground } from 'react-native';
import { auth, db } from '../../database'
import Toast from 'react-native-toast-message'
import { useRoute } from '@react-navigation/native';
import {
    doc,
    getDoc,
} from "firebase/firestore";

export default function Trade({ navigation }) {
    const route = useRoute();
    const receivedData = route.params?.data;
    const [loading, setLoading] = useState(true);
    const [owned, setOwned] = useState(false)
    const [amount, setAmount] = useState(0)
    const [userBalance, setUserBalance] = useState(0)

    function validationsBuy() {

        if (amount <= 0) return Toast.show({
            type: 'info',
            text1: 'You left something',
            text2: "Please enter the amount first.",
            visibilityTime: 5000,
            autoHide: true
        })

        if ((receivedData.asset.numPrice * Number(amount)) > userBalance) {

            Toast.show({
                type: 'error',
                text1: 'Not enough balance',
                text2: "Your balance now is " + userBalance + "SR, please be specific.",
                visibilityTime: 5000,
                autoHide: true
            })
        } else navigation.navigate("Pin", { data: { amount: amount, asset: receivedData.asset, wallet: receivedData.wallet, type: 'buy' } })
    }

    function validationsSell() {

        if (Number(amount) <= 0) return Toast.show({
            type: 'info',
            text1: 'You left something',
            text2: "Please enter the amount first.",
            visibilityTime: 5000,
            autoHide: true
        })

        if (Number(owned.amount) < Number(amount)) {

            Toast.show({
                type: 'error',
                text1: 'Errored',
                text2: "You only own " + owned.amount + " assets, please be specific.",
                visibilityTime: 5000,
                autoHide: true
            })
        } else navigation.navigate("Pin", { data: { amount: amount, asset: receivedData.asset, wallet: receivedData.wallet, type: 'sell' } })
    }

    useEffect(() => {

        async function getData() {
            if (receivedData.wallet === "personal") {
                const docRef = doc(db, "users", auth.currentUser.uid)
                const docData = await getDoc(docRef)
                if (docData.exists()) {
                    setOwned(docData.data().portfolio.assets.find(item => item.title === receivedData.asset.title))
                    setUserBalance(docData.data().portfolio.balance)
                    setLoading(false)
                }
            } else {

                const docRef = doc(db, "sessions", receivedData.wallet)
                const docData = await getDoc(docRef)
                if (docData.exists()) {

                    docData.data().players.forEach((e) => {
                        if (e.userId === auth.currentUser.uid) {
                            setUserBalance(e.portfolio.balance)
                            setOwned(e.portfolio.assets.find(item => item.title === receivedData.asset.title))
                            setLoading(false)
                            return
                        }
                    })
                }
            }
        }

        getData()
    })

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={{
            flex: 1,
            backgroundColor: '#F3F8FF',
            justifyContent: 'center',
        }}>

            <View style={{
                flex: 1,
                marginTop: 75,
                backgroundColor: '#F3F8FF',
                alignItems: 'center',
            }}>
                <View style={{
                    alignItems: 'center',
                }}>
                    <Image style={{ width: 150, height: 150, resizeMode: 'contain' }} source={{ uri: receivedData.asset.icon }} />
                    <Text style={{
                        fontSize: 40,
                        fontWeight: 'bold'
                    }}>{receivedData.asset.title}</Text>
                    <Text style={{
                        fontSize: 20,
                    }}>{receivedData.asset.name}</Text>
                </View>

                <View style={{
                    marginTop: 40,
                    width: '50%',
                }}>
                    <TextInput
                        keyboardType="decimal-pad"
                        style={{
                            padding: 12,
                            fontWeight: 'bold',
                            fontSize: 40,
                            textAlign: 'center',
                        }}
                        onChangeText={(v) => setAmount(v)}
                        placeholder='Amount'
                        returnKeyType='done'  // Specify the return key type
                    />


                    <View style={{
                        marginTop: -10,
                        height: StyleSheet.hairlineWidth,
                        backgroundColor: 'black',
                    }} />
                </View>
            </View>

            {owned ? (
                <TouchableOpacity onPress={() => validationsSell()}>
                    <View style={{
                        backgroundColor: 'red',
                        padding: 15,
                        borderRadius: 10,
                        marginHorizontal: 20,
                        marginTop: 5,
                        marginBottom: 5
                    }}>
                        <Text style={{ color: 'white', fontSize: 17, textAlign: 'center' }}>{"Sell"}</Text>
                    </View>
                </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={() => validationsBuy()}>
                <View style={{
                    backgroundColor: '#1573FE',
                    padding: 15,
                    borderRadius: 10,
                    marginHorizontal: 20,
                    marginTop: 5,
                    marginBottom: 100
                }}>
                    <Text style={{ color: 'white', fontSize: 17, textAlign: 'center' }}>{"Buy"}</Text>
                </View>
            </TouchableOpacity>
            <Toast />

        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({

});