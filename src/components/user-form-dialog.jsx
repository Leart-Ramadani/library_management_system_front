import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

const ROLES = ["super_admin", "operator", "student"]

function UserForm({ user, onCancel, onSaved }) {
    const isEdit = Boolean(user)
    const [form, setForm] = useState({
        name: user?.name ?? "",
        email: user?.email ?? "",
        password: "",
        role: user?.role ?? "student",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const body = { ...form }
            if (isEdit && !body.password) delete body.password // keep old password
            if (isEdit) {
                await api(`/users/${user.id}`, { method: "PUT", body })
            } else {
                await api("/users", { method: "POST", body })
            }
            onSaved()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
                <DialogTitle>{isEdit ? "Edit user" : "Add user"}</DialogTitle>
                <DialogDescription>
                    {isEdit ? "Leave password empty to keep it unchanged." : "Create a new account."}
                </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={set("name")} required />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={set("email")} required />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    required={!isEdit}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                    id="role"
                    value={form.role}
                    onChange={set("role")}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm capitalize"
                >
                    {ROLES.map((r) => (
                        <option key={r} value={r}>
                            {r}
                        </option>
                    ))}
                </select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </Button>
            </DialogFooter>
        </form>
    )
}

export function UserFormDialog({ open, onOpenChange, user, onSaved }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <UserForm
                    key={user?.id ?? "new"}
                    user={user}
                    onCancel={() => onOpenChange(false)}
                    onSaved={onSaved}
                />
            </DialogContent>
        </Dialog>
    )
}