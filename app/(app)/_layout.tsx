import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/shared/constants/theme';
import { useTasksSubscription } from '@/features/tasks/hooks/useTasks';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  name: IconName;
  focused: boolean;
}

function TabIcon({ name, focused }: TabIconProps) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IconName)}
      size={20}
      color={focused ? Colors.ink : Colors.slate}
    />
  );
}


function CasaTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.casaCircle, focused && styles.casaCircleFocused]}>
      <Text style={[styles.casaLabel, focused && styles.casaLabelFocused]}>CASA</Text>
    </View>
  );
}

export default function AppLayout() {
  useTasksSubscription();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.ink,
        tabBarInactiveTintColor: Colors.slate,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.gray200,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 62,
        },
        tabBarLabelStyle: {
          fontSize: Typography.xs,
          fontWeight: Typography.medium,
        },
      }}
    >
      <Tabs.Screen
        name="(lists)"
        options={{
          title: '清单',
          tabBarIcon: ({ focused }) => <TabIcon name="reader" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(reports)"
        options={{
          title: '报表',
          tabBarIcon: ({ focused }) => <TabIcon name="bar-chart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(home)"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => <CasaTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(rewards)"
        options={{
          title: '奖励',
          tabBarIcon: ({ focused }) => <TabIcon name="star" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: '我的',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(tasks)"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  casaCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  casaCircleFocused: {
    backgroundColor: Colors.ink,
  },
  casaLabel: {
    color: Colors.ink,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  casaLabelFocused: {
    color: Colors.white,
  },
});
