import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// GET /api/expenses — list all expenses newest first
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, description, amount, category, created_at FROM expenses ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: any) {
    console.log(JSON.stringify({ level: 'error', route: 'GET /expenses', message: err.message }));
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST /api/expenses — create a new expense
router.post('/', async (req: Request, res: Response) => {
  try {
    const { description, amount, category } = req.body;

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'description is required' });
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }
    const validCategories = ['food', 'transport', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'category must be food, transport, or other' });
    }

    const result = await pool.query(
      'INSERT INTO expenses (description, amount, category) VALUES ($1, $2, $3) RETURNING id, description, amount',
      [description.trim(), amountNum, category]
    );
    console.log(JSON.stringify({ level: 'info', route: 'POST /expenses', id: result.rows[0].id }));
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.log(JSON.stringify({ level: 'error', route: 'POST /expenses', message: err.message }));
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// DELETE /api/expenses/:id — remove an expense
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid expense id' });
    }
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    console.log(JSON.stringify({ level: 'info', route: 'DELETE /expenses/:id', id }));
    res.json({ deleted: true, id });
  } catch (err: any) {
    console.log(JSON.stringify({ level: 'error', route: 'DELETE /expenses/:id', message: err.message }));
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;