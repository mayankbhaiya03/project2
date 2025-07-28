if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}





const express=require("express");
const app = express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");


const{listingSchema}=require("./schema.js");
const Review=require("./models/review.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const session=require("express-session");
const mongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


const dbUrl=process.env.ATLASDB_URL



main().then(()=>{
    console.log("connected to db");
}).catch(err=>{
    console.log(err);
});

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



const store=mongoStore.create({
    
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};

// app.get("/",(req,res)=>{
//     res.send("hi Iam a root");
// });



app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

async function main(){
    await mongoose.connect(dbUrl);
}


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});




app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter)

/*app.post("/listings",async(req,res)=>{
   const newListing= new Listing(req.body.listing);
   await newListing.save();
   res.redirect("/listings")
});*/


//REVIEWS
//Post route

// app.post("/listings/:id/reviews", async(req,res)=>{
//      let listing=await Listing.findById(req.params.id);
//      let newReview=new Review(req.body.review);

//      listing.reviews.push(newReview); 

//      await newReview.save();
//      await listing.save();
//      console.log("new review saved");
//      res.send("new review send");

// });






// app.get("/testListing",async(req,res)=>{
//     let sampleListing= new Listing({
//         title:"my new villa",
//         description:"by the beach",
//         price:1200,
//         location:"calangute,Goa",
//         country:"India"
//     });
//      await sampleListing.save();
//      console.log("sample was saved");
//      res.send("successful testing");
// });

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found!"))
});

app.use((err,req,res,next)=>{
    let{statusCode=500,message="something went Wrong!"}=err;
  res.status(statusCode).render("listings/error.ejs", { message });

   // res.status(statusCode).send(message);
});

app.listen(8080,(req,res)=>{
    console.log("server is listening to port 8080");

});                                         