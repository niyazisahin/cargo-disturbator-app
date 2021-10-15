
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://Charon:Ns190202069@navigation.xptsq.mongodb.net/CargoAppDb?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log('database e giremedim.');
client.connect(async err => {
  console.log('database e girdim');
  const collection = client.db("CargoAppDb").collection("Users");
  
  let kullanici = {

    UserName: 'Testasdasdasd',
    Password: '12345'
  }
  const res = await collection.findOne(kullanici);


  console.log(res);
  client.close();
});
