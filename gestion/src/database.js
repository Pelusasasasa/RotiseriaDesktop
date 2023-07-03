const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/Rotiseria',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
    .then(db => console.log("Se conecto a la base de datos de Rotiseria"))
    .catch(err => console.log(err));