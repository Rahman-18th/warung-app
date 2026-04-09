const RecentTransactions = ({ transactions = [] }: any) => {

  return (

    <div className="table-container">

      <h2>Recent Transactions</h2>

      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>

          {transactions.length > 0 ? (

            transactions.map((t: any) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>Rp {t.total}</td>
                <td>{t.date}</td>
              </tr>
            ))

          ) : (

            <tr>
              <td colSpan={3} className="empty">
                No transactions yet
              </td>
            </tr>

          )}

        </tbody>

      </table>

    </div>

  );

};

export default RecentTransactions;