import { auth } from '../config/auth.js';
import type { Path } from 'better-auth/plugins'
import type { RequestContext } from '../types/RequestContext.js';
import { generateSpecs } from 'hono-openapi';
import type { Hono } from 'hono';
import fs from 'node:fs'
import { createMarkdownFromOpenApi } from '@scalar/openapi-to-markdown';
import { Scalar } from '@scalar/hono-api-reference';
const servers = [{ url: 'http://localhost:3001', description: 'Local Server' }]
export const getFixedAuthOpenAPISchema = async () => {
    const openAPIAuthSchemaRaw = (await auth.api.generateOpenAPISchema()).paths
    const openAPIAuthSchema: Record<string, Path> = Object.fromEntries(
      Object.entries(openAPIAuthSchemaRaw).map(([path, value]) => {
        // Prepend /api to all paths
        const apiPath = `/api${path.startsWith('/') ? path : '/' + path}`;
        // Special handling for /reset-password/{token}
        if (
          /\{[^}]+\}/.test(path) &&
          value?.get &&
          Array.isArray(value.get.parameters)
        ) {
          // Handle any path parameter dynamically
          const paramNames = Array.from(path.matchAll(/\{([^}]+)\}/g)).map(match => match[1]);
          if (value.get.parameters) {
            for (const paramName of paramNames) {
              // Avoid duplicating parameter if already exists
              if (!value.get.parameters.find((p: any) => p.name === paramName && p.in === "path")) {
                value.get.parameters.push({
                  name: paramName,
                  in: "path",
                  required: true,
                  schema: { type: "string" },
                  description: `The path parameter "${paramName}"`
                });
              }
            }
          }
        }
        return [apiPath, value];
      })
    );
    const schema = (await auth.api.generateOpenAPISchema());
    schema.paths = openAPIAuthSchema;
    schema.servers = servers;
    
    return schema;
}

async function getApiSpecs(app: Hono<RequestContext>) {
    const specs = await generateSpecs(app, {
        documentation: {
            info: {
                title: 'My API',
                version: '1.0.0',
                description: 'My API',
            },
            servers: servers,
        },
       
    });
    return specs;
}

export async function generateAndSaveApiDocs(app: Hono<RequestContext>) {
    const specs = await getApiSpecs(app);
    const fixedAuthOpenAPISchema = await getFixedAuthOpenAPISchema();
    // @ts-ignore
    fs.writeFileSync('openapi.json', JSON.stringify(specs, null, 2));
    fs.writeFileSync('openapi-auth.json', JSON.stringify(fixedAuthOpenAPISchema, null, 2));
}


export async function registerLLMTextDocs(app: Hono<RequestContext>) {
    const specs = await getApiSpecs(app);
    const fixedAuthOpenAPISchema = await getFixedAuthOpenAPISchema();
      // @ts-ignore
    specs.paths = {
    ...specs.paths,
    ...fixedAuthOpenAPISchema.paths,
    }
    const markdown = await createMarkdownFromOpenApi(specs);
    fs.writeFileSync('llms.txt', markdown);

    await app.get('/llms.txt', (c) => c.text(markdown));
}

export async function registerScalarDocs(app: Hono<RequestContext>) {
    const openapiJson = await fs.readFileSync('openapi.json', 'utf8');
    const openapiAuthJson = await fs.readFileSync('openapi-auth.json', 'utf8');
    app.get('openapi.json', (c) => c.json(JSON.parse(openapiJson)));
    app.get('openapi-auth.json', (c) => c.json(JSON.parse(openapiAuthJson)));
    app.get("/scalar", Scalar({
        pageTitle: "API Documentation", 
        sources: [
          { url: "/openapi.json", title: "API" },
          { url: "/openapi-auth.json", title: "Auth" },
        ],
    }));
}

