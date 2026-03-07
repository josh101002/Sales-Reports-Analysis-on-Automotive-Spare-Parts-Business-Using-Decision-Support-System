import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- AUTH ROUTES ---

// Registration: Using Prisma to handle the company creation
app.post('/api/register', async (req, res) => {
    const { email, password, companyName, businessAddress } = req.body;
    try {
        const company = await prisma.companies.create({
            data: {
                company_name: companyName,
                business_address: businessAddress || "Main Office",
                email: email,
                password_hash: password // In a real app, hash this!
            }
        });
        res.status(200).json({ role: 'admin', company_id: company.company_id, email });
    } catch (err: any) {
        res.status(500).json({ message: "Registration failed: " + err.message });
    }
});

// Login: Checking both tables using Prisma's findFirst
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const owner = await prisma.companies.findFirst({
            where: { email, password_hash: password }
        });

        if (owner) {
            return res.json({ 
                role: 'admin', company_id: owner.company_id, email: owner.email, user_name: owner.company_name 
            });
        }

        const staff = await prisma.users.findFirst({
            where: { email, password_hash: password }
        });

        if (staff) {
            return res.json({ 
                role: 'staff', company_id: staff.company_id, email: staff.email, user_id: staff.user_id, user_name: staff.full_name
            });
        }

        res.status(401).json({ message: "Invalid email or password" });
    } catch (err) {
        res.status(500).send(err);
    }
});

// --- INVENTORY ROUTES ---

// Fetch Inventory: Prisma automatically handles company-based filtering
app.get('/api/inventory', async (req, res) => {
    const company_id = parseInt(req.query.company_id as string);
    try {
        const inventory = await prisma.inventory.findMany({
            where: { company_id: company_id }
        });
        res.send(inventory);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update Inventory: Prisma ensures 'current_stock' is treated as a number
app.put('/api/inventory/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    
    // 1. Destructure ALL missing fields from the request
    const { 
        product_name, category, current_stock, unit_cost, 
        status, user_id, user_name, role, company_id,
        min_stock, sku, supplier, location // <--- ADD THESE
    } = req.body;

    try {
        const updatedProduct = await prisma.inventory.update({
            where: { product_id: productId },
            data: {
                product_name,
                category,
                current_stock: Number(current_stock),
                unit_cost: Number(unit_cost),
                status,
                // 2. Add them to the database update call
                min_stock: Number(min_stock),
                sku,
                supplier,
                location
            }
        });

        // 3. Keep your Activity Log logic (it's great for your thesis!)
        await prisma.activity_logs.create({
            data: {
                company_id: Number(company_id),
                user_id: user_id && user_id !== 0 ? Number(user_id) : null,
                action_type: "Update",
                description: `${role} ${user_name} updated product: ${product_name}`
            }
        });

        res.status(200).json({ message: "Update Successful", updatedProduct });
    } catch (err: any) {
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- ADD PRODUCT ---
app.post('/api/inventory', async (req, res) => {
    try {
        const { product_name, category, current_stock, min_stock, unit_cost, sku, supplier, location, status, company_id } = req.body;
        
        const newProduct = await prisma.inventory.create({
            data: {
                product_name,
                category,
                sku,
                supplier,
                location,
                status,
                company_id: Number(company_id),
                current_stock: Number(current_stock),
                min_stock: Number(min_stock),
                unit_cost: Number(unit_cost),
            }
        });
        // Return the product_id so the frontend can create the "INV00X" ID
        res.status(200).json({ id: newProduct.product_id });
    } catch (err: any) {
        console.error("Add Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// --- DELETE PRODUCT ---
app.delete('/api/inventory/:id', async (req, res) => {
    // Strip the 'INV' prefix if the frontend sends it
    const productId = parseInt(req.params.id.replace('INV', ''));
    try {
        await prisma.inventory.delete({
            where: { product_id: productId }
        });
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err: any) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: err.message });
    }
});

app.listen(process.env.PORT, async () => {
    console.log(`Server running on port ${process.env.PORT}`);
    try {
        await prisma.$connect();
        console.log("Successfully connected to MySQL Database via Prisma.");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
});