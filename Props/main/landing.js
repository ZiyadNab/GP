import React, { useState, useEffect, useImperativeHandle, useCallback } from "react";
import { StyleSheet, ActivityIndicator, Text, Image, View, ScrollView } from 'react-native';
import { Bell, ChevronUp, ChevronDown } from 'lucide-react-native';
import { FlatList } from 'react-native-gesture-handler';
import { auth, db } from '../../database'
import NotificationsList from "../helpers/NotificationList";
import LottieView from "lottie-react-native";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

export default Landing = () => {
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState(null)
  const [balance, setBalance] = useState(null)
  const [profit, setProfit] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const [watchlist, setWatchlist] = useState(null)
  const [icon, setIcon] = useState(null)

  const sportfolio = [
    {
      icon: require('../../assets/logos/facebook.png'),
      name: 'Facebook, Inc',
      title: 'FB',
      rising: true,
      percantage: 0.59,
      price: {
        int: 365,
        decimal: 51,
      },
      single: {
        int: 12,
        decimal: 67,
      }
    },
    {
      icon: require('../../assets/logos/apple.png'),
      name: 'Apple, Inc',
      title: 'AAPL',
      rising: false,
      percantage: 0.59,
      price: {
        int: 1265,
        decimal: 51
      },
      single: {
        int: 205,
        decimal: 67,
      }
    },
    
  ]

  const swatchlist = [
    // {
    //   icon: require('../../assets/logos/google.png'),
    //   name: 'Alphabet, Inc',
    //   title: 'GOOGL',
    //   rising: true,
    //   percantage: 0.59,
    //   price: 213.76,
    // },
    // {
    //   icon: require('../../assets/logos/x.png'),
    //   name: 'X Corp',
    //   title: 'TWTR',
    //   rising: true,
    //   percantage: 0.59,
    //   price: 213.76,
    // },
    // {
    //   icon: require('../../assets/logos/stc.png'),
    //   name: 'Saudi Telecom Company',
    //   title: 'STC',
    //   rising: false,
    //   percantage: 0.59,
    //   price: 176.11,
    // },
    // {
    //   icon: require('../../assets/logos/aramco.png'),
    //   name: 'Saudi Arabian Oil Co',
    //   title: 'ARAMCO',
    //   rising: true,
    //   percantage: 0.59,
    //   price: 176.11,
    // },
    // {
    //   icon: require('../../assets/logos/microsoft.png'),
    //   name: 'Microsoft Corp',
    //   title: 'MSFT',
    //   rising: false,
    //   percantage: 0.59,
    //   price: 176.11,
    // },

  ]

  const footerVisibility = useSharedValue(1);
  const footerHeight = useDerivedValue(() => {
    return interpolate(footerVisibility.value, [0, 1], [370, 370]);
  });

  useEffect(() => {
    const docRef = doc(db, 'users', auth.currentUser.uid)

    const unsubscribe = onSnapshot(docRef, async (doc) => {
      if (doc.exists) {
        const userData = doc.data();
        setFullName(userData.fullname);
        setBalance(userData.portfolio.balance.toString().split('.'));
        setProfit(userData.portfolio.profit);
        setPortfolio(userData.portfolio.assets)
        setWatchlist(userData.portfolio.watchlist)
        setIcon(userData.icon)
        setLoading(false)
      }
    });

    return () => unsubscribe();
  }, []);

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

        <Bell size={30} color={"black"} />

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
        }}>View all</Text>
      </View>

      <View style={{
      }}>


        <View style={{ height: 200 }}>
          <ScrollView showsHorizontalScrollIndicator={false} horizontal>
            {portfolio.length ? portfolio.map((item, index) => (
              <View key={index} style={{
                backgroundColor: '#fff',
                padding: 10,
                elevation: 3,
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

                    {item.rising ? <ChevronUp color='#0DA070' size={30} /> : <ChevronDown color='#E01B2A' size={30} />}
                  </View>
                  <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                    <Text style={{
                      fontSize: 25,
                      fontWeight: 'bold',
                      color: 'black'
                    }}>
                      ${(item.single * item.amount).toString().split('.')[0]}
                      <Text style={{ fontSize: 20, color: '#757575' }}>.{(item.single * item.amount).toString().split('.')[1] ? (item.single * item.amount).toString().split('.')[1] : "00"}</Text>
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
                        ${item.single.toString().split('.')[0]}
                        <Text style={{ fontSize: 15, color: '#E0E0E0' }}>.{item.single.toString().split('.')[1] ? item.single.toString().split('.')[1] : "00"}</Text>
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: 'bold', color: item.rising ? '#0DA070' : '#E01B2A' }}>{item.percantage}%</Text>
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
          }}>View all</Text>
        </View>

        {watchlist.length ? (
          <NotificationsList
            footerVisibility={footerVisibility}
            footerHeight={footerHeight}
            watchlist={watchlist}
          />
        ): (
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