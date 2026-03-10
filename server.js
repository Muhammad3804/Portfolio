/**
 * server.js
 * Lightweight Express static server for the portfolio.
 * Run: node server.js
 * Then open: http://localhost:3000
 */

const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Serve everything in the project root as static files
app.use(express.static(path.join(__dirname)));

// Fallback — serve index.html for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  Portfolio running at http://localhost:${PORT}\n`);
});
