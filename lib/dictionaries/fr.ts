import type { Dictionary } from "./types";

export const fr: Dictionary = {
  nav: {
    forClinicians: "Pour les cliniciens",
    pledge: "L’engagement",
    hospitals: "Hôpitaux",
    corridors: "Couloirs",
    specialties: "Spécialités",
    howItWorks: "Comment ça marche",
    login: "Se connecter",
    register: "S’inscrire",
  },
  footer: {
    privacy: "Confidentialité",
    cookies: "Cookies",
    terms: "Conditions",
    acceptableUse: "Utilisation acceptable",
    accessibility: "Accessibilité",
    security: "Sécurité",
    subProcessors: "Sous-traitants",
    contact: "Contact",
    faq: "FAQ",
    rights:
      "LibaMed Ltd, Cardiff, Pays de Galles. Orientations internationales pilotées par des cliniciens — les patients ne peuvent ni créer ni soumettre de dossiers.",
  },
  home: {
    eyebrow: "Orientations entre cliniciens uniquement",
    title: "Des orientations internationales, sans quitter le chevet de votre patient",
    subhead:
      "Orientez votre patient vers un spécialiste nommé dans un hôpital accrédité à l’étranger — avec consentement, sécurité et un compte rendu structuré renvoyé aux soins britanniques. Jamais par e-mail.",
    ctaRegister: "S’inscrire comme clinicien",
    ctaHow: "Comment ça marche",
    stats: [
      { n: "4", l: "couloirs possibles" },
      { n: "100 %", l: "piloté par les cliniciens" },
    ],
    values: [
      {
        title: "Toujours piloté par un clinicien",
        text: "Seul un médecin référent vérifié peut créer un dossier. Les patients ne réservent jamais de traitement via LibaMed.",
      },
      {
        title: "Spécialistes nommés, hôpitaux vérifiés",
        text: "Chaque orientation va à un spécialiste receveur nommé dans un hôpital partenaire accrédité — jamais une boîte de réception générale.",
      },
      {
        title: "Protégé selon la norme la plus stricte",
        text: "Les dossiers sont chiffrés et stockés selon la règle la plus stricte des deux pays — y compris un hébergement certifié HDS pour la France.",
      },
    ],
    pathwayTitle: "Une seule boucle, du début à la fin",
    pathwayLede:
      "Toute l’orientation se déroule au même endroit — sans fils d’e-mails, sans disques envoyés, sans relances.",
    pathway: [
      { title: "Créer l’orientation", description: "Un clinicien britannique vérifié ouvre un dossier avec le consentement du patient — guidé, une question à la fois." },
      { title: "Joindre les dossiers", description: "Lettre d’orientation, analyses, imagerie y compris DICOM — chiffrés et stockés dans la bonne région pour la destination." },
      { title: "Router vers un spécialiste nommé", description: "Le dossier arrive dans la file d’un seul spécialiste nommé d’un hôpital partenaire accrédité. Jamais une boîte partagée." },
      { title: "Examiner et planifier", description: "Le spécialiste renvoie un plan de traitement avec un devis détaillé et un calendrier, dans la plateforme." },
      { title: "Retour aux soins britanniques", description: "Après le traitement, un compte rendu clinique structuré revient au clinicien référent sous 5 jours ouvrés." },
    ],
    corridorsTitle: "Où nous orientons",
    corridorsCta: "Explorer tous les couloirs",
    corridorsLede:
      "Chaque couloir applique automatiquement ses propres règles de protection des données à chaque dossier.",
    pledgeTitle: "L’engagement LibaMed",
    pledgeBody:
      "Huit engagements que la plateforme est conçue pour tenir — de la vérification en quatre étapes des hôpitaux à la transparence des coûts et à un retour garanti aux soins britanniques.",
    pledgeCta: "Lire l’engagement complet",
    pledgeItems: [
      "Uniquement des cliniques que nous confierions à nos propres familles",
      "Chaque orientation est pilotée par un clinicien",
      "Protégé selon la norme la plus stricte",
      "Transparence des coûts, toujours",
      "Un retour fluide vers les soins britanniques",
      "Nous écoutons quand quelque chose ne va pas",
      "Le jugement professionnel n’est jamais à vendre",
      "L’engagement évolue avec nous",
    ],
    specialtiesTitle: "Spécialités",
    viewAll: "Voir tout",
    security: [
      "Chiffrement AES-256 au repos",
      "TLS 1.3 en transit",
      "Hébergement certifié HDS dans l’EEE pour la France",
    ],
    specialtiesLede:
      "Les hôpitaux partenaires proposent un large éventail de spécialités et de technologies médicales. Ce qui peut être orienté dépend du couloir — la plateforme bloque tout ce qui est couramment disponible au NHS.",
    specialtyCategories: [
      { title: "Cancérologie", text: "Oncologie, radiothérapie et thérapies cellulaires, y compris des traitements non financés au Royaume-Uni." },
      { title: "Chirurgie complexe", text: "Interventions thoraciques, orthopédiques, neurologiques et reconstructrices dans des centres à fort volume." },
      { title: "Diagnostic et imagerie", text: "Imagerie et anatomopathologie avancées, avec transfert sécurisé des examens DICOM au spécialiste désigné." },
      { title: "Thérapies avancées", text: "Fertilité, transplantation et traitements émergents dont l'accès est limité dans le pays d'origine." },
    ],
    securityTitle: "Conçu selon une norme clinique",
    securityLede:
      "Les dossiers des patients sont protégés en transit, au repos et dans la région exigée par leur couloir.",
    securityLink: "Aperçu de la sécurité",
    faqTitle: "Questions fréquentes",
    faqAll: "Toutes les questions et le glossaire",
    faqs: [
      { q: "Qu’est-ce que LibaMed ?", a: "Une plateforme de clinicien à clinicien pour les orientations médicales internationales. Un médecin britannique oriente un patient — avec son consentement — vers un spécialiste nommé dans un hôpital accrédité à l’étranger, et reçoit un compte rendu structuré en retour pour la continuité des soins. LibaMed Ltd est immatriculée à Cardiff, au Pays de Galles." },
      { q: "Est-ce un site de réservation de tourisme médical ?", a: "Non. Il n’y a pas de réservation côté patient. Les patients ne peuvent pas créer, modifier ou soumettre de dossiers — chaque orientation est créée et détenue par un clinicien vérifié." },
      { q: "Combien de temps faut-il pour créer une orientation ?", a: "Quelques minutes. L’admission guidée pose une question à la fois et enregistre au fur et à mesure — la plupart des cliniciens la complètent entre deux patients." },
    ],
    ctaTitle: "Offrez à votre patient des options au-delà de la liste d’attente",
    ctaButton: "S’inscrire comme clinicien",
  },
};
