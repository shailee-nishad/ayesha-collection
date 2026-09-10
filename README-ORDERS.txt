AYESHA COLLECTION — ORDERS BACKEND FILES

Files:
1. mysql-schema.sql
2. api/index.php
3. src/backend.ts

These files add:
- customers table
- orders table
- order_items table
- customer order creation
- customer order history
- admin order list
- admin order status update
- stock decrease on successful order creation
- stock restore when an order is cancelled
- transaction + row locking for stock safety

IMPORTANT:
The existing src/main.tsx also needs integration changes because the current checkout
still stores orders in localStorage. I did NOT generate a fake/reconstructed 123 KB
main.tsx. Upload your current src/main.tsx and I can return the exact complete
replacement without risking loss of your existing UI/code.

Before testing:
1. Import mysql-schema.sql into the same database.
2. Keep api/config.php credentials unchanged unless your DB credentials need updating.
3. Replace api/index.php with the supplied file.
4. Replace src/backend.ts with the supplied file.
5. Then replace main.tsx with the exact integrated version.
