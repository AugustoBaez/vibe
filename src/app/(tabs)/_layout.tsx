import { Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PILL_WIDTH = 268;
const PILL_HEIGHT = 62;

type FloatingTabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarAccessibilityLabel?: string;
        tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => ReactNode;
      };
    }
  >;
  navigation: {
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault: boolean;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme !== 'light';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { paddingBottom: Math.max(insets.bottom, 10) + 8 }]}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: isDark ? 'rgba(16, 16, 16, 0.72)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
          },
          Platform.OS === 'web'
            ? ({
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
              } as object)
            : null,
        ]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const color = focused ? colors.text : colors.textSecondary;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? options.title}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.item}>
              {options.tabBarIcon?.({ focused, color, size: 24 })}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? 'homeSelected' : 'home'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <Icon name="search" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? 'profileSelected' : 'profile'} color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  item: {
    flex: 1,
    height: PILL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
