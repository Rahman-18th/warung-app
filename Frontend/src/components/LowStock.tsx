const LowStock = ({ products = [] }: any) => {

  return (

    <div className="table-container">

      <h2>Low Stock ⚠️</h2>

      <table>

        <thead>
          <tr>
            <th>Product</th>
            <th>Stock</th>
          </tr>
        </thead>

        <tbody>

          {products.length > 0 ? (

            products.map((p: any) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.stock}</td>
              </tr>
            ))

          ) : (

            <tr>
              <td colSpan={2} className="empty">
                No low stock products
              </td>
            </tr>

          )}

        </tbody>

      </table>

    </div>

  );

};

export default LowStock;