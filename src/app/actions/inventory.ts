'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"

// Schema for validation
const ProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    manufacturer: z.string().optional(),
    minStockLevel: z.coerce.number().min(0),
    price: z.coerce.number().min(0, "Cost price must be positive"),
    sellingPrice: z.coerce.number().min(0, "Selling price must be positive"),
    supplierId: z.string().min(1, "Supplier is required"),
    // Initial Batch
    batchNumber: z.string().min(1, "Batch number is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    expiryDate: z.string().refine((date) => new Date(date) > new Date(), {
        message: "Expiry date must be in the future",
    }),
})

const SupplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contact: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
})

export async function createProduct(prevState: any, formData: FormData) {
    const validatedFields = ProductSchema.safeParse({
        name: formData.get("name"),
        category: formData.get("category"),
        manufacturer: formData.get("manufacturer"),
        minStockLevel: formData.get("minStockLevel"),
        price: formData.get("price"),
        sellingPrice: formData.get("sellingPrice"),
        supplierId: formData.get("supplierId"),
        batchNumber: formData.get("batchNumber"),
        quantity: formData.get("quantity"),
        expiryDate: formData.get("expiryDate"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Product.",
        }
    }

    const {
        name, category, manufacturer, minStockLevel, price, sellingPrice, supplierId,
        batchNumber, quantity, expiryDate
    } = validatedFields.data

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create Product
            const product = await tx.product.create({
                data: {
                    name,
                    category,
                    manufacturer,
                    minStockLevel,
                    price,
                    sellingPrice,
                    supplierId,
                }
            })

            // 2. Create Initial Batch
            await tx.batch.create({
                data: {
                    productId: product.id,
                    batchNumber,
                    quantity,
                    expiryDate: new Date(expiryDate),
                }
            })
        })
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Product.',
        }
    }

    revalidatePath('/dashboard/inventory')
    redirect('/dashboard/inventory')
}

export async function getSuppliers() {
    return await prisma.supplier.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })
}

export async function createSupplier(prevState: any, formData: FormData) {
    const validatedFields = SupplierSchema.safeParse({
        name: formData.get("name"),
        contact: formData.get("contact"),
        email: formData.get("email"),
        address: formData.get("address"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Supplier.",
        }
    }

    try {
        await prisma.supplier.create({
            data: validatedFields.data,
        })
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Supplier.',
        }
    }

    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/add') // Revalidate inventory add page to show new supplier
    redirect('/dashboard/suppliers')
}

export async function deleteProduct(productId: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // Delete batches first due to FK constraint
            await tx.batch.deleteMany({
                where: { productId }
            })
            // Delete product
            await tx.product.delete({
                where: { id: productId }
            })
        })
        revalidatePath('/dashboard/inventory')
        return { success: true, message: 'Product deleted successfully' }
    } catch (error) {
        return { success: false, message: 'Failed to delete product' }
    }
}

export async function deleteSupplier(supplierId: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // Check for associated products
            const productCount = await tx.product.count({
                where: { supplierId }
            })
            if (productCount > 0) {
                throw new Error(`Cannot delete supplier. They have ${productCount} associated products.`)
            }

            await tx.supplier.delete({
                where: { id: supplierId }
            })
        })
        revalidatePath('/dashboard/suppliers')
        return { success: true, message: 'Supplier deleted successfully' }
    } catch (error: any) {
        return { success: false, message: error.message || 'Failed to delete supplier' }
    }
}


export async function getSupplier(id: string) {
    return await prisma.supplier.findUnique({
        where: { id }
    })
}

export async function updateSupplier(id: string, prevState: any, formData: FormData) {
    const validatedFields = SupplierSchema.safeParse({
        name: formData.get("name"),
        contact: formData.get("contact"),
        email: formData.get("email"),
        address: formData.get("address"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Update Supplier.",
        }
    }

    try {
        await prisma.supplier.update({
            where: { id },
            data: validatedFields.data,
        })
    } catch (error) {
        return { message: 'Database Error: Failed to Update Supplier.' }
    }

    revalidatePath('/dashboard/suppliers')
    redirect('/dashboard/suppliers')
}

export async function getProduct(id: string) {
    return await prisma.product.findUnique({
        where: { id },
        include: {
            batches: true
        }
    })
}

// Schema for Product Update (without batch info since we edit product details separately from batches usually, but for simplicity allowing basic edits)
const ProductUpdateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    manufacturer: z.string().optional(),
    minStockLevel: z.coerce.number().min(0),
    price: z.coerce.number().min(0, "Cost price must be positive"),
    sellingPrice: z.coerce.number().min(0, "Selling price must be positive"),
    supplierId: z.string().min(1, "Supplier is required"),
})

export async function updateProduct(id: string, prevState: any, formData: FormData) {
    const validatedFields = ProductUpdateSchema.safeParse({
        name: formData.get("name"),
        category: formData.get("category"),
        manufacturer: formData.get("manufacturer"),
        minStockLevel: formData.get("minStockLevel"),
        price: formData.get("price"),
        sellingPrice: formData.get("sellingPrice"),
        supplierId: formData.get("supplierId"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Update Product.",
        }
    }

    try {
        await prisma.product.update({
            where: { id },
            data: validatedFields.data,
        })
    } catch (error) {
        return { message: 'Database Error: Failed to Update Product.' }
    }

    revalidatePath('/dashboard/inventory')
    redirect('/dashboard/inventory')
}
