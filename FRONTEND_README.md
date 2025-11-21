# Mousquetaire Shop - Frontend Documentation

## Overview

A simple e-commerce frontend built with Symfony and Twig templates.

## Features

### Public Access (No Login Required)

- **Home Page** (`/`) - Landing page with features showcase
- **Products** (`/products`) - Browse all products
- **Product Details** (`/products/{id}`) - View individual product details
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - Create new account

### User Access (Login Required - ROLE_USER)

- **Cart** (`/cart`) - Shopping cart management
- **Account** (`/account`) - View account info and order history

### Admin Access (Login Required - ROLE_ADMIN)

- **Admin Dashboard** (`/admin`) - Statistics overview
- **Manage Products** (`/admin/products`) - Product management
- **Manage Categories** (`/admin/categories`) - Category management
- **Manage Orders** (`/admin/orders`) - Order management
- **Manage Users** (`/admin/users`) - User management

## Test Accounts

After running the fixtures, you can use these test accounts:

### Admin Account

- Email: `admin@shop.com`
- Password: `admin123`
- Access: All routes including admin panel

### Regular User Account

- Email: `client@shop.com`
- Password: `client123`
- Access: Public routes + cart and account

## Security Configuration

The application uses role-based access control:

- `PUBLIC_ACCESS`: Home, Products, Login, Register
- `ROLE_USER`: Cart, Account
- `ROLE_ADMIN`: All admin routes

The security is configured in `config/packages/security.yaml` with proper access control rules.

## Controllers

- `HomeController` - Homepage
- `ProductController` - Product listing and details
- `SecurityController` - Login, registration, logout
- `CartController` - Shopping cart (user only)
- `AccountController` - User account and orders (user only)
- `AdminController` - Admin backoffice (admin only)

## Templates

All templates extend `base.html.twig` which includes:

- Navigation bar with role-based menu items
- Flash messages for user feedback
- Footer

### Template Structure

```
templates/
├── base.html.twig          # Base layout
├── home/
│   └── index.html.twig     # Homepage
├── product/
│   ├── list.html.twig      # Products list
│   └── show.html.twig      # Product details
├── security/
│   ├── login.html.twig     # Login form
│   └── register.html.twig  # Registration form
├── cart/
│   └── index.html.twig     # Shopping cart
├── account/
│   └── index.html.twig     # User account
└── admin/
    ├── dashboard.html.twig # Admin dashboard
    ├── products.html.twig  # Product management
    ├── categories.html.twig # Category management
    ├── orders.html.twig    # Order management
    └── users.html.twig     # User management
```

## Styling

The application uses custom CSS (no framework) located in `assets/styles/app.css` with:

- Modern, clean design
- Responsive layout
- CSS Grid and Flexbox
- CSS Custom Properties (variables)
- Mobile-friendly navigation

## Getting Started

1. Make sure Docker is running
2. Database should already be created and migrated
3. Load fixtures to populate sample data:

   ```bash
   docker compose exec php php bin/console doctrine:fixtures:load
   ```

4. Access the application at `http://localhost` (or your configured port)

## Next Steps

This is a basic frontend foundation. You can extend it with:

- Shopping cart functionality
- Checkout process
- Payment integration
- Product search and filtering
- User profile editing
- Admin CRUD operations for products/categories
- Image upload for products
- Order status updates
- Email notifications
