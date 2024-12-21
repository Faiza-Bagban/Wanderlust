const mongoose=require("mongoose");
const initdata=require("./data.js");
const Listing=require("../models/listing.js");

main().then(()=>{
    console.log("connection succesful to DB");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
  
const initDB=async ()=>{
    await Listing.deleteMany({});
    initdata.data=initdata.data.map((obj)=>({...obj,owner:"66a54821b9fde31737ac84c6" })) ;     //For owner to enter in db.

    await Listing.insertMany(initdata.data);
    console.log("Data was initialized");
};


initDB();