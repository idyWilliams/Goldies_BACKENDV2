
declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_URI: string;
    PORT?: string;
    ACCESS_SECRET_TOKEN: string;
    REFRESH_SECRET_TOKEN: string;
    EMAIL: string;
    PASSWORD: string;
    ADMINREFCODE: string;
    PAYSTACK_SECRET_KEY: string;
    NODE_ENV?: 'development' | 'production';
  }
}