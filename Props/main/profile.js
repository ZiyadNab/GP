import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator, Text, Image, View, FlatList, RefreshControl, ScrollView, TextInput, ImageBackground } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { auth, db, storage } from '../../database'
import { signOut } from 'firebase/auth'
import Toast from 'react-native-toast-message'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'expo-image-picker';

import {
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const data = [
  { label: 'Saudi Arabia', value: 'Saudi Arabia' },
  { label: 'United Arab Emirates', value: 'United Arab Emirates' },
  { label: 'Qatar', value: 'Qatar' },
  { label: 'Oman', value: 'Oman' },
  { label: 'Iraq', value: 'Iraq' },
  { label: 'Kuwait', value: 'Kuwait' },
  { label: 'Bahrain', value: 'Bahrain' },
  { label: 'Yamen', value: 'Yamen' },
  { label: 'Other', value: 'Other' },
];
const data2 = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

export default function Profile() {

  const [isFocus, setIsFocus] = useState(false)
  const [isFocus2, setIsFocus2] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null);
  const [date, setdate] = useState(new Date());
  const [updatedPin, setUpdatedPin] = useState();
  const [showDatePicker, setshow] = useState(false);
  const [text, setText] = useState();
  const [updating, setUpdating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fname, setFName] = useState('')
  const [email, setEmail] = useState('')
  const [pnumber, setPNumber] = useState('')
  const [pin, setPin] = useState('')
  const [country, setCountry] = useState('')
  const [gender, setGender] = useState('')
  const [icon, setIcon] = useState('https://t1.gstatic.com/licensed-image?q=tbn:ANd9GcQavfSfyOVYO54wkFq1cV0yguHfZSUiYwmiGvtdlDDav_wKZYsyy9NPBk952R2zXNSs')

  const [updatedFullName, setUpdatedFullName] = useState(null)
  const [updatedEmail, setUpdatedEmail] = useState(null)
  const [updatedPhoneNumber, setUpdatedPhoneNumber] = useState(null)
  const [updatedCountry, setUpdatedCountry] = useState(null)
  const [updatedGender, setUpdatedGender] = useState(null)
  const [updatedDOB, setUpdatedDOB] = useState(null)
  const [updatedIcon, setUpdatedIcon] = useState(null)

  useEffect(() => {

    async function getData() {
      const docRef = doc(db, "users", auth.currentUser.uid)
      const docData = await getDoc(docRef)
      if (docData.exists()) {
        setFName(docData.data().fullname)
        setEmail(docData.data().email)
        setPNumber(docData.data().phone)
        setCountry(docData.data().country)
        setGender(docData.data().gender)
        setIcon(docData.data().icon)
        setLoading(false)
        setText(docData.data().DOB)
        setPin(docData.data().pin)
      }
    }

    getData()
  }, [])

  function generateRandomFileName() {
    const timestamp = new Date().getTime(); // Get current timestamp
    const randomString = Math.random().toString(36).substring(2, 8); // Generate random string
    return `file_${timestamp}_${randomString}`; // Construct a unique file name
  }

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `${auth.currentUser.uid}.png`);
      const snapshot = await uploadBytes(storageRef, blob);
      const fileUrl = await getDownloadURL(storageRef)
      setUpdatedIcon(fileUrl)
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };


  const pickImage = async () => {

    if ((await ImagePicker.getMediaLibraryPermissionsAsync()).granted) {
      const per = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (per.status !== 'granted') {
        return Toast.show({
          type: 'error',
          text1: 'Permissions Required',
          text2: "Permissions must be granted in order to edit your account profile image.",
          visibilityTime: 5000,
          autoHide: true
        })
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      uploadImage(result.assets[0].uri);
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
        backgroundColor: '#EBF0F0',
        width: 1000,
        height: 1000,
        borderRadius: 500,
        marginTop: -875
      }} />

      <Image
        source={{ uri: updatedIcon ? updatedIcon : icon }}
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

      <Text style={{ fontSize: 18, fontWeight: 'bold' }}> {fname} </Text>
      <Text style={{ fontSize: 13 }}> {email} | {pnumber} </Text>

      <ScrollView style={{
        marginBottom: 40
      }} showsVerticalScrollIndicator={false}>
        <View style={styles.ProfileView}>
          <Text style={styles.ProfileText}> Full name </Text>
          <TextInput
            placeholder={fname}
            onChangeText={((v) => {
              setUpdatedFullName(v)
            })}
          />
        </View>

        <View style={styles.ProfileView}>
          <Text style={styles.ProfileText}> Email </Text>
          <TextInput
            placeholder={email}
            onChangeText={((v) => {
              setUpdatedEmail(v)
            })}
          />
        </View>

        <View style={styles.ProfileView}>
          <Text style={styles.ProfileText}> Phone number </Text>
          <TextInput
            placeholder={pnumber}
            onChangeText={((v) => {
              setUpdatedPhoneNumber(v)
            })}
          />
        </View>

        <View style={{ flexDirection: 'row', height: 60, width: 330, justifyContent: 'space-between', marginTop: 7 }}>
          <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={data}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={country ? country : 'Country'}
            value={updatedCountry}
            onChange={item => {
              setUpdatedCountry(item.value);
            }}
          />

          <Dropdown
            style={[styles.dropdown2, isFocus2 && { borderColor: 'blue' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={data2}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={gender ? gender : 'Gender'}
            value={updatedGender}
            onChange={item => {
              setUpdatedGender(item.value);
            }}
          />

        </View>

        <TouchableOpacity onPress={() => setshow(!showDatePicker)} style={{
          marginTop: 7,
          height: 60,
          width: 330,
          backgroundColor: '#E4F3FC',
          borderWidth: 0.7,
          borderColor: 'gray',
          borderRadius: 7,
          padding: 7,
          flexDirection: 'row',
          justifyContent: 'space-between',

        }}>
          <Text style={{ fontSize: 16, paddingVertical: 10 }} > Date of birth </Text>
          <Text style={{ fontSize: 16, paddingVertical: 10, }}> {updatedDOB ? updatedDOB : text} </Text>

          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            onConfirm={(date) => {
              setdate(date);
              setshow(false);
              let tempdate = new Date(date);
              let fDate = tempdate.getDate() + '/' + (tempdate.getMonth() + 1) + '/' + tempdate.getFullYear();
              setText(fDate);
              DOBInputAnimatedBorder.value = Boolean(date) ? withTiming('#1573FE') : withTiming('#D9D9D9')
            }}
            onCancel={() => {
              setshow(false)
            }}
          />
        </TouchableOpacity>

        <View style={styles.ProfileView}>
          <Text style={styles.ProfileText}> Confirmation Pin </Text>
          <TextInput
            placeholder={pin}
            keyboardType="decimal-pad"
            onChangeText={((v) => {
              setUpdatedPin(v)
            })}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity
            disabled={updating}
            style={styles.ButtonStyle}
            onPress={async () => {

              if (!(updatedFullName || updatedEmail || updatedPhoneNumber || updatedCountry || updatedGender || updatedDOB || updatedIcon || updatedPin)) {
                Toast.show({
                  type: 'info',
                  text1: 'You left something',
                  text2: "Please fill in at least one field.",
                  visibilityTime: 5000,
                  autoHide: true
                })
                return; // Prevent further execution if all fields are empty
              }

              // Update the Firestore document
              const docRef = doc(db, "users", auth.currentUser.uid);

              setUpdating(true)

              try {
                await updateDoc(docRef, {
                  fullname: updatedFullName ? updatedFullName : fname,
                  email: updatedEmail ? updatedEmail : email,
                  phone: updatedPhoneNumber ? updatedPhoneNumber : pnumber,
                  country: updatedCountry ? updatedCountry : country,
                  gender: updatedGender ? updatedGender : gender,
                  DOB: updatedDOB ? updatedDOB : text,
                  icon: updatedIcon ? updatedIcon : icon,
                  pin: updatedPin ? updatedPin : pin
                });

                setUpdating(false)

                // Inform the user about successful update (optional)
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: "User information updated successfully!",
                  visibilityTime: 5000,
                  autoHide: true
                })

                if (updatedFullName) setFName(updatedFullName)
                if (updatedEmail) setEmail(updatedEmail)
                if (updatedPhoneNumber) setPNumber(updatedPhoneNumber)
                if (updatedCountry) setCountry(updatedCountry)
                if (updatedGender) setGender(updatedGender)
                if (updatedDOB) setText(updatedDOB)
                if (updatedIcon) setIcon(updatedIcon)
                if (updatedPin) setPin(updatedPin)

                setUpdatedFullName(null)
                setUpdatedEmail(null)
                setUpdatedPhoneNumber(null)
                setUpdatedCountry(null)
                setUpdatedGender(null)
                setUpdatedDOB(null)
                setUpdatedIcon(null)
                setUpdatedPin(null)

              } catch (error) {
                // Handle any errors that occur during the update (optional)
                console.error("Error updating user information:", error);
              }
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => signOut(auth)} style={{ height: 50, width: 50, padding: 7, backgroundColor: 'red', borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginTop: 7, marginLeft: 5 }}>
            <MaterialIcons name="logout" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, display: updating ? 'flex' : 'none' }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ color: 'black', marginLeft: 5 }}>Updating... {"\n"}It may takes longer than usual</Text>
        </View>

      </ScrollView>
      <Toast />
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  ProfileView: {
    marginTop: 7,
    height: 60,
    width: 330,
    backgroundColor: '#E4F3FC', // color of the theme
    borderColor: 'gray',
    borderWidth: 0.7,
    borderRadius: 7,
    padding: 10,
  },
  ButtonStyle: {
    marginTop: 7,
    height: 50,
    width: 275,
    backgroundColor: '#18BE53',
    borderRadius: 7,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    height: 60,
    width: 210,
    borderColor: 'gray',
    backgroundColor: '#E4F3FC',
    borderWidth: 0.7,
    borderRadius: 7,
    padding: 10,
  },
  dropdown2: {
    height: 60,
    width: 110,
    borderColor: 'gray',
    backgroundColor: '#E4F3FC',
    borderWidth: 0.7,
    borderRadius: 7,
    padding: 10,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});