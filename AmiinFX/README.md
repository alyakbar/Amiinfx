# AmiinFX Project

## Overview
AmiinFX is a web application that integrates with the Binance payment system to facilitate transactions. This README provides instructions for setting up and using the application.

## Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd AmiinFX
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables. You can use the provided `.env.local` file as a reference.

## Environment Variables
Make sure to set the following environment variables in your `.env.local` file:
```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PLAN_MONTHLY=your_monthly_plan_id
NEXT_PUBLIC_PAYSTACK_PLAN_QUARTERLY=your_quarterly_plan_id
NEXT_PUBLIC_BASE_URL=http://localhost:3000
PADDLE_VENDOR_ID=your_paddle_vendor_id
PADDLE_VENDOR_AUTH_CODE=your_paddle_vendor_auth_code
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_email_password
SUPPORT_EMAIL=support_email@gmail.com
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
```

## Usage
To start the development server, run:
```
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to view the application.

## Payment Integration
The application uses the Binance payment system for processing transactions. Ensure that you have set up your Binance API keys in the `.env.local` file.

## Contributing
If you would like to contribute to the project, please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.