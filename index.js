const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.send('build/indexedDB.html');
});

app.listen('8080', (req, res) => {
    console.log('Server is running on port 8080');
});