import express from 'express';

const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Server is running!');
});


app.get('/login',(req,res) => {
    res.send("Login is showng");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});