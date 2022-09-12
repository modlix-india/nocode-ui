import express from 'express';
import router from './routes/views.js';
import verifyLogin from './routes/verifyLogin.js';
import  { auth } from './middleware/auth.js';
import jwt from 'jsonwebtoken';
import { application } from './constants/Application.js';
import { login } from './constants/Login.js';

const app = express();
const port = 3000;

app.use('/verifyLogin', verifyLogin);

app.post('/login', (req, res) => {
    const token = jwt.sign(
        {name: 'Bruce Wayne'},
        'IM_BATMAN_SHHH'
    );
    res.json({
        login: true,
        token: token,
    });
});

app.use('/application', (req, res) => {
    res.json(application);
});

app.use('/loginPageDefinition', (req, res) => {
    res.json(login);
});

app.use(auth);
app.use('/api', router);

app.listen(port, () => {
  console.log(`Your app listening on port ${port}`);
})