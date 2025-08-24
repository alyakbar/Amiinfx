/**
 * Simple setup script to create an initial admin user
 * 
 * To use this:
 * 1. Set ADMIN_SETUP_KEY in your .env.local file
 * 2. Make a POST request to /api/admin/auth/setup with:
 *    {
 *      "email": "admin@example.com",
 *      "password": "your-secure-password",
 *      "name": "Admin User",
 *      "setupKey": "your-setup-key-from-env"
 *    }
 * 
 * Example using curl:
 * curl -X POST http://localhost:3000/api/admin/auth/setup \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"admin@example.com","password":"admin123","name":"Admin User","setupKey":"your-setup-key"}'
 */

// You can also use this in the browser console:
const setupAdmin = async () => {
  const response = await fetch('/api/admin/auth/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      setupKey: 'your-setup-key-here'
    })
  });
  
  const result = await response.json();
  console.log(result);
};

// Uncomment to run: setupAdmin();
