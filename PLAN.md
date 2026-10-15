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
| 1 | StatusRow | §1 Raycast, Linktree, Gemini + Nami v3 | shimmer, geçiş, `history`, kart, Nami logosu, `SourceStack` (0.2.0) | adım geçmişi + favicon yığını | test bekliyor |
| 2 | ThinkingBlock | §2 DeepSeek, Notion | yerinde açılan gövde, sol çizgi, dönen ok (0.3.0) | otomatik açılıp kapanan iz | test bekliyor |
| 3 | ShimmerText | ChatGPT Creating image | temiz süpürme, yumuşak kenar, satır kaydırma, `pause`, `direction` (0.3.0) | sohbet akışı | test bekliyor |
| 4 | SwipeActions | §3 Messages, Fiverr | `actionShape="circle"`, `label` (0.3.0) | daire aksiyonlu sohbet listesi | test bekliyor |
| 5 | DrawerReveal | §8 Claude, Pi | `stagger`, `scaleFrom` (0.3.0) | sırayla dolan menü | test bekliyor |
| 6 | VoiceWave | §4 ChatGPT, Notion dikte | `variant="bars"`, DictationBar `waveVariant` (0.3.0) | çubuk dalgalı dikte | test bekliyor |
| 7 | RemainingRing | §5 Perplexity, Notion | köşe halka, `chip` dosya, sakin giriş (0.3.0) | köşe halkalı fotoğraflar | test bekliyor |
| 8 | Skeleton | Linktree satırları | `effect="wave"`, `SkeletonGroup` (0.3.0) | senkron dalgalı hesap ekranı | test bekliyor |
| 9 | ShimmerBand | §6 ChatGPT, Copilot | `backgroundColors` kayan pastel (0.3.0) | pastel görsel üretimi | test bekliyor |
| 10 | MatrixOrb | §7 Meta AI, ChatGPT Voice | `stateColors` renk geçişi (0.3.0) | durum renkli sesli mod | test bekliyor |

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
