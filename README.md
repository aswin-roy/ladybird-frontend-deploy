# LADYBIRD - Billing & Tailoring Software

A comprehensive billing and tailoring management software frontend featuring inventory tracking, stock management, order management, and reporting dashboards.

## Features

- **Authentication**: Login, Sign Up, and Forgot Password
- **Dashboard**: Overview of business performance with key metrics
- **Customer Management**: Add, edit, delete, and search customers
- **Order Management**: Track orders, assign workers, update status
- **Inventory Management**: Manage products, stock, and categories
- **Sales Entry**: Create bills with product selection and payment tracking
- **Sales Reports**: View transaction history, add payments, print invoices
- **Measurements**: Store and manage customer measurements
- **Work Schedule**: Calendar view of production schedule
- **Worker Reports**: Track worker performance and commissions

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Backend API server (see API Configuration below)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your API URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building for Production

Build the project:
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

Preview the production build:
```bash
npm run preview
```

## Production Deployment

### Environment Variables

Create a `.env.production` file or set environment variables in your hosting platform:

```
VITE_API_URL=https://your-api-domain.com/api
```

### Deployment Options

#### 1. Static Hosting (Vercel, Netlify, GitHub Pages)

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting platform
3. Set environment variables in your hosting platform's dashboard

#### 2. Traditional Web Server (Nginx, Apache)

1. Build the project: `npm run build`
2. Copy the `dist/` folder contents to your web server's public directory
3. Configure your server to serve `index.html` for all routes (for React Router support)

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ladybird/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## API Configuration

This frontend expects a REST API with the following endpoints:

### Base URL
Set via `VITE_API_URL` environment variable (default: `http://localhost:5000/api`)

### Required Endpoints

- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/forgot-password` - Password reset
- `GET /dashboard/stats` - Dashboard statistics
- `GET /customers` - Get all customers
- `POST /customers` - Create customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `POST /customers/bulk-delete` - Bulk delete customers
- `GET /products` - Get all products
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /orders` - Get all orders
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order
- `GET /bills` - Get all bills
- `POST /bills` - Create bill
- `POST /bills/:id/payment` - Add payment to bill
- `GET /workers` - Get all workers
- `POST /workers` - Create worker
- `PUT /workers/:id` - Update worker
- `DELETE /workers/:id` - Delete worker
- `GET /measurements` - Get all measurements
- `GET /measurements/customer/:id` - Get measurements by customer
- `POST /measurements` - Create measurement
- `PUT /measurements/:id` - Update measurement
- `DELETE /measurements/:id` - Delete measurement

### Authentication

The API should return a JWT token on successful login/signup. The token is stored in `localStorage` as `auth_token` and sent in the `Authorization` header as `Bearer {token}` for all authenticated requests.

## Project Structure

```
src/
├── pages/          # Page components (Login, Dashboard, Customers, etc.)
├── components/     # Shared UI components (Sidebar, StatCard, etc.)
├── services/      # API service layer
│   ├── api.ts     # Base API client
│   ├── authService.ts
│   ├── customerService.ts
│   ├── productService.ts
│   ├── orderService.ts
│   ├── billService.ts
│   ├── workerService.ts
│   ├── measurementService.ts
│   └── dashboardService.ts
├── types/         # TypeScript type definitions
├── App.tsx        # Main application component
├── main.tsx       # Application entry point
└── index.css      # Global styles
```

## Technologies

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (Icons)

## API Integration

All data is fetched from the backend API. The frontend includes:
- Loading states for all API calls
- Error handling with user-friendly messages
- Automatic token management
- Optimistic UI updates where appropriate

## Notes

- All mock data has been removed for production
- The application is fully API-ready
- Worker status field has been removed as requested
- All pages include proper loading and error states
