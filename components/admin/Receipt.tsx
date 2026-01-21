import React from 'react';
import { ITransaction } from '@/models/Transaction'; // We might need to handle types carefully if not shared

interface ReceiptProps {
  transaction: any; // Using any for flexibility or define proper type overlapping with API response
  onClose?: () => void;
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ transaction }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white text-black w-[80mm] min-h-[100mm] mx-auto font-mono text-sm border border-gray-200">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold uppercase">Jumot Collections</h1>
        <p className="text-xs">Premium E-commerce</p>
        <p className="text-xs">Lagos Nigeria</p>
      </div>
      
      <div className="border-b border-black mb-4"></div>
      
      <div className="mb-4">
        <p><strong>Date:</strong> {new Date(transaction.date).toLocaleString()}</p>
        <p><strong>Receipt #:</strong> {transaction._id.substring(transaction._id.length - 8).toUpperCase()}</p>
        <p><strong>Type:</strong> {transaction.type}</p>
      </div>

      <table className="w-full mb-4 text-left">
        <thead>
          <tr className="border-b border-black border-dashed">
            <th className="py-1">Item</th>
            <th className="py-1 text-right">Qty</th>
            <th className="py-1 text-right">Price</th>
            <th className="py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1">{transaction.productName}</td>
            <td className="py-1 text-right">{transaction.quantity}</td>
            <td className="py-1 text-right">₦{transaction.price.toFixed(2)}</td>
            <td className="py-1 text-right">₦{transaction.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div className="border-t border-black border-dashed pt-2 mb-4">
        <div className="flex justify-between font-bold text-lg">
          <span>TOTAL</span>
          <span>₦{transaction.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center mt-8 text-xs">
        <p>Thank you for your business!</p>
        <p>No refunds on sale items.</p>
        <p>jumot-collections.com</p>
      </div>
    </div>
  );
});

Receipt.displayName = "Receipt";
