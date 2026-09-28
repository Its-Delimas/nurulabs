/**
 * Every lab dataset, by the file name it's published under in /data/.
 *
 * Only scripts/export-data.mjs imports this: it writes each dataset to
 * public/data/ before a build, so the CSVs are downloaded when a lab runs
 * instead of being bundled into the site's JavaScript. Labs refer to them
 * with dataFile() from ./paths.
 */
import { CLINICS_CSV, COUNTY_POPULATION_CSV, VISITS_CSV } from "./clinics";
import { CROPS_CSV } from "./crops";
import { CUSTOMERS_CSV } from "./customers";
import { MM_EXPORT_CSV, SACCO_LEDGER_CSV } from "./engineering";
import { MARKET_API_PY } from "./market-api";
import { FARMS_CSV } from "./farms";
import { HF_SWAHILI_MODELS_CSV } from "./hub";
import { HOUSEHOLDS_CSV, IMMUNISATION_CSV, SCHOOLS_CSV, SMS_TRIAL_CSV, STUDENTS_CSV } from "./inference";
import { LOANS_CSV } from "./loans";
import { MAIZE_PRICES_CSV } from "./prices";
import { COUNTIES_CSV, KENYA_COUNTIES_GEOJSON, WORLD_BANK_CSV } from "./open-data";
import { REVIEWS_CSV } from "./reviews";
import { SURVEY_CSV } from "./survey";
import { TRANSACTIONS_CSV } from "./transactions";

export const DATA_FILES: Record<string, string> = {
  "farms.csv": FARMS_CSV,
  "crops.csv": CROPS_CSV,
  "maize-prices.csv": MAIZE_PRICES_CSV,
  "customers.csv": CUSTOMERS_CSV,
  "transactions.csv": TRANSACTIONS_CSV,
  "reviews.csv": REVIEWS_CSV,
  "loans.csv": LOANS_CSV,
  "visits.csv": VISITS_CSV,
  "clinics.csv": CLINICS_CSV,
  "county-population.csv": COUNTY_POPULATION_CSV,
  "households.csv": HOUSEHOLDS_CSV,
  "schools.csv": SCHOOLS_CSV,
  "students.csv": STUDENTS_CSV,
  "immunisation.csv": IMMUNISATION_CSV,
  "sms-trial.csv": SMS_TRIAL_CSV,
  "survey.csv": SURVEY_CSV,
  "counties.csv": COUNTIES_CSV,
  "kenya-counties.geojson": KENYA_COUNTIES_GEOJSON,
  "world-bank-africa.csv": WORLD_BANK_CSV,
  "hf-swahili-models.csv": HF_SWAHILI_MODELS_CSV,
  "mm-export.csv": MM_EXPORT_CSV,
  "sacco-ledger.csv": SACCO_LEDGER_CSV,
  "market_api.py": MARKET_API_PY,
};
