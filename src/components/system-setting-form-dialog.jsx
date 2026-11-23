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

function SystemSettingForm({ setting, onCancel, onSaved }) {
    const isEdit = Boolean(setting)
    const [form, setForm] = useState({
        key: setting?.key ?? "",
        value: setting?.value ?? "",
        description: setting?.description ?? "",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const body = { ...form, description: form.description.trim() || null }
            if (isEdit) {
                await api(`/system-settings/${setting.id}`, { method: "PUT", body })
            } else {
                await api("/system-settings", { method: "POST", body })
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
                <DialogTitle>{isEdit ? "Edit setting" : "Add setting"}</DialogTitle>
                <DialogDescription>
                    {isEdit ? "Update this system setting." : "Create a new system setting."}
                </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
                <Label htmlFor="key">Key</Label>
                <Input id="key" value={form.key} onChange={set("key")} required />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="value">Value</Label>
                <textarea
                    id="value"
                    value={form.value}
                    onChange={set("value")}
                    required
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input id="description" value={form.description} onChange={set("description")} />
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

export function SystemSettingFormDialog({ open, onOpenChange, setting, onSaved }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <SystemSettingForm
                    key={setting?.id ?? "new"}
                    setting={setting}
                    onCancel={() => onOpenChange(false)}
                    onSaved={onSaved}
                />
            </DialogContent>
        </Dialog>
    )
}
