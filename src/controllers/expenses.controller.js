const expenseModel = require('../models/expense.model');

const CATEGORIES = ['toll', 'parking', 'permit', 'insurance', 'fine', 'other'];

async function list(req, res) {
    const { vehicleId, category, limit } = req.query;
    const expenses = await expenseModel.listExpenses({ vehicleId, category, limit });
    return res.status(200).json({ expenses });
}

async function create(req, res) {
    const { vehicleId, category, description, cost } = req.body;
    if (!category || cost === undefined) {
        return res.status(422).json({ message: 'category and cost are required' });
    }
    if (!CATEGORIES.includes(category)) {
        return res.status(422).json({ message: `category must be one of: ${CATEGORIES.join(', ')}` });
    }
    if (Number(cost) < 0) {
        return res.status(422).json({ message: 'cost cannot be negative' });
    }
    const expense = await expenseModel.createExpense({ vehicleId, category, description, cost });
    return res.status(201).json({ expense });
}

module.exports = { list, create, CATEGORIES };
