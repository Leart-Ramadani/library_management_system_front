import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { SystemSettingFormDialog } from "@/components/system-setting-form-dialog"
import { api } from "@/lib/api"

export default function SystemSettings() {
    const [settings, setSettings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleting, setDeleting] = useState(null)

    const load = useCallback(async () => {
        try {
            const res = await api("/system-settings")
            setSettings(Array.isArray(res) ? res : res.data)
            setError("")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    function openCreate() {
        setEditing(null)
        setFormOpen(true)
    }

    function openEdit(setting) {
        setEditing(setting)
        setFormOpen(true)
    }

    function handleSaved() {
        setFormOpen(false)
        load()
    }

    async function confirmDelete() {
        try {
            await api(`/system-settings/${deleting.id}`, { method: "DELETE" })
            setDeleting(null)
            load()
        } catch (err) {
            setError(err.message)
            setDeleting(null)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">System settings</h1>
                <Button onClick={openCreate}>
                    <Plus /> Add setting
                </Button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Key</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : settings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No settings found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            settings.map((setting) => (
                                <TableRow key={setting.id}>
                                    <TableCell className="font-mono font-medium">{setting.key}</TableCell>
                                    <TableCell className="max-w-64 truncate" title={setting.value}>
                                        {setting.value}
                                    </TableCell>
                                    <TableCell className="max-w-64 truncate text-muted-foreground">
                                        {setting.description || "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(setting)}>
                                            <Pencil />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeleting(setting)}>
                                            <Trash2 />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <SystemSettingFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                setting={editing}
                onSaved={handleSaved}
            />

            <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete setting</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-mono">{deleting?.key}</span>? This
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
