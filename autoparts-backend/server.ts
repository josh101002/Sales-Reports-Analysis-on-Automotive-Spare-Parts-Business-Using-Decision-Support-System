import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
                password_hash: password 
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

// Fetch Inventory
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

// Update Inventory
app.put('/api/inventory/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    
    const { 
        product_name, category, current_stock, unit_cost, 
        status, user_id, user_name, role, company_id,
        min_stock, sku, supplier, location 
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
                min_stock: Number(min_stock),
                sku,
                supplier,
                location
            }
        });

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

// Create Staff Member
app.post('/api/team', async (req, res) => {
    const { fullName, email, password, company_id } = req.body;
    try {
        const newUser = await prisma.users.create({
            data: {
                full_name: fullName,
                email: email,
                password_hash: password,
                company_id: Number(company_id),
                role: 'Business' 
            }
        });
        res.status(200).json(newUser);
    } catch (err: any) {
        res.status(500).json({ message: "Failed to create staff: " + err.message });
    }
});

// Fetch Team Members
app.get('/api/team', async (req, res) => {
    const company_id = parseInt(req.query.company_id as string);
    try {
        const team = await prisma.users.findMany({
            where: { company_id }
        });
        res.status(200).json(team);
    } catch (err) {
        res.status(500).send(err);
    }
});

// GET: Fetch sales for a company
app.get('/api/sales', async (req, res) => {
    const company_id = parseInt(req.query.company_id as string);
    try {
        const sales = await prisma.sales_reports.findMany({
            where: { company_id: company_id },
            orderBy: { date: 'desc' } // Changed from report_date to date
        });
        res.json(sales);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Bulk Add/Import Sales
app.post('/api/sales', async (req, res) => {
    try {
        const { reports } = req.body;
        const result = await prisma.sales_reports.createMany({
            data: reports.map((r: any) => ({
                company_id: Number(r.company_id),
                date: new Date(r.date), 
                order_number: r.order_number,
                product_name: r.product_name,
                category: r.category,
                customer_type: r.customer_type || "Walk-in", 
                quantity: Number(r.quantity),
                unit_price: Number(r.unit_price),
                total_amount: Number(r.total_amount),
                payment_method: r.payment_method || "Cash",
                status: r.status || "Completed" 
            }))
        });
        res.status(200).json({ count: result.count });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE a sale
app.put('/api/sales/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    
    const { 
        reportDate, 
        orderNumber,
        productName, 
        category, 
        quantity, 
        unitPrice, 
        totalAmount, 
        customerName,
        paymentMethod,
        status 
    } = req.body;

    try {
        await prisma.sales_reports.update({
            where: { report_id: id },
            data: {
                date: reportDate ? new Date(reportDate) : undefined,
                order_number: orderNumber,
                product_name: productName,
                category: category,
                quantity: Number(quantity),
                unit_price: Number(unitPrice),
                total_amount: Number(totalAmount),
                customer_type: customerName,
                payment_method: paymentMethod,
                status: status
            }
        });

        res.json({ message: "Updated successfully" });
    } catch (err: any) {
        console.error("Prisma Update Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE a sale
app.delete('/api/sales/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await prisma.sales_reports.delete({
            where: { report_id: id }
        });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});