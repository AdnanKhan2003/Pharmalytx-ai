'use client'

import { useState, useRef } from "react"
import { useFormStatus } from "react-dom"
import { createUser, deleteUser } from "@/app/actions/users"
import { toast } from "sonner"
import { Plus, Trash2, User as UserIcon, Shield, ShieldAlert, Store } from "lucide-react"
import { UserRole } from "@prisma/client"
import DeleteConfirmationModal from "@/components/ui/delete-modal"
import { ExportButton } from "@/components/ui/export-button"

type User = {
    id: string
    name: string
    email: string
    role: UserRole
    createdAt: Date
}

export default function UsersPage({ initialUsers }: { initialUsers: User[] }) {
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    const handleCreateUser = async (formData: FormData) => {
        const result = await createUser(formData)
        if (result.success) {
            toast.success(result.message)
            setIsFormOpen(false)
            formRef.current?.reset()
            // In a real app we might re-fetch or use router.refresh()
            // implementing naive optimistic update or just refresh for now
            window.location.reload()
        } else {
            toast.error(result.message)
        }
    }

    const [userToDelete, setUserToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        setIsDeleting(true)
        const result = await deleteUser(userToDelete)
        setIsDeleting(false)
        setUserToDelete(null)

        if (result.success) {
            toast.success(result.message)
            setUsers(users.filter(u => u.id !== userToDelete))
        } else {
            toast.error(result.message)
        }
    }

    const RoleIcon = ({ role }: { role: string }) => {
        switch (role) {
            case 'ADMIN': return <ShieldAlert className="h-4 w-4 text-red-500" />
            case 'PHARMACIST': return <Shield className="h-4 w-4 text-blue-500" />
            case 'CASHIER': return <Store className="h-4 w-4 text-green-500" />
            default: return <UserIcon className="h-4 w-4 text-gray-500" />
        }
    }

    const exportData = users.map(u => ({
        name: u.name,
        email: u.email,
        role: u.role,
        joinedAt: new Date(u.createdAt).toLocaleDateString()
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage access and roles for your pharmacy staff.</p>
                </div>
                <div className="flex gap-2">
                    <ExportButton
                        data={exportData}
                        columns={[
                            { header: 'Full Name', key: 'name' },
                            { header: 'Email', key: 'email' },
                            { header: 'Role', key: 'role' },
                            { header: 'Joined Date', key: 'joinedAt' }
                        ]}
                        filename="staff_list"
                    />
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Staff
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm animate-in slide-in-from-top-4 fade-in duration-200">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">Create New User</h3>
                    <form ref={formRef} action={handleCreateUser} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input name="name" required placeholder="John Doe" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input name="email" type="email" required placeholder="john@example.com" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input name="password" type="password" required placeholder="••••••" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                            <select name="role" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                <option value="CASHIER">Cashier</option>
                                <option value="PHARMACIST">Pharmacist</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <SubmitButton />
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                            <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' :
                                        user.role === 'PHARMACIST' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50' :
                                            'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50'
                                        }`}>
                                        <RoleIcon role={user.role} />
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button
                                        onClick={() => setUserToDelete(user.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        title="Delete User"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DeleteConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleDeleteUser}
                title="Delete User?"
                description="Are you sure you want to delete this user? This action cannot be undone."
                loading={isDeleting}
            />
        </div>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
            {pending ? 'Saving...' : 'Create User'}
        </button>
    )
}

