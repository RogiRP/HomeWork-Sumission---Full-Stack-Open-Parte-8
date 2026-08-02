const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  born: { type: Number },
});

authorSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Author", authorSchema);
