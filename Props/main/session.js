import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Text, Image, View, FlatList, Switch, ScrollView, TextInput, ImageBackground } from 'react-native';
import { CalendarDays, CalendarCheck, CircleDollarSign, Plus, XSquare } from 'lucide-react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { auth, db, storage } from '../../database'
import Toast from 'react-native-toast-message'
import * as ImagePicker from 'expo-image-picker';
import {
    doc,
    onSnapshot,
    getDoc,
} from "firebase/firestore";

const transparent = 'rgba(0,0,0.5)';
export default function App() {

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    function calculateDays(dataArray) {
        const today = new Date();

        const resultArray = dataArray.map((item) => {
            const startDate = new Date(item.startDate);
            const endDate = new Date(item.endDate);

            // Calculate days left to endDate
            const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // Calculate number of days between startDate and endDate
            const daysBetween = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysGone = daysBetween - daysLeft;

            item.isActive = daysLeft > 0 ? 1 : 0;

            return {
                ...item,
                daysLeft,
                daysBetween,
                daysGone,
            };
        });

        return resultArray;
    }

    // Example usage:
    // const dataWithDays = calculateDays(data11);

    const [activeData, setActiveData] = useState([]);
    const [expiredData, setExpiredData] = useState([]);
    const [loading, setLoading] = useState(true)
    const [openModal, setopenModal] = useState(false);
    const [Selected, setSelected] = useState(0);
    const [sessionName, setSessionName] = useState('');
    const [sessionBalance, setSessionBalance] = useState('');
    const [sessionStartDate, setSessionStartDate] = useState(null);
    const [sessionEndDate, setSessionEndDate] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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

                await Promise.all(
                    allSessions.map(async (sessionId) => {
                        const sessionRef = doc(db, 'sessions', sessionId);
                        const sessionSnap = await getDoc(sessionRef);

                        if (sessionSnap.exists()) {
                            const sessionData = sessionSnap.data();
                            if (sessionData.isActive) {
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

        const dayOfWeek = daysOfWeek[date.getDay()];
        const month = months[date.getMonth()];
        const dayOfMonth = date.getDate();
        const year = date.getFullYear();

        return `${dayOfWeek}, ${month} ${dayOfMonth}, ${year}`
    };
 
    const renderItem = ({ item }) => (

        <TouchableOpacity style={[styles.sessionItem, { backgroundColor: '#434343' }]}>
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
                                <View style={{ flexDirection: 'row', marginRight: 5, backgroundColor: '#515151', justifyContent: 'flex-start', padding: 5, borderRadius: 2, marginBottom: 5, alignItems: 'center' }}>
                                    <CalendarDays size={15} color='white'
                                    />

                                    <Text style={{ marginLeft: 4, textAlign: 'center', color: 'white' }}>{`${format(item.startDate)}`}</Text>
                                </View>

                                <View style={{ flexDirection: 'row', marginRight: 5, backgroundColor: '#515151', justifyContent: 'flex-start', padding: 5, borderRadius: 2, marginBottom: 5, alignItems: 'center' }}>
                                    <CalendarCheck size={15} color='white'
                                    />
                                    <Text style={{ marginLeft: 4, textAlign: 'center', color: 'white' }}>{`${format(item.endDate)}`}</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginRight: 5, backgroundColor: '#515151', justifyContent: 'flex-start', padding: 5, borderRadius: 2, alignItems: 'center' }}>
                                <CircleDollarSign size={15} color='white' />
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
                        {item.isActive === 0 ? (
                            <View style={{ height: '100%', width: '100%', backgroundColor: 'white', borderRadius: 5 }}>
                            </View>
                        ) : (
                            <View style={{ height: '100%', width: `${(item.daysGone / item.daysBetween) * 100}%`, backgroundColor: 'white', borderRadius: 5 }}>
                            </View>
                        )}
                    </View>

                    {item.isActive === 0 ? (
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 10, color: 'white' }}>Completed!</Text>
                            <Text style={{ fontSize: 10, color: 'white' }}>, Took {item.daysGone} days</Text>
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 10, color: 'white' }}>{item.daysGone} days gone</Text>
                            <Text style={{ fontSize: 10, color: 'white' }}>{item.daysLeft} days left</Text>
                        </View>

                    )}
                </View>
            </View>





        </TouchableOpacity >

    );

    const handleStartDateConfirm = (date) => {
        setSessionStartDate(date);
        setShowStartDatePicker(false);
    };

    const handleEndDateConfirm = (date) => {
        setSessionEndDate(date);
        setShowEndDatePicker(false);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.uri);
        }
    };

    function renderModal() {
        return (
            <Modal
                visible={openModal}
                animationType='slide'
                transparent={true}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                    <View style={{ alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 10, paddingBottom: 20, width: '90%', height: '70%', borderRadius: 10 }}>
                        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Create your own session</Text>
                        <TouchableOpacity onPress={() => setopenModal(false)} style={{ position: 'absolute', top: 10, right: 10 }}>
                            <View style={{ backgroundColor: 'red', borderRadius: 4 }}>
                                <Text style={{ color: 'white' }}>Close</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ height: '86%', width: '100%', borderRadius: 10, borderWidth: 1, borderColor: 'gray', backgroundColor: 'white' }}>
                            <View style={{ marginTop: 5, alignItems: 'center' }}>
                                <Text style={{ color: '#9ac9d9', fontWeight: 'bold', textDecorationLine: 'underline' }}>
                                    Create your own session {'\n'} set your own goals!
                                </Text>
                            </View>
                            {/* Session Name */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 10 }}>
                                <Text style={{ marginRight: 10 }}>Session name</Text>
                                <TextInput
                                    style={styles.TextInputStyle1}
                                    value={sessionName}
                                    onChangeText={(text) => setSessionName(text)}
                                />
                            </View>
                            {/* Session Balance */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 10 }}>
                                <Text style={{ marginRight: 10 }}>Session balance</Text>
                                <TextInput
                                    style={styles.TextInputStyle1}
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
                            {/* Start Date */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 10 }}>
                                <Text>Start date</Text>
                                <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                                    <Text>{sessionStartDate ? sessionStartDate.toDateString() : 'Select start date'}</Text>
                                </TouchableOpacity>
                            </View>
                            {/* End Date */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 10 }}>
                                <Text>End date</Text>
                                <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                                    <Text>{sessionEndDate ? sessionEndDate.toDateString() : 'Select end date'}</Text>
                                </TouchableOpacity>
                            </View>
                            {/* Image Picker */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 55 }}>
                                <Text>Badge</Text>
                                <View>
                                    {selectedImage ? (
                                        <Image source={{ uri: selectedImage }} style={{ width: 70, height: 70, borderRadius: 10, margin: 5 }} />
                                    ) : (
                                        <Text>No image selected</Text>
                                    )}
                                </View>
                                <View style={{ height: '80%', width: 1, backgroundColor: 'gray', opacity: 0.3 }} />
                                <TouchableOpacity onPress={pickImage}>
                                    <View style={{ height: 40, width: 100, borderRadius: 15, backgroundColor: '#9ac9d9', justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, borderWidth: 0.5, borderColor: 'black', borderStyle: 'dotted' }}>
                                        <Text style={{ fontWeight: 'bold', color: 'white' }}>Browse</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            {/* Session Privacy */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 10 }}>
                                <Text>Session privacy</Text>
                                <Switch value={isPublic} onValueChange={(value) => setIsPublic(value)} />
                            </View>
                        </View>
                        {/* Create Session Button */}
                        <TouchableOpacity onPress={() => setopenModal(false)}>
                            <View style={{ height: 40, width: 150, borderRadius: 10, backgroundColor: 'green', justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, borderWidth: 0.5, borderColor: 'black', borderStyle: 'dotted' }}>
                                <Text style={{ fontWeight: '500', color: 'white', fontSize: 20 }}>Create</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Date Pickers */}
                <DateTimePickerModal
                    isVisible={showStartDatePicker}
                    mode="date"
                    onConfirm={handleStartDateConfirm}
                    onCancel={() => setShowStartDatePicker(false)}
                />
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
                <TouchableOpacity style={{ width: '50%', height: 39, backgroundColor: Selected == 0 ? '#D9D9D9' : '#9D9D9D', alignItems: 'center', justifyContent: 'center', borderBottomLeftRadius: 10, borderTopLeftRadius: 10 }}
                    onPress={() => { setSelected(0); }}
                >
                    <Text style={{ color: Selected == 0 ? '#1573FE' : 'white', fontSize: 18 }}>
                        Active
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity style={{ width: '50%', height: 39, backgroundColor: Selected == 1 ? '#D9D9D9' : '#9D9D9D', alignItems: 'center', justifyContent: 'center', borderTopRightRadius: 10, borderBottomRightRadius: 10 }}
                    onPress={() => { setSelected(1); }}
                >
                    <Text style={{ color: Selected == 1 ? '#1573FE' : 'white', fontSize: 18 }}>
                        Expired
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity style={{}}
                    onPress={() => setopenModal(true)}
                >
                    <Plus size={40} color='#1573FE' />
                </TouchableOpacity>

            </View>

            {renderModal()}


            <View style={{ width: '100%', height: '75%', alignItems: 'center', justifyContent: 'center' }}>
                <FlatList
                    data={Selected === 0 ? activeData : expiredData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    style={{ width: '90%', height: '80%' }}
                />
            </View>

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
});