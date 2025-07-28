const Listing=require("../models/listing");

module.exports.index=async (req,res)=>{
  const allListings= await Listing.find({});
  res.render("listings/index.ejs",{allListings});
};


module.exports.renderNewForm=(req,res)=>{
 res.render("listings/new.ejs");
};

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
   const listing= await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
   if(!listing){
    req.flash("error","Listing you requested for does not exist");
    res.redirect("/listings");
   }
  res.render("listings/show", { listing });

};

module.exports.createListing=async (req, res,next) => {
  let url=req.file.path;
  let filename=req.file.filename;
  

    
       let { title, description, price, location, country, image } = req.body.listing;

    // Save image in object format to match seeded data
    const newListing = new Listing({
        title,
        description,
        price,
        location,
        country,
        image: { url: image } // wrap in object like seeded listings
    });

    
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
   
    
};

module.exports.renderEditForm=async(req,res)=>{
     let {id}=req.params;
   const listing= await Listing.findById(id);

   let originalImageUrl=listing.image.url;
   originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing=async (req, res) => {
   

    let {id}=req.params;

    let listing= await Listing.findById(id);
    if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to edit");
    return res.redirect(`/listings/${id}`);
}

  let listings= await  Listing.findByIdAndUpdate(id,{...req.body.listing});

  if(typeof req.file !=="undefined"){
 let url=req.file.path;
  let filename=req.file.filename;
  listings.image={url,filename};
  await listings.save();
}
      req.flash("success"," Listing Updated!");
  res.redirect(`/listings/${id}`);

};

module.exports.destroyListing=async(req,res)=>{
     let {id}=req.params;
   let deletedListing= await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
       req.flash("success","Listing Deleted!");
   res.redirect("/listings");

};