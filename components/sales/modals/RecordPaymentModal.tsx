"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IInvoice, PaymentMethod, IPaymentRecord } from "@/lib/types/sales";
import { CreditCard, DollarSign, CheckCircle2, Building2 } from "lucide-react";
import { useSettings } from "@/lib/context/SettingsContext";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: IInvoice | null;
  onPaymentRecorded: (payment: IPaymentRecord, invoiceId: string) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onPaymentRecorded,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>("Credit Card");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const { formatPrice } = useSettings();

  useEffect(() => {
    if (invoice) {
      setAmount(invoice.balanceDue > 0 ? invoice.balanceDue : invoice.totalAmount);
      setPaymentRef(`PAY-2026-${Math.floor(8822 + Math.random() * 500)}`);
    }
  }, [invoice]);

  if (!invoice) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const newPayment: IPaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      paymentRef: paymentRef || `PAY-2026-${Math.floor(8822 + Math.random() * 500)}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      amount: Number(amount),
      method,
      status: "Completed",
      date: new Date().toISOString(),
      notes,
      receivedBy: "Alex Rivers",
    };

    onPaymentRecorded(newPayment, invoice.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record Payment for ${invoice.invoiceNumber}`} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invoice Summary Banner */}
        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Customer:</span>
            <span className="font-bold text-slate-900 dark:text-white">{invoice.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Invoice Total:</span>
            <span className="font-mono font-bold">{formatPrice(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-rose-600 dark:text-rose-400">
            <span>Outstanding Balance Due:</span>
            <span className="font-mono">{formatPrice(invoice.balanceDue)}</span>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Payment Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              max={invoice.balanceDue || invoice.totalAmount}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Payment Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Card</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Payment Reference / Authorization #
            </label>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Check #8819 cleared via Chase Bank"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm & Record Payment ({formatPrice(amount)})
          </Button>
        </div>
      </form>
    </Modal>
  );
};
