import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useRef, useEffect } from 'react'
import LottieView from "lottie-react-native";
import Animated, { useSharedValue, useDerivedValue, interpolate, withSpring, withTiming, useAnimatedStyle } from 'react-native-reanimated'
import { auth, db } from '../../database'
import { useRoute, CommonActions } from '@react-navigation/native';
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    arrayUnion,
    deleteDoc,
    getDocs,
    getDoc,
} from "firebase/firestore";
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function VerificationCode({ navigation }) {
    const route = useRoute();
    const receivedData = route.params?.data;

    const [inputValue, setInputValue] = useState(new Array(4).fill(''));
    const animation = useRef(null)
    const inputRef = useRef([])
    const hasDigit = inputValue.map((value) => useSharedValue(Boolean(value)));
    const [isErrored, setIsErrored] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [OTPValue, setOTPValue] = useState('0000')
    const [userOTPInputValue, setUserOTPInputValue] = useState('')

    const handleTextChange = (text, index) => {
        hasDigit[index].value = Boolean(text);

        if (text.length !== 0) {
            return inputRef?.current[index + 1]?.focus();
        }

        return inputRef?.current[index - 1]?.focus();
    }

    const inputAnimatedBackground = hasDigit.map((sharedValue) => {
        return useDerivedValue(() => {
            return isSuccess ? withTiming('#F3FFF9') : isErrored ? withTiming('#FFECEF') : sharedValue.value ? withTiming('#F3F8FF') : withTiming('white')
        });
    });

    const inputAnimatedBorder = hasDigit.map((sharedValue) => {
        return useDerivedValue(() => {
            return isSuccess ? withTiming('#15FEA2') : isErrored ? withTiming('#E84E5B') : sharedValue.value ? withTiming('#1573FE') : withTiming('#D9D9D9')
        });
    });

    const inputAnimatedStyle = hasDigit.map((sharedValue) => {
        return useAnimatedStyle(() => {
            const scale = interpolate(sharedValue.value, [0, 1], [1, 1.05]); // Adjust the scale factor as needed
            return {
                transform: [{ scale }],
            };
        });
    });

    async function codeValidation() {
        inputValue.map(async (item, index) => {
            if (inputValue[index] === "" || inputValue[index] === null) setIsErrored(true)
            else setIsErrored(false)

            if (userOTPInputValue === OTPValue) {
                setIsSuccess(true)
                setIsErrored(false)

                if (receivedData.wallet === "personal") {
                    const docRef = doc(db, "users", auth.currentUser.uid)
                    const docData = await getDoc(docRef)

                    if (docData.exists()) {

                        const updatedAssets = docData.data().portfolio.assets
                        const existingIndex = updatedAssets.findIndex(
                            (obj) => obj.title === receivedData.asset.title && obj.name === receivedData.asset.name && obj.region === receivedData.asset.region
                        );

                        if (existingIndex !== -1) {
                            let price1 = parseFloat(updatedAssets[existingIndex].amount)
                            let price2 = parseFloat(receivedData.amount);
                            receivedData.type === 'buy' ? updatedAssets[existingIndex].amount = (price1 + price2).toString() : updatedAssets[existingIndex].amount = (price1 - price2).toString()

                            var price11 = parseFloat(receivedData.asset.numPrice)
                            var price22 = parseFloat(updatedAssets[existingIndex].price);
                            updatedAssets[existingIndex].price = ((price11 + price22) / 2).toString()

                            if (updatedAssets[existingIndex].amount === "0") {
                                updatedAssets.splice(existingIndex, 1);
                            }

                        } else {
                            updatedAssets.push({
                                icon: receivedData.asset.icon,
                                name: receivedData.asset.name,
                                price: receivedData.asset.numPrice,
                                region: receivedData.asset.region,
                                title: receivedData.asset.title,
                                amount: receivedData.amount
                            });
                        }

                        let price1 = parseFloat(receivedData.asset.numPrice)
                        let price2 = parseFloat(receivedData.amount)

                        await updateDoc(docRef, {
                            'portfolio.balance': receivedData.type === 'buy' ? docData.data().portfolio.balance - (price2 * price1) : docData.data().portfolio.balance + (price2 * price1),
                            'portfolio.assets': updatedAssets
                        })

                        navigation.dispatch(CommonActions.navigate({ name: 'LangingScreen' }));
                    }

                } else {
                    const docRef = doc(db, "sessions", receivedData.wallet)
                    const docData = await getDoc(docRef)
                    if (docData.exists()) {
                        
                        const playersArray = []
                        docData.data().players.forEach(async (l, i) => {
                            if (l.userId === auth.currentUser.uid) {

                                const updatedAssets = l.portfolio.assets
                                const existingIndex = updatedAssets.findIndex(
                                    (obj) => obj.title === receivedData.asset.title && obj.name === receivedData.asset.name && obj.region === receivedData.asset.region
                                );

                                if (existingIndex !== -1) {
                                    let price1 = parseFloat(updatedAssets[existingIndex].amount)
                                    let price2 = parseFloat(receivedData.amount);
                                    receivedData.type === 'buy' ? updatedAssets[existingIndex].amount = (price1 + price2).toString() : updatedAssets[existingIndex].amount = (price1 - price2).toString()

                                    var price11 = parseFloat(receivedData.asset.numPrice)
                                    var price22 = parseFloat(updatedAssets[existingIndex].price);
                                    updatedAssets[existingIndex].price = ((price11 + price22) / 2).toString()

                                    if (updatedAssets[existingIndex].amount === "0") {
                                        updatedAssets.splice(existingIndex, 1);
                                    }

                                } else {
                                    updatedAssets.push({
                                        icon: receivedData.asset.icon,
                                        name: receivedData.asset.name,
                                        price: receivedData.asset.numPrice,
                                        region: receivedData.asset.region,
                                        title: receivedData.asset.title,
                                        amount: receivedData.amount
                                    });
                                }

                                let price1 = parseFloat(receivedData.asset.numPrice)
                                let price2 = parseFloat(receivedData.amount)
                                l.portfolio.balance = receivedData.type === 'buy' ? l.portfolio.balance - (price2 * price1) : l.portfolio.balance + (price2 * price1)
                                l.portfolio.assets = updatedAssets
                                playersArray.push(l)

                            } else playersArray.push(l)
                        })

                        await updateDoc(docRef, { players: playersArray });
                        navigation.dispatch(CommonActions.navigate({ name: 'LangingScreen' }));
                    }
                }

            } else {
                setIsSuccess(false)
                setIsErrored(true)
            }
        })
    }

    useEffect(() => {
        setIsSuccess(false)
        setIsErrored(false)

        async function getData() {
            const docRef = doc(db, "users", auth.currentUser.uid)
            const docData = await getDoc(docRef)
            if (docData.exists()) {
                setOTPValue(docData.data().pin)

                animation.current?.play()
                hasDigit.forEach((sharedValue) => {
                    sharedValue.value = false;
                });
            }
        }

        getData()

    }, [])

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <Animated.View style={{ justifyContent: 'center', marginHorizontal: 30 }}>

                    {/* Set an animation */}
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <LottieView
                            style={{
                                width: 150,
                                height: 150,
                            }}
                            ref={animation}
                            loop={false}
                            source={require('../../assets/Lottie/OTPAnimation.json')}
                        />
                    </View>

                    {/* Header text */}
                    <Text style={{ fontSize: 44, fontWeight: 'bold', textAlign: 'left', marginBottom: 5 }}>Enter Pin</Text>
                    <Text style={{ textAlign: 'left', marginBottom: 15 }}>Please enter your pin to complete the transaction in order to continue.</Text>

                    {/* Email And Password Fields */}
                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>

                        {[... new Array(4)].map((item, index) => (
                            <AnimatedTextInput
                                keyboardType='decimal-pad'
                                returnKeyType='done'
                                style={[{
                                    width: 70,
                                    height: 65,
                                    backgroundColor: inputAnimatedBackground[index],
                                    padding: 12,
                                    borderRadius: 10,
                                    borderColor: inputAnimatedBorder[index],
                                    borderWidth: 2,
                                    marginHorizontal: 5,
                                    fontSize: 35,
                                    textAlign: 'center',
                                    alignItems: 'center'

                                }, useAnimatedStyle(() => ({
                                    transform: [{ scale: withSpring(interpolate(hasDigit[index].value, [0, 1], [1, 1.05])) }],
                                }))]}
                                key={index}
                                ref={ref => {
                                    inputRef.current[index] = ref
                                }}
                                maxLength={1}
                                contextMenuHidden
                                selectTextOnFocus
                                caretHidden={true}
                                testID={`OTP-${index}`}
                                onChangeText={(text) => {
                                    handleTextChange(text, index)

                                    const newArray = [...inputValue];
                                    newArray[index] = text;
                                    setInputValue(newArray);
                                    setUserOTPInputValue(newArray.join(''))
                                    setIsSuccess(false)
                                    setIsErrored(false)

                                }}
                                onKeyPress={e => { if (e.nativeEvent.key === 'Backspace') handleTextChange('', index) }}
                            />
                        ))}
                    </View>

                    {/* Submit */}
                    <View>

                        <TouchableOpacity style={{ width: '100%' }} onPress={codeValidation}>
                            <View style={{
                                backgroundColor: '#1573FE',
                                padding: 15,
                                borderRadius: 10,
                            }}>
                                <Text style={{ color: 'white', fontSize: 17, textAlign: 'center' }}>SUBMIT</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                </Animated.View>
            </TouchableWithoutFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },

});