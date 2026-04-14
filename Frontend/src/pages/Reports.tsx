import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

interface TransactionDetail {
  nama_produk: string;
  jumlah: number;
  subtotal: number;
}

interface Transaction {
  id: number;
  total_harga: number;
  total_profit: number;
  created_at: string;
  details: TransactionDetail[];
}

const Reports = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const getTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      const list = res.data.data || res.data.transactions || res.data;
      setTransactions(list);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal mendapatkan data laporan riwayat transaksi");
    }
  };

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <div className="content">
      <h2 className="page-title">Riwayat Penjualan</h2>
      <p className="page-subtitle">Daftar transaksi yang pernah dilakukan pada mesin kasir.</p>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Waktu Transaksi</th>
              <th>Total Belanja</th>
              <th>Profit</th>
              <th>Barang (Qty)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((trx) => (
                <tr key={trx.id}>
                  <td>{new Date(trx.created_at).toLocaleString("id-ID")}</td>
                  <td>Rp {Number(trx.total_harga).toLocaleString("id-ID")}</td>
                  <td style={{ color: "green" }}>Rp {Number(trx.total_profit).toLocaleString("id-ID")}</td>
                  <td>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {trx.details?.map((detail, idx) => (
                        <li key={idx}>
                          {detail.nama_produk} ({detail.jumlah}x)
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="empty" style={{ textAlign: "center", padding: "20px" }}>
                  Belum ada transaksi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
