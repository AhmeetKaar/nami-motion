# Plan: 10 componentin UI geliştirmesi, Nami testi ve duyuru (2026-10-14)

Kapsam: ShimmerText, Skeleton, ShimmerBand, StatusRow, ThinkingBlock, VoiceWave,
RemainingRing, MatrixOrb, DrawerReveal, SwipeActions. Her adım bitince ilgili repoda
commit; push, npm yayını, deploy ve duyuru kullanıcının açık onayıyla.

## Faz 1 — Component başına UI döngüsü (10 kez)

1. Kullanıcı referans verir (link, ekran görüntüsü ya da video).
2. Referanstan yalnızca fikir çıkarılır, kod alınmaz; `client-animations.md` ile karşılaştırılıp
   kısa bir tasarım notu yazılır (ne değişecek, hangi prop'lar eklenecek).
3. `nami-motion`: component geliştirilir; renk `useMotionPalette`, ikon/metin prop, reduced motion,
   geriye dönük uyumlu prop'lar. `typecheck` + `build` + changeset.
4. `nami-motion-ios`: `npm run sync-package`, showcase ekranı ve galeri demosu güncellenir,
   Maestro akışı yeni metin/koordinatlara göre düzeltilir. Simülatörde ekran görüntüleriyle kontrol.
5. Telefona Release build kurulur; kullanıcı onaylar ya da düzeltme ister. Onaylanınca component kapanır.

Önerilen sıra (sohbet akışında görünürlüğe göre): StatusRow → ThinkingBlock → ShimmerText →
SwipeActions → DrawerReveal → VoiceWave → RemainingRing → Skeleton → ShimmerBand → MatrixOrb.

| # | Component | Referans | Paket | iOS showcase | Onay |
| --- | --- | --- | --- | --- | --- |
| 1 | StatusRow | REFERENCES.md §1 (Raycast, Linktree, Gemini) | shimmer etiket, yumuşak geçiş, `history`, `variant="card"` | adım geçmişli ekran, galeride kart | bekliyor |
| 2 | ThinkingBlock | — | — | — | — |
| 3 | ShimmerText | — | — | — | — |
| 4 | SwipeActions | — | — | — | — |
| 5 | DrawerReveal | — | — | — | — |
| 6 | VoiceWave | — | — | — | — |
| 7 | RemainingRing | — | — | — | — |
| 8 | Skeleton | — | — | — | — |
| 9 | ShimmerBand | — | — | — | — |
| 10 | MatrixOrb | — | — | — | — |

## Faz 2 — Sürüm

- 10 component onaylanınca changeset'lerle `0.2.0` (StreamingMarkdown dahil).
- Yayın temiz worktree'den, passkey web onayıyla; `v0.2.0` etiketi ve push.

## Faz 3 — Nami'de test (yayındaki "nami" uygulaması)

- `v3`'ten yeni branch (ör. `feature/nami-motion-v2`). Eski `feature/nami-motion` (commit'siz,
  tarball'lı) yalnızca referans; yeni branch'e taşınmaz, kullanıcı kararıyla silinir ya da saklanır.
- 10 componentin Nami'deki kendi uygulamaları kaldırılır, `bun add nami-motion` (npm sürümü) ile
  paketten bağlanır; `MotionThemeProvider` Nami paletini geçirir. i18n yedi dilde.
- Kontroller: `bunx tsc --noEmit`, `bun eslint:check`, `bun prettier:check`, `bunx expo-doctor`.
- Dev client'ı kullanıcı koşar; iOS ve Android'de elde denenir. Commit ve push Nami kurallarıyla onaylı.
- Bulunan hatalar pakette düzeltilir → patch sürümü → Nami'de güncellenir.

## Faz 4 — Kayıt ve web

- `nami-motion-ios` Maestro akışlarıyla 10 sn kayıtlar (kullanıcı kaydeder, ajan önce haber verir).
- `nami-motion-web/scripts/encode-videos.sh`: site videoları/posterleri + paket README GIF'leri.
- Site içerik güncellemesi (props, kullanım, prompt), build; deploy kullanıcı onayıyla.

## Faz 5 — Duyuru

- GitHub release notları (`v0.2.0`), README son hali, npm sayfası kontrolü.
- Duyuru metni (kısa video/GIF + kurulum komutu + site linki); yayın kanalı ve zamanını kullanıcı seçer.
