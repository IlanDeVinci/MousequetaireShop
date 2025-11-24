# Mousquetaire Shop

Mousquetaire Shop is a Docker-first Symfony 7.2 build that exposes an API Platform backend, PostgreSQL 16 database, and a GSAP-animated storefront. Everything runs in containers, but Composer installs, migrations, and fixtures remain manual so you stay in control of the workflow.

---

## Feature Highlights

- **Shopfront essentials** – Infinite-scroll catalog, real-time stock badges, responsive layout, and a LocalStorage cart badge that syncs across tabs.
- **Admin & operations** – CRUD for products, categories, orders, users, plus a banner editor to tweak the hero message without redeploying.
- **API & security** – `/api/docs` via API Platform, JWT login handled by the Lexik bundle, ROLE_USER vs ROLE_ADMIN policies, and custom state processors on write endpoints.
- **UX polish** – `<product-card>` and `<search-bar>` Web Components, debounced search endpoint, GSAP ScrollTrigger animations on every public section.

Recent fixes (22 Nov 2025) restored ES module MIME types, made add-to-cart reliable everywhere, improved image loading, and refreshed footer colors. See `CORRECTIONS_22NOV2025.md` for details.

---

## Tech Stack

- **Backend**: Symfony 7.2, API Platform 4, PHP-FPM 8.3
- **Database**: PostgreSQL 16
- **Auth**: Lexik JWT authentication bundle (`config/jwt/`)
- **Frontend**: Vanilla JS + GSAP 3, Symfony AssetMapper
- **Containers**: `php`, `nginx`, `database`, `mailpit`

---

## Project Layout

```text
MousequetaireShop/
├─ assets/            # JS, styles, Web Components
├─ config/            # Symfony and API Platform config
├─ docker/            # Custom PHP and Nginx images
├─ migrations/        # Doctrine migrations
├─ public/            # Front controller + assets
├─ src/               # Entities, controllers, state processors
├─ templates/         # Twig views
├─ tests/             # PHPUnit bootstrap
└─ compose.yaml       # Docker services
```

---

## Getting Started

> **Automated Setup**: The Docker containers now automatically install Composer dependencies and warm up the cache on first boot. You only need to generate JWT keys and run database migrations manually.

1. **Clone the repo**

   ```bash
   git clone https://github.com/your-username/MousequetaireShop.git
   cd MousequetaireShop
   ```

2. **Create `.env.local`**

   ```bash
   @"
   DATABASE_URL="postgresql://app:app@database:5432/app?serverVersion=16&charset=utf8"
   JWT_PASSPHRASE=change-me
   APP_SECRET=change-me-too
   "@ | Set-Content .env.local
   ```

3. **Build and start containers**

   ```bash
   docker compose build
   docker compose up -d
   ```

   The PHP container will automatically:

   - Wait for the database to be ready
   - Install Composer dependencies if `vendor/autoload.php` doesn't exist
   - Warm up Symfony cache if not present
   - Set proper file permissions

4. **Generate JWT keys**

   ```bash
   docker compose exec php php bin/console lexik:jwt:generate-keypair
   ```

5. **Create database & run migrations**

   ```bash
   docker compose exec php php bin/console doctrine:database:create --if-not-exists
   docker compose exec php php bin/console doctrine:migrations:migrate --no-interaction
   ```

6. **Load demo fixtures (optional)**

   ```bash
   docker compose exec php php bin/console doctrine:fixtures:load --no-interaction
   ```

7. **Open the app**

   - Storefront: [http://localhost:8080](http://localhost:8080)
   - API docs: [http://localhost:8080/api/docs](http://localhost:8080/api/docs)
   - Mailpit: [http://localhost:8025](http://localhost:8025)

Shut everything down later with `docker compose down`.

---

## Demo Data

- Admin: `admin@shop.com` / `admin123`
- Client: `client@shop.com` / `client123`
- Fixtures seed 5 categories, 14 products with images, and sample orders so the UI looks alive immediately.

---

## Handy Commands

### Symfony console

```bash
docker compose exec php php bin/console
docker compose exec php php bin/console cache:clear
docker compose exec php php bin/console debug:router
```

### Database maintenance

```bash
docker compose exec database psql -U app -d app
docker compose exec php php bin/console doctrine:database:drop --force
docker compose exec php php bin/console doctrine:database:create
docker compose exec php php bin/console doctrine:migrations:migrate --no-interaction
docker compose exec php php bin/console doctrine:fixtures:load --no-interaction
```

### Docker helpers

```bash
docker compose logs -f
docker compose build --no-cache
docker compose down
docker compose exec php sh
```

---

## Troubleshooting

- **Port already in use** – Edit `compose.yaml` and change the `8080:80` mapping on the `nginx` service.
- **Missing JWT keys** – Re-run `lexik:jwt:generate-keypair` inside the PHP container.
- **Cache or log bloat** – `docker compose exec php sh -c "rm -rf var/cache/* var/log/*"` then `docker compose exec php php bin/console cache:clear`.
- **Linux/Mac permissions** – `sudo chown -R $(id -u):$(id -g) .` before building.

---
