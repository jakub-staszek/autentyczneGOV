import express from "express";
import cors from "cors";
import crypto from "crypto";
import { createClient } from "redis";

const app = express();

app.use(cors());
app.use(express.json());

// Klient Redis – skalowalne przechowywanie sesji
const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

async function initRedis() {
  if (!redis.isOpen) {
    await redis.connect();
    console.log("Połączono z Redis");
  }
}

// Pomocnicza funkcja do stworzenia bezpiecznej sesji i nonce
async function createSession() {
  const sessionId = crypto.randomUUID();
  const nonce = crypto.randomBytes(16).toString("hex");
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000; // 5 minut
  const expiresAt = now + ttlMs;

  const key = `session:${sessionId}`;

  await redis.hSet(key, {
    nonce,
    status: "pending",
    createdAt: now.toString(),
    expiresAt: expiresAt.toString(),
  });

  // TTL na kluczu, żeby Redis sam czyścił stare sesje
  await redis.expire(key, Math.ceil(ttlMs / 1000));

  return { sessionId, nonce, expiresAt };
}

async function getSession(sessionId) {
  const key = `session:${sessionId}`;
  const data = await redis.hGetAll(key);

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return {
    sessionId,
    nonce: data.nonce,
    status: data.status,
    createdAt: data.createdAt ? Number(data.createdAt) : undefined,
    expiresAt: data.expiresAt ? Number(data.expiresAt) : undefined,
    verifiedAt: data.verifiedAt ? Number(data.verifiedAt) : undefined,
  };
}

async function markSessionVerified(sessionId) {
  const key = `session:${sessionId}`;
  const exists = await redis.exists(key);

  if (!exists) {
    return null;
  }

  const verifiedAt = Date.now();

  await redis.hSet(key, {
    status: "verified",
    verifiedAt: verifiedAt.toString(),
  });

  return getSession(sessionId);
}

// Endpoint: tworzenie nowej sesji weryfikacji
app.post("/api/session", async (req, res) => {
  try {
    await initRedis();
    const session = await createSession();
    res.json(session);
  } catch (err) {
    console.error("Błąd przy tworzeniu sesji:", err);
    res.status(500).json({ error: "Nie udało się utworzyć sesji" });
  }
});

// Endpoint: pobranie informacji o sesji
app.get("/api/session/:sessionId", async (req, res) => {
  try {
    await initRedis();
    const { sessionId } = req.params;
    const session = await getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Sesja nie znaleziona" });
    }

    res.json(session);
  } catch (err) {
    console.error("Błąd przy pobieraniu sesji:", err);
    res.status(500).json({ error: "Nie udało się pobrać sesji" });
  }
});

// Endpoint: oznaczenie sesji jako zweryfikowanej (np. po zeskanowaniu w mObywatel)
app.post("/api/session/:sessionId/verify", async (req, res) => {
  try {
    await initRedis();
    const { sessionId } = req.params;
    const session = await markSessionVerified(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Sesja nie znaleziona" });
    }

    res.json({ success: true, session });
  } catch (err) {
    console.error("Błąd przy potwierdzaniu sesji:", err);
    res.status(500).json({ error: "Nie udało się potwierdzić sesji" });
  }
});

const PORT = process.env.PORT || 3001;

initRedis()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Serwer działa na porcie ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Nie udało się zainicjalizować Redisa:", err);
    process.exit(1);
  });
