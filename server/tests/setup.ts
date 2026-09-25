// Runs once before the test files. Fills in the env vars app.ts and
// db.ts need so importing them doesn't throw, without overriding
// anything CI/docker-compose already set (process.env wins over these).
import dotenv from "dotenv";
dotenv.config();

process.env.NODE_ENV ??= "test";
process.env.JWT_SECRET ??= "test-jwt-secret-used-only-in-automated-tests";
process.env.CLIENT_URL ??= "http://localhost:5173";
process.env.STRIPE_SECRET_KEY ??= "sk_test_dummy_key_for_tests";
process.env.STRIPE_WEBHOOK_SECRET ??= "whsec_dummy_key_for_tests";

process.env.PG_HOST ??= "localhost";
process.env.PG_PORT ??= "5432";
process.env.PG_USER ??= "techsolve";
process.env.PG_PASSWORD ??= "techsolve";
process.env.PG_DATABASE ??= "techsolve_test";

process.env.REDIS_HOST ??= "localhost";
process.env.REDIS_PORT ??= "6379";
