# Mousquetaire Shop - E-commerce Platform

A modern e-commerce platform built with Symfony 7.2, API Platform, Docker, and GSAP animations. Features a REST API backend with JWT authentication, role-based access control, animated frontend, shopping cart, and complete admin dashboard.

## ✨ Features

### Frontend

- 🎨 **Modern Animated UI** - GSAP-powered animations with ScrollTrigger
- 🛒 **Shopping Cart** - Full cart functionality with localStorage persistence
- 📱 **Responsive Design** - Mobile-friendly interface
- ⚡ **Real-time Updates** - Dynamic cart badge and notifications
- 🎯 **Product Catalog** - Browse products with stock indicators
- 🔍 **Dynamic Search** - Real-time product search with instant results
- 🧩 **Web Components** - Modern custom elements for product cards
- ♾️ **Infinite Scroll** - Load more products dynamically
- 🎭 **Scroll Animations** - GSAP ScrollTrigger animations on all pages

### Backend

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Admin and Client user roles
- 📦 **Product Management** - CRUD operations for products and categories
- 🛍️ **Order System** - Complete order and order item management
- 📊 **API Platform** - Auto-generated API documentation
- 🐳 **Fully Dockerized** - No local dependencies required

### Admin Dashboard

- ✏️ **Product CRUD** - Create, edit, and delete products
- 🏷️ **Category Management** - Organize products by categories
- 🎨 **Banner Editor** - Update the top banner text dynamically
- 📈 **Statistics** - Real-time dashboard with key metrics
- 👤 **User Management** - View and manage users
- 📋 **Order Management** - Track customer orders

## Tech Stack

- **Backend**: Symfony 7.2 + API Platform 4
- **Database**: PostgreSQL 16
- **Authentication**: JWT (lexik/jwt-authentication-bundle)
- **Web Server**: Nginx
- **PHP**: 8.3 with FPM
- **Frontend**: GSAP 3.x, Vanilla JavaScript
- **Node.js**: 20.x (for asset management)

## Prerequisites

The only requirement is:

- **Docker Desktop** installed and running

Everything else runs in containers!

## Quick Start - Setup from GitHub Clone

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/MousequetaireShop.git
cd MousequetaireShop
```

### 2. Create Environment Configuration

Create a `.env.local` file in the project root:

```bash
# On Windows PowerShell:
@"
DATABASE_URL="postgresql://app:app@database:5432/app?serverVersion=16&charset=utf8"
JWT_PASSPHRASE=your-secret-passphrase-change-this
APP_SECRET=your-app-secret-change-this-to-random-string
"@ | Set-Content .env.local

# On Linux/Mac:
cat > .env.local << EOF
DATABASE_URL="postgresql://app:app@database:5432/app?serverVersion=16&charset=utf8"
JWT_PASSPHRASE=your-secret-passphrase-change-this
APP_SECRET=your-app-secret-change-this-to-random-string
EOF
```

### 3. Build and Start Docker Containers

```bash
docker compose build
docker compose up -d
```

### 4. Install Dependencies

```bash
docker compose exec php composer install
```

### 5. Generate JWT Keys

```bash
docker compose exec php php bin/console lexik:jwt:generate-keypair
```

### 6. Create Database and Run Migrations

```bash
docker compose exec php php bin/console doctrine:database:create --if-not-exists
docker compose exec php php bin/console doctrine:migrations:migrate --no-interaction
```

### 7. Load Sample Data (Optional)

```bash
docker compose exec php php bin/console doctrine:fixtures:load --no-interaction
```

This creates:

- Admin user: `admin@shop.com` / `admin123`
- Client user: `client@shop.com` / `client123`
- 5 categories
- 14 products with sample data

### 8. Access the Application

- **API Documentation**: http://localhost:8080/api/docs
- **API Endpoint**: http://localhost:8080/api
- **Mailpit (Email Testing)**: http://localhost:8025
- **Homepage**: http://localhost:8080

## API Usage

### Authentication

**Login:**

```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@shop.com\",\"password\":\"admin123\"}"
```

Response:

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Use the token in subsequent requests:**

```bash
curl http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### User Registration

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"newuser@example.com\",
    \"plainPassword\":\"password123\",
    \"firstName\":\"Jane\",
    \"lastName\":\"Smith\"
  }"
```

### Available Endpoints

- `GET /api/products` - List all products (public)
- `POST /api/products` - Create product (admin only)
- `GET /api/categories` - List categories (public)
- `GET /api/orders` - List orders (admin sees all, users see their own)
- `POST /api/orders` - Create order (authenticated users)
- `GET /api/users` - List users (admin only)

## User Roles

### ROLE_USER (Clients)

- Browse products and categories
- Create and view their own orders
- Update their own profile

### ROLE_ADMIN (Administrators)

- All ROLE_USER permissions
- Create, update, delete products
- Create, update, delete categories
- View and manage all orders
- View all users

## Project Structure

```
MousequetaireShop/
 config/              # Symfony configuration
    packages/        # Bundle configurations
    routes/          # Route definitions
 docker/              # Docker configurations
    nginx/           # Nginx config
 migrations/          # Database migrations
 public/              # Public web directory
    index.php        # Application entry point
 src/
    Entity/          # Doctrine entities
       User.php
       Product.php
       Category.php
       Order.php
       OrderItem.php
    Repository/      # Doctrine repositories
    State/           # API Platform state processors
    DataFixtures/    # Sample data
    Kernel.php
 compose.yaml         # Docker Compose configuration
 Dockerfile           # PHP container definition
 README.md
```

## Development Commands

### Symfony Console

```bash
# Access Symfony console
docker compose exec php php bin/console

# Clear cache
docker compose exec php php bin/console cache:clear

# List all routes
docker compose exec php php bin/console debug:router

# Create a new migration
docker compose exec php php bin/console make:migration
```

### Database Commands

```bash
# Access PostgreSQL CLI
docker compose exec database psql -U app -d app

# Reset database
docker compose exec php php bin/console doctrine:database:drop --force
docker compose exec php php bin/console doctrine:database:create
docker compose exec php php bin/console doctrine:migrations:migrate --no-interaction
docker compose exec php php bin/console doctrine:fixtures:load --no-interaction
```

### Docker Commands

```bash
# View logs
docker compose logs -f

# Stop containers
docker compose down

# Rebuild containers
docker compose build --no-cache

# Access PHP container shell
docker compose exec php sh
```

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, edit `compose.yaml`:

```yaml
nginx:
  ports:
    - "8081:80" # Change 8080 to any available port
```

### Permission Issues (Linux/Mac)

```bash
sudo chown -R $(id -u):$(id -g) .
```

### Clear All Caches

```bash
docker compose exec php sh -c "rm -rf var/cache/* var/log/*"
docker compose exec php php bin/console cache:clear
```

### JWT Keys Missing

```bash
docker compose exec php php bin/console lexik:jwt:generate-keypair
```

## Production Deployment

For production deployment:

1. Update `.env` with production values
2. Change `APP_ENV=prod` and `APP_DEBUG=0`
3. Use strong secrets for `APP_SECRET` and `JWT_PASSPHRASE`
4. Configure proper database credentials
5. Enable HTTPS
6. Set up proper CORS configuration
7. Optimize Composer autoloader:
   ```bash
   docker compose exec php composer install --no-dev --optimize-autoloader
   ```

## License

This project is open-source and available under the MIT License.

## Support

For issues and questions:

- Check the [Symfony Documentation](https://symfony.com/doc/current/index.html)
- Review [API Platform Documentation](https://api-platform.com/docs/)
- Open an issue on GitHub

## Credits

Built with ❤️ using Symfony, API Platform, Docker, and GSAP.

## Recent Updates (November 22, 2025)

### 🎉 Major Enhancements

1. **Web Components Architecture**

   - Custom `<product-card>` element with Shadow DOM
   - Custom `<search-bar>` element for dynamic search
   - Fully reusable and AJAX-loadable components (Shopify-style)

2. **Dynamic Product Loading**

   - Load more products with AJAX
   - Filter products by stock availability
   - Smooth GSAP animations for new content

3. **Real-time Search**

   - Instant search results as you type
   - Debounced API calls (300ms)
   - Highlighted search terms in results

4. **Complete ScrollTrigger Integration**

   - Product cards animate on scroll
   - Hero section animations
   - Footer animations
   - Section-based triggers

5. **Bug Fixes**
   - ✅ Fixed MIME type error for JavaScript modules
   - ✅ Fixed product images display (uploaded images now show)
   - ✅ Fixed "Add to Cart" buttons on all pages
   - ✅ Fixed footer styling (correct background color)
   - ✅ Implemented missing ScrollTrigger animations

### 📚 Documentation

- `WEB_COMPONENTS.md` - Web Components usage guide
- `CORRECTIONS_22NOV2025.md` - Detailed changelog
- `GUIDE_DEMARRAGE.md` - Quick start guide (French)

### 🔗 New API Endpoints

- `GET /api/products/search?q={query}` - Product search
- `GET /api/products?page={page}&limit={limit}` - Paginated products
- `GET /api/products/filter?in_stock=true` - Filter products
