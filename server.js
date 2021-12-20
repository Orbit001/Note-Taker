const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.port;



let storedData = null;

app.use(express.static("public"));
app.use(express.json());

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
  err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

const readAndAppend = (destination, content) => {
  fs.readFile(destination, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      storedData++; 
      let Retrieveddata = JSON.parse(data);
      let dataId = storedData + "+" + Math.floor(Math.random() * 999); 
      let newData = { 
        id: dataId,
      };
      Object.assign(newData, content.req.body); 
      Retrieveddata.push(newData); 
      writeToFile(destination, Retrieveddata);
    }
  });
};


app.get('/api/notes', (req, res) => {
  fs.readFile("./db/db.json", 'utf8', (err, data) => {
    if (err) {
      console.error("Reading " + err);
    } else {
      res.send(data);
    }
  });  
});


app.post('/api/notes', (req, res) => {
  readAndAppend("./db/db.json", res);
  res.json(`${req.method} request received to post to notes`);
});


app.delete('/api/notes/:id', (req, res) => {
  fs.readFile("./db/db.json", 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      let Retrieveddata = JSON.parse(data);
      for(i = 0; i < Retrieveddata.length; i++){
        if(Retrieveddata[i].id === req.params.id){
          Retrieveddata.splice(i, 1);
          writeToFile("./db/db.json", Retrieveddata);
          if(Retrieveddata.length > 0){
            storedData = Number(Retrieveddata[Retrieveddata.length-1].id.split('+',1)[0]);
          } else {
            storedData = -1;
          }
          res.json(`${req.method} request received to delete from notes`);
          return;
        }
      }
    }
  });
});

app.listen(PORT, () => {
  fs.readFile("./db/db.json", 'utf8', (err, data) => { 
    if (err) {
      console.error(err);
    } else {
      let Retrieveddata = JSON.parse(data);
      if(Retrieveddata.length > 0){
        storedData = Number(Retrieveddata[Retrieveddata.length-1].id.split('+',1)[0]);
      } else {
        storedData = -1;
      }
    }
  });
  console.log(`App listening at http://localhost:${PORT} 🚀`)
});
