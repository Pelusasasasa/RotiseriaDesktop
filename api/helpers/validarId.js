const { Types } = require('mongoose');

const validarId = (id) => {
    if(!Types.ObjectId.isValid(id)){
       return false;
    };

    return true;
};


module.exports = validarId;