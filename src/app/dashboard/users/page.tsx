import { getUsers } from "@/app/actions/users"
import UsersPage from "@/components/users/users-page-client"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function Page() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const users = await getUsers()
    return <UsersPage initialUsers={users} />
}
