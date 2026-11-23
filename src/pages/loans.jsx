import { useCallback, useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

const STATUS_VARIANT = {
    active: "default",
    overdue: "destructive",
    awaiting_payment: "destructive",
    closed: "secondary",
}

export default function Loans() {
    const { user } = useAuth()
    // super_admin / operator pick a student; a student always loans for themselves
    const isStaff = ["super_admin", "operator"].includes(user.role)

    const [query, setQuery] = useState("")
    const [books, setBooks] = useState(null) // null = nothing searched yet
    const [searching, setSearching] = useState(false)

    const [students, setStudents] = useState([])
    const [studentId, setStudentId] = useState("")

    const [book, setBook] = useState(null)
    const [eligibility, setEligibility] = useState(null) // { canBorrow, message }
    const [checking, setChecking] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [loans, setLoans] = useState([])
    const [loansLoading, setLoansLoading] = useState(true)
    const [returning, setReturning] = useState(null)

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    // guards against out-of-order canBorrow responses
    const checkRef = useRef(0)

    const loadLoans = useCallback(async () => {
        try {
            const res = await api("/loans")
            setLoans(Array.isArray(res) ? res : res.data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoansLoading(false)
        }
    }, [])

    useEffect(() => {
        loadLoans()
    }, [loadLoans])

    useEffect(() => {
        if (!isStaff) return
        let ignore = false
        api("/students")
            .then((res) => {
                if (ignore) return
                setStudents(Array.isArray(res) ? res : res.data)
            })
            .catch((err) => !ignore && setError(err.message))
        return () => {
            ignore = true
        }
    }, [isStaff])

    async function runSearch(term) {
        setSearching(true)
        setError("")
        try {
            const res = await api(`/search-book?search=${encodeURIComponent(term)}`)
            setBooks(Array.isArray(res) ? res : res.data)
        } catch (err) {
            setError(err.message)
        } finally {
            setSearching(false)
        }
    }

    function clearSelection() {
        checkRef.current++
        setBook(null)
        setEligibility(null)
        setChecking(false)
    }

    function handleSearch(e) {
        e.preventDefault()
        const term = query.trim()
        if (!term) return
        setSuccess("")
        clearSelection()
        runSearch(term)
    }

    async function runCheck(sid) {
        const id = ++checkRef.current
        setEligibility(null)
        setError("")
        setChecking(true)
        try {
            const res = await api("/can-borrow", {
                method: "POST",
                body: isStaff ? { studentId: Number(sid) } : undefined,
            })
            if (id === checkRef.current) setEligibility(res.data)
        } catch (err) {
            if (id === checkRef.current) setError(err.message)
        } finally {
            if (id === checkRef.current) setChecking(false)
        }
    }

    function selectBook(b) {
        setBook(b)
        setSuccess("")
        setError("")
        setEligibility(null)
        if (!isStaff) runCheck()
        else if (studentId) runCheck(studentId)
    }

    function handleStudentChange(e) {
        const value = e.target.value
        setStudentId(value)
        if (value && book) {
            runCheck(value)
        } else {
            checkRef.current++
            setEligibility(null)
            setChecking(false)
        }
    }

    async function confirmLoan() {
        setError("")
        setSubmitting(true)
        try {
            const res = await api("/loan-book", {
                method: "POST",
                body: { bookId: book.id, ...(isStaff && { studentId: Number(studentId) }) },
            })
            if (res.data.canBorrow) {
                clearSelection()
                setSuccess(res.data.message)
                runSearch(query.trim()) // refresh stock
                loadLoans()
            } else {
                setEligibility({ canBorrow: false, message: res.data.message })
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    async function confirmReturn() {
        try {
            const res = await api(`/return-loan/${returning.id}`, { method: "POST" })
            setSuccess(res.data.message)
            setReturning(null)
            loadLoans()
            if (query.trim()) runSearch(query.trim()) // refresh stock in search results
        } catch (err) {
            setError(err.message)
            setReturning(null)
        }
    }

    const loanColSpan = isStaff ? 6 : 4

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold">{isStaff ? "Loans" : "Borrow a book"}</h1>

            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    placeholder="Search by title, author or ISBN"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button type="submit" disabled={searching || !query.trim()}>
                    <Search /> {searching ? "Searching..." : "Search"}
                </Button>
            </form>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            {book && (
                <Card>
                    <CardHeader>
                        <CardTitle>{book.title}</CardTitle>
                        <CardDescription>
                            {book.author} · ISBN {book.isbn}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {isStaff && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="student">Student</Label>
                                <select
                                    id="student"
                                    value={studentId}
                                    onChange={handleStudentChange}
                                    disabled={submitting}
                                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                >
                                    <option value="">Select student</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {checking && (
                            <p className="text-sm text-muted-foreground">Checking eligibility...</p>
                        )}
                        {eligibility && (
                            <p
                                className={`text-sm ${eligibility.canBorrow ? "text-green-600" : "text-destructive"}`}
                            >
                                {eligibility.message}
                            </p>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={clearSelection} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmLoan}
                                disabled={!eligibility?.canBorrow || checking || submitting}
                            >
                                {submitting ? "Loaning..." : "Confirm loan"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {books && (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>ISBN</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-28 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {books.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No book found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                books.map((b) => (
                                    <TableRow key={b.id} data-state={book?.id === b.id ? "selected" : undefined}>
                                        <TableCell className="font-medium">{b.title}</TableCell>
                                        <TableCell>{b.author}</TableCell>
                                        <TableCell>{b.isbn}</TableCell>
                                        <TableCell>{b.stock}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {b.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={b.stock <= 0}
                                                onClick={() => selectBook(b)}
                                            >
                                                {b.stock <= 0 ? "Unavailable" : "Select"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <h2 className="text-lg font-semibold">{isStaff ? "All loans" : "My loans"}</h2>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {isStaff && <TableHead>Student</TableHead>}
                            <TableHead>Book</TableHead>
                            <TableHead>Due</TableHead>
                            <TableHead>Returned</TableHead>
                            <TableHead>Status</TableHead>
                            {isStaff && <TableHead className="w-28 text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loansLoading ? (
                            <TableRow>
                                <TableCell colSpan={loanColSpan} className="text-center text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : loans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={loanColSpan} className="text-center text-muted-foreground">
                                    No loans found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            loans.map((loan) => (
                                <TableRow key={loan.id}>
                                    {isStaff && (
                                        <TableCell className="font-medium">
                                            {loan.studentName}
                                            <div className="text-xs font-normal text-muted-foreground">
                                                {loan.studentEmail}
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell>{loan.bookTitle}</TableCell>
                                    <TableCell>{loan.dueAt}</TableCell>
                                    <TableCell>{loan.returnedAt ?? "—"}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={STATUS_VARIANT[loan.status] ?? "secondary"}
                                            className="capitalize"
                                        >
                                            {String(loan.status).replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    {isStaff && (
                                        <TableCell className="text-right">
                                            {["active", "overdue"].includes(loan.status) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setReturning(loan)}
                                                >
                                                    Return
                                                </Button>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={Boolean(returning)} onOpenChange={(open) => !open && setReturning(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Return loan</DialogTitle>
                        <DialogDescription>
                            Mark “{returning?.bookTitle}” as returned by {returning?.studentName}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReturning(null)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmReturn}>Confirm return</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
