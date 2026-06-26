const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    borrowDate: {
      type: Date,
      default: Date.now
    },
    returnDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['borrowed', 'returned'],
      default: 'borrowed'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
