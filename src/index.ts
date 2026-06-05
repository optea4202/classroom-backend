import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import subjectsRouter from "./routes/subject";

const app = express();
const PORT = 8000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(express.json());

// API Routes (supports both plural and singular endpoints)
app.use('/api/subjects', subjectsRouter);
app.use('/api/subject', subjectsRouter);

// Root Health Check Route
app.get('/', (req, res) => {
  res.send('Hello, welcome to the Classroom API!');
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});