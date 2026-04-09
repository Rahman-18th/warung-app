import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const Products = () => {

  const [products,setProducts] = useState<any[]>([]);
  const [showModal,setShowModal] = useState(false);
  const [search,setSearch] = useState("");
  const [editingId,setEditingId] = useState<number | null>(null);

  const [form,setForm] = useState({
    nama_produk: "",
    harga_beli: "",
    harga_jual: "",
    stok: ""
  });

  const filteredProducts = products.filter((p:any)=>
    p.nama_produk?.toLowerCase().includes(search.toLowerCase())
  );

  // GET PRODUCTS
  const getProducts = async () => {
    try{
      const res = await api.get("/products");
      setProducts(res.data.data || res.data.products || res.data || []);
    }catch(err){
      console.log("ERROR:", err);
      setProducts([]);
    }
  };

  useEffect(()=>{
    getProducts();
  },[]);

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // SAVE PRODUCT (ADD / EDIT) 
  const handleSave = async ()=>{
    try{
      if(editingId){
        await api.put(`/products/${editingId}`,{
          nama_produk: form.nama_produk,
          harga_beli: Number(form.harga_beli),
          harga_jual: Number(form.harga_jual),
          stok: Number(form.stok)
        });
      }else{
        await api.post("/products",{
          nama_produk: form.nama_produk,
          harga_beli: Number(form.harga_beli),
          harga_jual: Number(form.harga_jual),
          stok: Number(form.stok)
        });
      }

      getProducts();
      setShowModal(false);
      setEditingId(null);
      setForm({ nama_produk:"", harga_beli:"", harga_jual:"", stok:"" });
      toast.success(editingId ? "Produk diperbarui" : "Produk berhasil ditambahkan");

    }catch(err: any){
      console.log(err);
      toast.error(err.response?.data?.message || "Gagal menyimpan produk");
    }
  };

  // DELETE PRODUCT
  const handleDelete = async (id:number)=>{
    const confirmDelete = confirm("Hapus produk ini?");
    if(!confirmDelete) return;

    try{
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p=>p.id !== id));
    }catch(err){
      console.log(err);
    }
  };

  // EDIT PRODUCT
  const handleEdit = (product:any)=>{
    setForm({
      nama_produk: product.nama_produk,
      harga_beli: String(product.harga_beli),
      harga_jual: String(product.harga_jual),
      stok:     String(product.stok)
    });
    setEditingId(product.id);
    setShowModal(true);
  };

  return (
  <div className="content">

    <h2 className="page-title">Products</h2>
    <p className="page-subtitle">Kelola stok dan harga produk.</p>

    <button
      className="add-btn"
      onClick={()=>{
        setEditingId(null);
        setForm({nama_produk:"", harga_beli:"", harga_jual:"", stok:""});
        setShowModal(true);
      }}
    >
      + Tambah Produk
    </button>

    <input
      className="search-input"
      placeholder="Cari nama produk..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
    />

    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Harga Beli</th>
            <th>Harga Jual</th>
            <th>Stok</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p:any)=>(
              <tr key={p.id}>
                <td>{p.nama_produk}</td>
                <td>Rp {p.harga_beli?.toLocaleString('id-ID')}</td>
                <td>Rp {p.harga_jual?.toLocaleString('id-ID')}</td>
                <td>{p.stok}</td>
                <td>
                  <button className="edit-btn" onClick={()=>handleEdit(p)}>Edit</button>
                  <button className="delete-btn" onClick={()=>handleDelete(p.id)}>Hapus</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="empty">Belum ada produk</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

{/* MODAL */}
{showModal && (
<div className="modal">
  <div className="modal-content">
    <h3>{editingId ? "Edit Produk" : "Tambah Produk"}</h3>
    
    <label>Nama Produk</label>
    <input
      name="nama_produk"
      placeholder="Kopi Kapal Api"
      value={form.nama_produk}
      onChange={handleChange}
    />

    <label>Harga Beli / Modal</label>
    <input
      name="harga_beli"
      placeholder="8000"
      type="number"
      value={form.harga_beli}
      onChange={handleChange}
    />
    
    <label>Harga Jual</label>
    <input
      name="harga_jual"
      placeholder="10000"
      type="number"
      value={form.harga_jual}
      onChange={handleChange}
    />

    <label>Stok</label>
    <input
      name="stok"
      placeholder="100"
      type="number"
      value={form.stok}
      onChange={handleChange}
    />

    <div className="modal-actions">
      <button className="save-btn" onClick={handleSave}>Simpan</button>
      <button className="cancel-btn" onClick={()=>setShowModal(false)}>Batal</button>
    </div>
  </div>
</div>
)}

  </div>
);
};

export default Products;