import { PrismaClient } from '@prisma/client'

import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // 0. Create Dummy User (for Admin to test User Management)
    const password = await bcrypt.hash('password123', 10)
    const user = await prisma.user.create({
        data: {
            name: 'Dummy Staff',
            email: 'dummy@staff.com',
            password,
            role: 'CASHIER'
        }
    })
    console.log(`Created Dummy User: ${user.name} (${user.email})`)

    // 1. Create Dummy Supplier
    const supplier = await prisma.supplier.create({
        data: {
            name: 'Dummy Supplier',
            contact: 'Test Contact',
            email: 'dummy@test.com',
            address: '123 Test Lane, Dummy City',
        }
    })
    console.log(`Created Dummy Supplier: ${supplier.name} (${supplier.id})`)

    // 2. Create Dummy Product linked to Supplier
    const product = await prisma.product.create({
        data: {
            name: 'Dummy Medicine',
            category: 'Testing',
            manufacturer: 'Test Pharma',
            minStockLevel: 5,
            price: 10.00,
            sellingPrice: 15.00,
            supplierId: supplier.id,
        }
    })
    console.log(`Created Dummy Product: ${product.name} (${product.id})`)

    // 3. Create Dummy Batch for Product
    const batch = await prisma.batch.create({
        data: {
            productId: product.id,
            batchNumber: 'DUMMY-BATCH-001',
            quantity: 100,
            expiryDate: new Date('2026-12-31'),
        }
    })
    console.log(`Created Dummy Batch: ${batch.batchNumber}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
