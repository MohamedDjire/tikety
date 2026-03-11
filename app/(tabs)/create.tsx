/**
 * app/(tabs)/create.tsx
 * Formulaire de création d'événement — Tikety
 * 5 étapes + paiement de la frais de publication (5 000 FCFA)
 */

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// ── Palette (identique à event-detail) ─────────
const C = {
  indigo: "#6366F1",
  indigoDark: "#3730A3",
  indigoLight: "#818CF8",
  violet: "#7C3AED",
  pink: "#EC4899",
  amber: "#F59E0B",
  amberLight: "#FCD34D",
  emerald: "#10B981",
  emeraldDark: "#065F46",
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

// ── Constantes ──────────────────────────────────
const STEPS = ["Infos", "Billets", "Détails", "Programme", "Publier"];
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HOURS = Array.from({ length: 25 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const CREATION_FEE = 5000;

const ALL_CATEGORIES = [
  {
    id: "concert",
    label: "Concert",
    icon: "musical-notes",
    gradient: ["#EC4899", "#7C3AED"] as [string, string],
  },
  {
    id: "gala",
    label: "Gala",
    icon: "star",
    gradient: ["#6366F1", "#7C3AED"] as [string, string],
  },
  {
    id: "conference",
    label: "Conférence",
    icon: "laptop",
    gradient: ["#10B981", "#0891B2"] as [string, string],
  },
  {
    id: "festival",
    label: "Festival",
    icon: "color-palette",
    gradient: ["#F59E0B", "#EC4899"] as [string, string],
  },
  {
    id: "sport",
    label: "Sport",
    icon: "football",
    gradient: ["#10B981", "#6366F1"] as [string, string],
  },
  {
    id: "anniversaire",
    label: "Anniversaire",
    icon: "gift",
    gradient: ["#F59E0B", "#EF4444"] as [string, string],
  },
  {
    id: "mariage",
    label: "Mariage",
    icon: "heart",
    gradient: ["#EC4899", "#F59E0B"] as [string, string],
  },
  {
    id: "seminaire",
    label: "Séminaire",
    icon: "school",
    gradient: ["#6366F1", "#0891B2"] as [string, string],
  },
  {
    id: "formation",
    label: "Formation",
    icon: "book",
    gradient: ["#10B981", "#6366F1"] as [string, string],
  },
  {
    id: "soiree",
    label: "Soirée",
    icon: "moon",
    gradient: ["#7C3AED", "#EC4899"] as [string, string],
  },
  {
    id: "exposition",
    label: "Exposition",
    icon: "image",
    gradient: ["#0891B2", "#6366F1"] as [string, string],
  },
  {
    id: "networking",
    label: "Networking",
    icon: "people",
    gradient: ["#6366F1", "#10B981"] as [string, string],
  },
  {
    id: "autre",
    label: "Autre",
    icon: "apps",
    gradient: ["#6B7280", "#9CA3AF"] as [string, string],
  },
];

// ── Utilitaires calendrier ──────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

// ── Stars (comme event-detail) ──────────────────
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
//  CalendarPicker
// ════════════════════════════════════════════════
function CalendarPicker({
  visible,
  selectedDate,
  onSelect,
  onClose,
  minDate,
}: {
  visible: boolean;
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
  onClose: () => void;
  minDate?: Date;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    selectedDate?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    selectedDate?.getMonth() ?? today.getMonth(),
  );
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1,
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const limit = minDate ? new Date(minDate) : new Date();
    limit.setHours(0, 0, 0, 0);
    return d < limit;
  };
  const isSelected = (day: number) =>
    selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear;
  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  if (!visible) return null;
  const CELL_SIZE = (width - 40 - 32) / 7;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          },
          { opacity: fadeAnim },
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            {
              backgroundColor: "#fff",
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              paddingTop: 14,
              paddingHorizontal: 20,
              paddingBottom: 36,
            },
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#D1D5DB",
              alignSelf: "center",
              marginBottom: 20,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                viewMonth === 0
                  ? (setViewMonth(11), setViewYear((y) => y - 1))
                  : setViewMonth((m) => m - 1)
              }
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: C.sand,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="chevron-back" size={20} color={C.indigo} />
            </TouchableOpacity>
            <Text
              style={{ fontSize: 17, fontWeight: "800", color: C.textDark }}
            >
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity
              onPress={() =>
                viewMonth === 11
                  ? (setViewMonth(0), setViewYear((y) => y + 1))
                  : setViewMonth((m) => m + 1)
              }
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: C.sand,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="chevron-forward" size={20} color={C.indigo} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            {DAYS_SHORT.map((d) => (
              <Text
                key={d}
                style={{
                  width: CELL_SIZE,
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: "700",
                  color: C.textLight,
                }}
              >
                {d}
              </Text>
            ))}
          </View>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}
          >
            {cells.map((day, idx) => {
              if (!day)
                return (
                  <View
                    key={`e-${idx}`}
                    style={{ width: CELL_SIZE, height: CELL_SIZE + 4 }}
                  />
                );
              const past = isPast(day);
              const sel = isSelected(day);
              const tod = isToday(day);
              return (
                <TouchableOpacity
                  key={`d-${idx}`}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE + 4,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() =>
                    !past && onSelect(new Date(viewYear, viewMonth, day))
                  }
                  activeOpacity={past ? 1 : 0.75}
                >
                  {sel ? (
                    <LinearGradient
                      colors={[C.indigo, C.violet]}
                      style={{
                        width: CELL_SIZE - 4,
                        height: CELL_SIZE - 4,
                        borderRadius: (CELL_SIZE - 4) / 2,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "800",
                          color: "#fff",
                        }}
                      >
                        {day}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={{
                        width: CELL_SIZE - 4,
                        height: CELL_SIZE - 4,
                        borderRadius: (CELL_SIZE - 4) / 2,
                        justifyContent: "center",
                        alignItems: "center",
                        ...(tod
                          ? { borderWidth: 2, borderColor: C.indigo }
                          : {}),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: past ? "#D1D5DB" : tod ? C.indigo : C.textDark,
                        }}
                      >
                        {day}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{ borderRadius: 14, overflow: "hidden" }}
          >
            <LinearGradient
              colors={[C.indigo, C.violet]}
              style={{ paddingVertical: 14, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>
                Confirmer
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ════════════════════════════════════════════════
//  TimePicker
// ════════════════════════════════════════════════
function TimePicker({
  visible,
  hour,
  minute,
  onSelect,
  onClose,
}: {
  visible: boolean;
  hour: number;
  minute: number;
  onSelect: (h: number, m: number) => void;
  onClose: () => void;
}) {
  const [selH, setSelH] = useState(hour);
  const [selM, setSelM] = useState(minute);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSelH(hour);
      setSelM(minute);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          },
          { opacity: fadeAnim },
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            {
              backgroundColor: "#fff",
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              paddingTop: 14,
              paddingHorizontal: 20,
              paddingBottom: 36,
            },
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#D1D5DB",
              alignSelf: "center",
              marginBottom: 20,
            }}
          />
          <Text
            style={{
              fontSize: 17,
              fontWeight: "800",
              color: C.textDark,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Choisir l'heure
          </Text>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <LinearGradient
              colors={[C.indigo, C.violet]}
              style={{
                paddingHorizontal: 32,
                paddingVertical: 14,
                borderRadius: 18,
              }}
            >
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "900",
                  color: "#fff",
                  letterSpacing: 2,
                }}
              >
                {String(selH).padStart(2, "0")}h{String(selM).padStart(2, "0")}
              </Text>
            </LinearGradient>
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: C.textMid,
              marginBottom: 10,
            }}
          >
            Heure
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, marginBottom: 20 }}
          >
            {HOURS.map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => setSelH(h)}
                activeOpacity={0.8}
              >
                {selH === h ? (
                  <LinearGradient
                    colors={[C.indigo, C.violet]}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, fontWeight: "800", color: "#fff" }}
                    >
                      {String(h).padStart(2, "0")}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      backgroundColor: C.sand,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: C.textMid,
                      }}
                    >
                      {String(h).padStart(2, "0")}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: C.textMid,
              marginBottom: 10,
            }}
          >
            Minutes
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
            {MINUTES.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setSelM(m)}
                activeOpacity={0.8}
                style={{ flex: 1 }}
              >
                {selM === m ? (
                  <LinearGradient
                    colors={[C.amber, C.pink]}
                    style={{
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{ fontSize: 17, fontWeight: "800", color: "#fff" }}
                    >
                      {String(m).padStart(2, "0")}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={{
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: "#F3F4F6",
                      alignItems: "center",
                      borderWidth: 1.5,
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: "700",
                        color: "#1F2937",
                      }}
                    >
                      {String(m).padStart(2, "0")}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={{ borderRadius: 14, overflow: "hidden" }}
            activeOpacity={0.85}
            onPress={() => {
              onSelect(selH, selM);
              onClose();
            }}
          >
            <LinearGradient
              colors={[C.indigo, C.violet]}
              style={{ paddingVertical: 14, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>
                Confirmer
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ════════════════════════════════════════════════
//  PAGE PAIEMENT MOBILE MONEY (frais de publication)
// ════════════════════════════════════════════════
function MobileMoneyPayment({
  onBack,
  onSuccess,
}: {
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bgLight }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[C.amber, C.pink]}
          style={[payS.header, { paddingTop: insets.top + 16 }]}
        >
          <TouchableOpacity
            onPress={onBack}
            style={payS.headerBack}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={payS.headerTitle}>Mobile Money</Text>
            <Text style={payS.headerSub}>Frais de publication</Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <LinearGradient
          colors={["rgba(245,158,11,0.12)", "rgba(236,72,153,0.05)"]}
          style={payS.amountCard}
        >
          <Text style={payS.amountLabel}>Frais de publication Tikety</Text>
          <Text style={payS.amountValue}>
            {CREATION_FEE.toLocaleString()} FCFA
          </Text>
          <Text style={payS.amountNote}>
            Paiement unique · Votre événement sera publié immédiatement
          </Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16 }}>
          <Text style={payS.sectionLabel}>Choisir l'opérateur</Text>
          <View style={{ gap: 10 }}>
            {operators.map((op) => (
              <TouchableOpacity
                key={op.id}
                onPress={() => setOperator(op.id)}
                activeOpacity={0.85}
                style={[
                  payS.operatorBtn,
                  {
                    backgroundColor: op.bg,
                    borderColor: operator === op.id ? op.color : "transparent",
                  },
                ]}
              >
                <View
                  style={[payS.operatorDot, { backgroundColor: op.color }]}
                />
                <Text style={[payS.operatorLabel, { color: op.color }]}>
                  {op.label}
                </Text>
                {operator === op.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={op.color}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[payS.sectionLabel, { marginTop: 20 }]}>
            Numéro de paiement
          </Text>
          <View style={payS.inputWrapper}>
            <View style={payS.inputFlag}>
              <Text style={payS.inputFlagText}>🇨🇮 +225</Text>
            </View>
            <TextInput
              style={payS.phoneInput}
              placeholder="07 00 00 00 00"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={12}
            />
          </View>

          <View style={payS.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={C.textMid}
            />
            <Text style={payS.infoText}>
              Vous recevrez une demande de confirmation sur votre téléphone.
              Validez avec votre code PIN{" "}
              {operators.find((o) => o.id === operator)?.label}.
            </Text>
          </View>

          <View style={payS.summaryCard}>
            <Text style={payS.summaryTitle}>Récapitulatif</Text>
            {[
              {
                label: "Frais de publication",
                value: `${CREATION_FEE.toLocaleString()} FCFA`,
              },
              {
                label: "Commission / vente (si payant)",
                value: "5% par billet vendu",
              },
            ].map((r) => (
              <View
                key={r.label}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 12, color: C.textGray }}>
                  {r.label}
                </Text>
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: C.textDark }}
                >
                  {r.value}
                </Text>
              </View>
            ))}
            <View
              style={{ height: 1, backgroundColor: C.sand, marginVertical: 8 }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "800", color: C.textDark }}
              >
                À payer maintenant
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "900", color: C.amber }}>
                {CREATION_FEE.toLocaleString()} FCFA
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[payS.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          activeOpacity={0.88}
          disabled={loading}
          onPress={() => {
            if (phone.length < 8) {
              Alert.alert(
                "Numéro invalide",
                "Veuillez saisir un numéro valide.",
              );
              return;
            }
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              onSuccess();
            }, 2000);
          }}
        >
          <LinearGradient
            colors={[C.amber, C.pink]}
            style={payS.ctaBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <Text style={payS.ctaBtnText}>Traitement...</Text>
            ) : (
              <>
                <Ionicons
                  name="phone-portrait-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={payS.ctaBtnText}>
                  Payer {CREATION_FEE.toLocaleString()} FCFA
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <Text
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#9CA3AF",
            marginTop: 8,
          }}
        >
          🔒 Paiement sécurisé par Tikety Pay
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// ════════════════════════════════════════════════
//  PAGE PAIEMENT CARTE (frais de publication)
// ════════════════════════════════════════════════
function CardPayment({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [holderName, setHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const formatExpiry = (v: string) => {
    const c = v.replace(/\D/g, "").slice(0, 4);
    return c.length >= 3 ? `${c.slice(0, 2)}/${c.slice(2)}` : c;
  };
  const cardType = cardNumber.startsWith("4")
    ? "VISA"
    : cardNumber.startsWith("5")
      ? "MC"
      : "";

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
        <LinearGradient
          colors={[C.indigo, C.violet]}
          style={[payS.header, { paddingTop: insets.top + 16 }]}
        >
          <TouchableOpacity
            onPress={onBack}
            style={payS.headerBack}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={payS.headerTitle}>Carte bancaire</Text>
            <Text style={payS.headerSub}>Visa / Mastercard</Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <LinearGradient
          colors={["rgba(99,102,241,0.1)", "rgba(124,58,237,0.05)"]}
          style={payS.amountCard}
        >
          <Text style={payS.amountLabel}>Frais de publication Tikety</Text>
          <Text style={[payS.amountValue, { color: C.indigo }]}>
            {CREATION_FEE.toLocaleString()} FCFA
          </Text>
          <Text style={payS.amountNote}>
            Paiement unique · Votre événement sera publié immédiatement
          </Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16 }}>
          {/* Preview carte */}
          <LinearGradient
            colors={[C.indigo, C.violet]}
            style={payS.cardPreview}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 26,
                  borderRadius: 5,
                  backgroundColor: "rgba(255,255,255,0.4)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.6)",
                }}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {cardType}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#fff",
                letterSpacing: 3,
                textAlign: "center",
                marginVertical: 12,
              }}
            >
              {cardNumber || "•••• •••• •••• ••••"}
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: 2,
                  }}
                >
                  TITULAIRE
                </Text>
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}
                >
                  {holderName || "NOM PRÉNOM"}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: 2,
                  }}
                >
                  EXPIRE
                </Text>
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}
                >
                  {expiry || "MM/AA"}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <Text style={payS.sectionLabel}>Numéro de carte</Text>
          <TextInput
            style={payS.inputField}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={cardNumber}
            onChangeText={(v) => setCardNumber(formatCard(v))}
            maxLength={19}
          />

          <Text style={payS.sectionLabel}>Titulaire</Text>
          <TextInput
            style={payS.inputField}
            placeholder="NOM PRÉNOM"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            value={holderName}
            onChangeText={setHolderName}
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={payS.sectionLabel}>Expiration</Text>
              <TextInput
                style={payS.inputField}
                placeholder="MM/AA"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={expiry}
                onChangeText={(v) => setExpiry(formatExpiry(v))}
                maxLength={5}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={payS.sectionLabel}>CVV</Text>
              <TextInput
                style={payS.inputField}
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

          <View style={payS.infoBox}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={C.emerald}
            />
            <Text style={[payS.infoText, { color: C.emerald }]}>
              Données chiffrées SSL 256-bit par Tikety Pay
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[payS.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          activeOpacity={0.88}
          disabled={loading}
          onPress={() => {
            if (
              cardNumber.replace(/\s/g, "").length < 16 ||
              expiry.length < 5 ||
              cvv.length < 3 ||
              !holderName.trim()
            ) {
              Alert.alert(
                "Champs incomplets",
                "Veuillez remplir tous les champs.",
              );
              return;
            }
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              onSuccess();
            }, 2000);
          }}
        >
          <LinearGradient
            colors={[C.indigo, C.violet]}
            style={payS.ctaBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <Text style={payS.ctaBtnText}>Traitement...</Text>
            ) : (
              <>
                <Ionicons name="card-outline" size={18} color="#fff" />
                <Text style={payS.ctaBtnText}>
                  Payer {CREATION_FEE.toLocaleString()} FCFA
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <Text
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#9CA3AF",
            marginTop: 8,
          }}
        >
          🔒 Paiement sécurisé par Tikety Pay
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// ════════════════════════════════════════════════
//  Modal paiement frais de publication
// ════════════════════════════════════════════════
function PaymentModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [payStep, setPayStep] = useState<"choose" | "mobilemoney" | "card">(
    "choose",
  );
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

  if (payStep === "mobilemoney") {
    return (
      <Modal
        visible
        transparent={false}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setPayStep("choose")}
      >
        <MobileMoneyPayment
          onBack={() => setPayStep("choose")}
          onSuccess={onSuccess}
        />
      </Modal>
    );
  }
  if (payStep === "card") {
    return (
      <Modal
        visible
        transparent={false}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setPayStep("choose")}
      >
        <CardPayment
          onBack={() => setPayStep("choose")}
          onSuccess={onSuccess}
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
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.65)",
          justifyContent: "flex-end",
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={{
            backgroundColor: C.bgLight,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 14,
            paddingHorizontal: 20,
            paddingBottom: 44,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#D1D5DB",
              alignSelf: "center",
              marginBottom: 20,
            }}
          />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "900",
              color: C.textDark,
              marginBottom: 4,
            }}
          >
            Publication de l'événement
          </Text>
          <Text style={{ fontSize: 13, color: C.textGray, marginBottom: 20 }}>
            Des frais uniques de publication sont requis pour diffuser votre
            événement sur Tikety.
          </Text>

          {/* Info frais */}
          <LinearGradient
            colors={["rgba(99,102,241,0.08)", "rgba(124,58,237,0.04)"]}
            style={{
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "rgba(99,102,241,0.12)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 13, color: C.textGray }}>
                Frais de publication
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: "800", color: C.textDark }}
              >
                {CREATION_FEE.toLocaleString()} FCFA
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 13, color: C.textGray }}>
                Commission / vente
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: "700", color: C.textMid }}
              >
                5% par billet
              </Text>
            </View>
            <View
              style={{ height: 1, backgroundColor: C.sand, marginVertical: 8 }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "800", color: C.textDark }}
              >
                À payer maintenant
              </Text>
              <Text
                style={{ fontSize: 16, fontWeight: "900", color: C.indigo }}
              >
                {CREATION_FEE.toLocaleString()} FCFA
              </Text>
            </View>
          </LinearGradient>

          {/* Choix paiement */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "800",
              color: C.textDark,
              marginBottom: 12,
            }}
          >
            Moyen de paiement
          </Text>
          <View style={{ gap: 10, marginBottom: 20 }}>
            {[
              {
                id: "mobilemoney" as const,
                label: "Mobile Money",
                sub: "MTN / Orange / Wave",
                icon: "phone-portrait-outline",
                colors: [C.amber, C.pink] as [string, string],
                active: C.amber,
              },
              {
                id: "card" as const,
                label: "Carte bancaire",
                sub: "Visa / Mastercard",
                icon: "card-outline",
                colors: [C.indigo, C.violet] as [string, string],
                active: C.indigo,
              },
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => setSelectedPayment(m.id)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: C.white,
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 2,
                  borderColor: selectedPayment === m.id ? m.active : C.sand,
                }}
              >
                <LinearGradient
                  colors={
                    selectedPayment === m.id ? m.colors : [C.sand, C.cream]
                  }
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name={m.icon as any}
                    size={18}
                    color={selectedPayment === m.id ? "#fff" : C.textMid}
                  />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: C.textDark,
                    }}
                  >
                    {m.label}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.textGray }}>
                    {m.sub}
                  </Text>
                </View>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selectedPayment === m.id ? m.active : C.sand,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedPayment === m.id && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: m.active,
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setPayStep(selectedPayment)}
            activeOpacity={0.88}
            style={{ borderRadius: 14, overflow: "hidden", marginBottom: 12 }}
          >
            <LinearGradient
              colors={
                selectedPayment === "mobilemoney"
                  ? [C.amber, C.pink]
                  : [C.indigo, C.violet]
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 15,
                gap: 8,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="lock-closed" size={16} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>
                Payer et publier l'événement
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF" }}>
            🔒 Paiement sécurisé par Tikety Pay
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ════════════════════════════════════════════════
//  SuccessScreen
// ════════════════════════════════════════════════
function SuccessScreen({
  title,
  onGoHome,
  onGoEvents,
}: {
  title: string;
  onGoHome: () => void;
  onGoEvents: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array(10)
      .fill(0)
      .map(() => ({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        rot: new Animated.Value(0),
        op: new Animated.Value(1),
      })),
  ).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    Animated.sequence([
      Animated.delay(200),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 55,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
    Animated.sequence([
      Animated.delay(600),
      Animated.loop(
        Animated.sequence([
          Animated.timing(ring1Anim, {
            toValue: 1,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring1Anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
    Animated.sequence([
      Animated.delay(900),
      Animated.loop(
        Animated.sequence([
          Animated.timing(ring2Anim, {
            toValue: 1,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
    Animated.sequence([
      Animated.delay(800),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 700,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 700,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
    confettiAnims.forEach((c, i) => {
      const angle = (i / confettiAnims.length) * Math.PI * 2;
      const dist = 90 + Math.random() * 60;
      Animated.sequence([
        Animated.delay(400 + i * 60),
        Animated.parallel([
          Animated.timing(c.x, {
            toValue: Math.cos(angle) * dist,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(c.y, {
            toValue: Math.sin(angle) * dist - 30,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(c.rot, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(c.op, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    });
  }, []);

  const ring1Scale = ring1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });
  const ring1Op = ring1Anim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.7, 0.4, 0],
  });
  const ring2Scale = ring2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.8],
  });
  const ring2Op = ring2Anim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.5, 0.2, 0],
  });
  const confettiColors = [
    "#6366F1",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#7C3AED",
    "#FCD34D",
    "#0891B2",
    "#EF4444",
    "#F472B6",
    "#34D399",
  ];
  const confettiShapes = ["■", "●", "▲", "◆", "★", "✦", "◉", "▶", "◗", "⬟"];

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <LinearGradient
        colors={[C.indigoDark, C.indigo, C.violet]}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 28,
          overflow: "hidden",
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 250,
            height: 250,
            borderRadius: 125,
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />
        {confettiAnims.map((c, i) => (
          <Animated.Text
            key={i}
            style={{
              position: "absolute",
              fontSize: 18,
              color: confettiColors[i],
              opacity: c.op,
              transform: [
                { translateX: c.x },
                { translateY: c.y },
                {
                  rotate: c.rot.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
          >
            {confettiShapes[i]}
          </Animated.Text>
        ))}

        <Animated.View
          style={{
            position: "relative",
            marginBottom: 32,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: scaleAnim }, { translateY: bounceAnim }],
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 2,
              borderColor: "rgba(16,185,129,0.5)",
              transform: [{ scale: ring1Scale }],
              opacity: ring1Op,
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 2,
              borderColor: "rgba(16,185,129,0.4)",
              transform: [{ scale: ring2Scale }],
              opacity: ring2Op,
            }}
          />
          <LinearGradient
            colors={[C.emerald, "#059669"]}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="checkmark" size={54} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <View style={{ alignItems: "center", marginBottom: 36 }}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🎉</Text>
          <Text style={{ fontSize: 32, fontWeight: "900", color: "#fff" }}>
            Événement publié
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "900",
              color: C.amberLight,
              marginBottom: 16,
            }}
          >
            avec succès !
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
              marginBottom: 16,
            }}
          >
            <Ionicons name="calendar" size={14} color={C.amberLight} />
            <Text
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: "700",
                maxWidth: width - 120,
              }}
              numberOfLines={1}
            >
              "{title}"
            </Text>
          </View>
          <Text
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Votre événement est maintenant visible sur Tikety et prêt à recevoir
            des inscriptions.
          </Text>
        </View>

        <View style={{ width: "100%", gap: 12 }}>
          <TouchableOpacity
            onPress={onGoHome}
            activeOpacity={0.88}
            style={{ borderRadius: 16, overflow: "hidden" }}
          >
            <LinearGradient
              colors={[C.amber, C.pink]}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 16,
                gap: 10,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="home-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>
                Retour à l'accueil
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onGoEvents}
            activeOpacity={0.88}
            style={{ borderRadius: 16, overflow: "hidden" }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 14,
                gap: 10,
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.25)",
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={C.amberLight}
              />
              <Text
                style={{ color: C.amberLight, fontSize: 15, fontWeight: "700" }}
              >
                Mes événements
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ════════════════════════════════════════════════
//  PAGE PRINCIPALE
// ════════════════════════════════════════════════
export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isBusiness, setIsBusiness] = useState<boolean | null>(null);
  const [step, setStep] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [showAllCats, setShowAllCats] = useState(false);
  const [published, setPublished] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Calendrier & heure
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<"start" | "end">(
    "start",
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<"start" | "end">(
    "start",
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isPeriod, setIsPeriod] = useState(false);
  const [startHour, setStartHour] = useState(20);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(23);
  const [endMinute, setEndMinute] = useState(0);
  const [timeConfirmed, setTimeConfirmed] = useState(false);
  const [endTimeConfirmed, setEndTimeConfirmed] = useState(false);

  // Programme
  interface ProgramItem {
    id: string;
    time: string;
    title: string;
    description: string;
    speaker: string;
  }
  const [programItems, setProgramItems] = useState<ProgramItem[]>([
    { id: "1", time: "", title: "", description: "", speaker: "" },
  ]);

  // Tiers billets
  const [hasVip, setHasVip] = useState(false);
  const [hasVvip, setHasVvip] = useState(false);

  // Sponsors
  interface Sponsor {
    id: string;
    name: string;
    tier: "or" | "argent" | "bronze";
  }
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  // Form
  const [form, setForm] = useState({
    title: "",
    category: "",
    customCategory: "",
    location: "",
    address: "",
    description: "",
    longDescription: "",
    tags: "",
    price: "",
    totalTickets: "",
    vipPrice: "",
    vipCount: "",
    vipPerks: "",
    vvipPrice: "",
    vvipCount: "",
    vvipPerks: "",
    organizerName: "",
    organizerPhone: "",
    organizerEmail: "",
    organizerWebsite: "",
  });

  const resetForm = useCallback(() => {
    setStep(0);
    setIsFree(false);
    setShowAllCats(false);
    setPublished(false);
    setShowPaymentModal(false);
    setShowCalendar(false);
    setShowTimePicker(false);
    setSelectedDate(null);
    setSelectedEndDate(null);
    setIsPeriod(false);
    setStartHour(20);
    setStartMinute(0);
    setEndHour(23);
    setEndMinute(0);
    setTimeConfirmed(false);
    setEndTimeConfirmed(false);
    setHasVip(false);
    setHasVvip(false);
    setSponsors([]);
    setProgramItems([
      { id: "1", time: "", title: "", description: "", speaker: "" },
    ]);
    setForm({
      title: "",
      category: "",
      customCategory: "",
      location: "",
      address: "",
      description: "",
      longDescription: "",
      tags: "",
      price: "",
      totalTickets: "",
      vipPrice: "",
      vipCount: "",
      vipPerks: "",
      vvipPrice: "",
      vvipCount: "",
      vvipPerks: "",
      organizerName: "",
      organizerPhone: "",
      organizerEmail: "",
      organizerWebsite: "",
    });
  }, []);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const stepAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const load = async () => {
      try {
        const json = await AsyncStorage.getItem("USER_LOGGED");
        setIsBusiness(json ? JSON.parse(json)?.isBusiness === true : true);
      } catch (_) {
        setIsBusiness(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (isBusiness === null) return;
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
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [isBusiness]);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: step / (STEPS.length - 1),
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
    Animated.sequence([
      Animated.timing(stepAnim, {
        toValue: 0,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(stepAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  const selectedCat = ALL_CATEGORIES.find((c) => c.id === form.category);
  const visibleCats = showAllCats ? ALL_CATEGORIES : ALL_CATEGORIES.slice(0, 8);

  const formatDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  const formatDateLong = (d: Date) =>
    `${DAYS_SHORT[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const formatTime = (h: number, m: number) =>
    `${String(h).padStart(2, "0")}h${String(m).padStart(2, "0")}`;

  const handleNext = () => {
    if (step === 0) {
      const catOk =
        form.category &&
        (form.category !== "autre" || form.customCategory.trim());
      if (!form.title || !catOk || !selectedDate || !form.location) {
        Alert.alert(
          "Champs requis",
          "Veuillez remplir le titre, la catégorie, la date et le lieu.",
        );
        return;
      }
    }
    if (step === 1) {
      if (!isFree && !form.price) {
        Alert.alert(
          "Prix requis",
          "Renseignez le prix ou activez « Événement gratuit ».",
        );
        return;
      }
      if (!form.totalTickets) {
        Alert.alert("Capacité requise", "Indiquez la capacité totale.");
        return;
      }
    }
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const addProgramItem = () =>
    setProgramItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        time: "",
        title: "",
        description: "",
        speaker: "",
      },
    ]);
  const updateProgramItem = (
    id: string,
    field: keyof ProgramItem,
    value: string,
  ) =>
    setProgramItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  const removeProgramItem = (id: string) =>
    setProgramItems((prev) => prev.filter((p) => p.id !== id));

  const addSponsor = () =>
    setSponsors((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", tier: "bronze" },
    ]);
  const updateSponsor = (id: string, field: keyof Sponsor, value: string) =>
    setSponsors((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  const removeSponsor = (id: string) =>
    setSponsors((prev) => prev.filter((s) => s.id !== id));

  if (isBusiness === null)
    return (
      <LinearGradient
        colors={[C.emeraldDark, C.emerald]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
          Chargement…
        </Text>
      </LinearGradient>
    );

  if (published)
    return (
      <SuccessScreen
        title={form.title || "Votre événement"}
        onGoHome={() => {
          resetForm();
          router.replace("/(tabs)/" as any);
        }}
        onGoEvents={() => {
          resetForm();
          router.replace("/(tabs)/explore" as any);
        }}
      />
    );

  if (!isBusiness)
    return (
      <>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <LinearGradient
          colors={[C.emeraldDark, C.emerald, "#0891B2"]}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 26,
            overflow: "hidden",
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.Text
            style={{
              position: "absolute",
              top: 80,
              right: 28,
              fontSize: 60,
              transform: [{ translateY: floatAnim }],
            }}
          >
            🚀
          </Animated.Text>
          <View style={{ alignItems: "center", width: "100%" }}>
            <LinearGradient
              colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.07)"]}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.2)",
                marginBottom: 22,
              }}
            >
              <Ionicons
                name="lock-closed"
                size={46}
                color="rgba(255,255,255,0.92)"
              />
            </LinearGradient>
            <Text
              style={{
                fontSize: 27,
                fontWeight: "900",
                color: "#fff",
                textAlign: "center",
              }}
            >
              Accès organisateur
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: C.amberLight,
                textAlign: "center",
                marginBottom: 14,
              }}
            >
              uniquement
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.75)",
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 22,
              }}
            >
              Pour créer des événements sur Tikety, vous devez disposer d'un{" "}
              <Text style={{ fontWeight: "800", color: "#fff" }}>
                compte Business
              </Text>
              .
            </Text>
            <TouchableOpacity
              style={{
                width: "100%",
                borderRadius: 14,
                overflow: "hidden",
                marginBottom: 14,
              }}
              onPress={() => router.push("/upgrade-business" as any)}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[C.amber, C.pink]}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 15,
                  gap: 8,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="business-outline" size={18} color="#fff" />
                <Text
                  style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}
                >
                  Passer au compte Business
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/" as any)}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={14}
                color="rgba(255,255,255,0.6)"
              />
              <Text
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                Retour à l'accueil
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </>
    );

  // ── FORMULAIRE ──────────────────────────────
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <CalendarPicker
        visible={showCalendar}
        selectedDate={
          calendarTarget === "start" ? selectedDate : selectedEndDate
        }
        onSelect={(d) => {
          if (calendarTarget === "start") {
            setSelectedDate(d);
            if (selectedEndDate && d > selectedEndDate)
              setSelectedEndDate(null);
          } else setSelectedEndDate(d);
          setShowCalendar(false);
        }}
        onClose={() => setShowCalendar(false)}
        minDate={
          calendarTarget === "end" && selectedDate ? selectedDate : undefined
        }
      />
      <TimePicker
        visible={showTimePicker}
        hour={timePickerTarget === "start" ? startHour : endHour}
        minute={timePickerTarget === "start" ? startMinute : endMinute}
        onSelect={(h, m) => {
          if (timePickerTarget === "start") {
            setStartHour(h);
            setStartMinute(m);
            setTimeConfirmed(true);
          } else {
            setEndHour(h);
            setEndMinute(m);
            setEndTimeConfirmed(true);
          }
        }}
        onClose={() => setShowTimePicker(false)}
      />

      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            setPublished(true);
          }}
        />
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={s.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* ── HEADER ── */}
          <LinearGradient
            colors={[C.emeraldDark, C.emerald, "#0891B2"]}
            style={[s.header, { paddingTop: insets.top + 12 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={s.headerCircle1} />
            <View style={s.headerCircle2} />
            <Animated.Text
              style={[
                s.headerEmoji,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              🚀
            </Animated.Text>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text style={s.headerSub}>Organisateur</Text>
              <Text style={s.headerTitle}>Créer un événement</Text>

              {/* Steps */}
              <View style={s.stepsRow}>
                {STEPS.map((st, i) => (
                  <TouchableOpacity
                    key={st}
                    style={s.stepItem}
                    onPress={() => i <= step && setStep(i)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        i <= step
                          ? [C.amber, "#F59E0B"]
                          : ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]
                      }
                      style={s.stepCircle}
                    >
                      {i < step ? (
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      ) : (
                        <Text style={[s.stepNum, i <= step && s.stepNumActive]}>
                          {i + 1}
                        </Text>
                      )}
                    </LinearGradient>
                    <Text style={[s.stepLabel, i <= step && s.stepLabelActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.progressTrack}>
                <Animated.View
                  style={[s.progressFill, { width: progressWidth }]}
                >
                  <LinearGradient
                    colors={[C.amber, C.amberLight]}
                    style={{ flex: 1, borderRadius: 3 }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </Animated.View>
              </View>
            </Animated.View>
          </LinearGradient>

          {/* ── CONTENU PAR ÉTAPE ── */}
          <Animated.View
            style={[
              s.content,
              {
                opacity: stepAnim,
                transform: [
                  {
                    translateY: stepAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* ════ STEP 0 : INFOS GÉNÉRALES ════ */}
            {step === 0 && (
              <View>
                <View style={s.stepHeader}>
                  <LinearGradient
                    colors={[C.emerald, "#059669"]}
                    style={s.stepHeaderIcon}
                  >
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color="#fff"
                    />
                  </LinearGradient>
                  <View>
                    <Text style={s.stepTitle}>Informations générales</Text>
                    <Text style={s.stepSubtitle}>
                      Titre, catégorie, date et lieu
                    </Text>
                  </View>
                </View>

                {/* Titre */}
                <View style={s.card}>
                  <Text style={s.cardTitle}>Titre de l'événement *</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Ex: Soirée Gala 2025"
                    placeholderTextColor="#9CA3AF"
                    value={form.title}
                    onChangeText={(v) => setForm({ ...form, title: v })}
                    returnKeyType="next"
                  />
                </View>

                {/* Catégorie */}
                <View style={s.card}>
                  <Text style={s.cardTitle}>Catégorie *</Text>
                  <View style={s.categoriesGrid}>
                    {visibleCats.map((cat) => {
                      const isActive = form.category === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() =>
                            setForm({
                              ...form,
                              category: cat.id,
                              customCategory: "",
                            })
                          }
                          activeOpacity={0.8}
                        >
                          {isActive ? (
                            <LinearGradient
                              colors={cat.gradient}
                              style={s.catItemActive}
                            >
                              <Ionicons
                                name={cat.icon as any}
                                size={13}
                                color="#fff"
                              />
                              <Text style={s.catItemTextActive}>
                                {cat.label}
                              </Text>
                            </LinearGradient>
                          ) : (
                            <View style={s.catItem}>
                              <Ionicons
                                name={cat.icon as any}
                                size={13}
                                color={C.textMid}
                              />
                              <Text style={s.catItemText}>{cat.label}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowAllCats(!showAllCats)}
                    activeOpacity={0.75}
                    style={{ alignSelf: "flex-start" }}
                  >
                    <LinearGradient
                      colors={["rgba(99,102,241,0.1)", "rgba(124,58,237,0.06)"]}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "rgba(99,102,241,0.15)",
                      }}
                    >
                      <Ionicons
                        name={showAllCats ? "chevron-up" : "chevron-down"}
                        size={13}
                        color={C.textMid}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: C.textMid,
                        }}
                      >
                        {showAllCats
                          ? "Voir moins"
                          : `Toutes les catégories (${ALL_CATEGORIES.length})`}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  {form.category === "autre" && (
                    <View
                      style={[
                        s.inputWithIcon,
                        {
                          marginTop: 10,
                          borderColor: C.indigo,
                          borderWidth: 2,
                        },
                      ]}
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color={C.indigo}
                      />
                      <TextInput
                        style={s.inputInner}
                        placeholder="Précisez la catégorie…"
                        placeholderTextColor="#9CA3AF"
                        value={form.customCategory}
                        onChangeText={(v) =>
                          setForm({ ...form, customCategory: v })
                        }
                        autoFocus
                      />
                    </View>
                  )}
                </View>

                {/* Date */}
                <View style={s.card}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <Text style={s.cardTitle}>Date *</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setIsPeriod(!isPeriod);
                        if (isPeriod) setSelectedEndDate(null);
                      }}
                      activeOpacity={0.8}
                    >
                      {isPeriod ? (
                        <LinearGradient
                          colors={[C.indigo, C.violet]}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 12,
                          }}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={12}
                            color="#fff"
                          />
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "700",
                              color: "#fff",
                            }}
                          >
                            Période ✓
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 12,
                            borderWidth: 1.5,
                            borderColor: C.sand,
                            backgroundColor: C.white,
                          }}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={12}
                            color={C.textMid}
                          />
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "700",
                              color: C.textMid,
                            }}
                          >
                            Période ?
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      {isPeriod && <Text style={s.subLabel}>Début</Text>}
                      <TouchableOpacity
                        onPress={() => {
                          setCalendarTarget("start");
                          setShowCalendar(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={
                            selectedDate
                              ? [C.white, C.cream]
                              : [C.white, C.white]
                          }
                          style={[
                            s.pickerBtn,
                            selectedDate && s.pickerBtnFilled,
                          ]}
                        >
                          <Ionicons
                            name="calendar"
                            size={16}
                            color={selectedDate ? C.indigo : "#9CA3AF"}
                          />
                          <Text
                            style={[
                              s.pickerBtnText,
                              selectedDate && s.pickerBtnTextFilled,
                            ]}
                            numberOfLines={1}
                          >
                            {selectedDate
                              ? formatDate(selectedDate)
                              : "JJ/MM/AAAA"}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      {selectedDate && !isPeriod && (
                        <Text style={s.pickerSubtext}>
                          {formatDateLong(selectedDate)}
                        </Text>
                      )}
                    </View>
                    {isPeriod && (
                      <View style={{ flex: 1 }}>
                        <Text style={s.subLabel}>Fin</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setCalendarTarget("end");
                            setShowCalendar(true);
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={
                              selectedEndDate
                                ? [C.white, C.cream]
                                : [C.white, C.white]
                            }
                            style={[
                              s.pickerBtn,
                              selectedEndDate && s.pickerBtnFilled,
                              !selectedDate && { opacity: 0.45 },
                            ]}
                          >
                            <Ionicons
                              name="calendar"
                              size={16}
                              color={selectedEndDate ? C.violet : "#9CA3AF"}
                            />
                            <Text
                              style={[
                                s.pickerBtnText,
                                selectedEndDate && s.pickerBtnTextFilled,
                              ]}
                              numberOfLines={1}
                            >
                              {selectedEndDate
                                ? formatDate(selectedEndDate)
                                : "JJ/MM/AAAA"}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        {selectedEndDate && (
                          <Text style={[s.pickerSubtext, { color: C.violet }]}>
                            {formatDateLong(selectedEndDate)}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  {isPeriod && selectedDate && selectedEndDate && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 8,
                        backgroundColor: "rgba(99,102,241,0.08)",
                        borderRadius: 8,
                        padding: 8,
                      }}
                    >
                      <Ionicons
                        name="time-outline"
                        size={13}
                        color={C.indigo}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          color: C.textMid,
                          fontWeight: "600",
                          flex: 1,
                        }}
                      >
                        Du {formatDateLong(selectedDate)} au{" "}
                        {formatDateLong(selectedEndDate)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Heure */}
                <View style={s.card}>
                  <Text style={s.cardTitle}>Horaires</Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.subLabel}>Début</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setTimePickerTarget("start");
                          setShowTimePicker(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={
                            timeConfirmed
                              ? [C.white, C.cream]
                              : [C.white, C.white]
                          }
                          style={[
                            s.pickerBtn,
                            timeConfirmed && s.pickerBtnFilled,
                          ]}
                        >
                          <Ionicons
                            name="time"
                            size={16}
                            color={timeConfirmed ? C.indigo : "#9CA3AF"}
                          />
                          <Text
                            style={[
                              s.pickerBtnText,
                              timeConfirmed && s.pickerBtnTextFilled,
                            ]}
                          >
                            {timeConfirmed
                              ? formatTime(startHour, startMinute)
                              : "HHhMM"}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.subLabel}>Fin</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setTimePickerTarget("end");
                          setShowTimePicker(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={
                            endTimeConfirmed
                              ? [C.white, C.cream]
                              : [C.white, C.white]
                          }
                          style={[
                            s.pickerBtn,
                            endTimeConfirmed && s.pickerBtnFilled,
                          ]}
                        >
                          <Ionicons
                            name="time"
                            size={16}
                            color={endTimeConfirmed ? C.violet : "#9CA3AF"}
                          />
                          <Text
                            style={[
                              s.pickerBtnText,
                              endTimeConfirmed && s.pickerBtnTextFilled,
                            ]}
                          >
                            {endTimeConfirmed
                              ? formatTime(endHour, endMinute)
                              : "HHhMM"}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Lieu */}
                <View style={s.card}>
                  <Text style={s.cardTitle}>Lieu *</Text>
                  <View style={s.inputWithIcon}>
                    <Ionicons
                      name="business-outline"
                      size={16}
                      color="#9CA3AF"
                    />
                    <TextInput
                      style={s.inputInner}
                      placeholder="Ex: Sofitel Hôtel Ivoire"
                      placeholderTextColor="#9CA3AF"
                      value={form.location}
                      onChangeText={(v) => setForm({ ...form, location: v })}
                      returnKeyType="next"
                    />
                  </View>
                  <View style={[s.inputWithIcon, { marginTop: 10 }]}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#9CA3AF"
                    />
                    <TextInput
                      style={s.inputInner}
                      placeholder="Adresse complète"
                      placeholderTextColor="#9CA3AF"
                      value={form.address}
                      onChangeText={(v) => setForm({ ...form, address: v })}
                      returnKeyType="done"
                    />
                  </View>
                </View>

                {/* Image de couverture */}
                <View style={s.card}>
                  <Text style={s.cardTitle}>Image de couverture</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      Alert.alert("Ajouter une image", "Choisir la source", [
                        { text: "📷 Appareil photo", onPress: () => {} },
                        { text: "🖼️ Galerie photos", onPress: () => {} },
                        { text: "Annuler", style: "cancel" },
                      ])
                    }
                  >
                    <LinearGradient
                      colors={[
                        "rgba(99,102,241,0.06)",
                        "rgba(124,58,237,0.04)",
                      ]}
                      style={{
                        padding: 28,
                        alignItems: "center",
                        gap: 10,
                        borderRadius: 14,
                        borderWidth: 1.5,
                        borderColor: C.sand,
                        borderStyle: "dashed",
                      }}
                    >
                      <LinearGradient
                        colors={[C.indigo, C.violet]}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <Ionicons name="image-outline" size={24} color="#fff" />
                      </LinearGradient>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: C.textDark,
                        }}
                      >
                        Appuyez pour ajouter une image
                      </Text>
                      <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                        Galerie · Appareil photo · JPG, PNG
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ════ STEP 1 : BILLETS ════ */}
            {step === 1 && (
              <View>
                <View style={s.stepHeader}>
                  <LinearGradient
                    colors={[C.amber, C.pink]}
                    style={s.stepHeaderIcon}
                  >
                    <Ionicons name="ticket" size={20} color="#fff" />
                  </LinearGradient>
                  <View>
                    <Text style={s.stepTitle}>Configuration des billets</Text>
                    <Text style={s.stepSubtitle}>
                      Prix, catégories et capacité
                    </Text>
                  </View>
                </View>

                {/* Gratuit toggle */}
                <View style={s.toggleCard}>
                  <View style={s.toggleLeft}>
                    <LinearGradient
                      colors={[C.emerald, "#059669"]}
                      style={s.toggleIcon}
                    >
                      <Ionicons name="gift-outline" size={18} color="#fff" />
                    </LinearGradient>
                    <View>
                      <Text style={s.toggleLabel}>Événement gratuit</Text>
                      <Text style={s.toggleSub}>Aucun paiement requis</Text>
                    </View>
                  </View>
                  <Switch
                    value={isFree}
                    onValueChange={setIsFree}
                    trackColor={{ false: "#E5E7EB", true: C.emerald }}
                    thumbColor="#fff"
                  />
                </View>

                {/* STANDARD */}
                <View style={s.card}>
                  <LinearGradient
                    colors={[C.indigo, C.violet]}
                    style={s.tierHeaderBadge}
                  >
                    <Ionicons name="ticket" size={14} color="#fff" />
                    <Text style={s.tierHeaderBadgeText}>Billet Standard</Text>
                  </LinearGradient>
                  {!isFree && (
                    <View style={{ marginBottom: 12 }}>
                      <Text style={s.fieldLabel}>Prix (FCFA) *</Text>
                      <View style={s.inputWithIcon}>
                        <Text style={s.inputPrefix}>FCFA</Text>
                        <TextInput
                          style={s.inputInner}
                          placeholder="5 000"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          value={form.price}
                          onChangeText={(v) => setForm({ ...form, price: v })}
                        />
                      </View>
                    </View>
                  )}
                  <Text style={s.fieldLabel}>Capacité totale *</Text>
                  <View style={s.inputWithIcon}>
                    <Ionicons name="people-outline" size={16} color="#9CA3AF" />
                    <TextInput
                      style={s.inputInner}
                      placeholder="200 places"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={form.totalTickets}
                      onChangeText={(v) =>
                        setForm({ ...form, totalTickets: v })
                      }
                    />
                  </View>
                </View>

                {/* VIP toggle */}
                <View style={s.toggleCard}>
                  <View style={s.toggleLeft}>
                    <LinearGradient
                      colors={[C.amber, C.pink]}
                      style={s.toggleIcon}
                    >
                      <Ionicons name="star-outline" size={18} color="#fff" />
                    </LinearGradient>
                    <View>
                      <Text style={s.toggleLabel}>Billets VIP</Text>
                      <Text style={s.toggleSub}>Catégorie premium</Text>
                    </View>
                  </View>
                  <Switch
                    value={hasVip}
                    onValueChange={(v) => {
                      setHasVip(v);
                      if (!v) setHasVvip(false);
                    }}
                    trackColor={{ false: "#E5E7EB", true: C.amber }}
                    thumbColor="#fff"
                  />
                </View>
                {hasVip && (
                  <View style={s.card}>
                    <LinearGradient
                      colors={[C.amber, "#D97706"]}
                      style={s.tierHeaderBadge}
                    >
                      <Ionicons name="star" size={14} color="#fff" />
                      <Text style={s.tierHeaderBadgeText}>Billet VIP</Text>
                    </LinearGradient>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={s.fieldLabel}>Prix (FCFA)</Text>
                        <TextInput
                          style={s.input}
                          placeholder="25 000"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          value={form.vipPrice}
                          onChangeText={(v) =>
                            setForm({ ...form, vipPrice: v })
                          }
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.fieldLabel}>Quantité</Text>
                        <TextInput
                          style={s.input}
                          placeholder="20"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          value={form.vipCount}
                          onChangeText={(v) =>
                            setForm({ ...form, vipCount: v })
                          }
                        />
                      </View>
                    </View>
                    <Text style={s.fieldLabel}>Avantages inclus</Text>
                    <TextInput
                      style={[s.input, { height: 70, paddingTop: 10 }]}
                      placeholder="Table réservée, open bar, accès lounge…"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      textAlignVertical="top"
                      value={form.vipPerks}
                      onChangeText={(v) => setForm({ ...form, vipPerks: v })}
                    />

                    {/* VVIP */}
                    <View
                      style={[
                        s.toggleCard,
                        {
                          marginTop: 16,
                          borderColor: "rgba(99,102,241,0.2)",
                          backgroundColor: "rgba(99,102,241,0.04)",
                        },
                      ]}
                    >
                      <View style={s.toggleLeft}>
                        <LinearGradient
                          colors={[C.indigo, C.violet]}
                          style={s.toggleIcon}
                        >
                          <Ionicons
                            name="diamond-outline"
                            size={18}
                            color="#fff"
                          />
                        </LinearGradient>
                        <View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Text style={s.toggleLabel}>Billets VVIP</Text>
                            <LinearGradient
                              colors={[C.indigo, C.violet]}
                              style={{
                                paddingHorizontal: 7,
                                paddingVertical: 2,
                                borderRadius: 8,
                              }}
                            >
                              <Text
                                style={{
                                  color: "#fff",
                                  fontSize: 9,
                                  fontWeight: "800",
                                }}
                              >
                                Prestige
                              </Text>
                            </LinearGradient>
                          </View>
                          <Text style={s.toggleSub}>
                            Loge privée, accès exclusif…
                          </Text>
                        </View>
                      </View>
                      <Switch
                        value={hasVvip}
                        onValueChange={setHasVvip}
                        trackColor={{ false: "#E5E7EB", true: C.indigo }}
                        thumbColor="#fff"
                      />
                    </View>
                    {hasVvip && (
                      <View style={{ marginTop: 12 }}>
                        <LinearGradient
                          colors={[C.indigo, C.violet]}
                          style={s.tierHeaderBadge}
                        >
                          <Ionicons name="diamond" size={14} color="#fff" />
                          <Text style={s.tierHeaderBadgeText}>Billet VVIP</Text>
                        </LinearGradient>
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 12,
                            marginBottom: 12,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={s.fieldLabel}>Prix (FCFA)</Text>
                            <TextInput
                              style={s.input}
                              placeholder="75 000"
                              placeholderTextColor="#9CA3AF"
                              keyboardType="numeric"
                              value={form.vvipPrice}
                              onChangeText={(v) =>
                                setForm({ ...form, vvipPrice: v })
                              }
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={s.fieldLabel}>Quantité</Text>
                            <TextInput
                              style={s.input}
                              placeholder="5"
                              placeholderTextColor="#9CA3AF"
                              keyboardType="numeric"
                              value={form.vvipCount}
                              onChangeText={(v) =>
                                setForm({ ...form, vvipCount: v })
                              }
                            />
                          </View>
                        </View>
                        <Text style={s.fieldLabel}>Avantages inclus</Text>
                        <TextInput
                          style={[s.input, { height: 70, paddingTop: 10 }]}
                          placeholder="Loge privée, butler, champagne à volonté…"
                          placeholderTextColor="#9CA3AF"
                          multiline
                          textAlignVertical="top"
                          value={form.vvipPerks}
                          onChangeText={(v) =>
                            setForm({ ...form, vvipPerks: v })
                          }
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* Commission info */}
                <LinearGradient
                  colors={[C.sand, C.cream]}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: "rgba(99,102,241,0.1)",
                    marginTop: 4,
                  }}
                >
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={C.indigo}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontSize: 12, color: C.textMid, lineHeight: 18 }}
                    >
                      Tikety perçoit{" "}
                      <Text style={{ fontWeight: "800" }}>5%</Text> de
                      commission sur chaque vente de billet payant. Les billets
                      gratuits ne sont pas commissionés.
                    </Text>
                    <Text
                      style={{ fontSize: 11, color: C.textGray, marginTop: 4 }}
                    >
                      Frais de publication :{" "}
                      <Text style={{ fontWeight: "700", color: C.indigo }}>
                        {CREATION_FEE.toLocaleString()} FCFA
                      </Text>{" "}
                      (paiement à la fin)
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* ════ STEP 2 : DÉTAILS ════ */}
            {step === 2 && (
              <View>
                <View style={s.stepHeader}>
                  <LinearGradient
                    colors={[C.indigo, C.violet]}
                    style={s.stepHeaderIcon}
                  >
                    <Ionicons name="sparkles" size={20} color="#fff" />
                  </LinearGradient>
                  <View>
                    <Text style={s.stepTitle}>Description & médias</Text>
                    <Text style={s.stepSubtitle}>
                      Présentez votre événement
                    </Text>
                  </View>
                </View>

                <View style={s.card}>
                  <Text style={s.cardTitle}>Description courte</Text>
                  <TextInput
                    style={[s.input, { height: 80, paddingTop: 12 }]}
                    placeholder="Accroche de l'événement en 1-2 phrases…"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                    value={form.description}
                    onChangeText={(v) => setForm({ ...form, description: v })}
                  />
                </View>

                <View style={s.card}>
                  <Text style={s.cardTitle}>Description complète</Text>
                  <TextInput
                    style={[s.input, { height: 130, paddingTop: 12 }]}
                    placeholder="Programme détaillé, artistes, dress code, informations pratiques…"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                    value={form.longDescription}
                    onChangeText={(v) =>
                      setForm({ ...form, longDescription: v })
                    }
                  />
                </View>

                <View style={s.card}>
                  <Text style={s.cardTitle}>Tags</Text>
                  <View style={s.inputWithIcon}>
                    <Ionicons
                      name="pricetag-outline"
                      size={16}
                      color="#9CA3AF"
                    />
                    <TextInput
                      style={s.inputInner}
                      placeholder="musique, danse, abidjan…"
                      placeholderTextColor="#9CA3AF"
                      value={form.tags}
                      onChangeText={(v) => setForm({ ...form, tags: v })}
                      returnKeyType="done"
                    />
                  </View>
                  <Text
                    style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}
                  >
                    Séparez les tags par des virgules
                  </Text>
                </View>

                {/* Organisateur */}
                <View style={s.card}>
                  <Text style={s.cardTitle}>Organisateur</Text>
                  <Text style={s.fieldLabel}>Nom de l'organisation</Text>
                  <View style={[s.inputWithIcon, { marginBottom: 10 }]}>
                    <Ionicons
                      name="business-outline"
                      size={16}
                      color="#9CA3AF"
                    />
                    <TextInput
                      style={s.inputInner}
                      placeholder="EventPro CI"
                      placeholderTextColor="#9CA3AF"
                      value={form.organizerName}
                      onChangeText={(v) =>
                        setForm({ ...form, organizerName: v })
                      }
                    />
                  </View>
                  <Text style={s.fieldLabel}>Téléphone</Text>
                  <View style={[s.inputWithIcon, { marginBottom: 10 }]}>
                    <Ionicons name="call-outline" size={16} color="#9CA3AF" />
                    <TextInput
                      style={s.inputInner}
                      placeholder="+225 07 00 00 00 00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      value={form.organizerPhone}
                      onChangeText={(v) =>
                        setForm({ ...form, organizerPhone: v })
                      }
                    />
                  </View>
                  <Text style={s.fieldLabel}>Email</Text>
                  <View style={[s.inputWithIcon, { marginBottom: 10 }]}>
                    <Ionicons name="mail-outline" size={16} color="#9CA3AF" />
                    <TextInput
                      style={s.inputInner}
                      placeholder="contact@eventpro.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={form.organizerEmail}
                      onChangeText={(v) =>
                        setForm({ ...form, organizerEmail: v })
                      }
                    />
                  </View>
                  <Text style={s.fieldLabel}>Site web (facultatif)</Text>
                  <View style={s.inputWithIcon}>
                    <Ionicons name="globe-outline" size={16} color="#9CA3AF" />
                    <TextInput
                      style={s.inputInner}
                      placeholder="www.eventpro-ci.com"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      value={form.organizerWebsite}
                      onChangeText={(v) =>
                        setForm({ ...form, organizerWebsite: v })
                      }
                    />
                  </View>
                </View>

                {/* Sponsors */}
                <View style={s.card}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <Text style={s.cardTitle}>Sponsors & Partenaires</Text>
                    <TouchableOpacity onPress={addSponsor} activeOpacity={0.8}>
                      <LinearGradient
                        colors={[C.amber, C.pink]}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 10,
                        }}
                      >
                        <Ionicons name="add" size={14} color="#fff" />
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: "#fff",
                          }}
                        >
                          Ajouter
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  {sponsors.length === 0 && (
                    <View style={{ alignItems: "center", paddingVertical: 16 }}>
                      <Ionicons
                        name="ribbon-outline"
                        size={32}
                        color={C.textLight}
                      />
                      <Text
                        style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8 }}
                      >
                        Aucun sponsor ajouté
                      </Text>
                    </View>
                  )}
                  {sponsors.map((sp) => (
                    <View
                      key={sp.id}
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        marginBottom: 10,
                        alignItems: "center",
                      }}
                    >
                      <TextInput
                        style={[s.input, { flex: 1 }]}
                        placeholder="Nom du sponsor"
                        placeholderTextColor="#9CA3AF"
                        value={sp.name}
                        onChangeText={(v) => updateSponsor(sp.id, "name", v)}
                      />
                      <View style={{ flexDirection: "row", gap: 4 }}>
                        {(["or", "argent", "bronze"] as const).map((tier) => (
                          <TouchableOpacity
                            key={tier}
                            onPress={() => updateSponsor(sp.id, "tier", tier)}
                            activeOpacity={0.8}
                          >
                            <View
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor:
                                  sp.tier === tier
                                    ? tier === "or"
                                      ? "#FFC10722"
                                      : tier === "argent"
                                        ? "#9CA3AF22"
                                        : "#B4530922"
                                    : C.sand,
                                borderWidth: 1.5,
                                borderColor:
                                  sp.tier === tier
                                    ? tier === "or"
                                      ? C.amber
                                      : tier === "argent"
                                        ? "#9CA3AF"
                                        : "#B45309"
                                    : "transparent",
                              }}
                            >
                              <Text style={{ fontSize: 13 }}>
                                {tier === "or"
                                  ? "🥇"
                                  : tier === "argent"
                                    ? "🥈"
                                    : "🥉"}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity
                        onPress={() => removeSponsor(sp.id)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: "#FEE2E2",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={14}
                            color="#EF4444"
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ════ STEP 3 : PROGRAMME ════ */}
            {step === 3 && (
              <View>
                <View style={s.stepHeader}>
                  <LinearGradient
                    colors={[C.pink, C.violet]}
                    style={s.stepHeaderIcon}
                  >
                    <Ionicons name="list" size={20} color="#fff" />
                  </LinearGradient>
                  <View>
                    <Text style={s.stepTitle}>Programme</Text>
                    <Text style={s.stepSubtitle}>Déroulé de l'événement</Text>
                  </View>
                </View>

                <View style={s.card}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <Text style={s.cardTitle}>Étapes du programme</Text>
                    <TouchableOpacity
                      onPress={addProgramItem}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[C.indigo, C.violet]}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          borderRadius: 10,
                        }}
                      >
                        <Ionicons name="add" size={15} color="#fff" />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: "#fff",
                          }}
                        >
                          Ajouter
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {programItems.map((item, idx) => (
                    <View key={item.id} style={{ marginBottom: 16 }}>
                      {/* Timeline visuelle */}
                      <View style={{ flexDirection: "row", gap: 12 }}>
                        <View style={{ alignItems: "center" }}>
                          <LinearGradient
                            colors={[C.indigo, C.violet]}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: "800",
                                color: "#fff",
                              }}
                            >
                              {idx + 1}
                            </Text>
                          </LinearGradient>
                          {idx < programItems.length - 1 && (
                            <View
                              style={{
                                width: 2,
                                flex: 1,
                                backgroundColor: C.sand,
                                marginTop: 4,
                              }}
                            />
                          )}
                        </View>
                        <View
                          style={{
                            flex: 1,
                            paddingBottom:
                              idx < programItems.length - 1 ? 12 : 0,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 8,
                              marginBottom: 8,
                            }}
                          >
                            <View style={{ width: 80 }}>
                              <TextInput
                                style={s.input}
                                placeholder="20h00"
                                placeholderTextColor="#9CA3AF"
                                value={item.time}
                                onChangeText={(v) =>
                                  updateProgramItem(item.id, "time", v)
                                }
                              />
                            </View>
                            <TextInput
                              style={[s.input, { flex: 1 }]}
                              placeholder="Titre de l'étape"
                              placeholderTextColor="#9CA3AF"
                              value={item.title}
                              onChangeText={(v) =>
                                updateProgramItem(item.id, "title", v)
                              }
                            />
                          </View>
                          <TextInput
                            style={[s.input, { marginBottom: 8 }]}
                            placeholder="Intervenant / Artiste (optionnel)"
                            placeholderTextColor="#9CA3AF"
                            value={item.speaker}
                            onChangeText={(v) =>
                              updateProgramItem(item.id, "speaker", v)
                            }
                          />
                          <TextInput
                            style={s.input}
                            placeholder="Description (optionnel)"
                            placeholderTextColor="#9CA3AF"
                            value={item.description}
                            onChangeText={(v) =>
                              updateProgramItem(item.id, "description", v)
                            }
                          />
                          {programItems.length > 1 && (
                            <TouchableOpacity
                              onPress={() => removeProgramItem(item.id)}
                              activeOpacity={0.8}
                              style={{
                                alignSelf: "flex-end",
                                marginTop: 6,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={12}
                                color="#EF4444"
                              />
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: "#EF4444",
                                  fontWeight: "600",
                                }}
                              >
                                Supprimer
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                <LinearGradient
                  colors={[C.sand, C.cream]}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: "rgba(99,102,241,0.1)",
                  }}
                >
                  <Ionicons name="bulb-outline" size={20} color={C.indigo} />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 12,
                      color: C.textMid,
                      lineHeight: 18,
                    }}
                  >
                    Un programme clair rassure les participants et augmente les
                    ventes. Vous pouvez l'enrichir après publication.
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* ════ STEP 4 : PUBLIER ════ */}
            {step === 4 && (
              <View>
                <View style={s.stepHeader}>
                  <LinearGradient
                    colors={[C.emerald, "#059669"]}
                    style={s.stepHeaderIcon}
                  >
                    <Ionicons name="rocket" size={20} color="#fff" />
                  </LinearGradient>
                  <View>
                    <Text style={s.stepTitle}>Prêt à publier !</Text>
                    <Text style={s.stepSubtitle}>Vérifiez et confirmez</Text>
                  </View>
                </View>

                {/* Récap événement — style event-detail */}
                <View style={s.card}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <LinearGradient
                      colors={selectedCat?.gradient || [C.indigo, C.violet]}
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 13,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name={(selectedCat?.icon || "apps") as any}
                        size={22}
                        color="#fff"
                      />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "800",
                          color: C.textDark,
                        }}
                      >
                        {form.title || "Votre événement"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: C.textMid,
                          fontWeight: "600",
                          marginTop: 2,
                        }}
                      >
                        {form.category === "autre"
                          ? form.customCategory || "Autre"
                          : selectedCat?.label || "—"}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      height: 1,
                      backgroundColor: C.sand,
                      marginBottom: 12,
                    }}
                  />
                  {[
                    {
                      icon: "calendar-outline",
                      label: "Date",
                      value: selectedDate
                        ? isPeriod && selectedEndDate
                          ? `${formatDate(selectedDate)} → ${formatDate(selectedEndDate)}`
                          : formatDateLong(selectedDate)
                        : "Non défini",
                    },
                    {
                      icon: "time-outline",
                      label: "Heure",
                      value: timeConfirmed
                        ? formatTime(startHour, startMinute) +
                          (endTimeConfirmed
                            ? ` — ${formatTime(endHour, endMinute)}`
                            : "")
                        : "Non défini",
                    },
                    {
                      icon: "location-outline",
                      label: "Lieu",
                      value: form.location || "Non défini",
                    },
                    {
                      icon: "ticket-outline",
                      label: "Capacité",
                      value: form.totalTickets
                        ? `${form.totalTickets} places`
                        : "Non défini",
                    },
                    {
                      icon: "cash-outline",
                      label: "Prix",
                      value: isFree
                        ? "Gratuit"
                        : form.price
                          ? `dès ${parseInt(form.price).toLocaleString()} FCFA`
                          : "Non défini",
                    },
                    ...(hasVip
                      ? [
                          {
                            icon: "star-outline",
                            label: "VIP",
                            value: `${form.vipCount || "?"} × ${form.vipPrice ? parseInt(form.vipPrice).toLocaleString() : "?"} F`,
                          },
                        ]
                      : []),
                    ...(hasVvip
                      ? [
                          {
                            icon: "diamond-outline",
                            label: "VVIP",
                            value: `${form.vvipCount || "?"} × ${form.vvipPrice ? parseInt(form.vvipPrice).toLocaleString() : "?"} F`,
                          },
                        ]
                      : []),
                    ...(programItems.filter((p) => p.title).length > 0
                      ? [
                          {
                            icon: "list-outline",
                            label: "Programme",
                            value: `${programItems.filter((p) => p.title).length} étape(s)`,
                          },
                        ]
                      : []),
                    ...(sponsors.length > 0
                      ? [
                          {
                            icon: "ribbon-outline",
                            label: "Sponsors",
                            value: `${sponsors.length} partenaire(s)`,
                          },
                        ]
                      : []),
                  ].map((item) => (
                    <View
                      key={item.label}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={14}
                        color={C.textLight}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#9CA3AF",
                          fontWeight: "500",
                          width: 62,
                        }}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: C.textDark,
                          fontWeight: "600",
                          flex: 1,
                        }}
                      >
                        {item.value}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Checklist */}
                <View style={s.card}>
                  <Text style={s.cardTitle}>Checklist avant publication</Text>
                  {[
                    { text: "Titre renseigné", ok: !!form.title },
                    {
                      text: "Catégorie choisie",
                      ok:
                        !!form.category &&
                        (form.category !== "autre" || !!form.customCategory),
                    },
                    { text: "Date sélectionnée", ok: !!selectedDate },
                    { text: "Lieu défini", ok: !!form.location },
                    {
                      text: "Billets configurés",
                      ok: !!form.totalTickets || isFree,
                    },
                    { text: "Description ajoutée", ok: !!form.description },
                  ].map((item, i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          backgroundColor: item.ok ? C.emerald : "#E5E7EB",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {item.ok && (
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 13,
                          color: item.ok ? C.textDark : "#9CA3AF",
                          fontWeight: "500",
                        }}
                      >
                        {item.text}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Frais de publication */}
                <LinearGradient
                  colors={[C.indigoDark, C.indigo]}
                  style={{ borderRadius: 18, padding: 18, marginBottom: 14 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={22}
                      color={C.amberLight}
                    />
                    <Text
                      style={{ fontSize: 15, fontWeight: "800", color: "#fff" }}
                    >
                      Frais de publication
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}
                    >
                      Publication de l'événement
                    </Text>
                    <Text
                      style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}
                    >
                      {CREATION_FEE.toLocaleString()} FCFA
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}
                    >
                      Commission / vente (si payant)
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: C.amberLight,
                      }}
                    >
                      5%
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 1,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      marginBottom: 12,
                    }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{ fontSize: 15, fontWeight: "900", color: "#fff" }}
                    >
                      À payer maintenant
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "900",
                        color: C.amberLight,
                      }}
                    >
                      {CREATION_FEE.toLocaleString()} FCFA
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 8,
                    }}
                  >
                    Paiement sécurisé · Mobile Money ou Carte bancaire
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* ── NAVIGATION ── */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
              {step > 0 && (
                <TouchableOpacity
                  style={s.backBtn}
                  onPress={() => setStep(step - 1)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-back" size={18} color={C.textMid} />
                  <Text style={s.backBtnText}>Retour</Text>
                </TouchableOpacity>
              )}
              {step < STEPS.length - 1 ? (
                <TouchableOpacity
                  style={[s.nextBtn, step === 0 && { marginLeft: 0 }]}
                  onPress={handleNext}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={[C.emerald, "#059669"]}
                    style={s.nextBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={s.nextBtnText}>Continuer</Text>
                    <Ionicons name="chevron-forward" size={18} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={s.nextBtn}
                  onPress={() => setShowPaymentModal(true)}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={[C.amber, C.pink]}
                    style={s.nextBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="rocket-outline" size={18} color="#fff" />
                    <Text style={s.nextBtnText}>Payer et publier</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

// ── Styles paiement ─────────────────────────────
const payS = StyleSheet.create({
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
  amountNote: { fontSize: 11, color: C.textGray, textAlign: "center" },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textDark,
    marginBottom: 8,
    marginTop: 16,
  },
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
  summaryCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: C.sand,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: C.textDark,
    marginBottom: 10,
  },
  cardPreview: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 4,
    height: 170,
    justifyContent: "space-between",
  },
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
    marginBottom: 4,
  },
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
});

// ── Styles principaux ──────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgLight },
  header: {
    paddingBottom: 24,
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
    bottom: 0,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  headerEmoji: { position: "absolute", top: 50, right: 22, fontSize: 44 },
  headerSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 20,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  stepItem: { alignItems: "center", gap: 5, flex: 1 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNum: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.6)" },
  stepNumActive: { color: C.indigoDark },
  stepLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
    textAlign: "center",
  },
  stepLabelActive: { color: "rgba(255,255,255,0.9)" },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  content: { paddingHorizontal: 16, paddingTop: 18 },
  // Step header
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  stepHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  stepTitle: { fontSize: 17, fontWeight: "800", color: C.textDark },
  stepSubtitle: { fontSize: 12, color: C.textGray, marginTop: 2 },
  // Cards
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
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.textDark,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textMid,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: C.bgLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: C.textDark,
    fontWeight: "500",
    borderWidth: 1.5,
    borderColor: C.sand,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.bgLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: C.sand,
  },
  inputInner: { flex: 1, fontSize: 14, color: C.textDark, fontWeight: "500" },
  inputPrefix: { fontSize: 12, fontWeight: "700", color: C.textMid },
  // Picker
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: C.sand,
    backgroundColor: C.white,
  },
  pickerBtnFilled: { borderColor: C.indigo },
  pickerBtnText: { flex: 1, fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  pickerBtnTextFilled: { color: C.textDark, fontWeight: "700" },
  pickerSubtext: {
    fontSize: 10,
    color: C.indigo,
    fontWeight: "600",
    marginTop: 4,
  },
  // Categories
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.sand,
  },
  catItemText: { fontSize: 11, fontWeight: "600", color: C.textMid },
  catItemActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  catItemTextActive: { fontSize: 11, fontWeight: "700", color: "#fff" },
  // Toggles
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: C.sand,
  },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  toggleIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleLabel: { fontSize: 13, fontWeight: "700", color: C.textDark },
  toggleSub: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  // Tiers
  tierHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 14,
  },
  tierHeaderBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  // Nav
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: C.sand,
  },
  backBtnText: { fontSize: 13, fontWeight: "700", color: C.textMid },
  nextBtn: { flex: 1, borderRadius: 13, overflow: "hidden" },
  nextBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});
