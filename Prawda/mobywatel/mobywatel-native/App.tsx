import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

const BACKEND_HOST = "10.250.192.87";
const BACKEND_PORT = 3001;

type QrPayload = {
  sessionId: string;
  nonce: string;
  url?: string;
  timestamp?: number;
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastData, setLastData] = useState<QrPayload | null>(null);
  const [parseErrorShown, setParseErrorShown] = useState(false);
  const [showUnsafeOverlay, setShowUnsafeOverlay] = useState(false);
  const [showSafeOverlay, setShowSafeOverlay] = useState(false);

  // Uprawnienia do kamery
  useEffect(() => {
    (async () => {
      if (!permission || !permission.granted) {
        await requestPermission();
      }
    })();
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async (result: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      if (!result.data || typeof result.data !== "string") {
        setScanned(false);
        return;
      }

      // Szybki filtr – musi być JSON
      if (!result.data.trim().startsWith("{")) {
        if (!parseErrorShown) {
          setParseErrorShown(true);
          Alert.alert("Nieznany kod", "Ten kod QR nie zawiera danych sesji.");
        }
        setScanned(false);
        return;
      }

      const parsed = JSON.parse(result.data) as QrPayload;
      setLastData(parsed);
      // Skoro dotarliśmy tutaj, poprzednie błędy parsowania nie są już aktualne
      setParseErrorShown(false);

      const { sessionId, nonce, url } = parsed;

      if (!sessionId || !nonce) {
        Alert.alert("Błąd", "Kod QR nie zawiera wymaganych danych.");
        // Pozwól zeskanować kolejny kod po takiej pomyłce
        setScanned(false);
        return;
      }

      // Ocena bezpieczeństwa URL – jeśli wygląda źle, pokaż overlay
      const isHttps = (url || "").startsWith("https://");
      const isGov = (url || "").includes("gov.pl");
      if (!isHttps || !isGov) {
        setShowUnsafeOverlay(true);
      } else {
        setShowSafeOverlay(true);
      }

      const verifyUrl = `http://${BACKEND_HOST}:${BACKEND_PORT}/api/session/${sessionId}/verify`;

      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceInfo: "mobywatel-native" }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.log("Verify response:", text);
        Alert.alert("Błąd", "Nie udało się potwierdzić sesji.");
        return;
      }

      const json = await response.json();
      console.log("Verify OK:", json);
      Alert.alert("Sukces", "Sesja została potwierdzona na serwerze.");
    } catch (e) {
      console.error("Błąd parsowania / wysyłki:", e);
      if (!parseErrorShown) {
        setParseErrorShown(true);
        Alert.alert("Błąd", "Nieprawidłowy kod QR lub błąd sieci.");
      }
      setScanned(false);
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "brak danych";
    const d = new Date(timestamp);
    return d.toLocaleString();
  };

  // Jeśli nie mamy jeszcze permission obiektu
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Sprawdzanie uprawnień do kamery…</Text>
      </View>
    );
  }

  // Jeśli użytkownik nie dał zgody
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>mObywatel</Text>
        <Text style={styles.subtitle}>
          Aby zeskanować kod QR, zezwól na dostęp do kamery.
        </Text>
        <Button
          title="Zezwól na dostęp do kamery"
          onPress={requestPermission}
        />
      </View>
    );
  }

  const url = lastData?.url || "";
  const isHttps = url.startsWith("https://");
  const isGov = url.includes("gov.pl");
  const isSafe = lastData ? isHttps && isGov : null;

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerGov}>RZECZPOSPOLITA POLSKA</Text>
        <Text style={styles.headerApp}>mObywatel – Weryfikacja strony</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weryfikacja strony internetowej</Text>
          <Text style={styles.cardText}>
            Skieruj aparat na kod QR wyświetlony na stronie rządowej. Aplikacja
            odczyta dane sesji i przekaże potwierdzenie do systemu.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSubtitle}>Skaner kodu QR</Text>
          <View style={styles.scannerWrapper}>
            {!scanned && (
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              />
            )}
            {scanned && (
              <View style={styles.scannerOverlay}>
                <Text style={styles.scannerOverlayText}>
                  Kod został zeskanowany. Użyj przycisku poniżej, aby zeskanować
                  kolejny.
                </Text>
              </View>
            )}
          </View>
          {scanned && (
            <View style={styles.actionsRow}>
              <Button
                title="Skanuj ponownie"
                onPress={() => {
                  setScanned(false);
                  setLastData(null);
                  setShowUnsafeOverlay(false);
                  setShowSafeOverlay(false);
                }}
              />
            </View>
          )}
        </View>

        {lastData && (
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Dane odczytane z kodu</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Identyfikator sesji:</Text>
              <Text style={styles.detailValue}>{lastData.sessionId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nonce (losowy token):</Text>
              <Text style={styles.detailValue}>{lastData.nonce}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Adres strony:</Text>
              <Text style={styles.detailValue}>
                {lastData.url || "brak informacji"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Czas wygenerowania kodu:</Text>
              <Text style={styles.detailValue}>
                {formatTime(lastData.timestamp)}
              </Text>
            </View>

            {isSafe === true && (
              <View style={styles.safetyBoxSafe}>
                <Text style={styles.safetyTitleSafe}>
                  Strona wygląda na bezpieczną.
                </Text>
                <Text style={styles.safetyText}>
                  Połączenie jest szyfrowane (HTTPS), a adres zawiera domenę
                  gov.pl. Kontynuuj proces weryfikacji na swoim komputerze.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {lastData && isSafe === false && showUnsafeOverlay && (
        <View style={styles.unsafeOverlay}>
          <View style={styles.unsafeCard}>
            <View style={styles.unsafeIconCircle}>
              <Text style={styles.unsafeIconText}>!</Text>
            </View>
            <Text style={styles.unsafeTitle}>
              Uwaga! Strona może być fałszywa
            </Text>
            <Text style={styles.unsafeText}>
              Ten kod QR prowadzi do strony, która może być niebezpieczna.
            </Text>
            {!isHttps && (
              <Text style={styles.unsafeBullet}>
                - Połączenie nie jest szyfrowane (brak HTTPS).
              </Text>
            )}
            {!isGov && (
              <Text style={styles.unsafeBullet}>
                - Adres nie zawiera domeny gov.pl.
              </Text>
            )}
            <Text style={styles.unsafeText}>
              Nie podawaj żadnych danych (PESEL, hasła, numeru karty). Zamknij
              tę stronę w przeglądarce i samodzielnie wpisz adres
              [https://www.gov.pl/](https://www.gov.pl/) w pasku adresu, aby
              przejść na oficjalny serwis.
            </Text>
            <View style={styles.unsafeButtonRow}>
              <Button
                title="Rozumiem"
                onPress={() => setShowUnsafeOverlay(false)}
              />
            </View>
          </View>
        </View>
      )}

      {lastData && isSafe === true && showSafeOverlay && (
        <View style={styles.safeOverlay}>
          <View style={styles.safeCard}>
            <Text style={styles.safeTitle}>Strona wygląda na bezpieczną</Text>
            <Text style={styles.safeText}>
              Ten kod QR prowadzi do strony, która spełnia podstawowe kryteria
              bezpieczeństwa: połączenie jest szyfrowane (HTTPS), a adres
              zawiera domenę gov.pl.
            </Text>
            <Text style={styles.safeText}>
              Pamiętaj jednak, aby zawsze zwracać uwagę na treść strony i nie
              podawać danych, których nie oczekujesz w danej usłudze.
            </Text>
            <View style={styles.safeButtonRow}>
              <Button
                title="Rozumiem"
                onPress={() => setShowSafeOverlay(false)}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  headerBar: {
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#d32f2f",
  },
  headerGov: {
    color: "#fff",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "600",
  },
  headerApp: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#444",
  },
  scannerWrapper: {
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    marginTop: 8,
  },
  scannerOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
  },
  scannerOverlayText: {
    fontSize: 13,
    color: "#444",
    textAlign: "center",
  },
  actionsRow: {
    marginTop: 12,
    alignItems: "flex-start",
  },
  detailRow: {
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  detailValue: {
    fontSize: 13,
    color: "#111",
    marginTop: 2,
  },
  safetyBoxSafe: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#2e7d32",
  },
  safetyTitleSafe: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 4,
  },
  safetyText: {
    fontSize: 12,
    color: "#333",
    marginTop: 2,
  },
  unsafeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  unsafeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  unsafeIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#c62828",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  unsafeIconText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },
  unsafeTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#c62828",
  },
  unsafeText: {
    fontSize: 13,
    color: "#333",
    marginTop: 4,
  },
  unsafeBullet: {
    fontSize: 13,
    color: "#333",
    marginTop: 2,
  },
  unsafeButtonRow: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  safeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  safeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#2e7d32",
  },
  safeTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#2e7d32",
  },
  safeText: {
    fontSize: 13,
    color: "#333",
    marginTop: 4,
  },
  safeButtonRow: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 24,
  },
});
