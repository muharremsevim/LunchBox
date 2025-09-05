"use client"; // ← this must be first

import {SessionProvider} from "next-auth/react";
import type {ReactNode} from "react";
import type {Session} from "next-auth";

export function SessionProviderClient({children, session}: { children: ReactNode; session?: Session | null }) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
}
