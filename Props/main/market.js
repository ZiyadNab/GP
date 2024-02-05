import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, Text, ActivityIndicator, View, TextInput, TouchableOpacity } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import NotificationsList from "../helpers/NotificationList";
import Animated, {
    interpolate,
    useDerivedValue,
    useSharedValue,
} from "react-native-reanimated";
import LottieView from "lottie-react-native";
import moment from "moment";

export default function Market({ navigation }) {
    const [OC, setOC] = useState("Calculating")
    const [intervalId, setIntervalId] = useState(null);
    const [selected, setSelected] = useState(0);
    const [loading, setLoading] = useState(true);
    const [listStockRegions, setListStockRegions] = useState([]);
    const [loadingStocksFromSelectedRegion, setLoadingStocksFromSelectedRegion] = useState(true);
    const [chunkedSymbols, setChunkedSymbols] = useState([]);
    const [pagings, setPagings] = useState(0);
    const [json1, setJson1] = useState([]);
    const [searchedStocks, setSearchStocks] = useState('');
    const [searchText, setSearchText] = useState('');
    const [stocks, setStocks] = useState([]);

    const footerVisibility = useSharedValue(1);
    const footerHeight = useDerivedValue(() => {
        return interpolate(footerVisibility.value, [0, 1], [0, 0]);
    });

    const formatCountdownString = async (exchangeInfo) => {
    
        const updateCountdown = () => {
            const currentTime = moment();
            const closingTime = moment(exchangeInfo.TradingHours.Close, "HH:mm:ss");
            
            // Check if the current day is within the working days
            const workingDays = exchangeInfo.TradingHours.WorkingDays.split(",");
            const isWorkingDay = workingDays.includes(currentTime.format("ddd"));
            if (isWorkingDay && exchangeInfo.isOpen) {
                // Exchange is open, and it closes in the future
                const duration = moment.duration(closingTime.diff(currentTime));
                const hours = duration.hours();
                const minutes = duration.minutes();
                const seconds = duration.seconds();
    
                setOC(`Closes in ${hours}h ${minutes}m ${seconds}s`);
            } else {
                // Calculate time until the next working day
                let nextWorkingDay = moment().startOf('day');
    
                // If the current time is after the closing time, move to the next day
                if (currentTime.isAfter(closingTime)) {
                    nextWorkingDay.add(1, 'days');
                }
    
                while (!workingDays.includes(nextWorkingDay.format("ddd"))) {
                    nextWorkingDay.add(1, 'days');
                }
    
                const duration = moment.duration(nextWorkingDay.diff(currentTime));
                const days = duration.days();
    
                if (days > 0) {
                    setOC(`Out of working days, reopens in ${days} ${days === 1 ? "day" : "days"}`);
                } else {
                    // Exchange is closed or will open today
                    const nextOpeningTime = moment(exchangeInfo.TradingHours.Open, "HH:mm:ss");
                    nextOpeningTime.add(1, 'day')
                    const openingDuration = moment.duration(nextOpeningTime.diff(currentTime));
                    const hours = openingDuration.hours();
                    const minutes = openingDuration.minutes();
    
                    if (hours > 0) {
                        setOC(`Reopens in ${hours} ${hours === 1 ? "hour" : "hours"} ${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
                    } else if (minutes > 0) {
                        setOC(`Reopens in ${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
                    } else {
                        setOC(`Reopens Soon`);
                    }
                }
            }
        };

        // Set a new interval
        setIntervalId(setInterval(updateCountdown, 60000))
        updateCountdown()

    };   
    
    const handleSearch = (text) => {
        setSearchText(text)
        const filteredStocks = stocks.filter(
            (stock) =>
                stock?.name?.toLowerCase().includes(text.toLowerCase()) ||
                stock?.title?.toLowerCase().includes(text.toLowerCase())
        );

        setSearchStocks(filteredStocks)
    };

    const handlePress = async (index) => {
        clearInterval(intervalId);
        setIntervalId(null)
        setOC("Calculating")
        setPagings(0)
        setSelected(index);
        setLoadingStocksFromSelectedRegion(true);
        if (listStockRegions.length > 0 && listStockRegions[index]) {
            fetch(`https://eodhd.com/api/exchange-symbol-list/${listStockRegions[index].Code}?api_token=659429ddd804e2.44750789&fmt=json`)
                .then(async res => {
                    var json1 = await res.json();

                    setJson1(json1)
                    const chunkedSymbolsLocal = [];
                    const chunkSize = 100;

                    for (let i = 0; i < json1.length; i += chunkSize) {
                        const chunk = json1.slice(i, i + chunkSize);
                        const symbols = chunk.map(item => `${item.Code}.${listStockRegions[index].Code}`);
                        chunkedSymbolsLocal.push(symbols);
                    }

                    if (json1.length === 0) {
                        setStocks([]);
                        setLoadingStocksFromSelectedRegion(false);
                        return
                    }

                    setChunkedSymbols(chunkedSymbolsLocal)
                    const symbolsForPage = chunkedSymbolsLocal[0].join(',');
                    try {
                        const bulk = await fetch(`https://eodhd.com/api/eod-bulk-last-day/${listStockRegions[index].Code}?api_token=659429ddd804e2.44750789&symbols=${symbolsForPage}&fmt=json`);
                        const json = await bulk.json();
                        const mergedData = json.map(item => ({
                            ...item,
                            ...(json1.find(obj => obj.Code === item.code) || {})
                        }));
                        const transformedData = mergedData.map(item => ({
                            icon: `https://eodhd.com/img/logos/${listStockRegions[index].Code}/${item.Code}.png`,
                            name: item.Name,
                            title: item.Code,
                            rising: item.close > item.prev_close,
                            percantage: (((item.close - item.prev_close) / item.prev_close) * 100).toFixed(2),
                            price: `${item.exchange_short_name}${item.close}`,
                            numPrice: item.close,
                            region: listStockRegions[index].Code
                        }));

                        const exchangeResponse = await fetch(`https://eodhd.com/api/exchange-details/${listStockRegions[index].Code}?api_token=659429ddd804e2.44750789&fmt=json`);
                        const exchangeData = await exchangeResponse.json();
                        formatCountdownString(exchangeData)
                        setStocks(transformedData);
                        setLoadingStocksFromSelectedRegion(false);
                    } catch (error) {
                        console.error("Error fetching data:", error);
                        setLoadingStocksFromSelectedRegion(false);
                    }
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                    setLoadingStocksFromSelectedRegion(false);
                });
        }
    };

    useEffect(() => {
        clearInterval(intervalId);
        setIntervalId(null)
        setOC("Calculating")
        fetch('https://eodhd.com/api/exchanges-list/?api_token=659429ddd804e2.44750789&fmt=json')
            .then(async res => {
                setLoadingStocksFromSelectedRegion(true);
                var json = await res.json();
                json.push({
                    "Name": "Saudi Arabia Exchange",
                    "Code": "SR",
                    "Country": "SA",
                    "Currency": "SR",
                    })
                json.sort((a, b) => {
                    if (a.Name === "Saudi Arabia Exchange") {
                        return -1;
                    } else if (b.Name === "Saudi Arabia Exchange") {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                await fetch(`https://eodhd.com/api/exchange-symbol-list/${json[selected].Code}?api_token=659429ddd804e2.44750789&fmt=json`)
                    .then(async res => {
                        var json1 = await res.json();
                        setJson1(json1)
                        const chunkedSymbolsLocal = [];
                        const chunkSize = 100;

                        for (let i = 0; i < json1.length; i += chunkSize) {
                            const chunk = json1.slice(i, i + chunkSize);
                            const symbols = chunk.map(item => `${item.Code}.${json[selected].Code}`);
                            chunkedSymbolsLocal.push(symbols);
                        }

                        if (json1.length === 0) {
                            setStocks([]);
                            setLoadingStocksFromSelectedRegion(false);
                            return
                        }

                        setChunkedSymbols(chunkedSymbolsLocal)
                        const symbolsForPage = chunkedSymbolsLocal[0].join(',');
                        try {
                            const bulk = await fetch(`https://eodhd.com/api/eod-bulk-last-day/${json[selected].Code}?api_token=659429ddd804e2.44750789&symbols=${symbolsForPage}&fmt=json`);
                            const json2 = await bulk.json();
                            const mergedData = json2.map(item => ({
                                ...item,
                                ...(json1.find(obj => obj.Code === item.code) || {})
                            }));
                            const transformedData = mergedData.map(item => ({
                                icon: `https://eodhd.com/img/logos/${json[selected].Code}/${item.Code}.png`,
                                name: item.Name,
                                title: item.Code,
                                rising: item.close > item.prev_close,
                                percantage: (((item.close - item.prev_close) / item.prev_close) * 100).toFixed(2),
                                price: `${item.exchange_short_name}${item.close}`,
                                numPrice: item.close,
                                region: json[selected].Code
                            }));

                            setStocks(transformedData);
                            setLoadingStocksFromSelectedRegion(false);
                        } catch (error) {
                            console.error("Error fetching data:", error);
                            setLoadingStocksFromSelectedRegion(false);
                        }

                    })
                    .catch(error => {
                        console.error("Error fetching data:", error);
                        setLoadingStocksFromSelectedRegion(false);
                    });

                setListStockRegions(json);
                const exchangeResponse = await fetch(`https://eodhd.com/api/exchange-details/${json[selected].Code}?api_token=659429ddd804e2.44750789&fmt=json`);
                const exchangeData = await exchangeResponse.json();
                formatCountdownString(exchangeData)
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    }, []);

    const handlePagination = async (direction) => {
        setSearchText('')
        setLoadingStocksFromSelectedRegion(true);
        if (direction === 'prev' && pagings > 0) {
            setPagings(prevPagings => prevPagings - 1);
            const symbolsForPage = chunkedSymbols[pagings - 1].join(',');
            try {
                const bulk = await fetch(`https://eodhd.com/api/eod-bulk-last-day/${listStockRegions[selected].Code}?api_token=659429ddd804e2.44750789&symbols=${symbolsForPage}&fmt=json`);
                const json = await bulk.json();
                const mergedData = json.map(item => ({
                    ...item,
                    ...(json1.find(obj => obj.Code === item.code) || {})
                }));
                const transformedData = mergedData.map(item => ({
                    icon: `https://eodhd.com/img/logos/${listStockRegions[selected].Code}/${item.Code}.png`,
                    name: item.Name,
                    title: item.Code,
                    rising: item.close > item.prev_close,
                    percantage: (((item.close - item.prev_close) / item.prev_close) * 100).toFixed(2),
                    price: `${item.exchange_short_name}${item.close}`,
                    numPrice: item.close,
                    region: listStockRegions[selected].Code
                }));

                setStocks(transformedData);
                setLoadingStocksFromSelectedRegion(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoadingStocksFromSelectedRegion(false);
            }
        } else if (direction === 'next' && pagings < chunkedSymbols.length - 1) {
            setPagings(prevPagings => prevPagings + 1);
            const symbolsForPage = chunkedSymbols[pagings + 1].join(',');
            try {
                const bulk = await fetch(`https://eodhd.com/api/eod-bulk-last-day/${listStockRegions[selected].Code}?api_token=659429ddd804e2.44750789&symbols=${symbolsForPage}&fmt=json`);
                const json = await bulk.json();
                const mergedData = json.map(item => ({
                    ...item,
                    ...(json1.find(obj => obj.Code === item.code) || {})
                }));
                const transformedData = mergedData.map(item => ({
                    icon: `https://eodhd.com/img/logos/${listStockRegions[selected].Code}/${item.Code}.png`,
                    name: item.Name,
                    title: item.Code,
                    rising: item.close > item.prev_close,
                    percantage: (((item.close - item.prev_close) / item.prev_close) * 100).toFixed(2),
                    price: `${item.exchange_short_name}${item.close}`,
                    numPrice: item.close,
                    region: listStockRegions[selected].Code
                }));

                setStocks(transformedData);
                setLoadingStocksFromSelectedRegion(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoadingStocksFromSelectedRegion(false);
            }
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={{
                marginTop: 50,

            }}>
                <View style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    marginHorizontal: 20,
                    marginBottom: 20,
                    alignItems: 'center'
                }}>
                    <View style={{
                        flexDirection: 'column',
                    }}>
                        <Text style={{
                            fontSize: 30,
                            fontWeight: 'bold',
                            color: OC === "Calculating" ? 'black' : OC.includes('Closes') ? '#36FF00' : 'red'
                        }}>EXCHANGE</Text>

                        <Text style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: 'black'
                        }}>{OC.toUpperCase()}</Text>
                    </View>

                    {
                        !loadingStocksFromSelectedRegion ? stocks.length ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity style={{ marginRight: 5 }} onPress={() => handlePagination('prev')}>
                                        <Entypo name="chevron-with-circle-left" size={25} color={'#1573FE'} />
                                    </TouchableOpacity>
                                    <Text style={{ textAlign: 'center' }}>{`${pagings + 1} / ${chunkedSymbols.length}`}</Text>
                                </View>
                                <TouchableOpacity style={{ marginLeft: 5 }} onPress={() => handlePagination('next')}>
                                    <Entypo name="chevron-with-circle-right" size={25} color={'#1573FE'} />
                                </TouchableOpacity>
                            </View>
                        ) : null : null
                    }

                </View>



                <View style={{
                    marginHorizontal: 20,
                    height: 40,
                    backgroundColor: '#F5F5F5',
                    borderRadius: 5,
                }}>

                    <TextInput
                        value={searchText}
                        placeholder="Select stock"
                        cursorColor={"black"}
                        onChangeText={handleSearch}
                        style={{
                            marginLeft: 10,
                            height: 40,
                            backgroundColor: '#F5F5F5',
                            borderRadius: 5
                        }} />

                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%', height: 60 }}>
                    {
                        listStockRegions.map((v, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => handlePress(i)}
                                style={{
                                    flexDirection: 'row',
                                    marginLeft: 10,
                                    padding: 10
                                }}
                            >
                                <Text style={{
                                    borderRadius: 5,
                                    padding: 10,
                                    backgroundColor: selected === i ? '#F4F4F4' : 'white',
                                    color: selected === i ? '#1573FE' : 'black',
                                    fontWeight: 'bold'
                                }}>{v.Name}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>


            </View>

            {
                loadingStocksFromSelectedRegion ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                ) : !stocks.length ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <LottieView
                            style={{
                                width: 300,
                                height: 300,
                            }}
                            loop={true}
                            autoPlay={true}
                            source={require('../../assets/Lottie/NoAssets.json')}
                        />
                        <Text>No stocks avaliable!</Text>
                    </View>
                ) : searchText !== '' ? searchedStocks.length ? (
                    <View style={{ width: '100%', justifyContent: 'flex-end' }}>

                        <NotificationsList
                            footerVisibility={footerVisibility}
                            footerHeight={footerHeight}
                            watchlist={searchedStocks}
                        />
                    </View>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <LottieView
                            style={{
                                width: 300,
                                height: 300,
                            }}
                            loop={true}
                            autoPlay={true}
                            source={require('../../assets/Lottie/NoAssets.json')}
                        />
                        <Text>No stocks avaliable!</Text>
                    </View>
                ) : (
                    <View style={{ width: '100%', justifyContent: 'flex-end' }}>

                        <NotificationsList
                            footerVisibility={footerVisibility}
                            footerHeight={footerHeight}
                            watchlist={stocks}
                        />
                    </View>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
