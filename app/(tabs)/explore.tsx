import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
  cardBg: "#FAFAFE",
  textDark: "#1E1B4B",
  textMid: "#4338CA",
  textLight: "#A5B4FC",
  cream: "#F5F3FF",
  sand: "#EDE9FE",
};

const CATEGORIES = [
  { id: "all", label: "Tous", icon: "apps" },
  { id: "concert", label: "Concerts", icon: "musical-notes" },
  { id: "gala", label: "Galas", icon: "star" },
  { id: "conference", label: "Conférences", icon: "laptop" },
  { id: "festival", label: "Festivals", icon: "color-palette" },
  { id: "sport", label: "Sports", icon: "football" },
];

const ALL_EVENTS = [
  {
    id: "1",
    title: "Soirée Gala 2025",
    date: "Sam 15 Mar",
    time: "20h00",
    location: "Sofitel Abidjan",
    price: 15000,
    category: "gala",
    gradient: [C.indigo, C.violet] as [string, string],
    ticketsSold: 120,
    totalTickets: 200,
    image:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=80",
    featured: true,
  },
  {
    id: "2",
    title: "Concert Afrobeats Live",
    date: "Dim 22 Mar",
    time: "19h30",
    location: "Palais de la Culture",
    price: 5000,
    category: "concert",
    gradient: [C.pink, C.violet] as [string, string],
    ticketsSold: 850,
    totalTickets: 1000,
    image:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80",
    featured: true,
  },
  {
    id: "3",
    title: "Forum Tech CI 2025",
    date: "Ven 28 Mar",
    time: "09h00",
    location: "CCIB Plateau",
    price: 0,
    category: "conference",
    gradient: [C.emerald, "#0891B2"] as [string, string],
    ticketsSold: 300,
    totalTickets: 500,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    featured: false,
  },
  {
    id: "4",
    title: "Festival Art & Lumières",
    date: "Sam 5 Avr",
    time: "17h00",
    location: "Cocody Art Center",
    price: 3000,
    category: "festival",
    gradient: [C.amber, C.pink] as [string, string],
    ticketsSold: 200,
    totalTickets: 600,
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80",
    featured: false,
  },
  {
    id: "5",
    title: "Nuit du Jazz Abidjan",
    date: "Ven 11 Avr",
    time: "21h00",
    location: "Hôtel Ivoire",
    price: 8000,
    category: "concert",
    gradient: ["#1E3A5F", "#0EA5E9"] as [string, string],
    ticketsSold: 60,
    totalTickets: 150,
    image:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80",
    featured: false,
  },
  {
    id: "6",
    title: "Tournoi Foot Inter-Quartiers",
    date: "Sam 19 Avr",
    time: "10h00",
    location: "Stade Felix Houphouët",
    price: 1000,
    category: "sport",
    gradient: [C.emerald, C.indigo] as [string, string],
    ticketsSold: 400,
    totalTickets: 800,
    image:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80",
    featured: false,
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const cardAnims = useRef(ALL_EVENTS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
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
    ]).start();
    Animated.stagger(
      80,
      cardAnims.map((a) =>
        Animated.spring(a, {
          toValue: 1,
          tension: 55,
          friction: 8,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, []);

  const filtered = ALL_EVENTS.filter((e) => {
    const matchCat =
      selectedCategory === "all" || e.category === selectedCategory;
    const matchSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featuredEvents = ALL_EVENTS.filter((e) => e.featured);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── HEADER ── */}
        <LinearGradient
          colors={[C.indigoDark, C.indigo, "#5B21B6"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerCircle1} />
          <View style={styles.headerCircle2} />

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerSub}>Découvrez</Text>
                <Text style={styles.headerTitle}>Événements 🎉</Text>
              </View>
              <TouchableOpacity style={styles.filterBtn}>
                <Ionicons
                  name="options-outline"
                  size={20}
                  color={C.amberLight}
                />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View
              style={[
                styles.searchBar,
                searchFocused && styles.searchBarFocused,
              ]}
            >
              <Ionicons
                name="search"
                size={18}
                color={searchFocused ? C.indigo : "#9CA3AF"}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un événement, lieu..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          {/* ── CATÉGORIES ── */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  {selectedCategory === cat.id ? (
                    <LinearGradient
                      colors={[C.indigo, C.violet]}
                      style={styles.categoryPillActive}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name={cat.icon as any} size={14} color="#fff" />
                      <Text style={styles.categoryPillTextActive}>
                        {cat.label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.categoryPill}>
                      <Ionicons
                        name={cat.icon as any}
                        size={14}
                        color={C.textMid}
                      />
                      <Text style={styles.categoryPillText}>{cat.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* ── FEATURED (si pas de recherche ni filtre actif) ── */}
          {selectedCategory === "all" && searchQuery === "" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔥 À la une</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 14, paddingRight: 18 }}
                decelerationRate="fast"
                snapToInterval={width * 0.78 + 14}
              >
                {featuredEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    activeOpacity={0.9}
                    onPress={() => router.push(`/event/${event.id}` as any)}
                  >
                    <View style={styles.featuredCard}>
                      <Image
                        source={{ uri: event.image }}
                        style={styles.featuredImage}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.82)"]}
                        style={styles.featuredOverlay}
                      />
                      <LinearGradient
                        colors={event.gradient}
                        style={styles.featuredCatBadge}
                      >
                        <Text style={styles.featuredCatText}>
                          {event.category}
                        </Text>
                      </LinearGradient>
                      <View style={styles.featuredInfo}>
                        <Text style={styles.featuredTitle}>{event.title}</Text>
                        <View style={styles.featuredMeta}>
                          <Ionicons
                            name="location"
                            size={11}
                            color="rgba(255,255,255,0.75)"
                          />
                          <Text style={styles.featuredMetaText}>
                            {event.location}
                          </Text>
                          <Text style={styles.featuredMetaDot}>·</Text>
                          <Ionicons
                            name="calendar"
                            size={11}
                            color="rgba(255,255,255,0.75)"
                          />
                          <Text style={styles.featuredMetaText}>
                            {event.date}
                          </Text>
                        </View>
                        <LinearGradient
                          colors={
                            event.price === 0
                              ? [C.emerald, "#059669"]
                              : [C.amber, C.pink]
                          }
                          style={styles.featuredPrice}
                        >
                          <Text style={styles.featuredPriceText}>
                            {event.price === 0
                              ? "Gratuit"
                              : `${event.price.toLocaleString()} FCFA`}
                          </Text>
                        </LinearGradient>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── LISTE TOUS ÉVÉNEMENTS ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === "all"
                  ? "📅 Tous les événements"
                  : `📅 ${CATEGORIES.find((c) => c.id === selectedCategory)?.label}`}
              </Text>
              <Text style={styles.countBadge}>{filtered.length}</Text>
            </View>

            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyText}>Aucun événement trouvé</Text>
                <Text style={styles.emptySub}>
                  Essayez un autre terme ou catégorie
                </Text>
              </View>
            ) : (
              filtered.map((event, index) => (
                <TouchableOpacity
                  key={event.id}
                  activeOpacity={0.87}
                  onPress={() => router.push(`/event/${event.id}` as any)}
                >
                  <Animated.View
                    style={[
                      styles.eventListCard,
                      {
                        opacity:
                          cardAnims[Math.min(index, cardAnims.length - 1)],
                        transform: [
                          {
                            translateY: (
                              cardAnims[
                                Math.min(index, cardAnims.length - 1)
                              ] as any
                            ).interpolate({
                              inputRange: [0, 1],
                              outputRange: [30, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: event.image }}
                      style={styles.eventListImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={event.gradient}
                      style={styles.eventListAccent}
                    />
                    <View style={styles.eventListBody}>
                      <View style={styles.eventListTop}>
                        <Text style={styles.eventListTitle} numberOfLines={1}>
                          {event.title}
                        </Text>
                        <LinearGradient
                          colors={
                            event.price === 0
                              ? [C.emerald, "#059669"]
                              : event.gradient
                          }
                          style={styles.eventListPrice}
                        >
                          <Text style={styles.eventListPriceText}>
                            {event.price === 0
                              ? "Gratuit"
                              : `${event.price.toLocaleString()} F`}
                          </Text>
                        </LinearGradient>
                      </View>
                      <View style={styles.eventListMeta}>
                        <Ionicons
                          name="location-outline"
                          size={11}
                          color="#9CA3AF"
                        />
                        <Text style={styles.eventListMetaText}>
                          {event.location}
                        </Text>
                      </View>
                      <View style={styles.eventListBottom}>
                        <View style={styles.eventListMeta}>
                          <Ionicons
                            name="calendar-outline"
                            size={11}
                            color="#9CA3AF"
                          />
                          <Text style={styles.eventListMetaText}>
                            {event.date} · {event.time}
                          </Text>
                        </View>
                        <View style={styles.eventAvailability}>
                          <View
                            style={[
                              styles.availDot,
                              {
                                backgroundColor:
                                  event.ticketsSold >= event.totalTickets
                                    ? "#EF4444"
                                    : C.emerald,
                              },
                            ]}
                          />
                          <Text style={styles.availText}>
                            {event.ticketsSold >= event.totalTickets
                              ? "Complet"
                              : `${event.totalTickets - event.ticketsSold} restants`}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.eventListChevron}>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={C.textLight}
                      />
                    </TouchableOpacity>
                  </Animated.View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgLight },

  // HEADER
  header: {
    paddingTop: 54,
    paddingBottom: 22,
    paddingHorizontal: 18,
    overflow: "hidden",
    position: "relative",
  },
  headerCircle1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerCircle2: {
    position: "absolute",
    bottom: -20,
    left: 60,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  searchBarFocused: { borderColor: C.indigo },
  searchInput: { flex: 1, fontSize: 13, color: C.textDark, fontWeight: "500" },

  // CONTENT
  content: { paddingBottom: 100 },
  section: { marginBottom: 26, paddingHorizontal: 18 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.textDark,
    marginBottom: 12,
  },
  countBadge: {
    backgroundColor: C.sand,
    color: C.textMid,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },

  // CATEGORIES
  categoriesContainer: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 8,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: C.sand,
  },
  categoryPillText: { fontSize: 12, fontWeight: "600", color: C.textMid },
  categoryPillActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
  },
  categoryPillTextActive: { fontSize: 12, fontWeight: "700", color: "#fff" },

  // FEATURED
  featuredCard: {
    width: width * 0.78,
    height: 200,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  featuredImage: { width: "100%", height: "100%" },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
  },
  featuredCatBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  featuredCatText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  featuredInfo: { position: "absolute", bottom: 14, left: 14, right: 14 },
  featuredTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  featuredMetaText: { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  featuredMetaDot: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  featuredPrice: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredPriceText: { color: "#fff", fontSize: 11, fontWeight: "800" },

  // EVENT LIST
  eventListCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 16,
    marginBottom: 10,
    overflow: "hidden",
    shadowColor: C.indigo,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.07)",
  },
  eventListImage: { width: 80, height: 80 },
  eventListAccent: { width: 3, height: "100%", position: "absolute", left: 80 },
  eventListBody: { flex: 1, padding: 12, paddingLeft: 15 },
  eventListTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  eventListTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: C.textDark,
    flex: 1,
    marginRight: 8,
  },
  eventListPrice: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  eventListPriceText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  eventListMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  eventListMetaText: { fontSize: 11, color: "#6B7280" },
  eventListBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  eventAvailability: { flexDirection: "row", alignItems: "center", gap: 4 },
  availDot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontSize: 10, color: "#6B7280", fontWeight: "600" },
  eventListChevron: { paddingHorizontal: 12 },

  // EMPTY
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.08)",
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textDark,
    marginBottom: 6,
  },
  emptySub: { fontSize: 13, color: "#9CA3AF" },
});
