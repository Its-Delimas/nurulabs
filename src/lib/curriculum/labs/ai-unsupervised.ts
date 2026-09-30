import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const CUST = { "customers.csv": dataFile("customers.csv") };
const TX = { "transactions.csv": dataFile("transactions.csv") };

const LOAD_CUST = `import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("customers.csv")
features = ["monthly_txns", "avg_amount_ksh", "airtime_share", "savings_ksh", "merchant_share", "age"]
X_scaled = StandardScaler().fit_transform(df[features])
`;

const LOAD_TX = `import numpy as np
import pandas as pd

t = pd.read_csv("transactions.csv")
`;

const ENGINEER = `t["drain"] = t["amount_ksh"] / t["balance_before_ksh"]          # share of balance sent
t["night"] = t["hour"].isin([22, 23, 0, 1, 2, 3, 4]).astype(int)
t["young"] = (t["account_age_days"] < 90).astype(int)
`;

const SK = (mod: string) => `__import__("sklearn.${mod}", fromlist=["x"])`;

export const kmeansLab: Lab = {
  slug: "kmeans",
  number: "21",
  title: "k-Means Clustering",
  subject: "Clustering",
  summary:
    "No labels, just data: let the algorithm group 250 mobile-money customers by behaviour, choose how many groups there really are, and describe what each one means.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: CUST,
  skills: [
    "Explain how k-means groups unlabelled data",
    "Choose k with the elbow and silhouette scores",
    "Profile clusters so people can act on them",
  ],
  steps: [
    {
      id: "unsupervised",
      kind: "concept",
      title: "Learning without answers",
      body: [
        "Everything so far was **supervised**: every example came with the right answer. **Unsupervised** learning has no answers — it looks for structure on its own.",
        "**Clustering** groups similar examples together. A mobile-money provider might cluster customers to design products for each group — without anyone labelling them first.",
        "**k-means** is the classic: pick k centres, assign every point to its nearest centre, move each centre to the average of its points, repeat until nothing changes.",
      ],
      keyIdea: "Unsupervised = no labels. k-means alternates two steps — assign to nearest centre, move centres to the mean — until it settles.",
    },
    {
      id: "stepper",
      kind: "experiment",
      title: "Run k-means by hand",
      prompt: "Press the button to alternate the two steps and watch the centres travel. Try a new random start, and try the wrong k.",
      widget: "kmeans-stepper",
      observe:
        "Within a few rounds the centres settle into the groups and inertia stops falling. With the wrong k the algorithm still produces an answer — it just splits or merges real groups. k-means always finds *some* clusters; deciding whether they're meaningful is your job.",
    },
    {
      id: "predict-centre",
      kind: "predict",
      title: "Where does a centre move?",
      prompt: "Three points are assigned to one cluster. Where does its centre move?",
      code: `import numpy as np
cluster = np.array([[1, 2], [3, 4], [5, 9]])
print(cluster.mean(axis=0))`,
      options: ["[3. 5.]", "[9. 15.]", "[3. 4.]", "[1. 2.]"],
      answer: 0,
      explanation: "The centre moves to the average of its points: x = (1 + 3 + 5) / 3 = 3, y = (2 + 4 + 9) / 3 = 5. That's the \"means\" in k-means.",
    },
    {
      id: "choose-k",
      kind: "concept",
      title: "Scaling, k, and meaning",
      body: [
        "k-means uses distances, so **scale first** — otherwise savings in the tens of thousands drowns out airtime shares between 0 and 1.",
        "How many clusters? The **elbow method** plots inertia (total squared distance to centres) for each k and looks for the bend where adding clusters stops helping much. The **silhouette score** (−1 to 1) measures how well each point sits in its own cluster versus the next nearest; higher is better.",
        "A cluster is only useful once you can **describe** it: group the original columns by cluster and read the averages. \"Cluster 2\" means nothing; \"young, airtime-heavy, small balances\" does.",
      ],
      code: `from sklearn.cluster import KMeans

km = KMeans(n_clusters=4, n_init=10, random_state=0).fit(X_scaled)
df["cluster"] = km.labels_
print(df.groupby("cluster")[features].mean().round(1))`,
      keyIdea: "Scale, choose k with evidence (elbow, silhouette), then name each cluster from its averages.",
    },
    {
      id: "fit",
      kind: "code",
      title: "Cluster the customers",
      brief:
        "The six behaviour features are already standardised in `X_scaled`. Fit `km = KMeans(n_clusters=4, n_init=10, random_state=0)`, store the labels in `df[\"cluster\"]`, and count customers per cluster in `sizes`.",
      starterCode: LOAD_CUST + `from sklearn.cluster import KMeans

print(df.head())

`,
      checks: [
        { expr: "type(km).__name__ == 'KMeans' and km.n_clusters == 4 and hasattr(km, 'labels_')", label: "A fitted 4-cluster KMeans", failHint: "`km = KMeans(n_clusters=4, n_init=10, random_state=0).fit(X_scaled)`" },
        { expr: "(df['cluster'].to_numpy() == km.labels_).all()", label: "Every customer has a cluster label", failHint: '`df["cluster"] = km.labels_`' },
        { expr: "sizes.sum() == 250 and len(sizes) == 4", label: "`sizes` counts customers per cluster", failHint: '`df["cluster"].value_counts()`' },
      ],
      hints: ["Fit on `X_scaled`, not the raw columns."],
      why: "Four groups of roughly equal size emerged from behaviour alone — nobody told the algorithm what a \"student\" or a \"trader\" is.",
      solution: LOAD_CUST + `from sklearn.cluster import KMeans

km = KMeans(n_clusters=4, n_init=10, random_state=0).fit(X_scaled)
df["cluster"] = km.labels_
sizes = df["cluster"].value_counts()
print(sizes)`,
    },
    {
      id: "elbow",
      kind: "code",
      title: "How many clusters are there really?",
      brief:
        "For each k from 2 to 7, fit KMeans (`n_init=10, random_state=0`) and record `inertias[k]` and `silhouettes[k]` (using `silhouette_score`). Set `best_k` to the k with the highest silhouette.",
      starterCode: LOAD_CUST + `from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

inertias = {}
silhouettes = {}

`,
      checks: [
        { expr: "sorted(inertias) == list(range(2, 8)) and sorted(silhouettes) == list(range(2, 8))", label: "Scores for k = 2 to 7", failHint: "`for k in range(2, 8):`" },
        { expr: "all(inertias[k] > inertias[k + 1] for k in range(2, 7))", label: "Inertia keeps falling as k grows", failHint: "`inertias[k] = km.inertia_`" },
        { expr: "best_k == max(silhouettes, key=silhouettes.get) and best_k == 4", label: "`best_k` is 4", failHint: "`silhouettes[k] = silhouette_score(X_scaled, km.labels_)`, then pick the max." },
      ],
      hints: ["Inertia always falls with more clusters — that's why you look for the elbow, or use silhouette instead."],
      why: "Inertia alone would always say \"more clusters\". The silhouette peaks at 4 — and there's a sharp elbow at 4 too. Two pieces of evidence agreeing is what you want.",
      solution: LOAD_CUST + `from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

inertias = {}
silhouettes = {}
for k in range(2, 8):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X_scaled)
    inertias[k] = km.inertia_
    silhouettes[k] = silhouette_score(X_scaled, km.labels_)

best_k = max(silhouettes, key=silhouettes.get)
print(best_k, {k: round(v, 3) for k, v in silhouettes.items()})`,
    },
    {
      id: "profile",
      kind: "code",
      challenge: true,
      title: "Name the segments",
      brief:
        "Cluster into 4 groups as before. Build `profile`: the average of each **original** feature per cluster. Then set `savers` to the cluster with the highest average savings and `young` to the cluster with the lowest average age.",
      starterCode: LOAD_CUST + `from sklearn.cluster import KMeans

`,
      checks: [
        { expr: "profile.shape == (4, 6)", label: "`profile` has one row per cluster, one column per feature", failHint: '`df.groupby("cluster")[features].mean()`' },
        { expr: "savers == profile['savings_ksh'].idxmax() and young == profile['age'].idxmin()", label: "`savers` and `young` identify the right clusters", failHint: "`.idxmax()` / `.idxmin()` on the profile's columns." },
        { expr: "savers != young", label: "They're different groups", failHint: "Check you're reading the right columns." },
      ],
      hints: ["Group the unscaled `df` — people understand shillings and years, not z-scores."],
      why:
        "Now the clusters have names a product team can use: a high-savings salaried group, a young airtime-heavy group, busy traders, and low-activity rural farmers. Remember they're patterns in illustrative data — real segments need validating with the people in them.",
      solution: LOAD_CUST + `from sklearn.cluster import KMeans

km = KMeans(n_clusters=4, n_init=10, random_state=0).fit(X_scaled)
df["cluster"] = km.labels_
profile = df.groupby("cluster")[features].mean()
savers = profile["savings_ksh"].idxmax()
young = profile["age"].idxmin()
print(profile.round(2))
print("savers:", savers, "young:", young)`,
    },
    {
      id: "explain-kmeans",
      kind: "explain",
      title: "Clustering in plain words",
      prompt: "Explain what k-means does, how you'd choose k, and what makes a clustering useful.",
      ideas: [
        { label: "Assigns points to the nearest centre and moves centres to the mean, repeatedly", patterns: ["nearest", "centre", "center", "centroid", "mean", "average", "repeat"], nudge: "What are the two alternating steps?" },
        { label: "Choose k with the elbow or silhouette", patterns: ["elbow", "silhouette", "inertia"], nudge: "What evidence tells you how many clusters?" },
        { label: "Useful clusters can be described and acted on", patterns: ["describ", "profile", "name", "interpret", "act", "mean(ing|ful)", "product"], nudge: "What turns 'cluster 2' into something useful?" },
      ],
      modelAnswer:
        "k-means picks k centres, assigns every point to its nearest centre, then moves each centre to the mean of its points, repeating until nothing changes. I'd choose k using the elbow in the inertia curve and the silhouette score. A clustering is useful when you can describe each cluster from its average features — like 'young, airtime-heavy, small balances' — and act on it.",
    },
  ],
};

export const pcaLab: Lab = {
  slug: "pca",
  number: "22",
  title: "PCA: Seeing Many Columns at Once",
  subject: "Dimensionality reduction",
  summary:
    "Squeeze six customer features into two directions that keep most of the information — to plot high-dimensional data, compress it, and see the clusters for yourself.",
  minutes: 35,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn", "matplotlib"],
  files: CUST,
  skills: [
    "Explain principal components as directions of greatest variation",
    "Measure how much variance components keep",
    "Visualise high-dimensional data in 2D",
  ],
  steps: [
    {
      id: "many-dims",
      kind: "concept",
      title: "Too many columns to look at",
      body: [
        "Six features means every customer is a point in six-dimensional space — impossible to plot. Real datasets have hundreds.",
        "Columns often move together: busy traders make many transactions *and* pay many merchants. That overlap means fewer directions can describe most of the variation.",
        "**Principal Component Analysis (PCA)** finds those directions. The first **principal component** is the line through the data along which it varies most; the second is the best direction at right angles to the first; and so on.",
      ],
      keyIdea: "PCA rotates the data onto new axes ordered by how much variation they capture. Keep the first few, drop the rest.",
    },
    {
      id: "project",
      kind: "experiment",
      title: "Find the best direction",
      prompt: "Rotate the line and watch every point being squashed onto it. How much variation can a single direction keep? Then jump to the best one.",
      widget: "pca-projector",
      observe:
        "Along the data's long axis, one direction keeps most of the spread; across it, almost nothing. That best direction is the first principal component — found automatically, for any number of dimensions.",
    },
    {
      id: "predict-line",
      kind: "predict",
      title: "Points on a line",
      prompt: "All four points lie exactly on a straight line. How much variance does each component explain?",
      code: `import numpy as np
from sklearn.decomposition import PCA
X = np.array([[1, 2], [2, 4], [3, 6], [4, 8]])
print(PCA().fit(X).explained_variance_ratio_.round(2))`,
      options: ["[1. 0.]", "[0.5 0.5]", "[0.8 0.2]", "[0. 1.]"],
      answer: 0,
      explanation: "The points vary only along one line, so the first component captures all of it (1.0) and the second nothing (0.0). Two columns, one real dimension.",
    },
    {
      id: "sklearn-pca",
      kind: "concept",
      title: "PCA in scikit-learn",
      body: [
        "Always **scale first** — otherwise the column with the biggest numbers becomes the first component just by being big.",
        "`PCA(n_components=2).fit_transform(X_scaled)` gives each row's coordinates on the new axes. `explained_variance_ratio_` says what share of the total variation each component keeps.",
        "PCA is for seeing and compressing, not explaining: each component mixes all the original columns, so it rarely has a clean real-world meaning.",
      ],
      code: `from sklearn.decomposition import PCA

pca = PCA(n_components=2)
coords = pca.fit_transform(X_scaled)
print(coords.shape, pca.explained_variance_ratio_.round(3))`,
      keyIdea: "Scale, fit PCA, check `explained_variance_ratio_`, and keep enough components for the job.",
    },
    {
      id: "two-d",
      kind: "code",
      title: "Six features into two",
      brief: "Reduce the scaled customer data to 2 components: store the coordinates in `coords` and the share of variation the two keep in `kept`.",
      starterCode: LOAD_CUST + `from sklearn.decomposition import PCA

`,
      checks: [
        { expr: "coords.shape == (250, 2)", label: "Two coordinates per customer", failHint: "`PCA(n_components=2).fit_transform(X_scaled)`" },
        { expr: `abs(kept - ${SK("decomposition")}.PCA(2).fit(X_scaled).explained_variance_ratio_.sum()) < 1e-9`, label: "`kept` is the total explained variance", failHint: "`pca.explained_variance_ratio_.sum()`" },
      ],
      hints: ["Keep the fitted `PCA` object in a variable so you can read its `explained_variance_ratio_`."],
      why: "Two numbers per customer now keep about three quarters of the information that took six. That's enough to plot — next.",
      solution: LOAD_CUST + `from sklearn.decomposition import PCA

pca = PCA(n_components=2)
coords = pca.fit_transform(X_scaled)
kept = pca.explained_variance_ratio_.sum()
print(coords.shape, round(kept, 3))`,
    },
    {
      id: "plot",
      kind: "code",
      title: "See the segments",
      brief: "Scatter-plot the two PCA coordinates, coloured by the k-means cluster (`c=labels`), with a title and axis labels `PC1` / `PC2`.",
      starterCode: LOAD_CUST + `import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

labels = KMeans(n_clusters=4, n_init=10, random_state=0).fit_predict(X_scaled)
coords = PCA(n_components=2).fit_transform(X_scaled)

`,
      checks: [
        { expr: "any(c['points'] == 250 for c in _charts)", label: "A scatter plot of all 250 customers", failHint: "`plt.scatter(coords[:, 0], coords[:, 1], c=labels)`" },
        { expr: "any('pc1' in c['xlabel'].lower() and 'pc2' in c['ylabel'].lower() and c['title'] for c in _charts)", label: "Labelled PC1 / PC2 with a title", failHint: 'Add `plt.xlabel("PC1")`, `plt.ylabel("PC2")` and a title.' },
      ],
      hints: ["`c=labels` colours each dot by its cluster number."],
      why: "Four clouds, clearly separated — you can now *see* the segments k-means found in six dimensions. PCA plots are the standard sanity check for any clustering.",
      solution: LOAD_CUST + `import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

labels = KMeans(n_clusters=4, n_init=10, random_state=0).fit_predict(X_scaled)
coords = PCA(n_components=2).fit_transform(X_scaled)

plt.scatter(coords[:, 0], coords[:, 1], c=labels, cmap="viridis", alpha=0.8)
plt.title("Four customer segments, seen in two dimensions")
plt.xlabel("PC1")
plt.ylabel("PC2")`,
    },
    {
      id: "how-many",
      kind: "code",
      challenge: true,
      title: "How many components do you need?",
      brief: "Fit PCA with all components and set `n_for_90` to the smallest number of components whose **cumulative** explained variance reaches at least 90%.",
      starterCode: LOAD_CUST + `from sklearn.decomposition import PCA

`,
      checks: [
        {
          expr: `n_for_90 == int(np.argmax(np.cumsum(${SK("decomposition")}.PCA().fit(X_scaled).explained_variance_ratio_) >= 0.9)) + 1`,
          label: "`n_for_90` is the smallest count reaching 90%",
          failHint: "`np.cumsum(pca.explained_variance_ratio_)` gives running totals; find the first one ≥ 0.9.",
        },
        { expr: "n_for_90 < 6", label: "Fewer components than original features", failHint: "The point is that you need fewer than six." },
      ],
      hints: ["`np.argmax(mask)` gives the position of the first True — add 1 to turn a position into a count."],
      why: "Half the columns keep over 90% of the variation. On real datasets with hundreds of correlated columns, the savings are far bigger.",
      solution: LOAD_CUST + `from sklearn.decomposition import PCA

cumulative = np.cumsum(PCA().fit(X_scaled).explained_variance_ratio_)
n_for_90 = int(np.argmax(cumulative >= 0.9)) + 1
print(cumulative.round(3), n_for_90)`,
    },
    {
      id: "explain-pca",
      kind: "explain",
      title: "PCA for a colleague",
      prompt: "Explain what PCA does, why you scale first, and one thing it's useful for.",
      ideas: [
        { label: "Finds directions of greatest variation", patterns: ["direction", "variance", "variation", "spread", "component", "axis"], nudge: "What is a principal component?" },
        { label: "Keeps fewer dimensions while keeping most information", patterns: ["fewer", "reduce", "compress", "most of the", "keep", "dimension"], nudge: "What does it let you drop?" },
        { label: "Scale first so big-numbered features don't dominate", patterns: ["scale", "standard", "big(ger)? numbers", "dominat", "units"], nudge: "What happens without scaling?" },
        { label: "Use: visualising, compressing or de-noising", patterns: ["plot", "visuali", "see", "compress", "noise", "speed"], nudge: "What would you use it for?" },
      ],
      modelAnswer:
        "PCA finds the directions along which the data varies most and re-expresses each row on those new axes, so you can keep a few components and drop the rest while keeping most of the information. You scale first, otherwise features measured in big numbers dominate the components. It's useful for visualising high-dimensional data in 2D, compressing it, or removing noise.",
    },
  ],
};

export const anomalyLab: Lab = {
  slug: "anomaly",
  number: "23",
  title: "Anomaly Detection",
  subject: "Finding the unusual",
  summary:
    "Fraud is rare and rarely labelled. Hunt for suspicious mobile-money transactions with rules, z-scores and Isolation Forests — and learn why \"unusual\" and \"fraudulent\" aren't the same thing.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: TX,
  skills: [
    "Flag outliers with rules and z-scores",
    "Detect anomalies with an Isolation Forest",
    "Evaluate a detector honestly with the few labels you have",
  ],
  steps: [
    {
      id: "rare",
      kind: "concept",
      title: "Needles in a haystack",
      body: [
        "Fraud is a small fraction of transactions, it keeps changing shape, and most of it is never labelled. So instead of learning \"what fraud looks like\", **anomaly detection** learns what *normal* looks like and flags what doesn't fit.",
        "But unusual isn't the same as fraudulent: paying a year's school fees is unusual and perfectly honest. Every flag costs something — a blocked payment, an annoyed customer, an analyst's time.",
        "So a detector produces a **shortlist for humans to review**, and you judge it by how many real cases land on that shortlist.",
      ],
      keyIdea: "Model normal, flag the unusual, and judge the shortlist: how much real fraud it holds, and how many honest people it bothers.",
    },
    {
      id: "explore",
      kind: "experiment",
      title: "Write a fraud rule",
      prompt: "Each dot is a transaction; the (normally hidden) frauds are red. Start by flagging big amounts. Then switch to share of balance sent — and finally add the night-time condition to each.",
      widget: "anomaly-explorer",
      observe:
        "Either rule on its own flags dozens of honest customers — rent, stock purchases, school fees are big too. Adding the night-time condition cuts the false alarms from 30–40 to about 3 while still catching most frauds. No single signal is enough; **combining** signals is what separates fraud from the merely unusual.",
    },
    {
      id: "predict-z",
      kind: "predict",
      title: "How unusual?",
      prompt: "Typical transactions average KSh 20 (thousand) with a standard deviation of 25. What's the z-score of a KSh 95 (thousand) transaction?",
      code: `mean, std = 20, 25
print((95 - mean) / std)`,
      options: ["3.0", "75", "3.8", "0.3"],
      answer: 0,
      explanation: "(95 − 20) / 25 = 3.0 standard deviations above average — past the common |z| > 3 cut-off. But being far from average says nothing about *why*.",
    },
    {
      id: "isolation",
      kind: "concept",
      title: "Isolation Forests",
      body: [
        "An **Isolation Forest** builds many random trees that keep splitting the data at random. Unusual points are easy to cut off — they get isolated in very few splits. Normal points, deep in the crowd, take many.",
        "`contamination` tells it roughly what share to flag. `score_samples` gives every transaction an anomaly score (lower means more unusual), so you can rank them.",
        "Like any distance-free method it doesn't need scaling as much — but it still only sees the features you give it. Engineered features like \"share of balance sent\" make fraud stand out.",
      ],
      code: `from sklearn.ensemble import IsolationForest

iso = IsolationForest(contamination=0.03, random_state=0).fit(X)
flags = iso.predict(X) == -1        # -1 means anomaly
print(flags.sum(), "flagged")`,
      keyIdea: "Isolation Forest: anomalies are the points random splits isolate fastest. Give it features where fraud is different.",
    },
    {
      id: "z-flags",
      kind: "code",
      title: "The obvious approach: flag big amounts",
      brief:
        "Flag transactions whose `amount_ksh` z-score is beyond ±3 as `flags_z` (a boolean Series). Then use the labels — for evaluation only — to count how many frauds you caught in `caught_z`, and how many honest transactions you flagged in `false_alarms_z`.",
      starterCode: LOAD_TX + `print(t["is_fraud"].sum(), "frauds hidden among", len(t), "transactions")

`,
      checks: [
        { expr: 'flags_z.sum() == ((t["amount_ksh"] - t["amount_ksh"].mean()).abs() / t["amount_ksh"].std() > 3).sum()', label: "`flags_z` marks |z| > 3", failHint: 'z = (amount − mean) / std; flag where `z.abs() > 3`.' },
        { expr: 'caught_z == int(t.loc[flags_z, "is_fraud"].sum()) and false_alarms_z == int(flags_z.sum()) - caught_z', label: "Catches and false alarms counted", failHint: 'Frauds caught: `t.loc[flags_z, "is_fraud"].sum()`.' },
        { expr: "caught_z < false_alarms_z", label: "It mostly flags honest people", failHint: "Check your counts." },
      ],
      hints: ["Use pandas' `.std()` for the standard deviation."],
      why: "Most of the biggest transactions are honest — rent, stock purchases, school fees. Raw size is a poor fraud signal, and a detector built on it would mostly annoy good customers.",
      solution: LOAD_TX + `z = (t["amount_ksh"] - t["amount_ksh"].mean()) / t["amount_ksh"].std()
flags_z = z.abs() > 3
caught_z = int(t.loc[flags_z, "is_fraud"].sum())
false_alarms_z = int(flags_z.sum()) - caught_z
print(flags_z.sum(), caught_z, false_alarms_z)`,
    },
    {
      id: "iso",
      kind: "code",
      title: "An Isolation Forest on better features",
      brief:
        "Engineer three features — `drain` (amount ÷ balance), `night` (hour 22–4) and `young` (account under 90 days) — then fit `IsolationForest(contamination=0.03, random_state=0)` on the scaled columns in `feats`. Store the boolean anomaly flags in `flags` and the frauds caught in `caught`.",
      starterCode: LOAD_TX + `from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

feats = ["drain", "night", "new_recipient", "txns_last_24h", "young", "amount_ksh"]

`,
      checks: [
        { expr: 'np.allclose(t["drain"], t["amount_ksh"] / t["balance_before_ksh"]) and set(t["night"]) <= {0, 1}', label: "The engineered features exist", failHint: '`t["drain"] = t["amount_ksh"] / t["balance_before_ksh"]`; night = `t["hour"].isin([22, 23, 0, 1, 2, 3, 4]).astype(int)`.' },
        { expr: "len(flags) == 600 and 10 <= flags.sum() <= 25", label: "About 3% of transactions flagged", failHint: "`iso.predict(X) == -1` gives True for anomalies." },
        { expr: 'caught == int(t.loc[flags, "is_fraud"].sum()) and caught >= 12', label: "Most frauds land on the shortlist", failHint: "Did you scale `t[feats]` and fit on it?" },
      ],
      hints: ["`X = StandardScaler().fit_transform(t[feats])`, then fit the forest on `X`."],
      why: "From a few engineered features and no labels at all, a shortlist of 18 transactions holds all 14 frauds. Compare that with the z-score approach: the features did the heavy lifting.",
      solution: LOAD_TX + `from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

` + ENGINEER + `
feats = ["drain", "night", "new_recipient", "txns_last_24h", "young", "amount_ksh"]
X = StandardScaler().fit_transform(t[feats])
iso = IsolationForest(contamination=0.03, random_state=0).fit(X)
flags = iso.predict(X) == -1
caught = int(t.loc[flags, "is_fraud"].sum())
print(flags.sum(), "flagged,", caught, "frauds caught")`,
    },
    {
      id: "raw-vs-eng",
      kind: "code",
      challenge: true,
      title: "Do the features matter?",
      brief:
        "Run the same Isolation Forest (contamination 0.03, `random_state=0`, scaled inputs) twice: on the raw columns in `raw` (`caught_raw`) and on your engineered `feats` (`caught_eng`). Also compute `precision_eng`: the share of the engineered shortlist that's really fraud.",
      starterCode: LOAD_TX + `from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

raw = ["hour", "amount_ksh", "balance_before_ksh", "txns_last_24h", "account_age_days", "new_recipient"]
feats = ["drain", "night", "new_recipient", "txns_last_24h", "young", "amount_ksh"]

`,
      checks: [
        { expr: "caught_eng > caught_raw", label: "Engineered features catch more fraud", failHint: "Write a helper that scales the given columns, fits the forest, and returns the number of frauds flagged." },
        { expr: "0.5 < precision_eng <= 1", label: "`precision_eng` is the fraud share of the shortlist", failHint: "Frauds caught ÷ number flagged." },
      ],
      hints: ["`def detect(cols): X = StandardScaler().fit_transform(t[cols]); return IsolationForest(contamination=0.03, random_state=0).fit(X).predict(X) == -1`"],
      why: "Same algorithm, same settings — the only change was what it could see. Domain knowledge (\"fraudsters drain accounts at night\") beat more raw data.",
      solution: LOAD_TX + `from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

raw = ["hour", "amount_ksh", "balance_before_ksh", "txns_last_24h", "account_age_days", "new_recipient"]
feats = ["drain", "night", "new_recipient", "txns_last_24h", "young", "amount_ksh"]
` + ENGINEER + `
def detect(cols):
    X = StandardScaler().fit_transform(t[cols])
    return IsolationForest(contamination=0.03, random_state=0).fit(X).predict(X) == -1

f_raw, f_eng = detect(raw), detect(feats)
caught_raw = int(t.loc[f_raw, "is_fraud"].sum())
caught_eng = int(t.loc[f_eng, "is_fraud"].sum())
precision_eng = caught_eng / f_eng.sum()
print(caught_raw, caught_eng, round(precision_eng, 2))`,
    },
    {
      id: "explain-anomaly",
      kind: "explain",
      title: "Unusual isn't guilty",
      prompt: "Explain how anomaly detection finds possible fraud, why it's evaluated as a shortlist, and why \"unusual\" isn't the same as \"fraudulent\".",
      ideas: [
        { label: "Models normal behaviour and flags what doesn't fit (no labels needed)", patterns: ["normal", "unusual", "doesn.?t fit", "outlier", "without labels", "no labels", "isolat"], nudge: "What does it learn if it has no fraud labels?" },
        { label: "Honest transactions can be unusual (school fees, rent)", patterns: ["honest", "legit", "school fees", "rent", "genuine", "innocent", "not (all|always) fraud"], nudge: "Can an honest payment look unusual?" },
        { label: "Humans review a shortlist; measure catches vs false alarms", patterns: ["shortlist", "review", "human", "false alarm", "precision", "caught", "analyst"], nudge: "What happens to the flagged transactions?" },
      ],
      modelAnswer:
        "Anomaly detection learns what normal transactions look like and flags the ones that don't fit, without needing fraud labels. Unusual isn't fraudulent — paying school fees or rent can look just as odd — so flags go to a shortlist that humans review, and the detector is judged by how many real frauds are on it versus how many honest customers get flagged.",
    },
  ],
};

export const fraudCapstone: Lab = {
  slug: "fraud-watch",
  number: "P2",
  title: "Mobile-Money Fraud Watch",
  subject: "Capstone",
  summary:
    "A mobile-money provider's fraud team can review 25 transactions a day. Build the detector that fills their queue — with no fraud labels to train on — and report what it catches and what it costs.",
  minutes: 60,
  kind: "project",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: TX,
  cover: { src: "/images/phone-surprise.webp", alt: "A woman looking at her phone in surprise" },
  skills: [
    "Design features that make fraud stand out",
    "Rank transactions by anomaly score for a fixed review budget",
    "Combine a model with a domain rule and report honestly",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a fraud operations team",
      body: [
        "The team reviews up to **25 transactions a day** by hand. Anything they don't review goes through. They have no reliable fraud labels to train a classifier on — fraud changes too fast.",
        "Your job: score every transaction so the 25 most suspicious go to the top of their queue. The `is_fraud` column exists in this illustrative dataset **only so you can evaluate** your detector at the end — you must not use it to build the scores.",
        "Deliverables: engineered features, an anomaly ranking, a combined model-plus-rule queue, and a short report of what it catches and what it costs.",
      ],
      image: { src: "/images/nairobi-night.jpg", alt: "Nairobi's city centre lit up at night" },
      keyIdea: "Unsupervised detection fills a fixed human review budget. Judge it by what's in the queue.",
    },
    {
      id: "features",
      kind: "code",
      title: "Engineer the signals",
      brief:
        "Add the features the fraud team says matter: `drain` (share of balance sent), `night` (22:00–04:59), `young` (account under 90 days) and `burst` (1 if more than 6 transactions in the last 24 hours). Build `X`: the standardised matrix of `drain`, `night`, `young`, `burst`, `new_recipient` and `amount_ksh`.",
      starterCode: LOAD_TX + `from sklearn.preprocessing import StandardScaler

`,
      checks: [
        { expr: 'set(["drain", "night", "young", "burst"]) <= set(t.columns)', label: "All four features added", failHint: "Create each as a new column of `t`." },
        { expr: 'np.array_equal(t["burst"].to_numpy(), (t["txns_last_24h"] > 6).astype(int).to_numpy())', label: "`burst` flags more than 6 recent transactions", failHint: '`(t["txns_last_24h"] > 6).astype(int)`' },
        { expr: "X.shape == (600, 6) and np.allclose(X.mean(axis=0), 0)", label: "`X` is the standardised 6-column matrix", failHint: "`StandardScaler().fit_transform(t[cols])`" },
      ],
      hints: ["Hours 22–23 and 0–4 count as night."],
      why: "Each feature encodes something a fraud analyst knows. The model can't invent this knowledge — you have to give it.",
      solution: LOAD_TX + `from sklearn.preprocessing import StandardScaler

` + ENGINEER + `t["burst"] = (t["txns_last_24h"] > 6).astype(int)
cols = ["drain", "night", "young", "burst", "new_recipient", "amount_ksh"]
X = StandardScaler().fit_transform(t[cols])
print(X.shape)`,
    },
    {
      id: "rank",
      kind: "code",
      title: "Rank by suspicion",
      brief:
        "Fit `IsolationForest(n_estimators=300, random_state=0)` on `X`. Store each transaction's anomaly `score` (use `-iso.score_samples(X)`, so **higher = more suspicious**) as a column, and build `queue`: the 25 highest-scoring transactions.",
      starterCode: LOAD_TX + `from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

` + ENGINEER + `t["burst"] = (t["txns_last_24h"] > 6).astype(int)
cols = ["drain", "night", "young", "burst", "new_recipient", "amount_ksh"]
X = StandardScaler().fit_transform(t[cols])

`,
      checks: [
        { expr: "np.allclose(t['score'], -iso.score_samples(X))", label: "`score` is the negated anomaly score", failHint: '`t["score"] = -iso.score_samples(X)`' },
        { expr: "len(queue) == 25 and queue['score'].min() >= t['score'].nlargest(25).min()", label: "`queue` holds the 25 most suspicious", failHint: '`t.nlargest(25, "score")`' },
      ],
      hints: ["`t.nlargest(25, \"score\")` sorts and slices in one go."],
      why: "A ranking fits the team's reality better than a yes/no flag: they review from the top down until the day's budget runs out.",
      solution: LOAD_TX + `from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

` + ENGINEER + `t["burst"] = (t["txns_last_24h"] > 6).astype(int)
cols = ["drain", "night", "young", "burst", "new_recipient", "amount_ksh"]
X = StandardScaler().fit_transform(t[cols])

iso = IsolationForest(n_estimators=300, random_state=0).fit(X)
t["score"] = -iso.score_samples(X)
queue = t.nlargest(25, "score")
print(queue[["txn_id", "hour", "amount_ksh", "drain", "score"]].head(10))`,
    },
    {
      id: "evaluate",
      kind: "code",
      title: "Open the envelope",
      brief:
        "Now — and only now — use `is_fraud` to evaluate. Compute `precision_at_25` (share of the queue that's fraud) and `recall_at_25` (share of all frauds that made the queue).",
      starterCode: LOAD_TX + `from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

` + ENGINEER + `t["burst"] = (t["txns_last_24h"] > 6).astype(int)
cols = ["drain", "night", "young", "burst", "new_recipient", "amount_ksh"]
X = StandardScaler().fit_transform(t[cols])
t["score"] = -IsolationForest(n_estimators=300, random_state=0).fit(X).score_samples(X)
queue = t.nlargest(25, "score")

`,
      checks: [
        { expr: 'abs(precision_at_25 - queue["is_fraud"].mean()) < 1e-9', label: "`precision_at_25` is the fraud share of the queue", failHint: '`queue["is_fraud"].mean()`' },
        { expr: 'abs(recall_at_25 - queue["is_fraud"].sum() / t["is_fraud"].sum()) < 1e-9', label: "`recall_at_25` is the share of frauds caught", failHint: "Frauds in the queue ÷ all frauds." },
      ],
      hints: ["\"@25\" means \"within the top 25\" — the standard way to report a ranked shortlist."],
      why: "Precision tells the team how much of their day is well spent; recall tells the business how much fraud still slips through.",
      solution: LOAD_TX + `from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

` + ENGINEER + `t["burst"] = (t["txns_last_24h"] > 6).astype(int)
cols = ["drain", "night", "young", "burst", "new_recipient", "amount_ksh"]
X = StandardScaler().fit_transform(t[cols])
t["score"] = -IsolationForest(n_estimators=300, random_state=0).fit(X).score_samples(X)
queue = t.nlargest(25, "score")

precision_at_25 = queue["is_fraud"].mean()
recall_at_25 = queue["is_fraud"].sum() / t["is_fraud"].sum()
print(round(precision_at_25, 2), round(recall_at_25, 2))`,
    },
    {
      id: "combine",
      kind: "code",
      challenge: true,
      title: "Model plus rule",
      brief:
        "The team also has a hard rule: any transaction that sends **over 80% of the balance at night** must be reviewed. Build the final `queue`: all rule hits first, then the highest-scoring remaining transactions until there are 25. Report `report = {\"caught\": ..., \"precision\": ..., \"recall\": ...}`.",
      starterCode: LOAD_TX + `from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

` + ENGINEER + `t["burst"] = (t["txns_last_24h"] > 6).astype(int)
cols = ["drain", "night", "young", "burst", "new_recipient", "amount_ksh"]
X = StandardScaler().fit_transform(t[cols])
t["score"] = -IsolationForest(n_estimators=300, random_state=0).fit(X).score_samples(X)

`,
      checks: [
        { expr: "len(queue) == 25 and queue['txn_id'].is_unique", label: "25 distinct transactions", failHint: "Combine rule hits and top scorers without duplicates, then cut to 25." },
        { expr: "set(t.loc[(t['drain'] > 0.8) & (t['night'] == 1), 'txn_id']) <= set(queue['txn_id']) or ((t['drain'] > 0.8) & (t['night'] == 1)).sum() > 25", label: "Every rule hit is in the queue", failHint: "Start the queue with `t[(t[\"drain\"] > 0.8) & (t[\"night\"] == 1)]`." },
        { expr: 'report["caught"] == int(queue["is_fraud"].sum()) and abs(report["recall"] - report["caught"] / t["is_fraud"].sum()) < 1e-9', label: "The report matches the queue", failHint: "caught = frauds in the queue; recall = caught ÷ all frauds; precision = caught ÷ 25." },
      ],
      hints: [
        '`rule = t[(t["drain"] > 0.8) & (t["night"] == 1)]`',
        '`rest = t[~t["txn_id"].isin(rule["txn_id"])].nlargest(25 - len(rule), "score")`, then `pd.concat([rule, rest])`.',
      ],
      why: "On this data the model alone already put all 14 frauds in the queue, so the rule adds no extra catches here. What it adds is a guarantee: the highest-risk pattern is always reviewed, even on a day the model misjudges — and rule hits are easy to explain to a customer. Rules encode known patterns; models catch the ones nobody wrote down.",
      solution: LOAD_TX + `from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

` + ENGINEER + `t["burst"] = (t["txns_last_24h"] > 6).astype(int)
cols = ["drain", "night", "young", "burst", "new_recipient", "amount_ksh"]
X = StandardScaler().fit_transform(t[cols])
t["score"] = -IsolationForest(n_estimators=300, random_state=0).fit(X).score_samples(X)

rule = t[(t["drain"] > 0.8) & (t["night"] == 1)]
rest = t[~t["txn_id"].isin(rule["txn_id"])].nlargest(25 - len(rule), "score")
queue = pd.concat([rule, rest]).head(25)

caught = int(queue["is_fraud"].sum())
report = {"caught": caught, "precision": caught / len(queue), "recall": caught / t["is_fraud"].sum()}
print(len(rule), "rule hits;", report)`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Report to the fraud team",
      prompt: "Write a short note to the fraud operations team: how the queue is built, what it caught in testing, what it costs them, and what they should watch out for.",
      ideas: [
        { label: "Explains the queue: anomaly score plus the hard rule", patterns: ["score", "anomal", "isolation", "rule", "rank", "queue"], nudge: "How is the queue built?" },
        { label: "Reports what it caught (recall/precision)", patterns: ["caught", "recall", "precision", "of the", "%", "out of"], nudge: "How well did it do?" },
        { label: "States the cost: honest customers in the queue", patterns: ["honest", "false alarm", "customer", "review time", "legit", "cost"], nudge: "What does it cost them?" },
        { label: "Cautions: illustrative data, fraud changes, monitor and retune", patterns: ["change", "adapt", "monitor", "retrain", "retune", "illustrative", "new pattern", "fairness", "bias"], nudge: "What might stop it working next month?" },
      ],
      modelAnswer:
        "Each day's queue starts with every transaction that sends over 80% of the balance at night, then fills to 25 with the highest anomaly scores from an Isolation Forest built on drain, night-time, account age, bursts, new recipients and amount. In testing on illustrative data it put all 14 known frauds in the queue, but about half the queue slots were honest customers who'll need a quick, respectful check. Fraudsters adapt, so the team should monitor what it catches, feed back confirmed cases, and retune the rule and features regularly — and check it isn't unfairly targeting particular groups of customers.",
    },
  ],
};

export const unsupervisedLabs: Lab[] = [kmeansLab, pcaLab, anomalyLab, fraudCapstone];
