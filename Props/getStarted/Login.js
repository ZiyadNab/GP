import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { signInWithEmailAndPassword } from 'firebase/auth'
import Toast from 'react-native-toast-message'
import { auth } from '../../database'

export default function Login({ navigation }) {

    const [rememberMe, setRememberMe] = useState(false)
    const [email, setEmail] = useState(null)
    const [password, setPassword] = useState(null)

    async function signIn() {

        if (!email) return Toast.show({
            type: 'info',
            text1: 'You left something',
            text2: "You left the email field empty, please enter your email address.",
            visibilityTime: 5000,
            autoHide: true
        })

        if (!password) return Toast.show({
            type: 'info',
            text1: 'You left something',
            text2: "You left the password field empty, please enter your password.",
            visibilityTime: 5000,
            autoHide: true
        })

        signInWithEmailAndPassword(auth, email, password)
            .then(userCredential => {

            }).catch(err => {

                if (err.code === 'auth/invalid-email') {
                    Toast.show({
                        type: 'error',
                        text1: 'Errored',
                        text2: "Invalid email format. Please enter a valid email address.",
                        visibilityTime: 5000,
                        autoHide: true
                    })
                } else if (err.code === 'auth/invalid-credential') {
                    Toast.show({
                        type: 'error',
                        text1: 'Errored',
                        text2: "Invalid credentials. Please check your email and password.",
                        visibilityTime: 5000,
                        autoHide: true
                    })
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Errored',
                        text2: "Invalid email format. Please enter a valid email address.",
                        visibilityTime: 5000,
                        autoHide: true
                    })
                }
            })
    }

    return (
        <View style={styles.container}>

            <View style={{ justifyContent: 'center', margin: 50 }}>

                {/* Header text */}
                <Text style={{ fontSize: 50, fontWeight: 'bold', textAlign: 'left', bottom: 40 }}>Sign in with password</Text>

                {/* Email And Password Fields */}
                <TextInput keyboardType='email-address' style={{
                    backgroundColor: 'white',
                    padding: 12,
                    borderRadius: 10,
                    borderColor: '#D9D9D9',
                    borderWidth: 2,
                    marginBottom: 20,

                }} placeholder='Email' onChangeText={(val) => setEmail(val)} />

                <TextInput secureTextEntry={true} style={{
                    backgroundColor: 'white',
                    padding: 12,
                    borderRadius: 10,
                    borderColor: '#D9D9D9',
                    borderWidth: 2,
                    marginBottom: 25,

                }} placeholder='Password' onChangeText={(val) => setPassword(val)} />

                {/* Remember Me Radio And Forgot Passowrd Button */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[{
                            height: 20,
                            width: 20,
                            backgroundColor: '#E3EEFF',
                            borderRadius: 5,
                            borderWidth: 2,
                            borderColor: rememberMe ? '1573FE' : '#C7DDFF',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }]}>
                            {rememberMe ? <View style={{ height: 20, width: 20, borderRadius: 5, backgroundColor: '#1573FE' }} /> : null}
                        </View>
                        <Text> Remember Me</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                        <Text style={{ color: '#1573FE' }}>Reset Password</Text>
                    </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity onPress={signIn}>
                    <View style={{
                        backgroundColor: '#1573FE',
                        padding: 15,
                        borderRadius: 10,
                    }}>
                        <Text style={{ color: 'white', fontSize: 17, textAlign: 'center' }}>Sign In</Text>
                    </View>
                </TouchableOpacity>

                {/* Other Providers */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 50 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
                    <Text style={{ marginHorizontal: 10, fontSize: 14, color: '#333' }}>or continue with</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => {
                        Toast.show({
                            type: 'info',
                            text1: 'Coming Soon',
                            text2: 'Sign in from third party apps will be supported soon.',
                            visibilityTime: 5000,
                            autoHide: true
                        });
                    }} style={{ paddingHorizontal: 35, paddingVertical: 15, marginHorizontal: 5, borderColor: '#EEEEEE', borderWidth: 2, borderRadius: 10 }}>
                        <Image style={{ width: 35, height: 35 }} source={require('../../assets/logos/facebook.png')} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        Toast.show({
                            type: 'info',
                            text1: 'Coming Soon',
                            text2: 'Sign in from third party apps will be supported soon.',
                            visibilityTime: 5000,
                            autoHide: true
                        });
                    }} style={{ paddingHorizontal: 35, paddingVertical: 15, marginHorizontal: 5, borderColor: '#EEEEEE', borderWidth: 2, borderRadius: 10 }}>
                        <Image style={{ width: 35, height: 35 }} source={require('../../assets/logos/google.png')} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        Toast.show({
                            type: 'info',
                            text1: 'Coming Soon',
                            text2: 'Sign in from third party apps will be supported soon.',
                            visibilityTime: 5000,
                            autoHide: true
                        });
                    }} style={{ paddingHorizontal: 35, paddingVertical: 15, marginHorizontal: 5, borderColor: '#EEEEEE', borderWidth: 2, borderRadius: 10 }}>
                        <Image style={{ width: 35, height: 35 }} source={require('../../assets/logos/apple.png')} />
                    </TouchableOpacity>
                </View>

                {/* Create An Account */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 75 }}>
                    <Text style={{ color: 'black', fontSize: 17, textAlign: 'center', paddingRight: 5 }}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("CreateAnAccount")}>
                        <View style={{
                        }}>
                            <Text style={{ color: '#1573FE', fontSize: 17, textAlign: 'center' }}>Sign up now</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <Toast />
        </View >
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