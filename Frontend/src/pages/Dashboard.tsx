import { useEffect, useState } from "react";
import api from "../api/axios";

import SalesChart from "../components/SalesChart";
import TopProducts from "../components/TopProducts";
import LowStock from "../components/LowStock";
import RecentTransactions from "../components/RecentTransactions";

import { FaBox, FaShoppingCart, FaMoneyBill } from "react-icons/fa";


/* DUMMY DATA */

const dummyData = {

  totalProducts: 12,
  totalTransactions: 45,
  totalRevenue: 1250000,

  salesChart: {
    labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    values: [200,350,300,500,420,650,700]
  },

  topProducts: [
    { id:1, name:"Indomie", sold:120 },
    { id:2, name:"Teh Botol", sold:95 },
    { id:3, name:"Aqua", sold:80 }
  ],

  lowStock: [
    { id:4, name:"Kopi Kapal Api", stock:3 },
    { id:5, name:"Gula", stock:5 }
  ],

  recentTransactions: [
    { id:101, total:25000, date:"2026-03-31" },
    { id:102, total:18000, date:"2026-03-30" },
    { id:103, total:42000, date:"2026-03-29" }
  ]

};


const Dashboard = () => {

  const [data,setData] = useState<any>({});
  const [loading,setLoading] = useState(true);

  const getDashboard = async () => {

  try {

    const res = await api.get("/dashboard");

    if (!res.data || Object.keys(res.data).length === 0) {
      setData(dummyData);
    } else {
      setData(res.data);
    }

  } catch(err){

    console.log("API error, pakai dummy");

    setData(dummyData);

  } finally {

    setLoading(false);

  }

};

  useEffect(()=>{
    getDashboard();
  },[]);


  const formatRupiah = (number:number)=>{
    return new Intl.NumberFormat("id-ID").format(number || 0);
  };


  if(loading){
    return (
      <div className="content">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }


  return (

    <div className="content">

      <h1>Dashboard</h1>

      {/* STATS */}

      <div className="cards">

        <div className="card">

          <div className="card-header">
            <FaBox className="card-icon"/>
            <h3>Total Products</h3>
          </div>

          <p>{data?.totalProducts || 0}</p>

        </div>


        <div className="card">

          <div className="card-header">
            <FaShoppingCart className="card-icon"/>
            <h3>Total Transactions</h3>
          </div>

          <p>{data?.totalTransactions || 0}</p>

        </div>


        <div className="card">

          <div className="card-header">
            <FaMoneyBill className="card-icon"/>
            <h3>Total Revenue</h3>
          </div>

          <p>Rp {formatRupiah(data?.totalRevenue)}</p>

        </div>

      </div>


      {/* CHART */}

      <div className="chart-container">

        <h2>Sales Overview</h2>

        <SalesChart
          data={data?.salesChart || {labels:[],values:[]}}
        />

      </div>


      {/* GRID TABLE */}

      <div className="grid">

        <TopProducts
          products={data?.topProducts || []}
        />

        <LowStock
          products={data?.lowStock || []}
        />

      </div>


      {/* RECENT TRANSACTIONS */}

      <RecentTransactions
        transactions={data?.recentTransactions || []}
      />

    </div>

  );

};

export default Dashboard;