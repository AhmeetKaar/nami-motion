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
| `apps/docs` | Next.js 16 + Fumadocs sitesi; katalog `src/lib/catalog.ts`, sayfalar `content/docs/components/*.mdx` |
| `.changeset/` | Versiyonlama; `.github/workflows/` CI + release (changesets/action, npm provenance) |
| `LICENSE`, `NOTICE.md` | MIT + üçüncü taraf bildirimleri (beautifului.dev MIT) |

Komutlar: `bun install`, `bun run example`, `bun run docs`, `bun run build`,
`bun run changeset`.

## Paket yapısı (subpath export'lar)

| Giriş | Componentler | Ek native bağımlılık |
| --- | --- | --- |
| `nami-motion/text` | ShimmerText | — |
| `nami-motion/feedback` | Skeleton | — |
| `nami-motion/chat` | StatusRow, ThinkingBlock | — |
| `nami-motion/gestures` | DrawerReveal | — |
| `nami-motion/gradient` | ShimmerBand | expo-linear-gradient (opsiyonel peer) |
| `nami-motion/skia` | VoiceWave, RemainingRing, MatrixOrb | @shopify/react-native-skia (opsiyonel peer) |

Kök `src/index.ts` yalnızca text, feedback, chat ve gestures'ı export eder; Skia veya
gradient isteyen hiçbir şey köke ya da bu dört girişe girmez.

## Kurallar

- Paket yöneticisi bun; Expo bağımlılıkları `bunx expo install` ile çözülür, sürüm elle yazılmaz.
- `bunfig.toml` `linker = "hoisted"` kalır; isolated linker expo-doctor'da duplicate native modül hatası verir.
- React tüm workspace'lerde 19.2.0; docs dahil yükseltilmez (aksi halde example'da duplicate react).
- Expo SDK 55'te kalınır, sürüm yükseltilmez: toolchain Xcode 26.2, SDK 56+ Xcode 26.4 ister.
- Peer aralıkları yalnızca test edilen sürümleri kapsar (RN ≥0.83, Reanimated ≥4.2, Worklets ≥0.7, RNGH ≥2.30, Skia ≥2.4).
- Kaynak dosyalar İngilizce ve ASCII, dosya adları kebab-case, koda yorum satırı yazılmaz.
- Paket içinde göreli import kullanılır; paket kodu hiçbir uygulama katmanına (tema, i18n, provider) bağlanmaz — renk, metin, ikon, font, haptic prop olarak gelir.
- Her component `useReducedMotion` ile statik son haline düşebilmeli.
- İsimler marka içermez (ChatGPT/X/Claude yok); referanslar yalnızca ilham, kod kopyalanmaz.
- `git commit` ve `git push` kullanıcının açık izni olmadan atılmaz; publish ve issue açmak da dışa dönük adımdır, izin ister.
- Süreç/plan kararlarında (isim, düzen, sıra) önerilen seçenekle devam edilir, kullanıcıya sorulmaz.

## Yeni component eklerken

1. `packages/motion/src/<giriş>/<ad>.tsx` + ilgili `index.ts` export'u (props tipiyle).
2. `apps/example/src/app/index.tsx` içine canlı demo.
3. `apps/docs/src/lib/catalog.ts` girdisi (`status: 'ready'`) ve `content/docs/components/<slug>.mdx` (kurulum, kullanım, props tablosu).
4. Üçüncü taraftan uyarlandıysa lisansı kontrol et, MIT ise `NOTICE.md`'ye ekle.
5. `bun run changeset`.
6. Kontroller: `packages/motion` içinde `bunx tsc --noEmit` ve `bunx bob build`; `apps/example` içinde `bunx tsc --noEmit` ve `bunx expo-doctor` (20/20); `apps/docs` içinde `bun run build`.

Simülatör build'i ajan tarafından denenmez; görsel testi kullanıcı yapar.

## Lisans durumu (2026-10-14)

| Kaynak | Durum |
| --- | --- |
| rnmotion.dev (SchroederNathan/react-native-motion) | Kökte LICENSE yok. Nami'deki MorphText ve Toast oradan türetilmiş → izin gelene kadar pakete girmez. Yazara issue açılacak (kullanıcı açar). İzin gelmezse davranış tarifinden sıfırdan yazılır. |
| makeitanimated.dev | Ücretli kişisel lisans, açık yayın yasak. Shimmer ve drawer kendi kodumuz, sorun yok. Oradan kod alınmaz. |
| beautifului.dev | MIT (Shane Levine). ThinkingBlock/StatusRow için `NOTICE.md`'de kredi var. |
| motion.dev Motion+ | Swipe actions referansı; koduna bakılmadan sıfırdan yazılır. |

## Durum

- Local git, branch `main`, henüz commit yok; GitHub remote yok (`gh` kurulu değil → `brew install gh && gh auth login`, sonra `AhmeetKaar/nami-motion` public repo).
- npm adı `nami-motion` boş (2026-10-14); `@nami` scope başkasına ait.
- Tüm kontroller temiz (tsc, bob build, expo-doctor 20/20, docs build, iOS export).

## Sıradaki işler

1. **Swipe actions** (`nami-motion/gestures`, RNGH + Reanimated): satır sola/sağa kayar, aksiyonlar rubber-band ile açılır, eşik geçilince tam swipe ile birincil aksiyon tetiklenir, haptic `onThreshold` callback'i ile dışarı verilir, aynı anda tek satır açık kalır.
2. **Streaming markdown** (`nami-motion/chat`): Nami'deki yapı referans — blok bazlı split, son blok "frozen + live" diye bölünür (yalnızca canlı satır her tick'te yeniden render edilir). Animasyon yalnızca live kısma uygulanır: kelime/token bazlı fade + hafif blur, code block satır reveal'ı, tablo satır girişi, kaynak rozetleri ve follow-up chip'lerinde stagger. Paragraf/heading/liste tek `<Text selectable>` ağacında nested render edilir (paragraflar arası seçim için), animasyon seçilebilirliği bozmamalı. Markdown parser bağımlılığı opsiyonel peer olmalı.
3. Site: her component için cihazdan kaydedilmiş kısa video (`apps/docs/public/videos/<slug>.mp4`) ve galeri kartında hover'da oynatma; "kaynağı kopyala" butonu.
4. İlk yayın `0.1.0`: GitHub repo + `NPM_TOKEN` secret, changeset ile release; Vercel'e docs deploy.
5. MorphText ve Toast: rnmotion izni ya da sıfırdan yazım sonrası `nami-motion/skia` ve `nami-motion/feedback`'e eklenir.
6. Nami entegrasyonu en sonda: Nami eski componentlerini bırakıp npm paketine geçer (Nami'nin kendi faz/PR kurallarıyla, ayrı branch'te).
