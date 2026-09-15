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
import type { Recipe } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import { Text } from '@/design-system/components';
import { colors, fonts, radius } from '@/design-system/tokens';

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

const SWIPE_THRESHOLD_RATIO = 0.28;
const VELOCITY_THRESHOLD = 700;

/**
 * Kartenstapel zum Wischen: rechts = „Mag ich“ (Favorit), links = „Weiter“.
 * Die Karte folgt dem Finger (bzw. der Maus im Browser), neigt sich in
 * Wischrichtung, zeigt einen Stempel und fliegt mit Schwung aus dem Bild.
 * Die nächsten zwei Karten liegen sichtbar darunter und rücken nach.
 */
export const SwipeDeck = forwardRef<SwipeDeckHandle, Props>(function SwipeDeck({ recipes, onSwipe, onTap, onCurrentChange }, ref) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const current = recipes[index];
  const next = recipes[index + 1];
  const third = recipes[index + 2];

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
    (direction: SwipeDirection, velocityY = 0) => {
      const target = (direction === 'right' ? 1 : -1) * width * 1.5;
      translateY.value = withTiming(translateY.value + velocityY * 0.15, { duration: 280 });
      translateX.value = withTiming(target, { duration: 280 }, (finished) => {
        if (finished) runOnJS(advance)(direction);
      });
    },
    [advance, translateX, translateY, width],
  );

  useImperativeHandle(ref, () => ({ swipe: (d) => flyOut(d) }), [flyOut]);

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.35;
    })
    .onEnd((e) => {
      const threshold = width * SWIPE_THRESHOLD_RATIO;
      if (e.translationX > threshold || e.velocityX > VELOCITY_THRESHOLD) {
        runOnJS(flyOut)('right', e.velocityY);
      } else if (e.translationX < -threshold || e.velocityX < -VELOCITY_THRESHOLD) {
        runOnJS(flyOut)('left', e.velocityY);
      } else {
        translateX.value = withSpring(0, { damping: 16, stiffness: 180 });
        translateY.value = withSpring(0, { damping: 16, stiffness: 180 });
      }
    });

  const tap = Gesture.Tap().maxDuration(250).onEnd(() => {
    if (current) runOnJS(onTap)(current);
  });

  const gesture = Gesture.Exclusive(pan, tap);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-width, 0, width], [-14, 0, 14])}deg` },
    ],
  }));

  const nextStyle = useAnimatedStyle(() => {
    const progress = Math.min(Math.abs(translateX.value) / (width * SWIPE_THRESHOLD_RATIO), 1);
    return {
      transform: [{ scale: interpolate(progress, [0, 1], [0.94, 1]) }, { translateY: interpolate(progress, [0, 1], [14, 0]) }],
    };
  });
  const thirdStyle = useAnimatedStyle(() => {
    const progress = Math.min(Math.abs(translateX.value) / (width * SWIPE_THRESHOLD_RATIO), 1);
    return {
      transform: [{ scale: interpolate(progress, [0, 1], [0.88, 0.94]) }, { translateY: interpolate(progress, [0, 1], [28, 14]) }],
      opacity: interpolate(progress, [0, 1], [0.6, 1]),
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, width * 0.18], [0, 1], Extrapolation.CLAMP),
    transform: [{ rotate: '-14deg' }, { scale: interpolate(translateX.value, [0, width * 0.18], [0.8, 1], Extrapolation.CLAMP) }],
  }));
  const skipStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-width * 0.18, 0], [1, 0], Extrapolation.CLAMP),
    transform: [{ rotate: '14deg' }, { scale: interpolate(translateX.value, [-width * 0.18, 0], [1, 0.8], Extrapolation.CLAMP) }],
  }));

  if (!current) return null;

  return (
    <View style={styles.container}>
      {third ? (
        <Animated.View style={[styles.cardWrap, thirdStyle]} pointerEvents="none">
          <RecipeCard recipe={third} />
        </Animated.View>
      ) : null}
      {next ? (
        <Animated.View style={[styles.cardWrap, nextStyle]} pointerEvents="none">
          <RecipeCard recipe={next} />
        </Animated.View>
      ) : null}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.cardWrap, cardStyle]}>
          <RecipeCard recipe={current} />
          <Animated.View style={[styles.stamp, styles.stampLike, likeStyle]} pointerEvents="none">
            <Text style={[styles.stampText, { color: colors.brand.turquoise }]}>MAG ICH</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.stampSkip, skipStyle]} pointerEvents="none">
            <Text style={[styles.stampText, { color: colors.neutral.beige }]}>WEITER</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  cardWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  stamp: {
    position: 'absolute',
    top: 28,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  stampLike: { left: 22, borderColor: colors.brand.turquoise },
  stampSkip: { right: 22, borderColor: colors.neutral.beige },
  stampText: { fontFamily: fonts.display, fontSize: 36, lineHeight: 40, letterSpacing: 2 },
});
