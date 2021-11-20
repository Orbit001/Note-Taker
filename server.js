const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = process.env.port || 3001;

const app = express();

let lastIndex = null;

app.use(express.static("public"));
app.use(express.json());

// GET Route for homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, './public/index.html'))
);

// GET Route for notes page
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, './public/notes.html'));
});

/*FS Functions*/
const writeToFile = (destination, content) => //Turns parsed data into string before file write
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
  err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

const readAndAppend = (destination, content) => {
  fs.readFile(destination, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      lastIndex++; //Increments id prefix
      let parsedData = JSON.parse(data);
      let dataId = lastIndex + "+" + Math.floor(Math.random() * 999); //Full id
      let newData = { //Start of object
        id: dataId,
      };
      Object.assign(newData, content.req.body); //Push req data into new object
      parsedData.push(newData); //Add object to end of parsed file
      writeToFile(destination, parsedData);
    }
  });
};

/*Functions in index.js*/
//GET Route for notes data
app.get('/api/notes', (req, res) => {
  fs.readFile(".\\db\\db.json", 'utf8', (err, data) => {
    if (err) {
      console.error("Reading " + err);
    } else {
      res.send(data);
    }
  });  
});

// POST Route for notes data
app.post('/api/notes', (req, res) => {
  readAndAppend('.\\db\\db.json', res);
  res.json(`${req.method} request received to post to notes`);
});

// DELETE Route for notes data
app.delete('/api/notes/:id', (req, res) => {
  fs.readFile(".\\db\\db.json", 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      let parsedData = JSON.parse(data);
      for(i = 0; i < parsedData.length; i++){
        if(parsedData[i].id === req.params.id){ //Makes sure id's match
          parsedData.splice(i, 1);
          writeToFile(".\\db\\db.json", parsedData);
          if(parsedData.length > 0){
            lastIndex = Number(parsedData[parsedData.length-1].id.split('+',1)[0]);
          } else {
            lastIndex = -1;
          }
          res.json(`${req.method} request received to delete from notes`);
          return;
        }
      }
    }
  });
});

//When server is started lastIndex is initialized 
app.listen(PORT, () => {
  fs.readFile(".\\db\\db.json", 'utf8', (err, data) => { //Read to get last note id
    if (err) {
      console.error(err);
    } else {
      let parsedData = JSON.parse(data);
      if(parsedData.length > 0){
        lastIndex = Number(parsedData[parsedData.length-1].id.split('+',1)[0]);
      } else {
        lastIndex = -1;
      }
    }
  });
  console.log(`App listening at http://localhost:${PORT} 🚀`)
});