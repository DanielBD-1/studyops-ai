import app from './app.js';

const PORT = Number(process.env.PORT) || 3002;

app.listen(PORT, () => {
  console.log(`Document service listening on http://localhost:${PORT}`);
});
