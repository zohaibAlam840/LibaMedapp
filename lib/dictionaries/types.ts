// Shape of a translation dictionary. Currently covers the public shell (nav +
// footer) and the home page — the highest-visibility surface. Extend this as
// more pages are localised. EN is the canonical source; other locales mirror it.

export interface HomeStat {
  n: string;
  l: string;
}
export interface TitleText {
  title: string;
  text: string;
}
export interface StepTD {
  title: string;
  description: string;
}
export interface QA {
  q: string;
  a: string;
}

export interface Dictionary {
  nav: {
    forClinicians: string;
    pledge: string;
    hospitals: string;
    corridors: string;
    specialties: string;
    howItWorks: string;
    login: string;
    register: string;
  };
  footer: {
    privacy: string;
    cookies: string;
    terms: string;
    acceptableUse: string;
    accessibility: string;
    security: string;
    subProcessors: string;
    contact: string;
    faq: string;
    rights: string;
  };
  home: {
    eyebrow: string;
    title: string;
    subhead: string;
    ctaRegister: string;
    ctaHow: string;
    stats: HomeStat[];
    values: TitleText[];
    pathwayTitle: string;
    pathwayLede: string;
    pathway: StepTD[];
    corridorsTitle: string;
    corridorsCta: string;
    corridorsLede: string;
    pledgeTitle: string;
    pledgeBody: string;
    pledgeCta: string;
    pledgeItems: string[];
    specialtiesTitle: string;
    viewAll: string;
    security: string[];
    securityLink: string;
    faqTitle: string;
    faqAll: string;
    faqs: QA[];
    ctaTitle: string;
    ctaButton: string;
  };
}
