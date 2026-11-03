const express = require('express');
const pool = require('./db');

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    message: 'API de productos funcionando',
    endpoints: {
      health: '/api/health',
      productos: '/api/productos'
    }
  });
});

function validateProduct(body) {
  const errors = [];
  const { nombre, precio, stock, fk_clave_cat } = body;

  if (typeof nombre !== 'string' || nombre.trim().length === 0 || nombre.trim().length > 100) {
    errors.push('nombre debe ser un texto de 1 a 100 caracteres');
  }

  const numericPrice = Number(precio);
  if (!Number.isFinite(numericPrice) || numericPrice < 0 || numericPrice > 99999999.99) {
    errors.push('precio debe ser un número mayor o igual a 0');
  }

  const numericStock = Number(stock);
  if (!Number.isInteger(numericStock) || numericStock < 0) {
    errors.push('stock debe ser un entero mayor o igual a 0');
  }

  const numericCategory = Number(fk_clave_cat);
  if (!Number.isInteger(numericCategory) || numericCategory <= 0) {
    errors.push('fk_clave_cat debe ser un entero positivo');
  }

  return {
    errors,
    product: {
      nombre: typeof nombre === 'string' ? nombre.trim() : nombre,
      precio: numericPrice,
      stock: numericStock,
      fk_clave_cat: numericCategory
    }
  };
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/productos', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT pk_clave_pro, nombre, precio, stock, fk_clave_cat FROM productos ORDER BY pk_clave_pro'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get('/api/productos/:id', async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT pk_clave_pro, nombre, precio, stock, fk_clave_cat FROM productos WHERE pk_clave_pro = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/productos', async (req, res, next) => {
  const { errors, product } = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO productos (nombre, precio, stock, fk_clave_cat) VALUES (?, ?, ?, ?)',
      [product.nombre, product.precio, product.stock, product.fk_clave_cat]
    );
    const [rows] = await pool.execute(
      'SELECT pk_clave_pro, nombre, precio, stock, fk_clave_cat FROM productos WHERE pk_clave_pro = ?',
      [result.insertId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.put('/api/productos/:id', async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo' });
  }

  const { errors, product } = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE productos SET nombre = ?, precio = ?, stock = ?, fk_clave_cat = ? WHERE pk_clave_pro = ?',
      [product.nombre, product.precio, product.stock, product.fk_clave_cat, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const [rows] = await pool.execute(
      'SELECT pk_clave_pro, nombre, precio, stock, fk_clave_cat FROM productos WHERE pk_clave_pro = ?',
      [id]
    );
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/productos/:id', async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM productos WHERE pk_clave_pro = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
