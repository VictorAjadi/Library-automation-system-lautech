class Features {
  constructor(queryObject, queryString, docCount = 1) {
    this.queryObject = queryObject;
    this.queryString = queryString;
    this.docCount = docCount;
  }

  // Optimized search method with improved regex and handling chaining
  async search(text='', searchArr=[]) {
      if (text && searchArr) {
        const regex = new RegExp(text, 'i'); // Single regex instance for efficiency
        const searchKeys = searchArr
        .filter(key=> key) //filter out any falsy value
        .map(key=> ({[key.toString()]: {$regex: regex}}));
        if(searchKeys.length > 0){
          this.queryObject = this.queryObject.find({
              $or: searchKeys
          });
        }
      return this; // Allow chaining
    }
  }

  // Optimized filter method to avoid unnecessary query object mutation
  filter(filterArr=[]) {
    const {sort,fields,limit,skip,search,page, ...newQueryStr}=this.queryString;

    const excludedFields = ["sort", "fields", "limit", "skip", "search", "page"];
    excludedFields.forEach(field => delete newQueryStr[field]);

    // Optimize category filtering
    if (filterArr?.length>0) {
       filterArr.forEach(key=>{
        if(newQueryStr[key]){
          const filter = newQueryStr[key].split(' ')
          this.queryObject=this.queryObject.find({[key]: {$in: filter}});
          delete newQueryStr[key] //clean up used filter
        }
       })
    }

    this.queryObject = this.queryObject.find(newQueryStr); //remaining filters
    return this;
  }

  // Optimized sort method with optional default sorting
  sort() {
    if(this.queryString?.sort){
      const sortBy=this.queryString.sort.split(' ').join(' ').trim();
      this.queryObject = this.queryObject.sort(sortBy)
    }else{
      this.queryObject=this.queryObject.sort('-createAt');
    }
    return this;
  }

  // Optimized fields selection with optional exclusion of __v
  fields() {
    const fields = this.queryString.fields
      ? this.queryString.fields.split(" ").join(" ")
      : "-__v";
    this.queryObject = this.queryObject.select(fields);
    return this;
  }

  // Optimized pagination with range validation
  paginate(limitValue = 20) {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = parseInt(this.queryString.limit, 10) || limitValue;
    const skip = (page - 1) * limit;

    // Ensure skip does not exceed the document count
    if (skip > this.docCount) {
      this.queryObject = this.queryObject.skip(0).limit(10);
    } else {
      this.queryObject = this.queryObject.skip(skip).limit(limit);
    }
    return this;
  }
}

module.exports = Features;
