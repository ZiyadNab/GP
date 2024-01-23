import { FlatList, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import NotificationItem from "./NotificationItem";

const NotificationsList = ({
  footerVisibility,
  footerHeight,
  watchlist,
  ...flatListProps
}) => {
  const { height } = useWindowDimensions();
  const listVisibility = useSharedValue(1);
  const scrollY = useSharedValue(0);

  const handler = useAnimatedScrollHandler({
    onScroll: event => {
      const y = event.contentOffset.y;
      scrollY.value = y;
      if (event.contentOffset.y < 10) {
        footerVisibility.value = withTiming(1);
      } else {
        footerVisibility.value = withTiming(0);
      }
    },
    onEndDrag: event => {
      if (event.contentOffset.y < 0) {
        listVisibility.value = withTiming(0);
      }
    },
    onBeginDrag: event => {
      if (listVisibility.value < 1) {
        listVisibility.value = withSpring(1);
      }
    },
  });

  return (
    <Animated.FlatList
      data={watchlist}
      renderItem={({ item, index }) => (
        <NotificationItem
          data={item}
          index={index}
          listVisibility={listVisibility}
          scrollY={scrollY}
          footerHeight={footerHeight}
        />
      )}
      {...flatListProps}
      onScroll={handler}
    />
  );
};

export default NotificationsList;