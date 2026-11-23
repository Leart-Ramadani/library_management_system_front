import { useCallback, useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
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
import { useAuth } from "@/context/auth-context"
import { api } from "@/lib/api"

const money = (v) => Number(v).toFixed(2)

function statusOf(p) {
    if (p.paid) return { label: "Paid", variant: "secondary" }
    if (p.loanStatus === "awaiting_payment") return { label: "Unpaid", variant: "destructive" }
    return { label: "Awaiting return", variant: "outline" }
}

export default function Penalties() {
    const { user } = useAuth()
    const isStaff = ["super_admin", "operator"].includes(user.role)

    const [penalties, setPenalties] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [paying, setPaying] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    const load = useCallback(async () => {
        try {
            const res = await api("/penalties")
            setPenalties(Array.isArray(res) ? res : res.data)
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

    const outstanding = useMemo(
        () => penalties.filter((p) => !p.paid).reduce((sum, p) => sum + Number(p.amount), 0),
        [penalties]
    )

    async function confirmPay() {
        setSubmitting(true)
        setError("")
        try {
            const res = await api(`/pay-penalty/${paying.id}`, { method: "POST" })
            setSuccess(res.data.message)
            setPaying(null)
            load()
        } catch (err) {
            setError(err.message)
            setPaying(null)
        } finally {
            setSubmitting(false)
        }
    }

    const colSpan = isStaff ? 8 : 7

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{isStaff ? "Penalties" : "My penalties"}</h1>
                <div className="text-sm text-muted-foreground">
                    Outstanding: <span className="font-semibold text-foreground">{money(outstanding)}</span>
                </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {isStaff && <TableHead>Student</TableHead>}
                            <TableHead>Book</TableHead>
                            <TableHead>Due</TableHead>
                            <TableHead>Days late</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Paid at</TableHead>
                            <TableHead className="w-28 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={colSpan} className="text-center text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : penalties.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={colSpan} className="text-center text-muted-foreground">
                                    No penalties found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            penalties.map((p) => {
                                const status = statusOf(p)
                                return (
                                    <TableRow key={p.id}>
                                        {isStaff && (
                                            <TableCell className="font-medium">
                                                {p.studentName}
                                                <div className="text-xs font-normal text-muted-foreground">
                                                    {p.studentEmail}
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell>{p.bookTitle}</TableCell>
                                        <TableCell>{p.dueAt}</TableCell>
                                        <TableCell>{p.daysLate}</TableCell>
                                        <TableCell className="font-medium">{money(p.amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={status.variant}>{status.label}</Badge>
                                        </TableCell>
                                        <TableCell>{p.paidAt ?? "—"}</TableCell>
                                        <TableCell className="text-right">
                                            {!p.paid && p.loanStatus === "awaiting_payment" && (
                                                <Button size="sm" variant="outline" onClick={() => setPaying(p)}>
                                                    Pay
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={Boolean(paying)} onOpenChange={(open) => !open && setPaying(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pay penalty</DialogTitle>
                        <DialogDescription>
                            Confirm payment of {paying && money(paying.amount)} for “{paying?.bookTitle}”
                            {isStaff && paying ? ` (${paying.studentName})` : ""}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaying(null)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button onClick={confirmPay} disabled={submitting}>
                            {submitting ? "Paying..." : "Confirm payment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}