import { useEffect, useRef } from "react";
import { Animated, type ViewStyle } from "react-native";

interface AnimatedCardProps {
  children: React.ReactNode;
  index: number;
  style?: ViewStyle;
}

/**
 * Wraps a card with a staggered fade-in + slide-up animation.
 * Each card delays based on its index for a cascading effect.
 */
export function AnimatedCard({ children, index, style }: AnimatedCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const delay = Math.min(index * 60, 300); // Cap delay at 300ms
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
