import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  type: 'BUY' | 'SELL';
  productId: string;
  productName: string; // Snapshot for history
  quantity: number;
  price: number; // Unit price at transaction
  total: number;
  date: Date;
}

const TransactionSchema: Schema = new Schema({
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
