const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone = '', subject, message } = req.body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Please fill all required fields.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (message.length > 500) {
    return res.status(400).json({ error: 'Message too long.' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(15),
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )`;

    await sql`
      INSERT INTO contacts (name, email, phone, subject, message)
      VALUES (${name}, ${email}, ${phone}, ${subject}, ${message})`;

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error. Please try again.' });
  }
};
