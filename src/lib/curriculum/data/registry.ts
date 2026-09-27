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
import { FARMS_CSV } from "./farms";
import { HOUSEHOLDS_CSV, IMMUNISATION_CSV, SCHOOLS_CSV, SMS_TRIAL_CSV, STUDENTS_CSV } from "./inference";
import { LOANS_CSV } from "./loans";
import { MAIZE_PRICES_CSV } from "./prices";
import { REVIEWS_CSV } from "./reviews";
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
};
