# Lightsail Deployment Runbook

Written 2026-08-04. Executes the recommendation in
[`deployment-research.md`](./deployment-research.md): **AWS Lightsail $12/mo instance
(2 GB, `us-east-1`) running Strapi + Postgres + Caddy via Docker Compose, with a nightly
`pg_dump` to S3.** All-in ≈ $12.05/mo.

---

## 0. How to use this doc

This runbook is written to be executed by an AI coding agent with a human available for
console work. Read this section before doing anything.

**Rules:**

1. **Phases are strictly ordered.** Phase 0 changes the repo; Phase 1 creates the server;
   nothing after Phase 1 works until DNS resolves. Do not reorder.
2. **Every step is tagged.**
   - `[AGENT]` — the agent does it: writes files, runs `npm`/`docker`/`git` commands.
   - `[HUMAN]` — the agent **stops, reports what it needs, and waits**. AWS console, DNS
     registrar, GitHub repo secrets, and anything that mints a token in the Strapi admin
     UI. Do not attempt these with the AWS CLI unless the human explicitly grants
     credentials and asks for it.
3. **Every step has a done-when line.** Verify it before moving on. If it fails, go to
   [§12 Troubleshooting](#12-troubleshooting) rather than improvising a fix.
4. **Never invent a placeholder value.** All placeholders are listed in the table below.
   If you need one and don't have it, that is a `[HUMAN]` handoff.
5. **Secrets never enter the repo.** `.env` is gitignored and lives only on the server.
   `.env.example` gets key names with empty/placeholder values, never real ones.

**Placeholders:**

| Placeholder | Example | Where it comes from |
|---|---|---|
| `<STATIC_IP>` | `54.210.11.22` | Lightsail static IP, Phase 1.2 `[HUMAN]` |
| `<DOMAIN>` | `tehesa-strapi.budget-master.space` | Fixed. Subdomain of `budget-master.space` |
| `<SSH_USER>` | `ubuntu` | Lightsail Ubuntu default |
| `<SSH_KEY>` | `~/.ssh/tehesa_lightsail` | Generated locally in Phase 1.0 `[HUMAN]` |
| `<REPO_URL>` | `https://github.com/RafaelMoro/cms-tehesa.git` | Fixed. **Public** repo — HTTPS, no auth |
| `<GHCR_IMAGE>` | `ghcr.io/rafaelmoro/cms-tehesa` | **Lowercase is mandatory** — see Phase 6.2 |
| `<S3_BUCKET>` | `tehesa-strapi-backups` | Created in Phase 5.1 `[HUMAN]` |
| `<AWS_ACCESS_KEY_ID>` / `<AWS_SECRET_ACCESS_KEY>` | — | Backup IAM user, Phase 5.1 `[HUMAN]` |
| `<TRANSFER_TOKEN>` | — | Minted in remote admin, Phase 3.1 `[HUMAN]` |
| `<DB_PASSWORD>` | — | Generated in Phase 2.2 `[AGENT]`, written only to server `.env` |

---

## 1. Purpose & scope

**In scope:** getting this Strapi app running on HTTPS at `<DOMAIN>` with the current
catalog data, backed up nightly, deployable from CI.

**Out of scope:** deploying `fe-tehesa` (it lives on Vercel), staging environments, RDS,
S3 media uploads, CloudFront. Each of those has a trigger in
[`deployment-research.md` § Phase 3](./deployment-research.md#phase-3--scale-when-triggered);
none is triggered today.

---

## 2. Prerequisites

Confirm all of these before Phase 0. Missing any one blocks a later phase.

- [ ] AWS account on the **Paid plan** (the Free plan auto-closes the account after
      6 months). Signup credits absorb the early bill.
- [ ] DNS management access for `budget-master.space`.
- [ ] Local repo working tree clean, and **local `.env` + `.tmp/data.db` intact** — the
      local SQLite database is the source for the Phase 3 migration. Do not run
      `npm run seed:clear`.
- [ ] An SSH keypair for the Lightsail instance — **you generate it in Phase 1.0**, before
      creating the instance, because Lightsail asks for the public key during creation.
- [ ] Docker installed locally is *optional* — the image builds on the box in Phase 2. Verify
      with `docker compose version`.

---

## 3. Target architecture

```
                 :443 / :80
Internet ──────────► caddy ──────────► strapi ──────────► postgres
                  (auto TLS)   :1337  (Strapi 5)   :5432   (pg 16)
                      │                   │                    │
                 caddy_data          uploads              pgdata
                  (volume)           (volume)             (volume)
```

| Service | Image | Published ports | Volumes |
|---|---|---|---|
| `caddy` | `caddy:2-alpine` | `80:80`, `443:443` | `caddy_data`, `caddy_config`, `./Caddyfile` |
| `strapi` | built from `Dockerfile` | **none** | `uploads` → `/opt/app/public/uploads` |
| `postgres` | `postgres:16-alpine` | **none** | `pgdata` → `/var/lib/postgresql/data` |

Only Caddy is reachable from outside. Strapi and Postgres talk over the Compose network by
service name. **Postgres must never publish 5432 to the host** — the Lightsail firewall is
the only thing that would stand between it and the internet.

---

## 4. Phase 0 `[AGENT]` — Repo changes

All of this happens on a branch in the local repo, before any AWS resource exists. Nothing
here is server-specific.

> Reminder: every PR to `develop` needs a `major` / `minor` / `patch` label or
> `.github/workflows/check-label.yml` fails CI. This work is `minor`.

### 0.1 Add the Postgres driver

```bash
npm install pg
```

`config/database.ts` already has a full `postgres` connection block (lines 23–45) reading
`DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD/SSL/SCHEMA` and `DATABASE_URL`. **No code change
is needed** — only the driver and the env vars.

**Done when:** `pg` appears under `dependencies` in `package.json` and `package-lock.json`
is updated.

### 0.2 `Dockerfile`

New file at repo root:

```dockerfile
# syntax=docker/dockerfile:1

# ---- deps: full install, needs build toolchain for sharp/better-sqlite3 ----
FROM node:22-alpine AS deps
RUN apk add --no-cache build-base python3 vips-dev
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: compile server TS + admin panel ----
FROM deps AS build
ENV NODE_ENV=production
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:22-alpine AS runtime
RUN apk add --no-cache vips postgresql-client
ENV NODE_ENV=production
WORKDIR /opt/app

COPY --from=build /opt/app/node_modules ./node_modules
COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/build ./build
COPY --from=build /opt/app/public ./public
COPY --from=build /opt/app/package.json ./package.json
COPY --from=build /opt/app/favicon.png ./favicon.png

RUN chown -R node:node /opt/app
USER node
EXPOSE 1337
CMD ["npm", "run", "start"]
```

Notes for the agent:

- `npm run start` is `strapi start` (already in `package.json`). It serves the prebuilt
  admin from `build/` and the compiled server from `dist/`.
- `node_modules` is copied from the build stage rather than reinstalled with
  `--omit=dev`. Strapi 5 resolves plugins at runtime through the full dependency graph;
  pruning dev deps is a known source of "plugin not found" boots. The image is ~1 GB —
  acceptable here, and disk is 60 GB.
- `postgresql-client` in the runtime stage is deliberate: it is *not* for Strapi, it is so
  `pg_dump` is available for Phase 5.
- `better-sqlite3` stays installed and unused in production. Removing it would break local
  development. It costs disk, nothing else.

**Done when:** the file exists. It is not built until Phase 2.

### 0.3 `.dockerignore`

Mandatory, not optional — the repo root currently holds `.env`, `.tmp/`, `dist/`, and
several `transfer_*.log` files that must never enter an image.

```
node_modules
.git
.github
.env
.env.*
!.env.example
.tmp
dist
build
.strapi
transfer_*.log
docs
data
*.md
```

**Done when:** `docker build` (Phase 2) produces a context under ~50 MB.

### 0.4 `docker-compose.yml`

New file at repo root:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USERNAME} -d ${DATABASE_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  strapi:
    build: .
    image: ${STRAPI_IMAGE:-store-tehesa-api:local}
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - uploads:/opt/app/public/uploads

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - strapi

volumes:
  pgdata:
  uploads:
  caddy_data:
  caddy_config:
```

**The `pgdata` named volume is the highest-consequence line in this file.** If the Postgres
data directory ends up in the container layer, the next `docker compose up --build`
destroys the catalog.

`STRAPI_IMAGE` is unset in Phase 2 (builds locally on the box) and set to the GHCR tag in
Phase 6.

**Done when:** `docker compose config` parses without error.

### 0.5 `Caddyfile`

New file at repo root:

```
{$PUBLIC_DOMAIN} {
	encode gzip
	reverse_proxy strapi:1337
}
```

Caddy provisions and renews the Let's Encrypt certificate automatically. `PUBLIC_DOMAIN`
comes from the environment, so the same file works for any hostname.

Add `PUBLIC_DOMAIN` to the `caddy` service in `docker-compose.yml`:

```yaml
  caddy:
    environment:
      PUBLIC_DOMAIN: ${PUBLIC_DOMAIN}
```

**Optional hardening, not applied by default:** if REST being reachable at all is
unacceptable, add `@rest path /api/*` + `respond @rest 404` above the `reverse_proxy`. The
public role having zero permissions already makes REST return nothing useful, so this is
belt-and-braces. Ask before adding it.

### 0.6 `config/server.ts` — add `url` and `proxy`

This is the single most likely thing to burn an afternoon. Behind a TLS-terminating
reverse proxy, Strapi without `url` generates admin redirects to `http://localhost:1337`
and without `proxy: true` it sees `http` on the request and refuses to set secure cookies —
the admin login appears to succeed and then bounces straight back to the login screen.

```ts
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  proxy: env.bool('IS_PROXIED', false),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

Defaults keep `npm run dev` behaving exactly as it does today. Production sets
`PUBLIC_URL=https://<DOMAIN>` and `IS_PROXIED=true`.

**Done when:** `npx tsc --noEmit` passes and `npm run dev` still serves the admin at
`http://localhost:1337/admin`.

### 0.7 `config/plugins.ts` — harden GraphQL

Currently `export default () => ({})`, so the GraphQL plugin runs entirely on defaults.
GraphQL is the only API the store uses, and it is read-only, but `product → variants →
product` is a cycle in this schema, which makes an unbounded depth limit a denial-of-service
vector.

```ts
export default ({ env }) => ({
  graphql: {
    config: {
      defaultLimit: 25,
      maxLimit: 100,
      depthLimit: 7,
      apolloServer: {
        introspection: env.bool('GRAPHQL_INTROSPECTION', false),
      },
    },
  },
});
```

`defaultLimit`/`maxLimit` mirror `config/api.ts` so the two surfaces agree. `depthLimit`
defaults to 10 in Strapi; 7 is comfortably above anything this schema needs. Introspection
is off by default and can be flipped on locally with `GRAPHQL_INTROSPECTION=true` when
working on queries.

**Done when:** `npx tsc --noEmit` passes and `npm run dev` boots without a plugin config
validation error.

### 0.8 `.env.example` — document the new keys

Append (keep the existing six lines untouched):

```
# --- production only ---
# DATABASE_CLIENT=postgres
# DATABASE_HOST=postgres
# DATABASE_PORT=5432
# DATABASE_NAME=strapi
# DATABASE_USERNAME=strapi
# DATABASE_PASSWORD=
# DATABASE_SSL=false
# PUBLIC_URL=https://tehesa-strapi.budget-master.space
# PUBLIC_DOMAIN=tehesa-strapi.budget-master.space
# IS_PROXIED=true
```

Commented out so local development keeps defaulting to SQLite.

### 0.9 Phase 0 exit criteria

- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run dev` still starts against local SQLite, admin loads, GraphQL responds.
- [ ] `npm run build` succeeds locally.
- [ ] `git status` shows exactly: `Dockerfile`, `.dockerignore`, `docker-compose.yml`,
      `Caddyfile` (new); `config/server.ts`, `config/plugins.ts`, `.env.example`,
      `package.json`, `package-lock.json` (modified).
- [ ] Nothing containing a real secret is staged.
- [ ] PR opened with a `minor` label.

---

## 5. Phase 1 `[HUMAN]` — Provision the box

The agent cannot do any of this. Hand this section to the human and wait for
`<STATIC_IP>` plus confirmed SSH access.

### 1.0 Generate the SSH keypair — do this first, locally

Lightsail asks for a public key *while* creating the instance, so the key must exist before
step 1.1. On your WSL machine:

```bash
ssh-keygen -t ed25519 -C "tehesa-lightsail" -f ~/.ssh/tehesa_lightsail
cat ~/.ssh/tehesa_lightsail.pub     # this is what you paste into Lightsail
```

Chosen over letting Lightsail generate a `.pem` for you, because that `.pem` is displayed
exactly once — lose it and recovery is snapshot → new instance → re-key — and because it is a
*regional default* silently reused by every future `us-east-1` instance. Phase 6.1 forces a
second, deploy-only keypair anyway, so one mechanism covers both. The private half never
leaves your machine.

**Done when:** `~/.ssh/tehesa_lightsail` (mode 600) and `~/.ssh/tehesa_lightsail.pub` exist.

### 1.1 Create the instance

Lightsail → Create instance:

- **Region `us-east-1`** (N. Virginia). Set this first — the SSH key you upload is *regional*.
- Linux/Unix → OS Only → **Ubuntu 22.04 LTS or 24.04 LTS**. Either works; §2.1's Docker install
  keys off `$VERSION_CODENAME`. Prefer 24.04 for the longer support window.
- **"Change SSH key pair" → Upload new** → paste the contents of `~/.ssh/tehesa_lightsail.pub`.
- **$12/mo plan (2 GB RAM, 2 vCPU, 60 GB SSD).** The $5 and $7 plans are below Strapi's
  documented 2 GB minimum — do not use them.

### 1.2 Attach a static IP

Networking → Create static IP → attach to the instance. It must be created **in `us-east-1`**;
Lightsail cannot attach a static IP across regions. Free while attached, $3.65/mo if you leave
it detached. Record it as `<STATIC_IP>`.

### 1.3 DNS

At the `budget-master.space` registrar, create an **A record**:

| Type | Host | Value | TTL |
|---|---|---|---|
| A | `tehesa-strapi` | `<STATIC_IP>` | 300 |

**Do not create an AAAA record.** Lightsail also assigns the instance a public IPv6 address,
governed by a *separate* IPv6 firewall tab. An AAAA record pointing at a v6 address with port 80
shut makes Let's Encrypt fail the challenge while `dig` (which queries A by default) looks
perfectly healthy — the hardest-to-diagnose version of the §12 "could not get certificate" trap.

### 1.4 Firewall

Lightsail → instance → Networking. Note you are *modifying* defaults, not building from empty:
the instance already ships with SSH 22 (anywhere) and HTTP 80 (anywhere).

**IPv4 firewall** — target state:

- HTTP 80 — anywhere (already there; Let's Encrypt needs it)
- HTTPS 443 — anywhere (**you add this**)
- SSH 22 — **restricted to your IP** (**you tighten this**)
- Nothing else. Especially not 1337 or 5432.

Two things to know before restricting SSH:

- It **disables the console's browser-based SSH client**, which connects from AWS rather than
  from you. That is recoverable — the console's firewall editor needs no SSH — but it is your
  break-glass path, so know it is gone.
- Your home IP is dynamic. When the ISP lease changes, SSH stops working until you edit the
  rule in the console. If that trade is unappealing, leaving 22 open is defensible: the Ubuntu
  image ships `PasswordAuthentication no`, so key-only auth is already enforced.

**IPv6 firewall** — separate tab. Leave it closed, consistent with creating no AAAA record.

### 1.5 Verify DNS before going further

```bash
dig +short tehesa-strapi.budget-master.space @1.1.1.1
```

It must print `<STATIC_IP>`. `@1.1.1.1` deliberately bypasses your local resolver: if you
queried this name *before* the record existed, a negative NXDOMAIN cache entry (5–60 min TTL)
keeps answering empty and looks exactly like a DNS failure.

**Do not start Caddy until it resolves** — failed ACME challenges count against Let's Encrypt
rate limits (5 failures/hour per hostname), and burning them turns a 2-minute wait into an hour.

### 1.6 Verify SSH

```bash
ssh -i ~/.ssh/tehesa_lightsail ubuntu@<STATIC_IP> 'lsb_release -d; free -h; df -h /'
```

Optional but worth 30 seconds — add to `~/.ssh/config` so every later phase can just say
`ssh tehesa`:

```
Host tehesa
  HostName <STATIC_IP>
  User ubuntu
  IdentityFile ~/.ssh/tehesa_lightsail
```

**Done when:** it prints the Ubuntu release, ~2.0Gi total RAM with **0B swap** (§2.1 fixes the
swap), and ~58G available on `/`.

**Handoff to agent:** `<STATIC_IP>`, `<DOMAIN>`, and `ssh <SSH_USER>@<STATIC_IP>` working.

---

## 6. Phase 2 — First deploy

### 2.1 `[AGENT]` Prepare the box

Over SSH as `<SSH_USER>` (`ssh tehesa` if you added the §1.6 config entry):

```bash
# Docker + compose plugin
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

**Now log out and back in.** This is a step, not a footnote: group membership is only applied
at login, so until you reconnect, the done-when check below and every command in §2.3 fail with
`permission denied while trying to connect to the Docker daemon socket`.

```bash
exit
ssh tehesa                              # or: ssh -i ~/.ssh/tehesa_lightsail ubuntu@<STATIC_IP>
id -nG | grep -qw docker && echo "docker group OK"
```

**2 GB swapfile** — the admin panel build is the memory spike, not steady state. Without
swap the build OOM-kills on a 2 GB box:

```bash
sudo swapon --show          # if this prints a row, swap already exists — skip to the check below

sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

sudo swapon --show          # must list /swapfile, 2G
free -h
```

`swapon --show` is the real check — `free -h` reports a total but not *which* file, so it still
looks right if `/etc/fstab` is wrong and the swap vanishes on reboot. If `fallocate` ever errors
on the filesystem, `sudo dd if=/dev/zero of=/swapfile bs=1M count=2048` is the fallback.

**Confirm the clock while you're here** — Phase 5's cron (`0 3 * * *`) fires in **host** time,
not container time. Lightsail Ubuntu is UTC by default; verify rather than assume:

```bash
timedatectl | grep 'Time zone'   # expect: Etc/UTC (UTC, +0000)
```

**Done when:** `docker compose version` prints a v2.x version **as `ubuntu`, without `sudo`**,
and `swapon --show` lists `/swapfile` at 2G.

### 2.2 `[AGENT]` Clone and configure

```bash
git clone -b develop https://github.com/RafaelMoro/cms-tehesa.git ~/store-tehesa-api
cd ~/store-tehesa-api
```

Three things in that one line:

- **`-b develop` is load-bearing.** The repo's default branch is `main`, but §6.2 deploys on
  pushes to `develop` and runs `git pull --ff-only` on the box. Clone `main` and the box's
  `docker-compose.yml` / `Caddyfile` silently drift from the image CI built.
- **HTTPS, not SSH.** The repo is public, so the box needs no deploy key and no agent forwarding.
- **The directory name is intentionally not the repo name.** `~/store-tehesa-api` is hardcoded in
  §5.2's crontab entry and §6.2's `cd`. Keep it, or change all three together.

Generate the six Strapi secrets plus the DB password. **Never reuse the local `.env`
values.**

```bash
cat > .env <<EOF
HOST=0.0.0.0
PORT=1337

APP_KEYS=$(openssl rand -base64 32),$(openssl rand -base64 32)
API_TOKEN_SALT=$(openssl rand -base64 32)
ADMIN_JWT_SECRET=$(openssl rand -base64 32)
TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')

PUBLIC_URL=https://<DOMAIN>
PUBLIC_DOMAIN=<DOMAIN>
IS_PROXIED=true
NODE_ENV=production
EOF
chmod 600 .env
```

`APP_KEYS` must be a comma-separated pair — Strapi rotates session keys across the list.
The DB password strips `/+=` because it also has to survive a URL context in Phase 5's
`pg_dump`.

**Done when:** `.env` has 600 permissions, no value reads `tobemodified`, and
`git status` shows it untracked (it is gitignored).

### 2.3 `[AGENT]` Build and start

```bash
docker compose up -d --build
docker compose logs -f strapi
```

First build takes 5–10 minutes on 2 vCPU. Watch for the Strapi banner. Caddy fetches the
certificate on its first request to `<DOMAIN>`; `docker compose logs caddy` should show
`certificate obtained successfully`.

**Done when:**

```bash
curl -sI https://<DOMAIN>/admin | head -1   # HTTP/2 200
```

and `https://<DOMAIN>/admin` renders the Strapi welcome screen in a browser.

### 2.4 `[HUMAN]` Create the first admin user

Open `https://<DOMAIN>/admin` and complete the registration form. This is the super-admin;
there is no CLI equivalent worth using here.

**Done when:** you can log in, and logging in **stays** logged in after a refresh. If it
bounces back to the login screen, `url`/`proxy` from §0.6 are not taking effect — see
[§12](#12-troubleshooting).

---

## 7. Phase 3 — Migrate the data

The deployed database is empty. The catalog lives in local `.tmp/data.db`.

> **Do not use the seed scripts.** `npm run seed:start` and `npm run seed:products` read
> from `../../tehesa-products/data`, a sibling directory that does not exist on the server
> and is not part of this repo. `strapi transfer` is the migration path — it operates at
> the entity level, so SQLite → Postgres crosses cleanly, and it is already proven in this
> project (see the `transfer_*.log` files in the repo root from the Strapi Cloud trial).

### 3.1 `[HUMAN]` Mint a transfer token

Remote admin → Settings → Transfer Tokens → Create new → type **Push**, duration 7 days.
Copy it immediately; it is shown once. Hand back as `<TRANSFER_TOKEN>`.

### 3.2 `[AGENT]` Run the transfer

From the **local machine**, with the local repo pointing at local SQLite:

```bash
npx strapi transfer --to https://<DOMAIN>/admin --to-token '<TRANSFER_TOKEN>'
```

Confirm the destructive-overwrite prompt — the remote is empty, so there is nothing to
lose. The transfer moves entities, files, and config, and prints a per-content-type table
at the end.

### 3.3 `[AGENT]` Verify

Row counts must match the source dataset:

| Content type | Expected |
|---|---|
| product-variant | **18,088** total, **9,044** published |
| product | **666** |
| category | **32** |
| brand | **14** |

Check from the admin Content Manager, or directly:

```bash
docker compose exec postgres psql -U strapi -d strapi -c \
  "SELECT count(*) FROM product_variants;"
```

Then confirm the data survives a restart — this is the test that the `pgdata` volume is
really a named volume:

```bash
docker compose down && docker compose up -d
# wait for boot, re-run the count query — it must still be 18088
```

**Done when:** all four counts match and they survive `down`/`up`.

---

## 8. Phase 4 `[HUMAN]` — Wire the frontend

1. **Mint a read-only API token.** Remote admin → Settings → API Tokens → Create new →
   type **Read-only**, duration Unlimited. Copy it once.
2. **Leave the public role empty.** Settings → Roles → Public must have **zero**
   permissions. The frontend authenticates with the token; nothing needs anonymous access.
3. **Update `fe-tehesa`** — set `STRAPI_HOST=https://<DOMAIN>` and `STRAPI_API_TOKEN=<the
   token>` in its Vercel environment, then redeploy.
4. **Verify** the storefront renders the catalog from the deployed endpoint. Because
   `fe-tehesa` queries Strapi server-side (Apollo inside `src/app/api/catalog/*`), no
   browser ever hits `<DOMAIN>` — so no CORS change is needed in
   `config/middlewares.ts`.

**Note on REST:** Strapi's REST and GraphQL layers share one permission system. You cannot
disable REST separately — granting `find` enables both. With the public role empty and a
read-only token, neither surface exposes anything unintended. The Caddy `/api/*` block from
§0.5 is available if that isn't enough.

**Done when:** the storefront lists products served from `<DOMAIN>`, and
`curl https://<DOMAIN>/api/products` (no token) returns 403.

---

## 9. Phase 5 — Backups

An 8 MiB database gzips to well under 1 MB. 30 days of retention costs about $0.01/mo.
This is the backup that matters, because it restores to any Postgres anywhere — including
RDS later.

### 5.1 `[HUMAN]` Bucket and IAM user

1. Create S3 bucket `<S3_BUCKET>` in `us-east-1`. Block all public access. Enable default
   encryption (SSE-S3).
2. Lifecycle rule: expire objects under `pg/` after **30 days**.
3. Create an IAM user `tehesa-strapi-backup` with programmatic access only and this
   inline policy — write-only, single prefix, no delete:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:PutObject",
    "Resource": "arn:aws:s3:::<S3_BUCKET>/pg/*"
  }]
}
```

Hand back `<AWS_ACCESS_KEY_ID>` and `<AWS_SECRET_ACCESS_KEY>`.

### 5.2 `[AGENT]` Backup script

On the box, `~/store-tehesa-api/scripts/backup-to-s3.sh` — note this is a server-side
operations script, kept out of the repo deliberately so it can hold no secrets ambiguity:

```bash
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
FILE="/tmp/strapi-${STAMP}.sql.gz"

docker compose exec -T postgres pg_dump -U strapi -d strapi --clean --if-exists \
  | gzip -9 > "$FILE"

# fail loudly on an empty or truncated dump rather than uploading garbage
if [ "$(stat -c%s "$FILE")" -lt 10000 ]; then
  echo "dump suspiciously small ($(stat -c%s "$FILE") bytes) — aborting" >&2
  exit 1
fi

aws s3 cp "$FILE" "s3://<S3_BUCKET>/pg/strapi-${STAMP}.sql.gz"
rm -f "$FILE"
echo "backup ok: ${STAMP}"
```

The size guard is the point. An unattended backup that silently uploads a 20-byte file
every night is worse than no backup, because it looks like one.

Install the AWS CLI and credentials:

```bash
sudo apt-get install -y awscli
aws configure   # <AWS_ACCESS_KEY_ID>, <AWS_SECRET_ACCESS_KEY>, us-east-1, json
chmod +x ~/store-tehesa-api/scripts/backup-to-s3.sh
```

Cron, 03:00 UTC nightly:

```bash
( crontab -l 2>/dev/null; \
  echo "0 3 * * * /home/<SSH_USER>/store-tehesa-api/scripts/backup-to-s3.sh >> /home/<SSH_USER>/backup.log 2>&1" \
) | crontab -
```

`date -u` fixes the *filename*, but cron fires on **host** time — that is what §2.1's
`timedatectl` check confirms. On a stock Lightsail Ubuntu (UTC) `0 3 * * *` is 03:00 UTC.

**Done when:** `./scripts/backup-to-s3.sh` prints `backup ok` and the object appears in
`aws s3 ls s3://<S3_BUCKET>/pg/`.

### 5.3 `[AGENT]` Restore drill — required, not optional

An untested backup is a rumor. Restore into a throwaway container and compare counts:

```bash
aws s3 cp s3://<S3_BUCKET>/pg/<latest>.sql.gz /tmp/restore.sql.gz

docker run -d --name pgtest -e POSTGRES_PASSWORD=test -e POSTGRES_USER=strapi \
  -e POSTGRES_DB=strapi postgres:16-alpine
sleep 10
gunzip -c /tmp/restore.sql.gz | docker exec -i pgtest psql -U strapi -d strapi

docker exec pgtest psql -U strapi -d strapi -c "SELECT count(*) FROM product_variants;"
# must print 18088

docker rm -f pgtest && rm /tmp/restore.sql.gz
```

**Done when:** the scratch container reports 18,088 variants.

### 5.4 `[HUMAN]` Lightsail snapshots

Instance → Snapshots → enable **automatic snapshots**, daily. This recovers the OS and
configuration, not just data — the layer the `pg_dump` doesn't cover.

---

## 10. Phase 6 — CI deploy

Retires the build-on-the-box step from Phase 2 (and with it the reason the swapfile
matters). Images build on GitHub's runners and the box only pulls.

### 6.1 `[HUMAN]` Repo secrets

Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `SSH_HOST` | `<STATIC_IP>` |
| `SSH_USER` | `<SSH_USER>` |
| `SSH_KEY` | private key of a **deploy-only** keypair (see below) |

`SSH_KEY` is **not** `<SSH_KEY>` from Phase 1.0 — that one is yours and stays on your machine.
Mint a second, CI-only keypair locally and install its public half on the box:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/tehesa_deploy -N ""
ssh-copy-id -i ~/.ssh/tehesa_deploy.pub tehesa      # appends to the box's authorized_keys
ssh -i ~/.ssh/tehesa_deploy ubuntu@<STATIC_IP> 'echo deploy key works'
```

`-N ""` gives it an empty passphrase — required, since Actions cannot type one. That is why it
must be a dedicated key: paste the **whole** `~/.ssh/tehesa_deploy` file (including the
`-----BEGIN`/`-----END` lines and the trailing newline) into the secret, then delete the local
private copy if you prefer — the box and the secret are the only places it needs to exist.

### 6.2 `[AGENT]` `.github/workflows/deploy.yml`

```yaml
name: Deploy to Lightsail

on:
  push:
    branches: [develop]
  workflow_dispatch:

concurrency:
  group: deploy-lightsail
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - name: Lowercase image name
        id: img
        run: echo "name=ghcr.io/${GITHUB_REPOSITORY,,}" >> "$GITHUB_OUTPUT"

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ${{ steps.img.outputs.name }}:latest
            ${{ steps.img.outputs.name }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd ~/store-tehesa-api
            git pull --ff-only
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            STRAPI_IMAGE=${{ steps.img.outputs.name }}:${{ github.sha }} \
              docker compose up -d --no-build strapi caddy
            docker image prune -f
```

`git pull` on the box is still needed — `docker-compose.yml` and `Caddyfile` are read from
disk, not baked into the image. Only the Strapi service comes from the registry.

Pin the image tag on the box so a restart doesn't silently pull a different `latest`:

```bash
echo "STRAPI_IMAGE=ghcr.io/rafaelmoro/cms-tehesa:latest" >> ~/store-tehesa-api/.env
```

**Why the `Lowercase image name` step exists:** `${{ github.repository }}` is
`RafaelMoro/cms-tehesa`, and GHCR rejects uppercase in image references — used directly, the
push step fails outright. `${GITHUB_REPOSITORY,,}` is bash lowercasing, so the tag comes out
`ghcr.io/rafaelmoro/cms-tehesa`. Do not "simplify" it back.

**Done when:** a push to `develop` produces a GHCR package and `<DOMAIN>` serves the new
image. Verify with `docker compose images`.

### 6.3 `[AGENT]` Retire the swapfile build path

Once CI deploys are working, the box never runs `npm run build` again. Leave the swapfile
in place anyway — it costs 2 GB of a 60 GB disk and is cheap insurance against a memory
spike. Just stop using `--build` on the server.

**Existing CI is unaffected:** `check-label.yml` and `develop-pipeline.yml` keep running.
Every PR still needs a `major`/`minor`/`patch` label.

---

## 11. Operations

| Task | Command (on the box, in `~/store-tehesa-api`) |
|---|---|
| Tail logs | `docker compose logs -f strapi` |
| Restart Strapi only | `docker compose restart strapi` |
| Full restart | `docker compose down && docker compose up -d` |
| Postgres shell | `docker compose exec postgres psql -U strapi -d strapi` |
| Manual backup now | `./scripts/backup-to-s3.sh` |
| Disk usage | `df -h && docker system df` |
| Reclaim disk | `docker image prune -a -f` |
| Memory check | `free -h && docker stats --no-stream` |
| Deploy a new image manually | `docker compose pull strapi && docker compose up -d strapi` |
| Strapi minor upgrade | bump `@strapi/*` in `package.json`, merge to `develop`, CI redeploys |

**Config changes** (`config/*.ts`) require a rebuilt image — they are compiled into `dist/`.
Push to `develop` and let CI handle it. `.env` changes only need
`docker compose up -d strapi`.

---

## 12. Troubleshooting

**Admin login bounces back to the login screen.**
`url` and/or `proxy` are not set. Check `docker compose exec strapi env | grep -E
'PUBLIC_URL|IS_PROXIED'`. Both must be present and `IS_PROXIED=true`. This is §0.6, and it
is the most common failure in this deployment.

**Build OOM-killed (`exit code 137`).**
Swap is missing or off. `free -h` must show 2.0Gi. Re-run §2.1. After Phase 6 this cannot
happen — the build moves to CI.

**Caddy: `could not get certificate`.**
Almost always DNS. `dig +short <DOMAIN>` must return `<STATIC_IP>`, and port 80 must be
open to the world in the Lightsail firewall. If you have already failed several times,
wait an hour — Let's Encrypt rate-limits 5 failures per hostname per hour. Test with
Caddy's staging CA (`acme_ca https://acme-staging-v02.api.letsencrypt.org/directory`) while
debugging.

**Catalog is empty after a redeploy.**
`pgdata` was not a named volume, or someone ran `docker compose down -v`. `-v` deletes
volumes. Restore from the latest S3 dump (§5.3 in reverse, against the real container).
Verify with `docker volume ls | grep pgdata`.

**`strapi transfer` fails with a token error.**
Transfer tokens expire and are single-shot to display. The remote `TRANSFER_TOKEN_SALT`
must not have changed since the token was minted — regenerating `.env` invalidates every
existing token. Mint a fresh one.

**Backup cron runs but nothing lands in S3.**
Cron has a minimal environment: no `docker` group membership refresh, no `aws` on `PATH`
in some setups. Check `~/backup.log`. Use absolute paths in the crontab entry.

**Uploads disappear on restart.**
The `uploads` volume isn't mounted, or Strapi is writing elsewhere. The mount path must be
`/opt/app/public/uploads`, matching the `WORKDIR` in the Dockerfile.

---

## 13. Cost check & deliberate omissions

| Line item | $/mo |
|---|---|
| Lightsail $12 instance (2 GB) | 12.00 |
| Static IP (attached) | 0.00 |
| Disk, egress (bundled) | 0.00 |
| Postgres (Docker, same box) | 0.00 |
| S3 for nightly dumps | ~0.05 |
| GHCR (private packages) | 0.00 |
| **Total** | **~12.05** |

Deliberately not built, each with its trigger from
[`deployment-research.md`](./deployment-research.md#phase-3--scale-when-triggered):

| Not built | Add it when |
|---|---|
| RDS / point-in-time recovery | Editing becomes weekly rather than quarterly. Only `DATABASE_*` changes; the Compose file stays. |
| S3 uploads + CloudFront | The media library exceeds ~1 GB. Today `public/uploads` is empty. |
| Staging environment | You need one — a second $12 instance beats a $60/mo Strapi Cloud environment. |
| Load balancer / multi-AZ | Real HA becomes a requirement. That is the ECS Fargate + RDS Multi-AZ conversation. |
| Resize to 4 GB | The box sustains >80% RAM. One click, minutes of downtime. |

The single deferred decision worth revisiting on a schedule is **RDS**. The argument for
deferring it is write frequency, not database size: with price updates every three months,
"last night's dump" and "the current state" are almost always identical. That stops being
true the moment editing gets frequent.
