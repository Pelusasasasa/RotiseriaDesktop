import { Types } from "mongoose"

export const validarId = (id) => {
    if(!Types.ObjectId.isValid(id)){
       return false;
    };

    return true;
}