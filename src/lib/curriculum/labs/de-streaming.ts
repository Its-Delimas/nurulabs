import type { Lab } from "../types";

const EVENTS = `import numpy as np
import pandas as pd

# 2,000 illustrative payment events in one hour. Each is created on a phone
# (event_time) and reaches the platform a little later (arrival_time);
# a few phones were offline and their events arrive many minutes late.
rng = np.random.default_rng(7)
n = 2000
start = pd.Timestamp("2024-07-01 12:00")
event_s = np.sort(rng.uniform(0, 3600, n))
delay = rng.exponential(4, n)
offline = rng.random(n) < 0.02
delay[offline] += rng.uniform(300, 900, offline.sum())
events = pd.DataFrame({
    "event_id": [f"E{i:05d}" for i in range(n)],
    "event_time": start + pd.to_timedelta(event_s, unit="s"),
    "arrival_time": start + pd.to_timedelta(event_s + delay, unit="s"),
    "amount": rng.gamma(2, 600, n).round(),
}).sort_values("arrival_time").reset_index(drop=True)
`;

export const deStreamingLab: Lab = {
  slug: "de-streaming",
  number: "16",
  title: "Batch vs Streaming",
  subject: "Events, offsets, windows, watermarks",
  summary:
    "Some questions can wait for tonight's batch; a suspicious payment can't. Learn how streaming systems like Kafka and Flink work: consume a log with offsets, survive a crash without double-counting, and count events in time windows even when they arrive late.",
  minutes: 50,
  kind: "lab",
  packages: ["pandas"],
  skills: [
    "Choose between batch and streaming for a use case",
    "Consume a log with offsets, idempotently (at-least-once)",
    "Aggregate by event-time windows with watermarks for late data",
  ],
  steps: [
    {
      id: "batch-stream",
      kind: "concept",
      title: "Tonight, or right now?",
      body: [
        "Everything so far has been **batch**: collect a day's data, process it on a schedule, and publish the results. Batch is simple, cheap and easy to re-run, and most reporting needs nothing more. **Streaming** processes each event within seconds of it happening. That is worth its extra complexity when the answer loses value by the minute: blocking a fraudulent payment, alerting when an agent runs out of float, or a live dashboard during a campaign.",
        "Streaming systems are built around a **log**. **Apache Kafka** is the most widely used (managed alternatives include Amazon Kinesis, Google Pub/Sub and Azure Event Hubs). Producers append events to a **topic**, which is split into **partitions**. Each event has an **offset**, its position in the log. Consumers read in order and **commit** the offset they've reached, so after a crash they resume from the last commit. Engines like **Apache Flink**, **Spark Structured Streaming** and **Kafka Streams** add windows, joins and state on top.",
      ],
      code: `topic "payments", partition 0
offset:  0     1     2     3     4     5    …
        [e1]  [e2]  [e3]  [e4]  [e5]  [e6]  …   ← producers append
                          ↑
            consumer's committed offset = 3
            (after a crash it restarts from offset 3)`,
      keyIdea: "Batch when the answer can wait. Stream when minutes matter. Streams are logs read in order, with committed offsets.",
    },
    {
      id: "time",
      kind: "concept",
      title: "Two clocks: event time and arrival time",
      body: [
        "Every event has two times. **Event time** is when it happened on the phone. **Processing time** (or arrival time) is when the platform received it. Networks delay events, and phones go offline and send them later, so events arrive **out of order**.",
        "Streaming aggregates use **windows**. **Tumbling** windows are fixed and don't overlap, such as every 5 minutes. **Hopping** (sliding) windows overlap, such as 10-minute windows starting every minute. **Session** windows close after a gap in activity. Counting by arrival time is easy but wrong, because a delayed event lands in the wrong window. Counting by event time is right, but raises a question: how long do you wait for stragglers?",
        "A **watermark** answers that question. It's the engine's estimate that events older than a certain time have all arrived, typically the latest event time seen minus an allowed lateness. When the watermark passes the end of a window, the window is closed and its result emitted. Events that turn up after that are **late**: they are dropped, sent to a side output, or used to update the result, depending on the system.",
      ],
      keyIdea: "Window by event time, close windows with a watermark, and decide deliberately what happens to late events.",
    },
    {
      id: "windows",
      kind: "experiment",
      title: "Windows and stragglers",
      prompt: "Nineteen payments over 15 minutes, three of them delayed. Switch between counting by arrival time and by event time, then move the allowed lateness and watch which events make it into their windows.",
      widget: "stream-windows",
      observe:
        "Counting by arrival time puts delayed events in the wrong window, so the totals look fine but each window is wrong. Counting by event time with no allowed lateness closes windows the moment newer events appear, so the stragglers are dropped. Allowing more lateness catches them, but every result is published later. That is the trade-off every streaming job tunes: completeness against latency.",
    },
    {
      id: "predict-window",
      kind: "predict",
      title: "Which window?",
      prompt: "Five-minute tumbling windows. Which window does a payment at 12:07:42 belong to?",
      code: `import pandas as pd
t = pd.Timestamp("2024-07-01 12:07:42")
print(t.floor("5min"), t.floor("5min") + pd.Timedelta("5min"))`,
      options: [
        "2024-07-01 12:05:00 2024-07-01 12:10:00",
        "2024-07-01 12:07:00 2024-07-01 12:12:00",
        "2024-07-01 12:00:00 2024-07-01 12:05:00",
        "2024-07-01 12:10:00 2024-07-01 12:15:00",
      ],
      answer: 0,
      explanation:
        "Tumbling windows are aligned to the clock, so each timestamp belongs to exactly one: `floor` finds its start, and the end is start + size. Windows are usually half-open, [12:05, 12:10), so an event at exactly 12:10:00 starts the next window.",
    },
    {
      id: "offsets",
      kind: "code",
      title: "Offsets, crashes and double counting",
      brief:
        "`topic` is the log in arrival order. Write `consume(topic, state, batch_size=100, crash_after=None)`. From `state[\"offset\"]` it reads a batch, calls `process(batch, state)`, and only then commits by moving `state[\"offset\"]` forward. If `crash_after` equals the number of batches processed so far in this call, it raises `RuntimeError` **after** processing but **before** committing. Write `process` so that it adds each amount to `state[\"total\"]` only for event IDs it hasn't seen, and counts skipped repeats in `state[\"duplicates\"]`. Run it with a crash after batch 7, catch the error, then run it again to the end.",
      starterCode: `${EVENTS}
topic = events.to_dict("records")
state = {"offset": 0, "total": 0.0, "seen": set(), "duplicates": 0}


def process(batch, state):
    ...


def consume(topic, state, batch_size=100, crash_after=None):
    ...

`,
      checks: [
        { expr: "state['offset'] == len(topic) == 2000 and abs(state['total'] - events['amount'].sum()) < 1e-6", label: "Every event counted exactly once", failHint: "Skip events whose `event_id` is already in `state[\"seen\"]`." },
        { expr: "state['duplicates'] == 100", label: "The batch before the crash was re-read (100 repeats)", failHint: "Crash after processing batch 7 but before committing: the restart reads those 100 events again." },
        { expr: "(s := {'offset': 0, 'total': 0.0, 'seen': set(), 'duplicates': 0}) and (consume(topic[:250], s) or True) and s['offset'] == 250 and s['duplicates'] == 0 and abs(s['total'] - sum(e['amount'] for e in topic[:250])) < 1e-6", label: "A clean run reads everything once", failHint: "Loop while `state[\"offset\"] < len(topic)`; the last batch can be shorter." },
      ],
      hints: [
        "`batch = topic[state[\"offset\"]: state[\"offset\"] + batch_size]`",
        "Count batches with a local variable, and `raise RuntimeError(\"consumer crashed\")` when it equals `crash_after`.",
      ],
      why: "The crash came after batch 7 was processed but before its offset was committed, so the restarted consumer read those 100 events again. That is **at-least-once** delivery, the normal guarantee in streaming. Because `process` remembers event IDs, the repeats were ignored and the total is exact. Idempotent processing (or transactional sinks, which Kafka and Flink support) is what turns at-least-once into effectively exactly-once results.",
      solution: `${EVENTS}
topic = events.to_dict("records")
state = {"offset": 0, "total": 0.0, "seen": set(), "duplicates": 0}


def process(batch, state):
    for e in batch:
        if e["event_id"] in state["seen"]:
            state["duplicates"] += 1
            continue
        state["seen"].add(e["event_id"])
        state["total"] += e["amount"]


def consume(topic, state, batch_size=100, crash_after=None):
    batches = 0
    while state["offset"] < len(topic):
        batch = topic[state["offset"]: state["offset"] + batch_size]
        process(batch, state)
        batches += 1
        if crash_after == batches:
            raise RuntimeError("consumer crashed before committing")
        state["offset"] += len(batch)          # commit


try:
    consume(topic, state, crash_after=7)
except RuntimeError as e:
    print("crash:", e, "· committed offset", state["offset"])
consume(topic, state)
print("offset", state["offset"], "· total", state["total"], "· repeats skipped", state["duplicates"])`,
    },
    {
      id: "event-time",
      kind: "code",
      title: "Count by the right clock",
      brief:
        "Count the events in 5-minute tumbling windows twice: by `event_time` into `by_event`, and by `arrival_time` into `by_arrival`. Each is a Series indexed by window start, sorted. Store in `moved` how many events land in a different window depending on which clock you use.",
      starterCode: `${EVENTS}
print(events.head())
`,
      checks: [
        { expr: "by_event.sum() == 2000 and list(by_event.index) == sorted(by_event.index) and by_event.equals(events['event_time'].dt.floor('5min').value_counts().sort_index())", label: "Counts by event time", failHint: "`events[\"event_time\"].dt.floor(\"5min\").value_counts().sort_index()`" },
        { expr: "by_arrival.equals(events['arrival_time'].dt.floor('5min').value_counts().sort_index())", label: "Counts by arrival time", failHint: "The same, on `arrival_time`." },
        { expr: "moved == int((events['event_time'].dt.floor('5min') != events['arrival_time'].dt.floor('5min')).sum())", label: "Events that change window", failHint: "Compare the two floored columns row by row and sum the differences." },
      ],
      hints: ["`.dt.floor(\"5min\")` gives each timestamp's window start."],
      why: "The totals match, but 78 events sit in a different window depending on the clock: the long-delayed ones, plus events created seconds before a window boundary and received just after it. A dashboard counting by arrival time would show dips and spikes that never happened. Event time is the truth. It needs a rule for waiting, and that's the watermark.",
      solution: `${EVENTS}
by_event = events["event_time"].dt.floor("5min").value_counts().sort_index()
by_arrival = events["arrival_time"].dt.floor("5min").value_counts().sort_index()
moved = int((events["event_time"].dt.floor("5min") != events["arrival_time"].dt.floor("5min")).sum())
print(pd.DataFrame({"by_event": by_event, "by_arrival": by_arrival}).head(8))
print(moved, "events change window")`,
    },
    {
      id: "watermarks",
      kind: "code",
      challenge: true,
      title: "Windows that close themselves",
      brief:
        "Write `stream_windows(events, lateness)` that processes events **in arrival order**, as a streaming engine would. It adds each event to its 5-minute event-time window. The watermark is the latest event time seen so far minus `lateness`, and once it reaches a window's end, that window is emitted to `results` as a dict (`window`, `count`, `total`) and closed. An event whose window is already closed goes to `late`. At the end, emit any windows still open, in window order. Return `(results, late)`. Run it with 2 minutes of lateness into `results` and `late`.",
      starterCode: `${EVENTS}
SIZE = pd.Timedelta("5min")

`,
      checks: [
        { expr: "len(results) == 12 and [r['window'] for r in results] == sorted(r['window'] for r in results)", label: "Twelve windows emitted, in order", failHint: "Emit a window when `watermark >= window + SIZE`, then flush the rest at the end." },
        { expr: "sum(r['count'] for r in results) + len(late) == 2000 and len(late) == 42", label: "Every event either counted or late", failHint: "Keep a set of closed windows; an event for a closed window goes to `late`." },
        { expr: "late and all(e['event_time'].floor('5min') in {r['window'] for r in results} and e['arrival_time'] > e['event_time'].floor('5min') + SIZE for e in late)", label: "`late` holds the stragglers themselves", failHint: "Append the event itself (`e._asdict()`) to `late` when its window has already been emitted." },
        { expr: "len(stream_windows(events, pd.Timedelta('20min'))[1]) < len(late) and len(stream_windows(events, pd.Timedelta(0))[1]) > len(late)", label: "More lateness → fewer late events", failHint: "Use the `lateness` argument when computing the watermark." },
      ],
      hints: [
        "Loop over `events.itertuples()`; keep `open_windows = {}` of window → [count, total] and `closed = set()`.",
        "After adding an event, check every open window against the watermark.",
      ],
      why: "With two minutes' grace, 1,958 of the 2,000 events made it into their windows, and each window was published soon after it ended. The 42 stragglers came from phones that were offline for several minutes. With no grace at all, 55 are late; with 20 minutes, none are, but every result then waits 20 minutes. Real systems send such events to a side output, or let late data *update* a result already emitted. Either way, the choice is explicit, and you can measure it.",
      solution: `${EVENTS}
SIZE = pd.Timedelta("5min")


def stream_windows(events, lateness):
    open_windows, closed, results, late = {}, set(), [], []
    max_event_time = None
    for e in events.itertuples(index=False):
        window = e.event_time.floor("5min")
        if window in closed:
            late.append(e._asdict())
            continue
        count, total = open_windows.get(window, (0, 0.0))
        open_windows[window] = (count + 1, total + e.amount)
        max_event_time = e.event_time if max_event_time is None else max(max_event_time, e.event_time)
        watermark = max_event_time - lateness
        for w in sorted(open_windows):
            if watermark >= w + SIZE:
                c, t = open_windows.pop(w)
                results.append({"window": w, "count": c, "total": t})
                closed.add(w)
    for w in sorted(open_windows):
        c, t = open_windows[w]
        results.append({"window": w, "count": c, "total": t})
    return results, late


results, late = stream_windows(events, pd.Timedelta("2min"))
print(len(results), "windows ·", len(late), "late events")
print(pd.DataFrame(results).head())`,
    },
    {
      id: "explain-streaming",
      kind: "explain",
      title: "Batch or stream?",
      prompt:
        "A mobile-money company wants (a) a monthly revenue report for its board, and (b) to block payments that look like fraud. Which would you build as batch and which as streaming? What does the streaming one need to get right?",
      ideas: [
        { label: "Monthly report: batch (simple, cheap, can wait)", patterns: ["report.{0,40}batch", "batch.{0,40}(report|monthly|board)", "monthly.{0,40}batch"], nudge: "Does the board report need second-by-second updates?" },
        { label: "Fraud blocking: streaming (seconds matter)", patterns: ["fraud.{0,40}stream", "stream.{0,40}fraud", "real.?time", "seconds", "immediately"], nudge: "How fast must a fraudulent payment be caught?" },
        { label: "Event time, windows and watermarks / late or out-of-order events", patterns: ["event time", "window", "watermark", "late", "out of order", "out-of-order"], nudge: "What about events that arrive late or out of order?" },
        { label: "Offsets, crashes, at-least-once, idempotency / no double counting", patterns: ["offset", "crash", "at.least.once", "exactly.once", "idempot", "duplicate", "twice"], nudge: "What happens when the consumer crashes and restarts?" },
        { label: "Tools: Kafka / Flink / Spark Streaming", patterns: ["kafka", "flink", "spark", "kinesis", "pub/?sub"], nudge: "Which tools would you use?" },
      ],
      modelAnswer:
        "The board report is batch: it's needed once a month, can be computed overnight from the warehouse, and is easy to re-run and audit. Fraud blocking must be streaming, because a payment has to be scored within seconds, before the money moves. It would read payment events from a Kafka topic, with a Flink or Spark Streaming job computing features over short event-time windows, such as how many payments a phone has made in the last five minutes. Watermarks handle events that arrive late or out of order. The consumer commits offsets only after processing, so after a crash it re-reads some events (at-least-once). Processing has to be idempotent by event ID, so nothing is counted twice and no customer is flagged twice for the same payment.",
    },
  ],
};

export const deStreamingLabs: Lab[] = [deStreamingLab];
