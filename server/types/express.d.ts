import "express";
import "socket.io";

export interface AuthUser {
    id: string;
    email: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            // Set by middleware/loginAuthenticator.ts after verifying the JWT.
            user?: AuthUser;

            // Set by middleware/validation.ts's validateQuery() once the
            // raw query string has been parsed/coerced by a Zod schema.
            validatedQuery?: Record<string, unknown>;
        }
    }
}

declare module "socket.io" {
    interface Socket {
        // Set by the io.use() auth middleware in server.ts after verifying
        // the JWT sent in the socket handshake.
        user: AuthUser;
    }
}
