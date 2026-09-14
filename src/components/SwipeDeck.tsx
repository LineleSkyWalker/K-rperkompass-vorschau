import React, { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { Recipe } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import { colors, radius, semantic } from '@/design-system/tokens';

export type SwipeDirection = 'left' | 'right';

export interface SwipeDeckHandle {
  swipe: (direction: SwipeDirection) => void;
}

interface Props {
  recipes: Recipe[];
  onSwipe: (recipe: Recipe, direction: SwipeDirection) => void;
  onTap: (recipe: Recipe) => void;
  /** Wird aufgerufen, wenn sich die oberste Karte ändert (undefined = Stapel leer) */
  onCurrentChange?: (recipe: Recipe | undefined) => void;
}

const SWIPE_THRESHOLD_RATIO = 0.3;

/**
 * Card-Swipe-Stapel (eigene, schlichte Implementierung mit Gesture Handler + Reanimated).
 * Rechts = Favorit, links = weiter. Tippen öffnet das Rezept.
 */
export const SwipeDeck = forwardRef<SwipeDeckHandle, Props>(function SwipeDeck({ recipes, onSwipe, onTap, onCurrentChange }, ref) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const current = recipes[index];
  const next = recipes[index + 1];

  useEffect(() => {
    onCurrentChange?.(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  const advance = useCallback(
    (direction: SwipeDirection) => {
      const r = recipes[index];
      if (r) onSwipe(r, direction);
      setIndex((i) => i + 1);
      translateX.value = 0;
      translateY.value = 0;
    },
    [index, recipes, onSwipe, translateX, translateY],
  );

  const flyOut = useCallback(
    (direction: SwipeDirection) => {
      const target = (direction === 'right' ? 1 : -1) * width * 1.4;
      translateX.value = withTiming(target, { duration: 260 }, (finished) => {
        if (finished) runOnJS(advance)(direction);
      });
    },
    [advance, translateX, width],
  );

  useImperativeHandle(ref, () => ({ swipe: flyOut }), [flyOut]);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      const threshold = width * SWIPE_THRESHOLD_RATIO;
      if (e.translationX > threshold || e.velocityX > 800) {
        runOnJS(flyOut)('right');
      } else if (e.translationX < -threshold || e.velocityX < -800) {
        runOnJS(flyOut)('left');
      } else {
        translateX.value = withSpring(0, { damping: 18 });
        translateY.value = withSpring(0, { damping: 18 });
      }
    });

  const tap = Gesture.Tap().onEnd(() => {
    if (current) runOnJS(onTap)(current);
  });

  const gesture = Gesture.Exclusive(pan, tap);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-width, 0, width], [-12, 0, 12])}deg` },
    ],
  }));

  const nextStyle = useAnimatedStyle(() => {
    const progress = Math.min(Math.abs(translateX.value) / (width * SWIPE_THRESHOLD_RATIO), 1);
    return {
      transform: [{ scale: interpolate(progress, [0, 1], [0.95, 1]) }],
      opacity: interpolate(progress, [0, 1], [0.7, 1]),
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, width * 0.2], [0, 1], Extrapolation.CLAMP),
  }));
  const skipStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-width * 0.2, 0], [1, 0], Extrapolation.CLAMP),
  }));

  if (!current) return null;

  return (
    <View style={styles.container}>
      {next ? (
        <Animated.View style={[styles.cardWrap, nextStyle]} pointerEvents="none">
          <RecipeCard recipe={next} />
        </Animated.View>
      ) : null}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.cardWrap, cardStyle]}>
          <RecipeCard recipe={current} />
          <Animated.View style={[styles.badge, styles.badgeLike, likeStyle]} pointerEvents="none">
            <Ionicons name="heart" size={22} color={semantic.textOnAccent} />
          </Animated.View>
          <Animated.View style={[styles.badge, styles.badgeSkip, skipStyle]} pointerEvents="none">
            <Ionicons name="arrow-forward" size={22} color={colors.brand.petrol} />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  cardWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  badge: {
    position: 'absolute',
    top: 20,
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLike: { right: 20, backgroundColor: colors.brand.turquoise },
  badgeSkip: { left: 20, backgroundColor: colors.neutral.beige },
});
