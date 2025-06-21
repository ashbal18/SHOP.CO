"use client";
import { signOut } from "next-auth/react";


export default function Logout() {
    return (
        <button 
            onClick={() => signOut({redirectTo:"/login"})}
            className="text-sm bg-amber-300 px-2 text-white rounded-2xl"
        >
            Logout
        </button>
    );
}