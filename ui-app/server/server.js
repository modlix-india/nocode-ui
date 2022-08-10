const express = require('express');
const views = require('./routes/views');
const app = express();
const port = 3000;

app.use('/api', views);

app.listen(port, () => {
  console.log(`Your app listening on port ${port}`);
})