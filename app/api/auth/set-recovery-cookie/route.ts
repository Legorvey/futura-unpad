import { NextResponse } from "next/server";
import { 
    PASSWORD_RECOVERY_COOKIE, 
    passwordRecoveryCookieOptions, 
    PASSWORD_RECOVERY_MAX_AGE_SECONDS 
} from "@/lib/password-recovery";

export async function POST() {
    const response = NextResponse.json({ ok: true });
    
    response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", {
        ...passwordRecoveryCookieOptions,
        maxAge: PASSWORD_RECOVERY_MAX_AGE_SECONDS,
    });
    
    return response;
}
