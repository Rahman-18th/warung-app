import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

interface Product {
  id: number;
  nama_produk: string;
  harga_jual: number;
  stok: number;
}

interface CartItem extends Product {
  jumlah: number;
}

const Transactions = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [bayar, setBayar] = useState("");

  const getProducts = async () => {
    try {
      const res = await api.get("/products");
      // Menyesuaikan jika backend membungkus dengan res.data.data
      const productList = res.data.data || res.data.products || res.data;
      setProducts(productList);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat produk");
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.nama_produk?.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: Product) => {
    if (product.stok <= 0) {
      toast.error("Stok habis!");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.jumlah + 1 > product.stok) {
          toast.error("Melebihi stok yang ada!");
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, jumlah: item.jumlah + 1 } : item
        );
      }
      return [...prev, { ...product, jumlah: 1 }];
    });
  };

  const updateQuantity = (id: number, type: "inc" | "dec") => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newJumlah = type === "inc" ? item.jumlah + 1 : item.jumlah - 1;
          if (newJumlah > item.stok) {
            toast.error("Melebihi stok yang ada!");
            return item;
          }
          return { ...item, jumlah: newJumlah };
        }
        return item;
      }).filter((item) => item.jumlah > 0);
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalBelanja = cart.reduce((total, item) => total + item.harga_jual * item.jumlah, 0);
  const kembalian = Number(bayar) - totalBelanja;

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Keranjang kosong!");
    if (Number(bayar) < totalBelanja) return toast.error("Uang bayar kurang!");

    const payload = {
      cart: cart.map(item => ({
        product_id: item.id,
        jumlah: item.jumlah
      }))
    };

    try {
      await api.post("/transactions", payload);
      toast.success("Transaksi berhasil!");
      setCart([]);
      setBayar("");
      getProducts(); // Refresh stok
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memproses transaksi");
    }
  };

  return (
    <div className="content" style={{ display: "flex", gap: "20px", height: "100%" }}>
      {/* Kiri: Daftar Produk */}
      <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
        <h2 className="page-title">Mesin Kasir (POS)</h2>
        <input
          className="search-input"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: "20px" }}
        />

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "15px",
          overflowY: "auto",
          paddingBottom: "20px"
        }}>
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => addToCart(p)}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                cursor: "pointer",
                backgroundColor: p.stok > 0 ? "#fff" : "#ffe6e6",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center"
              }}
            >
              <h4 style={{ margin: "0 0 10px 0" }}>{p.nama_produk}</h4>
              <p style={{ margin: "0 0 5px 0", color: "#28a745", fontWeight: "bold" }}>
                Rp {p.harga_jual.toLocaleString("id-ID")}
              </p>
              <small style={{ color: "#666" }}>Stok: {p.stok}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Kanan: Keranjang */}
      <div style={{
        flex: 1,
        backgroundColor: "#f8f9fa",
        borderRadius: "10px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        minWidth: "300px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <h3>Keranjang</h3>
        <div style={{ flex: 1, overflowY: "auto", borderBottom: "1px solid #ccc", marginBottom: "15px" }}>
          {cart.length === 0 ? (
            <p style={{ color: "#888", textAlign: "center", marginTop: "50px" }}>Keranjang masih kosong</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <h5 style={{ margin: "0" }}>{item.nama_produk}</h5>
                  <small>Rp {item.harga_jual.toLocaleString("id-ID")} x {item.jumlah}</small>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button onClick={() => updateQuantity(item.id, "dec")} style={{ padding: "2px 8px", cursor: "pointer" }}>-</button>
                  <span>{item.jumlah}</span>
                  <button onClick={() => updateQuantity(item.id, "inc")} style={{ padding: "2px 8px", cursor: "pointer" }}>+</button>
                  <button onClick={() => removeFromCart(item.id)} style={{ padding: "2px 8px", color: "red", backgroundColor: "transparent", border: "none", cursor: "pointer" }}>x</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontWeight: "bold", fontSize: "1.2rem" }}>
          <span>Total:</span>
          <span>Rp {totalBelanja.toLocaleString("id-ID")}</span>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Uang Bayar (Rp):</label>
          <input
            type="number"
            value={bayar}
            onChange={(e) => setBayar(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "1.1rem" }}
          />
        </div>

        {bayar && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", color: kembalian < 0 ? "red" : "green" }}>
            <span>Kembalian:</span>
            <span>Rp {kembalian.toLocaleString("id-ID")}</span>
          </div>
        )}

        <button
          onClick={handleCheckout}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "1.1rem",
            cursor: "pointer",
            fontWeight: "bold",
            opacity: cart.length === 0 ? 0.6 : 1
          }}
          disabled={cart.length === 0}
        >
          Bayar Sekarang
        </button>
      </div>
    </div>
  );
};

export default Transactions;
