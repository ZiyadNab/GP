import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { FontAwesome5, Entypo } from '@expo/vector-icons';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  Extrapolate
} from "react-native-reanimated";
import { useState } from "react";
import { useNavigation } from '@react-navigation/native';

export const NOTIFICATION_HEIGHT = 80;
const NotificationItem = ({
  data,
  index,
  listVisibility,
  scrollY,
  footerHeight,
}) => {
  const { height } = useWindowDimensions();
  const startPosition = index * NOTIFICATION_HEIGHT;
  const containerHeight = useDerivedValue(
    () => height - 250 - footerHeight.value
  );

  const navigation = useNavigation();
  const [image, setImage] = useState(data.icon)

  const animatedStyle = useAnimatedStyle(() => {
    const pos1 = startPosition - containerHeight.value;
    const pos2 = startPosition + NOTIFICATION_HEIGHT - containerHeight.value;
    if (listVisibility.value >= 1) {
      // animate the last item
      return {
        opacity: interpolate(scrollY.value, [pos1, pos2], [0, 1]),
        transform: [
          {
            translateY: interpolate(
              scrollY.value,
              [pos1, pos2],
              [-NOTIFICATION_HEIGHT / 2, 0],
              Extrapolate.CLAMP
            ),
          },
          {
            scale: interpolate(
              scrollY.value,
              [pos1, pos2],
              [0.8, 1],
              Extrapolate.CLAMP
            ),
          },
        ],
      };
    } else {
      // animate all items to hide them
      return {
        transform: [
          {
            translateY: interpolate(
              listVisibility.value,
              [0, 1],
              [containerHeight.value - startPosition, 0]
            ),
          },
          {
            scale: interpolate(
              listVisibility.value,
              [0, 1],
              [0.5, 1],
              Extrapolate.CLAMP
            ),
          },
        ],
        opacity: listVisibility.value,
      };
    }
  });
  
  return (

    <Animated.View style={[{ backgroundColor: '#fff', margin: 15 }, animatedStyle]}>
      <TouchableOpacity onPress={() => navigation.navigate("Stock", { data: data })} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: data.icon }}
            style={{ width: 50, height: 50, resizeMode: 'contain' }}
            onError={() => setImage('https://t3.ftcdn.net/jpg/02/68/55/60/360_F_268556012_c1WBaKFN5rjRxR2eyV33znK4qnYeKZjm.jpg')}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{data.title}</Text>
            <Text style={{ fontSize: 15, maxWidth: 200 }}>{data.name}</Text>
          </View>
        </View>
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{data.close ? data.region + data.close : data.price}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            { data.change_p ? data.change_p > 0 ? <Entypo name="chevron-up" color='#0DA070' size={30} /> : <Entypo name="chevron-down" color='#E01B2A' size={30} /> : data.rising ? <Entypo name="chevron-up" color='#0DA070' size={30} /> : <Entypo name="chevron-down" color='#E01B2A' size={30} />}
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: data.change_p ? data.change_p > 0 ? '#0DA070' : '#E01B2A' : data.rising ? '#0DA070' : '#E01B2A' }}>{data.change_p ? data.change_p.toFixed(2) : data.percantage}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: NOTIFICATION_HEIGHT - 10,
    backgroundColor: "#00000075",
    margin: 5,
    marginHorizontal: 10,
    padding: 13,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    color: "lightgray",
    fontSize: 12,
    position: "absolute",
    right: 10,
    top: 10,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    color: "white",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  subtitle: {
    color: "white",
    lineHeight: 18,
    letterSpacing: 0.2,
  },
});

export default NotificationItem;
