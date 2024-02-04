import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message'

export default function SignInOption({ navigation }) {

  return (
    <View style={styles.container}>

      <View style={{ justifyContent: 'center', margin: 20 }}>

        {/* Header text */}
        <Text style={{ fontSize: 50, fontWeight: 'bold', textAlign: 'left', bottom: 50 }}>Let's you in</Text>

        {/* Facebook Sign In Provider */}
        <TouchableOpacity onPress={() => {
          Toast.show({
            type: 'info',
            text1: 'Coming Soon',
            text2: 'Sign in from third party apps will be supported soon.',
            visibilityTime: 5000,
            autoHide: true
          });
        }} style={[styles.SIgnInProviders, { backgroundColor: '#ECE7FE' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image style={{ width: 50, height: 50 }} source={require('../../assets/logos/facebook.png')} />
            <Text style={{ fontSize: 17, paddingHorizontal: 20 }}>Continue with Facebook</Text>
          </View>
        </TouchableOpacity>

        {/* Google Sign In Provider */}
        <TouchableOpacity onPress={() => {
          Toast.show({
            type: 'info',
            text1: 'Coming Soon',
            text2: 'Sign in from third party apps will be supported soon.',
            visibilityTime: 5000,
            autoHide: true
          });
        }} style={[styles.SIgnInProviders, { backgroundColor: '#E3F4E1' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image style={{ width: 50, height: 50 }} source={require('../../assets/logos/google.png')} />
            <Text style={{ fontSize: 17, paddingHorizontal: 20 }}>Continue with Google</Text>
          </View>
        </TouchableOpacity>

        {/* Apple Sign In Provider */}
        <TouchableOpacity onPress={() => {
          Toast.show({
            type: 'info',
            text1: 'Coming Soon',
            text2: 'Sign in from third party apps will be supported soon.',
            visibilityTime: 5000,
            autoHide: true
        });
        }} style={[styles.SIgnInProviders, { backgroundColor: '#EBF0F0' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image style={{ width: 50, height: 50 }} source={require('../../assets/logos/apple.png')} />
            <Text style={{ fontSize: 17, paddingHorizontal: 20 }}>Continue with Apple</Text>
          </View>
        </TouchableOpacity>

        {/* SIgn In Using Email And Password */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 50 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
          <Text style={{ marginHorizontal: 10, fontSize: 14, color: '#333' }}>Other Options</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
        </View>

        {/* Login Using Password */}
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <View style={{
            backgroundColor: '#1573FE',
            padding: 15,
            borderRadius: 10,
          }}>
            <Text style={{ color: 'white', fontSize: 17, textAlign: 'center' }}>SIGN IN WITH PASSWORD</Text>
          </View>
        </TouchableOpacity>

        {/* Create An Account */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 5 }}>
          <Text style={{ color: 'black', fontSize: 17, textAlign: 'center', paddingRight: 5 }}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("CreateAnAccount")}>
            <View style={{
            }}>
              <Text style={{ color: '#1573FE', fontSize: 17, textAlign: 'center' }}>Sign up now</Text>
            </View>
          </TouchableOpacity>
        </View>
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

  SIgnInProviders: {
    width: 350,
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'flex-start'
  },

});