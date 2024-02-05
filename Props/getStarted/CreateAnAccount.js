import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Text, Image, View, Platform, FlatList, RefreshControl, ScrollView, TextInput, ImageBackground, Pressable } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { auth, db } from '../../database'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
} from "firebase/firestore";
import Animated, { useSharedValue, useDerivedValue, interpolate, withSpring, withTiming, useAnimatedStyle } from 'react-native-reanimated'
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const countries = [
    { label: 'Saudi Arabia', value: 'Saudi Arabia' },
    { label: 'United Arab Emirates', value: 'United Arab Emirates' },
    { label: 'Qatar', value: 'Qatar' },
    { label: 'Oman', value: 'Oman' },
    { label: 'Iraq', value: 'Iraq' },
    { label: 'Kuwait', value: 'Kuwait' },
    { label: 'Bahrain', value: 'Bahrain' },
    { label: 'Yamen', value: 'Yamen' },
    { label: 'Other', value: 'Other' },
];

const genders = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
];

export default function Profile({ navigation }) {
    const usernameInputAnimatedBorder = useSharedValue('#D9D9D9')
    const emailInputAnimatedBorder = useSharedValue('#D9D9D9')
    const phoneInputAnimatedBorder = useSharedValue('#D9D9D9')
    const countryInputAnimatedBorder = useSharedValue('#D9D9D9')
    const genderInputAnimatedBorder = useSharedValue('#D9D9D9')
    const DOBInputAnimatedBorder = useSharedValue('#D9D9D9')
    const passwordInputAnimatedBorder = useSharedValue('#D9D9D9')
    const repeatPasswordInputAnimatedBorder = useSharedValue('#D9D9D9')

    // States
    const [isFocus, setIsFocus] = useState(false);
    const [isFocus2, setIsFocus2] = useState(false);
    const [date, setdate] = useState(new Date());
    const [showDatePicker, setshow] = useState(false);
    const [text, setText] = useState();
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [country, setCounty] = useState(null);
    const [gender, setGender] = useState(null);
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [errored, setErrored] = useState(false)

    const submit = () => {
        setErrored(false)

        // Validate username
        if (!userName) {
            handleValidationFailure(usernameInputAnimatedBorder, 'Username is required');
        } else {
            handleValidationSuccess(usernameInputAnimatedBorder);
        }

        // Validate email
        const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            handleValidationFailure(emailInputAnimatedBorder, 'Email is required');
        } else if (!emailFormat.test(email)) {
            handleValidationFailure(emailInputAnimatedBorder, 'Please enter a valid email address');
        } else {
            handleValidationSuccess(emailInputAnimatedBorder);
        }

        // Validate phone number
        if (!phoneNumber) {
            handleValidationFailure(phoneInputAnimatedBorder, 'Phone number is required');
        } else {
            handleValidationSuccess(phoneInputAnimatedBorder);
        }

        // Validate country
        if (!country) {
            handleValidationFailure(countryInputAnimatedBorder, 'Country is required');
        } else {
            handleValidationSuccess(countryInputAnimatedBorder);
        }

        // Validate gender
        if (!gender) {
            handleValidationFailure(genderInputAnimatedBorder, 'Gender is required');
        } else {
            handleValidationSuccess(genderInputAnimatedBorder);
        }

        // Validate date of birth
        if (!text) {
            handleValidationFailure(DOBInputAnimatedBorder, 'Date of birth is required');
        } else {
            handleValidationSuccess(DOBInputAnimatedBorder);
        }

        // Validate password and repeat password
        if (!password) {
            handleValidationFailure(passwordInputAnimatedBorder, 'Password is required');
        } else if (!repeatPassword) {
            handleValidationFailure(repeatPasswordInputAnimatedBorder, 'Repeat password is required');
        } else if (password !== repeatPassword) {
            handleValidationFailure(passwordInputAnimatedBorder, 'Passwords do not match');
            handleValidationFailure(repeatPasswordInputAnimatedBorder, 'Passwords do not match');
        } else {
            handleValidationSuccess(passwordInputAnimatedBorder);
            handleValidationSuccess(repeatPasswordInputAnimatedBorder);
        }

        if (!errored) createUserWithEmailAndPassword(auth, email, password)
            .then(async createdAccount => {
                // console.log(createdAccount.user.uid)

                try {
                    const docRef = doc(db, "users", createdAccount.user.uid);

                    await setDoc(docRef, {
                        icon: 'https://imgur.com/N4Fucq0.png',
                        fullname: userName,
                        email: email,
                        phone: phoneNumber,
                        country: country,
                        gender: gender,
                        DOB: text,
                        pin: '0000',
                        userId: createdAccount.user.uid,
                        portfolio: {
                            reward: null,
                            assets: [],
                            sessions: [],
                            watchlist: [],
                            profit: 0,
                            balance: 100000.00,
                        }
                    });

                    console.log("Document successfully written!");
                } catch (error) {
                    console.error("Error writing document: ", error);
                }
            }).catch(err => {
                // Handle different Firebase authentication errors
                const errorCode = err.code;
                const errorMessage = err.message;

                switch (errorCode) {
                    case 'auth/email-already-in-use':
                        handleValidationFailure(emailInputAnimatedBorder, 'Email already exists');
                        // 
                        // Handle this case
                        break;
                    case 'auth/invalid-email':
                        handleValidationFailure(emailInputAnimatedBorder, 'Invalid email format');
                        // 
                        // Handle this case
                        break;
                    case 'auth/weak-password':
                        handleValidationFailure(password, 'Password is weak');
                        // 
                        // Handle this case
                        break;
                    // Add more cases to handle different error codes as needed
                    default:
                        Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: 'An error has occurred please try again later',
                            visibilityTime: 5000,
                            autoHide: true
                        });
                        break;
                }
            })

        // Function to handle validation success
        function handleValidationSuccess(borderElement) {
            borderElement.value = withTiming('#15FEA2');
        }

        // Function to handle validation failure
        function handleValidationFailure(borderElement, errorMessage) {
            setErrored(true)
            borderElement.value = withTiming('#E84E5B');
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
                visibilityTime: 5000,
                autoHide: true
            });
        }

    };

    return (
        <View style={styles.container}>
            <View style={{ marginTop: 80 }}>

                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 50, fontWeight: '700', marginLeft: 4 }}> Fill your profile</Text>
                    <Text style={{ marginTop: 10, marginLeft: 10 }}> Don't worry, you can always change it later</Text>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <Animated.View style={[styles.ProfileView, {
                            borderWidth: 2,
                            borderColor: usernameInputAnimatedBorder
                        }]}>
                            <Text style={styles.ProfileText}> User name </Text>
                            <TextInput
                                placeholder=' e.g. Abdulaziz Nasser'
                                onChangeText={(v) => {
                                    usernameInputAnimatedBorder.value = Boolean(v) ? withTiming('#1573FE') : withTiming('#D9D9D9')
                                    setUserName(v)
                                }}
                            />
                        </Animated.View>

                        <Animated.View style={[styles.ProfileView, {
                            borderWidth: 2,
                            borderColor: emailInputAnimatedBorder
                        }]}>
                            <Text style={styles.ProfileText}> Email </Text>
                            <TextInput
                                placeholder=' e.g. User@gmail.com'
                                keyboardType="email-address"
                                onChangeText={(v) => {
                                    emailInputAnimatedBorder.value = Boolean(v) ? withTiming('#1573FE') : withTiming('#D9D9D9')
                                    setEmail(v)
                                }}
                            />
                        </Animated.View>

                        <Animated.View style={[styles.ProfileView, {
                            borderWidth: 2,
                            borderColor: phoneInputAnimatedBorder
                        }]}>
                            <Text style={styles.ProfileText}> Phone number </Text>
                            <TextInput
                                placeholder=' e.g. 05xxxxxxxx'
                                keyboardType="phone-pad"
                                onChangeText={(v) => {
                                    phoneInputAnimatedBorder.value = Boolean(v) ? withTiming('#1573FE') : withTiming('#D9D9D9')
                                    setPhoneNumber(v)
                                }}
                            />
                        </Animated.View>

                        <View style={{ flexDirection: 'row', height: 60, width: 330, justifyContent: 'space-between', marginTop: 7 }}>
                            <Animated.View style={[ { borderColor: '#D9D9D9', }, {
                                borderWidth: 2,
                                borderRadius: 7,
                                borderColor: countryInputAnimatedBorder
                            }]}>
                                <Dropdown
                                    style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    iconStyle={styles.iconStyle}
                                    data={countries}
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder={!isFocus ? 'Country' : '...'}
                                    value={country}
                                    onFocus={() => setIsFocus(true)}
                                    onBlur={() => setIsFocus(false)}
                                    onChange={item => {
                                        setCounty(item.value);
                                        setIsFocus(false);
                                    }}
                                />
                            </Animated.View>

                            <Animated.View style={[ { borderColor: '#D9D9D9', }, {
                                borderWidth: 2,
                                borderRadius: 7,
                                borderColor: '#D9D9D9',
                                borderColor: genderInputAnimatedBorder
                            }]}>
                                <Dropdown

                                    style={[styles.dropdown2]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    iconStyle={styles.iconStyle}
                                    data={genders}
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder={!isFocus2 ? 'Gender' : '...'}
                                    value={gender}
                                    onFocus={() => setIsFocus2(true)}
                                    onBlur={() => setIsFocus2(false)}
                                    onChange={item => {
                                        setGender(item.value);
                                        setIsFocus2(false);
                                    }}
                                />
                            </Animated.View>
                        </View>

                        <AnimatedTouchableOpacity onPress={() => setshow(!showDatePicker)} style={[{ borderColor: '#D9D9D9', }, {
                            marginTop: 7,
                            height: 60,
                            width: 330,
                            backgroundColor: '#E4F3FC',
                            borderColor: DOBInputAnimatedBorder,
                            borderWidth: 0.7,
                            borderRadius: 7,
                            padding: 7,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            borderWidth: 2,

                        }]}>
                            <Text style={{ fontSize: 16, paddingVertical: 10 }} > Date of birth </Text>
                            <Text style={{ fontSize: 16, paddingVertical: 10, }}> {text} </Text>

                            <DateTimePickerModal
                                isVisible={showDatePicker}
                                mode="date"
                                onConfirm={(date) => {
                                    setdate(date);
                                    setshow(false);
                                    let tempdate = new Date(date);
                                    let fDate = tempdate.getDate() + '/' + (tempdate.getMonth() + 1) + '/' + tempdate.getFullYear();
                                    setText(fDate);
                                    DOBInputAnimatedBorder.value = Boolean(date) ? withTiming('#1573FE') : withTiming('#D9D9D9')
                                }}
                                onCancel={() => {
                                    setshow(false)
                                }}
                            />
                        </AnimatedTouchableOpacity>

                        <Animated.View style={[styles.ProfileView, {
                            borderWidth: 2,
                            borderColor: passwordInputAnimatedBorder
                        }]}>
                            <Text style={styles.ProfileText}> Password </Text>
                            <TextInput
                                secureTextEntry={true}
                                onChangeText={(v) => {
                                    passwordInputAnimatedBorder.value = Boolean(v) ? withTiming('#1573FE') : withTiming('#D9D9D9')
                                    setPassword(v)
                                }}
                            />
                        </Animated.View>

                        <Animated.View style={[styles.ProfileView, {
                            borderWidth: 2,
                            borderColor: repeatPasswordInputAnimatedBorder
                        }]}>
                            <Text style={styles.ProfileText}> Repeat Password </Text>
                            <TextInput
                                secureTextEntry={true}
                                onChangeText={(v) => {
                                    repeatPasswordInputAnimatedBorder.value = Boolean(v) ? withTiming('#1573FE') : withTiming('#D9D9D9')
                                    setRepeatPassword(v)
                                }}
                            />
                        </Animated.View>

                        <TouchableOpacity style={styles.ButtonStyle} onPress={submit}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>SIGN IN</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <Text style={{ color: 'black', fontSize: 17, textAlign: 'center', paddingRight: 5 }}>Already have an account?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <View style={{
                                }}>
                                    <Text style={{ color: '#1573FE', fontSize: 17, textAlign: 'center' }}>Login now</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
            <Toast />
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

    ProfileView: {
        marginTop: 7,
        height: 60,
        width: 330,
        borderColor: '#D9D9D9',
        backgroundColor: '#E4F3FC', // color of the theme
        borderWidth: 0.7,
        borderRadius: 7,
        padding: 10,
    },
    ButtonStyle: {
        height: 50,
        width: 330,
        backgroundColor: '#1573FE',
        borderRadius: 7,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 7,
    },
    dropdown: {
        height: 56,
        width: 210,
        backgroundColor: '#E4F3FC',
        borderRadius: 5,
        padding: 10,
    },
    dropdown2: {
        height: 56,
        width: 110,
        backgroundColor: '#E4F3FC',
        borderRadius: 5,
        padding: 10,
    },

    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },

    ProfileViewT: {
        marginTop: 7,
        height: 60,
        width: 330,
        backgroundColor: '#E4F3FC', // color of the theme
        borderColor: 'gray',
        borderWidth: 0.7,
        borderRadius: 7,
        padding: 10,
        marginBottom: 350,
    },
});