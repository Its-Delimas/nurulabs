/**
 * Every photo on Nurulabs, who took it and where it appears.
 * Keep in step with public/images/CREDITS.md when adding or removing a photo.
 */
export type PhotoCredit = {
  file: string;
  shows: string;
  usedOn: string;
  photographer: string;
  place?: string;
  unsplashId: string;
};

export const photoCredits: PhotoCredit[] = [
  { file: "hero-students.webp", shows: "Students sitting outdoors with laptops", usedOn: "Home page hero", photographer: "Iwaria Inc.", unsplashId: "vWqBjWbc_H4" },
  { file: "circle-pair.webp", shows: "Two developers working together at a monitor", usedOn: "Home page, how it works", photographer: "X (@x)", unsplashId: "IgUR1iX0mqM" },
  { file: "circle-class.webp", shows: "Code on a laptop in a coding class", usedOn: "Home page hero and how it works", photographer: "X (@x)", unsplashId: "YgOCJz9uGMk" },
  { file: "farm-harvest.webp", shows: "Farmers harvesting leafy greens", usedOn: "Home page, local projects", photographer: "Richard Nyoni", unsplashId: "HzdCcbUDCbo" },
  { file: "entebbe-market.webp", shows: "An open-air produce market", usedOn: "Home page, local projects", photographer: "Wietse Jongsma", place: "Entebbe, Uganda", unsplashId: "-OAYEZu641U" },
  { file: "city-dusk.webp", shows: "An African city from above at dusk", usedOn: "Home page, local projects", photographer: "Malik Buraimoh", unsplashId: "hF5bIFQ62Hw" },
  { file: "graduation-nairobi.webp", shows: "Graduates celebrating together", usedOn: "Home page, closing section", photographer: "Oscar Omondi", place: "Nairobi, Kenya", unsplashId: "BZbPR9JbalA" },
  { file: "signin-learner.webp", shows: "A young man working on a laptop at a desk", usedOn: "Sign in", photographer: "Kagou Dicko", place: "Abuja, Nigeria", unsplashId: "uABuB3onLW0" },
  { file: "lost-page.webp", shows: "A young man working on a laptop in a bright office", usedOn: "Page not found", photographer: "Oluwatobi Fasipe", unsplashId: "e8etaVo85AY" },

  { file: "track-python.webp", shows: "A young woman working on a laptop", usedOn: "Python Essentials track", photographer: "Daniel Thomas", unsplashId: "HA-0i0E7sq4" },
  { file: "fruit-stand.webp", shows: "A trader at a fruit and vegetable stall", usedOn: "Python Essentials · Maize Price Tracker", photographer: "Ali Mkumbwa", unsplashId: "XzgW_vYpm8M" },
  { file: "lamu-market.jpg", shows: "A covered produce market", usedOn: "Python Essentials · Maize Price Tracker; AI & ML · Market Price Forecast", photographer: "Photos by Beks", place: "Lamu, Kenya", unsplashId: "uZYZOBH-sK8" },
  { file: "developer-office.webp", shows: "A developer working on a laptop", usedOn: "Python Essentials · Ship Your Project", photographer: "David Olubaji", unsplashId: "wT-xJyLHcNA" },

  { file: "track-data-science.webp", shows: "A woman working on a laptop in an office", usedOn: "Data Science track", photographer: "Akinyemi Gbadamosi", unsplashId: "T_CkxezKRTA" },
  { file: "health-workers.webp", shows: "Two health workers in scrubs on a busy street", usedOn: "Data Science · Clinic Records Clean-up", photographer: "Emmanuel M", unsplashId: "1mf4pz2uIVc" },
  { file: "community-meeting.webp", shows: "Women gathered at a community meeting", usedOn: "Data Science · County Services Survey Report; Python Essentials · Chama Contributions Ledger", photographer: "Annie Spratt", unsplashId: "Sn04BHfa2AY" },
  { file: "pupils-classroom.webp", shows: "Pupils reading in a classroom", usedOn: "Data Science · Did the Programme Work?", photographer: "Emmanuel Ikwuegbu", unsplashId: "VC6MGt9ZoBA" },
  { file: "reading-phone.webp", shows: "A man reading his phone", usedOn: "Data Science · The Savings Reminder Trial; Python Essentials · Mobile-Money Wallet", photographer: "Divaris Shirichena", unsplashId: "P4yr0fvEfsc" },
  { file: "lagos-aerial.webp", shows: "Lagos from above", usedOn: "Data Science · Open-Data Investigation", photographer: "Tunde Buremo", place: "Lagos, Nigeria", unsplashId: "n8DxalbQBic" },

  { file: "track-data-engineering.webp", shows: "Fibre-optic cables in a server rack", usedOn: "Data Engineering track", photographer: "Kirill Sh", unsplashId: "eVWWr6nmDf8" },
  { file: "savings-group-laptop.webp", shows: "Three women going through records on a laptop", usedOn: "Data Engineering · Digitise a SACCO's Ledger; Python Essentials · Chama Contributions Ledger", photographer: "Iwaria Inc.", unsplashId: "M7ALc3UuX_g" },
  { file: "shop-counter.webp", shows: "A shopkeeper at her counter", usedOn: "Data Engineering · Mobile-Money Ledger Analytics", photographer: "Ali Mkumbwa", unsplashId: "EOkN2pRjFsg" },
  { file: "maize-harvest.webp", shows: "A pile of harvested maize", usedOn: "Data Engineering · A Crop Prices Pipeline", photographer: "Jayson Roy", unsplashId: "R_QCTWEVctU" },
  { file: "mother-child.webp", shows: "A mother smiling at her child", usedOn: "Data Engineering · Trustworthy Immunisation Data", photographer: "Moses Sichach", unsplashId: "AdWkBmVCB9Q" },
  { file: "mobile-money-kiosk.webp", shows: "A shopkeeper with a phone at her kiosk", usedOn: "Data Engineering · A Mobile-Money Analytics Pipeline; Python Essentials · Mobile-Money Wallet", photographer: "Ali Mkumbwa", unsplashId: "5dFuO02OHh0" },

  { file: "track-ai.webp", shows: "A developer working across a laptop and a monitor", usedOn: "AI & Machine Learning track", photographer: "Olumuyiwa Sobowale", unsplashId: "kQIdjLbCghA" },
  { file: "storm-savanna.webp", shows: "Storm clouds over grassland", usedOn: "AI & ML · Rainfall & Crop Yield", photographer: "Polina Koroleva", place: "Maasai Mara, Kenya", unsplashId: "g-Jcvkxx0NE" },
  { file: "highland-farms.jpg", shows: "Farmland in the highlands", usedOn: "AI & ML · Rainfall & Crop Yield", photographer: "Joe Ol", place: "Kenya", unsplashId: "ZY0u6We7rDE" },
  { file: "farmer-crops.webp", shows: "A farmer inspecting his crops", usedOn: "AI & ML · Blight Early Warning", photographer: "Richard Nyoni", unsplashId: "1AoGjqdyDLU" },
  { file: "maize-field.jpg", shows: "A field of young maize", usedOn: "AI & ML · Blight Early Warning", photographer: "Gavin Allanwood", unsplashId: "pxVNSTxzA-M" },
  { file: "phone-surprise.webp", shows: "A woman looking at her phone in surprise", usedOn: "AI & ML · Mobile-Money Fraud Watch", photographer: "Ahmed Nasiru", unsplashId: "DDSTN7TZjic" },
  { file: "nairobi-night.jpg", shows: "A city centre lit up at night", usedOn: "AI & ML · Mobile-Money Fraud Watch", photographer: "Click Smith, Nick254 Media", place: "Nairobi, Kenya", unsplashId: "Lc9MlKlMMhI" },
  { file: "tomato-market.webp", shows: "Tomatoes on a market stall", usedOn: "AI & ML · Market Price Forecast", photographer: "Tunde Buremo", unsplashId: "cnVn4Gg4b00" },
  { file: "classroom-numbers.webp", shows: "Children in a classroom with numbers on the wall", usedOn: "AI & ML · Handwritten Digit Reader", photographer: "Antoine Demare", unsplashId: "5OhSEgbUQwo" },
  { file: "support-headset.webp", shows: "A young woman in headphones with her phone", usedOn: "AI & ML · Customer Feedback Assistant", photographer: "Ato Aikins", unsplashId: "agINaOByj4k" },
  { file: "tailor-shop.webp", shows: "A tailor at his sewing machine", usedOn: "AI & ML · Responsible Lending Audit", photographer: "Ali Mkumbwa", unsplashId: "1SAFRlUY0lk" },
];

export const mapCredits = [
  { what: "Africa outline and dotted map", source: "Natural Earth, 1:110m countries", href: "https://www.naturalearthdata.com/", licence: "Public domain" },
  { what: "Kenya county boundaries (Data Science track)", source: "geoBoundaries, gbOpen KEN ADM1", href: "https://www.geoboundaries.org/", licence: "Public domain" },
];

/** Where photographers (or anyone in a photo) can ask for a change or removal. */
export const creditsIssueUrl =
  "https://github.com/Its-Delimas/nurulabs/issues/new?title=" +
  encodeURIComponent("Photo credit or removal request") +
  "&body=" +
  encodeURIComponent("Which photo (file name or page):\n\nWhat you'd like changed (credit, link, or removal):\n\nHow you're connected to it (photographer, person pictured, other):\n");
