import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const C = {
  indigo: "#6366F1",
  indigoDark: "#3730A3",
  indigoLight: "#818CF8",
  violet: "#7C3AED",
  pink: "#EC4899",
  pinkLight: "#F472B6",
  amber: "#F59E0B",
  amberLight: "#FCD34D",
  emerald: "#10B981",
  emeraldDark: "#065F46",
  white: "#FFFFFF",
  bgLight: "#F1F0FF",
  textDark: "#1E1B4B",
  textMid: "#4338CA",
  textLight: "#A5B4FC",
  cream: "#F5F3FF",
  sand: "#EDE9FE",
};

const MENU_SECTIONS = [
  {
    title: "Mon compte",
    items: [
      {
        icon: "person-outline",
        label: "Informations personnelles",
        gradient: [C.indigo, C.violet] as [string, string],
        route: "/edit-profile",
      },
      {
        icon: "shield-checkmark-outline",
        label: "Sécurité & mot de passe",
        gradient: ["#8B5CF6", "#6366F1"] as [string, string],
        route: "/security",
      },
      {
        icon: "card-outline",
        label: "Moyens de paiement",
        gradient: [C.emerald, "#0891B2"] as [string, string],
        route: "/payment",
      },
    ],
  },
  {
    title: "Préférences",
    items: [
      {
        icon: "notifications-outline",
        label: "Notifications",
        gradient: [C.amber, C.pink] as [string, string],
        toggle: "notifs",
      },
      {
        icon: "location-outline",
        label: "Localisation",
        gradient: [C.pink, C.violet] as [string, string],
        toggle: "location",
      },
      {
        icon: "moon-outline",
        label: "Mode sombre",
        gradient: [C.indigoDark, C.indigo] as [string, string],
        toggle: "dark",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        icon: "help-circle-outline",
        label: "Centre d'aide",
        gradient: ["#0891B2", "#0EA5E9"] as [string, string],
        route: "/help",
      },
      {
        icon: "chatbubble-outline",
        label: "Nous contacter",
        gradient: [C.emerald, "#059669"] as [string, string],
        route: "/contact",
      },
      {
        icon: "star-outline",
        label: "Noter l'application",
        gradient: [C.amber, C.amberLight] as [string, string],
        route: "/rate",
      },
    ],
  },
];

const STATS = [
  {
    icon: "ticket",
    label: "Billets achetés",
    value: "2",
    gradient: [C.indigo, C.violet] as [string, string],
  },
  {
    icon: "calendar",
    label: "Événements",
    value: "5",
    gradient: [C.pink, C.violet] as [string, string],
  },
  {
    icon: "heart",
    label: "Favoris",
    value: "3",
    gradient: [C.amber, C.pink] as [string, string],
  },
  {
    icon: "cash",
    label: "Dépensés",
    value: "20k",
    gradient: [C.emerald, "#0891B2"] as [string, string],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>({
    prenom: "Koné",
    nom: "Oumar",
    email: "client@test.com",
    phone: "+225 07 00 00 00",
    isBusiness: false,
    memberSince: "Jan 2024",
  });
  const [toggles, setToggles] = useState({
    notifs: true,
    location: false,
    dark: false,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cardAnims = useRef(
    Array(12)
      .fill(0)
      .map(() => new Animated.Value(0)),
  ).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const json = await AsyncStorage.getItem("USER_LOGGED");
        if (json) setUser(JSON.parse(json));
      } catch (_) {}
    };
    loadUser();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(
      60,
      cardAnims.map((a) =>
        Animated.spring(a, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("USER_LOGGED");
          router.replace("/(auth)/login" as any);
        },
      },
    ]);
  };

  const initials = `${(user?.prenom?.[0] || "U").toUpperCase()}${(user?.nom?.[0] || "").toUpperCase()}`;

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── HERO HEADER ── */}
        <LinearGradient
          colors={[C.indigoDark, C.indigo, C.violet]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* BG décos */}
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <Animated.View
            style={[
              styles.shimmer,
              { transform: [{ translateX: shimmerTranslate }] },
            ]}
          />

          <Animated.View
            style={[
              styles.heroContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Avatar grand */}
            <Animated.View
              style={[styles.avatarWrap, { transform: [{ scale: scaleAnim }] }]}
            >
              <LinearGradient
                colors={[C.amber, C.pink]}
                style={styles.avatarRing}
              />
              <LinearGradient
                colors={[C.indigoLight, C.pink]}
                style={styles.avatar}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
              <Animated.View
                style={[
                  styles.avatarPulse,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <LinearGradient
                colors={[C.emerald, "#059669"]}
                style={styles.onlineDot}
              />
            </Animated.View>

            {/* Nom + infos */}
            <Text style={styles.heroName}>
              {user?.prenom} {user?.nom}
            </Text>
            <Text style={styles.heroEmail}>{user?.email}</Text>

            <View style={styles.heroBadges}>
              <LinearGradient
                colors={[C.amber, C.pink]}
                style={styles.heroBadge}
              >
                <Ionicons
                  name={user?.isBusiness ? "business" : "person"}
                  size={11}
                  color="#fff"
                />
                <Text style={styles.heroBadgeText}>
                  {user?.isBusiness ? "Organisateur" : "Participant"}
                </Text>
              </LinearGradient>
              <View style={styles.heroBadgeOutline}>
                <Ionicons name="calendar" size={11} color={C.amberLight} />
                <Text style={styles.heroBadgeOutlineText}>
                  Membre depuis {user?.memberSince || "2024"}
                </Text>
              </View>
            </View>

            {/* Edit button */}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push("/edit-profile" as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="pencil-outline" size={14} color={C.amberLight} />
              <Text style={styles.editBtnText}>Modifier le profil</Text>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>

        {/* ── STATS ── */}
        <Animated.View
          style={[
            styles.statsGrid,
            {
              opacity: cardAnims[0],
              transform: [
                {
                  translateY: (cardAnims[0] as any).interpolate({
                    inputRange: [0, 1],
                    outputRange: [25, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {STATS.map((stat, i) => (
            <Animated.View
              key={stat.label}
              style={[
                styles.statItem,
                {
                  opacity: cardAnims[Math.min(i + 1, 11)],
                  transform: [
                    {
                      scale: (
                        cardAnims[Math.min(i + 1, 11)] as any
                      ).interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={[C.white, C.cream]}
                style={styles.statItemInner}
              >
                <LinearGradient colors={stat.gradient} style={styles.statIcon}>
                  <Ionicons name={stat.icon as any} size={16} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </Animated.View>

        {/* ── MENU SECTIONS ── */}
        <View style={styles.content}>
          {/* Upgrade banner si pas business */}
          {!user?.isBusiness && (
            <Animated.View
              style={[
                {
                  opacity: cardAnims[5],
                  transform: [
                    {
                      translateY: (cardAnims[5] as any).interpolate({
                        inputRange: [0, 1],
                        outputRange: [25, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => router.push("/upgrade-business" as any)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[C.emeraldDark, C.emerald]}
                  style={styles.upgradeBanner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.upgradeEmoji}>🚀</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.upgradeTitle}>
                      Devenez organisateur
                    </Text>
                    <Text style={styles.upgradeSub}>
                      Créez et gérez vos événements
                    </Text>
                  </View>
                  <LinearGradient
                    colors={[C.amber, C.pink]}
                    style={styles.upgradeChevron}
                  >
                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                  </LinearGradient>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {MENU_SECTIONS.map((section, si) => (
            <Animated.View
              key={section.title}
              style={[
                styles.menuSection,
                {
                  opacity: cardAnims[Math.min(si + 6, 11)],
                  transform: [
                    {
                      translateY: (
                        cardAnims[Math.min(si + 6, 11)] as any
                      ).interpolate({
                        inputRange: [0, 1],
                        outputRange: [25, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.menuSectionTitle}>{section.title}</Text>
              <LinearGradient
                colors={[C.white, C.cream]}
                style={styles.menuCard}
              >
                {section.items.map((item, ii) => (
                  <View key={item.label}>
                    {ii > 0 && <View style={styles.menuItemDivider} />}
                    <TouchableOpacity
                      style={styles.menuItem}
                      activeOpacity={0.75}
                      onPress={() =>
                        item.route && router.push(item.route as any)
                      }
                    >
                      <LinearGradient
                        colors={item.gradient}
                        style={styles.menuItemIcon}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={17}
                          color="#fff"
                        />
                      </LinearGradient>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                      {item.toggle ? (
                        <Switch
                          value={toggles[item.toggle as keyof typeof toggles]}
                          onValueChange={(v) =>
                            setToggles({ ...toggles, [item.toggle!]: v })
                          }
                          trackColor={{ false: "#E5E7EB", true: C.indigo }}
                          thumbColor="#fff"
                          style={{
                            transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
                          }}
                        />
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={17}
                          color={C.textLight}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </LinearGradient>
            </Animated.View>
          ))}

          {/* Logout */}
          <Animated.View
            style={[
              {
                opacity: cardAnims[11],
                transform: [
                  {
                    translateY: (cardAnims[11] as any).interpolate({
                      inputRange: [0, 1],
                      outputRange: [25, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.85}>
              <LinearGradient
                colors={["#FEF2F2", "#FFF1F1"]}
                style={styles.logoutCard}
              >
                <LinearGradient
                  colors={["#EF4444", "#DC2626"]}
                  style={styles.logoutIcon}
                >
                  <Ionicons name="log-out-outline" size={18} color="#fff" />
                </LinearGradient>
                <Text style={styles.logoutText}>Se déconnecter</Text>
                <Ionicons name="chevron-forward" size={17} color="#EF4444" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Version */}
          <View style={styles.versionBlock}>
            <Text style={styles.versionLogo}>🎟️</Text>
            <Text style={styles.versionBrand}>Tikety</Text>
            <Text style={styles.versionText}>
              v1.0.0 · Fait avec ❤️ en Côte d'Ivoire
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgLight },

  // HERO
  hero: {
    paddingTop: 54,
    paddingBottom: 30,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
  },
  heroCircle1: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  heroCircle2: {
    position: "absolute",
    bottom: -20,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 90,
    backgroundColor: "rgba(255,255,255,0.07)",
    transform: [{ skewX: "-20deg" }],
  },
  heroContent: { alignItems: "center", paddingHorizontal: 18 },

  avatarWrap: { width: 90, height: 90, marginBottom: 14, position: "relative" },
  avatarRing: {
    position: "absolute",
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 55,
    opacity: 0.9,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
  },
  avatarInitials: { fontSize: 34, fontWeight: "900", color: "#fff" },
  avatarPulse: {
    position: "absolute",
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: "rgba(245,158,11,0.3)",
  },
  onlineDot: {
    position: "absolute",
    bottom: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: C.indigoDark,
  },

  heroName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  heroEmail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 12,
  },
  heroBadges: { flexDirection: "row", gap: 8, marginBottom: 16 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  heroBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  heroBadgeOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
  },
  heroBadgeOutlineText: {
    color: C.amberLight,
    fontSize: 11,
    fontWeight: "600",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  editBtnText: { color: C.amberLight, fontSize: 12, fontWeight: "700" },

  // STATS
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 18,
    paddingTop: 20,
    gap: 10,
  },
  statItem: { width: (width - 36 - 10) / 2 },
  statItemInner: {
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.08)",
    shadowColor: C.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "900", color: C.textDark },
  statLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    textAlign: "center",
  },

  // CONTENT
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 100 },

  // UPGRADE BANNER
  upgradeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    marginTop: 12,
  },
  upgradeEmoji: { fontSize: 26 },
  upgradeTitle: { fontSize: 13, fontWeight: "800", color: "#fff" },
  upgradeSub: { fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  upgradeChevron: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  // MENU
  menuSection: { marginBottom: 20 },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textLight,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingLeft: 4,
  },
  menuCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.08)",
    shadowColor: C.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: C.textDark,
  },
  menuItemDivider: { height: 1, backgroundColor: C.sand, marginLeft: 62 },

  // LOGOUT
  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.12)",
  },
  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#EF4444" },

  // VERSION
  versionBlock: { alignItems: "center", paddingVertical: 20, gap: 4 },
  versionLogo: { fontSize: 28 },
  versionBrand: {
    fontSize: 16,
    fontWeight: "900",
    color: C.textMid,
    letterSpacing: 1,
  },
  versionText: { fontSize: 11, color: C.textLight },
});
