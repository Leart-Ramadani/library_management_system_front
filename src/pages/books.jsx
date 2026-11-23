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
import { api } from "@/lib/api"
import { BookFormDialog } from "@/components/book-form-dialog"

export default function Books() {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleting, setDeleting] = useState(null)

    const load = useCallback(async () => {
        try {
            const res = await api("/books")
            setBooks(Array.isArray(res) ? res : res.data)
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

    function openEdit(book) {
        setEditing(book)
        setFormOpen(true)
    }

    function handleSaved() {
        setFormOpen(false)
        load()
    }

    async function confirmDelete() {
        try {
            await api(`/books/${deleting.id}`, { method: "DELETE" })
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
                <h1 className="text-2xl font-semibold">Books</h1>
                <Button onClick={openCreate}>
                    <Plus /> Add book
                </Button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>ISBN</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : books.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No book found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            books.map((book) => (
                                <TableRow key={book.id}>
                                    <TableCell className="font-medium">{book.category.name}</TableCell>
                                    <TableCell className="font-medium">{book.title}</TableCell>
                                    <TableCell className="font-medium">{book.author}</TableCell>
                                    <TableCell className="font-medium">{book.isbn}</TableCell>
                                    <TableCell className="font-medium">{book.stock}</TableCell>
                                    <TableCell className="font-medium">{book.status}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(book)}>
                                            <Pencil />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeleting(book)}>
                                            <Trash2 />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <BookFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                book={editing}
                onSaved={handleSaved}
            />

            <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete book</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {deleting?.name}? This cannot be undone.
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