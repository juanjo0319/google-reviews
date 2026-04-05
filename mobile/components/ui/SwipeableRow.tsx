import { useRef } from "react";
import { Animated, StyleSheet, View, Text, type ViewStyle } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import type { LucideIcon } from "lucide-react-native";

interface SwipeAction {
  label: string;
  icon: LucideIcon;
  color: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  rightActions?: SwipeAction[];
  style?: ViewStyle;
}

/**
 * Wraps a card with swipe-to-reveal actions on the right side.
 */
export function SwipeableRow({ children, rightActions, style }: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  if (!rightActions || rightActions.length === 0) {
    return <View style={style}>{children}</View>;
  }

  const actions = rightActions;
  const actionWidth = 72;

  function renderRightActions(
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) {
    return (
      <View style={[styles.actionsContainer, { width: actionWidth * actions.length }]}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          const trans = dragX.interpolate({
            inputRange: [-(actionWidth * actions.length), 0],
            outputRange: [0, actionWidth * actions.length],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.actionButton,
                {
                  backgroundColor: action.color,
                  transform: [{ translateX: trans }],
                },
              ]}
            >
              <RectButton
                style={styles.actionContent}
                onPress={() => {
                  action.onPress();
                  swipeableRef.current?.close();
                }}
              >
                <Icon size={18} color="#fff" />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </RectButton>
            </Animated.View>
          );
        })}
      </View>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <View style={style}>{children}</View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
  },
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  actionLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
