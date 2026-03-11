import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ── Tikety palette ──────────────────────────────
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
  cardBg: "#FAFAFE",
  textDark: "#1E1B4B",
  textMid: "#4338CA",
  textLight: "#A5B4FC",
  cream: "#F5F3FF",
  sand: "#EDE9FE",
};

const MOCK_EVENTS = [
  {
    id: "1",
    title: "Soirée Gala 2025",
    date: "Sam 15 Mar",
    location: "Sofitel Abidjan",
    price: 15000,
    category: "Gala",
    icon: "star",
    gradient: [C.indigo, C.violet] as [string, string],
    ticketsSold: 120,
    totalTickets: 200,
    image:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&q=80",
  },
  {
    id: "2",
    title: "Concert Afrobeats",
    date: "Dim 22 Mar",
    location: "Palais de la Culture",
    price: 5000,
    category: "Concert",
    icon: "musical-notes",
    gradient: [C.pink, C.violet] as [string, string],
    ticketsSold: 850,
    totalTickets: 1000,
    image:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80",
  },
  {
    id: "3",
    title: "Forum Tech CI",
    date: "Ven 28 Mar",
    location: "CCIB Plateau",
    price: 0,
    category: "Conférence",
    icon: "laptop",
    gradient: [C.emerald, "#0891B2"] as [string, string],
    ticketsSold: 300,
    totalTickets: 500,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80",
  },
  {
    id: "4",
    title: "Festival Art & Lumières",
    date: "Sam 5 Avr",
    location: "Cocody Art Center",
    price: 3000,
    category: "Festival",
    icon: "color-palette",
    gradient: [C.amber, C.pink] as [string, string],
    ticketsSold: 200,
    totalTickets: 600,
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80",
  },
];

const MOCK_TICKETS = [
  {
    id: "T001",
    eventTitle: "Soirée Gala 2025",
    date: "Sam 15 Mar 2025",
    seat: "VIP - Table 4",
    status: "valid",
  },
  {
    id: "T002",
    eventTitle: "Concert Afrobeats",
    date: "Dim 22 Mar 2025",
    seat: "Fosse - Zone A",
    status: "valid",
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const cardAnimations = useRef(
    Array(12)
      .fill(0)
      .map(() => new Animated.Value(0)),
  ).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 45,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 45,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(
      60,
      cardAnimations.map((a) =>
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
          toValue: 1.05,
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

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const json = await AsyncStorage.getItem("USER_LOGGED");
      if (json) {
        setUser(JSON.parse(json));
      } else {
        setUser({
          prenom: "Koné",
          nom: "Oumar",
          email: "client@test.com",
          isBusiness: true,
        });
      }
    } catch (e) {
      setUser({
        prenom: "Koné",
        nom: "Oumar",
        email: "client@test.com",
        isBusiness: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("USER_LOGGED");
            setShowMenu(false);
            router.replace("/(auth)/login" as any);
          } catch (e) {
            /* ignore */
          }
        },
      },
    ]);
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  if (loading)
    return (
      <LinearGradient
        colors={[C.indigoDark, C.indigo, C.violet]}
        style={styles.loadingContainer}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator size="large" color={C.amberLight} />
          </View>
        </Animated.View>
        <Text style={styles.loadingEmoji}>🎟️</Text>
        <Text style={styles.loadingText}>Chargement de Tikety...</Text>
      </LinearGradient>
    );

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[C.amber]}
            tintColor={C.amberLight}
          />
        }
      >
        {/* ═══════ HEADER COMPACT ═══════ */}
        <LinearGradient
          colors={[C.indigoDark, C.indigo, "#5B21B6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Cercles déco subtils */}
          <View style={styles.headerCircle1} pointerEvents="none" />
          <View style={styles.headerCircle2} pointerEvents="none" />

          <Animated.View
            style={[
              styles.headerContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Ligne principale : avatar + infos + menu */}
            <View style={styles.headerRow}>
              {/* Avatar compact */}
              <Animated.View
                style={[
                  styles.avatarWrap,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <LinearGradient
                  colors={[C.amber, C.pink]}
                  style={styles.avatarRing}
                />
                <LinearGradient
                  colors={[C.indigoLight, C.pink]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarInitials}>
                    {(user?.prenom?.[0] || "U").toUpperCase()}
                  </Text>
                </LinearGradient>
                <LinearGradient
                  colors={[C.emerald, "#059669"]}
                  style={styles.onlineDot}
                />
              </Animated.View>

              {/* Texte */}
              <View style={styles.headerTextBlock}>
                <Text style={styles.headerGreet}>Bonjour 👋</Text>
                <Text style={styles.headerName} numberOfLines={1}>
                  {user?.prenom || "Utilisateur"} {user?.nom || ""}
                </Text>
                <LinearGradient
                  colors={[C.amber, C.pink]}
                  style={styles.rolePill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons
                    name={user?.isBusiness ? "business" : "person"}
                    size={10}
                    color="#fff"
                  />
                  <Text style={styles.rolePillText}>
                    {user?.isBusiness ? "Organisateur" : "Participant"}
                  </Text>
                </LinearGradient>
              </View>

              {/* Menu + notif */}
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color="rgba(255,255,255,0.85)"
                  />
                  <View style={styles.notifDot} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setShowMenu(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="menu-outline"
                    size={22}
                    color="rgba(255,255,255,0.85)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats pills */}
            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Ionicons name="ticket" size={14} color={C.amberLight} />
                <Text style={styles.statPillValue}>{MOCK_TICKETS.length}</Text>
                <Text style={styles.statPillLabel}>billets</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statPill}>
                <Ionicons name="calendar" size={14} color={C.pinkLight} />
                <Text style={styles.statPillValue}>{MOCK_EVENTS.length}</Text>
                <Text style={styles.statPillLabel}>événements</Text>
              </View>
              {user?.isBusiness && (
                <>
                  <View style={styles.statDivider} />
                  <View style={styles.statPill}>
                    <Ionicons name="trending-up" size={14} color={C.emerald} />
                    <Text style={styles.statPillValue}>0</Text>
                    <Text style={styles.statPillLabel}>ventes</Text>
                  </View>
                </>
              )}
            </View>
          </Animated.View>
        </LinearGradient>

        {/* ═══════ MENU MODAL ═══════ */}
        <Modal visible={showMenu} transparent animationType="fade">
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <Animated.View
              style={[
                styles.dropdownMenu,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
              ]}
            >
              <LinearGradient
                colors={[C.white, C.cream]}
                style={styles.menuGradient}
              >
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    router.push("/(tabs)/profile" as any);
                  }}
                >
                  <View style={styles.menuIconWrapper}>
                    <LinearGradient
                      colors={[C.indigo, C.indigoDark]}
                      style={styles.menuIconGradient}
                    >
                      <Ionicons name="person-outline" size={18} color="#fff" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.menuText}>Mon Profil</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={C.textLight}
                  />
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    router.push("/(tabs)/tickets" as any);
                  }}
                >
                  <View style={styles.menuIconWrapper}>
                    <LinearGradient
                      colors={[C.amber, C.pink]}
                      style={styles.menuIconGradient}
                    >
                      <Ionicons name="ticket-outline" size={18} color="#fff" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.menuText}>Mes billets</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={C.textLight}
                  />
                </TouchableOpacity>
                {!user?.isBusiness && (
                  <>
                    <View style={styles.menuDivider} />
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setShowMenu(false);
                        router.push("/upgrade-business" as any);
                      }}
                    >
                      <View style={styles.menuIconWrapper}>
                        <LinearGradient
                          colors={[C.emerald, C.emeraldDark]}
                          style={styles.menuIconGradient}
                        >
                          <Ionicons
                            name="business-outline"
                            size={18}
                            color="#fff"
                          />
                        </LinearGradient>
                      </View>
                      <Text style={styles.menuText}>Devenir organisateur</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={C.textLight}
                      />
                    </TouchableOpacity>
                  </>
                )}
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <View style={styles.menuIconWrapper}>
                    <LinearGradient
                      colors={["#EF4444", "#DC2626"]}
                      style={styles.menuIconGradient}
                    >
                      <Ionicons name="log-out-outline" size={18} color="#fff" />
                    </LinearGradient>
                  </View>
                  <Text style={[styles.menuText, styles.logoutText]}>
                    Déconnexion
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#EF4444" />
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </Modal>

        {/* ═══════ CONTENU ═══════ */}
        <View style={styles.content}>
          {/* ── CARTE FEATURED EVENT ── */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: cardAnimations[0],
                transform: [
                  {
                    translateY: cardAnimations[0].interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>⚡ À ne pas rater</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/event/1" as any)}
              style={styles.featuredCardWrapper}
            >
              <LinearGradient
                colors={[C.indigoDark, C.indigo, C.violet]}
                style={styles.featuredCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.View
                  style={[
                    styles.shimmer,
                    { transform: [{ translateX: shimmerTranslate }] },
                  ]}
                />
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={[C.amber, C.pink]}
                    style={styles.cardIconContainer}
                  >
                    <Ionicons name="star" size={26} color="#fff" />
                  </LinearGradient>
                  <LinearGradient
                    colors={[C.amber, C.amberLight]}
                    style={styles.cardTag}
                  >
                    <Text style={styles.cardTagText}>🔥 Populaire</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.cardTitle}>Soirée Gala 2025</Text>
                <View style={styles.cardMetaRow}>
                  <Ionicons
                    name="location"
                    size={12}
                    color="rgba(255,255,255,0.7)"
                  />
                  <Text style={styles.cardMeta}>Sofitel Abidjan</Text>
                  <Ionicons
                    name="calendar"
                    size={12}
                    color="rgba(255,255,255,0.7)"
                    style={{ marginLeft: 10 }}
                  />
                  <Text style={styles.cardMeta}>Sam 15 Mar</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBg}>
                    <LinearGradient
                      colors={[C.amber, C.pink]}
                      style={[styles.progressFill, { width: "60%" }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    120 / 200 billets vendus
                  </Text>
                </View>
                <LinearGradient
                  colors={[C.amber, C.pink]}
                  style={styles.cardButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.cardButtonText}>
                    Acheter — 15 000 FCFA
                  </Text>
                  <Ionicons name="arrow-forward" size={15} color="#fff" />
                </LinearGradient>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ── MES BILLETS RÉCENTS ── */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: cardAnimations[1],
                transform: [
                  {
                    translateY: cardAnimations[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎟️ Mes billets</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => router.push("/(tabs)/tickets" as any)}
              >
                <Text style={styles.seeAllText}>Voir tout</Text>
                <Ionicons name="chevron-forward" size={14} color={C.indigo} />
              </TouchableOpacity>
            </View>

            {MOCK_TICKETS.length > 0 ? (
              MOCK_TICKETS.map((ticket, index) => (
                <TouchableOpacity
                  key={ticket.id}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/ticket/${ticket.id}` as any)}
                >
                  <Animated.View
                    style={[
                      styles.ticketRow,
                      {
                        opacity: cardAnimations[Math.min(index + 2, 11)],
                        transform: [
                          {
                            translateX: (
                              cardAnimations[Math.min(index + 2, 11)] as any
                            ).interpolate({
                              inputRange: [0, 1],
                              outputRange: [-30, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[C.white, C.cream]}
                      style={styles.ticketRowInner}
                    >
                      <LinearGradient
                        colors={
                          index === 0
                            ? [C.indigo, C.violet]
                            : [C.pink, C.violet]
                        }
                        style={styles.ticketRowIcon}
                      >
                        <Ionicons name="ticket" size={20} color="#fff" />
                      </LinearGradient>
                      <View style={styles.ticketRowInfo}>
                        <Text style={styles.ticketRowTitle} numberOfLines={1}>
                          {ticket.eventTitle}
                        </Text>
                        <Text style={styles.ticketRowMeta}>{ticket.date}</Text>
                        <Text style={styles.ticketRowSeat}>{ticket.seat}</Text>
                      </View>
                      <View style={styles.ticketRowRight}>
                        <View style={styles.validBadge}>
                          <Ionicons
                            name="checkmark-circle"
                            size={13}
                            color={C.emerald}
                          />
                          <Text style={styles.validBadgeText}>Valide</Text>
                        </View>
                        <Ionicons
                          name="qr-code"
                          size={20}
                          color={C.indigo}
                          style={{ marginTop: 8 }}
                        />
                      </View>
                    </LinearGradient>
                    <View style={styles.ticketNotchLeft} />
                    <View style={styles.ticketNotchRight} />
                  </Animated.View>
                </TouchableOpacity>
              ))
            ) : (
              <LinearGradient
                colors={[C.white, C.sand]}
                style={styles.emptyCard}
              >
                <Ionicons name="ticket-outline" size={36} color={C.textLight} />
                <Text style={styles.emptyCardText}>
                  Aucun billet pour l'instant
                </Text>
                <Text style={styles.emptyCardSub}>
                  Explorez les événements disponibles
                </Text>
              </LinearGradient>
            )}
          </Animated.View>

          {/* ── ÉVÉNEMENTS À VENIR — HORIZONTAL SCROLL CARDS ── */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: cardAnimations[4],
                transform: [
                  {
                    translateY: cardAnimations[4].interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📅 Événements à venir</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => router.push("/(tabs)/" as any)}
              >
                <Text style={styles.seeAllText}>Explorer</Text>
                <Ionicons name="chevron-forward" size={14} color={C.indigo} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsScrollContainer}
              decelerationRate="fast"
              snapToInterval={EVENT_CARD_WIDTH + 12}
              snapToAlignment="start"
            >
              {MOCK_EVENTS.map((event, index) => (
                <TouchableOpacity
                  key={event.id}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/event/${event.id}` as any)}
                >
                  <Animated.View
                    style={[
                      styles.eventCard,
                      {
                        opacity: cardAnimations[Math.min(index + 5, 11)],
                        transform: [
                          {
                            scale: (
                              cardAnimations[Math.min(index + 5, 11)] as any
                            ).interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.93, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {/* Image de l'événement */}
                    <View style={styles.eventImageContainer}>
                      <Image
                        source={{ uri: event.image }}
                        style={styles.eventImage}
                        resizeMode="cover"
                      />
                      {/* Overlay gradient sur l'image */}
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.55)"]}
                        style={styles.eventImageOverlay}
                      />
                      {/* Badge catégorie */}
                      <LinearGradient
                        colors={event.gradient}
                        style={styles.eventCategoryBadge}
                      >
                        <Ionicons
                          name={event.icon as any}
                          size={11}
                          color="#fff"
                        />
                        <Text style={styles.eventCategoryText}>
                          {event.category}
                        </Text>
                      </LinearGradient>
                      {/* Prix en bas de l'image */}
                      <LinearGradient
                        colors={
                          event.price === 0
                            ? [C.emerald, "#059669"]
                            : [C.amber, C.pink]
                        }
                        style={styles.eventPriceBadge}
                      >
                        <Text style={styles.eventPriceText}>
                          {event.price === 0
                            ? "Gratuit"
                            : `${event.price.toLocaleString()} F`}
                        </Text>
                      </LinearGradient>
                    </View>

                    {/* Infos en bas de la carte */}
                    <View style={styles.eventCardBody}>
                      <Text style={styles.eventCardTitle} numberOfLines={1}>
                        {event.title}
                      </Text>
                      <View style={styles.eventCardMeta}>
                        <Ionicons
                          name="location-outline"
                          size={11}
                          color="#9CA3AF"
                        />
                        <Text
                          style={styles.eventCardMetaText}
                          numberOfLines={1}
                        >
                          {event.location}
                        </Text>
                      </View>
                      <View style={styles.eventCardMeta}>
                        <Ionicons
                          name="calendar-outline"
                          size={11}
                          color="#9CA3AF"
                        />
                        <Text style={styles.eventCardMetaText}>
                          {event.date}
                        </Text>
                      </View>
                      {/* Progress mini */}
                      <View style={styles.eventCardProgress}>
                        <View style={styles.eventCardProgressBg}>
                          <LinearGradient
                            colors={event.gradient}
                            style={[
                              styles.eventCardProgressFill,
                              {
                                width:
                                  `${Math.round((event.ticketsSold / event.totalTickets) * 100)}%` as any,
                              },
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          />
                        </View>
                        <Text style={styles.eventCardProgressText}>
                          {event.ticketsSold}/{event.totalTickets}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* ── CARTE ORGANISATEUR ── */}
          {!user?.isBusiness && (
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: cardAnimations[9],
                  transform: [
                    {
                      translateY: cardAnimations[9].interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/upgrade-business" as any)}
              >
                <LinearGradient
                  colors={[C.emeraldDark, C.emerald, "#0891B2"]}
                  style={styles.promoCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Animated.View
                    style={[
                      styles.shimmer,
                      { transform: [{ translateX: shimmerTranslate }] },
                    ]}
                  />
                  <Animated.Text
                    style={[
                      styles.promoFloat,
                      { transform: [{ translateY: floatAnim }] },
                    ]}
                  >
                    🚀
                  </Animated.Text>
                  <View style={styles.promoContent}>
                    <LinearGradient
                      colors={[C.amber, C.pink]}
                      style={styles.promoBadge}
                    >
                      <Text style={styles.promoBadgeText}>Nouveau</Text>
                    </LinearGradient>
                    <Text style={styles.promoTitle}>Devenez organisateur</Text>
                    <Text style={styles.promoDesc}>
                      Créez vos propres événements, gérez vos ventes et
                      atteignez votre audience sur Tikety.
                    </Text>
                    <LinearGradient
                      colors={[C.amber, C.pink]}
                      style={styles.promoButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.promoButtonText}>
                        Commencer maintenant
                      </Text>
                      <Ionicons name="arrow-forward" size={15} color="#fff" />
                    </LinearGradient>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* ── FOOTER ── */}
          <View style={styles.footer}>
            <LinearGradient
              colors={[C.indigoDark, C.indigo]}
              style={styles.footerCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.footerContent}>
                <View>
                  <Text style={styles.footerLogo}>🎟️</Text>
                  <Text style={styles.footerBrand}>Tikety</Text>
                </View>
                <View style={styles.footerDivider} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.footerTagline}>
                    Vos événements, simplifiés.
                  </Text>
                  <Text style={styles.footerSub}>
                    Billetterie • Gestion • Contrôle
                  </Text>
                  <Text style={styles.footerVersion}>Version {appVersion}</Text>
                </View>
              </View>
              <LinearGradient
                colors={[C.amber, C.pink, C.amber]}
                style={styles.footerStrip}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.footerStripText}>
                  ✦ TIKETY • LA BILLETTERIE INTELLIGENTE DE CÔTE D'IVOIRE ✦
                </Text>
              </LinearGradient>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

// ══════════════════════════════════════════════════════
//  DIMENSIONS
// ══════════════════════════════════════════════════════
const EVENT_CARD_WIDTH = width * 0.52; // ~1/2 de largeur pour voir 1.8 cartes
const EVENT_IMAGE_HEIGHT = EVENT_CARD_WIDTH * 0.72; // ratio 4:3 environ

// ══════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgLight },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingEmoji: { fontSize: 36, marginBottom: 6 },
  loadingText: {
    color: C.amberLight,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },

  // ─── HEADER COMPACT ───
  headerGradient: {
    paddingTop: 54,
    paddingBottom: 18,
    overflow: "hidden",
    position: "relative",
  },
  headerCircle1: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  headerCircle2: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  headerContent: { paddingHorizontal: 18 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  avatarWrap: { position: "relative", width: 52, height: 52 },
  avatarRing: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 30,
    opacity: 0.85,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  avatarInitials: { fontSize: 20, fontWeight: "900", color: "#fff" },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.indigoDark,
  },
  headerTextBlock: { flex: 1 },
  headerGreet: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
    marginBottom: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
    marginBottom: 5,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  rolePillText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.amber,
    borderWidth: 1.5,
    borderColor: C.indigoDark,
  },

  // Stats pills
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  statPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  statPillValue: { fontSize: 16, fontWeight: "800", color: "#fff" },
  statPillLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // MENU MODAL
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 52,
    paddingRight: 18,
  },
  dropdownMenu: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  menuGradient: {
    minWidth: 220,
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.15)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 10,
    gap: 10,
  },
  menuIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 9,
    overflow: "hidden",
  },
  menuIconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: { fontSize: 13, fontWeight: "600", color: C.textDark, flex: 1 },
  logoutText: { color: "#EF4444" },
  menuDivider: { height: 1, backgroundColor: "#E5E7EB", marginHorizontal: 10 },

  // CONTENT
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 100 },
  section: { marginBottom: 26 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.textDark,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  seeAllButton: { flexDirection: "row", alignItems: "center", gap: 3 },
  seeAllText: { fontSize: 13, fontWeight: "600", color: C.indigo },

  // FEATURED CARD
  featuredCardWrapper: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: C.indigo,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  featuredCard: {
    padding: 16,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 70,
    backgroundColor: "rgba(255,255,255,0.14)",
    transform: [{ skewX: "-20deg" }],
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  cardTagText: { fontSize: 11, fontWeight: "700", color: C.indigoDark },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  cardMeta: { fontSize: 11, color: "rgba(255,255,255,0.75)" },
  progressContainer: { marginBottom: 14 },
  progressBg: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginBottom: 5,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 10, color: "rgba(255,255,255,0.6)" },
  cardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 11,
    gap: 6,
  },
  cardButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // TICKET ROWS
  ticketRow: {
    marginBottom: 10,
    shadowColor: C.indigo,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  ticketRowInner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.1)",
  },
  ticketRowIcon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  ticketRowInfo: { flex: 1 },
  ticketRowTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textDark,
    marginBottom: 2,
  },
  ticketRowMeta: { fontSize: 11, color: "#6B7280", marginBottom: 2 },
  ticketRowSeat: { fontSize: 10, color: C.indigo, fontWeight: "600" },
  ticketRowRight: { alignItems: "center" },
  validBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 9,
  },
  validBadgeText: { fontSize: 10, fontWeight: "700", color: C.emeraldDark },
  ticketNotchLeft: {
    position: "absolute",
    left: -7,
    top: "50%",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.bgLight,
    marginTop: -7,
  },
  ticketNotchRight: {
    position: "absolute",
    right: -7,
    top: "50%",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.bgLight,
    marginTop: -7,
  },

  // ─── EVENT CARDS (horizontal scroll) ───
  eventsScrollContainer: {
    paddingLeft: 2,
    paddingRight: 18,
    paddingBottom: 6,
    gap: 12,
  },
  eventCard: {
    width: EVENT_CARD_WIDTH,
    backgroundColor: C.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: C.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.08)",
  },
  eventImageContainer: {
    width: "100%",
    height: EVENT_IMAGE_HEIGHT,
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  eventImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  eventCategoryBadge: {
    position: "absolute",
    top: 9,
    left: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  eventCategoryText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  eventPriceBadge: {
    position: "absolute",
    bottom: 9,
    right: 9,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  eventPriceText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  eventCardBody: {
    padding: 12,
    gap: 4,
  },
  eventCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: C.textDark,
    marginBottom: 2,
  },
  eventCardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  eventCardMetaText: { fontSize: 11, color: "#6B7280", flex: 1 },
  eventCardProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  eventCardProgressBg: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  eventCardProgressFill: { height: "100%", borderRadius: 2 },
  eventCardProgressText: { fontSize: 9, color: "#9CA3AF", fontWeight: "600" },

  // PROMO CARD
  promoCard: {
    borderRadius: 18,
    overflow: "hidden",
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
    shadowColor: C.emeraldDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  promoFloat: { position: "absolute", top: 14, right: 18, fontSize: 40 },
  promoContent: { maxWidth: "80%" },
  promoBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  promoBadgeText: { fontSize: 10, fontWeight: "700", color: C.indigoDark },
  promoTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 7,
  },
  promoDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 18,
    marginBottom: 14,
  },
  promoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 11,
    gap: 6,
  },
  promoButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // EMPTY
  emptyCard: {
    borderRadius: 14,
    padding: 26,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.08)",
  },
  emptyCardText: { fontSize: 13, color: C.textDark, fontWeight: "600" },
  emptyCardSub: { fontSize: 11, color: "#9CA3AF" },

  // FOOTER
  footer: { marginBottom: 10 },
  footerCard: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: C.indigoDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  footerLogo: { fontSize: 28 },
  footerBrand: {
    fontSize: 16,
    fontWeight: "900",
    color: C.amberLight,
    letterSpacing: 1,
  },
  footerDivider: {
    width: 1.5,
    height: 55,
    backgroundColor: "rgba(245,158,11,0.4)",
  },
  footerTagline: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 3,
  },
  footerSub: { fontSize: 11, color: C.indigoLight, marginBottom: 5 },
  footerVersion: { fontSize: 10, color: "rgba(255,255,255,0.4)" },
  footerStrip: { paddingVertical: 7, paddingHorizontal: 18 },
  footerStripText: {
    color: C.indigoDark,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center",
  },
});
