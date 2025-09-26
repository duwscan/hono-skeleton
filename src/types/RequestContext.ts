import type { auth } from "../config/auth.js";

export interface RequestContext {
    Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null
	}
}