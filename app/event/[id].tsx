/**
 * app/event/[id].tsx
 * Page de détail d'un événement — Tikety
 *
 * Route : /event/:id  (expo-router dynamic route)
 * Usage : router.push(`/event/${event.id}`)
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const BANNER_H = height * 0.42;

// ── Palette ────────────────────────────────────
const C = {
  indigo: "#6366F1",
  indigoDark: "#3730A3",
  indigoLight: "#818CF8",
  violet: "#7C3AED",
  pink: "#EC4899",
  amber: "#F59E0B",
  amberLight: "#FCD34D",
  emerald: "#10B981",
  red: "#EF4444",
  white: "#FFFFFF",
  bgLight: "#F1F0FF",
  textDark: "#1E1B4B",
  textMid: "#4338CA",
  textLight: "#A5B4FC",
  textGray: "#6B7280",
  cream: "#F5F3FF",
  sand: "#EDE9FE",
};

// ── Types ──────────────────────────────────────
interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  perks: string[];
  available: number;
  total: number;
  color: string;
  gradient: [string, string];
}

interface ProgramItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

interface Organizer {
  name: string;
  avatar: string;
  phone: string;
  email: string;
  website?: string;
  slogan?: string;
  eventsCount: number;
  rating: number;
}

interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

interface EventDetail {
  id: string;
  title: string;
  category: string;
  date: string;
  dateEnd?: string;
  time: string;
  timeEnd?: string;
  location: string;
  address: string;
  price: number;
  priceLabel: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  gradient: [string, string];
  ticketsSold: number;
  totalTickets: number;
  tags: string[];
  tiers: TicketTier[];
  program: ProgramItem[];
  organizer: Organizer;
  sponsors: { name: string; tier: "or" | "argent" | "bronze" }[];
  reviews: Review[];
  isFavorited: boolean;
  lat: number;
  lng: number;
}

// ── Base mock data ─────────────────────────────
const EVENTS_DB: Record<string, EventDetail> = {
  "1": {
    id: "1",
    title: "Soirée Gala 2025",
    category: "Gala",
    date: "Sam 15 Mars 2025",
    time: "20h00",
    timeEnd: "02h00",
    location: "Sofitel Hôtel Ivoire",
    address: "Boulevard Hassan II, Cocody, Abidjan",
    price: 15000,
    priceLabel: "à partir de",
    description:
      "La plus grande soirée gala de Côte d'Ivoire revient pour une édition inoubliable.",
    longDescription: `Rejoignez-nous pour la 5ème édition de la Soirée Gala 2025, l'événement mondain le plus attendu de l'année en Côte d'Ivoire.

Une nuit de glamour, de musique live et de rencontres exceptionnelles dans le cadre majestueux du Sofitel Hôtel Ivoire. Dress code : tenue de soirée obligatoire.

Au programme : cocktail de bienvenue, dîner gastronomique 4 services, performances live de DJ Arafat Jr et l'Orchestre National, cérémonie de remise de prix, et soirée dansante jusqu'à l'aube.`,
    image:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
    ],
    gradient: [C.indigo, C.violet],
    ticketsSold: 162,
    totalTickets: 200,
    tags: ["Gala", "Soirée", "Glamour", "Live Music", "Abidjan"],
    tiers: [
      {
        id: "standard",
        name: "Standard",
        price: 15000,
        description: "Accès à la salle principale",
        perks: [
          "Cocktail de bienvenue",
          "Accès piste de danse",
          "Buffet dînatoire",
        ],
        available: 28,
        total: 120,
        color: C.textMid,
        gradient: [C.indigo, "#818CF8"],
      },
      {
        id: "vip",
        name: "VIP",
        price: 35000,
        description: "Expérience premium",
        perks: [
          "Table réservée",
          "Dîner 4 services",
          "Open bar premium",
          "Accès VIP lounge",
          "Photo souvenir",
        ],
        available: 10,
        total: 60,
        color: C.amber,
        gradient: [C.amber, C.pink],
      },
      {
        id: "vvip",
        name: "VVIP",
        price: 75000,
        description: "Loge privée exclusive",
        perks: [
          "Loge privée",
          "Butler personnel",
          "Champagne à volonté",
          "Meet & Greet artistes",
          "Cadeau de prestige",
          "Parking VIP",
        ],
        available: 3,
        total: 20,
        color: C.violet,
        gradient: [C.violet, C.indigoDark],
      },
    ],
    program: [
      {
        time: "19h30",
        title: "Cocktail d'accueil",
        description: "Réception des invités, cocktails et canapés",
      },
      {
        time: "20h30",
        title: "Ouverture officielle",
        description: "Discours de bienvenue",
        speaker: "Présidence EventPro CI",
      },
      {
        time: "21h00",
        title: "Dîner gastronomique",
        description:
          "4 services élaborés par le Chef Étoilé Jean-Pierre Kouamé",
      },
      {
        time: "22h30",
        title: "Remise des Prix",
        description: "Cérémonie de distinction des personnalités de l'année",
      },
      {
        time: "23h00",
        title: "Performance Live",
        description: "Concert",
        speaker: "DJ Arafat Jr & Orchestre National CI",
      },
      {
        time: "00h00",
        title: "Soirée Dansante",
        description: "Jusqu'à l'aube avec nos DJs résidents",
      },
    ],
    organizer: {
      name: "EventPro Côte d'Ivoire",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
      phone: "+225 07 07 07 07 07",
      email: "contact@eventpro-ci.com",
      website: "www.eventpro-ci.com",
      slogan: "L'excellence événementielle en Afrique",
      eventsCount: 47,
      rating: 4.8,
    },
    sponsors: [
      { name: "MTN CI", tier: "or" },
      { name: "Orange CI", tier: "or" },
      { name: "Brasseries CI", tier: "argent" },
      { name: "SIB Banque", tier: "argent" },
      { name: "Nestlé CI", tier: "bronze" },
      { name: "Total CI", tier: "bronze" },
    ],
    reviews: [
      {
        id: "r1",
        author: "Amina K.",
        avatar: "https://i.pravatar.cc/40?img=5",
        rating: 5,
        comment:
          "Événement magnifique, organisation parfaite ! J'y retourne l'année prochaine sans hésitation.",
        date: "16 Mar 2024",
      },
      {
        id: "r2",
        author: "Kofi M.",
        avatar: "https://i.pravatar.cc/40?img=8",
        rating: 4,
        comment:
          "Super ambiance, dîner excellent. Juste l'accès parking un peu compliqué.",
        date: "15 Mar 2024",
      },
      {
        id: "r3",
        author: "Fatoumata D.",
        avatar: "https://i.pravatar.cc/40?img=16",
        rating: 5,
        comment:
          "Le meilleur gala d'Abidjan ! Les artistes étaient incroyables.",
        date: "15 Mar 2024",
      },
    ],
    isFavorited: false,
    lat: 5.3364,
    lng: -4.0178,
  },
  "2": {
    id: "2",
    title: "Concert Afrobeats Live",
    category: "Concert",
    date: "Dim 22 Mars 2025",
    time: "19h30",
    timeEnd: "23h00",
    location: "Palais de la Culture",
    address: "Boulevard Latrille, Cocody, Abidjan",
    price: 5000,
    priceLabel: "à partir de",
    description:
      "La plus grande scène afrobeats de Côte d'Ivoire avec des artistes internationaux.",
    longDescription: `Le Concert Afrobeats Live revient pour une nuit de musique africaine explosive au Palais de la Culture d'Abidjan.

Des artistes de renommée internationale et locale se retrouvent sur la plus grande scène de Côte d'Ivoire pour célébrer la richesse musicale africaine. Attendez-vous à des performances époustouflantes, des beats envoûtants et une énergie incomparable.

Venez vibrer au rythme de l'Afrique !`,
    image:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
    ],
    gradient: [C.pink, C.violet],
    ticketsSold: 870,
    totalTickets: 1000,
    tags: ["Afrobeats", "Concert", "Live", "Musique", "Abidjan"],
    tiers: [
      {
        id: "fosse",
        name: "Fosse",
        price: 5000,
        description: "Accès zone fosse debout",
        perks: ["Accès fosse", "Vue rapprochée scène"],
        available: 100,
        total: 700,
        color: C.pink,
        gradient: [C.pink, "#F472B6"],
      },
      {
        id: "tribune",
        name: "Tribune",
        price: 10000,
        description: "Places assises tribune",
        perks: [
          "Place assise numérotée",
          "Vue panoramique",
          "Accès bar prioritaire",
        ],
        available: 30,
        total: 250,
        color: C.violet,
        gradient: [C.violet, C.indigo],
      },
      {
        id: "backstage",
        name: "Backstage Pass",
        price: 50000,
        description: "Accès coulisses exclusif",
        perks: [
          "Accès backstage",
          "Meet & Greet artistes",
          "Photos dédicacées",
          "Boîte cadeau",
          "Place VIP",
        ],
        available: 5,
        total: 50,
        color: C.amber,
        gradient: [C.amber, C.pink],
      },
    ],
    program: [
      { time: "19h30", title: "Ouverture des portes" },
      { time: "20h00", title: "DJ Set d'ouverture", speaker: "DJ Mix Master" },
      {
        time: "21h00",
        title: "Artistes invités",
        description: "Performances des artistes locaux",
      },
      {
        time: "22h00",
        title: "Tête d'affiche",
        speaker: "Artiste International Surprise",
      },
      { time: "23h00", title: "Fin du concert" },
    ],
    organizer: {
      name: "Abidjan Live Events",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
      phone: "+225 05 05 05 05 05",
      email: "info@abidjan-live.com",
      slogan: "Vibrez avec nous 🎶",
      eventsCount: 23,
      rating: 4.6,
    },
    sponsors: [
      { name: "Wave CI", tier: "or" },
      { name: "Canal+ Afrique", tier: "or" },
      { name: "Airtel CI", tier: "argent" },
    ],
    reviews: [
      {
        id: "r1",
        author: "Aya T.",
        avatar: "https://i.pravatar.cc/40?img=20",
        rating: 5,
        comment: "WOW ! Ambiance de folie, les artistes étaient au top !",
        date: "23 Mar 2024",
      },
      {
        id: "r2",
        author: "Seydou B.",
        avatar: "https://i.pravatar.cc/40?img=12",
        rating: 4,
        comment:
          "Super concert ! La fosse était bondée mais l'énergie était incroyable.",
        date: "23 Mar 2024",
      },
    ],
    isFavorited: true,
    lat: 5.3601,
    lng: -4.0083,
  },
};

const DEFAULT_EVENT = EVENTS_DB["1"];

// ── Étoiles rating ─────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? "star" : "star-outline"}
          size={size}
          color={i <= Math.round(rating) ? C.amber : "#D1D5DB"}
        />
      ))}
    </View>
  );
}

// ════════════════════════════════════════════════
//  PAGE PAIEMENT MOBILE MONEY
// ════════════════════════════════════════════════
function MobileMoneyPage({
  amount,
  event,
  tier,
  quantity,
  onBack,
  onSuccess,
}: {
  amount: number;
  event: EventDetail;
  tier: TicketTier;
  quantity: number;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState<"mtn" | "orange" | "wave">("mtn");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const operators = [
    { id: "mtn" as const, label: "MTN Money", color: "#FFC107", bg: "#FFF8E1" },
    {
      id: "orange" as const,
      label: "Orange Money",
      color: "#FF5722",
      bg: "#FBE9E7",
    },
    { id: "wave" as const, label: "Wave", color: "#00BCD4", bg: "#E0F7FA" },
  ];

  const handlePay = () => {
    if (phone.length < 8) {
      Alert.alert("Numéro invalide", "Veuillez saisir un numéro valide.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bgLight }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[C.amber, C.pink]}
          style={[pay.header, { paddingTop: insets.top + 16 }]}
        >
          <TouchableOpacity
            onPress={onBack}
            style={pay.headerBack}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={pay.headerTitle}>Mobile Money</Text>
            <Text style={pay.headerSub}>Paiement sécurisé</Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Montant */}
        <LinearGradient
          colors={["rgba(245,158,11,0.1)", "rgba(236,72,153,0.05)"]}
          style={pay.amountCard}
        >
          <Text style={pay.amountLabel}>Total à payer</Text>
          <Text style={pay.amountValue}>{amount.toLocaleString()} FCFA</Text>
          <Text style={pay.amountEvent} numberOfLines={1}>
            {event.title} · {quantity}× {tier.name}
          </Text>
        </LinearGradient>

        <View style={pay.body}>
          {/* Opérateur */}
          <Text style={pay.sectionLabel}>Choisir l'opérateur</Text>
          <View style={pay.operatorsRow}>
            {operators.map((op) => (
              <TouchableOpacity
                key={op.id}
                onPress={() => setOperator(op.id)}
                activeOpacity={0.85}
                style={[
                  pay.operatorBtn,
                  {
                    backgroundColor: op.bg,
                    borderColor: operator === op.id ? op.color : "transparent",
                  },
                ]}
              >
                <View
                  style={[pay.operatorDot, { backgroundColor: op.color }]}
                />
                <Text style={[pay.operatorLabel, { color: op.color }]}>
                  {op.label}
                </Text>
                {operator === op.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={op.color}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Numéro */}
          <Text style={pay.sectionLabel}>Numéro de paiement</Text>
          <View style={pay.inputWrapper}>
            <View style={pay.inputFlag}>
              <Text style={pay.inputFlagText}>🇨🇮 +225</Text>
            </View>
            <TextInput
              style={pay.phoneInput}
              placeholder="07 00 00 00 00"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={12}
            />
          </View>

          {/* Info */}
          <View style={pay.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={C.textMid}
            />
            <Text style={pay.infoText}>
              Vous recevrez une demande de confirmation sur votre téléphone.
              Veuillez valider avec votre code PIN{" "}
              {operators.find((o) => o.id === operator)?.label}.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={[pay.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          onPress={handlePay}
          activeOpacity={0.88}
          disabled={loading}
        >
          <LinearGradient
            colors={[C.amber, C.pink]}
            style={pay.ctaBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <Text style={pay.ctaBtnText}>Traitement en cours...</Text>
            ) : (
              <>
                <Ionicons
                  name="phone-portrait-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={pay.ctaBtnText}>Confirmer le paiement</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <Text style={pay.secureNote}>🔒 Paiement sécurisé par Tikety Pay</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// ════════════════════════════════════════════════
//  PAGE PAIEMENT CARTE VISA
// ════════════════════════════════════════════════
function CardPaymentPage({
  amount,
  event,
  tier,
  quantity,
  onBack,
  onSuccess,
}: {
  amount: number;
  event: EventDetail;
  tier: TicketTier;
  quantity: number;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [holderName, setHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const formatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(.{4})/g, "$1 ").trim();
  };
  const formatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 3)
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  };

  const handlePay = () => {
    const rawCard = cardNumber.replace(/\s/g, "");
    if (
      rawCard.length < 16 ||
      expiry.length < 5 ||
      cvv.length < 3 ||
      !holderName.trim()
    ) {
      Alert.alert(
        "Informations incomplètes",
        "Veuillez remplir tous les champs de la carte.",
      );
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 2000);
  };

  // Déterminer le type de carte
  const cardType = cardNumber.startsWith("4")
    ? "visa"
    : cardNumber.startsWith("5")
      ? "mastercard"
      : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bgLight }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <LinearGradient
          colors={[C.indigo, C.violet]}
          style={[pay.header, { paddingTop: insets.top + 16 }]}
        >
          <TouchableOpacity
            onPress={onBack}
            style={pay.headerBack}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={pay.headerTitle}>Carte bancaire</Text>
            <Text style={pay.headerSub}>Visa / Mastercard</Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Montant */}
        <LinearGradient
          colors={["rgba(99,102,241,0.1)", "rgba(124,58,237,0.05)"]}
          style={pay.amountCard}
        >
          <Text style={pay.amountLabel}>Total à payer</Text>
          <Text style={[pay.amountValue, { color: C.indigo }]}>
            {amount.toLocaleString()} FCFA
          </Text>
          <Text style={pay.amountEvent} numberOfLines={1}>
            {event.title} · {quantity}× {tier.name}
          </Text>
        </LinearGradient>

        <View style={pay.body}>
          {/* Carte preview */}
          <LinearGradient
            colors={[C.indigo, C.violet]}
            style={pay.cardPreview}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={pay.cardPreviewTop}>
              <View style={pay.cardChip} />
              <Text style={pay.cardTypeLabel}>
                {cardType === "visa"
                  ? "VISA"
                  : cardType === "mastercard"
                    ? "MC"
                    : ""}
              </Text>
            </View>
            <Text style={pay.cardNumberPreview}>
              {cardNumber || "•••• •••• •••• ••••"}
            </Text>
            <View style={pay.cardPreviewBottom}>
              <View>
                <Text style={pay.cardPreviewHint}>Titulaire</Text>
                <Text style={pay.cardPreviewValue}>
                  {holderName || "NOM PRÉNOM"}
                </Text>
              </View>
              <View>
                <Text style={pay.cardPreviewHint}>Expire</Text>
                <Text style={pay.cardPreviewValue}>{expiry || "MM/AA"}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Formulaire */}
          <Text style={pay.sectionLabel}>Numéro de carte</Text>
          <View style={pay.inputRow}>
            <TextInput
              style={[pay.inputField, { flex: 1 }]}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={(v) => setCardNumber(formatCardNumber(v))}
              maxLength={19}
            />
          </View>

          <Text style={pay.sectionLabel}>Titulaire de la carte</Text>
          <TextInput
            style={pay.inputField}
            placeholder="NOM PRÉNOM"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            value={holderName}
            onChangeText={setHolderName}
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={pay.sectionLabel}>Date d'expiration</Text>
              <TextInput
                style={pay.inputField}
                placeholder="MM/AA"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={expiry}
                onChangeText={(v) => setExpiry(formatExpiry(v))}
                maxLength={5}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={pay.sectionLabel}>CVV</Text>
              <TextInput
                style={pay.inputField}
                placeholder="•••"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                secureTextEntry
                value={cvv}
                onChangeText={setCvv}
                maxLength={3}
              />
            </View>
          </View>

          <View style={pay.infoBox}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={C.emerald}
            />
            <Text style={[pay.infoText, { color: C.emerald }]}>
              Vos données sont chiffrées et sécurisées par Tikety Pay (SSL
              256-bit)
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={[pay.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          onPress={handlePay}
          activeOpacity={0.88}
          disabled={loading}
        >
          <LinearGradient
            colors={[C.indigo, C.violet]}
            style={pay.ctaBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <Text style={pay.ctaBtnText}>Traitement en cours...</Text>
            ) : (
              <>
                <Ionicons name="card-outline" size={18} color="#fff" />
                <Text style={pay.ctaBtnText}>
                  Payer {amount.toLocaleString()} FCFA
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <Text style={pay.secureNote}>🔒 Paiement sécurisé par Tikety Pay</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Tier Purchase Modal ────────────────────────
function PurchaseModal({
  event,
  onClose,
}: {
  event: EventDetail;
  onClose: () => void;
}) {
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<
    "choose" | "confirm" | "mobilemoney" | "card"
  >("choose");
  const [selectedPayment, setSelectedPayment] = useState<
    "mobilemoney" | "card"
  >("mobilemoney");
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const total = selectedTier ? selectedTier.price * quantity : 0;
  const commission = Math.round(total * 0.05);
  const grand = total + commission;

  const handleSuccess = () => {
    handleClose();
    setTimeout(() => {
      Alert.alert(
        "✅ Réservation confirmée !",
        `Votre commande de ${quantity} billet(s) ${selectedTier?.name} pour "${event.title}" est confirmée. Vous recevrez votre billet par email.`,
        [{ text: "Voir mes billets", onPress: () => {} }],
      );
    }, 400);
  };

  // Si on est sur une page de paiement, rendre la page en plein écran
  if (step === "mobilemoney" && selectedTier) {
    return (
      <Modal
        visible
        transparent={false}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setStep("confirm")}
      >
        <MobileMoneyPage
          amount={grand}
          event={event}
          tier={selectedTier}
          quantity={quantity}
          onBack={() => setStep("confirm")}
          onSuccess={handleSuccess}
        />
      </Modal>
    );
  }

  if (step === "card" && selectedTier) {
    return (
      <Modal
        visible
        transparent={false}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setStep("confirm")}
      >
        <CardPaymentPage
          amount={grand}
          event={event}
          tier={selectedTier}
          quantity={quantity}
          onBack={() => setStep("confirm")}
          onSuccess={handleSuccess}
        />
      </Modal>
    );
  }

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View style={[pm.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[pm.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={pm.handle} />

          {step === "choose" ? (
            <>
              <Text style={pm.title}>Choisir vos billets</Text>
              <Text style={pm.sub}>{event.title}</Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: height * 0.55 }}
              >
                {event.tiers.map((tier) => {
                  const isSelected = selectedTier?.id === tier.id;
                  const isSoldOut = tier.available === 0;
                  const pct = Math.round(
                    ((tier.total - tier.available) / tier.total) * 100,
                  );
                  return (
                    <TouchableOpacity
                      key={tier.id}
                      onPress={() => !isSoldOut && setSelectedTier(tier)}
                      activeOpacity={isSoldOut ? 1 : 0.85}
                    >
                      <View
                        style={[
                          pm.tierCard,
                          isSelected && pm.tierCardSelected,
                          isSoldOut && pm.tierCardSoldOut,
                        ]}
                      >
                        {isSelected && (
                          <LinearGradient
                            colors={tier.gradient}
                            style={pm.tierSelectedBorder}
                          />
                        )}
                        <View style={pm.tierTop}>
                          <View style={{ flex: 1 }}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <LinearGradient
                                colors={tier.gradient}
                                style={pm.tierDot}
                              />
                              <Text
                                style={[pm.tierName, isSoldOut && pm.textMuted]}
                              >
                                {tier.name}
                              </Text>
                              {isSoldOut && (
                                <View style={pm.soldOutBadge}>
                                  <Text style={pm.soldOutText}>Complet</Text>
                                </View>
                              )}
                              {!isSoldOut && tier.available <= 10 && (
                                <View style={pm.urgentBadge}>
                                  <Text style={pm.urgentText}>
                                    ⚡ {tier.available} restants
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={pm.tierDesc}>{tier.description}</Text>
                          </View>
                          <View style={{ alignItems: "flex-end" }}>
                            <Text style={[pm.tierPrice, { color: tier.color }]}>
                              {tier.price === 0
                                ? "Gratuit"
                                : `${tier.price.toLocaleString()} F`}
                            </Text>
                            <Text style={pm.tierPerPerson}>/ pers.</Text>
                          </View>
                        </View>

                        <View style={pm.tierProgress}>
                          <View style={pm.tierProgressTrack}>
                            <LinearGradient
                              colors={tier.gradient}
                              style={[
                                pm.tierProgressFill,
                                { width: `${pct}%` as any },
                              ]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                            />
                          </View>
                          <Text style={pm.tierProgressLabel}>
                            {tier.available} / {tier.total}
                          </Text>
                        </View>

                        <View style={pm.tierPerks}>
                          {tier.perks.slice(0, 3).map((p, i) => (
                            <View key={i} style={pm.perkItem}>
                              <Ionicons
                                name="checkmark-circle"
                                size={12}
                                color={tier.color}
                              />
                              <Text style={pm.perkText}>{p}</Text>
                            </View>
                          ))}
                          {tier.perks.length > 3 && (
                            <Text style={pm.perkMore}>
                              +{tier.perks.length - 3} avantages
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 8 }} />
              </ScrollView>

              {selectedTier && (
                <View style={pm.quantityRow}>
                  <View style={pm.qtyControl}>
                    <TouchableOpacity
                      onPress={() => quantity > 1 && setQuantity((q) => q - 1)}
                      style={pm.qtyBtn}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="remove" size={18} color={C.textMid} />
                    </TouchableOpacity>
                    <Text style={pm.qtyValue}>{quantity}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        quantity < Math.min(selectedTier.available, 10) &&
                        setQuantity((q) => q + 1)
                      }
                      style={pm.qtyBtn}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={18} color={C.textMid} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => setStep("confirm")}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={selectedTier.gradient}
                      style={pm.ctaBtn}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={pm.ctaBtnText}>
                        Continuer ·{" "}
                        {(selectedTier.price * quantity).toLocaleString()} F
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            /* Step confirm */
            <>
              <TouchableOpacity
                onPress={() => setStep("choose")}
                style={pm.backBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={18} color={C.textMid} />
                <Text style={pm.backBtnText}>Modifier</Text>
              </TouchableOpacity>
              <Text style={pm.title}>Récapitulatif</Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: height * 0.65 }}
              >
                <LinearGradient
                  colors={["rgba(99,102,241,0.06)", "rgba(124,58,237,0.03)"]}
                  style={pm.recapCard}
                >
                  <Text style={pm.recapEvent} numberOfLines={2}>
                    {event.title}
                  </Text>
                  <Text style={pm.recapMeta}>
                    {event.date} · {event.time} · {event.location}
                  </Text>

                  <View style={pm.recapDivider} />

                  {[
                    { label: "Catégorie", value: selectedTier!.name },
                    { label: "Quantité", value: `${quantity} billet(s)` },
                    {
                      label: "Prix unitaire",
                      value: `${selectedTier!.price.toLocaleString()} FCFA`,
                    },
                    {
                      label: "Sous-total",
                      value: `${total.toLocaleString()} FCFA`,
                    },
                    {
                      label: "Commission Tikety (5%)",
                      value: `${commission.toLocaleString()} FCFA`,
                    },
                  ].map((item) => (
                    <View key={item.label} style={pm.recapRow}>
                      <Text style={pm.recapLabel}>{item.label}</Text>
                      <Text style={pm.recapValue}>{item.value}</Text>
                    </View>
                  ))}

                  <View style={pm.recapDivider} />
                  <View style={pm.recapRow}>
                    <Text
                      style={[
                        pm.recapLabel,
                        { fontWeight: "800", color: C.textDark },
                      ]}
                    >
                      Total à payer
                    </Text>
                    <Text
                      style={[pm.recapValue, { fontSize: 16, color: C.indigo }]}
                    >
                      {grand.toLocaleString()} FCFA
                    </Text>
                  </View>
                </LinearGradient>

                {/* Moyens de paiement — CLIQUABLES */}
                <Text style={pm.payTitle}>Moyen de paiement</Text>
                <View style={pm.payMethods}>
                  <TouchableOpacity
                    onPress={() => setSelectedPayment("mobilemoney")}
                    style={[
                      pm.payMethod,
                      selectedPayment === "mobilemoney" && pm.payMethodSelected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        selectedPayment === "mobilemoney"
                          ? [C.amber, C.pink]
                          : [C.sand, C.cream]
                      }
                      style={pm.payMethodIcon}
                    >
                      <Ionicons
                        name="phone-portrait-outline"
                        size={18}
                        color={
                          selectedPayment === "mobilemoney" ? "#fff" : C.textMid
                        }
                      />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={pm.payMethodLabel}>Mobile Money</Text>
                      <Text style={pm.payMethodSub}>MTN / Orange / Wave</Text>
                    </View>
                    <View
                      style={[
                        pm.radioOuter,
                        selectedPayment === "mobilemoney" && {
                          borderColor: C.amber,
                        },
                      ]}
                    >
                      {selectedPayment === "mobilemoney" && (
                        <View
                          style={[pm.radioInner, { backgroundColor: C.amber }]}
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setSelectedPayment("card")}
                    style={[
                      pm.payMethod,
                      selectedPayment === "card" && pm.payMethodSelectedCard,
                    ]}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        selectedPayment === "card"
                          ? [C.indigo, C.violet]
                          : [C.sand, C.cream]
                      }
                      style={pm.payMethodIcon}
                    >
                      <Ionicons
                        name="card-outline"
                        size={18}
                        color={selectedPayment === "card" ? "#fff" : C.textMid}
                      />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={pm.payMethodLabel}>Carte bancaire</Text>
                      <Text style={pm.payMethodSub}>Visa / Mastercard</Text>
                    </View>
                    <View
                      style={[
                        pm.radioOuter,
                        selectedPayment === "card" && { borderColor: C.indigo },
                      ]}
                    >
                      {selectedPayment === "card" && (
                        <View
                          style={[pm.radioInner, { backgroundColor: C.indigo }]}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => setStep(selectedPayment)}
                  activeOpacity={0.88}
                  style={pm.payBtn}
                >
                  <LinearGradient
                    colors={
                      selectedPayment === "mobilemoney"
                        ? [C.amber, C.pink]
                        : [C.indigo, C.violet]
                    }
                    style={pm.payBtnGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="lock-closed" size={16} color="#fff" />
                    <Text style={pm.payBtnText}>
                      Payer {grand.toLocaleString()} FCFA
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={pm.secureNote}>
                  🔒 Paiement sécurisé par Tikety Pay
                </Text>
                <View style={{ height: 8 }} />
              </ScrollView>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ════════════════════════════════════════════════
//  PAGE PRINCIPALE
// ════════════════════════════════════════════════
export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event: EventDetail = EVENTS_DB[id ?? "1"] ?? DEFAULT_EVENT;
  const insets = useSafeAreaInsets();

  const [isFav, setIsFav] = useState(event.isFavorited);
  const [showPurchase, setShowPurchase] = useState(false);
  const [expandDesc, setExpandDesc] = useState(false);
  const [activeGallery, setActiveGallery] = useState(0);

  const scrollY = useRef(new Animated.Value(0)).current;
  const favScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Hauteur header safe
  const HEADER_H = insets.top + 52;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleFav = () => {
    setIsFav((f) => !f);
    Animated.sequence([
      Animated.spring(favScale, {
        toValue: 1.4,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(favScale, {
        toValue: 1.0,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleShare = () => {
    Share.share({
      message: `🎟️ ${event.title}\n${event.date} · ${event.time}\n📍 ${event.location}\n\nAchetez vos billets sur Tikety !`,
      title: event.title,
    });
  };

  const pct = Math.round((event.ticketsSold / event.totalTickets) * 100);
  const remaining = event.totalTickets - event.ticketsSold;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, BANNER_H - 80],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const bannerScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.15, 1],
    extrapolate: "clamp",
  });
  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, BANNER_H],
    outputRange: [1, 0.3],
    extrapolate: "clamp",
  });

  const sponsorColors: Record<string, string> = {
    or: C.amber,
    argent: "#9CA3AF",
    bronze: "#B45309",
  };

  // Hauteur footer : safe area + contenu
  const FOOTER_H = insets.bottom + 80;

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ── HEADER FLOTTANT (visible en scroll) ── */}
      <Animated.View
        style={[
          s.floatingHeader,
          { opacity: headerOpacity, paddingTop: insets.top },
        ]}
      >
        <LinearGradient
          colors={event.gradient}
          style={s.floatingHeaderBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={s.floatingBackBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={s.floatingTitle} numberOfLines={1}>
            {event.title}
          </Text>
          <TouchableOpacity
            onPress={handleShare}
            style={s.floatingActionBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* ── BOUTONS TOP (toujours visibles sur bannière) ── */}
      <View style={[s.topBtns, { top: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.topBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={handleShare}
            style={s.topBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <Animated.View style={{ transform: [{ scale: favScale }] }}>
            <TouchableOpacity
              onPress={toggleFav}
              style={s.topBtn}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isFav ? "heart" : "heart-outline"}
                size={20}
                color={isFav ? C.pink : "#fff"}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* ── PURCHASE MODAL ── */}
      {showPurchase && (
        <PurchaseModal event={event} onClose={() => setShowPurchase(false)} />
      )}

      <Animated.ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        // Pas de contentInsetAdjustmentBehavior pour éviter le décalage
        contentInsetAdjustmentBehavior="never"
      >
        {/* ════ BANNIÈRE ════ */}
        <Animated.View
          style={[
            s.banner,
            { transform: [{ scale: bannerScale }], opacity: bannerOpacity },
          ]}
        >
          <Image
            source={{ uri: event.image }}
            style={s.bannerImg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.9)"]}
            style={s.bannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Badge catégorie + statut dispo — positionné par rapport à insets */}
          <View style={[s.bannerBadges, { top: insets.top + 64 }]}>
            <LinearGradient colors={event.gradient} style={s.catBadge}>
              <Text style={s.catBadgeText}>{event.category.toUpperCase()}</Text>
            </LinearGradient>
            {remaining <= 20 && remaining > 0 && (
              <View style={s.urgentBannerBadge}>
                <Ionicons name="flash" size={12} color={C.amber} />
                <Text style={s.urgentBannerText}>
                  Plus que {remaining} places !
                </Text>
              </View>
            )}
            {remaining === 0 && (
              <View
                style={[
                  s.urgentBannerBadge,
                  { backgroundColor: "rgba(239,68,68,0.85)" },
                ]}
              >
                <Text style={[s.urgentBannerText, { color: "#fff" }]}>
                  Complet
                </Text>
              </View>
            )}
          </View>

          {/* Infos bas bannière */}
          <View style={s.bannerInfo}>
            <Text style={s.bannerTitle}>{event.title}</Text>
            <View style={s.bannerMeta}>
              <View style={s.bannerMetaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={s.bannerMetaText}>{event.date}</Text>
              </View>
              <Text style={s.bannerMetaDot}>·</Text>
              <View style={s.bannerMetaItem}>
                <Ionicons
                  name="time-outline"
                  size={13}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={s.bannerMetaText}>
                  {event.time}
                  {event.timeEnd ? ` — ${event.timeEnd}` : ""}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ════ CONTENU ════ */}
        <Animated.View
          style={[
            s.body,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* ── INFOS RAPIDES ── */}
          <View style={s.quickInfoRow}>
            {[
              {
                icon: "location",
                label: "Lieu",
                value: event.location,
                color: C.pink,
              },
              {
                icon: "people",
                label: "Places",
                value: `${event.ticketsSold}/${event.totalTickets}`,
                color: C.emerald,
              },
              {
                icon: "cash",
                label: "Prix",
                value:
                  event.price === 0
                    ? "Gratuit"
                    : `dès ${event.price.toLocaleString()} F`,
                color: C.amber,
              },
            ].map((item) => (
              <View key={item.label} style={s.quickInfoItem}>
                <LinearGradient
                  colors={[item.color + "22", item.color + "11"]}
                  style={s.quickInfoIcon}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={item.color}
                  />
                </LinearGradient>
                <Text style={s.quickInfoLabel}>{item.label}</Text>
                <Text style={s.quickInfoValue} numberOfLines={1}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          {/* ── BARRE DE PROGRESSION BILLETS ── */}
          <View style={s.card}>
            <View style={s.cardHeaderRow}>
              <Text style={s.cardTitle}>Disponibilité</Text>
              <Text style={s.availBadge}>
                {remaining > 0 ? `${remaining} restants` : "Complet"}
              </Text>
            </View>
            <View style={s.progressTrack}>
              <LinearGradient
                colors={pct > 80 ? [C.red, C.pink] : event.gradient}
                style={[s.progressFill, { width: `${pct}%` as any }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <View style={s.progressLabels}>
              <Text style={s.progressSub}>{event.ticketsSold} vendus</Text>
              <Text
                style={[
                  s.progressSub,
                  pct > 80 && { color: C.red, fontWeight: "700" },
                ]}
              >
                {pct}% complet
              </Text>
            </View>
          </View>

          {/* ── DESCRIPTION ── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>À propos</Text>
            <Text style={s.descText} numberOfLines={expandDesc ? undefined : 3}>
              {event.longDescription}
            </Text>
            <TouchableOpacity
              onPress={() => setExpandDesc((e) => !e)}
              style={s.readMoreBtn}
              activeOpacity={0.8}
            >
              <Text style={s.readMoreText}>
                {expandDesc ? "Voir moins" : "Lire plus"}
              </Text>
              <Ionicons
                name={expandDesc ? "chevron-up" : "chevron-down"}
                size={14}
                color={C.indigo}
              />
            </TouchableOpacity>
            <View style={s.tagsRow}>
              {event.tags.map((tag) => (
                <View key={tag} style={s.tag}>
                  <Text style={s.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── GALERIE PHOTOS ── */}
          {event.gallery.length > 0 && (
            <View style={s.gallerySection}>
              <Text style={s.sectionTitle}>Galerie</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.galleryScroll}
                onScroll={(e) =>
                  setActiveGallery(
                    Math.round(
                      e.nativeEvent.contentOffset.x / (width * 0.62 + 10),
                    ),
                  )
                }
                scrollEventThrottle={16}
              >
                {[event.image, ...event.gallery].map((img, i) => (
                  <View
                    key={i}
                    style={[
                      s.galleryItem,
                      i === activeGallery && s.galleryItemActive,
                    ]}
                  >
                    <Image
                      source={{ uri: img }}
                      style={s.galleryImg}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>
              <View style={s.galleryDots}>
                {[event.image, ...event.gallery].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      s.galleryDot,
                      i === activeGallery && s.galleryDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ── PROGRAMME ── */}
          {event.program.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Programme</Text>
              <View style={s.programList}>
                {event.program.map((item, i) => (
                  <View key={i} style={s.programItem}>
                    <View style={s.programTimeline}>
                      <LinearGradient
                        colors={event.gradient}
                        style={s.programDot}
                      />
                      {i < event.program.length - 1 && (
                        <View style={s.programLine} />
                      )}
                    </View>
                    <View style={s.programContent}>
                      <View style={s.programTimeRow}>
                        <LinearGradient
                          colors={[
                            "rgba(99,102,241,0.12)",
                            "rgba(124,58,237,0.06)",
                          ]}
                          style={s.programTimeBadge}
                        >
                          <Text style={s.programTime}>{item.time}</Text>
                        </LinearGradient>
                      </View>
                      <Text style={s.programTitle}>{item.title}</Text>
                      {item.speaker && (
                        <View style={s.programSpeaker}>
                          <Ionicons
                            name="person-outline"
                            size={11}
                            color={C.textMid}
                          />
                          <Text style={s.programSpeakerText}>
                            {item.speaker}
                          </Text>
                        </View>
                      )}
                      {item.description && (
                        <Text style={s.programDesc}>{item.description}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── TARIFS ── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Tarifs & Catégories</Text>
            {event.tiers.map((tier) => {
              const isSoldOut = tier.available === 0;
              const pctSold = Math.round(
                ((tier.total - tier.available) / tier.total) * 100,
              );
              return (
                <View
                  key={tier.id}
                  style={[s.tierRow, isSoldOut && s.tierRowSoldOut]}
                >
                  <LinearGradient colors={tier.gradient} style={s.tierBadge}>
                    <Text style={s.tierBadgeText}>{tier.name}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1, paddingHorizontal: 12 }}>
                    <Text style={s.tierDesc}>{tier.description}</Text>
                    <View style={s.tierProgressTrack}>
                      <LinearGradient
                        colors={
                          isSoldOut ? ["#E5E7EB", "#E5E7EB"] : tier.gradient
                        }
                        style={[
                          s.tierProgressFill,
                          { width: `${pctSold}%` as any },
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={[
                        s.tierPrice,
                        { color: isSoldOut ? "#9CA3AF" : tier.color },
                      ]}
                    >
                      {isSoldOut
                        ? "Complet"
                        : tier.price === 0
                          ? "Gratuit"
                          : `${tier.price.toLocaleString()} F`}
                    </Text>
                    {!isSoldOut && (
                      <Text style={s.tierAvail}>{tier.available} restants</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── LIEU & CARTE ── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Lieu</Text>
            <View style={s.locationRow}>
              <LinearGradient colors={event.gradient} style={s.locationIcon}>
                <Ionicons name="location" size={18} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={s.locationName}>{event.location}</Text>
                <Text style={s.locationAddress}>{event.address}</Text>
              </View>
              <TouchableOpacity style={s.mapBtn} activeOpacity={0.8}>
                <LinearGradient
                  colors={[C.indigo, C.violet]}
                  style={s.mapBtnGrad}
                >
                  <Ionicons name="navigate-outline" size={14} color="#fff" />
                  <Text style={s.mapBtnText}>Y aller</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={s.mapPlaceholder}>
              <LinearGradient
                colors={["#E0E7FF", "#EDE9FE", "#F0FDF4"]}
                style={s.mapGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {[...Array(6)].map((_, i) => (
                  <View
                    key={`h${i}`}
                    style={[
                      s.mapGridLine,
                      {
                        top: `${15 + i * 13}%` as any,
                        left: 0,
                        right: 0,
                        height: 1,
                      },
                    ]}
                  />
                ))}
                {[...Array(5)].map((_, i) => (
                  <View
                    key={`v${i}`}
                    style={[
                      s.mapGridLine,
                      {
                        left: `${10 + i * 20}%` as any,
                        top: 0,
                        bottom: 0,
                        width: 1,
                      },
                    ]}
                  />
                ))}
                <View style={s.mapRoad} />
                <View style={s.mapPin}>
                  <LinearGradient
                    colors={event.gradient}
                    style={s.mapPinCircle}
                  >
                    <Ionicons name="location" size={16} color="#fff" />
                  </LinearGradient>
                  <View
                    style={[
                      s.mapPinTail,
                      { borderTopColor: event.gradient[0] },
                    ]}
                  />
                </View>
                <View style={s.mapLabel}>
                  <Text style={s.mapLabelText}>{event.location}</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* ── ORGANISATEUR ── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Organisateur</Text>
            <View style={s.organizerRow}>
              <Image
                source={{ uri: event.organizer.avatar }}
                style={s.organizerAvatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={s.organizerName}>{event.organizer.name}</Text>
                {event.organizer.slogan && (
                  <Text style={s.organizerSlogan}>
                    « {event.organizer.slogan} »
                  </Text>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  <Stars rating={event.organizer.rating} size={12} />
                  <Text style={s.organizerRating}>
                    {event.organizer.rating}/5
                  </Text>
                  <Text style={s.organizerEvents}>
                    · {event.organizer.eventsCount} événements
                  </Text>
                </View>
              </View>
            </View>
            <View style={s.organizerContacts}>
              {[
                { icon: "call-outline", value: event.organizer.phone },
                { icon: "mail-outline", value: event.organizer.email },
                ...(event.organizer.website
                  ? [{ icon: "globe-outline", value: event.organizer.website }]
                  : []),
              ].map((c, i) => (
                <View key={i} style={s.contactItem}>
                  <LinearGradient colors={event.gradient} style={s.contactIcon}>
                    <Ionicons name={c.icon as any} size={12} color="#fff" />
                  </LinearGradient>
                  <Text style={s.contactText}>{c.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── SPONSORS ── */}
          {event.sponsors.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Partenaires & Sponsors</Text>
              {(["or", "argent", "bronze"] as const).map((tier) => {
                const tierSponsors = event.sponsors.filter(
                  (sp) => sp.tier === tier,
                );
                if (!tierSponsors.length) return null;
                const labels = {
                  or: "🥇 Sponsor Or",
                  argent: "🥈 Sponsor Argent",
                  bronze: "🥉 Sponsor Bronze",
                };
                return (
                  <View key={tier} style={s.sponsorTierBlock}>
                    <Text
                      style={[
                        s.sponsorTierLabel,
                        { color: sponsorColors[tier] },
                      ]}
                    >
                      {labels[tier]}
                    </Text>
                    <View style={s.sponsorRow}>
                      {tierSponsors.map((sp, i) => (
                        <LinearGradient
                          key={i}
                          colors={[
                            sponsorColors[tier] + "22",
                            sponsorColors[tier] + "11",
                          ]}
                          style={[
                            s.sponsorPill,
                            { borderColor: sponsorColors[tier] + "44" },
                          ]}
                        >
                          <Text
                            style={[
                              s.sponsorName,
                              { color: sponsorColors[tier] },
                            ]}
                          >
                            {sp.name}
                          </Text>
                        </LinearGradient>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* ── AVIS ── */}
          {event.reviews.length > 0 && (
            <View style={s.card}>
              <View style={s.reviewsHeader}>
                <Text style={s.cardTitle}>Avis</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Stars rating={event.organizer.rating} size={13} />
                  <Text style={s.reviewsAvg}>{event.organizer.rating} / 5</Text>
                  <Text style={s.reviewsCount}>
                    ({event.reviews.length} avis)
                  </Text>
                </View>
              </View>
              {event.reviews.map((review) => (
                <View key={review.id} style={s.reviewCard}>
                  <View style={s.reviewTop}>
                    <Image
                      source={{ uri: review.avatar }}
                      style={s.reviewAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={s.reviewAuthor}>{review.author}</Text>
                        <Text style={s.reviewDate}>{review.date}</Text>
                      </View>
                      <Stars rating={review.rating} size={12} />
                    </View>
                  </View>
                  <Text style={s.reviewComment}>{review.comment}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Espace pour le CTA flottant */}
          <View style={{ height: FOOTER_H + 20 }} />
        </Animated.View>
      </Animated.ScrollView>

      {/* ── CTA FLOTTANT ACHETER ── */}
      <View
        style={[
          s.ctaBar,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 },
        ]}
      >
        <LinearGradient
          colors={["rgba(241,240,255,0)", C.bgLight, C.bgLight]}
          style={s.ctaBarBg}
        >
          <View style={s.ctaBarInner}>
            <View>
              <Text style={s.ctaPrice}>
                {event.price === 0
                  ? "Gratuit"
                  : `dès ${event.price.toLocaleString()} FCFA`}
              </Text>
              <Text style={s.ctaPriceSub}>{event.priceLabel}</Text>
            </View>
            <TouchableOpacity
              style={[s.ctaButton, remaining === 0 && s.ctaButtonDisabled]}
              onPress={() => remaining > 0 && setShowPurchase(true)}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={
                  remaining === 0 ? ["#9CA3AF", "#6B7280"] : event.gradient
                }
                style={s.ctaButtonGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons
                  name={remaining === 0 ? "ban-outline" : "ticket-outline"}
                  size={18}
                  color="#fff"
                />
                <Text style={s.ctaButtonText}>
                  {remaining === 0 ? "Complet" : "Acheter un billet"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}

// ════════════════════════════════════════════════
//  STYLES PAYMENT PAGES
// ════════════════════════════════════════════════
const pay = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  headerBack: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  amountCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.1)",
  },
  amountLabel: { fontSize: 12, color: C.textGray, marginBottom: 4 },
  amountValue: {
    fontSize: 28,
    fontWeight: "900",
    color: C.amber,
    marginBottom: 4,
  },
  amountEvent: { fontSize: 12, color: C.textGray, textAlign: "center" },
  body: { paddingHorizontal: 16, paddingTop: 8 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textDark,
    marginBottom: 8,
    marginTop: 16,
  },
  // Operators
  operatorsRow: { gap: 10 },
  operatorBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
  },
  operatorDot: { width: 12, height: 12, borderRadius: 6 },
  operatorLabel: { fontSize: 14, fontWeight: "700", flex: 1 },
  // Phone input
  inputWrapper: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.sand,
    overflow: "hidden",
    alignItems: "center",
  },
  inputFlag: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: C.cream,
    borderRightWidth: 1,
    borderRightColor: C.sand,
  },
  inputFlagText: { fontSize: 13, fontWeight: "700", color: C.textDark },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "600",
    color: C.textDark,
  },
  // Info box
  infoBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: C.cream,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    alignItems: "flex-start",
  },
  infoText: { fontSize: 12, color: C.textGray, flex: 1, lineHeight: 18 },
  // Card preview
  cardPreview: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 4,
    height: 180,
    justifyContent: "space-between",
  },
  cardPreviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardChip: {
    width: 34,
    height: 26,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  cardTypeLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: "rgba(255,255,255,0.9)",
  },
  cardNumberPreview: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 3,
    textAlign: "center",
  },
  cardPreviewBottom: { flexDirection: "row", justifyContent: "space-between" },
  cardPreviewHint: {
    fontSize: 9,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  cardPreviewValue: { fontSize: 13, fontWeight: "700", color: "#fff" },
  // Input field
  inputField: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.sand,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "600",
    color: C.textDark,
  },
  inputRow: { flexDirection: "row", gap: 12 },
  // CTA
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: C.bgLight,
    borderTopWidth: 1,
    borderTopColor: C.sand,
  },
  ctaBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  secureNote: {
    textAlign: "center",
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 8,
  },
});

// ════════════════════════════════════════════════
//  STYLES PURCHASE MODAL
// ════════════════════════════════════════════════
const pm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.bgLight,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: height * 0.92,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: C.textDark,
    marginBottom: 4,
  },
  sub: { fontSize: 13, color: C.textGray, marginBottom: 18 },
  tierCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: C.sand,
    shadowColor: C.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tierCardSelected: { borderColor: "transparent" },
  tierCardSoldOut: { opacity: 0.55 },
  tierSelectedBorder: {
    position: "absolute",
    inset: -2,
    borderRadius: 18,
    zIndex: -1,
  } as any,
  tierTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  tierDot: { width: 12, height: 12, borderRadius: 6, marginTop: 2 },
  tierName: { fontSize: 15, fontWeight: "800", color: C.textDark },
  tierDesc: { fontSize: 12, color: C.textGray, marginTop: 2 },
  tierPrice: { fontSize: 17, fontWeight: "900" },
  tierPerPerson: { fontSize: 10, color: "#9CA3AF" },
  soldOutBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  soldOutText: { fontSize: 10, color: "#6B7280", fontWeight: "600" },
  urgentBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  urgentText: { fontSize: 10, color: "#D97706", fontWeight: "700" },
  tierProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  tierProgressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 2,
    overflow: "hidden",
  },
  tierProgressFill: { height: "100%", borderRadius: 2 },
  tierProgressLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    width: 48,
    textAlign: "right",
  },
  tierPerks: { gap: 4 },
  perkItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  perkText: { fontSize: 11, color: C.textGray },
  perkMore: { fontSize: 11, color: C.textMid, fontWeight: "600", marginTop: 2 },
  textMuted: { color: "#9CA3AF" },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.sand,
    overflow: "hidden",
  },
  qtyBtn: {
    width: 40,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyValue: {
    width: 36,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: C.textDark,
  },
  ctaBtn: {
    flex: 1,
    borderRadius: 13,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
  },
  backBtnText: { fontSize: 13, fontWeight: "600", color: C.textMid },
  recapCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.1)",
  },
  recapEvent: {
    fontSize: 15,
    fontWeight: "800",
    color: C.textDark,
    marginBottom: 2,
  },
  recapMeta: { fontSize: 11, color: C.textGray, marginBottom: 12 },
  recapDivider: { height: 1, backgroundColor: C.sand, marginVertical: 10 },
  recapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  recapLabel: { fontSize: 12, color: C.textGray },
  recapValue: { fontSize: 12, fontWeight: "700", color: C.textDark },
  payTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.textDark,
    marginBottom: 10,
  },
  payMethods: { gap: 10, marginBottom: 16 },
  payMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: C.sand,
  },
  payMethodSelected: { borderColor: C.amber },
  payMethodSelectedCard: { borderColor: C.indigo },
  payMethodIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  payMethodLabel: { fontSize: 13, fontWeight: "700", color: C.textDark },
  payMethodSub: { fontSize: 11, color: C.textGray },
  // Radio button
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.sand,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  payBtn: { borderRadius: 14, overflow: "hidden", marginBottom: 12 },
  payBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 8,
  },
  payBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  secureNote: { textAlign: "center", fontSize: 12, color: "#9CA3AF" },
});

// ════════════════════════════════════════════════
//  STYLES PAGE
// ════════════════════════════════════════════════
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgLight },

  // Header flottant — zIndex haut, positionné dynamiquement via insets
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  floatingHeaderBg: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    gap: 12,
  },
  floatingBackBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingTitle: { flex: 1, color: "#fff", fontSize: 16, fontWeight: "800" },
  floatingActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Top btns — positionné dynamiquement
  topBtns: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "center",
    alignItems: "center",
  } as any,

  // Banner — commence depuis le haut de l'écran (0, pas de paddingTop)
  banner: { width, height: BANNER_H, position: "relative" },
  bannerImg: { width: "100%", height: "100%" },
  bannerGradient: { position: "absolute", inset: 0 } as any,
  bannerBadges: {
    position: "absolute",
    left: 16,
    flexDirection: "row",
    gap: 8,
  },
  catBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  catBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  urgentBannerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(245,158,11,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  urgentBannerText: { fontSize: 11, fontWeight: "700", color: C.textDark },
  bannerInfo: { position: "absolute", bottom: 20, left: 16, right: 16 },
  bannerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  bannerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  bannerMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  bannerMetaText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "600",
  },
  bannerMetaDot: { color: "rgba(255,255,255,0.5)", fontSize: 14 },

  // Body
  body: { paddingHorizontal: 16, paddingTop: 16 },

  // Quick info
  quickInfoRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  quickInfoItem: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.sand,
  },
  quickInfoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickInfoLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: 11,
    fontWeight: "800",
    color: C.textDark,
    textAlign: "center",
  },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.sand,
    shadowColor: C.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.textDark,
    marginBottom: 12,
  },
  availBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: C.emerald,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },

  // Progress
  progressTrack: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressSub: { fontSize: 11, color: "#9CA3AF", fontWeight: "500" },

  // Description
  descText: { fontSize: 14, color: C.textGray, lineHeight: 22 },
  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  readMoreText: { fontSize: 13, color: C.indigo, fontWeight: "700" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  tag: {
    backgroundColor: C.sand,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagText: { fontSize: 11, color: C.textMid, fontWeight: "600" },

  // Gallery
  gallerySection: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.textDark,
    marginBottom: 12,
  },
  galleryScroll: { gap: 10, paddingRight: 4 },
  galleryItem: {
    width: width * 0.62,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    opacity: 0.75,
  },
  galleryItemActive: {
    opacity: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  galleryImg: { width: "100%", height: "100%" },
  galleryDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
  },
  galleryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  galleryDotActive: { backgroundColor: C.indigo, width: 18 },

  // Programme
  programList: { gap: 0 },
  programItem: { flexDirection: "row", gap: 12, paddingBottom: 16 },
  programTimeline: { alignItems: "center", width: 16 },
  programDot: { width: 14, height: 14, borderRadius: 7, marginTop: 2 },
  programLine: { width: 2, flex: 1, backgroundColor: C.sand, marginTop: 4 },
  programContent: { flex: 1 },
  programTimeRow: { marginBottom: 4 },
  programTimeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  programTime: { fontSize: 11, fontWeight: "800", color: C.textMid },
  programTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textDark,
    marginBottom: 2,
  },
  programSpeaker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  programSpeakerText: { fontSize: 12, color: C.textMid, fontWeight: "600" },
  programDesc: { fontSize: 12, color: C.textGray, lineHeight: 18 },

  // Tarifs
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.sand,
  },
  tierRowSoldOut: { opacity: 0.5 },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    minWidth: 66,
    alignItems: "center",
  },
  tierBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  tierDesc: { fontSize: 12, color: C.textGray, marginBottom: 4 },
  tierProgressTrack: {
    height: 3,
    backgroundColor: "#F3F4F6",
    borderRadius: 2,
    overflow: "hidden",
  },
  tierProgressFill: { height: "100%", borderRadius: 2 },
  tierPrice: { fontSize: 14, fontWeight: "900" },
  tierAvail: { fontSize: 10, color: "#9CA3AF" },

  // Lieu
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  locationName: {
    fontSize: 14,
    fontWeight: "800",
    color: C.textDark,
    marginBottom: 2,
  },
  locationAddress: { fontSize: 12, color: C.textGray },
  mapBtn: { borderRadius: 10, overflow: "hidden" },
  mapBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  mapPlaceholder: {
    height: 160,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  mapGrad: { flex: 1 },
  mapGridLine: {
    position: "absolute",
    backgroundColor: "rgba(99,102,241,0.1)",
  },
  mapRoad: {
    position: "absolute",
    top: "45%",
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 4,
  } as any,
  mapPin: {
    position: "absolute",
    top: "28%",
    left: "48%",
    alignItems: "center",
  } as any,
  mapPinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  mapPinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  mapLabel: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mapLabelText: { fontSize: 11, fontWeight: "700", color: C.textDark },

  // Organisateur
  organizerRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  organizerAvatar: { width: 52, height: 52, borderRadius: 26 },
  organizerName: { fontSize: 15, fontWeight: "800", color: C.textDark },
  organizerSlogan: {
    fontSize: 11,
    color: C.textGray,
    fontStyle: "italic",
    marginTop: 2,
  },
  organizerRating: { fontSize: 11, color: C.amber, fontWeight: "700" },
  organizerEvents: { fontSize: 11, color: "#9CA3AF" },
  organizerContacts: { gap: 8 },
  contactItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  contactIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  contactText: { fontSize: 12, color: C.textGray, fontWeight: "500" },

  // Sponsors
  sponsorTierBlock: { marginBottom: 12 },
  sponsorTierLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  sponsorRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sponsorPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  sponsorName: { fontSize: 12, fontWeight: "700" },

  // Reviews
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewsAvg: { fontSize: 12, fontWeight: "700", color: C.amber },
  reviewsCount: { fontSize: 11, color: "#9CA3AF" },
  reviewCard: {
    backgroundColor: C.cream,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  reviewTop: { flexDirection: "row", gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewAuthor: { fontSize: 13, fontWeight: "700", color: C.textDark },
  reviewDate: { fontSize: 11, color: "#9CA3AF" },
  reviewComment: { fontSize: 13, color: C.textGray, lineHeight: 19 },

  // CTA bar — utilise paddingBottom dynamique via insets
  ctaBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  ctaBarBg: { paddingTop: 8 },
  ctaBarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 16,
  },
  ctaPrice: { fontSize: 20, fontWeight: "900", color: C.textDark },
  ctaPriceSub: { fontSize: 11, color: "#9CA3AF" },
  ctaButton: { flex: 1, borderRadius: 16, overflow: "hidden" },
  ctaButtonDisabled: { opacity: 0.6 },
  ctaButtonGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 8,
  },
  ctaButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
