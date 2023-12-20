const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
      },
    email: {
    type: String,
    required: true,
  },
  emailby: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  filedata: {
    type: Buffer,
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
