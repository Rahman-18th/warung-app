const TopProducts = ({ products = [] }: any) => {

  return (

    <div className="table-container">

      <h2>Top Selling Products</h2>

      <table>

        <thead>
          <tr>
            <th>Product</th>
            <th>Sold</th>
          </tr>
        </thead>

        <tbody>

          {products.length > 0 ? (

            products.map((p: any) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.sold}</td>
              </tr>
            ))

          ) : (

            <tr>
              <td colSpan={2} className="empty">
                No top selling products yet
              </td>
            </tr>

          )}

        </tbody>

      </table>

    </div>

  );

};

export default TopProducts;