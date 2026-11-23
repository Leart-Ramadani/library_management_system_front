import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

function CategoryForm({ category, onCancel, onSaved }) {
    const isEdit = Boolean(category)
    const [form, setForm] = useState({
        name: category?.name ?? "",
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
            if (isEdit) {
                await api(`/book-categories/${category.id}`, { method: "PUT", body })
            } else {
                await api("/book-categories", { method: "POST", body })
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
                <DialogTitle>{isEdit ? "Edit category" : "Add category"}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={set("name")} required />
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

export function CategoryFormDialog({ open, onOpenChange, category, onSaved }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <CategoryForm
                    key={category?.id ?? "new"}
                    category={category}
                    onCancel={() => onOpenChange(false)}
                    onSaved={onSaved}
                />
            </DialogContent>
        </Dialog>
    )
}