import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const REVIEWS = { "reviews.csv": dataFile("reviews.csv") };

const LOAD = `import re
import numpy as np
import pandas as pd

df = pd.read_csv("reviews.csv")
`;

const SPLIT = `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv("reviews.csv")
X_train, X_test, y_train, y_test = train_test_split(
    df["text"], df["positive"], test_size=0.25, stratify=df["positive"], random_state=0
)
`;

const SK = (mod: string) => `__import__("sklearn.${mod}", fromlist=["x"])`;

const EMBED = `import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import TruncatedSVD

df = pd.read_csv("reviews.csv")
sentences = [s.strip() for t in df["text"] for s in t.replace("!", ".").split(".") if s.strip()]

# How often does each pair of words appear in the same sentence?
cv = CountVectorizer(binary=True)
S = cv.fit_transform(sentences)
co = (S.T @ S).toarray().astype(float)
np.fill_diagonal(co, 0)
vocab = list(cv.get_feature_names_out())

# Squeeze each word's co-occurrence row into 20 numbers: its embedding
E = TruncatedSVD(20, random_state=0).fit_transform(np.log1p(co))
E = E / (np.linalg.norm(E, axis=1, keepdims=True) + 1e-9)    # unit length
`;

const BIGRAMS = `import re
import numpy as np
import pandas as pd
from collections import Counter, defaultdict

df = pd.read_csv("reviews.csv")

def tokenize(text):
    return re.findall(r"[a-z]+|[.!]", text.lower())
`;

const FAQ = `FAQ = [
    "How long does delivery take? Nairobi orders arrive in one to two days; orders to other towns take three to five days.",
    "If your seeds fail to germinate within 14 days, bring the packet and receipt to any agent for a free replacement.",
    "To reset your app password, tap Forgot PIN on the login screen and enter the code sent by SMS.",
    "Prices are reviewed every month and published in the app under Market Prices.",
    "Agents are available Monday to Saturday, 8am to 6pm. Call 0800 000 000 to report a rude or unhelpful agent.",
    "Orders above 5,000 KSh qualify for free delivery.",
    "You can pay with M-Pesa, or in cash when your order arrives.",
    "If the app keeps logging you out, update it to the latest version from the Play Store.",
]
`;

export const textDataLab: Lab = {
  slug: "text-data",
  number: "30",
  title: "Text as Data",
  subject: "Tokens and vocabularies",
  summary:
    "Models only understand numbers. Take 400 real-sounding customer reviews in English and Swahili, break them into tokens, and count what people talk about.",
  minutes: 35,
  kind: "lab",
  packages: ["numpy", "pandas"],
  files: REVIEWS,
  skills: [
    "Explain tokenisation and vocabularies",
    "Clean and tokenise text with regular expressions",
    "Count word frequencies across a corpus",
  ],
  steps: [
    {
      id: "nlp",
      kind: "concept",
      title: "Natural language processing",
      body: [
        "**Natural language processing (NLP)** is getting computers to work with human language: sorting complaints, translating Swahili, answering questions, powering chatbots.",
        "Text is messy — capitals, punctuation, spelling, mixed languages — and models need numbers. The first step is always to split text into **tokens** (pieces: words, parts of words, or characters) and to build a **vocabulary**, the set of distinct tokens.",
        "A collection of texts is called a **corpus**. Yours: 400 illustrative customer reviews of an agri-supplies company, mixing English and Swahili, each labelled positive or not.",
      ],
      code: `import re

text = "The delivery was LATE! Mbegu hazikumea."
print(text.lower())
print(re.findall(r"[a-z']+", text.lower()))
# ['the', 'delivery', 'was', 'late', 'mbegu', 'hazikumea']`,
      keyIdea: "NLP starts by turning text into tokens and a vocabulary — the bridge from words to numbers.",
    },
    {
      id: "tokenizers",
      kind: "experiment",
      title: "Three ways to cut text",
      prompt: "Type a sentence — try some Swahili, a long word like \"hazikumea\", or a typo — and switch between character, word and subword tokens.",
      widget: "tokenizer-explorer",
      observe:
        "Characters give a tiny vocabulary but very long sequences. Words give short sequences but a huge vocabulary, and any unseen word is simply unknown. **Subwords** sit in between: common words stay whole, rare ones split into familiar pieces. That's what LLMs use — and why languages with less training text, like Swahili, often get chopped into more tokens.",
    },
    {
      id: "predict-count",
      kind: "predict",
      title: "Most common token",
      prompt: "What does this print?",
      code: `from collections import Counter
words = "the app is good but the price is high".split()
print(Counter(words).most_common(2))`,
      options: ["[('the', 2), ('is', 2)]", "[('the', 2), ('app', 1)]", "[('price', 1), ('high', 1)]", "[('is', 2), ('the', 2)]"],
      answer: 0,
      explanation: "`the` and `is` each appear twice. On ties, `most_common` keeps the order words were first seen, so `the` comes first. In real corpora the top words are nearly always little \"stop words\" like these.",
    },
    {
      id: "tokenize",
      kind: "code",
      title: "Write a tokeniser",
      brief: "Write `tokenize(text)` that lowercases the text and returns its word tokens using `re.findall(r\"[a-z']+\", ...)`. Then add a `tokens` column to `df` with each review's tokens, and a `n_tokens` column with how many there are.",
      starterCode: LOAD + `
def tokenize(text):
    pass

`,
      checks: [
        { expr: "tokenize('The App is FAST, asante!') == ['the', 'app', 'is', 'fast', 'asante']", label: "Lowercases and drops punctuation", failHint: "`return re.findall(r\"[a-z']+\", text.lower())`" },
        { expr: "'tokens' in df and df['tokens'].iloc[0] == tokenize(df['text'].iloc[0])", label: "`tokens` column holds each review's tokens", failHint: "`df[\"tokens\"] = df[\"text\"].apply(tokenize)`" },
        { expr: "'n_tokens' in df and (df['n_tokens'] == df['tokens'].str.len()).all()", label: "`n_tokens` counts them", failHint: "`df[\"tokens\"].str.len()` gives each list's length." },
      ],
      hints: ["`.apply(tokenize)` runs your function on every review."],
      why: "A dozen characters of regex turned 400 reviews into lists of clean tokens. Every NLP pipeline — from a spam filter to an LLM — begins with a tokeniser.",
      solution: LOAD + `
def tokenize(text):
    return re.findall(r"[a-z']+", text.lower())

df["tokens"] = df["text"].apply(tokenize)
df["n_tokens"] = df["tokens"].str.len()
print(df[["text", "n_tokens"]].head())
print(df["n_tokens"].describe())`,
    },
    {
      id: "vocab",
      kind: "code",
      title: "Build the vocabulary",
      brief: "Count every token across all reviews into a `Counter` called `word_counts`. Store the vocabulary size in `vocab_size` and the total number of tokens in `total_tokens`.",
      starterCode: LOAD + `from collections import Counter

def tokenize(text):
    return re.findall(r"[a-z']+", text.lower())

df["tokens"] = df["text"].apply(tokenize)

`,
      checks: [
        { expr: "isinstance(word_counts, dict) and word_counts['the'] == sum(t.count('the') for t in df['tokens'])", label: "`word_counts` counts every token", failHint: "`Counter(w for tokens in df[\"tokens\"] for w in tokens)`" },
        { expr: "vocab_size == len(set(w for t in df['tokens'] for w in t))", label: "`vocab_size` is the number of distinct tokens", failHint: "`len(word_counts)`" },
        { expr: "total_tokens == df['tokens'].str.len().sum()", label: "`total_tokens` is every token counted", failHint: "`sum(word_counts.values())`" },
      ],
      hints: ["A `Counter` is a dict: its keys are the vocabulary and its values the counts."],
      why: "About a hundred distinct words across four thousand tokens: these reviews reuse the same phrases constantly. Real corpora have vocabularies in the hundreds of thousands — one reason LLMs switch to subwords.",
      solution: LOAD + `from collections import Counter

def tokenize(text):
    return re.findall(r"[a-z']+", text.lower())

df["tokens"] = df["text"].apply(tokenize)

word_counts = Counter(w for tokens in df["tokens"] for w in tokens)
vocab_size = len(word_counts)
total_tokens = sum(word_counts.values())
print(vocab_size, total_tokens)
print(word_counts.most_common(10))`,
    },
    {
      id: "content-words",
      kind: "code",
      challenge: true,
      title: "What do customers talk about?",
      brief: "The most common tokens are filler. Remove the `STOP` words, then store the 5 most common remaining words as a list of strings, `top_content`, and the most common word among **not-positive** reviews only as `top_negative_word`.",
      starterCode: LOAD + `from collections import Counter

STOP = {"the", "a", "is", "was", "were", "to", "i", "me", "but", "on", "in", "them", "very", "sana", "ni"}

def tokenize(text):
    return re.findall(r"[a-z']+", text.lower())

df["tokens"] = df["text"].apply(tokenize)

`,
      checks: [
        {
          expr: "top_content == [w for w, _ in __import__('collections').Counter(w for t in df['tokens'] for w in t if w not in STOP).most_common(5)]",
          label: "`top_content`: the 5 most common non-stop words",
          failHint: "Count only tokens `if w not in STOP`, then take `[w for w, _ in counts.most_common(5)]`.",
        },
        {
          expr: "top_negative_word == __import__('collections').Counter(w for t in df.loc[df['positive'] == 0, 'tokens'] for w in t if w not in STOP).most_common(1)[0][0]",
          label: "`top_negative_word` from not-positive reviews",
          failHint: "Filter rows with `df[\"positive\"] == 0` before counting.",
        },
      ],
      hints: ["`df.loc[df[\"positive\"] == 0, \"tokens\"]` gives the token lists of the not-positive reviews."],
      why: "Once the filler is gone, the topics jump out — price, agents, the app, seeds, delivery — and in unhappy reviews one small word dominates: **not**. Remember it: it'll cause trouble when a model ignores word order.",
      solution: LOAD + `from collections import Counter

STOP = {"the", "a", "is", "was", "were", "to", "i", "me", "but", "on", "in", "them", "very", "sana", "ni"}

def tokenize(text):
    return re.findall(r"[a-z']+", text.lower())

df["tokens"] = df["text"].apply(tokenize)

counts = Counter(w for t in df["tokens"] for w in t if w not in STOP)
top_content = [w for w, _ in counts.most_common(5)]
neg = Counter(w for t in df.loc[df["positive"] == 0, "tokens"] for w in t if w not in STOP)
top_negative_word = neg.most_common(1)[0][0]
print(top_content, top_negative_word)`,
    },
    {
      id: "explain-text",
      kind: "explain",
      title: "From words to data",
      prompt: "Explain what tokenisation is, why it's needed, and the trade-off between word and subword tokens.",
      ideas: [
        { label: "Splitting text into pieces (tokens)", patterns: ["split", "pieces", "break", "cut", "token"], nudge: "What does a tokeniser do to text?" },
        { label: "Models need numbers / a vocabulary", patterns: ["number", "vocabular", "numeric", "id"], nudge: "Why can't a model use raw text?" },
        { label: "Words: unknown/rare words and a huge vocabulary; subwords split them into known pieces", patterns: ["unknown", "rare", "unseen", "huge vocab", "large vocab", "subword", "pieces", "parts of words"], nudge: "What goes wrong with whole-word tokens, and how do subwords help?" },
      ],
      modelAnswer:
        "Tokenisation splits text into pieces — words, subwords or characters — and builds a vocabulary so each piece can be turned into numbers, which is all a model can work with. Whole words give a huge vocabulary and can't handle unseen or rare words; subword tokens keep common words whole and break rare ones into known pieces, which is why LLMs use them.",
    },
  ],
};

export const bagOfWordsLab: Lab = {
  slug: "bag-of-words",
  number: "31",
  title: "Bag of Words & TF-IDF",
  subject: "Counting words",
  summary:
    "Turn every review into a row of numbers by counting its words — then weight the counts so the words that actually distinguish one text from another stand out.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: REVIEWS,
  skills: [
    "Vectorise text with CountVectorizer",
    "Compute and interpret TF-IDF",
    "Find the words that distinguish two groups of texts",
  ],
  steps: [
    {
      id: "bow",
      kind: "concept",
      title: "A bag of words",
      body: [
        "The simplest way to turn text into numbers: give each vocabulary word a column, and for each document count how often each word appears. That's a **bag of words** — word order is thrown away, as if the words were shaken in a bag.",
        "The result is a **document-term matrix**: one row per document, one column per word. It's mostly zeros (each review uses a few of the words), so scikit-learn stores it as a **sparse matrix**.",
        "`CountVectorizer` does the tokenising, vocabulary and counting in one step. By default it lowercases and ignores one-letter tokens like \"a\" and \"I\".",
      ],
      code: `from sklearn.feature_extraction.text import CountVectorizer

docs = ["maize is good", "maize is not good", "beans are good"]
cv = CountVectorizer()
X = cv.fit_transform(docs)
print(cv.get_feature_names_out())
print(X.toarray())`,
      keyIdea: "Bag of words: one column per vocabulary word, one row per document, counts inside. Order is lost.",
    },
    {
      id: "tfidf-widget",
      kind: "experiment",
      title: "Which words matter?",
      prompt: "Three short documents. Click a word to compare its raw count with its TF-IDF weight in each document. Try \"the\" and then a rare word.",
      widget: "tfidf-explorer",
      observe:
        "A word that appears in every document (like \"the\") gets the lowest inverse document frequency, so its TF-IDF weight is small even when it's frequent. A word found in just one document gets a high weight there: it's what makes that document different.",
    },
    {
      id: "predict-order",
      kind: "predict",
      title: "Does order matter?",
      prompt: "Two reviews with the same words in a different order. Are their bag-of-words rows equal?",
      code: `from sklearn.feature_extraction.text import CountVectorizer
X = CountVectorizer().fit_transform(["fast but not cheap", "cheap but not fast"]).toarray()
print((X[0] == X[1]).all())`,
      options: ["True", "False", "It raises an error", "Only if lowercased"],
      answer: 0,
      explanation: "Same words, same counts: the rows are identical, even though the meanings are opposite. That's the price of a bag of words — and why later you'll add word pairs (bigrams) and, eventually, attention.",
    },
    {
      id: "tfidf",
      kind: "concept",
      title: "TF-IDF",
      body: [
        "Raw counts favour common words. **TF-IDF** reweights them: **term frequency** (how often a word is in this document) × **inverse document frequency** (how rare the word is across all documents).",
        "scikit-learn's version: `idf = ln((1 + n) / (1 + df)) + 1`, where `n` is the number of documents and `df` how many contain the word. Each row is then scaled to length 1, so long and short reviews compare fairly.",
        "TF-IDF powered search engines for decades and is still a strong, fast baseline for classifying and searching text.",
      ],
      code: `import numpy as np
n, df_the, df_germinate = 400, 400, 6              # "germinate" is in just 6 reviews
print(np.log((1 + n) / (1 + df_the)) + 1)         # 1.0  — in every review
print(np.log((1 + n) / (1 + df_germinate)) + 1)   # ≈ 5.05 — rare, informative`,
      keyIdea: "TF-IDF = how often here × how rare everywhere. Common words fade; distinctive words stand out.",
    },
    {
      id: "vectorize",
      kind: "code",
      title: "Vectorise the reviews",
      brief: "Fit a `CountVectorizer` on the review texts to get `X`. Store its shape as `n_docs, n_words`, and the total number of times the word \"not\" appears across all reviews as `not_count`.",
      starterCode: `import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer

df = pd.read_csv("reviews.csv")

`,
      checks: [
        { expr: "(n_docs, n_words) == X.shape and n_docs == 400", label: "`X` has one row per review", failHint: "`cv = CountVectorizer()`, `X = cv.fit_transform(df[\"text\"])`, then `n_docs, n_words = X.shape`." },
        { expr: `n_words == len(${SK("feature_extraction.text")}.CountVectorizer().fit(df['text']).vocabulary_)`, label: "One column per vocabulary word", failHint: "Use the default settings of `CountVectorizer`." },
        { expr: `not_count == ${SK("feature_extraction.text")}.CountVectorizer().fit_transform(df['text'])[:, ${SK("feature_extraction.text")}.CountVectorizer().fit(df['text']).vocabulary_['not']].sum()`, label: "`not_count` is correct", failHint: "`cv.vocabulary_[\"not\"]` is its column index; sum that column: `X[:, i].sum()`." },
      ],
      hints: ["`cv.vocabulary_` maps each word to its column number."],
      why: "Four hundred reviews became a 400 × 99 matrix — numbers a model can learn from. With a real corpus the columns run into tens of thousands, which is why the sparse format matters.",
      solution: `import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer

df = pd.read_csv("reviews.csv")

cv = CountVectorizer()
X = cv.fit_transform(df["text"])
n_docs, n_words = X.shape
not_count = X[:, cv.vocabulary_["not"]].sum()
print(n_docs, n_words, not_count)`,
    },
    {
      id: "idf-hand",
      kind: "code",
      title: "Compute IDF by hand",
      brief: "For the four `docs`, compute scikit-learn's IDF for every vocabulary word yourself (as an array `idf`, in the same column order as `counts`), using `idf = ln((1 + n) / (1 + df)) + 1`.",
      starterCode: `import numpy as np
from sklearn.feature_extraction.text import CountVectorizer

docs = [
    "the maize harvest was good",
    "the bean harvest was poor",
    "the price of maize is high",
    "the agent was helpful",
]
cv = CountVectorizer()
counts = cv.fit_transform(docs).toarray()
words = cv.get_feature_names_out()

n = len(docs)
doc_freq = None     # how many documents contain each word
idf = None

print(dict(zip(words, np.round(idf, 2))) if idf is not None else "")
`,
      checks: [
        { expr: "np.array_equal(doc_freq, (counts > 0).sum(axis=0))", label: "`doc_freq` counts documents per word", failHint: "`(counts > 0).sum(axis=0)`" },
        { expr: `np.allclose(idf, ${SK("feature_extraction.text")}.TfidfVectorizer().fit(docs).idf_)`, label: "`idf` matches scikit-learn", failHint: "`np.log((1 + n) / (1 + doc_freq)) + 1`" },
      ],
      hints: ["`counts > 0` is True wherever a document contains a word."],
      why: "\"the\" is in all four documents, so its IDF is exactly 1 — the minimum. Words in only one document get the highest IDF. You've rebuilt the heart of classic search.",
      solution: `import numpy as np
from sklearn.feature_extraction.text import CountVectorizer

docs = [
    "the maize harvest was good",
    "the bean harvest was poor",
    "the price of maize is high",
    "the agent was helpful",
]
cv = CountVectorizer()
counts = cv.fit_transform(docs).toarray()
words = cv.get_feature_names_out()

n = len(docs)
doc_freq = (counts > 0).sum(axis=0)
idf = np.log((1 + n) / (1 + doc_freq)) + 1

print(dict(zip(words, np.round(idf, 2))))`,
    },
    {
      id: "distinctive",
      kind: "code",
      challenge: true,
      title: "What separates happy from unhappy?",
      brief: "Fit a `TfidfVectorizer` on the reviews. For every word, compute its average TF-IDF weight in positive reviews minus its average in not-positive reviews. Store the 5 words with the **most negative** difference as a list, `negative_words`, most negative first.",
      starterCode: `import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

df = pd.read_csv("reviews.csv")

`,
      checks: [
        {
          expr: `negative_words == (lambda tv: (lambda T: list(pd.Series(np.asarray(T[df['positive'].values == 1].mean(axis=0)).ravel() - np.asarray(T[df['positive'].values == 0].mean(axis=0)).ravel(), tv.get_feature_names_out()).sort_values().index[:5]))(tv.fit_transform(df['text'])))(${SK("feature_extraction.text")}.TfidfVectorizer())`,
          label: "The 5 most negative-leaning words, in order",
          failHint: "Average the rows of `T` for each group, subtract, put it in a Series indexed by `tv.get_feature_names_out()`, and `.sort_values()`.",
        },
      ],
      hints: [
        "`T[mask].mean(axis=0)` averages the rows selected by a boolean mask; wrap it in `np.asarray(...).ravel()` to get a flat array.",
        "Use `df[\"positive\"].values == 1` as the mask.",
      ],
      why: "\"not\", \"again\" (as in *never again*), \"keeps\" (as in *keeps crashing*), \"terrible\"... With no model at all, TF-IDF already surfaces the language of complaints. That's the first thing to show a product team.",
      solution: `import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

df = pd.read_csv("reviews.csv")

tv = TfidfVectorizer()
T = tv.fit_transform(df["text"])
pos = np.asarray(T[df["positive"].values == 1].mean(axis=0)).ravel()
neg = np.asarray(T[df["positive"].values == 0].mean(axis=0)).ravel()
diff = pd.Series(pos - neg, index=tv.get_feature_names_out()).sort_values()
negative_words = list(diff.index[:5])
print(negative_words)
print(list(diff.index[-5:]))`,
    },
    {
      id: "explain-bow",
      kind: "explain",
      title: "Counting meaning",
      prompt: "Explain how a bag of words turns text into numbers, what TF-IDF changes, and one thing a bag of words can't capture.",
      ideas: [
        { label: "One column per word; counts per document", patterns: ["count", "column", "each word", "matrix", "vocabulary"], nudge: "What does each column and each number mean?" },
        { label: "TF-IDF downweights common words / upweights rare, distinctive ones", patterns: ["rare", "common", "distinct", "every document", "idf", "inverse", "downweight", "weigh"], nudge: "What does IDF do to a word like \"the\"?" },
        { label: "Word order / context is lost", patterns: ["order", "context", "not fast", "sequence", "negation", "meaning"], nudge: "What happens to \"fast but not cheap\" vs \"cheap but not fast\"?" },
      ],
      modelAnswer:
        "A bag of words gives each vocabulary word a column and counts how often it appears in each document, making a matrix of numbers. TF-IDF multiplies those counts by how rare each word is across documents, so common words like \"the\" fade and distinctive ones stand out. But it throws away word order and context — \"fast but not cheap\" and \"cheap but not fast\" become identical rows.",
    },
  ],
};

export const sentimentLab: Lab = {
  slug: "sentiment",
  number: "32",
  title: "Sentiment Classification",
  subject: "Classifying text",
  summary:
    "Train a model that reads a review and says whether the customer is happy — then open it up, see the words it relies on, and find where word-counting breaks down.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: REVIEWS,
  skills: [
    "Build a text-classification pipeline",
    "Interpret a linear text model's word weights",
    "Use n-grams to capture some word order",
  ],
  steps: [
    {
      id: "pipeline",
      kind: "concept",
      title: "Text in, label out",
      body: [
        "**Sentiment analysis** classifies text by feeling: positive or negative, or a star rating. Companies use it to sort thousands of messages a day and spot problems early.",
        "The recipe is the one you already know: turn text into features (TF-IDF), then train a classifier (logistic regression). A **pipeline** bundles the two so the vectoriser learns its vocabulary only from the training data — no leakage.",
        "A linear model on word counts is interpretable: each word gets a weight, and a review's score is the sum of its words' weights.",
      ],
      code: `from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

model = make_pipeline(TfidfVectorizer(), LogisticRegression())
model.fit(X_train, y_train)
model.predict(["The agent was very helpful. Asante!"])`,
      keyIdea: "Vectoriser + classifier in one pipeline. For a linear model, the verdict is a sum of word weights.",
    },
    {
      id: "weights",
      kind: "experiment",
      title: "Inside a real sentiment model",
      prompt: "Type a review and watch each word's weight add up to a verdict. Try \"the app never crashes\", \"the app keeps crashing\" and \"the delivery was not fast\".",
      widget: "word-weights",
      observe:
        "The model is just adding up word weights. \"not\" carries a strong negative weight wherever it appears, and \"crashes\" is *positive* — because in these reviews it almost always comes after \"never\". The model learned correlations, not meaning.",
    },
    {
      id: "predict-sum",
      kind: "predict",
      title: "Add up the words",
      prompt: "A linear sentiment model has bias 0 and these word weights. What's the review's score?",
      code: `weights = {"agent": 0.1, "was": -0.2, "not": -2.6, "helpful": 0.9}
review = "agent was not helpful".split()
print(round(sum(weights[w] for w in review), 1))`,
      options: ["-1.8", "0.8", "-2.6", "1.0"],
      answer: 0,
      explanation: "0.1 − 0.2 − 2.6 + 0.9 = −1.8. A negative score means \"negative\": \"helpful\" pushes up, but \"not\" pushes down harder. Here that happens to be right — but the model has no idea \"not\" is attached to \"helpful\".",
    },
    {
      id: "train",
      kind: "code",
      title: "Train a sentiment model",
      brief: "Build a pipeline of `TfidfVectorizer()` and `LogisticRegression()` called `model`, fit it on the training reviews, and store its test accuracy in `acc`.",
      starterCode: SPLIT + `from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

`,
      checks: [
        { expr: "type(model).__name__ == 'Pipeline'", label: "`model` is a pipeline", failHint: "`model = make_pipeline(TfidfVectorizer(), LogisticRegression())`" },
        { expr: "abs(acc - model.score(X_test, y_test)) < 1e-9 and acc > 0.85", label: "`acc` is the test accuracy", failHint: "`model.fit(X_train, y_train)`, then `acc = model.score(X_test, y_test)`." },
      ],
      hints: ["The pipeline takes raw text — no need to vectorise first."],
      why: "Around 90% on held-out reviews from a few lines of code. Some of these reviews are genuinely mixed, and about one in twenty labels is disputed, so a perfect score isn't possible — or trustworthy.",
      solution: SPLIT + `from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

model = make_pipeline(TfidfVectorizer(), LogisticRegression())
model.fit(X_train, y_train)
acc = model.score(X_test, y_test)
print(round(acc, 3))`,
    },
    {
      id: "inspect",
      kind: "code",
      title: "Open the model up",
      brief: "From the fitted pipeline, build a pandas Series `weights` of the logistic-regression coefficients indexed by word, sorted from most negative to most positive. Store the single most negative word in `most_negative` and the most positive in `most_positive`.",
      starterCode: SPLIT + `from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

model = make_pipeline(TfidfVectorizer(), LogisticRegression()).fit(X_train, y_train)
vectorizer, classifier = model[0], model[1]

`,
      checks: [
        { expr: "isinstance(weights, pd.Series) and len(weights) == len(vectorizer.vocabulary_) and weights.is_monotonic_increasing", label: "`weights`: one sorted weight per word", failHint: "`pd.Series(classifier.coef_[0], index=vectorizer.get_feature_names_out()).sort_values()`" },
        { expr: "most_negative == weights.index[0] and most_positive == weights.index[-1]", label: "Most negative and most positive words", failHint: "The first and last entries of the sorted Series' index." },
      ],
      hints: ["`classifier.coef_[0]` holds one weight per vocabulary column."],
      why: "\"not\" is the strongest negative signal, and gratitude — \"asante\" — the strongest positive one. Also look near the top: \"crashes\" has a positive weight. That's a model learning a shortcut from \"never crashes\"; on new data it could backfire.",
      solution: SPLIT + `from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

model = make_pipeline(TfidfVectorizer(), LogisticRegression()).fit(X_train, y_train)
vectorizer, classifier = model[0], model[1]

weights = pd.Series(classifier.coef_[0], index=vectorizer.get_feature_names_out()).sort_values()
most_negative = weights.index[0]
most_positive = weights.index[-1]
print(weights.head(8))
print(weights.tail(8))`,
    },
    {
      id: "ngrams",
      kind: "code",
      challenge: true,
      title: "Give it some word order",
      brief: "Compare 5-fold cross-validated accuracy on **all** the reviews for TF-IDF with single words (`cv_uni`) and with words plus word pairs, `ngram_range=(1, 2)` (`cv_bi`) — each followed by `LogisticRegression()`. Then store the bigram model's probability that `\"the delivery was not fast\"` is positive in `p_not_fast`.",
      starterCode: `import numpy as np
import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

df = pd.read_csv("reviews.csv")

`,
      checks: [
        {
          expr: `abs(cv_uni - ${SK("model_selection")}.cross_val_score(${SK("pipeline")}.make_pipeline(${SK("feature_extraction.text")}.TfidfVectorizer(), ${SK("linear_model")}.LogisticRegression()), df['text'], df['positive'], cv=5).mean()) < 1e-9`,
          label: "`cv_uni` from single words",
          failHint: "`cross_val_score(make_pipeline(TfidfVectorizer(), LogisticRegression()), df[\"text\"], df[\"positive\"], cv=5).mean()`",
        },
        { expr: "cv_bi > cv_uni", label: "Word pairs help", failHint: "Pass `ngram_range=(1, 2)` to the second `TfidfVectorizer`." },
        { expr: "0 < p_not_fast < 0.5", label: "`p_not_fast` from the bigram model", failHint: "Fit the bigram pipeline on all reviews, then `.predict_proba([\"the delivery was not fast\"])[0, 1]`." },
      ],
      hints: ["`.predict_proba([...])[0, 1]` is the probability of the positive class for the first text."],
      why: "Bigrams like \"not fast\" and \"never crashes\" become features of their own, recovering a little word order — a small but real gain. To truly understand context, though, models need something better than counting: embeddings and attention.",
      solution: `import numpy as np
import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

df = pd.read_csv("reviews.csv")

uni = make_pipeline(TfidfVectorizer(), LogisticRegression())
bi = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LogisticRegression())
cv_uni = cross_val_score(uni, df["text"], df["positive"], cv=5).mean()
cv_bi = cross_val_score(bi, df["text"], df["positive"], cv=5).mean()

bi.fit(df["text"], df["positive"])
p_not_fast = bi.predict_proba(["the delivery was not fast"])[0, 1]
print(round(cv_uni, 3), round(cv_bi, 3), round(p_not_fast, 3))`,
    },
    {
      id: "explain-sentiment",
      kind: "explain",
      title: "What the model really learned",
      prompt: "Explain how your sentiment model decides, and give one way it can be fooled.",
      ideas: [
        { label: "Adds up learned word weights (TF-IDF + logistic regression)", patterns: ["weight", "sum", "add", "coefficient", "logistic", "tf.?idf"], nudge: "How does a review's score get computed?" },
        { label: "Learns correlations, not meaning", patterns: ["correlat", "shortcut", "not meaning", "doesn.?t understand", "pattern"], nudge: "Does it understand the words?" },
        { label: "A concrete failure: negation, word order, sarcasm, or new words", patterns: ["not", "negat", "order", "sarcas", "crashes", "new word", "unseen", "mixed"], nudge: "Give an example of a review it would get wrong." },
      ],
      modelAnswer:
        "The model turns a review into TF-IDF word weights and a logistic regression adds up a learned weight for each word to get a probability of positive. It learns correlations, not meaning: because it ignores word order, \"not\" pushes every review down wherever it appears, and \"crashes\" counts as positive because it usually follows \"never\" — so \"the app crashes\" can fool it.",
    },
  ],
};

export const embeddingsLab: Lab = {
  slug: "embeddings",
  number: "33",
  title: "Word Embeddings",
  subject: "Words as vectors",
  summary:
    "Give every word a list of numbers so that words used alike sit close together. Build embeddings from scratch from the reviews — and discover what they capture and what they miss.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn", "matplotlib"],
  files: REVIEWS,
  skills: [
    "Explain embeddings and cosine similarity",
    "Build word vectors from co-occurrence counts",
    "Find nearest neighbours in embedding space",
  ],
  steps: [
    {
      id: "onehot",
      kind: "concept",
      title: "Beyond one column per word",
      body: [
        "In a bag of words, every word is its own column: \"maize\" and \"mahindi\" are as unrelated as \"maize\" and \"price\". The model can't share what it learns between similar words.",
        "An **embedding** gives each word a dense vector — say 20 to 1,000 numbers — arranged so that words with similar meanings or uses point in similar directions.",
        "The key idea, from linguist J. R. Firth: *\"You shall know a word by the company it keeps.\"* Words that appear in similar contexts get similar vectors. Word2Vec, GloVe and every LLM's first layer are built on this.",
      ],
      keyIdea: "Embeddings are learned vectors where similar usage means nearby points.",
    },
    {
      id: "map",
      kind: "experiment",
      title: "A map of words",
      prompt: "Click different words and look at their nearest neighbours. Compare \"maize\", \"pesa\" and \"mvua\".",
      widget: "embedding-map",
      observe:
        "Food crops cluster, money words cluster, weather words cluster — across English and Swahili, because they're used in the same kinds of sentences. Similarity becomes distance, so a model that learns something about \"maize\" gets a head start on \"mahindi\".",
    },
    {
      id: "predict-cos",
      kind: "predict",
      title: "Cosine similarity",
      prompt: "Two one-hot word vectors. What's their cosine similarity?",
      code: `import numpy as np
maize = np.array([1, 0, 0])
mahindi = np.array([0, 1, 0])
print(maize @ mahindi / (np.linalg.norm(maize) * np.linalg.norm(mahindi)))`,
      options: ["0.0", "1.0", "0.5", "-1.0"],
      answer: 0,
      explanation: "One-hot vectors never overlap, so every pair of different words has similarity 0 — even translations of each other. That's exactly what embeddings fix.",
    },
    {
      id: "cosine",
      kind: "code",
      title: "Measure similarity",
      brief: "Write `cosine(a, b)`: the dot product of two vectors divided by the product of their lengths. It should return 1 for vectors pointing the same way, 0 for perpendicular ones and −1 for opposite ones.",
      starterCode: `import numpy as np

def cosine(a, b):
    pass

print(cosine(np.array([1.0, 2.0]), np.array([2.0, 4.0])))
`,
      checks: [
        { expr: "abs(cosine(np.array([1.0, 2.0]), np.array([2.0, 4.0])) - 1) < 1e-9", label: "Same direction → 1", failHint: "`a @ b / (np.linalg.norm(a) * np.linalg.norm(b))`" },
        { expr: "abs(cosine(np.array([1.0, 0.0]), np.array([0.0, 3.0]))) < 1e-9 and abs(cosine(np.array([1.0, 1.0]), np.array([-2.0, -2.0])) + 1) < 1e-9", label: "Perpendicular → 0, opposite → −1", failHint: "Divide by both lengths, not just one." },
      ],
      hints: ["`np.linalg.norm(v)` is a vector's length."],
      why: "Cosine similarity ignores length and compares direction — so a word used 800 times and one used 8 times can still be recognised as similar. Search engines and RAG systems rank by it.",
      solution: `import numpy as np

def cosine(a, b):
    return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))

print(cosine(np.array([1.0, 2.0]), np.array([2.0, 4.0])))`,
    },
    {
      id: "neighbours",
      kind: "code",
      title: "Build embeddings from the reviews",
      brief: "The code builds a 20-number embedding for every word from which words share sentences (rows of `E` are unit length, in `vocab` order). Write `nearest(word, n)` that returns the `n` most similar **other** words by cosine similarity, most similar first. Then store `nearest(\"rude\", 3)` as `rude_neighbours`.",
      starterCode: EMBED + `
def nearest(word, n=3):
    pass

rude_neighbours = nearest("rude", 3)
print(rude_neighbours)
`,
      checks: [
        { expr: "nearest('late', 3) == [vocab[j] for j in np.argsort(-(E @ E[vocab.index('late')])) if vocab[j] != 'late'][:3]", label: "`nearest` ranks by cosine similarity", failHint: "Rows are unit length, so `E @ E[i]` gives every word's cosine similarity to word `i`. Sort descending and skip the word itself." },
        { expr: "rude_neighbours == nearest('rude', 3) and 'rude' not in rude_neighbours", label: "`rude_neighbours` found", failHint: "Leave out the word itself — it's always its own nearest neighbour." },
      ],
      hints: ["`np.argsort(-scores)` gives indices from highest score to lowest."],
      why: "Look at the neighbours of \"rude\": patient, polite, careless. They're close because they fill the same slot — \"the agent was ___\". Embeddings learned from context capture *what role* a word plays, which is why opposites often land together. Telling good from bad needs labels, like your sentiment model.",
      solution: EMBED + `
def nearest(word, n=3):
    i = vocab.index(word)
    scores = E @ E[i]
    order = np.argsort(-scores)
    return [vocab[j] for j in order if j != i][:n]

rude_neighbours = nearest("rude", 3)
print(rude_neighbours)
print(nearest("late", 3), nearest("ghali", 3))`,
    },
    {
      id: "plot",
      kind: "code",
      challenge: true,
      title: "Draw the map",
      brief: "Project the embeddings of the `words` below to 2D with `PCA(2)` and draw a scatter plot with each point labelled by its word (`plt.annotate`), plus a title.",
      starterCode: EMBED + `import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

words = ["agent", "rude", "polite", "patient", "helpful", "app", "crashes", "slow", "fast", "seeds", "germinated", "price", "ghali", "fair"]

`,
      checks: [
        { expr: "any(c['points'] >= len(words) and c['title'] for c in _charts)", label: "A titled scatter plot of all the words", failHint: "`xy = PCA(2).fit_transform(E[[vocab.index(w) for w in words]])`, then `plt.scatter(xy[:, 0], xy[:, 1])` and a title." },
        { expr: "'annotate' in _source or 'plt.text' in _source", label: "Points labelled with their words", failHint: "`for w, (x, y) in zip(words, xy): plt.annotate(w, (x, y))`" },
      ],
      hints: ["Select the rows first: `E[[vocab.index(w) for w in words]]`."],
      why: "Twenty dimensions squeezed into two lose detail, but groups still show — by the *role* words play: the words describing agents (rude, patient, polite, helpful) form one cluster, and the things people review (agent, price, app, seeds) another. Real embeddings are learned from billions of sentences and capture far subtler relationships — the same idea, at scale.",
      solution: EMBED + `import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

words = ["agent", "rude", "polite", "patient", "helpful", "app", "crashes", "slow", "fast", "seeds", "germinated", "price", "ghali", "fair"]

xy = PCA(2).fit_transform(E[[vocab.index(w) for w in words]])
plt.scatter(xy[:, 0], xy[:, 1])
for w, (x, y) in zip(words, xy):
    plt.annotate(w, (x, y))
plt.title("Word embeddings learned from 400 reviews")`,
    },
    {
      id: "explain-embed",
      kind: "explain",
      title: "Words as points",
      prompt: "Explain what a word embedding is, how it can be learned from text, and one limitation you saw.",
      ideas: [
        { label: "A dense vector of numbers per word", patterns: ["vector", "numbers", "dense", "point", "coordinates"], nudge: "What does an embedding look like?" },
        { label: "Learned from context: words used alike end up close", patterns: ["context", "company", "co.?occur", "same sentences", "used (alike|similarly|together)", "appear together"], nudge: "Where do the vectors come from?" },
        { label: "Similarity measured by cosine / distance", patterns: ["cosine", "distance", "close", "near", "similar"], nudge: "How do you compare two embeddings?" },
        { label: "Limitation: opposites can be close / no sentiment / needs lots of text", patterns: ["opposite", "rude.*polite", "polite.*rude", "antonym", "sentiment", "more (data|text)", "small", "one vector per word"], nudge: "What surprised you about \"rude\"'s neighbours?" },
      ],
      modelAnswer:
        "A word embedding is a dense vector of numbers for each word, learned from context so that words used in similar sentences end up close together, which we measure with cosine similarity. A limitation: because it only sees context, opposites like \"rude\" and \"polite\" end up close — they fill the same slot in \"the agent was ___\" — so embeddings alone don't capture sentiment, and good ones need huge amounts of text.",
    },
  ],
};

export const attentionLab: Lab = {
  slug: "attention",
  number: "34",
  title: "Attention & Transformers",
  subject: "Context",
  summary:
    "The idea behind every modern language model: let each word look at the others and decide which ones matter. Build scaled dot-product attention in NumPy, line by line.",
  minutes: 45,
  kind: "lab",
  packages: ["numpy"],
  skills: [
    "Explain queries, keys and values",
    "Implement softmax and scaled dot-product attention",
    "Apply a causal mask as GPT-style models do",
  ],
  steps: [
    {
      id: "context",
      kind: "concept",
      title: "The same word, different meanings",
      body: [
        "\"The farmer sold the maize because **it** was ripe.\" / \"...because **she** needed money.\" To understand \"it\" or \"she\" you have to look back at the right earlier word. A fixed embedding per word can't do that.",
        "**Attention** lets every word build a new, context-aware vector by mixing in information from the other words — weighted by how relevant each one is.",
        "In 2017 the paper *Attention Is All You Need* built a whole architecture from it: the **transformer**. GPT, Claude, Gemini and Llama are all transformers.",
      ],
      keyIdea: "Attention: each word decides how much to take from every other word, giving context-aware representations.",
    },
    {
      id: "heatmap",
      kind: "experiment",
      title: "Where does each word look?",
      prompt: "Switch between the two sentences and click on \"it\" / \"she\". Then click other words to see where they look.",
      widget: "attention-heatmap",
      observe:
        "At the same position, \"it\" attends mostly to *maize* and \"she\" to *farmer*. Each row of weights sums to 100%: attention is a way of dividing focus. A real model learns these weights, and has dozens of attention **heads** per layer, each free to track a different kind of relationship.",
    },
    {
      id: "predict-softmax",
      kind: "predict",
      title: "Softmax",
      prompt: "Softmax turns scores into weights that sum to 1. What does this print?",
      code: `import numpy as np
scores = np.array([2.0, 2.0, 2.0])
print(np.exp(scores) / np.exp(scores).sum())`,
      options: ["[0.33333333 0.33333333 0.33333333]", "[2. 2. 2.]", "[1. 0. 0.]", "[0.66666667 0.66666667 0.66666667]"],
      answer: 0,
      explanation: "Equal scores give equal weights — a third each. Softmax only cares about differences between scores: raise one and it takes a bigger share, at the others' expense.",
    },
    {
      id: "qkv",
      kind: "concept",
      title: "Queries, keys and values",
      body: [
        "Each word's vector is turned into three: a **query** (what am I looking for?), a **key** (what do I contain?) and a **value** (what I'll pass on). All three come from learned weight matrices.",
        "Scores are the dot products of one word's query with every word's key, divided by `√d` (the vector size) to keep them from growing too large. **Softmax** turns scores into weights; the output is the weighted sum of the values.",
        "`attention(Q, K, V) = softmax(Q Kᵀ / √d) V`. A transformer layer runs this (in several heads at once), then a small neural network on each position, and stacks dozens of such layers.",
      ],
      code: `scores = Q @ K.T / np.sqrt(d)      # how well each query matches each key
weights = softmax(scores)          # each row sums to 1
output = weights @ V               # a weighted mix of the values`,
      keyIdea: "softmax(QKᵀ/√d)·V — match queries to keys, turn scores into weights, mix the values.",
    },
    {
      id: "softmax",
      kind: "code",
      title: "A stable softmax",
      brief: "Write `softmax(x)` that works row by row on a 2D array: exponentiate, then divide by each row's sum. Subtract each row's maximum first so large scores don't overflow.",
      starterCode: `import numpy as np

def softmax(x):
    pass

print(softmax(np.array([[1.0, 2.0, 3.0], [1000.0, 1000.0, 1000.0]])))
`,
      checks: [
        { expr: "np.allclose(softmax(np.array([[1.0, 2.0, 3.0]])), np.exp([1, 2, 3]) / np.exp([1, 2, 3]).sum())", label: "Correct weights", failHint: "`e = np.exp(x - x.max(axis=1, keepdims=True))`, then `e / e.sum(axis=1, keepdims=True)`." },
        { expr: "np.allclose(softmax(np.array([[1000.0, 1000.0], [0.0, 5.0]])).sum(axis=1), 1)", label: "Each row sums to 1, even with huge scores", failHint: "Subtract the row maximum before `np.exp` — `np.exp(1000)` overflows to infinity." },
      ],
      hints: ["`keepdims=True` keeps the row sums as a column, so dividing broadcasts across each row."],
      errorHints: [{ pattern: "overflow", hint: "Subtract `x.max(axis=1, keepdims=True)` before exponentiating." }],
      why: "Subtracting the max doesn't change the answer — it cancels in the division — but it stops `exp(1000)` becoming infinity. Every deep-learning library does exactly this.",
      solution: `import numpy as np

def softmax(x):
    e = np.exp(x - x.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)

print(softmax(np.array([[1.0, 2.0, 3.0], [1000.0, 1000.0, 1000.0]])))`,
    },
    {
      id: "attention",
      kind: "code",
      title: "Scaled dot-product attention",
      brief: "Write `attention(Q, K, V)` that returns `(output, weights)` using `softmax(Q @ K.T / √d)`, where `d` is the number of columns of `K`. Run it on the four-word example and store the result as `out, w`.",
      starterCode: `import numpy as np

def softmax(x):
    e = np.exp(x - x.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)

words = ["farmer", "sold", "maize", "it"]
rng = np.random.default_rng(0)
X = rng.normal(size=(4, 8))                  # one 8-number vector per word
Wq, Wk, Wv = (rng.normal(size=(8, 8)) for _ in range(3))
Q, K, V = X @ Wq, X @ Wk, X @ Wv

def attention(Q, K, V):
    pass

out, w = attention(Q, K, V)
print(np.round(w, 2))
`,
      checks: [
        { expr: "np.allclose(w, softmax(Q @ K.T / np.sqrt(K.shape[1])))", label: "Weights are softmax(QKᵀ/√d)", failHint: "`weights = softmax(Q @ K.T / np.sqrt(K.shape[1]))`" },
        { expr: "np.allclose(out, w @ V) and out.shape == (4, 8)", label: "Output is the weighted mix of values", failHint: "`return weights @ V, weights`" },
      ],
      hints: ["`K.shape[1]` is `d`."],
      why: "Four lines — and it's the operation at the centre of GPT and Claude. In a trained model, `Wq`, `Wk` and `Wv` are learned by backprop so the weights point at the words that matter. Here they're random, so the pattern is meaningless — but the machinery is real.",
      solution: `import numpy as np

def softmax(x):
    e = np.exp(x - x.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)

words = ["farmer", "sold", "maize", "it"]
rng = np.random.default_rng(0)
X = rng.normal(size=(4, 8))
Wq, Wk, Wv = (rng.normal(size=(8, 8)) for _ in range(3))
Q, K, V = X @ Wq, X @ Wk, X @ Wv

def attention(Q, K, V):
    weights = softmax(Q @ K.T / np.sqrt(K.shape[1]))
    return weights @ V, weights

out, w = attention(Q, K, V)
print(np.round(w, 2))`,
    },
    {
      id: "causal",
      kind: "code",
      challenge: true,
      title: "No peeking ahead",
      brief:
        "A GPT-style model generates text left to right, so while training each word may only attend to itself and **earlier** words. Write `causal_attention(Q, K, V)` that sets the scores above the diagonal to `-np.inf` before the softmax, returning `(output, weights)`.",
      starterCode: `import numpy as np

def softmax(x):
    e = np.exp(x - x.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)

rng = np.random.default_rng(0)
X = rng.normal(size=(4, 8))
Wq, Wk, Wv = (rng.normal(size=(8, 8)) for _ in range(3))
Q, K, V = X @ Wq, X @ Wk, X @ Wv

def causal_attention(Q, K, V):
    pass

out, w = causal_attention(Q, K, V)
print(np.round(w, 2))
`,
      checks: [
        { expr: "np.allclose(np.triu(w, 1), 0)", label: "No word attends to a later word", failHint: "`mask = np.triu(np.ones((n, n), dtype=bool), 1)`, then `scores[mask] = -np.inf`." },
        { expr: "np.allclose(w.sum(axis=1), 1) and np.isclose(w[0, 0], 1)", label: "Rows still sum to 1; the first word can only see itself", failHint: "Apply the mask to the scores *before* the softmax." },
        { expr: "np.allclose(out, w @ V)", label: "Output mixes only visible values", failHint: "`return weights @ V, weights`" },
      ],
      hints: ["`np.triu(..., 1)` selects everything strictly above the diagonal.", "`np.exp(-np.inf)` is 0, so masked positions get zero weight."],
      why: "That lower-triangular pattern is the mask inside every GPT-style model. It's what lets one training sentence teach the model to predict every next word at once — which is the next lab's topic.",
      solution: `import numpy as np

def softmax(x):
    e = np.exp(x - x.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)

rng = np.random.default_rng(0)
X = rng.normal(size=(4, 8))
Wq, Wk, Wv = (rng.normal(size=(8, 8)) for _ in range(3))
Q, K, V = X @ Wq, X @ Wk, X @ Wv

def causal_attention(Q, K, V):
    scores = Q @ K.T / np.sqrt(K.shape[1])
    n = scores.shape[0]
    scores[np.triu(np.ones((n, n), dtype=bool), 1)] = -np.inf
    weights = softmax(scores)
    return weights @ V, weights

out, w = causal_attention(Q, K, V)
print(np.round(w, 2))`,
    },
    {
      id: "explain-attention",
      kind: "explain",
      title: "Attention in plain words",
      prompt: "Explain what attention does in a transformer, using queries, keys and values, and why it helps with language.",
      ideas: [
        { label: "Each word looks at / weighs the other words", patterns: ["look at", "other words", "weigh", "focus", "relevan", "attend"], nudge: "What does each word do with the others?" },
        { label: "Query–key match → softmax weights", patterns: ["query", "key", "dot product", "match", "softmax", "score"], nudge: "How are the weights computed?" },
        { label: "Output is a weighted mix of values", patterns: ["value", "weighted (sum|mix|average)", "mix"], nudge: "What's the output made of?" },
        { label: "Gives context-dependent meaning (e.g. resolving \"it\")", patterns: ["context", "meaning", "\\bit\\b", "pronoun", "depend", "ambigu"], nudge: "Why does language need this?" },
      ],
      modelAnswer:
        "Attention lets each word look at every other word and decide how relevant it is: the word's query is matched against every word's key with a dot product, softmax turns those scores into weights, and the output is a weighted mix of the words' values. This gives each word a context-dependent meaning — so \"it\" can draw on \"maize\" in one sentence and something else in another.",
    },
  ],
};

export const llmLab: Lab = {
  slug: "llms",
  number: "35",
  title: "How LLMs Work",
  subject: "Language models",
  summary:
    "Build a tiny language model that writes reviews, see why it confidently makes things up, and fix that the way real AI assistants do: by retrieving facts and putting them in the prompt.",
  minutes: 50,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: REVIEWS,
  skills: [
    "Explain next-token prediction, temperature and hallucination",
    "Build and sample from a bigram language model",
    "Build a retrieval-augmented prompt",
  ],
  steps: [
    {
      id: "next-token",
      kind: "concept",
      title: "A very good next-word guesser",
      body: [
        "A **large language model (LLM)** is trained on one task: given the text so far, predict the next **token**. It outputs a probability for every token in its vocabulary.",
        "To write, it picks a token, appends it, and repeats. That's all generation is. What makes it powerful is scale: a transformer with billions of weights, trained on trillions of tokens, has to learn grammar, facts and reasoning patterns to predict well.",
        "Assistants like ChatGPT and Claude are then fine-tuned on examples of helpful conversations and human feedback, so they follow instructions instead of just continuing text.",
      ],
      keyIdea: "An LLM predicts the next token, over and over. Everything else is scale and fine-tuning.",
    },
    {
      id: "sampler",
      kind: "experiment",
      title: "Temperature",
      prompt: "This model knows only which word follows which in the 400 reviews. Pick a word to see its predictions, move the temperature, and generate a few sentences at low and high temperature.",
      widget: "temperature-sampler",
      observe:
        "Low temperature sharpens the odds toward the likeliest word: safe and repetitive. High temperature flattens them: varied, then nonsense. And notice what it writes — grammatical, plausible, often *untrue*: \"the price is easy to use.\" It knows word patterns, not facts.",
    },
    {
      id: "predict-temp",
      kind: "predict",
      title: "Cooling the odds",
      prompt: "Temperature T rescales probabilities as p^(1/T), then renormalises. What's the top word's probability at T = 0.5?",
      code: `import numpy as np
p = np.array([0.6, 0.3, 0.1])
T = 0.5
q = p ** (1 / T)
print(round((q / q.sum()).max(), 2))`,
      options: ["0.78", "0.6", "0.45", "1.0"],
      answer: 0,
      explanation: "Squaring gives 0.36, 0.09, 0.01, which renormalise to 0.78, 0.20, 0.02. Lower temperature makes the favourite more dominant; at T → 0 it always wins (\"greedy\" decoding).",
    },
    {
      id: "bigram",
      kind: "code",
      title: "Build a language model",
      brief: "Count, for every word, which words follow it across all reviews: `next_words[word]` should be a `Counter`. Then write `next_prob(word)` returning a dict of each following word's probability.",
      starterCode: BIGRAMS + `
next_words = defaultdict(Counter)

def next_prob(word):
    pass

print(next_prob("agent"))
`,
      checks: [
        { expr: "next_words['the']['price'] == sum(tokenize(t)[i:i + 2] == ['the', 'price'] for t in df['text'] for i in range(len(tokenize(t))))", label: "`next_words` counts every word pair", failHint: "For each review: `w = tokenize(text)`, then `for a, b in zip(w, w[1:]): next_words[a][b] += 1`." },
        { expr: "abs(sum(next_prob('agent').values()) - 1) < 1e-9 and abs(next_prob('agent')['was'] - next_words['agent']['was'] / sum(next_words['agent'].values())) < 1e-9", label: "`next_prob` gives probabilities that sum to 1", failHint: "Divide each count by the total: `{w: c / total for w, c in next_words[word].items()}`." },
      ],
      hints: ["`zip(w, w[1:])` pairs each token with the one after it."],
      why: "That's a **bigram language model**: a probability for the next word given the last one. After \"agent\", \"was\" wins about half the time. An LLM does the same job, but conditions on thousands of previous tokens using attention, instead of just one.",
      solution: BIGRAMS + `
next_words = defaultdict(Counter)
for text in df["text"]:
    w = tokenize(text)
    for a, b in zip(w, w[1:]):
        next_words[a][b] += 1

def next_prob(word):
    total = sum(next_words[word].values())
    return {w: c / total for w, c in next_words[word].items()}

print(next_prob("agent"))`,
    },
    {
      id: "generate",
      kind: "code",
      title: "Let it write",
      brief: "Write `apply_temperature(probs, T)` that takes an array of probabilities and returns `probs ** (1 / T)`, renormalised to sum to 1. Then use the provided `generate` to write a review at temperature 0.5 as `sample`.",
      starterCode: BIGRAMS + `
next_words = defaultdict(Counter)
for text in df["text"]:
    w = tokenize(text)
    for a, b in zip(w, w[1:]):
        next_words[a][b] += 1

def apply_temperature(probs, T):
    pass

def generate(start="the", T=1.0, seed=0, max_words=15):
    rng = np.random.default_rng(seed)
    out = [start]
    while len(out) < max_words and out[-1] not in ".!":
        options = list(next_words[out[-1]])
        counts = np.array([next_words[out[-1]][w] for w in options], dtype=float)
        p = apply_temperature(counts / counts.sum(), T)
        out.append(options[rng.choice(len(options), p=p)])
    return " ".join(out)

sample = None
print(sample)
`,
      checks: [
        { expr: "np.allclose(apply_temperature(np.array([0.6, 0.3, 0.1]), 1.0), [0.6, 0.3, 0.1])", label: "T = 1 leaves probabilities unchanged", failHint: "`q = probs ** (1 / T)`; `return q / q.sum()`" },
        { expr: "np.isclose(apply_temperature(np.array([0.6, 0.3, 0.1]), 0.5).max(), 0.36 / 0.46) and np.isclose(apply_temperature(np.array([0.6, 0.3, 0.1]), 3.0).sum(), 1)", label: "Low T sharpens; results sum to 1", failHint: "Don't forget to divide by the sum." },
        { expr: "isinstance(sample, str) and sample.startswith('the')", label: "`sample` is generated text", failHint: "`sample = generate(T=0.5)`" },
      ],
      hints: ["Try several seeds and temperatures once it works."],
      why: "It writes fluent-looking fragments — and happily claims things like \"the price is easy to use\". Nothing in the model knows what's true; it only knows what tends to come next. LLMs are vastly better at this, but the same fact explains why they sometimes **hallucinate**.",
      tryNext: "Compare `generate(T=0.2, seed=s)` and `generate(T=2.5, seed=s)` for a few seeds.",
      solution: BIGRAMS + `
next_words = defaultdict(Counter)
for text in df["text"]:
    w = tokenize(text)
    for a, b in zip(w, w[1:]):
        next_words[a][b] += 1

def apply_temperature(probs, T):
    q = probs ** (1 / T)
    return q / q.sum()

def generate(start="the", T=1.0, seed=0, max_words=15):
    rng = np.random.default_rng(seed)
    out = [start]
    while len(out) < max_words and out[-1] not in ".!":
        options = list(next_words[out[-1]])
        counts = np.array([next_words[out[-1]][w] for w in options], dtype=float)
        p = apply_temperature(counts / counts.sum(), T)
        out.append(options[rng.choice(len(options), p=p)])
    return " ".join(out)

sample = generate(T=0.5)
print(sample)
for s in range(3):
    print(generate(T=2.5, seed=s))`,
    },
    {
      id: "grounding",
      kind: "concept",
      title: "Hallucination, prompting and RAG",
      body: [
        "LLMs generate what's *likely*, not what's *true*. When the training data didn't pin down a fact — a company's refund policy, last week's prices — the model may **hallucinate**: produce a confident, fluent, wrong answer.",
        "**Prompting** is how you steer a model: say who it's helping, give the context, state the task and the format you want, and show an example. Clear prompts get noticeably better answers.",
        "**Retrieval-augmented generation (RAG)** fixes missing facts: search your own documents for the passages most relevant to the question, paste them into the prompt, and instruct the model to answer only from them — and to say \"I don't know\" otherwise. Search often uses embeddings; TF-IDF works too.",
      ],
      code: `prompt = f"""You are a helpful support assistant for an agri-supplies company.
Answer using ONLY the information below. If it isn't there, say you don't know.

Information: {retrieved_passage}

Question: {question}"""`,
      keyIdea: "LLMs predict plausible text. Ground them: retrieve real facts, put them in the prompt, and allow \"I don't know\".",
    },
    {
      id: "rag",
      kind: "code",
      challenge: true,
      title: "Build the retrieval half of RAG",
      brief:
        "Using a `TfidfVectorizer(stop_words=\"english\")` fitted on `FAQ`, write `retrieve(question)` returning the index of the most similar FAQ entry, or `None` if the best similarity is below 0.1. Then write `build_prompt(question)` that returns a prompt containing the retrieved passage and the question — or, when nothing is retrieved, a prompt that tells the model to say it doesn't know.",
      starterCode: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

` + FAQ + `
def retrieve(question):
    pass

def build_prompt(question):
    pass

print(build_prompt("My seeds did not germinate, what can I do?"))
`,
      checks: [
        { expr: "retrieve('My seeds did not germinate, what can I do?') == 1 and retrieve('The app keeps logging me out') == 7 and retrieve('How do I pay for my order?') == 6", label: "Finds the right FAQ entry", failHint: "`vec = TfidfVectorizer(stop_words=\"english\").fit(FAQ)`, then `scores = (vec.transform(FAQ) @ vec.transform([question]).T).toarray().ravel()`." },
        { expr: "retrieve('What is the capital of Kenya?') is None", label: "Returns None when nothing is relevant", failHint: "Return `None` when `scores.max() < 0.1`." },
        { expr: "FAQ[1] in build_prompt('My seeds did not germinate') and 'My seeds did not germinate' in build_prompt('My seeds did not germinate')", label: "The prompt includes the passage and the question", failHint: "Use an f-string with both `FAQ[i]` and `question`." },
        { expr: "all(f not in build_prompt('What is the capital of Kenya?') for f in FAQ) and 'know' in build_prompt('What is the capital of Kenya?').lower()", label: "No passage → tells the model to say it doesn't know", failHint: "When `retrieve` returns `None`, return a prompt telling the model to say it doesn't know." },
      ],
      hints: [
        "TF-IDF rows are unit length, so a dot product is the cosine similarity.",
        "`int(scores.argmax())` gives the best index as a plain int.",
      ],
      why:
        "That's the retrieval half of RAG — the same design behind company chatbots and \"chat with your documents\" tools. Hand this prompt to any LLM and its answer is grounded in your FAQ, not its guesses. And when the FAQ has nothing relevant, the model is told to say so instead of inventing a policy.",
      solution: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

` + FAQ + `
vec = TfidfVectorizer(stop_words="english").fit(FAQ)
docs = vec.transform(FAQ)

def retrieve(question):
    scores = (docs @ vec.transform([question]).T).toarray().ravel()
    return int(scores.argmax()) if scores.max() >= 0.1 else None

def build_prompt(question):
    i = retrieve(question)
    if i is None:
        return f"The question below isn't covered by our information. Politely say you don't know.\\n\\nQuestion: {question}"
    return (
        "You are a support assistant for an agri-supplies company. Answer using ONLY the information below.\\n\\n"
        f"Information: {FAQ[i]}\\n\\nQuestion: {question}"
    )

print(build_prompt("My seeds did not germinate, what can I do?"))
print(build_prompt("What is the capital of Kenya?"))`,
    },
    {
      id: "explain-llm",
      kind: "explain",
      title: "How an LLM answers you",
      prompt: "Explain to a friend how an LLM produces an answer, why it can confidently state something false, and how RAG reduces that risk.",
      ideas: [
        { label: "Predicts the next token, repeatedly", patterns: ["next (word|token)", "predict", "one (word|token) at a time", "repeat"], nudge: "What does the model actually do, step by step?" },
        { label: "Learned patterns from lots of text (transformer / training)", patterns: ["train", "text", "pattern", "transformer", "data"], nudge: "Where does its knowledge come from?" },
        { label: "Hallucination: plausible, not verified true", patterns: ["hallucinat", "plausible", "likely", "not (true|fact)", "make.* up", "invent", "confident"], nudge: "Why can it be wrong but sound sure?" },
        { label: "RAG retrieves relevant documents into the prompt to ground the answer", patterns: ["retriev", "document", "search", "context", "ground", "prompt"], nudge: "What does RAG add to the prompt?" },
      ],
      modelAnswer:
        "An LLM is a transformer trained on huge amounts of text to predict the next token; it writes an answer by predicting one token at a time and appending it. Because it produces what's likely rather than what's verified, it can confidently make things up — hallucinate — when it doesn't really know. RAG reduces this by retrieving relevant documents and putting them in the prompt, so the answer is grounded in real information, with instructions to say \"I don't know\" otherwise.",
    },
  ],
};

export const feedbackCapstone: Lab = {
  slug: "feedback-assistant",
  number: "P5",
  title: "Customer Feedback Assistant",
  subject: "Capstone",
  summary:
    "An agri-supplies company gets hundreds of reviews a month in English and Swahili. Build a tool that flags unhappy customers, finds what they're unhappy about, and drafts a grounded reply.",
  minutes: 60,
  kind: "project",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: REVIEWS,
  cover: { src: "/images/pair-programming.jpg", alt: "Two developers reading code together on a monitor" },
  skills: [
    "Combine classification, keyword tagging and retrieval in one tool",
    "Prioritise issues from unstructured feedback",
    "Keep a human in the loop for customer-facing text",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a support team drowning in messages",
      body: [
        "The company's two support staff can't read every review. They want three things: flag the unhappy customers, show which part of the business is causing most complaints, and draft a first reply grounded in the company's FAQ.",
        "You have the 400 labelled reviews and the FAQ. Everything you need is in the last few labs: a sentiment pipeline, simple text rules, and TF-IDF retrieval.",
        "Replies go to real customers, so drafts are **suggestions** a person approves — never sent automatically.",
      ],
      keyIdea: "Chain simple, well-understood pieces into a useful tool — and keep people in charge of what customers see.",
    },
    {
      id: "flag",
      kind: "code",
      title: "Flag unhappy customers",
      brief: "Train a pipeline of `TfidfVectorizer(ngram_range=(1, 2))` and `LogisticRegression()` as `model` on the training split and store its test accuracy as `acc`. Then add a `p_unhappy` column to `df`: the model's probability that each review is **not** positive.",
      starterCode: SPLIT + `from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

`,
      checks: [
        { expr: "type(model).__name__ == 'Pipeline' and abs(acc - model.score(X_test, y_test)) < 1e-9 and acc > 0.85", label: "`acc` from the bigram pipeline", failHint: "`model = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LogisticRegression()).fit(X_train, y_train)`" },
        { expr: "'p_unhappy' in df and np.allclose(df['p_unhappy'], model.predict_proba(df['text'])[:, 0])", label: "`p_unhappy` for every review", failHint: "Column 0 of `predict_proba` is the probability of class 0 (not positive)." },
      ],
      hints: ["`model.classes_` shows the class order: `[0, 1]`."],
      why: "Every review now has an unhappiness score, so the team can read the most urgent first instead of in date order.",
      solution: SPLIT + `from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

model = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LogisticRegression()).fit(X_train, y_train)
acc = model.score(X_test, y_test)
df["p_unhappy"] = model.predict_proba(df["text"])[:, 0]
print(round(acc, 3))
print(df.sort_values("p_unhappy", ascending=False)[["text", "p_unhappy"]].head())`,
    },
    {
      id: "topics",
      kind: "code",
      title: "What are they unhappy about?",
      brief:
        "Write `topics(text)` returning the list of `TOPICS` whose keywords appear in the lowercased text. Then, for reviews with `p_unhappy > 0.5`, count how many mention each topic in a Series `complaints` (topic → count), and store the most complained-about topic as `worst_topic`.",
      starterCode: SPLIT + `from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

model = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LogisticRegression()).fit(X_train, y_train)
df["p_unhappy"] = model.predict_proba(df["text"])[:, 0]

TOPICS = {
    "delivery": ["delivery", "arrived", "ilifika", "ilichelewa"],
    "agent": ["agent", "alikuwa"],
    "app": ["app"],
    "seeds": ["seeds", "mbegu", "germinat", "zilimea", "hazikumea"],
    "price": ["price", "bei", "ghali"],
}

def topics(text):
    pass

`,
      checks: [
        { expr: "sorted(topics('The AGENT was rude and the price bei ni ghali')) == ['agent', 'price'] and topics('Asante!') == []", label: "`topics` finds each mentioned topic", failHint: "`[t for t, keys in TOPICS.items() if any(k in text.lower() for k in keys)]`" },
        {
          expr: "isinstance(complaints, pd.Series) and all(complaints.get(t, 0) == sum(t in topics(x) for x in df.loc[df['p_unhappy'] > 0.5, 'text']) for t in TOPICS)",
          label: "`complaints` counts flagged reviews per topic",
          failHint: "Loop over the flagged reviews' topics and count them, e.g. with `Counter`, then `pd.Series(counter)`.",
        },
        { expr: "worst_topic == complaints.idxmax()", label: "`worst_topic` is the biggest source of complaints", failHint: "`complaints.idxmax()`" },
      ],
      hints: ["A flagged review can mention several topics; count each one."],
      why: "A few keyword lists turn a pile of text into a chart a manager can act on. Simple rules like these are transparent and easy to fix — a good partner to the statistical model.",
      solution: SPLIT + `from collections import Counter
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

model = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LogisticRegression()).fit(X_train, y_train)
df["p_unhappy"] = model.predict_proba(df["text"])[:, 0]

TOPICS = {
    "delivery": ["delivery", "arrived", "ilifika", "ilichelewa"],
    "agent": ["agent", "alikuwa"],
    "app": ["app"],
    "seeds": ["seeds", "mbegu", "germinat", "zilimea", "hazikumea"],
    "price": ["price", "bei", "ghali"],
}

def topics(text):
    return [t for t, keys in TOPICS.items() if any(k in text.lower() for k in keys)]

flagged = df.loc[df["p_unhappy"] > 0.5, "text"]
complaints = pd.Series(Counter(t for text in flagged for t in topics(text))).sort_values(ascending=False)
worst_topic = complaints.idxmax()
print(complaints)
print("worst:", worst_topic)`,
    },
    {
      id: "draft",
      kind: "code",
      challenge: true,
      title: "Draft a grounded reply",
      brief:
        "Write `draft_reply(review)`. If the model thinks the review is positive (`p_unhappy ≤ 0.5`), return a short thank-you. Otherwise retrieve the most relevant FAQ entry with TF-IDF (`stop_words=\"english\"`); if its similarity is at least 0.1, return an apology that **includes that FAQ text**, else return an apology saying a team member will call them. Never mention an FAQ entry that wasn't retrieved.",
      starterCode: SPLIT + `from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

model = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LogisticRegression()).fit(X_train, y_train)

` + FAQ + `
def draft_reply(review):
    pass

print(draft_reply("The app keeps logging me out. Very disappointed."))
`,
      checks: [
        { expr: "FAQ[7] in draft_reply('The app keeps logging me out. Very disappointed.')", label: "Unhappy + relevant FAQ → apology with that FAQ", failHint: "Score `review` against the FAQ with TF-IDF and include `FAQ[best]` when the score is ≥ 0.1." },
        { expr: "all(f not in draft_reply('Great service. The agent was very helpful. Asante!') for f in FAQ)", label: "Happy customers get a thank-you, not an FAQ", failHint: "Check `model.predict_proba([review])[0, 0] <= 0.5` first." },
        { expr: "all(f not in draft_reply('Terrible. Never again.') for f in FAQ) and len(draft_reply('Terrible. Never again.')) > 0", label: "Nothing relevant → no invented answer", failHint: "When the best FAQ score is below 0.1, return an apology without any FAQ text." },
      ],
      hints: ["Reuse your `retrieve` idea from the LLM lab: fit the vectoriser on `FAQ`, transform the review, take the dot products."],
      why:
        "This is the skeleton of a real support copilot: classify, retrieve, draft — then a person approves. Swap the fixed sentences for an LLM prompted with the retrieved passage and you'd have RAG-powered replies; the grounding and the \"don't invent answers\" rule stay exactly the same.",
      solution: SPLIT + `from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

model = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LogisticRegression()).fit(X_train, y_train)

` + FAQ + `
vec = TfidfVectorizer(stop_words="english").fit(FAQ)
docs = vec.transform(FAQ)

def draft_reply(review):
    if model.predict_proba([review])[0, 0] <= 0.5:
        return "Thank you for your kind words — asante sana!"
    scores = (docs @ vec.transform([review]).T).toarray().ravel()
    if scores.max() >= 0.1:
        return f"We're sorry about your experience. {FAQ[int(scores.argmax())]}"
    return "We're sorry about your experience. A member of our team will call you to put it right."

for r in ["The app keeps logging me out. Very disappointed.", "Great service. The agent was very helpful. Asante!", "Terrible. Never again."]:
    print(r, "→", draft_reply(r))`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Hand it over",
      prompt: "Write a short note to the support team: what the tool does, how accurate it is, what customers complain about most, and how they should use the drafted replies.",
      ideas: [
        { label: "Flags unhappy reviews with a sentiment model (states accuracy)", patterns: ["accura", "%", "flag", "unhappy", "sentiment"], nudge: "What does it do first, and how reliable is it?" },
        { label: "Names the top complaint topic", patterns: ["delivery", "agent", "app", "seeds", "price", "topic", "complain"], nudge: "What's the biggest source of complaints?" },
        { label: "Drafts are grounded in the FAQ", patterns: ["faq", "retriev", "grounded", "company information"], nudge: "Where do the replies' facts come from?" },
        { label: "A person reviews and approves before sending", patterns: ["review", "approve", "check", "person", "human", "before send", "edit"], nudge: "Should replies go out automatically?" },
      ],
      modelAnswer:
        "The tool scores every review for unhappiness with a sentiment model that's about 90% accurate on held-out reviews, so you can read the most urgent first. It tags each complaint by topic — the count shows which part of the business causes the most — and drafts a reply that quotes the relevant FAQ entry, or promises a call when the FAQ doesn't cover it. Please read and approve every draft before sending: the model makes mistakes, especially with mixed or sarcastic reviews.",
    },
  ],
};

export const languageLabs: Lab[] = [textDataLab, bagOfWordsLab, sentimentLab, embeddingsLab, attentionLab, llmLab, feedbackCapstone];
