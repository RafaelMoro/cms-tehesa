# Strapi Deployment Research

Research date: **2026-08-04**. All prices USD, `us-east-1`, 730 hrs/month, on-demand
unless stated. Every price carries a source link in [Sources](#sources); anything that
could not be confirmed is listed under [Unverified](#unverified).

**Recommendation: AWS Lightsail $12/mo instance (2 GB), `us-east-1`, running Strapi +
Postgres + Caddy via Docker Compose, with a nightly `pg_dump` to S3. All-in ≈ $12.05/mo.**

➡️ **To execute this recommendation, follow
[`lightsail-deployment-runbook.md`](./lightsail-deployment-runbook.md)** — step-by-step
implementation with ready-to-paste `Dockerfile`, `docker-compose.yml`, `Caddyfile`, config
diffs, backup script, and CI workflow.

---

## Context

This app has no deployment. There is no Dockerfile, no deploy job in CI, `config/plugins.ts`
is empty, and no Postgres driver is installed. Strapi Cloud was trialled on a paid tier and
worked — the data migration included — but was cancelled because the price wasn't justified
for a brand with no digital presence yet.

The decision is between **price** and **complexity**. AWS is the default because that is
where the in-house expertise sits, but cheaper alternatives were evaluated on equal terms —
including **Google Cloud Platform**, which was priced and compared structurally. GCP costs
**48% more for an identical architecture** ($17.88 vs $12.05) for reasons that are
structural rather than tunable; the detail is in
[AWS vs GCP](#aws-vs-gcp-what-actually-differs). Azure was not priced separately: it sits
between the two on cost with the same no-bundled-VPS structure as GCP, and Strapi documents
it officially — worth a look only if an Azure commitment already exists elsewhere.

Constraints taken as given:

- `us-east-1` is acceptable — no Mexico-latency requirement.
- **Postgres**, not SQLite. Strapi's documentation recommends Postgres or MySQL for
  production, and that recommendation is being followed. Saving a few dollars a month is not
  worth any risk to the service the customer sees.
- Postgres runs in Docker on the same box, not a managed service.
- Fewer than 10 people managing data in the first 6 months.
- **Writes are rare**: price updates roughly every 3 months or less often, plus the
  occasional product added or unpublished.
- **The REST API is not used.** The store reads through **GraphQL only, read-only**.
- Low public traffic — under 100 visits initially.

The low write frequency does not change the database engine, but it does decide the
managed-vs-self-hosted question further down: it is the main reason RDS's point-in-time
recovery is hard to justify at this stage.

---

## Why this app is cheaper to host than every Strapi guide assumes

These numbers were measured from disk in this repo, not estimated. They matter because
they disqualify most of the standard Strapi hosting advice, which is written for apps with
a media library and public browser traffic.

| Fact | Measured value | Consequence |
|---|---|---|
| `.tmp/data.db` | **8.4 MiB** | The smallest DB unit anyone sells is 10–20 GB. Every managed-DB option is ~1000× oversized. |
| Row counts | 18,088 variants (9,044 published), 666 products, 32 categories, 14 brands | The entire dataset fits in RAM with room to spare. |
| `public/uploads` | **empty** — `.gitkeep`, 0 bytes | **No S3 and no CloudFront needed.** |
| Media fields in the model | none on product or variant; only `global.favicon`, `shared.seo.shareImage`, and `shared.media` (about page) | Media stays near zero by design, not by accident. |
| Frontend coupling | `fe-tehesa` (Next.js 15) calls Strapi **server-side only** — Apollo with `STRAPI_HOST` / `STRAPI_API_TOKEN` inside `src/app/api/catalog/*` | Browsers never touch Strapi. Load ≈ one Next.js server plus ≤10 admins. Egress is negligible. |
| DB drivers installed | `better-sqlite3` 12.4.1 only — **`pg` is NOT installed** | Postgres needs one dependency added. `config/database.ts` already handles the client. |
| Node | `engines: >=20 <=24`, CI on Node 22 | arm64 / Graviton is safe, which is a flat 19% discount. |
| Strapi hardware floor | 2 GB RAM minimum, 4 GB recommended | 1 GB tiers are out. Note the spike is the **admin build**, not runtime. |
| Write frequency | Price updates every ~3 months; occasional add/unpublish | Backup windows are generous. A nightly dump loses nothing in practice. |
| API surface in use | GraphQL only, read-only. REST unused. | One endpoint to harden. Public role needs zero permissions. |
| Public traffic | <100 visits initially, absorbed by Next.js caching | Strapi sees a handful of requests a day, not a second. |

The frontend coupling is the most consequential line. Because Next.js queries Strapi
server-side and caches the results, Strapi is not on the critical path of a page view.
Public traffic could grow 100× without Strapi noticing.

---

## What this app actually needs

| Generic Strapi guide assumes | This app needs |
|---|---|
| CDN for media delivery | Nothing. There is no media. |
| Object storage for uploads | A local volume is enough; keep the door open for later. |
| Managed DB with point-in-time recovery | Postgres, self-hosted, with a nightly dump. |
| Load balancer + autoscaling | One box. There is no scaling event on the horizon. |
| 4 GB+ RAM | 2 GB, with the admin build handled deliberately. |
| Multi-AZ redundancy | A snapshot and a documented restore. |

The requirement list is short enough that the cheapest credible option and the most
appropriate option turn out to be the same one.

---

## Options evaluated

### AWS Lightsail — recommended

Lightsail is EC2 with bundled disk, bandwidth, and IP, sold at a flat monthly rate.

| Plan | RAM | vCPU | SSD | Transfer | $/mo |
|---|---|---|---|---|---|
| $5 | 0.5 GB | 2 | 20 GB | 1 TB | $5 |
| $7 | 1 GB | 2 | 40 GB | 2 TB | $7 |
| **$12** | **2 GB** | **2** | **60 GB** | **3 TB** | **$12** ← Strapi minimum |
| $24 | 4 GB | 2 | 80 GB | 4 TB | $24 ← Strapi recommended |

| Line item | Cost |
|---|---|
| Lightsail $12 instance (2 GB) | $12.00 |
| Static IP (free while attached) | $0.00 |
| Disk (60 GB bundled) | $0.00 |
| Egress (3 TB bundled) | $0.00 |
| Postgres (Docker, same box) | $0.00 |
| S3 for nightly `pg_dump` | ~$0.05 |
| **Total** | **$12.05/mo** |

The $5 and $7 tiers sit below Strapi's documented 2 GB minimum. $12 is the real entry point.

Running Strapi and Postgres together on 2 GB works: Postgres with ~256 MB of shared buffers
against an 8 MiB dataset is a small resident process, and Strapi idles around 400–600 MB.
The tight moment is the **admin panel build**, not steady state — handled in Phase 1 with a
swapfile, and moved to CI in Phase 2.

- **Setup complexity: 2/5.** One instance, one console, Docker Compose on top.
- **Backups:** built-in Lightsail snapshots plus the `pg_dump` cron. Restores are one click.
- **Scaling ceiling:** vertical only — $24 gets 4 GB, $44 gets 8 GB. Beyond that you move to
  EC2 + RDS, and the Docker Compose file comes with you.
- **Lock-in:** essentially none. It's an Ubuntu box running containers.
- **Caveat:** Lightsail is **not available in `mx-central-1`**. Confirmed against the
  June 2026 region list. Irrelevant given `us-east-1` was accepted, but it is the reason the
  region question mattered.

For contrast, adding Lightsail's managed database costs **$15/mo** (1 GB, 40 GB SSD),
taking the total to **$27/mo** — more than doubling the bill to manage an 8 MiB database.

### EC2 + Docker Compose Postgres

Same architecture, assembled by hand.

| Line item | t4g.small (2 GB) | t4g.medium (4 GB) |
|---|---|---|
| EC2 on-demand | $12.26 | $24.53 |
| EBS gp3 40 GB | $3.20 | $3.20 |
| Public IPv4 ×1 | $3.65 | $3.65 |
| EBS snapshots (~10 GB) | ~$0.50 | ~$0.50 |
| **Total** | **$19.61** | **$31.88** |
| With 1-yr RI, no upfront | $15.02 | $22.75 |
| **With t4g.small free trial** | **$7.35** | — |

**The free trial is real and worth understanding.** AWS offers **t4g.small free for
750 hrs/month through 2026-12-31**, for new *and existing* accounts, in `us-east-1` among
others. 750 hrs covers a 730-hr month completely, so one instance runs free.

That makes this the cheapest option today at **$7.35/mo** — and **$19.61/mo on
2027-01-01**, a 2.7× jump that lands precisely when nobody is thinking about it. Choosing
this over Lightsail saves about **$24 total** over the five months to the cliff, then costs
$7.56 more every month afterwards, while requiring you to assemble the disk, IP, firewall,
and snapshot policy yourself that Lightsail bundles.

- **Setup complexity: 3/5.** VPC, security groups, EBS, Elastic IP, snapshot lifecycle.
- **Scaling ceiling:** the full EC2 ladder — genuinely unlimited, which you don't need.

### EC2 + RDS — the community-guide path

This is the path in the Strapi community AWS guide.

| Line item | t4g.small | t4g.medium |
|---|---|---|
| EC2 on-demand | $12.26 | $24.53 |
| EBS gp3 30 GB | $2.40 | $2.40 |
| Public IPv4 ×1 | $3.65 | $3.65 |
| RDS db.t4g.micro (Postgres, single-AZ) | $11.68 | $11.68 |
| RDS gp3 20 GB | $2.30 | $2.30 |
| RDS backups (free to 100% of storage) | $0.00 | $0.00 |
| **Total** | **$32.29** | **$44.56** |
| With 1-yr RI, no upfront | $24.78 | $32.51 |

**Delta vs Docker Postgres: +$12.68/mo, a 65% premium**, to manage a database that is
0.04% of the smallest volume RDS will sell you.

What that premium buys is real and worth naming: point-in-time recovery to the second,
one-click minor-version upgrades, and a failure domain separate from the app. All three are
worth paying for at some scale.

The reason to defer it here is write frequency, not database size. **PITR protects the work
done since the last backup.** With price updates every three months, the work done since
last night's dump is almost always nothing. RDS becomes the right answer the moment editing
becomes frequent enough that losing a day of it would hurt — which is a trigger in
[Phase 3](#phase-3--scale-when-triggered), not a "never".

Worth noting for later: RDS automated backups are genuinely free here (the allowance is
100% of provisioned storage, and you will never exceed 20 GB of backups). But $0.50/mo of
backup savings is not an argument for a $13.98/mo service.

### ECS Fargate + RDS

0.25 vCPU / 0.5 GB is below Strapi's minimum. A realistic task is 1 vCPU / 2 GB on ARM.

| Line item | With ALB | No ALB |
|---|---|---|
| Fargate ARM 1 vCPU / 2 GB, 24/7 | $28.84 | $28.84 |
| ALB hourly | $16.43 | — |
| ALB LCU (low traffic, est.) | ~$2.00 | — |
| Public IPv4 | $7.30 | $3.65 |
| RDS db.t4g.micro + 20 GB | $13.98 | $13.98 |
| **Total** | **~$68.55** | **~$46.47** |

**The ALB alone is ~$24/mo before a single request.** You can skip it by giving the task a
public IP and a DNS record, but the IP changes on every restart, so you own a DNS-update
Lambda and your own cert renewal — real operational cost to save $20/mo.

Also note: a task in a private subnet needs a NAT Gateway (+$33/mo) or VPC endpoints.
Keep it in a public subnet.

**Rejected: 4–6× the price for elasticity this workload will never use.**

### AWS App Runner

**App Runner does not scale to zero.** The default is one provisioned instance; you pay its
memory 24/7 and vCPU only while requests are being processed.

| Line item | Optimistic (~60 active hr/mo) | Always active |
|---|---|---|
| Provisioned memory 2 GB × 730 hr | $10.22 | $10.22 |
| Active vCPU | $3.84 | $46.72 |
| Auto-deployment fee | $1.00 | $1.00 |
| Build minutes | ~$0.50 | ~$0.50 |
| RDS db.t4g.micro + storage | $13.98 | $13.98 |
| **Total** | **~$29.54** | **~$72.42** |

The optimistic column is probably fiction: there is a **1-minute minimum vCPU charge every
time a provisioned instance handles a request**, and an open Strapi admin tab polls. Ten
scattered requests an hour bills close to full active time.

**The idle floor is $10.22/mo and never goes lower.** Storage is ephemeral, so S3 uploads
become mandatory.

**Rejected: more expensive than Lightsail, more moving parts than EC2, and its one selling
point does not exist.**

### Strapi Cloud

Already trialled here on a paid tier. The migration worked; the price didn't justify itself.

| | Starter $35 | Pro $90 | Business $450 |
|---|---|---|---|
| Annual price | $29/mo | $75/mo | $373/mo |
| API requests/mo | 100,000 | 1,000,000 | 10,000,000 |
| Asset storage | 50 GB | 250 GB | 1,000 GB |
| Asset bandwidth | 50 GB | 500 GB | 1,000 GB |
| Backups | **none** | Weekly (1-mo retention) | Daily (1-mo retention) |
| Runtime | **Sleeps when idle** | Always on | Always on |
| Environments | none | 0 included | 1 included |

Overages: API +$1.50 per 25k requests, bandwidth +$30 per 100 GB, storage +$0.60/GB/mo,
extra environments $60/mo.

Seats are **not** limited on Cloud plans — one Owner plus unlimited Maintainers — so the
10-admin requirement is free here. That is the one place Strapi Cloud is genuinely generous.

Two facts that decide it:

1. **Starter has no backups and sleeps when idle.** The sleeping matters less than it first
   appears — Next.js serves stale content while revalidating, so a cold start delays a
   background refresh rather than a page view. **No backups is the real problem.** Losing
   the catalog would mean re-running the seed scripts against `../../tehesa-products/data`
   and redoing every price edit since. The first tier that is always-on *with* backups is
   **Pro at $90/mo** — 7.5× the recommendation.
2. **The free plan is gone.** Removed for new signups on 2026-07-01; all existing free
   projects are **deleted on 2026-09-01**. Not a risk here since the trial project was paid
   and already cancelled, but it removes "park it on free" as an option.

**Rejected on price.** $35/mo for a sleeping instance with no backups, versus $12.05/mo for
an always-on box with snapshots and a nightly dump.

### Google Cloud Platform

Priced `us-central1`, 730 hrs, 2026-08-04. Full AWS↔GCP structural comparison is in
[its own section](#aws-vs-gcp-what-actually-differs) below; this covers price only.

Three price inputs decide everything here, and two of them contradict widely-repeated advice:

- **E2 machine types receive no Sustained Use Discount.** Google's SUD documentation lists
  N1, N2, N2D, C2, M1, M2 and sole-tenant nodes as eligible — **E2 is absent**, because it is
  already priced low. E2 is exactly the family you would pick at this budget, so the
  "GCP discounts automatically, AWS needs a commitment" advantage **does not apply here**.
  A 24/7 e2-small pays full list price.
- **Arm is not a discount on GCP.** `t2a-standard-1` ($28.11) and `c4a-standard-1` ($32.78)
  cost *more* than `e2-medium` ($24.46) for the same 4 GB — the opposite of Graviton on AWS,
  where `t4g` is a flat 19% cheaper than `t3`.
- **External IPv4 costs $3.65/mo**, the same as AWS. Lightsail bundles it free, so this
  single line is 30% of the Lightsail bill.

**Compute Engine + Postgres in Docker** — the direct Lightsail equivalent:

| Line item | e2-small (2 GB) | e2-medium (4 GB) |
|---|---|---|
| VM, 730 hr | $12.23 | $24.46 |
| 20 GB pd-balanced | $2.00 | $2.00 |
| External static IPv4 (in use) | $3.65 | $3.65 |
| Egress (Standard tier, 200 GB/mo free) | $0.00 | $0.00 |
| **Total** | **$17.88** | **$30.11** |
| With 1-yr committed use discount | $13.35 | $21.06 |
| With 3-yr committed use discount | $11.15 | $14.66 |

Swapping to 30 GB `pd-standard` drops e2-small to **$17.08** — legitimate here, since an
8 MiB database lives entirely in page cache and never touches the disk for reads.

Also switch the VM to **Standard network tier**, which includes 200 GB/mo of free egress per
region. The default Premium tier gives only the 1 GB Always Free allowance, then charges
$0.12/GB. At this traffic both are $0, but Standard removes the risk entirely and the
latency difference is irrelevant for a CMS edited quarterly.

**Compute Engine + Cloud SQL** — the RDS equivalent. Note `db-f1-micro` is **not**
deprecated; it remains available on Cloud SQL Enterprise, though it is excluded from the
Cloud SQL SLA and from committed use discounts:

| Line item | Cost |
|---|---|
| e2-small VM | $12.23 |
| 20 GB pd-balanced | $2.00 |
| External static IPv4 | $3.65 |
| Cloud SQL `db-f1-micro` (Enterprise, Postgres) | $7.67 |
| Cloud SQL 10 GB SSD (minimum) | $1.70 |
| Backups | $0.01 |
| **Total** | **$27.26** |

Cheaper than EC2 + RDS ($32.29) by $5 — but still 2.3× Lightsail to manage a database that
would fit in an email attachment. Cloud SQL has **no free tier** (there is a one-per-project
30-day trial instance).

**Cloud Run + Cloud SQL** — GCP's flagship, and the only place GCP undercuts Lightsail:

| Config | Cloud Run | Cloud SQL | Artifact Registry | **Total** |
|---|---|---|---|---|
| min-instances=0 (scales to zero) | $0.00 (inside free tier) | $9.38 | $0.05 | **$9.43** |
| min-instances=1, 1 vCPU / 2 GiB, request-based | $18.36 | $9.38 | $0.05 | **$27.79** |
| min-instances=1, instance-based ("CPU always allocated") | $52.59 | $9.38 | $0.05 | **$62.02** |

Cloud Build's free 2,500 build-minutes/month cover this app's image builds at $0.

Use request-based billing if you go this route — idle min-instances bill at a reduced rate,
which is the difference between $27.79 and $62.02.

**The scale-to-zero number is real but the service is not.** A Strapi 5 container is
reported at **~100 seconds to cold start** ([strapi#21283](https://github.com/strapi/strapi/issues/21283));
Startup CPU Boost trims perhaps 30%. Cloud Run's 300 s request timeout means it won't error
— it will just hang for over a minute on the first admin click after idle. Two further
frictions: Cloud Run custom domain mapping is **still labelled preview** and "not recommended
for production due to latency", with a load balancer (~$18–25/mo) as the official
alternative; and uploads would need GCS FUSE volume mounts rather than a plain disk.

**GKE Autopilot**, priced only to reject it: ~$32.77/mo (pod compute + Cloud SQL, with the
$74.40 cluster credit absorbing the $73 control-plane fee). Kubernetes overhead to run one
container edited four times a year.

**Mexico region** (`northamerica-south1`) exists, at roughly a **9% premium**: the e2-small
stack costs $19.19 vs $17.88 in us-central1. Unlike Lightsail — which has no Mexico presence
at all — GCP would let you host in-country for $1.31/mo more. Worth knowing if the latency
requirement ever changes.

**Verdict: GCP costs 48% more than Lightsail for an identical architecture** ($17.88 vs
$12.05), and the gap is structural rather than something you can tune away. See the next
section for why.

### Non-AWS options

| Option | Realistic $/mo | Complexity | Persistent disk | Notes |
|---|---|---|---|---|
| **Hetzner CX23 + Docker** | **$6.90** | 4/5 | Yes | 2 vCPU / 4 GB / 40 GB / 20 TB. Cheapest credible option, better specs than Lightsail $12. |
| Hetzner + Coolify | $6.90–$10.40 | 3/5 | Yes | Coolify is free self-hosted; turns the box into a git-push PaaS. |
| **DigitalOcean $12 Droplet** | **$12** (+$2.40 backups) | 3/5 | Yes | 2 GB / 1 vCPU / 50 GB / 2 TB. Has a 1-click Strapi image and the best docs of any target. |
| **Railway Hobby** | **$10–20** | 2/5 | Yes (volumes) | Per-second billing, no idle markup. Least ceremony per dollar. |
| Render Starter + Basic-256mb PG | ~$16 | 2/5 | Yes (paid only) | Official Strapi guide exists. Attaching a disk disables zero-downtime deploys. |
| Fly.io + external Postgres | ~$10–15 | 3/5 | Yes | Fly Managed Postgres is $38/mo — skip it, pair with Neon instead. |
| Heroku Basic + Essential-0 | $12 | 2/5 | **No** | Ephemeral FS, dynos restart daily. S3 mandatory. |
| DO App Platform + Managed PG | ~$32 | 2/5 | **No** | No volume support at all. |
| **Vercel / Netlify** | **N/A** | — | **No** | **Cannot host Strapi.** See below. |

**Hetzner is the honest cost winner** — $6.90/mo for 4 GB and 20 TB of traffic, roughly half
Lightsail's price for better specs. It is not recommended here for two reasons: it is
outside the team's AWS expertise, and **Hetzner raised prices four times in 2026**, most
recently ~30% on 15 June (CX23 went €2.99 → €3.99 → €5.49). The $5/mo saving is real but
small against the cost of running infrastructure nobody on the team knows.

**Railway is the strongest "don't own an OS" option** at roughly $12/mo — the same price as
the recommendation, with per-second billing that suits a CMS busy a few hours a year. It's a
reasonable substitute if the appetite for server administration is zero. Mount the volume at
`/app/public/uploads`; the `/app` prefix is required. Note its Postgres is a container you
run, not a managed service with PITR — the same trade as the recommendation.

**Vercel and Netlify cannot host Strapi.** Three independent blockers, any one fatal:

1. **No long-running process.** Both run stateless per-request functions. Strapi is a Koa
   server that boots a plugin registry, DB pool, cron, and lifecycle hooks at startup — a
   10–30 s boot amortized over one process, not paid per invocation. Netlify caps functions
   at 10 s (26 s on Pro).
2. **No persistent writable filesystem.** Strapi writes to `public/uploads` and `.tmp/`.
3. **Connection pool thrash.** Every cold function instance opens its own Postgres pool and
   the database dies of connection exhaustion.

Anything you read about "Strapi on Vercel" means the *frontend* on Vercel — which is exactly
where `fe-tehesa` belongs.

### Neon / Supabase as a managed Postgres

Not chosen, but recorded because "free managed Postgres" is the obvious temptation and Neon
has a trap specific to this repo.

**Neon's free tier will not work with this repo unmodified.** Free gives 100 CU-hours/month
with scale-to-zero after 5 minutes idle, and scale-to-zero **cannot be disabled on Free**.
But `config/database.ts:23` sets `pool: { min: env.int('DATABASE_POOL_MIN', 2), max: 10 }`
— a pool minimum of 2 **holds two connections open permanently**, so Neon never idles down.
You would burn 730 CU-hours against a 100 CU-hour quota and be suspended in about four days.

The fix is `DATABASE_POOL_MIN=0` — the env var already exists, no code change — and then
accepting a 500 ms–2 s cold start on the first request after idle. Paid Neon Launch with
scale-to-zero disabled runs about $19/mo, which loses to running Postgres on a box you are
already paying for.

**Supabase** free pauses projects after 7 days without API requests, requiring a manual
dashboard resume. Pro is $25/mo, which also loses to the $12 box.

---

## AWS vs GCP: what actually differs

Cost tables answer "which is cheaper today". This section answers "what am I actually
choosing between", which is the question that matters if the price gap is small.

### Discount models — the difference that isn't one

The standard argument for GCP is that **Sustained Use Discounts apply automatically with no
commitment**, while AWS requires a 1–3 year Reserved Instance or Savings Plan. That's true
in general and irrelevant here.

| Family | Max automatic SUD on a 24/7 VM |
|---|---|
| N1, M1, M2, sole-tenant | 30% |
| N2, N2D, C2 | 20% |
| **E2, C3, C4, T2D** | **0% — not eligible** |

E2 is the family you'd choose at this budget, and Google excludes it explicitly because E2 is
already priced low. To collect the automatic 30% you'd have to deliberately pick N1 — an
older family with a higher list price — and end up roughly where you started.

For commitments, AWS is the stronger instrument: Compute Savings Plans reach ~66% (1 yr) and
apply across EC2, Fargate and Lambda, versus GCP resource CUDs at ~37% locked to a machine
family and region.

> **What this means here:** ignore all of it. At one VM you will not sign a multi-year
> commitment, and GCP's automatic advantage evaporates on E2. **Not a reason to switch.**

### Egress and IPv4 — a wash

| | AWS | GCP Premium (default) | GCP Standard |
|---|---|---|---|
| Free egress/mo | **100 GB**, all regions, permanent | ~none (1 GB via Always Free) | **200 GB per region** |
| Rate after | $0.09/GB | $0.12/GB | $0.085/GB |
| Public IPv4, in use | $0.005/hr = $3.65/mo | $0.005/hr = $3.65/mo | same |
| IPv4 reserved but idle | $0.005/hr (same) | **$0.010/hr = $7.30/mo** | same |

GCP's 200 GB is larger in absolute terms but requires opting into Standard tier at
creation time — a decision an AWS person won't know to make. AWS's 100 GB applies to the
default path with no choice required.

> **What this means here:** both are $0 at this traffic. IPv4 is identical on both.
> One GCP footgun to know: reserve a static IP, delete the VM, forget the IP — you now pay
> double for nothing.

### Hidden line items — where GCP genuinely wins

| | AWS | GCP |
|---|---|---|
| NAT for one private VM | **NAT Gateway $32.85/mo** + $0.045/GB | **Cloud NAT ~$1.02/mo** + $0.045/GiB |
| Cheapest managed load balancer | ALB $16.43/mo + LCUs (~$22 realistic) | $18.25/mo (first 5 forwarding rules) + $0.008/GiB |
| Managed TLS cert without an LB | not possible (ACM needs ALB/CloudFront) | not possible (Google certs attach to LBs only) |
| Bill shape for one VM + one small DB | fewer rows, one huge surprise | more rows (vCPU and RAM billed as separate SKUs), no surprises |

**The NAT gap is the single largest structural difference in this entire comparison.** AWS's
NAT Gateway is a flat $32.85/mo — more than this project's entire budget — which is why a
"proper" private-subnet architecture is simply unaffordable on AWS at this size. GCP's Cloud
NAT starts around $1/mo for one VM.

Both clouds let you avoid the load balancer entirely by running Caddy on the box with Let's
Encrypt, which is what this plan does.

> **What this means here:** neither NAT nor an LB is in the recommended design, so the win is
> theoretical. It becomes real the day someone asks for the VM to have no public IP — cheap
> on GCP, budget-breaking on AWS.

### Free tier

| | GCP | AWS (accounts after 2025-07-15) |
|---|---|---|
| Signup credit | $300, 90 days | $100 + up to $100 from activities |
| Perpetual free compute | **e2-micro forever** (us-west1/central1/east1) | none |
| Account fate | converts to paid; Always Free continues indefinitely | **Free plan auto-closes the account at 6 months** |
| Free managed database | **none** | none (the 12-month RDS offer is gone) |

> **What this means here:** GCP's free tier is decisively more generous — a permanent free VM
> versus a countdown to account deletion. But it's a red herring for this project: the
> e2-micro has **1 GB RAM**, below Strapi's 2 GB minimum, and neither cloud gives you a free
> managed database.

### SLA — a real GCP advantage

| | Single instance | Multi-zone |
|---|---|---|
| AWS EC2 | **99.5%** (~3.6 hrs/mo) | 99.99% |
| GCP Compute Engine | **99.9%** (~43 min/mo) | 99.99% |

This deployment is by definition a single instance, so the single-instance SLA is the only
one that applies — and GCP's is 7× tighter on permitted downtime. Neither cloud offers an
SLA on the cheap database config: RDS Single-AZ has no formal uptime SLA, and Cloud SQL
explicitly excludes shared-core tiers.

### Operations, for someone fluent in AWS

- **Projects vs accounts.** A GCP Project ≈ an AWS Account, but free and disposable —
  deleting the project deletes everything in it. Genuinely nicer for cleanup.
- **IAM is simpler but inherits.** GCP bindings are `(principal, role, resource)` — far less
  expressive than AWS JSON policy documents, and far less to get wrong. But permissions
  inherit downward through Organization → Folder → Project, which AWS has no equivalent to.
- **Firewall rules beat security groups** for one box: VPC-level, priority-ordered, target
  instances by network tag, and support explicit **deny** (so one object does the work of
  both a security group and a NACL).
- **The surprise nobody warns you about:** every API must be explicitly enabled per project
  (`gcloud services enable compute.googleapis.com`) before anything works.
- **Billing killswitch.** GCP has a documented Budget → Pub/Sub → Cloud Function pattern that
  detaches the billing account and hard-stops all paid services. AWS Budget Actions can stop
  instances but **cannot detach billing**. For a small project where a runaway bill is the
  main financial risk, this is a meaningful difference.
- `gcloud` is widely considered better-designed than `aws`; `aws` wins on breadth and on the
  sheer volume of existing answers.

Realistic learning curve to deploy one VM and one database: **hours, not days.**

### Strapi-specific support — AWS wins clearly

- **Strapi ships official deployment guides for AWS, Azure, DigitalOcean App Platform and
  Heroku. There is no official GCP guide.** The only one Strapi ever published was for App
  Engine, and it lives in the archived v3 docs.
- Community Strapi-on-GCP content targets **v3 and v4. Nothing covers Strapi 5.**
- **Strapi's docs explicitly name Cloud SQL as unsupported.** Verbatim from
  `docs.strapi.io/cms/deployment`: *"Strapi does not support MongoDB (or any NoSQL
  databases), nor does it support any 'Cloud Native' databases (e.g., Amazon Aurora, Google
  Cloud SQL, etc.)."*

That last point deserves proportion. Cloud SQL for PostgreSQL *is* vanilla Postgres over the
standard wire protocol, and community deployments work fine. But it is an official
"unsupported" statement you would be deploying against, and it removes your support recourse
if something does break. It also applies to Amazon Aurora — and it is one more argument for
Postgres-in-Docker on **either** cloud, which is already the recommendation.

### Lock-in — near zero either way

Docker Compose on a VM is essentially portable. What would leak if you moved:

1. **Credentials.** The AWS SDK picks up an instance role silently from EC2 metadata; GCP
   uses Application Default Credentials and a service account. If uploads ever move to S3,
   you'd swap the upload provider plugin. Biggest single leak — and currently moot, since
   there are no uploads.
2. **Cloud SQL Auth Proxy.** The idiomatic way to reach Cloud SQL is a proxy sidecar; RDS is
   plain `host:port`. A container added going in, removed coming out.
3. Startup scripts (`user-data` vs `startup-script`), snapshot tooling, DNS, firewall rules —
   all declarative, rewritten in an hour.

For an 8 MiB database, migrating between RDS and Cloud SQL is `pg_dump | pg_restore` in a
maintenance window. Google's Database Migration Service exists but is overkill at this size.

> **What this means here:** the decision is cheap to reverse. That argues for staying where
> the expertise already is, and revisiting only if something concrete changes.

### Verdict

**GCP is not cheaper for this shape, and the reasons are structural**: no bundled VPS
product, no sustained-use discount on the family you'd pick, and the same IPv4 tax that
Lightsail absorbs. $17.88 vs $12.05 is a 48% premium for an identical architecture.

GCP's real advantages — cheap Cloud NAT, a tighter single-instance SLA, a perpetual free
micro VM, a billing killswitch — are either irrelevant to this design or too small to justify
learning a second cloud while Strapi documents AWS officially and GCP not at all.

**Two GCP configurations do beat $12.05**, and both fail the standard already set for this
project — that cost savings must not degrade what the customer experiences:

- **Cloud Run scale-to-zero at $9.43/mo** — ~100 s cold start on a Strapi container. The
  admin panel hangs for over a minute on first use after idle.
- **e2-micro Always Free at $0–3.65/mo** — 1 GB RAM, below Strapi's documented minimum, with
  an admin build that reliably OOMs.

Rejecting both on that basis is the same reasoning that chose Postgres over SQLite.

---

## Full comparison

Ranked by monthly cost. Complexity is 1 (fully managed) to 5 (you own the OS).
All rows run Postgres.

| Option | $/mo now | $/mo Jan 2027 | Complexity | Scaling ceiling | Lock-in |
|---|---|---|---|---|---|
| GCP Cloud Run min=0 + Cloud SQL | $9.43 | $9.43 | 3 | Automatic | Moderate |
| Hetzner CX23 + Docker | $6.90 | $6.90 | 4 | Vertical, then manual | None |
| EC2 t4g.small + Docker PG | **$7.35** | $19.61 | 3 | Full EC2 ladder | None |
| **Lightsail $12 + Docker PG** | **$12.05** | **$12.05** | **2** | Vertical to 8 GB, then EC2 | **None** |
| DigitalOcean $12 Droplet | $14.40 | $14.40 | 3 | Vertical, then manual | None |
| Railway Hobby | $10–20 | $10–20 | 2 | Automatic | Low |
| Render Starter + Basic PG | ~$16 | ~$16 | 2 | Vertical, click | Low |
| **GCP e2-small + Docker PG** | **$17.88** | **$17.88** | 3 | Full GCP ladder | None |
| GCP e2-small + Docker PG (Mexico) | $19.19 | $19.19 | 3 | Full GCP ladder | None |
| Lightsail $12 + managed DB | $27.00 | $27.00 | 2 | Vertical | Low |
| GCP e2-small + Cloud SQL | $27.26 | $27.26 | 3 | Full GCP ladder | Low |
| GCP Cloud Run min=1 + Cloud SQL | $27.79 | $27.79 | 3 | Automatic | Moderate |
| EC2 t4g.small + RDS | $32.29 | $32.29 | 3 | Full AWS ladder | Low |
| GCP GKE Autopilot + Cloud SQL | $32.77 | $32.77 | 5 | Automatic | Moderate |
| Strapi Cloud Starter | $35.00 | $35.00 | 1 | Tier upgrade | Moderate |
| Fargate + RDS (no ALB) | $46.47 | $46.47 | 4 | Automatic | Moderate |
| Fargate + RDS + ALB | $68.55 | $68.55 | 4 | Automatic | Moderate |
| Strapi Cloud Pro | $90.00 | $90.00 | 1 | Tier upgrade | Moderate |

Two rows carry an asterisk the numbers don't show. **GCP Cloud Run min=0 at $9.43** is the
second-cheapest option on this table and would be genuinely attractive if not for the ~100 s
Strapi cold start. **Hetzner at $6.90** is the cheapest and is rejected on expertise-fit and
price volatility, not on capability.

### Cost over time

Five-year totals, ignoring price changes:

| Option | Year 1 | Year 3 | Year 5 |
|---|---|---|---|
| **Lightsail $12 + Docker PG** | **$145** | **$434** | **$723** |
| EC2 t4g.small + Docker PG | $174 (5 trial months, then full rate) | $645 | $1,115 |
| EC2 t4g.small + RDS | $388 | $1,162 | $1,937 |
| Strapi Cloud Starter | $420 | $1,260 | $2,100 |
| Strapi Cloud Pro | $1,080 | $3,240 | $5,400 |

Over five years, Lightsail + Docker Postgres costs **$1,214 less than EC2 + RDS** and
**$4,677 less than Strapi Cloud Pro**.

### Non-obvious cost facts

- **Every public IPv4 address costs $3.65/mo**, Elastic IPs included, whether attached or
  not. Lightsail bundles it free while attached. This line surprises people building EC2
  cost estimates.
- **The 12-month free tier is gone** for accounts created after 2025-07-15. New accounts get
  $100 on signup plus up to $100 more for completing activities. The "Free plan"
  **auto-closes the account after 6 months** — choose the **Paid plan** so the account
  survives and let the credits absorb the early months.
- **Graviton (`t4g`) is a flat −19.2% vs `t3`** at identical vCPU and RAM. Node 22 is
  arm64-clean. There is no reason to run x86 here.
- **Reserved Instances save 37% on EC2** (1-yr, no upfront) but lock the shape for a year.
  At a $20 bill that is $7/mo — worth doing only once the architecture has settled.

---

## Your questions, answered

**What EC2 instance is enough for Strapi?**

`t4g.small` — 2 vCPU, 2 GB, $12.26/mo. That matches Strapi's documented 2 GB minimum. The
constraint is not runtime; Strapi idles around 400–600 MB and Postgres against an 8 MiB
dataset needs roughly 256 MB of shared buffers. The constraint is the **admin panel build**,
which is a known OOM source on 2 GB boxes. Two ways around it: add a 2 GB swapfile and build
on the box, or build the image in CI and ship the artifact. Go `t4g.medium` (4 GB, $24.53)
if you want the question to simply not come up.

Use `t4g`, not `t3` — same specs, 19% cheaper.

**How do you upload the DB to RDS?**

Not with a SQL dump. Use **`strapi transfer`**, which operates at the entity level rather
than the SQL level, so it crosses SQLite → Postgres cleanly. It is already proven to work
in this project from the Strapi Cloud trial.

```bash
# once Strapi is running against an empty Postgres
npx strapi transfer --from <local-url> --to <remote-url>
```

The same command is how you'd later move from Docker Postgres to RDS — the source and
destination are both Strapi instances, so the underlying engine is not your problem.

Do **not** use the seed scripts as the migration path: `npm run seed:start` and
`npm run seed:products` read from `../../tehesa-products/data`, a sibling directory that
will not exist on the server.

**How do you manage backups?**

Layered, and cheap because the data is 8 MiB:

1. **Nightly `pg_dump | gzip` to S3** via cron. An 8 MiB database gzips to well under 1 MB;
   30 days of retention costs about $0.01/mo. This is the backup that actually matters,
   because it is portable — it restores to any Postgres anywhere, including RDS later.
2. **Lightsail snapshots** (or EBS snapshots on EC2) for the whole box, so you recover the
   OS and configuration, not just data.
3. **The repo itself** is a backup of the content model — schema JSON is the source of truth.

Given edits happen quarterly, a nightly dump means the realistic worst case is losing
nothing at all. That is the specific reason RDS's point-in-time recovery is deferred rather
than dismissed.

Test the restore once. An untested backup is a rumor.

**Do we need CloudFront?**

**No.** You were right. CloudFront fronts S3 for media delivery, and this app has no media:
`public/uploads` is empty, and neither `product` nor `product-variant` has a media field.
Only `global.favicon`, `shared.seo.shareImage`, and the about page's `shared.media` can hold
files at all.

Beyond that, the frontend queries Strapi **server-side** and caches the results, so there is
no browser traffic to Strapi to accelerate in the first place. If media ever arrives, S3 +
CloudFront for a few hundred MB costs about **$0.03/mo** — add it then.

**If we do the Docker option on EC2, what are the cost implications?**

You **save** $12.68/mo — Docker Postgres on the same box is $19.61 vs $32.29 for EC2 + RDS,
a 39% cut. The savings come from dropping the $11.68 RDS instance and $2.30 of RDS storage,
against roughly $1.30 more disk and snapshot on the EC2 side.

Docker itself adds no cost. It is a packaging choice, not a billing line — the same
instance, the same disk. What it changes is where your time goes: you own the base image and
the Compose file, in exchange for a deploy that behaves identically on your laptop and the
server.

The real costs of self-hosting Postgres are operational, not financial:

- You own Postgres minor-version upgrades, tuning, and monitoring.
- **No point-in-time recovery** — you have last night's dump, not last second's.
- App and database share a failure domain. One bad `docker compose down -v` takes both.
- The box needs enough RAM for both. 2 GB works, with the admin build handled via swap or CI.

At quarterly edit frequency, "last night's dump" and "the current state" are almost always
identical, which is what makes this trade sound today. It stops being sound the moment
editing becomes frequent enough that losing a day of it would hurt.

---

## Securing the GraphQL surface

Because GraphQL is the only API in use and it is read-only, the attack surface is small —
but `config/plugins.ts` is currently `export default () => ({})`, so the GraphQL plugin is
running entirely on defaults. Three things to set before this is public.

**1. Bound query depth and result size.** A GraphQL endpoint with no depth limit is a
denial-of-service vector: nested relations can be recursed to build an enormous query from
a single small request. Products relate to variants relate back to products, so the cycle
exists in this schema.

```ts
// config/plugins.ts
export default () => ({
  graphql: {
    config: {
      defaultLimit: 25,
      maxLimit: 100,        // matches config/api.ts
      depthLimit: 7,
      apolloServer: {
        introspection: false,
      },
    },
  },
});
```

`depthLimit` defaults to 10; 7 is comfortably above anything this schema needs. `maxLimit`
mirrors the REST setting already in `config/api.ts` so the two surfaces agree.

**2. Disable introspection in production.** Strapi disables the GraphQL playground in
production automatically, but introspection is a separate setting. There is no reason to
publish the full schema when exactly one consumer exists and it is your own frontend.

**3. Leave the public role with zero permissions.** The frontend authenticates with
`STRAPI_API_TOKEN`, so nothing needs anonymous access. Mint that token as **read-only**
scoped to the content types the store actually reads.

That last point has a corollary worth stating plainly: **you cannot turn REST off
separately.** Strapi's REST and GraphQL layers share one permission system, so granting
`find` enables both. With the public role empty and a read-only token, neither surface
exposes anything you didn't intend. If REST being reachable at all is unacceptable, block
`/api/*` at Caddy while allowing `/graphql` and `/admin`. At this threat level that is
optional.

---

## Phased rollout

### Phase 1 — Get it deployed

Goal: Strapi reachable over HTTPS with real data, replacing nothing that exists.

1. **Add the Postgres driver.** `npm install pg`. No code change needed —
   `config/database.ts` already handles the `postgres` client. You only set
   `DATABASE_CLIENT=postgres` plus the connection vars, which are already wired to env.
2. **Write `Dockerfile`** (multi-stage, `node:22-alpine`) **and `docker-compose.yml`** with
   three services: `strapi`, `postgres` (named volume), and `caddy`. Caddy gets automatic
   Let's Encrypt TLS in about three lines of config — the lazy alternative to nginx +
   certbot.
3. **Put the Postgres data directory on a named volume.** If it lives in the container
   layer, the next redeploy destroys it. Highest-consequence line in this phase.
4. **Set `url` and `proxy` in `config/server.ts`.** Neither is set today. Behind a reverse
   proxy, missing `url` breaks admin redirects and cookie flags. This is the single most
   likely thing to burn an afternoon.
5. **Mount `public/uploads` as a volume** even though it is empty today — the about page and
   SEO share images can write there, and a container restart would otherwise lose them.
6. **Generate fresh production secrets** for all six values in `.env.example`: `APP_KEYS`,
   `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`,
   `ENCRYPTION_KEY`. Never reuse the local ones.
7. **Harden GraphQL** — the `config/plugins.ts` block from the previous section.
8. **Add 2 GB swap** so the admin build fits alongside Postgres on 2 GB RAM.
9. **Migrate data** with `strapi transfer` from local SQLite to the remote Postgres.
10. **Point `fe-tehesa`** at the new domain via `STRAPI_HOST`, and mint a fresh **read-only**
    API token for `STRAPI_API_TOKEN`.

Exit criteria: admin panel loads over HTTPS, the frontend renders the catalog from the
deployed GraphQL endpoint, and `docker compose down && docker compose up` preserves all
9,044 published variants.

### Phase 2 — Harden

Goal: survive a bad day.

1. Nightly `pg_dump | gzip` to S3 on cron, with 30-day retention.
2. **Restore one dump into a scratch container** and confirm the row counts match
   (18,088 variants, 666 products). This step is the entire point of step 1.
3. Enable automatic Lightsail snapshots.
4. Lock the firewall to 80/443 plus SSH from a known IP.
5. Add a build+push job to the existing GitHub Actions workflow (already Node 22) and pull a
   prebuilt image on the box. This retires the swapfile workaround from Phase 1.
6. Uptime monitoring — a free external ping on `/_health` is enough at this size.

### Phase 3 — Scale, when triggered

Do none of this preemptively. Each item has a trigger:

| Trigger | Action |
|---|---|
| **Editing becomes frequent** (weekly rather than quarterly) | Move Postgres to RDS for point-in-time recovery. The Compose file stays; only `DATABASE_*` changes. This is the main deferred decision in this document. |
| Box sustains >80% RAM | Resize to Lightsail $24 (4 GB). One click, minutes of downtime. |
| Media library becomes real (>1 GB) | Move uploads to S3 via `@strapi/provider-upload-aws-s3`; add CloudFront if egress justifies it. |
| You want a second app instance | RDS first — a Postgres container on one box cannot be shared safely. |
| Editors in Mexico complain about admin latency | Move to EC2 in `mx-central-1` (~5% premium; Lightsail is not available there). |
| You need staging | A second $12 instance is cheaper than a Strapi Cloud environment at $60/mo. |
| Real HA becomes a requirement | ECS Fargate + RDS Multi-AZ. This is the point where the $68/mo option finally earns its price. |

---

## Sources

Priced 2026-08-04.

**AWS** — [Lightsail pricing](https://aws.amazon.com/lightsail/pricing/) ·
[Lightsail regions, June 2026](https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-lightsail-aws-regions/) ·
[EC2 on-demand pricing](https://aws.amazon.com/ec2/pricing/on-demand/) ·
[t4g free trial](https://aws.amazon.com/ec2/instance-types/t4/) ·
[EBS pricing](https://aws.amazon.com/ebs/pricing/) ·
[Public IPv4 charge](https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights) ·
[RDS Postgres pricing](https://aws.amazon.com/rds/postgresql/pricing/) ·
[db.t4g.micro rates](https://instances.vantage.sh/aws/rds/db.t4g.micro) ·
[ELB pricing](https://aws.amazon.com/elasticloadbalancing/pricing/) ·
[Fargate pricing](https://aws.amazon.com/fargate/pricing/) ·
[App Runner pricing](https://aws.amazon.com/apprunner/pricing/) ·
[CloudFront pricing](https://aws.amazon.com/cloudfront/pricing/) ·
[Free tier changes, July 2025](https://aws.amazon.com/about-aws/whats-new/2025/07/aws-free-tier-credits-month-free-plan/) ·
[Mexico (Central) region](https://aws.amazon.com/blogs/aws/now-open-aws-mexico-central-region)

**Strapi** — [Cloud pricing](https://strapi.io/pricing-cloud) ·
[Cloud usage & billing](https://docs.strapi.io/cloud/getting-started/usage-billing) ·
[Free plan removal](https://strapi.io/blog/we-re-removing-the-free-plan-from-strapi-cloud) ·
[Seat policy](https://support.strapi.io/articles/6369876154-how-seats-work-when-upgrading-to-a-paid-strapi-plan) ·
[Hardware requirements](https://docs.strapi.io/snippets/hardware-require) ·
[Deployment docs](https://docs.strapi.io/cms/deployment) ·
[Community AWS guide](https://community.strapi.io/integrations/aws?tab=guide) ·
[Self-host with Docker Compose](https://strapi.io/blog/how-to-self-host-your-headless-cms-using-docker-compose) ·
[Strapi on Coolify](https://strapi.io/blog/how-to-deploy-strapi-application-on-coolify-using-docker-compose)

**GCP** — [Sustained use discounts](https://docs.cloud.google.com/compute/docs/sustained-use-discounts) ·
[e2-small pricing](https://gcloud-compute.com/e2-small.html) ·
[e2-medium pricing](https://gcloud-compute.com/e2-medium.html) ·
[e2-micro pricing](https://gcloud-compute.com/e2-micro.html) ·
[persistent disk pricing](https://gcloud-compute.com/diskpricing.html) ·
[External IPv4 pricing](https://cloud.google.com/vpc/pricing-announce-external-ips) ·
[Network tier pricing](https://cloud.google.com/network-tiers/pricing) ·
[200 GB free Standard tier egress](https://cloud.google.com/blog/products/networking/standard-tier-network-now-includes-200-gb-data-transfer-per-month) ·
[Always Free features](https://docs.cloud.google.com/free/docs/free-cloud-features) ·
[Cloud SQL machine series](https://docs.cloud.google.com/sql/docs/postgres/machine-series-overview) ·
[Cloud SQL pricing analysis](https://www.bytebase.com/blog/understanding-google-cloud-sql-pricing/) ·
[Cloud SQL free trial instance](https://docs.cloud.google.com/sql/docs/postgres/free-trial-instance) ·
[Cloud Run min-instances](https://docs.cloud.google.com/run/docs/configuring/min-instances) ·
[Cloud Run custom domains](https://docs.cloud.google.com/run/docs/mapping-custom-domains) ·
[Cloud Run GCS volume mounts](https://docs.cloud.google.com/run/docs/configuring/services/cloud-storage-volume-mounts) ·
[Cloud NAT pricing](https://cloud.google.com/nat/pricing) ·
[Cloud Load Balancing pricing](https://cloud.google.com/load-balancing/pricing) ·
[Compute Engine SLA](https://cloud.google.com/compute/sla) ·
[Amazon Compute SLA](https://aws.amazon.com/compute/sla/) ·
[GKE pricing analysis](https://www.cloudzero.com/blog/gke-pricing/) ·
[Disable billing killswitch](https://docs.cloud.google.com/billing/docs/how-to/disable-billing-with-notifications) ·
[strapi#21283 — container startup time](https://github.com/strapi/strapi/issues/21283) ·
[strapi#12137 — admin build OOM](https://github.com/strapi/strapi/issues/12137)

**Others** — [DigitalOcean Droplets](https://www.digitalocean.com/pricing/droplets) ·
[DO Managed Databases](https://www.digitalocean.com/pricing/managed-databases) ·
[DO App Platform storage](https://docs.digitalocean.com/products/app-platform/how-to/store-data/) ·
[DO Strapi 1-Click](https://docs.digitalocean.com/products/marketplace/catalog/strapi/) ·
[Railway pricing](https://railway.com/pricing) ·
[Render compute plans](https://render.com/docs/compute-plans) ·
[Render free tier](https://render.com/docs/free) ·
[Render disks](https://render.com/docs/disks) ·
[Render Strapi guide](https://render.com/docs/deploy-strapi) ·
[Fly.io pricing](https://fly.io/docs/about/pricing/) ·
[Fly Managed Postgres](https://fly.io/docs/mpg/) ·
[Hetzner price adjustment](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/) ·
[Coolify pricing](https://coolify.io/pricing) ·
[Heroku billing](https://devcenter.heroku.com/articles/usage-and-billing) ·
[Neon plans](https://neon.com/docs/introduction/plans) ·
[Vercel function duration](https://vercel.com/docs/functions/configuring-functions/duration) ·
[Netlify function limits](https://answers.netlify.com/t/serverless-functions-limits/36204)

## Unverified

Recorded rather than smoothed over. None of these change the recommendation, but check them
before relying on them.

- **`mx-central-1` RDS and EBS rates.** The instance types are available; the per-hour prices
  were not confirmed. Assume the same ~5% regional premium seen on EC2.
- **Lightsail IPv6-only bundle price at the 2 GB tier.** IPv6-only bundles start at $3.50 but
  the 2 GB tier price was not confirmed.
- **ALB public IPv4 count.** Whether AWS bills one address per AZ comes from secondary
  sources, not an AWS page.
- **CloudFront legacy free tier.** Sources disagree on whether the old 1 TB/month allowance is
  perpetual, 12-month, or superseded by the new 100 GB Free plan. At this traffic all three
  readings cost $0.
- **Hetzner US-location pricing and ARM availability in Ashburn.** Third-party sources report
  US pricing 38–53% above EU and disagree on whether CAX instances exist there. Budget
  ~$9–10/mo and check the console.
- **Render's dollar figures.** The instance tiers are confirmed in Render's docs, but the
  pricing page blocks automated fetch, so the prices are third-party.
- **Strapi Cloud plan naming.** A Strapi blog post still describes plans named
  Essential/Pro/Scale at different prices, while the live pricing page and current docs both
  show Starter/Pro/Business at $35/$90/$450. This doc treats the live page as authoritative.
  Confirm before signing anything.
- **App Runner NAT Gateway requirement.** Whether this app's egress topology would force a
  NAT Gateway (+$33/mo) was not verified. Moot given App Runner is rejected.

GCP-specific gaps:

- **Google's own pricing pages could not be fetched.** `cloud.google.com/run/pricing`,
  `/vpc/network-pricing`, `/compute/all-pricing` and `/sql/pricing` are JS-rendered and
  truncate on retrieval. Every GCP rate here is triangulated from two or more independent
  third parties that agree, but none is a direct quote from Google. The SUD eligibility list
  and the Always Free terms **were** read from Google's own docs.
- **Whether the Always Free e2-micro includes a free external IP.** Sources contradict and
  Google's free-tier page doesn't mention IPs. Swings that option by ±$3.65/mo.
- **Whether Cloud Run's free tier applies to idle min-instance seconds.** Assumed yes.
  Worst case +$1.35/mo on the min=1 configuration.
- **Whether a running Cloud SQL instance is charged for its public IP.** Docs mention a
  charge only while the instance is *off*. If wrong, add ~$3.65/mo to both Cloud SQL rows.
- **Cloud Run committed-use discount percentages** (28% / 46%) — the official `/run/cud`
  URL returned 404; taken from search snippets of that page.
- **External IP price in `northamerica-south1`** — assumed the same $0.005/hr as US regions.
- **Cloud Run instance-based free tier** (240k vCPU-s / 450k GiB-s) — single source.

Two assumptions carried into this research came back **corrected**, and the doc reflects the
corrections rather than the assumptions: **E2 machine types receive no sustained use
discount**, and **Cloud SQL `db-f1-micro` is not deprecated**.
