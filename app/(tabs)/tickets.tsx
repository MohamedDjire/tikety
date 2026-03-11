/**
 * tickets.tsx — Mes Billets
 *
 * Dépendances supplémentaires à installer :
 *   npx expo install expo-print expo-sharing expo-media-library react-native-view-shot
 */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import ViewShot from "react-native-view-shot";

const { width } = Dimensions.get("window");
const TICKET_W = width - 40;

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

// ─── Pattern QR simulé déterministe ───────────────
const QR_PATTERN: boolean[][] = Array(9)
  .fill(0)
  .map((_, r) =>
    Array(9)
      .fill(0)
      .map((_, c) => {
        const corner = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
        const inner =
          (r >= 1 && r <= 1 && c >= 1 && c <= 1) ||
          (r >= 1 && r <= 1 && c >= 6 && c <= 6) ||
          (r >= 6 && r <= 6 && c >= 1 && c <= 1);
        const data = Math.sin(r * 11 + c * 7 + 3) > 0.1;
        return corner || inner || data;
      }),
  );

// ─── Types ────────────────────────────────────────
interface Organizer {
  name: string;
  phone: string;
  email: string;
  website?: string;
  slogan?: string;
  logo?: string; // URL
}
interface Sponsor {
  name: string;
  logo?: string;
}
interface Ticket {
  id: string;
  eventTitle: string;
  date: string;
  time: string;
  location: string;
  seat: string;
  status: "upcoming" | "past" | "cancelled";
  price: number;
  category: string;
  gradient: [string, string];
  qrCode: string;
  ticketNumber: string;
  bannerUrl: string;
  holder: string;
  organizer: Organizer;
  sponsors: Sponsor[];
  tierColor: string;
}

// ─── Mock data ────────────────────────────────────
const TICKETS: Ticket[] = [
  {
    id: "T001",
    eventTitle: "Soirée Gala 2025",
    date: "Sam 15 Mar 2025",
    time: "20h00",
    location: "Sofitel Hôtel Ivoire, Abidjan",
    seat: "VIP — Table 4",
    status: "upcoming",
    price: 15000,
    category: "Gala",
    gradient: [C.indigo, C.violet],
    qrCode: "TKT-2025-001-GALA",
    ticketNumber: "#00124",
    bannerUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    holder: "Konan Aya",
    tierColor: C.amber,
    organizer: {
      name: "EventPro Côte d'Ivoire",
      phone: "+225 07 07 07 07 07",
      email: "contact@eventpro-ci.com",
      website: "www.eventpro-ci.com",
      slogan: "L'excellence événementielle en Afrique",
    },
    sponsors: [
      { name: "MTN CI" },
      { name: "Orange CI" },
      { name: "Brasseries Abidjan" },
    ],
  },
  {
    id: "T002",
    eventTitle: "Concert Afrobeats",
    date: "Dim 22 Mar 2025",
    time: "19h30",
    location: "Palais de la Culture, Abidjan",
    seat: "Fosse — Zone A",
    status: "upcoming",
    price: 5000,
    category: "Concert",
    gradient: [C.pink, C.violet],
    qrCode: "TKT-2025-002-AFRO",
    ticketNumber: "#00125",
    bannerUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    holder: "Konan Aya",
    tierColor: C.pink,
    organizer: {
      name: "Abidjan Live Events",
      phone: "+225 05 05 05 05 05",
      email: "info@abidjan-live.com",
      slogan: "Vibrez avec nous 🎶",
    },
    sponsors: [{ name: "Wave CI" }, { name: "Canal+ Afrique" }],
  },
  {
    id: "T003",
    eventTitle: "Festival Musique 2024",
    date: "Sam 14 Déc 2024",
    time: "18h00",
    location: "Stade Félix Houphouët-Boigny",
    seat: "Tribune Est — Rang 5",
    status: "past",
    price: 3000,
    category: "Festival",
    gradient: [C.amber, C.pink],
    qrCode: "TKT-2024-088-FEST",
    ticketNumber: "#00088",
    bannerUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    holder: "Konan Aya",
    tierColor: C.emerald,
    organizer: {
      name: "Festival CI",
      phone: "+225 01 01 01 01 01",
      email: "festival@ci.com",
      slogan: "La fête de la musique ivoirienne",
    },
    sponsors: [
      { name: "Airness" },
      { name: "SIB Banque" },
      { name: "Prosuma" },
      { name: "Nestlé CI" },
    ],
  },
];

const TABS = ["À venir", "Passés", "Annulés"];

// ════════════════════════════════════════════════
//  Badge Ticket — contenu visuel (ref pour capture)
// ════════════════════════════════════════════════
function TicketBadge({
  ticket,
  forExport = false,
}: {
  ticket: Ticket;
  forExport?: boolean;
}) {
  const W = forExport ? 380 : TICKET_W;

  return (
    <View style={[badgeStyles.root, { width: W }]}>
      {/* ── Bannière ── */}
      <View style={badgeStyles.bannerWrap}>
        <Image
          source={{ uri: ticket.bannerUrl }}
          style={badgeStyles.banner}
          resizeMode="cover"
        />
        {/* Overlay gradient sur la bannière */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.72)"]}
          style={badgeStyles.bannerOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        {/* Badges sur la bannière */}
        <View style={badgeStyles.bannerTopRow}>
          <View
            style={[
              badgeStyles.catBadge,
              { backgroundColor: "rgba(0,0,0,0.45)" },
            ]}
          >
            <Text style={badgeStyles.catBadgeText}>
              {ticket.category.toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              badgeStyles.tierBadge,
              { backgroundColor: ticket.tierColor },
            ]}
          >
            <Ionicons name="star" size={10} color="#fff" />
            <Text style={badgeStyles.tierText}>
              {ticket.seat.split("—")[0].trim()}
            </Text>
          </View>
        </View>
        {/* Titre sur la bannière */}
        <View style={badgeStyles.bannerBottom}>
          <Text style={badgeStyles.bannerTitle} numberOfLines={2}>
            {ticket.eventTitle}
          </Text>
          <Text style={badgeStyles.bannerTicketNum}>{ticket.ticketNumber}</Text>
        </View>
      </View>

      {/* ── Corps principal ── */}
      <LinearGradient colors={["#1E1B4B", "#312E81"]} style={badgeStyles.body}>
        {/* Infos détaillées */}
        <View style={badgeStyles.infoGrid}>
          {[
            { icon: "calendar", label: "Date", value: ticket.date },
            { icon: "time", label: "Heure", value: ticket.time },
            { icon: "location", label: "Lieu", value: ticket.location },
            { icon: "person", label: "Titulaire", value: ticket.holder },
          ].map((item) => (
            <View key={item.label} style={badgeStyles.infoItem}>
              <LinearGradient
                colors={ticket.gradient}
                style={badgeStyles.infoIconBox}
              >
                <Ionicons name={item.icon as any} size={12} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={badgeStyles.infoLabel}>{item.label}</Text>
                <Text style={badgeStyles.infoValue} numberOfLines={1}>
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Séparateur perforé */}
        <View style={badgeStyles.perf}>
          <View style={badgeStyles.perfCircle} />
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 4,
            }}
          >
            {Array(22)
              .fill(0)
              .map((_, i) => (
                <View key={i} style={badgeStyles.perfDash} />
              ))}
          </View>
          <View style={badgeStyles.perfCircle} />
        </View>

        {/* QR + prix */}
        <View style={badgeStyles.qrRow}>
          {/* QR Code */}
          <View style={badgeStyles.qrWrap}>
            <View style={badgeStyles.qrBox}>
              {QR_PATTERN.map((row, r) => (
                <View key={r} style={{ flexDirection: "row" }}>
                  {row.map((filled, c) => (
                    <View
                      key={c}
                      style={[
                        badgeStyles.qrCell,
                        filled ? badgeStyles.qrFilled : badgeStyles.qrEmpty,
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
            <Text style={badgeStyles.qrCode}>{ticket.qrCode}</Text>
            <Text style={badgeStyles.qrHint}>Scanner à l'entrée</Text>
          </View>

          {/* Prix + place */}
          <View style={badgeStyles.priceBlock}>
            <Text style={badgeStyles.priceLabel}>Montant payé</Text>
            <Text style={badgeStyles.priceValue}>
              {ticket.price.toLocaleString()}
            </Text>
            <Text style={badgeStyles.priceCurrency}>FCFA</Text>
            <View
              style={[
                badgeStyles.seatPill,
                { backgroundColor: ticket.tierColor + "33" },
              ]}
            >
              <Text style={[badgeStyles.seatText, { color: ticket.tierColor }]}>
                {ticket.seat}
              </Text>
            </View>
            {ticket.status === "upcoming" ? (
              <View style={badgeStyles.validBadge}>
                <Ionicons name="checkmark-circle" size={12} color={C.emerald} />
                <Text style={badgeStyles.validText}>Billet valide</Text>
              </View>
            ) : (
              <View style={badgeStyles.usedBadge}>
                <Text style={badgeStyles.usedText}>Utilisé</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Séparateur ── */}
        <View style={badgeStyles.divider} />

        {/* ── Organisateur ── */}
        <View style={badgeStyles.organizerSection}>
          <View style={badgeStyles.organizerHeader}>
            <LinearGradient
              colors={[C.amber, C.pink]}
              style={badgeStyles.organizerDot}
            />
            <Text style={badgeStyles.organizerSectionTitle}>Organisateur</Text>
          </View>
          <Text style={badgeStyles.organizerName}>{ticket.organizer.name}</Text>
          {ticket.organizer.slogan && (
            <Text style={badgeStyles.organizerSlogan}>
              « {ticket.organizer.slogan} »
            </Text>
          )}
          <View style={badgeStyles.organizerContacts}>
            <View style={badgeStyles.contactItem}>
              <Ionicons name="call-outline" size={11} color={C.textLight} />
              <Text style={badgeStyles.contactText}>
                {ticket.organizer.phone}
              </Text>
            </View>
            <View style={badgeStyles.contactItem}>
              <Ionicons name="mail-outline" size={11} color={C.textLight} />
              <Text style={badgeStyles.contactText}>
                {ticket.organizer.email}
              </Text>
            </View>
            {ticket.organizer.website && (
              <View style={badgeStyles.contactItem}>
                <Ionicons name="globe-outline" size={11} color={C.textLight} />
                <Text style={badgeStyles.contactText}>
                  {ticket.organizer.website}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Sponsors ── */}
        {ticket.sponsors.length > 0 && (
          <>
            <View style={badgeStyles.divider} />
            <View style={badgeStyles.sponsorsSection}>
              <Text style={badgeStyles.sponsorsSectionTitle}>
                Partenaires & Sponsors
              </Text>
              <View style={badgeStyles.sponsorsRow}>
                {ticket.sponsors.map((sp, i) => (
                  <LinearGradient
                    key={i}
                    colors={[
                      "rgba(255,255,255,0.12)",
                      "rgba(255,255,255,0.06)",
                    ]}
                    style={badgeStyles.sponsorPill}
                  >
                    <Text style={badgeStyles.sponsorName}>{sp.name}</Text>
                  </LinearGradient>
                ))}
              </View>
            </View>
          </>
        )}

        {/* ── Footer Tikety ── */}
        <View style={badgeStyles.footer}>
          <LinearGradient
            colors={ticket.gradient}
            style={badgeStyles.footerLogo}
          >
            <Ionicons name="ticket" size={12} color="#fff" />
          </LinearGradient>
          <Text style={badgeStyles.footerBrand}>Tikety</Text>
          <Text style={badgeStyles.footerSub}>
            · Billetterie digitale · Côte d'Ivoire
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

// ════════════════════════════════════════════════
//  Modal ticket complet
// ════════════════════════════════════════════════
function TicketModal({
  ticket,
  onClose,
}: {
  ticket: Ticket;
  onClose: () => void;
}) {
  const viewShotRef = useRef<ViewShot>(null);
  const [downloading, setDownloading] = useState<"none" | "image" | "pdf">(
    "none",
  );

  const slideAnim = useRef(new Animated.Value(600)).current;
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
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  // ── Télécharger en image PNG ───────────────────
  const downloadAsImage = async () => {
    try {
      setDownloading("image");
      const uri = await (viewShotRef.current as any)?.capture();
      if (!uri) throw new Error("Capture échouée");

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert(
          "✅ Enregistré !",
          "Le ticket a été sauvegardé dans votre galerie.",
        );
      } else {
        // Partager si pas d'accès galerie
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Partager le ticket",
          });
        }
      }
    } catch (e) {
      Alert.alert(
        "Erreur",
        "Impossible d'enregistrer l'image. Vérifiez les permissions.",
      );
    } finally {
      setDownloading("none");
    }
  };

  // ── Télécharger en PDF ─────────────────────────
  const downloadAsPdf = async () => {
    try {
      setDownloading("pdf");

      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; font-family: 'Helvetica Neue', Arial, sans-serif; }
  body { background:#F1F0FF; padding:20px; }
  .ticket { width:100%; max-width:480px; margin:0 auto; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(99,102,241,0.3); }
  .banner { width:100%; height:180px; object-fit:cover; display:block; }
  .body { background:linear-gradient(135deg,#1E1B4B,#312E81); padding:20px; color:#fff; }
  .title { font-size:22px; font-weight:900; margin-bottom:4px; }
  .sub { font-size:12px; color:rgba(255,255,255,0.6); margin-bottom:16px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
  .info-item { display:flex; flex-direction:column; gap:2px; }
  .info-label { font-size:10px; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:0.5px; }
  .info-value { font-size:13px; font-weight:700; }
  .divider { height:1px; background:rgba(255,255,255,0.15); margin:14px 0; }
  .qr-row { display:flex; gap:16px; align-items:center; margin-bottom:16px; }
  .qr-placeholder { width:90px; height:90px; background:#fff; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:9px; color:#333; text-align:center; padding:6px; }
  .price-block { flex:1; }
  .price-label { font-size:10px; color:rgba(255,255,255,0.5); margin-bottom:2px; }
  .price { font-size:26px; font-weight:900; color:#FCD34D; }
  .seat { font-size:12px; color:rgba(255,255,255,0.7); margin-top:4px; }
  .organizer { margin-bottom:12px; }
  .org-name { font-size:14px; font-weight:800; margin-bottom:2px; }
  .org-slogan { font-size:11px; color:rgba(255,255,255,0.6); font-style:italic; margin-bottom:6px; }
  .contact { font-size:11px; color:rgba(161,180,252,0.9); margin-bottom:2px; }
  .sponsors { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
  .sponsor { background:rgba(255,255,255,0.1); border-radius:8px; padding:4px 10px; font-size:11px; font-weight:600; }
  .footer { display:flex; align-items:center; gap:6px; margin-top:14px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1); }
  .footer-brand { font-size:14px; font-weight:900; color:#FCD34D; }
  .footer-sub { font-size:11px; color:rgba(255,255,255,0.5); }
  .valid { display:inline-block; background:#10B981; color:#fff; font-size:10px; font-weight:700; padding:3px 10px; border-radius:8px; margin-top:6px; }
</style>
</head>
<body>
<div class="ticket">
  <img class="banner" src="${ticket.bannerUrl}" alt="bannière" crossorigin="anonymous"/>
  <div class="body">
    <div class="title">${ticket.eventTitle}</div>
    <div class="sub">${ticket.category} · ${ticket.ticketNumber}</div>
    <div class="grid">
      <div class="info-item"><span class="info-label">Date</span><span class="info-value">${ticket.date}</span></div>
      <div class="info-item"><span class="info-label">Heure</span><span class="info-value">${ticket.time}</span></div>
      <div class="info-item"><span class="info-label">Lieu</span><span class="info-value">${ticket.location}</span></div>
      <div class="info-item"><span class="info-label">Titulaire</span><span class="info-value">${ticket.holder}</span></div>
    </div>
    <div class="divider"></div>
    <div class="qr-row">
      <div class="qr-placeholder">QR CODE<br/><strong>${ticket.qrCode}</strong></div>
      <div class="price-block">
        <div class="price-label">Montant payé</div>
        <div class="price">${ticket.price.toLocaleString()} FCFA</div>
        <div class="seat">${ticket.seat}</div>
        ${ticket.status === "upcoming" ? '<div class="valid">✓ Billet valide</div>' : '<div class="valid" style="background:#6B7280">Utilisé</div>'}
      </div>
    </div>
    <div class="divider"></div>
    <div class="organizer">
      <div class="org-name">${ticket.organizer.name}</div>
      ${ticket.organizer.slogan ? `<div class="org-slogan">« ${ticket.organizer.slogan} »</div>` : ""}
      <div class="contact">📞 ${ticket.organizer.phone}</div>
      <div class="contact">✉️ ${ticket.organizer.email}</div>
      ${ticket.organizer.website ? `<div class="contact">🌐 ${ticket.organizer.website}</div>` : ""}
    </div>
    ${
      ticket.sponsors.length > 0
        ? `
    <div class="divider"></div>
    <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Partenaires & Sponsors</div>
    <div class="sponsors">
      ${ticket.sponsors.map((sp) => `<span class="sponsor">${sp.name}</span>`).join("")}
    </div>`
        : ""
    }
    <div class="footer">
      <span class="footer-brand">Tikety</span>
      <span class="footer-sub">· Billetterie digitale · Côte d'Ivoire</span>
    </div>
  </div>
</div>
</body>
</html>`;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Billet — ${ticket.eventTitle}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("✅ PDF généré !", `Fichier : ${uri}`);
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible de générer le PDF.");
    } finally {
      setDownloading("none");
    }
  };

  return (
    <Modal
      transparent
      visible
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View style={[modalStyles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[
            modalStyles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle */}
          <View style={modalStyles.handle} />

          {/* Titre + fermer */}
          <View style={modalStyles.sheetHeader}>
            <View>
              <Text style={modalStyles.sheetTitle}>Votre billet</Text>
              <Text style={modalStyles.sheetSub}>
                {ticket.ticketNumber} · {ticket.category}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={modalStyles.closeBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={C.textDark} />
            </TouchableOpacity>
          </View>

          {/* Ticket badge — capturé par ViewShot */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            <ViewShot
              ref={viewShotRef}
              options={{ format: "png", quality: 1.0 }}
            >
              <TicketBadge ticket={ticket} />
            </ViewShot>
          </ScrollView>

          {/* Boutons de téléchargement */}
          <View style={modalStyles.downloadRow}>
            <TouchableOpacity
              style={[
                modalStyles.dlBtn,
                downloading === "image" && modalStyles.dlBtnLoading,
              ]}
              onPress={downloadAsImage}
              activeOpacity={0.85}
              disabled={downloading !== "none"}
            >
              <LinearGradient
                colors={[C.indigo, C.violet]}
                style={modalStyles.dlBtnGrad}
              >
                {downloading === "image" ? (
                  <Text style={modalStyles.dlBtnText}>Capture…</Text>
                ) : (
                  <>
                    <Ionicons name="image-outline" size={16} color="#fff" />
                    <Text style={modalStyles.dlBtnText}>Enregistrer image</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                modalStyles.dlBtn,
                downloading === "pdf" && modalStyles.dlBtnLoading,
              ]}
              onPress={downloadAsPdf}
              activeOpacity={0.85}
              disabled={downloading !== "none"}
            >
              <LinearGradient
                colors={[C.emerald, "#059669"]}
                style={modalStyles.dlBtnGrad}
              >
                {downloading === "pdf" ? (
                  <Text style={modalStyles.dlBtnText}>Génération…</Text>
                ) : (
                  <>
                    <Ionicons name="document-outline" size={16} color="#fff" />
                    <Text style={modalStyles.dlBtnText}>Télécharger PDF</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ════════════════════════════════════════════════
//  PAGE PRINCIPALE
// ════════════════════════════════════════════════
export default function TicketsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const tabIndicator = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const cardAnims = useRef(TICKETS.map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
      100,
      cardAnims.map((a) =>
        Animated.spring(a, {
          toValue: 1,
          tension: 55,
          friction: 8,
          useNativeDriver: true,
        }),
      ),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const switchTab = (i: number) => {
    setActiveTab(i);
    Animated.spring(tabIndicator, {
      toValue: i * ((width - 36) / 3),
      tension: 70,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const filtered = TICKETS.filter((t) => {
    if (activeTab === 0) return t.status === "upcoming";
    if (activeTab === 1) return t.status === "past";
    return t.status === "cancelled";
  });

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Modal ticket */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── HEADER ── */}
        <LinearGradient
          colors={[C.indigoDark, C.indigo, "#5B21B6"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerCircle1} />
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerSub}>Mon portefeuille</Text>
                <Text style={styles.headerTitle}>Mes Billets 🎟️</Text>
              </View>
              <Animated.View
                style={[
                  styles.headerBadge,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <LinearGradient
                  colors={[C.amber, C.pink]}
                  style={styles.headerBadgeGradient}
                >
                  <Text style={styles.headerBadgeText}>
                    {TICKETS.filter((t) => t.status === "upcoming").length}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </View>
            <View style={styles.headerStats}>
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatValue}>
                  {TICKETS.filter((t) => t.status === "upcoming").length}
                </Text>
                <Text style={styles.headerStatLabel}>À venir</Text>
              </View>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatValue}>
                  {TICKETS.filter((t) => t.status === "past").length}
                </Text>
                <Text style={styles.headerStatLabel}>Passés</Text>
              </View>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatValue}>
                  {TICKETS.reduce((s, t) => s + t.price, 0).toLocaleString()} F
                </Text>
                <Text style={styles.headerStatLabel}>Dépensés</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* ── TABS ── */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsTrack}>
            <Animated.View
              style={[
                styles.tabsIndicator,
                {
                  transform: [{ translateX: tabIndicator }],
                  width: (width - 36) / 3,
                },
              ]}
            />
            {TABS.map((tab, i) => (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                onPress={() => switchTab(i)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === i && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── LISTE ── */}
        <View style={styles.content}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎟️</Text>
              <Text style={styles.emptyText}>
                {activeTab === 0
                  ? "Aucun billet à venir"
                  : activeTab === 1
                    ? "Aucun événement passé"
                    : "Aucun billet annulé"}
              </Text>
              <Text style={styles.emptySub}>
                Explorez les événements disponibles
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/explore" as any)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[C.indigo, C.violet]}
                  style={styles.emptyBtn}
                >
                  <Text style={styles.emptyBtnText}>
                    Découvrir des événements
                  </Text>
                  <Ionicons name="arrow-forward" size={15} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map((ticket, index) => {
              const anim = cardAnims[Math.min(index, cardAnims.length - 1)];
              return (
                <TouchableOpacity
                  key={ticket.id}
                  activeOpacity={0.88}
                  onPress={() => setSelectedTicket(ticket)}
                >
                  <Animated.View
                    style={[
                      styles.ticketCard,
                      {
                        opacity: anim,
                        transform: [
                          {
                            translateY: (anim as any).interpolate({
                              inputRange: [0, 1],
                              outputRange: [40, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {/* Thumbnail bannière */}
                    <View style={styles.ticketThumb}>
                      <Image
                        source={{ uri: ticket.bannerUrl }}
                        style={styles.ticketThumbImg}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={ticket.gradient}
                        style={styles.ticketThumbOverlay}
                      >
                        <Ionicons name="ticket" size={18} color="#fff" />
                      </LinearGradient>
                    </View>

                    <View style={styles.ticketBody}>
                      <View style={styles.ticketTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.ticketTitle} numberOfLines={1}>
                            {ticket.eventTitle}
                          </Text>
                          <Text style={styles.ticketCategoryBadge}>
                            {ticket.category} · {ticket.seat}
                          </Text>
                        </View>
                        {ticket.status === "upcoming" ? (
                          <LinearGradient
                            colors={[C.emerald, "#059669"]}
                            style={styles.statusBadge}
                          >
                            <Ionicons
                              name="checkmark-circle"
                              size={11}
                              color="#fff"
                            />
                            <Text style={styles.statusText}>Valide</Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.statusBadgePast}>
                            <Text style={styles.statusTextPast}>Passé</Text>
                          </View>
                        )}
                      </View>

                      {/* Séparateur perforé */}
                      <View style={styles.ticketSeparator}>
                        <View style={styles.notchLeft} />
                        <View style={styles.dottedLine}>
                          {Array(15)
                            .fill(0)
                            .map((_, i) => (
                              <View key={i} style={styles.dot} />
                            ))}
                        </View>
                        <View style={styles.notchRight} />
                      </View>

                      <View style={styles.ticketDetails}>
                        <View style={styles.ticketDetailItem}>
                          <Ionicons
                            name="location-outline"
                            size={12}
                            color="#9CA3AF"
                          />
                          <Text
                            style={styles.ticketDetailText}
                            numberOfLines={1}
                          >
                            {ticket.location}
                          </Text>
                        </View>
                        <View style={styles.ticketDetailItem}>
                          <Ionicons
                            name="calendar-outline"
                            size={12}
                            color="#9CA3AF"
                          />
                          <Text style={styles.ticketDetailText}>
                            {ticket.date} · {ticket.time}
                          </Text>
                        </View>
                        <View style={styles.ticketDetailsRow}>
                          <Text
                            style={[
                              styles.ticketDetailText,
                              { color: C.textMid, fontWeight: "700" },
                            ]}
                          >
                            {ticket.price.toLocaleString()} FCFA
                          </Text>
                          <View style={styles.ticketQrHint}>
                            <Ionicons
                              name="eye-outline"
                              size={14}
                              color={C.indigo}
                            />
                            <Text style={styles.ticketQrText}>
                              Voir le billet
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </>
  );
}

// ════════════════════════════════════════════════
//  STYLES BADGE
// ════════════════════════════════════════════════
const badgeStyles = StyleSheet.create({
  root: { borderRadius: 20, overflow: "hidden", alignSelf: "center" },
  // Bannière
  bannerWrap: { width: "100%", height: 170, position: "relative" },
  banner: { width: "100%", height: "100%" },
  bannerOverlay: { position: "absolute", inset: 0 } as any,
  bannerTopRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  catBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tierText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  bannerBottom: { position: "absolute", bottom: 12, left: 12, right: 12 },
  bannerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerTicketNum: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  // Corps
  body: { padding: 18 },
  infoGrid: { gap: 10, marginBottom: 16 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoValue: { fontSize: 13, color: "#fff", fontWeight: "700" },
  // Perforé
  perf: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: -18,
    marginBottom: 16,
  },
  perfCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.bgLight,
  },
  perfDash: {
    width: 7,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 1,
  },
  // QR row
  qrRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  qrWrap: { alignItems: "center" },
  qrBox: {
    backgroundColor: "#fff",
    padding: 7,
    borderRadius: 12,
    marginBottom: 6,
  },
  qrCell: { width: 9, height: 9 },
  qrFilled: { backgroundColor: C.indigoDark },
  qrEmpty: { backgroundColor: "transparent" },
  qrCode: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  qrHint: { color: "rgba(255,255,255,0.45)", fontSize: 9 },
  // Prix
  priceBlock: { flex: 1 },
  priceLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 2,
  },
  priceValue: { color: C.amberLight, fontSize: 28, fontWeight: "900" },
  priceCurrency: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  seatPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  seatText: { fontSize: 11, fontWeight: "700" },
  validBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  validText: { color: C.emerald, fontSize: 11, fontWeight: "700" },
  usedBadge: {},
  usedText: { color: "#9CA3AF", fontSize: 11, fontWeight: "600" },
  // Divider
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 14,
  },
  // Organisateur
  organizerSection: {},
  organizerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  organizerDot: { width: 10, height: 10, borderRadius: 5 },
  organizerSectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  organizerName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 3,
  },
  organizerSlogan: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontStyle: "italic",
    marginBottom: 8,
  },
  organizerContacts: { gap: 4 },
  contactItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  contactText: { fontSize: 11, color: C.textLight, fontWeight: "500" },
  // Sponsors
  sponsorsSection: {},
  sponsorsSectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  sponsorsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  sponsorPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  sponsorName: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "600",
  },
  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  footerLogo: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  footerBrand: { fontSize: 13, fontWeight: "900", color: C.amberLight },
  footerSub: { fontSize: 10, color: "rgba(255,255,255,0.45)" },
});

// ════════════════════════════════════════════════
//  STYLES MODAL
// ════════════════════════════════════════════════
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.bgLight,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: "92%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: "900", color: C.textDark },
  sheetSub: { fontSize: 12, color: "#9CA3AF", fontWeight: "500", marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  downloadRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  dlBtn: { flex: 1, borderRadius: 13, overflow: "hidden" },
  dlBtnLoading: { opacity: 0.65 },
  dlBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 7,
  },
  dlBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
});

// ════════════════════════════════════════════════
//  STYLES PAGE
// ════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgLight },
  header: {
    paddingTop: 54,
    paddingBottom: 22,
    paddingHorizontal: 18,
    overflow: "hidden",
    position: "relative",
  },
  headerCircle1: {
    position: "absolute",
    top: -50,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  headerSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  headerBadge: { width: 46, height: 46 },
  headerBadgeGradient: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  headerBadgeText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  headerStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  headerStatItem: { flex: 1, alignItems: "center" },
  headerStatValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  headerStatLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontWeight: "500",
  },
  headerStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  tabsContainer: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 4 },
  tabsTrack: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: C.sand,
  },
  tabsIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: C.indigo,
    borderRadius: 10,
    margin: 3,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13, fontWeight: "600", color: C.textLight },
  tabTextActive: { color: "#fff" },
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 100 },
  // Ticket card
  ticketCard: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: C.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.08)",
  },
  ticketThumb: { width: 72, position: "relative" },
  ticketThumbImg: { width: "100%", height: "100%" },
  ticketThumbOverlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.6,
  } as any,
  ticketBody: { flex: 1, padding: 13 },
  ticketTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.textDark,
    marginBottom: 3,
  },
  ticketCategoryBadge: { fontSize: 10, fontWeight: "600", color: C.textMid },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  statusBadgePast: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusTextPast: { color: "#6B7280", fontSize: 10, fontWeight: "600" },
  ticketSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  notchLeft: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.bgLight,
    marginLeft: -17,
  },
  notchRight: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.bgLight,
    marginRight: -17,
  },
  dottedLine: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 4,
  },
  dot: { width: 4, height: 1.5, backgroundColor: "#E5E7EB", borderRadius: 1 },
  ticketDetails: { gap: 4 },
  ticketDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketDetailItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  ticketDetailText: { fontSize: 11, color: "#6B7280", fontWeight: "500" },
  ticketQrHint: { flexDirection: "row", alignItems: "center", gap: 4 },
  ticketQrText: { fontSize: 11, color: C.indigo, fontWeight: "700" },
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    backgroundColor: C.white,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.08)",
  },
  emptyEmoji: { fontSize: 44, marginBottom: 14 },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textDark,
    marginBottom: 6,
  },
  emptySub: { fontSize: 13, color: "#9CA3AF", marginBottom: 20 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
  },
  emptyBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
