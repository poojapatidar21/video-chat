const mongoose = require('mongoose');
const user = new mongoose.Schema({
  userName: {
    type: String,
  },
  password: {
    type: String,
    },
  grouplist: {
    type: Array,
    },
  
})
module.exports = mongoose.model('User',user)