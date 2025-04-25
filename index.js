const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // ID único
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

let users = []; // [{ username, _id }]
let exercises = []; // [{ _id, description, duration, date }]

// 2. Criar usuário
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const _id = uuidv4();
  const newUser = { username, _id };
  users.push(newUser);
  res.json(newUser);
});

// 4. Listar todos os usuários
app.get('/api/users', (req, res) => {
  res.json(users);
});

// 7. Adicionar exercício
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const exercise = {
    _id: user._id,
    username: user.username,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  exercises.push(exercise);

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  });
});

// 9. Log de exercícios
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let userExercises = exercises.filter(e => e._id === _id);

  // Filtro por data
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(e => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(e => new Date(e.date) <= toDate);
  }

  // Limite
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  const log = userExercises.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date
  }));

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
