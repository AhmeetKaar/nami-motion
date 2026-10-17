# nami-motion — Ajan Kuralları ve Devir Notu

React Native / Expo için animasyon paketi `nami-motion` (MIT, builder-bob, ESM + tipler).
Bu repo yalnızca npm paketidir; buradan yayınlanır. Componentler Nami uygulamasından
(`/Users/ahmeetkaar/development/nami`) prop-driven hale getirilerek alındı.
2026-10-17 kararı: paket yalnızca ShimmerText ve VoiceWave'i içerir; diğer tüm componentler
(chat, feedback, gestures, gradient girişleri ve kalan skia componentleri) üç repodan da kaldırıldı.
Eski kod git geçmişinde (`0855735` ve öncesi).

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
| `nami-motion/skia` | VoiceWave | @shopify/react-native-skia (opsiyonel peer) |

Kök `src/index.ts` theme ve text'i export eder; Skia isteyen hiçbir şey köke girmez.

## Kurallar

- Paket yöneticisi npm (`package-lock.json`). React 19.2.0, Expo SDK 55 hattı; sürüm yükseltilmez (Xcode 26.2).
- Peer aralıkları yalnızca test edilen sürümleri kapsar (RN ≥0.83, Reanimated ≥4.2, Worklets ≥0.7, Skia ≥2.4).
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
| beautifului.dev | MIT. Oradan uyarlanan ThinkingBlock/StatusRow kaldırıldı; `NOTICE.md` silindi. |

## Durum

- GitHub: `git@github.com:AhmeetKaar/nami-motion.git`, branch `main`. `gh` kurulu değil. `nami-motion-web` ve `nami-motion-ios` yalnızca yerel git reposu (2026-10-14).
- npm adı `nami-motion` boş (2026-10-14); `@nami` scope başkasına ait. Henüz yayın yok.

## Sıradaki işler

1. Sonraki yayın (kullanıcı onayıyla): changeset ile sürüm (`0.4.0`), `npm run release` ya da CI (`NPM_TOKEN`). Yayından sonra Nami ve `nami-motion-ios` yeni sürümü kurar.
2. Nami entegrasyonu: `feature/nami-motion-v2` branch'i `nami-motion@0.2.0`'daki kaldırılan componentleri kullanıyor; yeni sürüme geçerken Nami kendi componentlerine döner, paketten yalnızca ShimmerText ve VoiceWave kalır. Commit ve merge Nami kurallarıyla, kullanıcı onayıyla.
