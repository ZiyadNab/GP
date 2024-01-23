import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import React, { useState, useEffect, useRef } from 'react'
import LottieView from "lottie-react-native";
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../database'
import Toast from 'react-native-toast-message'
import Animated, { useSharedValue, useDerivedValue, interpolate, withSpring, withTiming, useAnimatedStyle } from 'react-native-reanimated'
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function ForgotPassword({ navigation }) {

    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const [inputValue, setInputValue] = useState('');
    const emailInputAnimatedBorder = useSharedValue('#D9D9D9')
    const emailInputAnimatedBackground = useSharedValue('white')

    function emailValidation() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        if (inputValue.trim() === '') {
            emailInputAnimatedBackground.value = withTiming('#FFECEF');
            emailInputAnimatedBorder.value = withTiming('#E84E5B');
            Toast.show({
                type: 'info',
                text1: 'You left something',
                text2: "You left the email field empty, please enter your email address.",
                visibilityTime: 5000,
                autoHide: true
            })
            return
        } else if (!emailRegex.test(inputValue)) {
            emailInputAnimatedBackground.value = withTiming('#FFECEF');
            emailInputAnimatedBorder.value = withTiming('#E84E5B');
            Toast.show({
                type: 'error',
                text1: 'Errored',
                text2: "Invalid email format. Please enter a valid email address.",
                visibilityTime: 5000,
                autoHide: true
            })
            return
        } else {
            emailInputAnimatedBackground.value = withTiming('#F3FFF9');
            emailInputAnimatedBorder.value = withTiming('#15FEA2');
        }

        sendPasswordResetEmail(auth, inputValue)
        .then(resetEmailData => {
            Toast.show({
                type: 'success',
                text1: 'Email sent',
                text2: 'An email to reset your password will be issued to you if your email address matches our records.',
                visibilityTime: 5000,
                autoHide: true
            });
        }).catch(err => {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An error has occurred please try again later',
                visibilityTime: 5000,
                autoHide: true
            });
        })
    }

    const animation = useRef(null)

    useEffect(() => {
        animation.current.play()
    }, [])

    return (
        <KeyboardAvoidingView style={styles.container} behavior='padding'>
            <View style={{ justifyContent: 'center', top: 100, width: '90%' }}>

                {/* Set an animation */}
                <View style={{ justifyContent: 'center', alignItems: 'center', bottom: 50 }}>
                    <LottieView
                        style={{
                            width: 200,
                            height: 200,
                        }}
                        ref={animation}
                        loop={true}
                        source={require('../../assets/Lottie/ForgotPassword.json')}
                    />
                </View>

                {/* Header text */}
                <Text style={{ fontSize: 50, fontWeight: 'bold', textAlign: 'left', bottom: 50 }}>Forgot Your password?</Text>
                <Text style={{ textAlign: 'left', bottom: 30 }}>Not to worry, all you have to do is enter your email address, and we'll give you a verification code so you can reset your password!</Text>

                {/* Email And Password Fields */}
                <AnimatedTextInput
                    keyboardType='email-address'
                    style={[ { borderColor: '#D9D9D9', backgroundColor: 'white' }, {
                        backgroundColor: emailInputAnimatedBackground,
                        padding: 12,
                        borderRadius: 10,
                        borderColor: emailInputAnimatedBorder,
                        borderWidth: 2,
                        marginBottom: 20,

                    }]}
                    caretHidden={!isFocused}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChangeText={(text) => {
                        emailInputAnimatedBackground.value = Boolean(text) ? withTiming('#F3F8FF') : withTiming('white')
                        emailInputAnimatedBorder.value = Boolean(text) ? withTiming('#1573FE') : withTiming('#D9D9D9')
                        setInputValue(text);
                    }}
                    placeholder='Email'
                />

                {/* Sign In Button */}
                <TouchableOpacity onPress={() => emailValidation()}>
                    <View style={{
                        backgroundColor: '#1573FE',
                        padding: 15,
                        borderRadius: 10,
                    }}>
                        <Text style={{ color: 'white', fontSize: 17, textAlign: 'center' }}>SUBMIT</Text>
                    </View>
                </TouchableOpacity>

            </View>

            <Toast/>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },

});