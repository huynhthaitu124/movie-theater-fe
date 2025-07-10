import React, { useState, useEffect } from 'react';
import { Receipt, Download, Building } from 'lucide-react';
import { invoiceService } from '../../services/modules/invoice.service';
import { transactionService } from '../../services/modules/transaction.service';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const InvoiceSection: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { invoiceid } = useParams();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [transactionPrices, setTransactionPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (currentUser?.accountid) {
          // Fetch invoices and transactions in parallel
          const [invoiceRes, transactionRes] = await Promise.all([
            invoiceService.getByAccountId(currentUser.accountid),
            transactionService.getByAccountId(currentUser.accountid),
          ]);
          console.log('Invoices:', invoiceRes.data);
          console.log('Transactions:', transactionRes.data);
          setInvoices(invoiceRes.data || []);
          setTransactions(transactionRes.data || []);
        }
      } catch (error) {
        setInvoices([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  // Filter invoices to only those that have a matching invoiceid in transactions
  const transactionInvoiceIds = new Set(transactions.map((t: any) => t.invoiceid));
  const filteredInvoices = invoices.filter((inv: any) => transactionInvoiceIds.has(inv.invoiceid));

  useEffect(() => {
    const fetchTransactionPrices = async () => {
      const prices: Record<string, number> = {};
      for (const invoice of filteredInvoices) {
        try {
          const res = await transactionService.getTransactionByInvoiceId(invoice.invoiceid);
          const transaction = Array.isArray(res.data) ? res.data[0] : res.data;
          prices[invoice.invoiceid] = transaction?.price || 0;
        } catch {
          prices[invoice.invoiceid] = 0;
        }
      }
      setTransactionPrices(prices);
    };

    if (filteredInvoices.length) {
      fetchTransactionPrices();
    }
  }, [filteredInvoices]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const downloadInvoice = (invoice: any) => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = `invoice-${invoice.invoiceid}.pdf`;
    link.click();
  };

  // Only show the invoice that matches the invoiceid from the URL
  const selectedInvoice = invoices.find((inv: any) => inv.invoiceid === invoiceid);

  if (loading) {
    return <div className="text-white">Loading invoice...</div>;
  }

  if (!selectedInvoice) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Invoice not found</h3>
        <p className="text-gray-400">No invoice matches this transaction.</p>
      </div>
    );
  }

  // Render only the selected invoice
  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/dashboard?tab=history')}
        className="mb-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 transition-colors"
      >
        ← Back to Booking History
      </button>
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 mb-6">
        <div className="p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Invoice #{selectedInvoice.invoiceid.slice(0, 8)}...</h2>
            <p className="text-gray-300">Date: {formatDate(selectedInvoice.createdat)}</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Building className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">CinemaMax</h1>
          </div>
          <div className="border-t border-b border-gray-600 py-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-white mb-2">Invoice Information</h3>
                <p className="text-sm text-gray-400">Invoice #: {selectedInvoice.invoiceid}</p>
                <p className="text-sm text-gray-400">Date: {formatDate(selectedInvoice.createdat)}</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Account ID</h3>
                <p className="text-sm text-gray-400">{selectedInvoice.accountid}</p>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-medium text-white mb-4">Booking Details</h3>
            <div className="border border-gray-600 rounded-lg">
              <table className="w-full">
                <tbody>
                  {Object.entries(selectedInvoice).map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-4 py-2 text-sm text-white font-semibold">{key}</td>
                      <td className="px-4 py-2 text-sm text-white">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-white">Total Amount</span>
              <span className="text-2xl font-bold text-white">
                {formatCurrency(transactionPrices[selectedInvoice.invoiceid] ?? 0)}
              </span>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>Thank you for choosing CinemaMax!</p>
            <p>For support, please contact us at support@cinemamax.com</p>
          </div>
        </div>
        <div className="p-6 border-t border-gray-700 bg-gray-700/50">
          <div className="flex space-x-4">
            <button
              onClick={() => downloadInvoice(selectedInvoice)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSection;