import { useCallback, useEffect, useState } from "react"
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

const STATUS = ["derived", "stored"]

function BookForm({ book, onCancel, onSaved }) {
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    const load = useCallback(async () => {
        try {
            setCategoriesLoading(true);
            const res = await api("/book-categories")
            setCategories(Array.isArray(res) ? res : res.data)
        } catch (err) {
            console.log(err.message)
        } finally {
            setCategoriesLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const isEdit = Boolean(book)
    const [form, setForm] = useState({
        category_id: book?.category_id ?? "",
        title: book?.title ?? "",
        author: book?.author ?? "",
        isbn: book?.isbn ?? "",
        stock: book?.stock ?? "",
        status: book?.status ?? "",
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
                await api(`/books/${book.id}`, { method: "PUT", body })
            } else {
                await api("/books", { method: "POST", body })
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
                <DialogTitle>{isEdit ? "Edit book" : "Add book"}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-2">
                <Label htmlFor="category_id">Category</Label>
                <select
                    id="category_id"
                    value={form.category_id}
                    onChange={set("category_id")}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm capitalize"
                >
                    <option key={0} value={null}>
                        Select category
                    </option>
                    {!categoriesLoading && categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={set("title")} required />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={form.author} onChange={set("author")} required />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input id="isbn" value={form.isbn} onChange={set("isbn")} required />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" value={form.stock} onChange={set("stock")} required />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                    id="status"
                    value={form.status}
                    onChange={set("status")}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm capitalize"
                >
                    {STATUS.map((status) => (
                        <option key={status} value={status}>
                            {status}
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

export function BookFormDialog({ open, onOpenChange, book, onSaved }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <BookForm
                    key={book?.id ?? "new"}
                    book={book}
                    onCancel={() => onOpenChange(false)}
                    onSaved={onSaved}
                />
            </DialogContent>
        </Dialog>
    )
}