import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database.');
});


// Consolidation: Single Registration Route
app.post('/api/register', (req, res) => {
    const { email, password, companyName, businessAddress } = req.body;
    const sqlBusiness = `
        INSERT INTO companies (company_name, business_address, email, password_hash) 
        VALUES (?, ?, ?, ?)
    `;
    db.query(sqlBusiness, [companyName, businessAddress || "Main Office", email, password], (err, result) => {
        if (err) return res.status(500).json({ message: "Registration failed: " + err.message });
        res.status(200).json({ 
            role: 'admin', 
            company_id: (result as any).insertId, 
            email 
        });
    });
});

// Consolidation: Single Login Route that checks both tables
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const checkOwner = "SELECT * FROM companies WHERE email = ? AND password_hash = ?";
    
    db.query(checkOwner, [email, password], (err, ownerResult: any) => {
        if (err) return res.status(500).send(err);
        if (ownerResult.length > 0) {
            return res.json({ 
                role: 'admin', 
                company_id: ownerResult[0].company_id, 
                email: ownerResult[0].email,
                user_name: ownerResult[0].company_name 
            });
        }

        const checkStaff = "SELECT * FROM users WHERE email = ? AND password_hash = ?";
        db.query(checkStaff, [email, password], (err, staffResult: any) => {
            if (err) return res.status(500).send(err);
            if (staffResult.length > 0) {
                return res.json({ 
                    role: 'staff', 
                    company_id: staffResult[0].company_id, 
                    email: staffResult[0].email,
                    user_id: staffResult[0].user_id,
                    user_name: staffResult[0].full_name
                });
            }
            res.status(401).json({ message: "Invalid email or password" });
        });
    });
});


app.get('/api/inventory', (req, res) => {
    const { company_id } = req.query; // The backend looks for the ID here
    
    // This SQL ensures only that company's data is returned
    const sqlSelect = "SELECT * FROM inventory WHERE company_id = ?"; 
    
    db.query(sqlSelect, [company_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
    });
});

app.post('/api/inventory', (req, res) => {
    const { 
        product_name, category, current_stock, unit_cost, 
        status, company_id, min_stock, sku, supplier, location 
    } = req.body;

    const sqlInsert = `
        INSERT INTO inventory 
        (product_name, category, current_stock, unit_cost, status, company_id, min_stock, sku, supplier, location) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(sqlInsert, 
        [product_name, category, current_stock, unit_cost, status, company_id, min_stock, sku, supplier, location], 
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: "Saved", id: (result as any).insertId });
        }
    );
});

// Consolidation: Single Update route with Logging
app.put('/api/inventory/:id', (req, res) => {
    // 1. Strip 'INV' prefix if it exists to match numeric product_id in MySQL
    const productId = req.params.id.replace('INV', '');
    
    // 2. Destructure all fields including those for activity logging
    const { 
        product_name, 
        category, 
        current_stock, 
        unit_cost, 
        status, 
        user_id, 
        user_name, 
        role 
    } = req.body;

    const sqlUpdate = `
        UPDATE inventory 
        SET product_name = ?, category = ?, current_stock = ?, unit_cost = ?, status = ?
        WHERE product_id = ?
    `;

    // 3. Execute product update
    db.query(sqlUpdate, [product_name, category, current_stock, unit_cost, status, productId], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // 4. LOGGING: Record who made the change for the Decision Support System audit
        const actorType = role === 'admin' ? 'Owner' : 'Staff';
        const logMsg = `${actorType} ${user_name} updated product ID ${productId}`;
        const sqlLog = "INSERT INTO activity_logs (user_id, action_details) VALUES (?, ?)";
        
        db.query(sqlLog, [user_id || 0, logMsg], (logErr) => {
            if (logErr) {
                console.error("Logging failed:", logErr);
                // We still send 200 because the inventory update itself succeeded
            }
            res.status(200).json({ message: "Updated and Logged" });
        });
    });
});

app.delete('/api/inventory/:id', (req, res) => {
    const numericId = req.params.id.replace('INV', '');
    const sqlDelete = "DELETE FROM inventory WHERE product_id = ?";
    db.query(sqlDelete, [numericId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Deleted successfully" });
    });
});

// --- STAFF ROUTES ---

app.post('/api/staff', (req, res) => {
    const { full_name, email, password, company_id } = req.body;
    const sqlStaff = `
        INSERT INTO users (company_id, full_name, email, password_hash, role) 
        VALUES (?, ?, ?, ?, 'staff')
    `;
    db.query(sqlStaff, [company_id, full_name, email, password], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Staff account created successfully!" });
    });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});