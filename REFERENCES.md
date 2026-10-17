# UI referansları ve fikir notları

Kaynaklardan yalnızca fikir alınır, kod alınmaz. Kullanıcının bulduğu referanslar da buraya eklenir.

## Kaynak linkleri (2026-10-17)

| Kaynak | Ne için | Lisans / kural |
| --- | --- | --- |
| [Anatomy](https://skills.wheresryan.sh/anatomy) ([bloom filter](https://skills.wheresryan.sh/anatomy/collection/bloom-filter)) | Tek modelin hem hareketi hem readout'u sürmesi, calm spring, reduced motion | MIT, yalnızca fikir |
| [beautifului.dev](https://www.beautifului.dev/) | Loading State, Thinking, Streaming Text, Approval Card, Fine-tune slider | MIT, yalnızca fikir |
| [rnmotion.dev](https://rnmotion.dev/) | Blurred text morph, aurora shader, stack toast | Lisans yok, yalnızca fikir |
| [ui.ozaco.com](https://ui.ozaco.com/) | Yalnızca chart alanı: stagger bar, çizilen line/spark, ring gauge, count-up | Lisans yok, yalnızca fikir |
| [native-templates.com](https://www.native-templates.com/) | Hangi ekranların kapsanacağı | Ücretli lisans, yalnızca fikir |
| [makeitanimated.dev](https://makeitanimated.dev/animations) | Animasyon kataloğu (shimmer text, drawer, onboarding) | Ücretli kişisel lisans, açık yayın yasak; kod alınmaz |
| [Mobbin: Claude iOS](https://mobbin.com/apps/claude-ios-d4f0ada4-3325-4c8e-9c3e-1115dbd469c9/754cdd57-a1c5-4553-b8fa-1c3c4eba8b2e/screens) | Soru kartı, Effort sayfası, splash, kompozer | Yalnızca görüntü |
| [JC Builds: Thinking Orbs](https://twitter.com/JC_builds/status/2101421513744544215) | DotOrb varyantları (yörünge, tarama, takımyıldız, sarmal, halka, şekil) ve ortak MediaGenerating | Kaynak RN paketinin lisansı bilinmiyor, yalnızca fikir |

## Component eşleşmeleri

- QuestionCard: Claude "1 of 2" kartı ([1/2](https://mobbin.com/screens/465d155d-404f-40b5-8fc5-ba686cec318b), [2/2](https://mobbin.com/screens/3dee74bc-68cb-41f4-9a7c-ffed15d7ac9b), [yazılı cevap](https://mobbin.com/screens/2640dc90-cc24-4e23-a513-99ad8bde162e)) + ChatGPT beyaz yüzen kart.
- EffortBar: Claude [Effort sayfası](https://mobbin.com/screens/5f298f05-d4d6-4044-9fc2-d33c768ad2d6) (seviye + açıklama), ElevenLabs [dolgulu kaydırıcı](https://mobbin.com/screens/51127ffd-9c70-40f6-b5ce-42b83ece0f26), beautifului Fine-tune, ozaco stagger bar; illüstrasyonlar DotOrb.
- MediaGenerating: ChatGPT "Creating image" kartı, Grok video dot-matrix örtüsü, Thinking Orbs varyantları.

## VoiceWave

- ChatGPT — [dikte çubuğu](https://mobbin.com/screens/902347b7-a516-4282-98b8-717cc859d39d): solda durdur, ortada akan dikey çubuk dalga, sağda gönder.
- Notion — [dikte](https://mobbin.com/screens/4cf24588-cb41-457a-8421-40cac488d05a): X, ince çubuk dalga, mavi gönder.
- ABY Journal — [zamanlayıcılı panel](https://mobbin.com/screens/2d1b5587-06f3-4286-bebc-5fb625fe0cae): üstte süre, altında dalga, iki yanda X ve gönder.

Fikir: mevcut sinüs dalgasına ek olarak `style="bars"` akan çubuk dalga (sağdan sola kayan, seviyeye göre yükselen çubuklar).
