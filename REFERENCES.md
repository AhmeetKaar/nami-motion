# UI referansları ve fikir notları (2026-10-15)

Kaynaklardan yalnızca fikir alınır, kod alınmaz. Kullanıcının bulduğu referanslar da buraya eklenir.

## 1. StatusRow

- Raycast — [Web Search kartı](https://mobbin.com/screens/48b8a26f-7d63-40f2-8dc4-7a15edc900af): araç adı kenarlıklı bir kart içinde, solda renkli araç ikonu, sağda küçük spinner.
- Linktree — [Analysis adımları](https://mobbin.com/screens/7e370793-4b21-4992-8738-e417d3ce22dc): biten adımlar tik ikonu ve ince dikey çizgiyle alt alta birikiyor, üstte "Analysis ˅" ile katlanıyor.
- Opera / Meta AI — [tek satır](https://mobbin.com/screens/61121836-c112-4d0e-a84d-65d9f78388b2): ikon + soluk tek satır etiket, en sade hali.
- Gemini — [araştırma kartı](https://mobbin.com/screens/8fd62687-58f7-49fd-bfa9-3c1119cb3a53): dönen ikon, kalın başlık, altında "Starting research…" alt satırı.

Fikir: etiket değişimleri yumuşak geçişle (eski satır yukarı süzülüp çıkar, yenisi aşağıdan gelir), etiket satır nabzı yerine shimmer; `variant="card"` ile kenarlıklı araç kartı ve sağda aktivite göstergesi; isteğe bağlı biten adım geçmişi (tik + bağlantı çizgisi).

## 2. ThinkingBlock

- DeepSeek — [Thought for 5 seconds](https://mobbin.com/screens/75233c29-f56c-4af8-b200-c0549a2827ca): başlık altında sol çizgili, soluk renkli tam akıl yürütme metni.
- ChatGPT — [sheet içinde iz](https://mobbin.com/screens/4fe4b960-ab35-4327-82b0-759ccbb0d825): arama satırı, sorgu chip'leri, "Done" ile biten zaman çizelgesi.
- v0 — [adım listesi](https://mobbin.com/screens/8dbadddc-769c-4b68-952e-959cb94a8a40): "Thinking", "Read …" satırları, her biri sağda chevron ile.
- Notion — [2 steps](https://mobbin.com/screens/b0c5b10f-47f4-45cd-ad78-8ce9a21a8fad): iç içe katlanan "Thought" bloğu, sol dikey çizgi.

Fikir: blok yerinde genişlesin (yüksekliği animasyonlu açılır), sol dikey çizgi ve soluk metin; arama sorguları chip olarak; "Thought for Ns" ile chevron dönüşü.

## 3. SwipeActions

- iOS Messages — [yuvarlak aksiyonlar](https://mobbin.com/screens/1ad68688-b638-4f85-b754-7ef96f6d45e5): satır kart gibi kayıyor, aksiyonlar ayrı daire butonlar.
- Fiverr — [ikon + etiketli daireler](https://mobbin.com/screens/d6624e4d-927d-46b3-a3f1-d763ef7dd04a): daire içinde ikon, altında küçük etiket.
- Shopee / Depop — klasik dikdörtgen tam yükseklik aksiyonlar.

Fikir: `actionShape="circle"` seçeneği (aksiyonlar ölçeklenerek sırayla belirir), satırın kendisi yuvarlatılmış kart olarak kayar.

## 4. VoiceWave / DictationBar

- ChatGPT — [dikte çubuğu](https://mobbin.com/screens/902347b7-a516-4282-98b8-717cc859d39d): solda durdur, ortada akan dikey çubuk dalga, sağda gönder.
- Notion — [dikte](https://mobbin.com/screens/4cf24588-cb41-457a-8421-40cac488d05a): X, ince çubuk dalga, mavi gönder.
- ABY Journal — [zamanlayıcılı panel](https://mobbin.com/screens/2d1b5587-06f3-4286-bebc-5fb625fe0cae): üstte süre, altında dalga, iki yanda X ve gönder.

Fikir: mevcut sinüs dalgasına ek olarak `style="bars"` akan çubuk dalga (sağdan sola kayan, seviyeye göre yükselen çubuklar).

## 5. RemainingRing / ekler

- Perplexity — [PDF kartı](https://mobbin.com/screens/7248785b-ef14-4bc8-86ac-6f657fa9e6db): kompozer içinde dosya kartı, köşede X.
- ChatGPT — [dosya kutusu](https://mobbin.com/screens/c96a1685-646b-4f4d-bd68-c1eff7ce838a): kare kart, üstte tür, altta ad.
- Notion — [ek chip'i](https://mobbin.com/screens/691c72b9-0f92-4752-9170-170f48aa00c2): ataş ikonlu tek satır chip.

Fikir: ekler kompozerin içinde (ayrı tepsi değil), yükleme halkası küçük ve köşede.

## 6. ShimmerBand / görsel üretimi

- ChatGPT — [Creating image](https://mobbin.com/screens/f4748dcf-e8ba-473e-b056-fbdd41702823): shimmer başlık + pastel, bulanık gradient kart.
- Copilot — [yükleniyor kartı](https://mobbin.com/screens/1e2d97ae-1182-4989-ac41-f4f2d3798204): yumuşak renkli kart, ortada küçük dönen noktalar.

Fikir: gri bant yerine pastel, yavaşça kayan renkli gradient zemin; zamanla bulanıklığı azalan "netleşme" hissi.

## 7. MatrixOrb / sesli mod

- Meta AI / WhatsApp — [halka küre](https://mobbin.com/screens/a13d716b-b9dc-4775-9934-b5c881b221a3): renk geçişli halka, konuşmaya göre nefes alıyor.
- ChatGPT Voice — [bulut küre](https://mobbin.com/screens/75114316-d81d-4e76-aac3-fd3f896e2865): kompozerin üstünde küçük bulutlu küre.
- ElevenReader — [Connecting](https://mobbin.com/screens/d9a14bbf-8a4a-4536-ab0a-92a16d67fd6b): yumuşak gradient küre + durum metni.

Fikir: nokta matrisi kişiliğini koruyup renk paleti desteği (Moodstone tonları) ve durumlar arası yumuşak ölçek/renk geçişi.

## 8. DrawerReveal

- Claude — [koyu drawer](https://mobbin.com/screens/9059f305-c9bb-44b9-b0fe-efe19e50a428): içerik sağa itilip köşeleri yuvarlanıyor, altta "New chat" butonu.
- ChatGPT — [tam ekran menü](https://mobbin.com/screens/763a5d89-528d-45a5-9d51-e0cbaf526880): bölüm başlıkları (Projects, Recents).
- Pi — [kaplama drawer](https://mobbin.com/screens/e06e6a5c-4ce7-49b2-9e69-82388628711a): içerik kararıyor, drawer üstte.

Fikir: menü öğeleri sırayla (stagger) belirsin; arkadaki içerik hafif küçülüp köşeleri yuvarlansın.

## 9–10. Skeleton, ShimmerText

Bu turda ayrı referans aranmadı; ShimmerText için ChatGPT "Creating image" başlığındaki ışık geçişi, Skeleton için Linktree adım listesi gibi sade satırlar kullanılabilir. Kullanıcı referansı bekleniyor.
