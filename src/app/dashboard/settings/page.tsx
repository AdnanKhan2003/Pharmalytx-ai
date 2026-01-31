'use client'

import { useSession, signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { User, LogOut, Shield, Mail, Store, Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
    const { data: session } = useSession()

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gray-100 rounded-xl text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <SettingsIcon className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your preferences and account</p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Profile Information
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                                {session?.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{session?.user?.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Mail className="h-3 w-3" />
                                    <span className="break-all">{session?.user?.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full sm:w-auto sm:ml-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-gray-700 sm:border-none">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${session?.user?.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' :
                                session?.user?.role === 'PHARMACIST' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50' :
                                    'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50'
                                }`}>
                                <Shield className="h-3 w-3" />
                                {session?.user?.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5 text-gray-600" />
                        App Preferences
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Appearance</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Customize how the app looks on your device</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sign Out */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <h3 className="font-bold text-gray-900 dark:text-white">Sign Out</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Securely log out of your account</p>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 px-4 py-2 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    )
}
