import type { Dictionary } from "./types";

export const tr: Dictionary = {
  nav: {
    forClinicians: "Klinisyenler için",
    pledge: "Taahhüt",
    hospitals: "Hastaneler",
    specialties: "Uzmanlıklar",
    howItWorks: "Nasıl çalışır",
    login: "Giriş yap",
    register: "Kayıt ol",
  },
  footer: {
    privacy: "Gizlilik",
    cookies: "Çerezler",
    terms: "Şartlar",
    acceptableUse: "Kabul edilebilir kullanım",
    accessibility: "Erişilebilirlik",
    security: "Güvenlik",
    subProcessors: "Alt işleyiciler",
    contact: "İletişim",
    faq: "SSS",
    rights:
      "LibaMed Ltd, Cardiff, Galler. Klinisyen liderliğinde uluslararası sevkler — hastalar dosya oluşturamaz veya gönderemez.",
  },
  home: {
    eyebrow: "Yalnızca klinisyenden klinisyene sevkler",
    title: "Hastanızın yanından ayrılmadan uluslararası sevkler",
    subhead:
      "Hastanızı yurt dışındaki akredite bir hastanede adı belirtilen bir uzmana sevk edin — onam, güvenlik ve İngiltere bakımına dönen yapılandırılmış bir özetle. Asla e-posta yok.",
    ctaRegister: "Klinisyen olarak kayıt ol",
    ctaHow: "Nasıl çalışır",
    stats: [
      { n: "4", l: "olası koridor" },
      { n: "%100", l: "klinisyen liderliğinde" },
    ],
    values: [
      {
        title: "Her zaman klinisyen liderliğinde",
        text: "Yalnızca doğrulanmış bir sevk eden hekim dosya oluşturabilir. Hastalar LibaMed üzerinden asla tedavi rezervasyonu yapmaz.",
      },
      {
        title: "Adı belirtilen uzmanlar, denetlenmiş hastaneler",
        text: "Her sevk, akredite bir ortak hastanedeki adı belirtilen bir alıcı uzmana gider — asla genel bir gelen kutusuna değil.",
      },
      {
        title: "Daha katı standarda göre korunur",
        text: "Kayıtlar şifrelenir ve her iki ülkenin daha katı kurallarına göre saklanır — Fransa için HDS sertifikalı barındırma dahil.",
      },
    ],
    pathwayTitle: "Baştan sona tek bir döngü",
    pathwayLede:
      "Tüm sevk tek bir yerde gerçekleşir — e-posta zincirleri, kurye ile gönderilen diskler veya takip yok.",
    pathway: [
      { title: "Sevki oluştur", description: "Doğrulanmış bir İngiltere klinisyeni, hastanın onamıyla bir dosya açar — adım adım, her seferinde tek soru." },
      { title: "Kayıtları ekle", description: "Sevk mektubu, kan tahlilleri, DICOM dahil görüntüleme — şifrelenir ve hedefe uygun bölgede saklanır." },
      { title: "Adı belirtilen uzmana yönlendir", description: "Dosya, akredite bir ortak hastanedeki tek bir adı belirtilen uzmanın kuyruğuna düşer. Asla paylaşılan bir gelen kutusu değil." },
      { title: "İncele ve planla", description: "Uzman, platform içinde ayrıntılı maliyet tahmini ve takvimle bir tedavi planı gönderir." },
      { title: "İngiltere bakımına geri teslim", description: "Tedaviden sonra, yapılandırılmış bir klinik özet 5 iş günü içinde sevk eden klinisyene döner." },
    ],
    corridorsTitle: "Lansmanda dört koridor",
    corridorsLede:
      "Her koridor kendi veri koruma kurallarını her dosyaya otomatik olarak uygular.",
    pledgeTitle: "LibaMed Taahhüdü",
    pledgeBody:
      "Platformun yerine getirmek üzere tasarlandığı sekiz taahhüt — dört aşamalı hastane denetiminden maliyet şeffaflığına ve İngiltere bakımına garantili geri dönüşe kadar.",
    pledgeCta: "Taahhüdün tamamını oku",
    pledgeItems: [
      "Yalnızca kendi ailemize güveneceğimiz klinikler",
      "Her sevk klinisyen liderliğindedir",
      "Daha katı standarda göre korunur",
      "Her zaman maliyet şeffaflığı",
      "İngiltere bakımına sorunsuz geri dönüş",
      "Bir şeyler ters gittiğinde dinleriz",
      "Mesleki karar asla satılık değildir",
      "Taahhüt bizimle birlikte gelişir",
    ],
    specialtiesTitle: "Uzmanlıklar",
    viewAll: "Tümünü gör",
    security: [
      "Beklemede AES-256 şifreleme",
      "Aktarımda TLS 1.3",
      "Fransa için AEA’da HDS sertifikalı barındırma",
    ],
    securityLink: "Güvenliğe genel bakış",
    faqTitle: "Sık sorulan sorular",
    faqAll: "Tüm sorular ve sözlük",
    faqs: [
      { q: "LibaMed nedir?", a: "Uluslararası tıbbi sevkler için klinisyenden klinisyene bir platform. Bir İngiltere hekimi, hastanın onamıyla, yurt dışındaki akredite bir hastanede adı belirtilen bir uzmana hastayı sevk eder ve bakımın sürekliliği için yapılandırılmış bir özet geri alır. LibaMed Ltd, Galler, Cardiff’te kayıtlıdır." },
      { q: "Bu bir sağlık turizmi rezervasyon sitesi mi?", a: "Hayır. Hasta tarafında rezervasyon yoktur. Hastalar dosya oluşturamaz, düzenleyemez veya gönderemez — her sevk doğrulanmış bir klinisyen tarafından oluşturulur ve ona aittir." },
      { q: "Bir sevk oluşturmak ne kadar sürer?", a: "Dakikalar. Rehberli kabul her seferinde tek soru sorar ve ilerledikçe kaydeder — çoğu klinisyen bunu iki hasta arasında tamamlar." },
    ],
    ctaTitle: "Hastanıza bekleme listesinin ötesinde seçenekler sunun",
    ctaButton: "Klinisyen olarak kayıt ol",
  },
};
