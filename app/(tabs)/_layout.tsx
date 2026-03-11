import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const C = {
  indigo: "#6366F1",
  indigoDark: "#3730A3",
  violet: "#7C3AED",
  pink: "#EC4899",
  amber: "#F59E0B",
  amberLight: "#FCD34D",
  emerald: "#10B981",
  white: "#FFFFFF",
  bgLight: "#F1F0FF",
  textDark: "#1E1B4B",
  textLight: "#A5B4FC",
  sand: "#EDE9FE",
  cream: "#F5F3FF",
};

const TABS = [
  {
    name: "index",
    label: "Accueil",
    icon: "home-outline" as const,
    iconActive: "home" as const,
    gradient: [C.indigo, C.violet] as [string, string],
  },
  {
    name: "explore",
    label: "Explorer",
    icon: "compass-outline" as const,
    iconActive: "compass" as const,
    gradient: [C.pink, C.violet] as [string, string],
  },
  {
    name: "create",
    label: "Créer",
    icon: "add-circle-outline" as const,
    iconActive: "add-circle" as const,
    gradient: [C.emerald, "#0891B2"] as [string, string],
    isCTA: true,
  },
  {
    name: "tickets",
    label: "Billets",
    icon: "ticket-outline" as const,
    iconActive: "ticket" as const,
    gradient: [C.amber, C.pink] as [string, string],
  },
  {
    name: "profile",
    label: "Profil",
    icon: "person-outline" as const,
    iconActive: "person" as const,
    gradient: [C.indigo, C.pink] as [string, string],
  },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const [isBusiness, setIsBusiness] = useState(false);
  const animatedValues = useRef(
    TABS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)),
  ).current;
  const scaleValues = useRef(
    TABS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0.85)),
  ).current;

  useEffect(() => {
    const load = async () => {
      try {
        const json = await AsyncStorage.getItem("USER_LOGGED");
        if (json) setIsBusiness(JSON.parse(json)?.isBusiness || false);
      } catch (_) {}
    };
    load();
  }, []);

  const handlePress = (index: number, routeName: string) => {
    // Animate all
    TABS.forEach((_, i) => {
      Animated.parallel([
        Animated.spring(animatedValues[i], {
          toValue: i === index ? 1 : 0,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValues[i], {
          toValue: i === index ? 1 : 0.85,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });

    const event = navigation.emit({
      type: "tabPress",
      target: state.routes[index]?.key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={tabStyles.wrapper}>
      <LinearGradient colors={[C.white, C.cream]} style={tabStyles.tabBar}>
        {/* Indicateur de fond */}
        <View style={tabStyles.tabsRow}>
          {TABS.map((tab, index) => {
            const isActive = state.index === index;

            if (tab.isCTA) {
              return (
                <TouchableOpacity
                  key={tab.name}
                  style={tabStyles.ctaWrapper}
                  onPress={() => handlePress(index, tab.name)}
                  activeOpacity={0.85}
                >
                  <Animated.View
                    style={{ transform: [{ scale: scaleValues[index] }] }}
                  >
                    <LinearGradient
                      colors={
                        isBusiness ? [C.emerald, "#0891B2"] : [C.amber, C.pink]
                      }
                      style={tabStyles.ctaButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="add" size={28} color="#fff" />
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={tab.name}
                style={tabStyles.tabItem}
                onPress={() => handlePress(index, tab.name)}
                activeOpacity={0.75}
              >
                <Animated.View
                  style={[
                    tabStyles.tabItemInner,
                    { transform: [{ scale: scaleValues[index] }] },
                  ]}
                >
                  {isActive ? (
                    <>
                      <LinearGradient
                        colors={tab.gradient}
                        style={tabStyles.activeIconBg}
                      >
                        <Ionicons
                          name={tab.iconActive}
                          size={20}
                          color="#fff"
                        />
                      </LinearGradient>
                      <Animated.Text
                        style={[
                          tabStyles.tabLabel,
                          tabStyles.tabLabelActive,
                          { opacity: animatedValues[index] },
                        ]}
                      >
                        {tab.label}
                      </Animated.Text>
                    </>
                  ) : (
                    <>
                      <View style={tabStyles.inactiveIconBg}>
                        <Ionicons
                          name={tab.icon}
                          size={20}
                          color={C.textLight}
                        />
                      </View>
                      <Text style={tabStyles.tabLabel}>{tab.label}</Text>
                    </>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="tickets" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 4,
    backgroundColor: "transparent",
  },
  tabBar: {
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.1)",
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  tabItemInner: {
    alignItems: "center",
    gap: 3,
    minWidth: 48,
  },
  activeIconBg: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  inactiveIconBg: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: C.textLight,
  },
  tabLabelActive: {
    color: C.indigo,
    fontWeight: "700",
  },
  ctaWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 64,
  },
  ctaButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: C.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 8,
  },
});
