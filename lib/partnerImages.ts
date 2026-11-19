// Partner photography.
//
// Deliberately code, not a database column. The image files themselves live in
// public/partners/<id>/ and ship with a deploy, so a path stored in Supabase
// could never point at anything an admin had not already had committed — the
// extra table column would buy an edit the admin cannot actually make. When
// LibaMed gains real image uploads this becomes a column and this file goes.
//
// Every image here is supplied by the partner and used with its permission;
// `credit` is rendered wherever the photograph is, so the provenance travels
// with the picture rather than living in a spreadsheet.

export interface PartnerImage {
  src: string;
  /** Empty string only for purely decorative use — these are not decorative. */
  alt: string;
}

export interface PartnerImages {
  /** Wide-ish thumbnail for the directory and home-page cards. */
  card?: PartnerImage;
  /** Feature image on the hospital profile. */
  feature?: PartnerImage;
  /** Shown under any image from this partner. */
  credit?: string;
}

const PARTNER_IMAGES: Record<string, PartnerImages> = {
  sheba: {
    card: {
      src: "/partners/sheba/sheba-campus.jpg",
      alt: "Aerial view of the Sheba Medical Center campus at Tel HaShomer",
    },
    feature: {
      src: "/partners/sheba/sheba-care.jpg",
      alt: "A Sheba Medical Center nurse carrying a young patient on the ward",
    },
    credit: "Photograph supplied by Sheba Medical Center",
  },
};

export function getPartnerImages(hospitalId: string): PartnerImages {
  return PARTNER_IMAGES[hospitalId] ?? {};
}
