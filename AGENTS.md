# nami-motion — Ajan Kuralları ve Devir Notu

React Native / Expo için animasyon paketi `nami-motion` (MIT, builder-bob, ESM + tipler).
Bu repo yalnızca npm paketidir; buradan yayınlanır. Componentler Nami uygulamasından
(`/Users/ahmeetkaar/development/nami`) prop-driven hale getirilerek alındı.
2026-10-17: paket önce ShimmerText + VoiceWave'e indirildi (0.4.0), aynı gün referans sitelerden
yalnızca fikir alınarak test componentleri eklendi (0.5.0); SwipeActions kullanıcı kararıyla çıkarıldı. Eski 0.3.0 kodu `0855735`'te.

## Repolar

| Yol | Ne |
| --- | --- |
| `~/development/nami-motion` | Bu repo: paket kaynağı (`src/`), changeset'ler, CI + release, README GIF/videoları (`media/`) |
| `~/development/nami-motion-web` | Vitrin sitesi (Vite + React + Tailwind 4); içerik `src/data/components.ts`, videolar `public/videos/<slug>.mp4` |
| `~/development/nami-motion-ios` | Expo SDK 55 uygulaması: galeri + `showcase/[slug]` ekranları, Maestro akışları; paketi normal bağımlılık olarak kurar |

Komutlar: `npm install`, `npm run typecheck`, `npm run build`, `npm run changeset`, `npm pack`.
Uygulamalar paketi yayından önce `npm pack` tarball'ıyla, yayından sonra npm sürümüyle kullanır.

## Paket yapısı (subpath export'lar)

| Giriş | Componentler | Ek native bağımlılık |
| --- | --- | --- |
| `nami-motion/theme` | moodstone, MotionThemeProvider, useMotionPalette | — |
| `nami-motion/text` | ShimmerText, StreamingText | — |
| `nami-motion/brand` | SpinningMark | — |
| `nami-motion/chat` | StatusRow, ThinkingBlock, QuestionCard | — |
| `nami-motion/skia` | BlurText, ImageGenerating, VideoGenerating, MatrixOrb, VoiceWave | @shopify/react-native-skia (opsiyonel peer) |
| `nami-motion/charts` | BarList, Meter, Sparkline, RingGauge, CountUp | @shopify/react-native-skia |

Kök `src/index.ts` theme ve text'i export eder; Skia isteyen hiçbir şey köke girmez.

## Kurallar

- Paket yöneticisi npm (`package-lock.json`). React 19.2.0, Expo SDK 55 hattı; sürüm yükseltilmez (Xcode 26.2).
- Peer aralıkları yalnızca test edilen sürümleri kapsar (RN ≥0.83, Reanimated ≥4.2, Worklets ≥0.7, Skia ≥2.4).
- Her component ikon (`icon`/`children`), font (`textStyle` ya da Skia `font`/`fontSource`/`fontFamily`), renk ve zamanlamayı prop olarak alır.
- Kaynak dosyalar İngilizce ve ASCII, dosya adları kebab-case, koda yorum satırı yazılmaz.
- Paket içinde göreli import kullanılır; paket kodu hiçbir uygulama katmanına bağlanmaz — renk, metin, ikon, font, haptic prop olarak gelir.
- Yeni componentler renkleri `useMotionPalette(colors)` ile okur: varsayılan Moodstone, `MotionThemeProvider` ile uygulama paleti (ve `colorScheme`), `colors` ile tek component override.
- Her component `useReducedMotion` ile statik son haline düşebilmeli.
- İsimler marka içermez; referans sitelerden (beautifului, makeitanimated, rnmotion, motion.dev, Mobbin) kod alınmaz, yalnızca fikir. Tasarımdan önce Nami `client-animations.md` okunur.
- Her görev bitince (kontroller temizse) `git commit` atılır. `git push`, `npm publish`, site deploy'u ve issue açmak dışa dönük adımdır, kullanıcının açık izni olmadan yapılmaz.
- Süreç/plan kararlarında önerilen seçenekle devam edilir.

## Yeni component eklerken

1. `src/<giriş>/<ad>.tsx` + ilgili `index.ts` export'u (props tipiyle).
2. `npm run typecheck`, `npm run build`, `npm run changeset`.
3. `nami-motion-ios`: `npm run sync-package`, galeri demosu ve `showcase/[slug].tsx` vitrini, Maestro akışı.
4. `nami-motion-web`: `src/data/components.ts` girdisi (kurulum, kullanım, props, prompt) ve kayıt (`scripts/encode-videos.sh`).
5. Üçüncü taraftan fikir alındıysa lisansı kontrol et, gerekiyorsa `NOTICE.md`'ye ekle.

## Lisans durumu (2026-10-17)

| Kaynak | Durum |
| --- | --- |
| rnmotion.dev (SchroederNathan/react-native-motion) | Kökte LICENSE yok; oradan türeyen hiçbir şey pakette yok. |
| makeitanimated.dev | Ücretli kişisel lisans, açık yayın yasak. Shimmer kendi kodumuz, sorun yok. Oradan kod alınmaz. |
| beautifului.dev | MIT. Oradan uyarlanan ThinkingBlock/StatusRow kaldırıldı; `NOTICE.md` silindi. 0.5.0 componentleri sıfırdan yazıldı. |
| ui.ozaco.com | Lisans yok; yalnızca chart fikirleri (stagger bar, çizilen line, ring gauge, count-up). Kod alınmadı. |
| Nami `morphing-text.tsx` | rnmotion blurred-text-morph'tan türüyor; pakete alınmadı, BlurText farklı yöntemle (eşleme yok, çıkış/giriş katmanı) yazıldı. |

## Durum

- GitHub: `git@github.com:AhmeetKaar/nami-motion.git`, branch `main`. `gh` kurulu değil. `nami-motion-web` ve `nami-motion-ios` da GitHub'da (push kullanıcı izniyle).
- npm: `nami-motion@0.4.0` yayında. 0.5.0 (`Release 0.5.0`) yerelde hazır, yayın kullanıcının npm web onayını bekliyor.
- Kayıtlar: `nami-motion-ios/maestro/record-showcase.sh` → `~/development/nami-motion-videos/raw`; web `public/videos` + `public/posters`, paket `media/`.

## Sıradaki işler

1. Yayın (kullanıcı onayıyla): `npm login --auth-type=web`, `npm publish --auth-type=web --provenance=false`, tag `v0.5.0` + push (üç repo).
2. Yayından sonra `nami-motion-ios` `npx expo install nami-motion@0.5.0`; Nami `nami-motion` branch'i paketi kullanır (onboarding logo → SpinningMark, tagline → BlurText, StatusRow, ReasoningBlock → ThinkingBlock, görsel/video loading, ApprovalCard içeriği → QuestionCard, Usage/Credits → charts). Commit ve merge Nami kurallarıyla.
3. Ertelenen componentler: MessageActions, FollowUpChips, JumpToBottom, IconSwap, EmptyState, StackToast, ErrorCard, UpgradeCard, CodeBlock, SourceBadge, TTS bar.
