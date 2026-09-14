import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fonts, semantic } from '@/design-system/tokens';
import { useApp } from '@/state/AppProvider';

export default function TabsLayout() {
  const { ready, data } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (ready && !data.profile.onboardingCompleted) router.push('/onboarding');
  }, [ready, data.profile.onboardingCompleted, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: semantic.tabActive,
        tabBarInactiveTintColor: semantic.tabInactive,
        tabBarStyle: { backgroundColor: semantic.surface, borderTopColor: semantic.border, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Entdecken', tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="favoriten"
        options={{ title: 'Favoriten', tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="wochenplan"
        options={{ title: 'Wochenplan', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="einkaufsliste"
        options={{ title: 'Einkaufsliste', tabBarIcon: ({ color, size }) => <Ionicons name="basket-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="profil"
        options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
