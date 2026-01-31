"use client"

import * as React from "react"
import { useFormStatus } from "react-dom"
import { signIn } from "next-auth/react" // Client side sign in
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { Loader2, Pill } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = React.useState<string | null>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const formRef = React.useRef<HTMLFormElement>(null)

    const handleQuickLogin = (role: 'ADMIN' | 'PHARMACIST' | 'CASHIER') => {
        const creds = {
            ADMIN: { email: 'admin@pharmalytix.com', password: 'password123' },
            PHARMACIST: { email: 'pharmacist@pharmalytix.com', password: 'password123' },
            CASHIER: { email: 'cashier@pharmalytix.com', password: 'password123' }
        }

        const { email, password } = creds[role]

        // Fill inputs programmatically
        const emailInput = document.getElementById('email') as HTMLInputElement
        const passwordInput = document.getElementById('password') as HTMLInputElement

        if (emailInput && passwordInput && formRef.current) {
            emailInput.value = email
            passwordInput.value = password
            formRef.current.requestSubmit()
        }
    }

    React.useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".login-card", {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
            })
            gsap.from(".login-item", {
                y: 10,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.3,
            })
        }, containerRef)
        return () => ctx.revert()
    }, [])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError("Invalid email or password")
                gsap.fromTo(".error-message", { x: -5 }, { x: 5, duration: 0.1, repeat: 3, yoyo: true })
            } else {
                router.push("/dashboard")
            }
        } catch (e) {
            setError("An unexpected error occurred")
        }
    }

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-black transition-colors duration-300"
            ref={containerRef}
        >
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-400/20 rounded-full blur-[100px]" />
            </div>

            <div className="login-card relative z-10 w-[90%] md:w-full max-w-md p-6 md:p-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/50 dark:border-gray-800 rounded-3xl shadow-2xl">
                <div className="flex flex-col items-center mb-8 login-item">
                    <div className="mb-4 shadow-2xl rounded-full">
                        <Image
                            src="/transparent-logo.png"
                            alt="Pharmalytix AI Logo"
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pharmalytix AI</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Sign in to your dashboard</p>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 login-item">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="admin@pharmalytix.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="error-message p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium text-center border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    <SubmitButton />
                </form>

                <div className="flex flex-col gap-2 mt-6 login-item">
                    <button type="button" onClick={() => handleQuickLogin('ADMIN')} className="w-full text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-all font-medium flex items-center justify-center gap-2 hover:border-blue-300 dark:hover:border-blue-700">
                        Skip & Sign in as <strong>Admin</strong>
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button type="button" onClick={() => handleQuickLogin('PHARMACIST')} className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 py-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-all font-medium hover:border-blue-300 dark:hover:border-blue-700">
                            Skip & Sign in as <strong>Pharmacist</strong>
                        </button>
                        <button type="button" onClick={() => handleQuickLogin('CASHIER')} className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 py-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-all font-medium hover:border-blue-300 dark:hover:border-blue-700">
                            Skip & Sign in as <strong>Cashier</strong>
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center login-item">
                    <p className="text-xs text-gray-400">
                        Protected by Pharmalytix AI Security
                    </p>
                </div>
            </div>
        </div>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            disabled={pending}
            type="submit"
            className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
        </button>
    )
}
