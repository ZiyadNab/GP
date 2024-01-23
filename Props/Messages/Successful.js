import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react'
import LottieView from "lottie-react-native";

export default function Successful({ pass }) {

    return (
        <View style={styles.container}>

            <LottieView
                source={require('.')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        width: '95%'
    },

});