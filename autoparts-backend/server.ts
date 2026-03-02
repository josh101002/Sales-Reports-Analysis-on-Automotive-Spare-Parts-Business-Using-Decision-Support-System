import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Verify Connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database.');
});

// 1. Basic Route for Sales Data
app.get('/api/sales', (req, res) => {
  const sqlSelect = "SELECT * FROM sales_reports";
  db.query(sqlSelect, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

// Updated route in autoparts-backend/server.ts
app.post('/api/inventory', (req, res) => {
    const { name, category, sku, currentStock, unitCost } = req.body;
    
    const company_id = 1; 
    const min_stock = 10;
    const supplier_id = 1; // Default numeric ID to match your schema

    const sqlInsert = `
        INSERT INTO inventory 
        (company_id, sku, product_name, category, current_stock, min_stock, unit_cost, supplier_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(sqlInsert, [company_id, sku, name, category, currentStock, min_stock, unitCost, supplier_id], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "Success", id: (result as any).insertId });
    });
});

// Add this to your autoparts-backend/server.ts
app.put('/api/inventory/:id', (req, res) => {
    const productId = req.params.id.replace('INV', '');
    // Destructure the names coming from your frontend updates
    const { name, category, sku, currentStock, minimumStock, unitCost, status } = req.body;

    const sqlUpdate = `
        UPDATE inventory 
        SET product_name = ?, category = ?, sku = ?, current_stock = ?, min_stock = ?, unit_cost = ?, status = ?
        WHERE product_id = ?
    `;

    db.query(
        sqlUpdate, 
        [name, category, sku, currentStock, minimumStock, unitCost, status, productId], 
        (err, result) => {
            if (err) {
                console.error("Database Update Error:", err);
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: "Updated successfully" });
        }
    );
});

// Add this to your autoparts-backend/server.ts
app.put('/api/inventory/:id', (req, res) => {
    // 1. Get the numeric ID from the INV00X string
    const productId = req.params.id.replace('INV', '');
    
    // 2. Destructure the data sent from the frontend
    const { name, category, sku, currentStock, minimumStock, unitCost, status } = req.body;

    // 3. SQL Query using snake_case to match your MySQL schema
    const sqlUpdate = `
        UPDATE inventory 
        SET product_name = ?, category = ?, sku = ?, current_stock = ?, min_stock = ?, unit_cost = ?, status = ?
        WHERE product_id = ?
    `;

    db.query(
        sqlUpdate, 
        [name, category, sku, currentStock, minimumStock, unitCost, status, productId], 
        (err, result) => {
            if (err) {
                console.error("Database Update Error:", err);
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: "Updated successfully" });
        }
    );
});

// Add this to your autoparts-backend/server.ts
app.delete('/api/inventory/:id', (req, res) => {
    const productId = req.params.id;
    // We must extract the number from your 'INV001' format
    const numericId = productId.replace('INV', '');

    const sqlDelete = "DELETE FROM inventory WHERE product_id = ?";
    
    db.query(sqlDelete, [numericId], (err, result) => {
        if (err) {
            console.error("Database Delete Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "Deleted successfully from Database" });
    });
});

// 3. Basic Login Route 
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sqlSelect = "SELECT * FROM users WHERE email = ? AND password_hash = ?";
  
  db.query(sqlSelect, [email, password], (err, result) => {
    if (err) return res.status(500).send(err);
    if (Array.isArray(result) && result.length > 0) {
      res.send(result[0]); // Returns user info including 'role'
    } else {
      res.status(401).send({ message: "Wrong email/password combination!" });
    }
  });
});

app.get('/api/inventory', (req, res) => {
    // In a multi-tenant system, we filter by company_id
    const sqlSelect = "SELECT * FROM inventory"; 
    db.query(sqlSelect, (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
    });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});