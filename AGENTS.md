# nami-motion — Ajan Kuralları ve Devir Notu

React Native / Expo için animasyon paketi `nami-motion` (MIT, builder-bob, ESM + tipler).
Bu repo yalnızca npm paketidir; buradan yayınlanır. Componentler Nami uygulamasından
(`/Users/ahmeetkaar/development/nami`) prop-driven hale getirilerek alındı.

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
| `nami-motion/text` | ShimmerText | — |
| `nami-motion/feedback` | Skeleton | — |
| `nami-motion/chat` | StatusRow, ThinkingBlock, SourceChips, SourceBadge, MessageActions, FollowUpChips, ThinkingTrace, TraceSteps | — |
| `nami-motion/gestures` | DrawerReveal, SwipeActions, SwipeActionsGroup | react-native-gesture-handler (SwipeActions) |
| `nami-motion/gradient` | ShimmerBand, GeneratingImage | expo-linear-gradient (opsiyonel peer) |
| `nami-motion/skia` | VoiceWave, RemainingRing, MatrixOrb, DictationBar, AttachmentTile, AttachmentTray | @shopify/react-native-skia (opsiyonel peer) |

Kök `src/index.ts` theme, text, feedback, chat ve yalnızca DrawerReveal'ı export eder; Skia,
gradient veya gesture-handler isteyen hiçbir şey köke girmez.

## Kurallar

- Paket yöneticisi npm (`package-lock.json`). React 19.2.0, Expo SDK 55 hattı; sürüm yükseltilmez (Xcode 26.2).
- Peer aralıkları yalnızca test edilen sürümleri kapsar (RN ≥0.83, Reanimated ≥4.2, Worklets ≥0.7, RNGH ≥2.30, Skia ≥2.4).
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

## Lisans durumu (2026-10-14)

| Kaynak | Durum |
| --- | --- |
| rnmotion.dev (SchroederNathan/react-native-motion) | Kökte LICENSE yok. Nami'deki MorphText ve Toast oradan türetilmiş → izin gelene kadar pakete girmez. Yazara issue açılacak (kullanıcı açar). İzin gelmezse davranış tarifinden sıfırdan yazılır. |
| makeitanimated.dev | Ücretli kişisel lisans, açık yayın yasak. Shimmer ve drawer kendi kodumuz, sorun yok. Oradan kod alınmaz. |
| beautifului.dev | MIT (Shane Levine). ThinkingBlock/StatusRow için `NOTICE.md`'de kredi var. |
| motion.dev Motion+ | Swipe actions referansı; koduna bakılmadan sıfırdan yazılır. |

## Durum

- GitHub: `git@github.com:AhmeetKaar/nami-motion.git`, branch `main`. `gh` kurulu değil. `nami-motion-web` ve `nami-motion-ios` yalnızca yerel git reposu (2026-10-14).
- npm adı `nami-motion` boş (2026-10-14); `@nami` scope başkasına ait. Henüz yayın yok.

## Sıradaki işler

1. **Streaming markdown** (`nami-motion/chat`): Nami'deki yapı referans — blok bazlı split, son blok "frozen + live" diye bölünür (yalnızca canlı satır her tick'te yeniden render edilir). Animasyon yalnızca live kısma uygulanır: kelime/token bazlı fade + hafif blur, code block satır reveal'ı, tablo satır girişi, kaynak rozetleri ve follow-up chip'lerinde stagger. Paragraf/heading/liste tek `<Text selectable>` ağacında nested render edilir (paragraflar arası seçim için), animasyon seçilebilirliği bozmamalı. Markdown parser bağımlılığı opsiyonel peer olmalı.
2. İlk yayın `0.1.0` (kullanıcı onayıyla): changeset ile sürüm, `npm run release` ya da CI (`NPM_TOKEN`). Yayından sonra Nami ve `nami-motion-ios` tarball yerine `nami-motion@^0.1.0` kurar.
3. MorphText ve Toast: rnmotion izni ya da sıfırdan yazım sonrası `nami-motion/skia` ve `nami-motion/feedback`'e eklenir.
4. Nami entegrasyonu: `feature/nami-motion` branch'inde paket `vendor/nami-motion-<sha>.tgz` (bun) ile kurulu. Paketten gelenler: StatusRow + canlı SourceChips (favicon ikonlu), ThinkingBlock, gerekçe sheet'inde ThinkingTrace (Adımlar/Kaynaklar), MessageActions, DictationBar, AttachmentTile/Tray, GeneratingImage, ShimmerText, Skeleton, MatrixOrb, DrawerReveal, SwipeActions. `src/providers/motion-theme-provider.tsx` Nami renklerini pakete bağlar. Nami'de veri olmadığı için FollowUpChips ve SourceBadge kullanılmıyor. Commit ve merge Nami kurallarıyla, kullanıcı onayıyla.
