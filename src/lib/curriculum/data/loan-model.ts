import { LOANS_CSV } from "./loans";

/**
 * The lending model the Responsible AI labs audit: StandardScaler +
 * LogisticRegression on five features, trained on the labs' 70% training
 * split of loans.ts (random_state=0). Exported so widgets show the real
 * model's behaviour. Regenerate if loans.ts changes.
 */
export const LOAN_MODEL: {
  intercept: number;
  features: { name: string; coef: number; mean: number; scale: number }[];
} = {"intercept": 0.8635, "features": [{"name": "monthly_income_ksh", "coef": 0.7199, "mean": 27902.381, "scale": 16234.065}, {"name": "mobile_money_txns", "coef": 0.8584, "mean": 21.267, "scale": 7.921}, {"name": "months_as_customer", "coef": 0.2713, "mean": 29.25, "scale": 17.153}, {"name": "existing_loans", "coef": -0.2812, "mean": 0.681, "scale": 0.858}, {"name": "age", "coef": -0.0355, "mean": 40.312, "scale": 12.239}]};

export interface Applicant {
  applicant_id: string;
  age: number;
  gender: string;
  region: string;
  monthly_income_ksh: number;
  mobile_money_txns: number;
  months_as_customer: number;
  existing_loans: number;
  repaid: number;
}

export const APPLICANTS: Applicant[] = LOANS_CSV.trim()
  .split("\n")
  .slice(1)
  .map((line) => {
    const [id, age, gender, region, income, txns, months, loans, repaid] = line.split(",");
    return {
      applicant_id: id,
      age: +age,
      gender,
      region,
      monthly_income_ksh: +income,
      mobile_money_txns: +txns,
      months_as_customer: +months,
      existing_loans: +loans,
      repaid: +repaid,
    };
  });

/** Each feature's contribution to the log-odds, and the probability of repayment. */
export function scoreApplicant(a: Record<string, number | string>) {
  const contributions = LOAN_MODEL.features.map((f) => ({
    name: f.name,
    value: (f.coef * (Number(a[f.name]) - f.mean)) / f.scale,
  }));
  const z = contributions.reduce((s, c) => s + c.value, LOAN_MODEL.intercept);
  return { contributions, z, p: 1 / (1 + Math.exp(-z)) };
}
