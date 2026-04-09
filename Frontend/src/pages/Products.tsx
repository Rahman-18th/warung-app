import { useEffect, useState } from "react";
import api from "../api/axios";

const Products = () => {

  const [products,setProducts] = useState<any[]>([]);
  const [showModal,setShowModal] = useState(false);
  const [search,setSearch] = useState("");
  const [editingId,setEditingId] = useState<number | null>(null);

  const [form,setForm] = useState({
    name:"",
    price:"",
    stock:""
  });

  const filteredProducts = products.filter((p:any)=>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // GET PRODUCTS
  const getProducts = async () => {

  try{

    const res = await api.get("/products");

    setProducts(res.data.products || []);

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
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock)
        });

      }else{

        await api.post("/products",{
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock)
        });

      }

      getProducts();

      setShowModal(false);
      setEditingId(null);

      setForm({
        name:"",
        price:"",
        stock:""
      });

    }catch(err){
      console.log(err);
    }

  };

  // DELETE PRODUCT

  const handleDelete = async (id:number)=>{

    const confirmDelete = confirm("Delete this product?");
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
      name:product.name,
      price:String(product.price),
      stock:String(product.stock)
    });

    setEditingId(product.id);

    setShowModal(true);

  };

  return (

  <div className="content">

    <h2 className="page-title">Products</h2>
    <p className="page-subtitle">Manage your products here.</p>

    <button
      className="add-btn"
      onClick={()=>{
        setEditingId(null);
        setForm({name:"",price:"",stock:""});
        setShowModal(true);
      }}
    >
      + Add Product
    </button>

    <input
      className="search-input"
      placeholder="Search product..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
    />

    <div className="table-container">

      <table>

        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {filteredProducts.length > 0 ? (

            filteredProducts.map((p:any)=>(
              <tr key={p.id}>

                <td>{p.name}</td>
                <td>Rp {p.price}</td>
                <td>{p.stock}</td>

                <td>

                  <button
                    className="edit-btn"
                    onClick={()=>handleEdit(p)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={()=>handleDelete(p.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))

          ) : (

            <tr>
              <td colSpan={4} className="empty">
                No products yet
              </td>
            </tr>

          )}

        </tbody>

      </table>

    </div>

{/* MODAL */}

{showModal && (

<div className="modal">

  <div className="modal-content">

    <h3>{editingId ? "Edit Product" : "Add Product"}</h3>

    <input
      name="name"
      placeholder="Product Name"
      value={form.name}
      onChange={handleChange}
    />

    <input
      name="price"
      placeholder="Price"
      value={form.price}
      onChange={handleChange}
    />

    <input
      name="stock"
      placeholder="Stock"
      value={form.stock}
      onChange={handleChange}
    />

    <div className="modal-actions">

      <button
        className="save-btn"
        onClick={handleSave}
      >
        Save
      </button>

      <button
        className="cancel-btn"
        onClick={()=>setShowModal(false)}
      >
        Cancel
      </button>

    </div>

  </div>

</div>

)}

  </div>

);

};

export default Products;