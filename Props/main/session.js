import { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Text, Image, View, FlatList, TextInput } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Entypo, Feather, FontAwesome } from '@expo/vector-icons';
import { auth, db, storage } from '../../database'
import moment from 'moment';
import LottieView from "lottie-react-native";
import Toast from 'react-native-toast-message'
import * as ImagePicker from 'expo-image-picker';
import {
    doc,
    onSnapshot,
    updateDoc,
    getDoc,
    setDoc,
    arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function App({ navigation }) {

    const isContestActive = (endDate) => {
        const currentDate = moment();
        const contestEndDate = moment(endDate);

        return contestEndDate.isAfter(currentDate);
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const [activeData, setActiveData] = useState([]);
    const [expiredData, setExpiredData] = useState([]);
    const [loading, setLoading] = useState(true)
    const [openModal, setopenModal] = useState(false);
    const [Selected, setSelected] = useState(true);;
    const [sessionName, setSessionName] = useState(null);
    const [sessionBalance, setSessionBalance] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [uuid, setUUID] = useState(null)
    const [sessionEndDate, setSessionEndDate] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [sessionID, setSessionID] = useState(null);
    const [createOrJois, setCreateOrJois] = useState('s')
    const [hasSession, setHasSession] = useState(false)

    useEffect(() => {
        const docRef = doc(db, 'users', auth.currentUser.uid)

        const unsubscribe = onSnapshot(docRef, async (docSnapshot) => {
            if (docSnapshot.exists) {
                let allSessions = []
                const userData = docSnapshot.data();
                userData.portfolio.sessions
                    .forEach(e => {
                        allSessions.push(e)
                    })

                const activeSessions = [];
                const expiredSessions = [];
                if (allSessions.length === 0) setHasSession(false)
                else setHasSession(true)

                await Promise.all(
                    allSessions.map(async (sessionId) => {
                        const sessionRef = doc(db, 'sessions', sessionId);
                        const sessionSnap = await getDoc(sessionRef);

                        if (sessionSnap.exists()) {
                            const sessionData = sessionSnap.data();
                            if (isContestActive(sessionData.endDate)) {
                                activeSessions.push(sessionData);
                            } else {
                                expiredSessions.push(sessionData);
                            }
                        }
                    })
                );

                setActiveData([...expiredSessions]);
                setExpiredData([...activeSessions]);
                setLoading(false)

            }

        });

        return () => unsubscribe();
    }, []);

    function format(a) {
        const date = new Date(a);
    
        const dayOfWeekAbbreviated = daysOfWeek[date.getDay()];
        const month = months[date.getMonth()];
        const dayOfMonth = date.getDate();
        const year = date.getFullYear();
    
        return `${dayOfWeekAbbreviated}, ${month} ${dayOfMonth}, ${year}`;
    }

    const renderItem = ({ item }) => {

        return (
            <TouchableOpacity style={[styles.sessionItem, { backgroundColor: '#434343' }]} onPress={() => navigation.navigate("SessionDetails", { sessionId: item.sessionId })}>
                <View style={{ marginRight: 5, justifyContent: 'left', flexDirection: 'columns', width: '100%', alignItems: 'center' }}>
                    <View style={{
                        flexDirection: 'row',
                        width: '100%'
                    }}>

                        <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Image
                                source={{ uri: item.icon }}
                                style={{ width: 100, height: 100, borderRadius: 10, margin: 5 }}
                            />

                            <Text style={[styles.sessionText, { maxWidth: 100 }]}>{item.sessionName.toUpperCase()}</Text>
                        </View>

                        <View style={{ flexDirection: 'column' }}>

                            <View style={{
                                borderRadius: 10,
                                padding: 10,
                            }}>
                                <View style={{
                                    justifyContent: 'flex-end',


                                }}>
                                    <View style={{ flexDirection: 'row', marginRight: 5, backgroundColor: '#515151', justifyContent: 'flex-start', padding: 5, borderRadius: 2, marginBottom: 5, alignItems: 'center', width: 210 }}>
                                        <FontAwesome name="calendar-check-o" size={13} color='white' />

                                        <Text style={{ marginLeft: 4, textAlign: 'center', color: 'white' }}>{`${format(item.startDate)}`}</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', marginRight: 5, backgroundColor: '#515151', justifyContent: 'flex-start', padding: 5, borderRadius: 2, marginBottom: 5, alignItems: 'center' }}>
                                        <FontAwesome name="calendar-times-o" size={13} color='white' />
                                        <Text style={{ marginLeft: 4, textAlign: 'center', color: 'white' }}>{`${format(item.endDate)}`}</Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', marginRight: 5, backgroundColor: '#515151', justifyContent: 'flex-start', padding: 5, borderRadius: 2, alignItems: 'center' }}>
                                    <FontAwesome name="dollar" size={15} color='white' />
                                    <Text style={{ marginLeft: 4, textAlign: 'center', color: 'white' }}>{`${item.startBalance}`}</Text>
                                </View>
                            </View>


                        </View>
                    </View>

                    <View style={{
                        flexDirection: 'column',
                        width: '90%',
                    }}>
                        <View style={{ height: 10, width: '100%', backgroundColor: '#515151', borderRadius: 10, marginTop: 6 }}>
                            {!isContestActive(item.endDate) ? (
                                <View style={{ height: '100%', width: '100%', backgroundColor: 'lightgreen', borderRadius: 5 }}>
                                </View>
                            ) : (
                                <View style={{ height: '100%', width: `${(Number(moment().diff(item.startDate, 'days')) / Number(moment(item.endDate).diff(item.startDate, 'days'))) * 100}%`, backgroundColor: 'lightgreen', borderRadius: 5 }}>

                                </View>
                            )}
                        </View>

                        {!isContestActive(item.endDate) ? (
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: 10, color: 'white' }}>Completed!</Text>
                                <Text style={{ fontSize: 10, color: 'white' }}>, Took {moment(item.endDate).diff(item.startDate, 'days')} days</Text>
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 10, color: 'white' }}>{moment().diff(item.startDate, 'days') !== 0 ? moment().diff(item.startDate, 'days') + " days gone" : moment().diff(item.startDate, 'hours') !== 0 ? moment().diff(item.startDate, 'hours') + " hours gone" : moment().diff(item.startDate, 'minutes') + " minutes gone"}</Text>
                                <Text style={{ fontSize: 10, color: 'white' }}>{moment(item.endDate).diff(moment(), 'days')} days left</Text>
                            </View>

                        )}
                    </View>
                </View>





            </TouchableOpacity >
        )

    };

    const handleEndDateConfirm = (date) => {
        setSessionEndDate(date);
        setShowEndDatePicker(false);
    };

    const uploadImage = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `${uuid}.png`);
            const snapshot = await uploadBytes(storageRef, blob);
            const fileUrl = await getDownloadURL(storageRef)
            return fileUrl
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
        }
    };

    function generateShortUUID(length) {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let shortUUID = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            shortUUID += characters.charAt(randomIndex);
        }

        return shortUUID;
    }

    async function createSession() {

        if (!sessionName || !sessionBalance || !sessionEndDate) {
            Toast.show({
                type: 'info',
                text1: 'You left something',
                text2: "Please fill in at least one field.",
                visibilityTime: 5000,
                autoHide: true
            })
            return; // Prevent further execution if all fields are empty
        }

        setUpdating(true)

        const docRef = doc(db, "users", auth.currentUser.uid)
        let uploadedImage = 'https://t1.gstatic.com/licensed-image?q=tbn:ANd9GcQavfSfyOVYO54wkFq1cV0yguHfZSUiYwmiGvtdlDDav_wKZYsyy9NPBk952R2zXNSs'
        if (selectedImage) uploadedImage = await uploadImage(selectedImage.uri)

        // Update the Firestore document
        const sessionRef = doc(db, "sessions", uuid);

        await setDoc(sessionRef, {
            sessionId: uuid,
            endDate: moment(sessionEndDate).toISOString(),
            icon: uploadedImage,
            sessionName: sessionName,
            startBalance: Number(sessionBalance),
            startDate: moment().toISOString(),
            players: [
                {
                    portfolio: {
                        assets: [],
                        balance: sessionBalance,
                        watchlist: []
                    },
                    userId: auth.currentUser.uid
                }
            ],
            owner: auth.currentUser.uid
        });

        await updateDoc(docRef, {
            'portfolio.sessions': arrayUnion(uuid)
        })

        setUpdating(false)
        setopenModal(false)
    }

    async function joinSession() {

        if (!sessionID) {
            Toast.show({
                type: 'info',
                text1: 'You left something',
                text2: "Please fill in at least one field.",
                visibilityTime: 5000,
                autoHide: true
            })
            return; // Prevent further execution if all fields are empty
        }

        setUpdating(true)

        const sessionRef = doc(db, "sessions", sessionID)
        const dRef = await getDoc(sessionRef)
        if (dRef.exists()) {

            const docRef = doc(db, "users", auth.currentUser.uid)
            await updateDoc(docRef, {
                'portfolio.sessions': arrayUnion(sessionID)
            })

            // Update the Firestore document
            const sessionRef = doc(db, "sessions", sessionID);
            const sessonDoc = await getDoc(sessionRef)
            console.log(sessonDoc.data())
            await updateDoc(sessionRef, {
                'players': arrayUnion({
                    portfolio: {
                        assets: [],
                        balance: sessonDoc.data().startBalance,
                        watchlist: []
                    },
                    userId: auth.currentUser.uid
                })
            });

            setopenModal(false)

        } else {
            Toast.show({
                type: 'error',
                text1: 'No Session Found',
                text2: "No sessions matchs your input, please try again.",
                visibilityTime: 5000,
                autoHide: true
            })
        }

        setUpdating(false)
    }

    function renderModal() {
        return (
            <Modal
                visible={openModal}
                animationType='slide'
                transparent={true}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                    <View style={{ alignItems: 'center', backgroundColor: 'white', width: '90%', height: '62%', borderRadius: 10, elevation: 10, shadowOffset: { width: 0, height: 10 / 2 }, shadowOpacity: 0.3, shadowRadius: 10 / 2 }}>

                        <TouchableOpacity
                            onPress={() => setopenModal(false)}
                            style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}
                        >
                            <View style={{ backgroundColor: 'red', borderRadius: 12, padding: 2 }}>
                                <Feather name="x" color='white' size={25} />
                            </View>
                        </TouchableOpacity>

                        {
                            createOrJois === 'create' ? (
                                <View style={{ height: '86%', width: '100%' }}>

                                    {/* Image Picker */}
                                    <View style={{
                                        marginTop: 95,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }} >
                                        <Image
                                            source={{ uri: selectedImage ? selectedImage.uri : 'https://t1.gstatic.com/licensed-image?q=tbn:ANd9GcQavfSfyOVYO54wkFq1cV0yguHfZSUiYwmiGvtdlDDav_wKZYsyy9NPBk952R2zXNSs' }}
                                            style={{ width: 100, height: 100, borderRadius: 50, marginTop: -75 }}
                                        />

                                        <TouchableOpacity onPress={pickImage} style={{
                                            left: 30,
                                            marginTop: -20,
                                            backgroundColor: '#EBF0F0',
                                            borderRadius: 15,
                                            borderColor: 'white',
                                            borderWidth: 4,
                                            padding: 3
                                        }}>
                                            <Feather
                                                name="edit-3"
                                                color="black"
                                                size={30}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Session Name */}
                                    <View style={styles.ProfileView}>
                                        <Text style={styles.ProfileText}> Name </Text>
                                        <TextInput
                                            placeholder='Lions'
                                            value={sessionName}
                                            onChangeText={(text) => setSessionName(text)}
                                        />
                                    </View>

                                    {/* Session Balance */}
                                    <View style={styles.ProfileView}>
                                        <Text style={styles.ProfileText}> Balance </Text>
                                        <TextInput
                                            placeholder='1,000,000'
                                            value={sessionBalance}
                                            onChangeText={(text) => {
                                                // Ensure only numbers are entered for balance
                                                if (/^\d+$/.test(text)) {
                                                    setSessionBalance(text);
                                                }
                                            }}
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    {/* End Date */}
                                    <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={{
                                        marginTop: 7,
                                        height: 60,
                                        marginHorizontal: 25,
                                        backgroundColor: '#E4F3FC',
                                        borderWidth: 0.7,
                                        borderColor: 'gray',
                                        borderRadius: 7,
                                        padding: 7,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',

                                    }}>
                                        <Text style={{ fontSize: 16, paddingVertical: 10 }} > End Date </Text>
                                        <Text style={{ fontSize: 16, paddingVertical: 10, }}> {sessionEndDate ? sessionEndDate.toDateString() : 'Select'} </Text>


                                    </TouchableOpacity>

                                    {/* Create Session Button */}
                                    <TouchableOpacity onPress={() => createSession()}>
                                        <View style={{ height: 45, marginHorizontal: 25, borderRadius: 10, backgroundColor: '#1573FE', justifyContent: 'center', alignItems: 'center', borderColor: 'black', marginTop: 20 }}>
                                            <Text style={{ fontWeight: '500', color: 'white', fontSize: 20 }}>Create</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, display: updating ? 'flex' : 'none' }}>
                                        <ActivityIndicator size="large" color="#0000ff" />
                                        <Text style={{ color: 'black', marginLeft: 5 }}>Updating... {"\n"}It may takes longer than usual</Text>
                                    </View>
                                </View>
                            ) : createOrJois === 'join' ? (

                                <View style={{ height: '86%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>

                                    <LottieView
                                        style={{
                                            width: 200,
                                            height: 200,
                                        }}
                                        loop={true}
                                        autoPlay={true}
                                        source={require('../../assets/Lottie/join.json')}
                                    />

                                    <View style={[styles.ProfileView, { width: '85%' }]}>
                                        <Text style={styles.ProfileText}> Session ID </Text>
                                        <TextInput
                                            placeholder='Lions'
                                            value={sessionName}
                                            onChangeText={(text) => setSessionID(text)}
                                        />
                                    </View>

                                    <TouchableOpacity onPress={() => joinSession()} style={{ width: '100%' }}>
                                        <View style={{ height: 45, marginHorizontal: 25, borderRadius: 10, backgroundColor: '#18BE53', justifyContent: 'center', alignItems: 'center', borderColor: 'black', marginTop: 20 }}>
                                            <Text style={{ fontWeight: '500', color: 'white', fontSize: 20 }}>Join</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, display: updating ? 'flex' : 'none' }}>
                                        <ActivityIndicator size="large" color="#0000ff" />
                                        <Text style={{ color: 'black', marginLeft: 5 }}>Updating... {"\n"}It may takes longer than usual</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={{ height: '86%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>

                                    <LottieView
                                        style={{
                                            width: 200,
                                            height: 200,
                                        }}
                                        loop={true}
                                        autoPlay={true}
                                        source={require('../../assets/Lottie/choose.json')}
                                    />

                                    <Text>Please choose an operation</Text>

                                    <TouchableOpacity onPress={() => setCreateOrJois('create')} style={{ width: '100%' }}>
                                        <View style={{ height: 45, marginHorizontal: 25, borderRadius: 10, backgroundColor: '#1573FE', justifyContent: 'center', alignItems: 'center', borderColor: 'black', marginTop: 20 }}>
                                            <Text style={{ fontWeight: '500', color: 'white', fontSize: 20 }}>Create</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => setCreateOrJois('join')} style={{ width: '100%' }}>
                                        <View style={{ height: 45, marginHorizontal: 25, borderRadius: 10, backgroundColor: '#18BE53', justifyContent: 'center', alignItems: 'center', borderColor: 'black', marginTop: 10 }}>
                                            <Text style={{ fontWeight: '500', color: 'white', fontSize: 20 }}>Join</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        }


                    </View>
                </View>
                {/* Date Pickers */}
                <DateTimePickerModal
                    isVisible={showEndDatePicker}
                    mode="date"
                    onConfirm={handleEndDateConfirm}
                    onCancel={() => setShowEndDatePicker(false)}
                />
            </Modal>
        )

    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    };

    return (

        <View style={styles.container}>

            <View style={{ width: '50%', height: 40, backgroundColor: 'white', borderColor: 'gray', marginBottom: 20, flexDirection: 'row', alignItems: 'center', marginTop: 69 }}>
                <TouchableOpacity style={{ width: '50%', height: 39, backgroundColor: Selected ? '#D9D9D9' : '#9D9D9D', alignItems: 'center', justifyContent: 'center', borderBottomLeftRadius: 10, borderTopLeftRadius: 10 }}
                    onPress={() => { setSelected(true); }}
                >
                    <Text style={{ color: Selected ? '#1573FE' : 'white', fontSize: 18 }}>
                        Active
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ width: '50%', height: 39, backgroundColor: !Selected ? '#D9D9D9' : '#9D9D9D', alignItems: 'center', justifyContent: 'center', borderTopRightRadius: 10, borderBottomRightRadius: 10 }}
                    onPress={() => { setSelected(false); }}
                >
                    <Text style={{ color: !Selected ? '#1573FE' : 'white', fontSize: 18 }}>
                        Expired
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={{}}
                    onPress={() => {
                        setopenModal(true)
                        setUUID(generateShortUUID(6))
                        setSessionBalance(null)
                        setSessionEndDate(null)
                        setSessionName(null)
                        setCreateOrJois('nothing')
                        setSelectedImage(null)
                        setSessionID(null)
                    }}
                >
                    <Entypo name="plus" size={40} color='#1573FE' />
                </TouchableOpacity>
            </View>

            {renderModal()}


            {
                hasSession ? (
                    <View style={{ width: '100%', height: '75%', alignItems: 'center', justifyContent: 'center' }}>
                        <FlatList
                            data={!Selected ? activeData : expiredData}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            style={{ width: '90%', height: '80%' }}
                        />
                    </View>
                ) : (

                    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
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
                        }}>No Sessions Yet</Text>
                        <Text style={{
                            color: 'gray',
                            marginHorizontal: 30,
                            textAlign: 'center'
                        }}>Seems you are not in any sessions, create or join your first session to compete and win with your lovely friends!</Text>

                        <TouchableOpacity onPress={() => {
                            setopenModal(true)
                            setUUID(generateShortUUID(6))
                            setSessionBalance(null)
                            setSessionEndDate(null)
                            setSessionName(null)
                            setCreateOrJois('nothing')
                            setSelectedImage(null)
                            setSessionID(null)
                        }} style={{
                            marginVertical: 20,
                            width: '90%',
                            backgroundColor: '#1573FE',
                            padding: 15,
                            borderRadius: 10,
                        }}>
                            <Text style={{ color: 'white', fontSize: 17, textAlign: 'center' }}>Add a Session</Text>
                        </TouchableOpacity>
                    </View>
                )
            }

            <Toast />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',

    },
    sessionItem: {
        padding: 5,
        marginBottom: 10,
        borderRadius: 5,
        width: '100%',
        flexDirection: 'row',
    },
    sessionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,

    },
    Line: {
        height: 1,
        width: '100%',
        backgroundColor: 'gray',
    },
    TextInputStyle1: {
        width: '70%',
        height: 30,
        borderRadius: 10,
        borderColor: 'black',
        borderWidth: 0.5,
        backgroundColor: 'white',
        marginRight: 5,
        paddingLeft: 10,
    },
    ProfileView: {
        marginTop: 7,
        height: 60,
        marginHorizontal: 25,
        backgroundColor: '#E4F3FC', // color of the theme
        borderColor: 'gray',
        borderWidth: 0.7,
        borderRadius: 7,
        padding: 10,
    },
});