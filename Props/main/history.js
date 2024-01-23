import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
} from "react-native";
import { CalendarClock } from 'lucide-react-native';

export default function History() {
    const [isPressed, setIsPressed] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState("white");
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    const handleIconPress = () => {
        setIsPressed(!isPressed);
        setShowCalendar(!showCalendar);
        setBackgroundColor(showCalendar ? "white" : "lightgray");
    };

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];



    // here are the month data

    const monthData = {
        January: {
            1: {
                image: require("../../assets/icon.png"),
                info: "buy 1000",
            },
            2: {
                image: require("../../assets/icon.png"),
                info: "buy 1000",
            },
            // ... Add more days for January
        },
        February: {
            // ... Add data for February
        },
        // ... Add data for other months
    };

    const handleMonthPress = (month) => {
        setSelectedMonth(month);
        setSelectedDay(null); // Reset selected day when a new month is selected
    };

    const handleDayPress = (day) => {
        setSelectedDay(day);
    };

    const renderCalendar = () => {
        if (showCalendar) {
            return (
                <View style={styles.calendarContainer}>
                    {[...Array(31).keys()].map((day) => (
                        <TouchableOpacity
                            key={day + 1}
                            onPress={() => handleDayPress(day + 1)}
                        >
                            <View
                                style={[
                                    styles.dayContainer,
                                    {
                                        backgroundColor:
                                            selectedDay === day + 1 ? "rgba(30, 144, 255,0.2)" : "powderblue",
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        {
                                            color:
                                                selectedDay === day + 1 ? "dodgerblue" : "rgb(48, 87, 133)",
                                        },
                                    ]}
                                >
                                    {day + 1}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }
        return null;
    };

    const renderMonthData = () => {
        if (selectedMonth && selectedDay && monthData[selectedMonth]?.[selectedDay]) {
            const { image, info } = monthData[selectedMonth][selectedDay];
            return (
                <View style={styles.monthDataContainer}>
                    <Text style={{ color: 'grey', fontWeight: 'bold', fontSize: 15 }}>{`Today, ${selectedDay || 'N/A'} ${selectedMonth} 2022`}</Text>
                    <Image source={image} style={styles.image} />
                    <Text>{info}</Text>
                </View>
            );
        }

        return null;
    };

    return (
        <View style={[styles.container, { backgroundColor: isPressed ? "powderblue" : "white"}]}>
            <View style={[{ backgroundColor: isPressed ? "powderblue" : "white" }]}>
                <View style={styles.FirstBar}>
                    <Text style={styles.text}>History</Text>
                    <TouchableOpacity onPress={handleIconPress}>
                        <CalendarClock
                            size={30}
                            color={isPressed ? "rgb(0, 163, 255)" : "black"}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{
                    height: 100
                }}>
                    <ScrollView horizontal>
                        {months.map((month, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleMonthPress(month)}
                            >
                                <View
                                    style={[
                                        styles.monthContainer,
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color: selectedMonth === month ? "rgb(0, 163, 255)" : "rgb(93, 93, 93)",
                                            marginTop: 20,
                                            fontWeight: selectedMonth === month ? "bold" : "normal",
                                            fontSize: 17,
                                        }}
                                    >
                                        {month}
                                    </Text>
                                    <View
                                        style={{
                                            width: "50%",
                                            borderWidth: selectedMonth === month ? 2 : 0,
                                            borderColor: "rgb(0, 163, 255)",
                                            borderRadius: 9,
                                        }}
                                    ></View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
            {renderCalendar()}
            <View style={[{ backgroundColor: isPressed ? "white" : "white" }]}>
                {renderMonthData()}

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 50,
        
    },
    FirstBar: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    text: {
        fontSize: 30,
        fontWeight: "bold",
    },
    calendarContainer: {
        backgroundColor: "powderblue",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        padding: 10,
        borderRadius: 5,
        marginTop: "6%",
    },
    dayContainer: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50,
        borderColor: "deepskyblue",
        margin: "2%",
    },
    dayText: {
        fontSize: 20,
        fontWeight: "bold",
    },
    monthContainer: {
        alignItems: "center",
        padding: "2%",
    },
    monthDataContainer: {
        padding: "3%",
        marginTop: "4%",
        marginLeft: "6%",
    },
    image: {
        width: 60,
        height: 60,
        resizeMode: "contain",
        margin: "2%",
        borderWidth: 0.6,
        borderRadius: 70,
        borderColor: "rgb(199, 199, 199)",
        marginTop: "6%"
    },
});