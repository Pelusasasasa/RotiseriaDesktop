
const DB_URI = 'mongodb://192.168.201.80:27017/Rotiseria';

import Realm from 'realm';

const app = new Realm.App({ id: "tu-app-id-de-atlas" }); // Opcional para Atlas

async function connectToMongoDB() {
  const user = await app.logIn(Realm.Credentials.anonymous());
  const mongodb = user.mongoClient("mongodb-atlas"); // Servicio en Realm
  const db = mongodb.db("rotiseria");
  
  const productos = await db.collection("productos").find({});
}

connectToMongoDB();