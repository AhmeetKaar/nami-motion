# Plan: Nami entegrasyonu, videolar ve vitrin sitesi (2026-10-14)

Sıra bağımlılığa göredir; her adım bitince `nami-motion`'da commit atılır. Nami'de
commit ve push yine izin ister (Nami `AGENTS.md`), değişiklik
`feature/nami-motion` branch'inde bekler.

## 1. Paketi Nami'ye bağla

- `nami-motion`'dan `npm pack` ile tarball üret, Nami'de `bun add` ile kur
  (npm'de henüz yayın yok). Native bağımlılıklar Nami'de aynı sürümde zaten var:
  Reanimated 4.2.1, Worklets 0.7.4, RNGH 2.30, Skia 2.4.18, expo-linear-gradient 55.
- Nami `v3`'ten `feature/nami-motion` branch'i açılır.

## 2. Nami componentlerini paketle değiştir

- Eşleşenler: ShimmerText, Skeleton, ShimmerBand, StatusRow, ThinkingBlock,
  DrawerReveal, VoiceWave, RemainingRing, MatrixOrb.
- Her çağrı yeri paketten import eder; renk/metin/ikon Nami teması ve i18n'den prop olarak geçer.
- Nami'deki eski dosyalar silinir. Pakette karşılığı olmayan ekran parçası kalır.
- SwipeActions: chats listesinde satır aksiyonu varsa oraya bağlanır, yoksa yeni yüzey açılmaz.
- Kontroller: `bunx tsc --noEmit`, `bun eslint:check`, `bun prettier:check`, `bunx expo-doctor`.

## 3. Maestro ile test et ve düzelt

- Simülatör: iPhone 17 Pro (`B56DACCD…`), uygulama `chat.nami`, Metro'dan JS.
- Akışlar `maestro/flows/motion-*.yaml`: drawer açma, chat'te thinking/status,
  ses girişi dalgası ve halka, görsel üretim kartı, usage skeleton'u, onboarding orb'u.
- Bozuk çıkan yer paket tarafındaysa `nami-motion`'da, çağrı tarafındaysa Nami'de düzeltilir, test tekrar koşar.

## 4. Her component için 10 sn video

- Kayıt `apps/example`'dan alınır: her component için tam ekran vitrin rotası
  (`/showcase/<slug>`), deep link ile açılır, `xcrun simctl io recordVideo` ile 10 sn kaydedilir.
  Chat'e bağlı componentler Nami'de backend/kredi gerektirdiği için kayıt örnek uygulamada kontrollü yapılır.
- Çıktı klasörü: `/Users/ahmeetkaar/development/nami-motion-videos/<slug>.mp4`.
- Siteye ve README'ye girecek kopyalar: `apps/site/public/videos/<slug>.mp4` ve `media/<slug>.gif` (ffmpeg).

## 5. README

- Kök ve paket README'sine component tablosu: GIF önizleme, giriş noktası, mp4 linki.

## 6. Vitrin sitesi (local)

- `apps/site`: Vite + React + Tailwind 4 + react-router, portföy (`ahmetkar.com.tr`) tasarım dili:
  aynı renk tokenları, açık/koyu tema, sistem sans + mono yazı, terminal pencereli kartlar, `label`/`tag`/`btn` sınıfları.
- rnmotion.dev yapısı: ana sayfada video kartlı galeri (hover'da oynar), her component sayfasında
  video, kurulum komutu, kullanım kodu, props tablosu ve "Copy prompt" (AI ajanına verilecek hazır prompt).
- İçerik tek kaynaktan: `apps/site/src/data/components.ts`.
- `apps/docs` (Fumadocs) içeriği siteye taşınınca kaldırılır; CI docs adımı site build'ine döner.
- Local çalıştırma: `npm run site` → http://localhost:5173.

## 7. Kapanış

- `AGENTS.md` repo düzeni/komutlar/sıradaki işler güncellenir, ozaOS'a not düşülür.
