# Lightsail Maintenance

Written 2026-09-11, the day the [runbook](./lightsail-deployment-runbook.md) finished. It
answers one question: **now that the box exists, what has to be done to keep it running, how
often, and how.** Everything here was checked against the live instance, not assumed.

If you only read one section, read [§2 Calendar](#2-calendar).

---

## 1. Who maintains what

Lightsail is a VPS, not a managed platform. AWS keeps the hardware, hypervisor, network and
the Lightsail console alive. **Everything above the kernel is ours:**

| Layer                          | Maintained by | Mechanism                                              |
| ------------------------------ | ------------- | ------------------------------------------------------ |
| Hardware, hypervisor, network  | AWS           | invisible, no action                                   |
| Ubuntu security patches        | **automatic** | `unattended-upgrades` (verified active)                |
| Ubuntu non-security packages   | us, manual    | `apt-get upgrade`, §3.1                                |
| Kernel — reboot to apply       | us, manual    | §3.2. `unattended-upgrades` installs but never reboots |
| Docker Engine + Compose plugin | us, manual    | §3.1. Docker's apt repo is outside the auto-patch set  |
| `postgres:16-alpine`, `caddy:2-alpine` | us, manual | `docker compose pull`, §3.3                        |
| Strapi image (`ghcr.io/rafaelmoro/cms-tehesa`) | us, via CI | bump `package.json`, merge to `develop`, §3.4 |
| TLS certificate                | **automatic** | Caddy renews from Let's Encrypt at 2/3 of lifetime     |
| Nightly `pg_dump` to S3        | **automatic** | cron `0 3 * * *`, §3.6 verifies it                     |
| Instance snapshots             | **automatic** | Lightsail daily snapshots, §3.7 reviews cost           |
| Secrets, tokens, access keys   | us, manual    | §3.9                                                   |

---

## 2. Calendar

Everything is either automatic, on a cadence, or triggered by an event. A cadence task that
slips a week is fine; one that slips a quarter is not.

### Automatic — nothing to do, but know it happens

| What                          | When                      | Where to see it                                         |
| ----------------------------- | ------------------------- | ------------------------------------------------------- |
| Security patches installed    | daily, random time        | `/var/log/unattended-upgrades/unattended-upgrades.log`  |
| DB dump to S3                 | 03:00 UTC nightly         | `~/backup.log`, `aws s3 ls s3://tehesa-strapi-backups/pg/` |
| Old dumps expire              | 30 days after upload      | S3 lifecycle rule `expire-pg-dumps`                     |
| Instance snapshot             | daily (console-chosen hour) | Lightsail → instance → Snapshots                      |
| TLS renewal                   | ~day 60 of a 90-day cert  | `docker compose logs caddy \| grep -i renew`            |
| Deploy                        | every push to `develop`   | GitHub Actions → *Deploy to Lightsail*                  |

### Monthly — ~15 minutes

| # | Task                                    | Section |
| - | --------------------------------------- | ------- |
| 1 | Health check: disk, memory, containers, backup landed, cert valid | §3.5 |
| 2 | Apply pending non-security `apt` updates, incl. Docker | §3.1 |
| 3 | Reboot if `/var/run/reboot-required` exists | §3.2 |
| 4 | Pull fresh `postgres`/`caddy` images       | §3.3 |
| 5 | Prune dangling images                      | §3.8 |

Do 2–5 in one sitting, in that order, right after a manual backup. Total downtime is
~3 minutes (Strapi takes ~2 min to boot on 512 MB).

### Quarterly — ~30 minutes

| # | Task                                    | Section |
| - | --------------------------------------- | ------- |
| 1 | Restore drill from a real S3 object     | §3.6    |
| 2 | Strapi minor/patch upgrade (`@strapi/*`, `pg`, `sharp`) | §3.4 |
| 3 | Review snapshot count and cost          | §3.7    |
| 4 | Review Lightsail firewall — still only 22/80/443 IPv4, IPv6 closed | §3.10 |
| 5 | Review the AWS bill: still ≈ $5.05      | §3.7    |

### Yearly

| # | Task                                    | Section |
| - | --------------------------------------- | ------- |
| 1 | Rotate the S3 backup IAM access key     | §3.9    |
| 2 | Rotate the CI deploy SSH key            | §3.9    |
| 3 | Rotate the frontend read-only API token | §3.9    |
| 4 | Check lifecycle dates (§4) — anything ending within 12 months gets a plan | §4 |

### Event-driven

| Trigger                                                  | Action                                   |
| -------------------------------------------------------- | ---------------------------------------- |
| Strapi security advisory (GitHub → repo → Security, or Strapi's release notes) | upgrade within a week, §3.4 |
| Docker / Postgres / Caddy CVE                            | §3.1 / §3.3 out of cycle                 |
| Admin feels slow, or `logs strapi` shows `killed`/OOM     | resize to 2 GB, §3.11                    |
| Disk over 80%                                            | §3.8, then §3.11 if it keeps growing     |
| `backup.log` shows anything but `backup ok`             | fix the same day — an unbackuped day is the whole risk |
| Editing goes from quarterly to weekly                    | revisit RDS, runbook §13                 |

---

## 3. Procedures

All commands run on the box as `ubuntu` in `~/store-tehesa-api` unless stated. `ssh tehesa`
gets you there.

### 3.0 Before anything that restarts a container or the host

```bash
cd ~/store-tehesa-api
./scripts/backup-to-s3.sh          # must print "backup ok"
```

For OS/kernel/Docker changes (§3.1–3.2) also take a manual snapshot first: Lightsail → instance
→ Snapshots → *Create snapshot*. Daily automatic snapshots are up to 24 h stale.

### 3.1 OS and Docker package updates — monthly

`unattended-upgrades` covers `noble-security` only. As of writing there are **123** packages
pending outside that set, and Docker (from `download.docker.com`) is among them — it is
**never** auto-updated.

```bash
sudo apt-get update
apt list --upgradable 2>/dev/null | grep -E '^docker|^containerd'   # know if Docker is in the batch
sudo apt-get upgrade -y
sudo apt-get autoremove -y
```

If Docker or containerd was upgraded, the daemon restarts and **so do all containers**
(`restart: unless-stopped`). Expect ~2 min until Strapi answers again. Verify:

```bash
docker ps --format '{{.Names}} {{.Status}}'     # three rows, postgres "(healthy)"
curl -sI https://tehesa-strapi.budget-master.space/admin | head -1    # HTTP/2 200
```

**Done when:** `apt list --upgradable` is empty and the curl returns 200.

### 3.2 Reboot — monthly if required

Kernel updates land via `unattended-upgrades` but only apply on reboot; the box never reboots
itself (`Automatic-Reboot` is unset, deliberately — a surprise 02:00 reboot on a 512 MB box
that takes 2 min to recover is worse than a planned one).

```bash
ls /var/run/reboot-required && cat /var/run/reboot-required.pkgs
```

If the file exists: §3.0, then `sudo reboot`. Wait ~3 min, then:

```bash
ssh tehesa 'uptime; swapon --show; docker ps --format "{{.Names}} {{.Status}}"'
```

`swapon --show` must list `/swapfile` — if it does not, `/etc/fstab` lost the line and the next
memory spike kills Strapi. `docker ps` must show all three containers; Compose brings them back
because of `restart: unless-stopped`, not because of anything in systemd.

**Done when:** uptime is minutes, swap is on, `/admin` returns 200.

### 3.3 Postgres and Caddy image refresh — monthly

Both run floating tags (`16-alpine`, `2-alpine`) so a pull picks up patch releases within the
same major line. Neither has a schema or config migration inside a major.

```bash
docker compose pull postgres caddy
docker compose up -d postgres caddy    # only recreates a container whose image changed
docker compose ps
```

Recreating `postgres` restarts Strapi too (`depends_on … service_healthy`). Budget 3 min.

**Never** pull `postgres:17-alpine` this way. A Postgres **major** is a dump-and-restore
operation, not an image swap — the on-disk format changes and the container refuses to start
on the old `pgdata`. When 16 nears EOL (§4) that is a planned task: dump with §3.0, change the
tag, `docker compose down`, `docker volume rm store-tehesa-api_pgdata`, `up -d postgres`,
restore the dump, `up -d`.

**Done when:** `docker compose images` shows the new image IDs and `/admin` returns 200.

### 3.4 Strapi upgrade — quarterly, or on advisory

Strapi is `5.31.0` in `package.json`. Minor and patch releases within 5.x are upgrades of
`package.json`; the deploy pipeline does the rest.

Locally, on a branch:

```bash
npx @strapi/upgrade minor      # or: npx @strapi/upgrade patch
npm install
npm run dev                    # admin loads, GraphQL answers
npx tsc --noEmit
```

Open a PR to `develop` with a `minor` label (or `patch`), merge. CI builds the image and
deploys it; Strapi runs its own DB migrations on first boot of the new version. Watch:

```bash
docker compose logs -f strapi        # on the box, during the deploy
```

Do §3.0 before merging — Strapi's migrations are forward-only, and a rollback is "redeploy the
previous SHA from GHCR **and** restore the dump", not just the former.

`@strapi/upgrade major` (5 → 6, when it exists) is a project, not a maintenance task. Read the
migration guide first and budget a day.

**Done when:** *Deploy to Lightsail* is green, admin → Settings shows the new version, the
storefront still renders the catalog.

### 3.5 Monthly health check — 5 minutes

One command, read the output against the expectations beside it:

```bash
ssh tehesa 'cd ~/store-tehesa-api; \
  df -h / | tail -1; \
  free -h | head -2; swapon --show; \
  docker ps --format "{{.Names}} {{.Status}}"; \
  tail -3 ~/backup.log; \
  ls /var/run/reboot-required 2>/dev/null; \
  echo | openssl s_client -connect tehesa-strapi.budget-master.space:443 -servername tehesa-strapi.budget-master.space 2>/dev/null | openssl x509 -noout -enddate; \
  docker compose logs --since 720h strapi 2>&1 | grep -ciE "error|killed" '
```

| Line                | Healthy                              | Act if                                |
| ------------------- | ------------------------------------ | ------------------------------------- |
| `df`                | < 70% used (baseline 59%, 11 G)      | > 80% → §3.8                          |
| `free` / `swapon`   | swap present, < 1 G used             | swap missing → §3.2 recovery; > 1.5 G used → §3.11 |
| `docker ps`         | 3 rows, postgres `(healthy)`, no restarts counted | any `Restarting` → runbook §12 |
| `backup.log`        | last line `backup ok: <yesterday>`   | anything else → fix today             |
| `reboot-required`   | absent                               | present → §3.2                        |
| `notAfter`          | > 30 days out                        | < 14 days → Caddy renewal is failing, check `logs caddy`, port 80 open, DNS |
| error count         | 0 or a handful                       | hundreds → read the log               |

Also glance at S3: the console shows ~30 objects under `pg/`, newest dated today, each a few
hundred KB. A run of identically-sized files is normal (the catalog changes quarterly); a
sudden tiny file is what the script's size guard exists to prevent — if you see one, the guard
is broken.

### 3.6 Backup verification — quarterly restore drill

The nightly dump is only a backup if it restores. Runbook §5.3 already has the drill; the
quarterly version must use **the S3 object**, not a fresh dump, because the thing being tested
is the upload.

The backup IAM user is `PutObject`-only, so either download via the console and `scp` it to the
box, or (recommended, one-time) add to the inline policy:

```json
{ "Effect": "Allow", "Action": ["s3:GetObject"], "Resource": "arn:aws:s3:::tehesa-strapi-backups/pg/*" },
{ "Effect": "Allow", "Action": ["s3:ListBucket"], "Resource": "arn:aws:s3:::tehesa-strapi-backups" }
```

Then:

```bash
LATEST=$(aws s3 ls s3://tehesa-strapi-backups/pg/ | sort | tail -1 | awk '{print $4}')
aws s3 cp "s3://tehesa-strapi-backups/pg/$LATEST" /tmp/restore.sql.gz
docker run -d --name pgtest -e POSTGRES_PASSWORD=test -e POSTGRES_USER=strapi -e POSTGRES_DB=strapi postgres:16-alpine
sleep 10
gunzip -c /tmp/restore.sql.gz | docker exec -i pgtest psql -U strapi -d strapi -q
docker exec pgtest psql -U strapi -d strapi -tAc "SELECT count(*) FROM product_variants;"
docker rm -f pgtest; rm /tmp/restore.sql.gz
```

Note the count in the PR or commit that closes the quarter. It is 18,088 today; it changes only
when the catalog does.

`pgtest` needs ~100 MB RAM on a box with 167 MB available — it fits, but do not run this
during a deploy.

### 3.7 Snapshots and cost — quarterly

Lightsail snapshots are billed at **$0.05/GB-month** of *used* disk, incremental. The
automatic-snapshot setting keeps the **latest 7** and deletes older ones itself, so cost is
bounded (~11 G used → well under $1/mo). Manual snapshots (§3.0) are **never** auto-deleted —
that is the thing that grows. Lightsail → Snapshots → delete any manual one older than the
newest successful monthly maintenance.

Check the bill: Billing → Bills → filter *Lightsail* and *S3*. Anything above ~$6 has a reason
to find.

### 3.8 Disk hygiene — monthly, and at 80%

Disk is 20 GB; 11 GB used after the first deploy, 3 GB of which is one Strapi image. Every CI
deploy pulls a new 3 GB image and prunes only *dangling* ones, so at most two Strapi images
should exist at a time.

```bash
docker system df                              # what is using space
docker image prune -a -f                      # everything not used by a running container
sudo journalctl --vacuum-time=30d
sudo apt-get clean
```

**Known gap:** `/etc/docker/daemon.json` does not exist, so container logs use the `json-file`
driver with **no size cap**. Today they total 156 KB; a Strapi crash loop can fill the disk.
One-time fix, apply during the next §3.1 window (it restarts the daemon):

```bash
sudo tee /etc/docker/daemon.json >/dev/null <<'EOF'
{ "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" } }
EOF
sudo systemctl restart docker
docker compose up -d --force-recreate     # log options apply only to newly created containers
```

### 3.9 Secret and key rotation — yearly

None of these expire on their own; rotation is hygiene, not a fire drill. Rotate one at a time
and verify before the next.

| Secret                       | Rotate how                                                                                                                                          | Verify                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| S3 backup access key         | IAM → user `tehesa-strapi-backup` → create second key → `ssh tehesa aws configure` with it → `./scripts/backup-to-s3.sh` → deactivate, then delete the old key | `backup ok`                    |
| CI deploy SSH key            | `ssh-keygen -t ed25519 -f ~/.ssh/tehesa_deploy_new -N ""` → append `.pub` to the box's `authorized_keys` → replace GitHub secret `SSH_KEY` → *Run workflow* → remove the old line from `authorized_keys` | deploy run green |
| Frontend read-only API token | admin → Settings → API Tokens → create new read-only → update Vercel `STRAPI_API_TOKEN` → redeploy `fe-tehesa` → delete the old token | storefront renders |
| Admin password               | admin → profile. Also enable a password manager entry if it is not in one already.                                                                  | login survives refresh                    |

**Do not** regenerate the `.env` secrets (`APP_KEYS`, `*_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`).
Changing `API_TOKEN_SALT` invalidates every API token, `ADMIN_JWT_SECRET` logs out every admin,
and `ENCRYPTION_KEY` makes encrypted fields unreadable. There is no routine reason to touch them.

### 3.10 Firewall and access review — quarterly

Lightsail → instance → Networking. Target state is unchanged from the runbook:

- IPv4: SSH 22 anywhere (CI needs it; key-only auth), HTTP 80 anywhere, HTTPS 443 anywhere.
  **Nothing else.**
- IPv6: nothing.

On the box, `docker ps` must show published ports only on `caddy` (`80`, `443`). If `5432` or
`1337` ever appears, something edited `docker-compose.yml` — revert it.

```bash
cat ~/.ssh/authorized_keys | wc -l      # 2: your key + the CI deploy key. Any extra line is a question.
sudo grep -c 'Failed password' /var/log/auth.log   # noise is normal on port 22; PasswordAuthentication is off, so it cannot succeed
```

### 3.11 Resize to 2 GB — when triggered

The box runs at 246 MB RSS + 367 MB swap on a 414 MB usable total. It works, but there is no
headroom. Triggers: admin sluggish, `exit code 137` / `killed` in `logs strapi`, swap
consistently > 1.5 G, or the disk (20 GB) filling.

Lightsail has no in-place resize. §3.0, then Lightsail → Snapshots → *Create new instance* from
the latest → pick the **$12 (2 GB)** plan, same region, **same SSH key** → once it boots,
Networking → detach the static IP from the old instance and attach to the new. DNS does not
change. Firewall rules **do not** carry over — re-add HTTPS 443 (runbook §1.4). Verify with
§3.5, then delete the old instance (stop paying for it the same day).

The `ubuntu` user, crontab, `.env`, Docker volumes and `~/.aws` are all in the snapshot.
Nothing in the repo changes.

---

## 4. Lifecycle dates

Nothing here is urgent; each is a yearly-check item that becomes a planned task ~6 months out.

| Component                | Version now    | Support ends         | Then                                             |
| ------------------------ | -------------- | -------------------- | ------------------------------------------------ |
| Ubuntu 24.04 LTS         | 24.04.4        | April 2029 (standard) | `do-release-upgrade` to 26.04 LTS, after a snapshot |
| Node (in the image)      | 22 (`node:22-alpine`) | April 2027    | bump `FROM node:24-alpine` in `Dockerfile`; `package.json` already allows `<=24` |
| Postgres 16              | 16.x           | November 2028        | dump/restore to 17 or 18, §3.3 last paragraph    |
| Strapi 5                 | 5.31.0         | until Strapi 6 + ~1 y | `@strapi/upgrade major`, a project               |
| Caddy 2                  | 2.x            | rolling              | none                                             |
| Let's Encrypt cert       | 90-day         | auto-renews          | none, unless §3.5 shows `notAfter` < 14 d        |

---

## 5. Deliberately not done

| Not done                                   | Why not yet                                           | Add it when                             |
| ------------------------------------------ | ----------------------------------------------------- | --------------------------------------- |
| Uptime monitoring / alerting               | Nobody is on call; the storefront is the alert         | The store has customers who notice before you do — then a free UptimeRobot check on `/admin` |
| Backup-failure alerting                    | §3.5 reads the log monthly                             | Same trigger. Simplest: cron `MAILTO`, or a `curl` to a healthchecks.io ping at the end of the script |
| `Automatic-Reboot "true"`                  | 2-min recovery on 512 MB; prefer planned reboots       | After resizing to 2 GB, if monthly reboots keep slipping |
| Docker in the auto-upgrade origins         | Daemon restart = 2 min downtime at a random hour       | Same as above                           |
| Watchtower / auto image pulls              | Unattended container swaps on a 512 MB box             | Never, at this size; CI already deploys Strapi |
| Fail2ban                                   | Key-only auth; log noise is not a risk                 | If `auth.log` grows enough to matter for disk |
