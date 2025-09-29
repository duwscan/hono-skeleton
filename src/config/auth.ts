import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../db/index.js";
import * as schema from "../db/schema.js";
import { bearer, openAPI} from "better-auth/plugins";
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "mysql",
        usePlural: true,
        schema: schema,
    }),
    plugins: [bearer(), openAPI()],
    emailAndPassword: { 
        enabled: true, 
    }, 
})