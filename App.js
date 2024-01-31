import React, { useRef, useEffect, useState } from 'react'
import { StyleSheet, Text, View, Animated, Dimensions, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './database'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, GalleryHorizontalEnd, Layers, Package, User } from 'lucide-react-native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import PortfolioScreen from './Props/main/portfolio'
import ProfileScreen from './Props/main/profile'
import HistoryScreen from './Props/main/history'
import SessionsScreen from './Props/main/session'
import LangingScreen from './Props/main/landing'
import MarketScreen from './Props/main/market'
import StockScreen from './Props/main/stock'
import SIgnInOption from './Props/getStarted/SIgnInOption'
import CreateAnAccount from './Props/getStarted/CreateAnAccount'
import ForgotPassword from './Props/getStarted/ForgotPassword'
import Login from './Props/getStarted/Login'
import VerificationCode from './Props/getStarted/VerificationCode'
import WalletScreen from './Props/main/wallet'
import marketWalletScreen from './Props/main/marketWallet'
import TradeScreen from './Props/main/trade'
import SessionDetailsScreen from './Props/main/sessionDetails'

const Tab = createBottomTabNavigator()

function getWidth() {
  let width = Dimensions.get("window").width
  width -= 40
  return width / 5
}

const PortfolioScreensStack = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar
      }}>

      <Stack.Screen
        name="WalletScreen"
        component={WalletScreen}
      />

      <Stack.Screen
        name="PortfolioScreen"
        component={PortfolioScreen}
      />

      <Stack.Screen
        name="Stock"
        component={StockScreen}
      />

      <Stack.Screen
        name="Market"
        component={MarketScreen}
      />

      <Stack.Screen
        name="HistoryScreen"
        component={HistoryScreen}
      />

    </Stack.Navigator>
  )
};

const MarketScreensStack = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,

      }}>

      <Stack.Screen
        name="Market"
        component={MarketScreen}
      />

      <Stack.Screen
        name="Stock"
        component={StockScreen}
      />

      <Stack.Screen
        name="marketWallet"
        component={marketWalletScreen}
      />

      <Stack.Screen
        name="Trade"
        component={TradeScreen}
      />

      <Stack.Screen
        name="Pin"
        component={VerificationCode}
      />

    </Stack.Navigator>
  )
};

const SessionsScreensStack = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar
      }}>

      <Stack.Screen
        name="Session"
        component={SessionsScreen}
      />

      <Stack.Screen
        name="SessionDetails"
        component={SessionDetailsScreen}
      />

      <Stack.Screen
        name="WalletScreen"
        component={WalletScreen}
      />

      <Stack.Screen
        name="PortfolioScreen"
        component={PortfolioScreen}
      />

      <Stack.Screen
        name="Stock"
        component={StockScreen}
      />

      <Stack.Screen
        name="Market"
        component={MarketScreen}
      />

      <Stack.Screen
        name="HistoryScreen"
        component={HistoryScreen}
      />

    </Stack.Navigator>
  )
};

const HomeScreensStack = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar
      }}>

      <Stack.Screen
        name="LangingScreen"
        component={LangingScreen}
      />

    </Stack.Navigator>
  )
};

export default function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const tabOffsetValue = useRef(new Animated.Value(0)).current
  const Stack = createStackNavigator();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLogin = async () => {
      // try {
      //   const userToken = await AsyncStorage.getItem('userToken');
      //   console.log(userToken)
      //   if (userToken) {
      //     setLoggedIn(true);
      //   } else {
      //     setLoggedIn(false);
      //   }
      // } catch (error) {
      //   console.error('AsyncStorage error:', error);
      // } finally {
      //   setLoading(false);
      // }

      onAuthStateChanged(auth, (user) => {
        if (user) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }

        setLoading(false)
      }, (err) => {
        console.error('AsyncStorage error:', err);
      })
    };

    checkUserLogin();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (loggedIn) return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
        }}>

        <Tab.Screen
          name="Home"
          component={HomeScreensStack}
          options={{
            tabBarIcon: ({ focused, color, size }) => {
              return <Home size={size} color={color} />;
            },
          }}
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: 0,
                useNativeDriver: true
              }).start()
            }
          })}
        />

        <Tab.Screen
          name="MarketS"
          component={MarketScreensStack}
          options={{
            tabBarIcon: ({ focused, color, size }) => {
              return <GalleryHorizontalEnd size={size} color={color} />;
            },
          }}
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth(),
                useNativeDriver: true
              }).start()
            }
          })}
        />

        <Tab.Screen
          name="Sessions"
          component={SessionsScreensStack}
          options={{
            tabBarIcon: ({ focused, color, size }) => {
              return (
                <View style={{
                  width: 50,
                  height: 50,
                  backgroundColor: focused ? color : 'white',
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 3,
                  marginBottom: 20
                }}>
                  <Layers size={25} color={focused ? 'white' : color} />
                </View>
              )
            },
          }}
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth() * 2,
                useNativeDriver: true
              }).start()
            }
          })}
        />

        <Tab.Screen
          name="Portfolio"
          component={PortfolioScreensStack}
          options={{
            tabBarIcon: ({ focused, color, size }) => {
              return <Package size={size} color={color} />;
            },
          }}
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth() * 3,
                useNativeDriver: true
              }).start()
            }
          })}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => {
              return <User size={size} color={color} />;
            },
          }}
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth() * 4,
                useNativeDriver: true
              }).start()
            }
          })}
        />

      </Tab.Navigator>

      <Animated.View style={{
        width: getWidth() - 20,
        height: 2,
        backgroundColor: '#1573FE',
        position: 'absolute',
        bottom: 20,
        left: 30,
        borderRadius: 2,
        transform: [{
          translateX: tabOffsetValue
        }]
      }}>

      </Animated.View>
    </NavigationContainer>
  )

  if (!loggedIn) return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar
        }}>

        <Stack.Screen
          name="SIgnInOption"
          component={SIgnInOption}
        />

        <Stack.Screen
          name="Login"
          component={Login}
        />

        <Stack.Screen
          name="CreateAnAccount"
          component={CreateAnAccount}
        />

        <Stack.Screen
          name="VerificationCode"
          component={VerificationCode}
        />

        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
        />

      </Stack.Navigator>
    </NavigationContainer>

  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabBar: {
    backgroundColor: 'white',
    height: 60,
    position: 'absolute',
    bottom: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 10,
      height: 10
    },
    elevation: 10
  },
});
