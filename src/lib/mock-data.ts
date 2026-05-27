export type CategoryIconName =
  | "laptop"
  | "car"
  | "home"
  | "sofa"
  | "shirt"
  | "bike"
  | "baby"
  | "wrench"
  | "boxes"
  | "sparkles"
  | "handshake";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: CategoryIconName;
  subcategories: string[];
};

export type ListingType = "sell" | "buy" | "rent" | "swap";

export type ListingCondition =
  | "Nou"
  | "Foarte bun"
  | "Bun"
  | "Folosit"
  | "Nu se aplică";

export type Seller = {
  name: string;
  city: string;
  joinedAt: string;
  verified: boolean;
  rating: string;
};

export type Listing = {
  id: string;
  userId?: string;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  currency: "lei" | "EUR" | null;
  pricePrefix?: string;
  city: string;
  county: string;
  citySlug?: string;
  countySlug?: string;
  publicLatitude?: number | null;
  publicLongitude?: number | null;
  locationPrecision?: "city" | "approximate" | "exact_private";
  locationLabel?: string | null;
  distanceKm?: number | null;
  categorySlug: string;
  type: ListingType;
  condition: ListingCondition;
  attributes?: Record<string, string | number | boolean | string[] | null>;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  createdAt: string;
  seller: Seller;
  featured: boolean;
  visualStyle: string;
  imageUrls?: string[];
  status?: string;
  isNegotiable?: boolean;
  subcategory?: string;
  promotion?: {
    type: "boost" | "featured";
    packageName?: string;
    endsAt?: string;
  };
};

export const categories: Category[] = [
  {
    id: "cat-electronice",
    slug: "electronice",
    name: "Electronice",
    description: "Telefoane, laptopuri, console și gadgeturi verificate local.",
    iconName: "laptop",
    subcategories: ["Telefoane", "Laptopuri", "Console", "Audio"],
  },
  {
    id: "cat-auto",
    slug: "auto",
    name: "Auto",
    description: "Mașini, piese, jante, accesorii și echipamente auto.",
    iconName: "car",
    subcategories: ["Autoturisme", "Piese auto", "Jante", "Accesorii"],
  },
  {
    id: "cat-imobiliare",
    slug: "imobiliare",
    name: "Imobiliare",
    description: "Apartamente, camere, garsoniere, case și terenuri.",
    iconName: "home",
    subcategories: ["Apartamente", "Garsoniere", "Camere", "Case"],
  },
  {
    id: "cat-casa-gradina",
    slug: "casa-gradina",
    name: "Casă & grădină",
    description: "Mobilă, decor, electrocasnice, unelte și plante.",
    iconName: "sofa",
    subcategories: ["Mobilă", "Decor", "Grădină", "Unelte"],
  },
  {
    id: "cat-fashion",
    slug: "fashion",
    name: "Fashion",
    description: "Haine, încălțăminte, accesorii și piese premium.",
    iconName: "shirt",
    subcategories: ["Haine", "Încălțăminte", "Genți", "Accesorii"],
  },
  {
    id: "cat-sport",
    slug: "sport",
    name: "Sport",
    description: "Biciclete, trotinete, fitness, outdoor și echipamente.",
    iconName: "bike",
    subcategories: ["Biciclete", "Trotinete", "Fitness", "Outdoor"],
  },
  {
    id: "cat-copii-bebe",
    slug: "copii-bebe",
    name: "Copii & bebe",
    description: "Jucării, cărucioare, scaune auto, haine și mobilier.",
    iconName: "baby",
    subcategories: ["Cărucioare", "Jucării", "Haine", "Scaune auto"],
  },
  {
    id: "cat-servicii",
    slug: "servicii",
    name: "Servicii",
    description: "Ajutor local, reparații, montaj, transport și profesioniști.",
    iconName: "wrench",
    subcategories: ["Montaj", "Reparații", "Transport", "Curățenie"],
  },
  {
    id: "cat-inchirieri",
    slug: "inchirieri",
    name: "Închirieri",
    description: "Scule, utilaje și echipamente de închiriat pentru proiecte rapide.",
    iconName: "boxes",
    subcategories: ["Scule", "Utilaje", "Echipamente", "Diverse"],
  },
  {
    id: "cat-schimburi",
    slug: "schimburi",
    name: "Schimburi",
    description: "Trocuri simple pentru obiecte, gadgeturi și servicii.",
    iconName: "handshake",
    subcategories: ["Electronice", "Auto", "Servicii", "Diverse"],
  },
];

export const listings: Listing[] = [
  {
    id: "listing-iphone-14-pro",
    slug: "iphone-14-pro-128gb",
    title: "iPhone 14 Pro, 128GB",
    description:
      "Telefon întreținut, ecran fără zgârieturi, cutie originală și cablu inclus. Ideal pentru cine vrea un upgrade curat, fără bătăi de cap.",
    price: 4350,
    currency: "lei",
    city: "Cluj-Napoca",
    county: "Cluj",
    categorySlug: "electronice",
    attributes: {
      brand: "Apple",
      model: "iPhone 14 Pro",
      storage_gb: "128",
      warranty: true,
      condition_detail: "Ca nou",
    },
    brand: "Apple",
    model: "iPhone 14 Pro",
    year: 2022,
    type: "sell",
    condition: "Foarte bun",
    createdAt: "2026-05-20",
    seller: {
      name: "Andrei Pop",
      city: "Cluj-Napoca",
      joinedAt: "2025",
      verified: true,
      rating: "4.9",
    },
    featured: true,
    promotion: {
      type: "featured",
      packageName: "Promovat 7 zile",
      endsAt: "2026-05-28T20:00:00.000Z",
    },
    visualStyle:
      "linear-gradient(135deg, #E8F1EE 0%, #BFDAD3 52%, #2F6F65 100%)",
  },
  {
    id: "listing-bicicleta-pegas",
    slug: "bicicleta-urbana-pegas",
    title: "Bicicletă urbană Pegas",
    description:
      "Bicicletă de oraș cu revizie făcută recent, șa confortabilă și lumini incluse. Se poate testa în zona Tineretului.",
    price: 890,
    currency: "lei",
    city: "București",
    county: "București",
    categorySlug: "sport",
    attributes: {
      brand: "Pegas",
      sport_type: "Ciclism",
      size: "M",
    },
    brand: "Pegas",
    type: "sell",
    condition: "Bun",
    createdAt: "2026-05-19",
    seller: {
      name: "Mara Ionescu",
      city: "București",
      joinedAt: "2024",
      verified: true,
      rating: "4.8",
    },
    featured: true,
    promotion: {
      type: "boost",
      packageName: "Boost 24h",
      endsAt: "2026-05-26T12:00:00.000Z",
    },
    visualStyle:
      "linear-gradient(135deg, #FFF2CF 0%, #E9B44C 55%, #B98226 100%)",
  },
  {
    id: "listing-garsoniera-inchiriat",
    slug: "garsoniera-de-inchiriat-brasov",
    title: "Garsonieră de închiriat",
    description:
      "Garsonieră mobilată, luminoasă, aproape de centru și de stații de transport. Potrivită pentru o persoană sau un cuplu.",
    price: 320,
    currency: "EUR",
    pricePrefix: "pe lună",
    city: "Brașov",
    county: "Brașov",
    categorySlug: "imobiliare",
    attributes: {
      rooms: "1",
      surface_sqm: 34,
      floor: "2",
      property_type: "Garsonieră",
      furnished: "Mobilat",
    },
    type: "rent",
    condition: "Nu se aplică",
    createdAt: "2026-05-18",
    seller: {
      name: "Ioana Radu",
      city: "Brașov",
      joinedAt: "2023",
      verified: false,
      rating: "4.6",
    },
    featured: true,
    visualStyle:
      "linear-gradient(135deg, #FFFDF8 0%, #D8CBB8 46%, #8FA39D 100%)",
  },
  {
    id: "listing-birou-lemn-masiv",
    slug: "birou-din-lemn-masiv",
    title: "Birou din lemn masiv",
    description:
      "Birou din stejar masiv, stabil și încăpător, potrivit pentru lucru de acasă. Are urme fine normale de utilizare.",
    price: 650,
    currency: "lei",
    city: "Sibiu",
    county: "Sibiu",
    categorySlug: "casa-gradina",
    attributes: {
      material: "Stejar",
      color: "Natur",
      dimensions: "140 x 70 cm",
      delivery_available: false,
    },
    type: "sell",
    condition: "Bun",
    createdAt: "2026-05-17",
    seller: {
      name: "Darius Matei",
      city: "Sibiu",
      joinedAt: "2024",
      verified: true,
      rating: "4.7",
    },
    featured: true,
    visualStyle:
      "linear-gradient(135deg, #F4E5D0 0%, #C8945B 54%, #6B4D34 100%)",
  },
  {
    id: "listing-playstation-5",
    slug: "cumpar-playstation-5",
    title: "PlayStation 5",
    description:
      "Caut PlayStation 5 cu garanție și controller original. Prefer predare personală și probă rapidă înainte de cumpărare.",
    price: 1900,
    currency: "lei",
    pricePrefix: "cumpăr până la",
    city: "Iași",
    county: "Iași",
    categorySlug: "electronice",
    attributes: {
      brand: "Sony",
      model: "PlayStation 5",
      storage_gb: "825",
      warranty: true,
    },
    brand: "Sony",
    model: "PlayStation 5",
    type: "buy",
    condition: "Foarte bun",
    createdAt: "2026-05-16",
    seller: {
      name: "Răzvan Luca",
      city: "Iași",
      joinedAt: "2025",
      verified: false,
      rating: "4.5",
    },
    featured: true,
    visualStyle:
      "linear-gradient(135deg, #F5F7FA 0%, #C8D4E8 50%, #516078 100%)",
  },
  {
    id: "listing-schimb-laptop-telefon",
    slug: "schimb-laptop-cu-telefon",
    title: "Schimb laptop cu telefon",
    description:
      "Schimb MacBook Air M1 cu telefon premium recent. Accept diferență unde este cazul, prefer predare în Timișoara.",
    price: null,
    currency: null,
    city: "Timișoara",
    county: "Timiș",
    categorySlug: "schimburi",
    attributes: {
      wanted_item: "Telefon premium",
      accepts_difference: true,
      preferred_category: "Electronice",
    },
    type: "swap",
    condition: "Foarte bun",
    createdAt: "2026-05-15",
    seller: {
      name: "Sorin Pavel",
      city: "Timișoara",
      joinedAt: "2022",
      verified: true,
      rating: "4.9",
    },
    featured: true,
    visualStyle:
      "linear-gradient(135deg, #E8F1EE 0%, #FFF2CF 48%, #E9B44C 100%)",
  },
  {
    id: "listing-canapea-modulara",
    slug: "canapea-modulara",
    title: "Canapea modulară",
    description:
      "Canapea modulară în stofă bej, trei module, husă curată și structură solidă. Se poate configura pe colț sau liniar.",
    price: 2200,
    currency: "lei",
    city: "Oradea",
    county: "Bihor",
    categorySlug: "casa-gradina",
    type: "sell",
    condition: "Foarte bun",
    createdAt: "2026-05-14",
    seller: {
      name: "Elena Barbu",
      city: "Oradea",
      joinedAt: "2023",
      verified: true,
      rating: "4.8",
    },
    featured: false,
    visualStyle:
      "linear-gradient(135deg, #FFFDF8 0%, #E8E1D8 54%, #A89680 100%)",
  },
  {
    id: "listing-volkswagen-golf-7",
    slug: "volkswagen-golf-7",
    title: "Volkswagen Golf 7",
    description:
      "Golf 7, motor 1.6 TDI, istoric service, anvelope bune și consum redus. Mașina este folosită zilnic și se poate verifica.",
    price: 8450,
    currency: "EUR",
    city: "Ploiești",
    county: "Prahova",
    categorySlug: "auto",
    attributes: {
      brand: "Volkswagen",
      model: "Golf 7",
      year: 2016,
      mileage_km: 164000,
      fuel: "Diesel",
      transmission: "Manuală",
    },
    brand: "Volkswagen",
    model: "Golf 7",
    year: 2016,
    type: "sell",
    condition: "Bun",
    createdAt: "2026-05-13",
    seller: {
      name: "Mihai Stan",
      city: "Ploiești",
      joinedAt: "2021",
      verified: true,
      rating: "4.7",
    },
    featured: false,
    visualStyle:
      "linear-gradient(135deg, #E8F1EE 0%, #A9BBB5 48%, #3D4A47 100%)",
  },
  {
    id: "listing-set-jante-aliaj",
    slug: "set-jante-aliaj",
    title: "Set jante aliaj",
    description:
      "Set de jante aliaj pe 17 inch, potrivite pentru mai multe modele compacte. Au mici urme estetice, fără fisuri.",
    price: 1200,
    currency: "lei",
    city: "Constanța",
    county: "Constanța",
    categorySlug: "auto",
    type: "sell",
    condition: "Folosit",
    createdAt: "2026-05-12",
    seller: {
      name: "Alex Enache",
      city: "Constanța",
      joinedAt: "2024",
      verified: false,
      rating: "4.4",
    },
    featured: false,
    visualStyle:
      "linear-gradient(135deg, #F5F5F0 0%, #C9CBC4 50%, #6C7069 100%)",
  },
  {
    id: "listing-apartament-2-camere-cluj",
    slug: "apartament-2-camere-cluj",
    title: "Apartament 2 camere Cluj",
    description:
      "Apartament decomandat cu balcon, aproape de parc și transport. Se vinde mobilat parțial, cu actele pregătite.",
    price: 118000,
    currency: "EUR",
    city: "Cluj-Napoca",
    county: "Cluj",
    categorySlug: "imobiliare",
    attributes: {
      rooms: "2",
      surface_sqm: 56,
      floor: "3",
      property_type: "Apartament",
      furnished: "Parțial mobilat",
    },
    type: "sell",
    condition: "Nu se aplică",
    createdAt: "2026-05-11",
    seller: {
      name: "Ana Moldovan",
      city: "Cluj-Napoca",
      joinedAt: "2020",
      verified: true,
      rating: "5.0",
    },
    featured: false,
    promotion: {
      type: "featured",
      packageName: "Promovat 30 zile",
      endsAt: "2026-06-10T18:00:00.000Z",
    },
    visualStyle:
      "linear-gradient(135deg, #F6F3EE 0%, #DCCFBF 46%, #9CA79F 100%)",
  },
  {
    id: "listing-rochie-minimalista",
    slug: "rochie-minimalista",
    title: "Rochie minimalistă",
    description:
      "Rochie midi, croi simplu, material plăcut și ușor. Purtată o singură dată la un eveniment de zi.",
    price: 180,
    currency: "lei",
    city: "București",
    county: "București",
    categorySlug: "fashion",
    attributes: {
      brand: "COS",
      size: "M",
      gender: "Femei",
      color: "Negru",
    },
    brand: "COS",
    type: "sell",
    condition: "Foarte bun",
    createdAt: "2026-05-10",
    seller: {
      name: "Irina Dobre",
      city: "București",
      joinedAt: "2025",
      verified: true,
      rating: "4.9",
    },
    featured: false,
    visualStyle:
      "linear-gradient(135deg, #FFFDF8 0%, #EAD7D1 55%, #9E6F66 100%)",
  },
  {
    id: "listing-carucior-bebe-3-in-1",
    slug: "carucior-bebe-3-in-1",
    title: "Cărucior bebe 3 în 1",
    description:
      "Cărucior complet cu landou, parte sport și scoică auto. Curat, pliabil, potrivit pentru primele luni.",
    price: 950,
    currency: "lei",
    city: "Arad",
    county: "Arad",
    categorySlug: "copii-bebe",
    type: "sell",
    condition: "Bun",
    createdAt: "2026-05-09",
    seller: {
      name: "Oana Crișan",
      city: "Arad",
      joinedAt: "2023",
      verified: false,
      rating: "4.6",
    },
    featured: false,
    visualStyle:
      "linear-gradient(135deg, #FFF2CF 0%, #F1D9A2 52%, #A7874B 100%)",
  },
  {
    id: "listing-servicii-montaj-mobila",
    slug: "servicii-montaj-mobila",
    title: "Servicii montaj mobilă",
    description:
      "Montez mobilă de living, dormitor, bucătărie și birou. Lucrez ordonat, cu programare și estimare transparentă.",
    price: 120,
    currency: "lei",
    pricePrefix: "de la",
    city: "București",
    county: "București",
    categorySlug: "servicii",
    type: "sell",
    condition: "Nu se aplică",
    createdAt: "2026-05-08",
    seller: {
      name: "Florin Tudor",
      city: "București",
      joinedAt: "2022",
      verified: true,
      rating: "4.9",
    },
    featured: false,
    visualStyle:
      "linear-gradient(135deg, #E8F1EE 0%, #C7DDD7 48%, #5E857C 100%)",
  },
  {
    id: "listing-betoniera-inchiriat-iasi",
    slug: "betoniera-compacta-de-inchiriat-iasi",
    title: "Betonieră compactă de închiriat",
    description:
      "Betonieră compactă pentru lucrări mici și renovări. Se predă curată, cu probă rapidă și program flexibil.",
    price: 90,
    currency: "lei",
    pricePrefix: "pe zi",
    city: "Iași",
    county: "Iași",
    categorySlug: "inchirieri",
    type: "rent",
    condition: "Bun",
    createdAt: "2026-05-07",
    seller: {
      name: "Bianca Nistor",
      city: "Iași",
      joinedAt: "2024",
      verified: true,
      rating: "4.8",
    },
    featured: false,
    visualStyle:
      "linear-gradient(135deg, #FFFDF8 0%, #DEE9E6 50%, #7CA399 100%)",
  },
  {
    id: "listing-macbook-air-m2",
    slug: "macbook-air-m2",
    title: "MacBook Air M2",
    description:
      "MacBook Air M2, 8GB RAM, 256GB SSD, stare excelentă. Folosit pentru birou și browsing, cu încărcător original.",
    price: 4200,
    currency: "lei",
    city: "Târgu Mureș",
    county: "Mureș",
    categorySlug: "electronice",
    attributes: {
      brand: "Apple",
      model: "MacBook Air M2",
      storage_gb: "256",
      warranty: false,
      condition_detail: "Ca nou",
    },
    brand: "Apple",
    model: "MacBook Air M2",
    year: 2022,
    type: "sell",
    condition: "Foarte bun",
    createdAt: "2026-05-06",
    seller: {
      name: "Paul Sava",
      city: "Târgu Mureș",
      joinedAt: "2021",
      verified: true,
      rating: "4.9",
    },
    featured: false,
    visualStyle:
      "linear-gradient(135deg, #F8FAFB 0%, #D8DEE7 52%, #778396 100%)",
  },
  {
    id: "listing-nintendo-switch",
    slug: "consola-nintendo-switch",
    title: "Consolă Nintendo Switch",
    description:
      "Consolă Nintendo Switch cu dock, două joy-con-uri și husă. Funcționează perfect, bună pentru familie sau travel.",
    price: 1250,
    currency: "lei",
    city: "Galați",
    county: "Galați",
    categorySlug: "electronice",
    type: "sell",
    condition: "Bun",
    createdAt: "2026-05-05",
    seller: {
      name: "Vlad Marin",
      city: "Galați",
      joinedAt: "2025",
      verified: false,
      rating: "4.5",
    },
    featured: false,
    visualStyle:
      "linear-gradient(135deg, #E8F1EE 0%, #F7CF82 50%, #C65A3D 100%)",
  },
  {
    id: "listing-trotineta-electrica",
    slug: "trotineta-electrica",
    title: "Trotinetă electrică",
    description:
      "Trotinetă electrică pliabilă, autonomie bună pentru oraș și frâne reglate. Include încărcător și antifurt.",
    price: 1450,
    currency: "lei",
    city: "Brașov",
    county: "Brașov",
    categorySlug: "sport",
    type: "sell",
    condition: "Bun",
    createdAt: "2026-05-04",
    seller: {
      name: "Cătălin Dumitru",
      city: "Brașov",
      joinedAt: "2023",
      verified: true,
      rating: "4.7",
    },
    featured: false,
    visualStyle:
      "linear-gradient(135deg, #F6F3EE 0%, #C5D6D1 50%, #2F6F65 100%)",
  },
  {
    id: "listing-caut-apartament-cumparat",
    slug: "caut-apartament-de-cumparat",
    title: "Caut apartament de cumpărat",
    description:
      "Caut apartament cu două camere, preferabil în cartiere cu acces bun la transport. Buget flexibil pentru o locuință întreținută.",
    price: 95000,
    currency: "EUR",
    pricePrefix: "buget până la",
    city: "Timișoara",
    county: "Timiș",
    categorySlug: "imobiliare",
    type: "buy",
    condition: "Nu se aplică",
    createdAt: "2026-05-03",
    seller: {
      name: "Laura Petrescu",
      city: "Timișoara",
      joinedAt: "2024",
      verified: true,
      rating: "4.8",
    },
    featured: false,
    visualStyle:
      "linear-gradient(135deg, #FFF2CF 0%, #D9E9E4 50%, #6A8D86 100%)",
  },
];

export const featuredListings = listings.filter((listing) => listing.featured);
