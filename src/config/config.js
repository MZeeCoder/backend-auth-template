import dotenv from "dotenv";

dotenv.config();
const baseURL = process.env.API_BASE_URL || "http://localhost:5000/api";
const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3001";

const config = {
  api: {
    frontendURL,
    baseURL,

    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
  },

  cors: {
    origin: corsOrigin,
  },
};

export default config;