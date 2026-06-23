import { createBrowserClient } from "@supabase/ssr";
import {
    AUTH_PERSISTENCE_COOKIE,
    isSessionAuthPersistence,
} from "@/utils/supabase/auth-cookies";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

type BrowserCookieOptions = {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    partitioned?: boolean;
    path?: string;
    priority?: "low" | "medium" | "high";
    sameSite?: boolean | "lax" | "strict" | "none";
    secure?: boolean;
};

const getBrowserCookies = () => {
    if (typeof document === "undefined") {
        return [];
    }

    const decodeCookiePart = (value: string) => {
        try {
            return decodeURIComponent(value);
        } catch {
            return value;
        }
    };

    return document.cookie
        .split(";")
        .map((cookie) => cookie.trim())
        .filter(Boolean)
        .map((cookie) => {
            const separatorIndex = cookie.indexOf("=");
            const name = separatorIndex >= 0 ? cookie.slice(0, separatorIndex) : cookie;
            const value = separatorIndex >= 0 ? cookie.slice(separatorIndex + 1) : "";

            return {
                name: decodeCookiePart(name),
                value: decodeCookiePart(value),
            };
        });
};

const serializeBrowserCookie = (
    name: string,
    value: string,
    options: BrowserCookieOptions
) => {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.maxAge !== undefined) {
        cookie += `; Max-Age=${Math.floor(options.maxAge)}`;
    }

    if (options.domain) {
        cookie += `; Domain=${options.domain}`;
    }

    if (options.path) {
        cookie += `; Path=${options.path}`;
    }

    if (options.expires) {
        cookie += `; Expires=${options.expires.toUTCString()}`;
    }

    if (options.sameSite) {
        cookie += `; SameSite=${options.sameSite === true ? "Strict" : options.sameSite}`;
    }

    if (options.secure) {
        cookie += "; Secure";
    }

    if (options.partitioned) {
        cookie += "; Partitioned";
    }

    if (options.priority) {
        cookie += `; Priority=${options.priority}`;
    }

    return cookie;
};

export const createClient = () =>
    createBrowserClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                getAll() {
                    return getBrowserCookies();
                },
                setAll(cookiesToSet) {
                    if (typeof document === "undefined") {
                        return;
                    }

                    const onlyClearingCookies =
                        cookiesToSet.length > 0 &&
                        cookiesToSet.every(({ value }) => !value);
                    const sessionOnly = isSessionAuthPersistence(
                        getBrowserCookies().find(
                            (cookie) => cookie.name === AUTH_PERSISTENCE_COOKIE
                        )?.value
                    );

                    cookiesToSet.forEach(({ name, value, options }) => {
                        const cookieOptions = { ...options };

                        if (sessionOnly && value) {
                            delete cookieOptions.maxAge;
                            delete cookieOptions.expires;
                        }

                        document.cookie = serializeBrowserCookie(
                            name,
                            value,
                            cookieOptions
                        );
                    });

                    if (onlyClearingCookies) {
                        document.cookie = serializeBrowserCookie(
                            AUTH_PERSISTENCE_COOKIE,
                            "",
                            { path: "/", maxAge: 0 }
                        );
                    }
                },
            },
        }
    );
