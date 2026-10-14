# nami-motion — Ajan Kuralları ve Devir Notu

React Native / Expo için animasyon paketi (`nami-motion`) ve rnmotion.dev benzeri
galeri/doküman sitesi. Componentler Nami uygulamasından
(`/Users/ahmeetkaar/development/nami`) prop-driven hale getirilerek alındı;
geliştirme artık yalnızca bu repoda yürür, Nami'ye dokunulmaz.

## Repo düzeni

| Yol | Ne |
| --- | --- |
| `packages/motion` | Yayınlanan npm paketi `nami-motion` (MIT, builder-bob, ESM + tipler) |
| `apps/example` | Expo SDK 55 canlı demo galerisi (`src/app/index.tsx`) |
| `apps/site` | Vitrin sitesi (Vite + React + Tailwind 4, portföy tasarım dili); içerik `src/data/components.ts`, videolar `public/videos/<slug>.mp4`, poster `public/posters/<slug>.jpg` |
| `apps/example/src/app/showcase/[slug].tsx` | Video kaydı için kendi kendine oynayan tam ekran vitrin; `namimotion:///showcase/<slug>` |
| `media/` | README GIF'leri; `scripts/encode-videos.sh` ham kayıtlardan (`~/development/nami-motion-videos/*.mov`) mp4, poster ve GIF üretir |
| `.changeset/` | Versiyonlama; `.github/workflows/` CI + release (changesets/action, npm provenance) |
| `LICENSE`, `NOTICE.md` | MIT + üçüncü taraf bildirimleri (beautifului.dev MIT) |

Komutlar: `npm install`, `npm run example`, `npm run site` (http://localhost:5173), `npm run build`,
`npm run changeset`.

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

- Paket yöneticisi npm (workspaces, `package-lock.json`; 2026-10-14'te bun'dan geçildi). Expo bağımlılıkları `npx expo install` ile çözülür, sürüm elle yazılmaz.
- Workspace bağımlılığı `"nami-motion": "*"` ile yazılır (npm `workspace:*` desteklemez). npm'in varsayılan hoisting'i react/RN/reanimated'ı tek kopyada tutar; `install-strategy` değiştirilmez.
- React tüm workspace'lerde 19.2.0; docs dahil yükseltilmez (aksi halde example'da duplicate react).
- Expo SDK 55'te kalınır, sürüm yükseltilmez: toolchain Xcode 26.2, SDK 56+ Xcode 26.4 ister.
- Peer aralıkları yalnızca test edilen sürümleri kapsar (RN ≥0.83, Reanimated ≥4.2, Worklets ≥0.7, RNGH ≥2.30, Skia ≥2.4).
- Kaynak dosyalar İngilizce ve ASCII, dosya adları kebab-case, koda yorum satırı yazılmaz.
- Paket içinde göreli import kullanılır; paket kodu hiçbir uygulama katmanına (tema, i18n, provider) bağlanmaz — renk, metin, ikon, font, haptic prop olarak gelir.
- Her component `useReducedMotion` ile statik son haline düşebilmeli.
- Yeni componentler renkleri `useMotionPalette(colors)` ile okur: varsayılan Moodstone paleti, `MotionThemeProvider` ile uygulama paleti, `colors` ile tek component override. İkonlar her zaman prop.
- Showcase/demo tasarlamadan önce Nami `client-animations.md` okunur; referans sitelerden kod alınmaz, yalnızca fikir.
- İsimler marka içermez (ChatGPT/X/Claude yok); referanslar yalnızca ilham, kod kopyalanmaz.
- Her görev bitince (kontroller temizse) `git commit` atılır, izin beklenmez. `git push`, publish ve issue açmak dışa dönük adımdır, kullanıcının açık izni olmadan yapılmaz.
- Süreç/plan kararlarında (isim, düzen, sıra) önerilen seçenekle devam edilir, kullanıcıya sorulmaz.

## Yeni component eklerken

1. `packages/motion/src/<giriş>/<ad>.tsx` + ilgili `index.ts` export'u (props tipiyle).
2. `apps/example/src/app/index.tsx` içine canlı demo.
3. `apps/site/src/data/components.ts` girdisi (kurulum, kullanım, props, prompt) ve `apps/example/src/app/showcase/[slug].tsx` vitrini; 10 sn kayıt `xcrun simctl io <udid> recordVideo`, sonra `scripts/encode-videos.sh`.
4. Üçüncü taraftan uyarlandıysa lisansı kontrol et, MIT ise `NOTICE.md`'ye ekle.
5. `npm run changeset`.
6. Kontroller: `packages/motion` içinde `npx tsc --noEmit` ve `npx bob build`; `apps/example` içinde `npx tsc --noEmit` ve `npx expo-doctor` (20/20); `apps/site` içinde `npm run build`.

Simülatör build'i ajan tarafından denenmez; görsel testi kullanıcı yapar.

## Lisans durumu (2026-10-14)

| Kaynak | Durum |
| --- | --- |
| rnmotion.dev (SchroederNathan/react-native-motion) | Kökte LICENSE yok. Nami'deki MorphText ve Toast oradan türetilmiş → izin gelene kadar pakete girmez. Yazara issue açılacak (kullanıcı açar). İzin gelmezse davranış tarifinden sıfırdan yazılır. |
| makeitanimated.dev | Ücretli kişisel lisans, açık yayın yasak. Shimmer ve drawer kendi kodumuz, sorun yok. Oradan kod alınmaz. |
| beautifului.dev | MIT (Shane Levine). ThinkingBlock/StatusRow için `NOTICE.md`'de kredi var. |
| motion.dev Motion+ | Swipe actions referansı; koduna bakılmadan sıfırdan yazılır. |

## Durum

- GitHub: `git@github.com:AhmeetKaar/nami-motion.git`, branch `main` (ilk commit `23ab268`, 2026-10-14). `gh` kurulu değil.
- npm adı `nami-motion` boş (2026-10-14); `@nami` scope başkasına ait.
- Tüm kontroller temiz (tsc, bob build, expo-doctor 20/20, docs build, iOS export).

## Sıradaki işler

1. **Streaming markdown** (`nami-motion/chat`): Nami'deki yapı referans — blok bazlı split, son blok "frozen + live" diye bölünür (yalnızca canlı satır her tick'te yeniden render edilir). Animasyon yalnızca live kısma uygulanır: kelime/token bazlı fade + hafif blur, code block satır reveal'ı, tablo satır girişi, kaynak rozetleri ve follow-up chip'lerinde stagger. Paragraf/heading/liste tek `<Text selectable>` ağacında nested render edilir (paragraflar arası seçim için), animasyon seçilebilirliği bozmamalı. Markdown parser bağımlılığı opsiyonel peer olmalı.
2. İlk yayın `0.1.0` (kullanıcı onayıyla; şimdilik her şey test tarafında, yayın yok): `NPM_TOKEN` secret, changeset ile release; site deploy'u.
3. MorphText ve Toast: rnmotion izni ya da sıfırdan yazım sonrası `nami-motion/skia` ve `nami-motion/feedback`'e eklenir.
4. Nami entegrasyonu: `feature/nami-motion` branch'inde paket `vendor/nami-motion-<sha>.tgz` (bun) ile kurulu. Paketten gelenler: StatusRow + canlı SourceChips (favicon ikonlu), ThinkingBlock, gerekçe sheet'inde ThinkingTrace (Adımlar/Kaynaklar), MessageActions, DictationBar, AttachmentTile/Tray, GeneratingImage, ShimmerText, Skeleton, MatrixOrb, DrawerReveal, SwipeActions. `src/providers/motion-theme-provider.tsx` Nami renklerini pakete bağlar. Nami'de veri olmadığı için FollowUpChips ve SourceBadge kullanılmıyor. Commit ve merge Nami kurallarıyla, kullanıcı onayıyla.
