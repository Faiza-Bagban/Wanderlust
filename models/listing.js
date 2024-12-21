const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./reviews.js");


const ListingSchema=new Schema({
    title:{
        type:String,
        required:true

    },
    description:String,
    image:{
        type:String,
        default:"https://in.images.search.yahoo.com/search/images;_ylt=AwrKAyY5H5ZmvIgpIYe9HAx.;_ylu=c2VjA3NlYXJjaARzbGsDYnV0dG9u;_ylc=X1MDMjExNDcyMzAwNQRfcgMyBGZyA21jYWZlZQRmcjIDcDpzLHY6aSxtOnNiLXRvcARncHJpZANtR1FUWGRUN1N6NkcwR1NzYVY1cXZBBG5fcnNsdAMwBG5fc3VnZwMxMARvcmlnaW4DaW4uaW1hZ2VzLnNlYXJjaC55YWhvby5jb20EcG9zAzAEcHFzdHIDBHBxc3RybAMwBHFzdHJsAzI0BHF1ZXJ5A3Vuc3BsYXNoJTIwaW1hZ2VzJTIwb2YlMjBiZWFjaAR0X3N0bXADMTcyMTExNDUxMw--?p=unsplash+images+of+beach&fr=mcafee&fr2=p%3As%2Cv%3Ai%2Cm%3Asb-top&ei=UTF-8&x=wrt&type=E210IN714G0#id=9&iurl=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1515238152791-8216bfdf89a7%3Fixlib%3Drb-1.2.1%26w%3D1000%26q%3D80&action=click",
        set:(v)=>v===""?
        "https://in.images.search.yahoo.com/search/images;_ylt=AwrKAyY5H5ZmvIgpIYe9HAx.;_ylu=c2VjA3NlYXJjaARzbGsDYnV0dG9u;_ylc=X1MDMjExNDcyMzAwNQRfcgMyBGZyA21jYWZlZQRmcjIDcDpzLHY6aSxtOnNiLXRvcARncHJpZANtR1FUWGRUN1N6NkcwR1NzYVY1cXZBBG5fcnNsdAMwBG5fc3VnZwMxMARvcmlnaW4DaW4uaW1hZ2VzLnNlYXJjaC55YWhvby5jb20EcG9zAzAEcHFzdHIDBHBxc3RybAMwBHFzdHJsAzI0BHF1ZXJ5A3Vuc3BsYXNoJTIwaW1hZ2VzJTIwb2YlMjBiZWFjaAR0X3N0bXADMTcyMTExNDUxMw--?p=unsplash+images+of+beach&fr=mcafee&fr2=p%3As%2Cv%3Ai%2Cm%3Asb-top&ei=UTF-8&x=wrt&type=E210IN714G0#id=9&iurl=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1515238152791-8216bfdf89a7%3Fixlib%3Drb-1.2.1%26w%3D1000%26q%3D80&action=click"
        :v,
    },
    price:Number,
    location:String,
    country:String,

    reviews:[
        {
        type:Schema.Types.ObjectId,
        ref:"Review",
       },
    ],

    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
});



ListingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}});
    }
});







const Listing=mongoose.model("Listing",ListingSchema);
module.exports=Listing;