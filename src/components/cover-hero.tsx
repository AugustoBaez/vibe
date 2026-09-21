import { Image } from 'expo-image';
import { useEffect, useState, type ReactNode } from 'react';
import { Image as RNImage, ImageBackground, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { gradientFromSeed } from '@/lib/gradient';

const heroBlend = require('../../assets/images/hero-blend.png');

function withAlpha(hex: string, alpha: number) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function photoMaskGradient() {
  return 'linear-gradient(to bottom, #000 0%, #000 48%, transparent 100%)';
}

function heroBlendCss(color: string) {
  const clear = withAlpha(color, 0);
  return `linear-gradient(to bottom, ${clear} 0%, ${clear} 42%, ${withAlpha(color, 0.28)} 66%, ${withAlpha(color, 0.72)} 86%, ${color} 100%)`;
}

function largeArtworkUrl(url: string) {
  return url.replace(/\/\d+x\d+bb\./, '/1000x1000bb.');
}

function HeroFade({ color }: { color: string }) {
  const css = heroBlendCss(color);

  return (
    <View
      pointerEvents="none"
      collapsable={false}
      style={[
        styles.heroFade,
        { experimental_backgroundImage: css },
        Platform.OS === 'web' ? ({ backgroundImage: css } as object) : null,
      ]}
    />
  );
}

function PhotoBlendOverlay({ width, height }: { width: number; height: number }) {
  return (
    <View
      pointerEvents="none"
      collapsable={false}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        height,
        zIndex: 8,
        elevation: 8,
      }}>
      <RNImage source={heroBlend} resizeMode="stretch" style={{ width, height }} />
    </View>
  );
}

export function CoverHero({
  url,
  seed,
  width,
  height,
  scrollY,
  blurDistance,
  children,
}: {
  url?: string;
  seed: string;
  width: number;
  height: number;
  scrollY: SharedValue<number>;
  blurDistance: number;
  children?: ReactNode;
}) {
  const theme = useTheme();
  const coverUrl = url?.trim() ? largeArtworkUrl(url.trim()) : '';
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = Boolean(coverUrl) && !photoFailed;
  const extra = Math.round(height * 0.28);
  const photoHeight = height + extra;
  const wash = gradientFromSeed(seed, 168).backgroundImage;

  useEffect(() => {
    setPhotoFailed(false);
  }, [coverUrl]);

  const photoMotion = useAnimatedStyle(() => {
    const shift = interpolate(scrollY.value, [0, height], [0, extra], Extrapolation.CLAMP);
    const blurPx = interpolate(scrollY.value, [0, blurDistance], [0, 16], Extrapolation.CLAMP);

    if (Platform.OS === 'web') {
      return {
        top: shift,
        filter: `blur(${blurPx}px)`,
      };
    }

    return {
      top: shift,
    };
  });

  return (
    <View
      collapsable={false}
      style={[
        styles.hero,
        {
          width,
          height,
          backgroundColor: theme.background,
          marginBottom: -Spacing.four,
        },
      ]}>
      <View
        collapsable={false}
        style={[
          styles.heroPhotoLayer,
          Platform.OS === 'web' ? ({ opacity: 0.999, isolation: 'isolate' } as object) : null,
        ]}>
        {Platform.OS === 'web' ? (
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                width,
                height: photoHeight,
                overflow: 'hidden',
                pointerEvents: 'none',
              },
              photoMotion,
            ]}>
            <View
              style={
                {
                  width,
                  height: photoHeight,
                  backgroundColor: theme.backgroundElement,
                  maskImage: photoMaskGradient(),
                  WebkitMaskImage: photoMaskGradient(),
                } as object
              }>
              {showPhoto ? (
                <Image
                  source={{ uri: coverUrl }}
                  style={{ width, height: photoHeight, backgroundColor: theme.backgroundElement }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <View
                  style={
                    {
                      width,
                      height: photoHeight,
                      experimental_backgroundImage: wash,
                      backgroundImage: wash,
                    } as object
                  }
                />
              )}
            </View>
          </Animated.View>
        ) : showPhoto ? (
          <View collapsable={false} style={{ width, height, overflow: 'hidden' }}>
            <ImageBackground
              pointerEvents="none"
              source={{ uri: coverUrl }}
              resizeMode="cover"
              onError={() => setPhotoFailed(true)}
              style={{ width, height }}
              imageStyle={{ width, height: photoHeight }}>
              <RNImage
                pointerEvents="none"
                source={heroBlend}
                resizeMode="stretch"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width,
                  height,
                  zIndex: 2,
                }}
              />
            </ImageBackground>
          </View>
        ) : (
          <Animated.View
            pointerEvents="none"
            collapsable={false}
            style={[
              {
                position: 'absolute',
                left: 0,
                width,
                height: photoHeight,
                backgroundColor: theme.backgroundElement,
                experimental_backgroundImage: wash,
              },
              photoMotion,
            ]}
          />
        )}
      </View>

      {Platform.OS !== 'web' ? <PhotoBlendOverlay width={width} height={height} /> : null}
      <HeroFade color={theme.background} />

      {children ? (
        <View pointerEvents="box-none" style={styles.overlay}>
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
  },
  heroPhotoLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 0,
    elevation: 0,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
    elevation: 2,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 12,
    elevation: 12,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
});
