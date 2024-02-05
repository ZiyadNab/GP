import React, { useState, useEffect } from "react";
import { StyleSheet, ActivityIndicator, Text, Image, View, ScrollView } from 'react-native';
import { FontAwesome5, Entypo } from '@expo/vector-icons';
import { auth, db } from '../../database'
import NotificationsList from "../helpers/NotificationList";
import LottieView from "lottie-react-native";
import {
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import Animated, {
  interpolate,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import moment from "moment";

export default Landing = () => {
  const [reward, setReward] = useState(null)
  const [nextRewardDate, setNextRewardDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState(null)
  const [balance, setBalance] = useState(null)
  const [profit, setProfit] = useState(0)
  const [time, setTime] = useState('05:00');
  const [userBalance, setUserBalance] = useState()
  const [watchlist, setWatchlist] = useState([])
  const [icon, setIcon] = useState(null)
  const [assets, setAssets] = useState([])

  const footerVisibility = useSharedValue(1);
  const footerHeight = useDerivedValue(() => {
    return interpolate(footerVisibility.value, [0, 1], [370, 370]);
  });

  useEffect(() => {
    const docRef = doc(db, 'users', auth.currentUser.uid);

    const unsubscribe = onSnapshot(docRef, async (doc) => {
      if (doc.exists) {
        const userData = doc.data();
        if (doc.data().portfolio.reward === null) {
          updateDoc(docRef, {
            "portfolio.reward": moment().add(1, 'days').toISOString()
          })

        } else if (moment(doc.data().portfolio.reward).isBefore(moment(), 'day')) {
          updateDoc(docRef, {
            "portfolio.balance": userData.portfolio.balance + 1000,
            "portfolio.reward": moment().add(1, 'days').toISOString()
          })

        } else {
          setNextRewardDate(doc.data().portfolio.reward)

        }
        setFullName(userData.fullname);
        setUserBalance(userData.portfolio.balance)
        setBalance(userData.portfolio.balance.toString().split('.'));
        const updatedWatchlist = [];

        for (const e of userData.portfolio.watchlist) {
          const res = await fetch(`https://eodhd.com/api/real-time/${e.title}.${e.region}?api_token=659429ddd804e2.44750789&fmt=json`);
          const json = await res.json();
          json.icon = e.icon;
          json.name = e.name;
          json.title = e.title;
          json.region = e.region;
          updatedWatchlist.push(json);
        }

        setWatchlist(updatedWatchlist);
        setIcon(userData.icon);

        const updatedAssets = [];
        let prof = 0;

        for (const e of userData.portfolio.assets) {
          const res = await fetch(`https://eodhd.com/api/real-time/${e.title}.${e.region}?api_token=659429ddd804e2.44750789&fmt=json`);
          const json = await res.json();
          json.icon = e.icon;
          json.name = e.name;
          json.title = e.title;
          json.amount = e.amount;
          json.price = e.price;
          json.region = e.region;
          updatedAssets.push(json);
          prof += json.amount * json.close;
        }

        setProfit(prof.toFixed(2));
        setAssets(updatedAssets);
        setLoading(false);
      }
    });

  }, []);

  
  useEffect(() => {
    const timer = setInterval(() => {

      const now = moment();
      const targetDate = moment(nextRewardDate);
      const duration = moment.duration(targetDate.diff(now));

      const days = Math.floor(duration.asDays());
      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();
      if (days >= 1) setReward(`${days} days`)
      else if (hours >= 1) setReward(`${hours} hours and ${minutes} minutes`)
      else if (minutes >= 1) setReward(`${minutes} minutes and ${seconds} seconds`)
      else if (seconds >= 1) setReward(`${seconds} seconds`)
      else if (seconds < 0) {
        updateDoc(docRef, {
          "portfolio.balance": userBalance + 1000,
          "portfolio.reward": moment().add(1, 'days').toISOString()
        })
      }
      
    }, 1000);

    return () => {
      clearInterval(timer);

    };
  }, [nextRewardDate])

  useEffect(() => {

    // Set up the countdown timer interval
    const timer = setInterval(() => {

      setTime((prevTime) => {
        const [minutes, seconds] = prevTime.split(':').map(Number);

        if (minutes === 0 && seconds === 0) {
          clearInterval(timer);
          // Trigger your function when the countdown expires
          handleCountdownExpiration();

          // Reset the timer to 1:00
          return '05:00';
        } else {
          const newTime =
            seconds === 0
              ? `${String(minutes - 1).padStart(2, '0')}:59`
              : `${String(minutes).padStart(2, '0')}:${String(seconds - 1).padStart(2, '0')}`;

          return newTime;
        }
      });
    }, 1000);

    const handleCountdownExpiration = async () => {

      const updatedAssets = [];
      let prof = 0;

      for (const e of assets) {
        const res = await fetch(`https://eodhd.com/api/real-time/${e.title}.${e.region}?api_token=659429ddd804e2.44750789&fmt=json`);
        const json = await res.json();
        json.icon = e.icon;
        json.name = e.name;
        json.title = e.title;
        json.amount = e.amount;
        json.price = e.price;
        json.region = e.region;
        updatedAssets.push(json);
        prof += json.amount * json.close;
      }

      setProfit(prof.toFixed(2));
      setAssets(updatedAssets);

      const updatedWatchlist = [];

      for (const e of watchlist) {
        const res = await fetch(`https://eodhd.com/api/real-time/${e.title}.${e.region}?api_token=659429ddd804e2.44750789&fmt=json`);
        const json = await res.json();
        json.icon = e.icon;
        json.name = e.name;
        json.title = e.title;
        json.region = e.region;
        updatedWatchlist.push(json);
      }

      setWatchlist(updatedWatchlist);
    };

    return () => {
      clearInterval(timer);

    };
  }, [assets])

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
        flexDirection: 'row',
        marginTop: 60,
        width: '90%',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>

        <View style={{
          flexDirection: 'row',
        }}>
          <Image source={{ uri: icon }} style={{
            width: 50,
            height: 50,
            borderRadius: 25,
          }} />

          <View style={{
            flexDirection: 'column',
            marginLeft: 20,
          }}>
            <Text>Good morning</Text>
            <Text style={{
              fontWeight: 'bold',
              fontSize: 18
            }}>{fullName}</Text>
          </View>
        </View>
        <FontAwesome5 name="bell" size={30} color={"black"} />

      </View>

      <View style={{
        backgroundColor: '#434343',
        width: '90%',
        padding: 20,
        marginTop: 20,
        borderRadius: 5
      }}>

        <Text style={{
          color: 'white'
        }}>Your total balance</Text>

        <Text style={{
          fontSize: 25,
          fontWeight: 'bold',
          color: 'white'
        }}>

          {"$" + balance[0]}
          <Text style={{ fontSize: 15, color: 'white' }}>.{balance[1] ? balance[1].substring(0, 2) : '00'}</Text>
        </Text>

        {
          nextRewardDate !== null ? (
            <View style={{
              flexDirection: 'row',
              marginTop: 5,
              alignItems: 'center'
            }}>
              <FontAwesome5 name="coins" color="lightgreen" size={13} />
              <Text style={{
                color: 'white',
                fontSize: 10,
                marginLeft: 5
              }}>Your next reward in {reward}</Text>
            </View>
          ) : null
        }

        <View style={{
          backgroundColor: '#515151',
          padding: 15,
          marginTop: 20,
          borderRadius: 2,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          <Text style={{
            color: 'white'
          }}>Total Profit</Text>
          <Text style={{
            fontWeight: 'bold',
            color: 'white'
          }}>${profit}</Text>
        </View>

      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginTop: 10
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
        }}>Portfolio</Text>

        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#F6227D'
        }}>{time}</Text>
      </View>

      <View style={{
      }}>


        <View style={{ height: 200 }}>
          <ScrollView showsHorizontalScrollIndicator={false} horizontal>
            {assets.length ? assets.map((item, index) => (
              <View key={index} style={{
                backgroundColor: '#fff',
                padding: 10,
                elevation: 3,
                shadowOffset: { width: 0, height: 3 / 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3 / 2,
                margin: 10,
                marginLeft: 20,
                borderRadius: 10,
                height: 150,
                width: 250,
              }}>
                <View style={{ flex: 1 }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <Image
                        source={{ uri: item.icon }}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          resizeMode: 'contain'
                        }}
                      />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.title}</Text>
                        <Text style={{ fontSize: 15, maxWidth: 150 }}>{item.name}</Text>
                      </View>
                    </View>

                    {(item.amount * item.price) === (item.amount * item.close) ? <Entypo name="minus" color='blue' size={30} /> : (item.amount * item.price) < (item.amount * item.close) ? <Entypo name="chevron-up" color='#0DA070' size={30} /> : <Entypo name="chevron-down" color='#E01B2A' size={30} />}
                  </View>
                  <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                    <Text style={{
                      fontSize: 25,
                      fontWeight: 'bold',
                      color: 'black'
                    }}>
                      ${(item.close * Number(item.amount)).toString().split('.')[0]}
                      <Text style={{ fontSize: 20, color: '#757575' }}>.{(item.close * Number(item.amount)).toFixed(2).toString().split('.')[1] ? (item.close * Number(item.amount)).toFixed(2).toString().split('.')[1] : "00"}</Text>
                    </Text>

                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      margin: 1
                    }}>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: 'bold',
                        color: '#A8A8A8',
                        marginRight: 5
                      }}>
                        ${item.close.toString().split('.')[0]}
                        <Text style={{ fontSize: 15, color: '#E0E0E0' }}>.{item.close.toString().split('.')[1] ? item.close.toString().split('.')[1] : "00"}</Text>
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: 'bold', color: item.change_p > 0 ? '#0DA070' : '#E01B2A' }}>{item.change_p.toFixed(2)}%</Text>
                    </View>
                  </View>
                </View>
              </View>

            )) : (
              <View style={{
                backgroundColor: '#fff',
                padding: 10,
                margin: 10,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}>

                <LottieView
                  style={{
                    width: 150,
                    height: 150,
                  }}
                  loop={true}
                  autoPlay={true}
                  source={require('../../assets/Lottie/PLanding.json')}
                />

                <Text>Errr, too early. Please make a purchase first</Text>
              </View>

            )}
          </ScrollView>

        </View>


      </View>

      <View style={{ width: '100%', height: 215 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 20,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
          }}>Watchlist</Text>

          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#F6227D'
          }}>{time}</Text>
        </View>

        {watchlist.length ? (
          <NotificationsList
            footerVisibility={footerVisibility}
            footerHeight={footerHeight}
            watchlist={watchlist}
          />
        ) : (
          <View style={{
            backgroundColor: '#fff',
            paddingHorizontal: 75,
            flexDirection: 'row',
            marginTop: 30,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}>

            <LottieView
              style={{
                width: 100,
                height: 100,
                marginRight: 40
              }}
              loop={true}
              autoPlay={true}
              source={require('../../assets/Lottie/WLanding.json')}
            />

            <Text style={{
              marginTop: 50,
              maxWidth: 200,
              textAlign: 'left'
            }}>Your watch list appears to be empty., select a few favorites, and then recheck</Text>
          </View>
        )}


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
}); 