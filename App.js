import React, { useRef, useEffect, useState } from 'react'
import { StatusBar } from 'react-native';
import { StyleSheet, Platform, View, Animated, Dimensions, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './database'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import PortfolioScreen from './Props/main/portfolio'
import ProfileScreen from './Props/main/profile'
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

function getWidth() {
  let width = Dimensions.get("window").width
  width -= 40
  return width / 5
}

const PortfolioScreensStack = () => {
  const Stack = createStackNavigator();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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

      </Stack.Navigator>
    </GestureHandlerRootView>

  )
};

const MarketScreensStack = () => {
  const Stack = createStackNavigator();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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

        <Stack.Screen
          name="LangingScreen"
          component={LangingScreen}
        />

      </Stack.Navigator>
    </GestureHandlerRootView>

  )
};

const SessionsScreensStack = () => {
  const Stack = createStackNavigator();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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

      </Stack.Navigator>
    </GestureHandlerRootView>

  )
};

const HomeScreensStack = () => {
  const Stack = createStackNavigator();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  )
};

export default function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const tabOffsetValue = useRef(new Animated.Value(0)).current
  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator()
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar hidden={false} translucent={true} backgroundColor="transparent" barStyle="dark-content" />
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
                return <Feather name="home" size={size} color={color} />;
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
                return <AntDesign name="appstore-o" size={size} color={color} />
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
                    shadowOffset: { width: 0, height: 3 / 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3 / 2,
                    elevation: 3,
                    marginBottom: 20
                  }}>
                    <Feather name="layers" size={size} color={focused ? 'white' : color} />
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
                return <Ionicons name="file-tray-outline" size={size} color={color} />
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
                return <Feather name="user" size={size} color={color} />
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
    </GestureHandlerRootView>

  )

  if (!loggedIn) return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar hidden={false} translucent={true} backgroundColor="transparent" barStyle="dark-content" />
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
    </GestureHandlerRootView>
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
    padding: Platform.OS === 'ios' ? 30 : 0,
    position: 'absolute',
    bottom: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 10 / 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10 / 2,
    elevation: 10
  },
});
