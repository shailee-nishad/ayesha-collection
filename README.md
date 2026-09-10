# Ayesha Collection — React + TypeScript + PHP + MySQL

The storefront design is unchanged. Supabase has been removed. The live catalog/admin backend uses PHP + MySQL, which is a natural fit for Hostinger web hosting.

## Local development

You need PHP 8+ and MySQL/MariaDB if you want to test the live backend locally.

1. Install frontend packages:
```bash
npm install
```
2. Build/test frontend:
```bash
npm run build
```
3. Start PHP API from the project folder:
```bash
php -S 127.0.0.1:8000 api/router.php
```
4. In a second Terminal window start Vite:
```bash
npm run dev
```
Vite proxies `/api` requests to the PHP server.

For a real local MySQL database, create `ayesha_collection`, import `mysql-schema.sql`, then put the local database credentials in `api/config.php`.

## Hostinger deployment

1. Create a MySQL database in **Hostinger hPanel → Databases → MySQL Databases**.
2. Import `mysql-schema.sql` using phpMyAdmin.
3. Edit `api/config.php`:
```php
const DB_HOST = 'localhost';
const DB_NAME = 'YOUR_DATABASE_NAME';
const DB_USER = 'YOUR_DATABASE_USER';
const DB_PASS = 'YOUR_DATABASE_PASSWORD';
```
Use the exact database name/user/password shown by Hostinger.
4. Build the frontend:
```bash
npm run build
```
5. Upload the contents of the generated `dist/` folder to `public_html/`.
6. Also upload the `api/` folder and `.htaccess` into `public_html/`.
   Your final structure should look like:
```text
public_html/
  index.html
  assets/
  ayesha-logo.png
  api/
    index.php
    config.php
    setup-admin.php
    uploads/
      products/
  .htaccess
```
7. Make sure `api/uploads/products/` is writable by PHP (normally 755 works; if Hostinger requires it, use 775).
8. Open:
`https://YOUR-DOMAIN.com/api/setup-admin.php`
Create the client's admin email and password.
9. **Immediately delete or rename `api/setup-admin.php`** after the account is created.
10. Admin login:
`https://YOUR-DOMAIN.com/admin/login`

## Live product management

The client can:
- Add products
- Edit products
- Delete products
- Change price/MRP/stock/category/sizes/colors/fit/tags/description
- Upload product images
- Changes are saved in MySQL and appear on the storefront

The storefront reads products from `GET /api/products`. If the database is empty or unavailable during development, the 40 built-in demo products remain available.

## Security

- Admin passwords use PHP `password_hash()` / `password_verify()`.
- Admin authentication uses an HttpOnly, SameSite session cookie.
- Product writes and image uploads require an authenticated admin session.
- SQL uses PDO prepared statements.
- Never put database passwords in frontend code.
- Do not keep `setup-admin.php` on a live site after creating the first admin.
- Card/payment information is not stored by this demo.

## Payment

Checkout UI is still a demo payment flow. A real gateway such as Razorpay requires merchant credentials and a server-side payment/order verification implementation. That is separate from the free MySQL catalog/admin backend.
