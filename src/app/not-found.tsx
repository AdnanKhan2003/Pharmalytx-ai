"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-black transition-colors duration-300">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-400/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg p-8 text-center">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Image
                        src="/transparent-logo.png"
                        alt="Pharmalytix AI"
                        width={80}
                        height={80}
                        className="drop-shadow-lg"
                    />
                </div>

                {/* 404 Text */}
                <h1 className="text-8xl font-bold bg-linear-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mb-4">
                    404
                </h1>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Page Not Found
                </h2>

                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Let&apos;s get you back on track.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                    >
                        <Home className="h-5 w-5" />
                        Go to Dashboard
                    </Link>

                    <button
                        onClick={() => history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Go Back
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-12">
                    <p className="text-xs text-gray-400">
                        Pharmalytix AI — Advanced Pharmacy Management
                    </p>
                </div>
            </div>
        </div>
    );
}
