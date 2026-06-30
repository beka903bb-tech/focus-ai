import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, Text, Platform } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Onboarding from './src/screens/Onboarding';
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SessionScreen from './src/screens/SessionScreen';
import StatsScreen from './src/screens/StatsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AICoachScreen from './src/screens/AICoachScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ── Bottom tab navigator ───────────────────────────────────────
function MainTabs({ route }) {
  const user = route?.params?.user;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 88 : 65,
          paddingBottom: Platform.OS === 'android' ? 24 : 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        initialParams={{ user }}
        options={{
          tabBarLabel: 'Bosh sahifa',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 21, opacity: focused ? 1 : 0.45 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'Statistika',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 21, opacity: focused ? 1 : 0.45 }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="AICoach"
        component={AICoachScreen}
        options={{
          tabBarLabel: 'AI Murabbiy',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 21, opacity: focused ? 1 : 0.45 }}>🤖</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 21, opacity: focused ? 1 : 0.45 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ── Wrapper-lar (mavjud ekranlar prop kutadi) ──────────────────
function OnboardingWrapper({ navigation }) {
  return <Onboarding onComplete={() => navigation.navigate('Auth')} />;
}

function AuthWrapper({ navigation }) {
  return (
    <AuthScreen
      onComplete={(user) => navigation.navigate('Main', { user })}
    />
  );
}

// ── Root navigator ─────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0F172A' },
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingWrapper} />
          <Stack.Screen name="Auth" component={AuthWrapper} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Session"
            component={SessionScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
    </ThemeProvider>
  );
}
