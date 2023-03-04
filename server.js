import express from 'express';
import router from './routes';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded());
app.use(router);

app.listen(port, () => console.log(`Server running on port ${port}`));
