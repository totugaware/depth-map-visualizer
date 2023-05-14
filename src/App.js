import './App.css';
import React, { useState, useEffect,useRef } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'; 
import axios from 'axios'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {

  const windowSize = useRef([window.innerWidth, window.innerHeight]);
  const baseUrl = "https://fapi.binance.com";
  const depthUrl = "/fapi/v1/depth";
  const currentPrice = "/fapi/v1/ticker/price"

  
   const [orders, setOrders] = useState({}) 
   const [labels,setLabels] = useState([]);
   const [bidsG, setBidsG] = useState([])
   const [asksG, setAsksG] = useState([])
   const [data, setData] = useState([{}]);

   const [btcPrice, setBtcPrice] = useState(''); 

   async function getCurrentPrice(symbol) {
    try {
      const fetchData = await axios.get(baseUrl + currentPrice, {params: {
        symbol: symbol,
      }})
      const response = fetchData.data;
      console.log(response);
      setBtcPrice(response.price)
    }
      
      catch(e) {
        console.log(e)
      }
  }

   async function bidAsks(symbol,limit) {
    try {
      const fetchData = await axios.get(baseUrl + depthUrl, {params: {
        symbol: symbol,
        limit: limit,
      }}
      );
      const depths = fetchData.data;
      var bids = depths['bids'].reverse() // Long
      var asks = depths['asks'] // Short

      var bidsIntValue = []

      var acummuladorDeBids = 0;
      var bidsDiff = [];
      for (let index = 0; index < bids.length; index++) {
        if(index !== bids.length && index +1  !== bids.length ) {
          var int0 = bids[index][0].split('.')[0]
         int0 = int0.substring(0, int0.length - 1);
         
          var int1 = bids[index + 1][0].split('.')[0]
          int1 = int1.substring(0, int1.length - 1);
          if( int0 === int1) {
            acummuladorDeBids += parseFloat(bids[index][1])
        } else {
          
          bidsDiff.push({
            name: (int0 * 10),
            bids: acummuladorDeBids,
          })
          
          acummuladorDeBids = 0;
        }
      }
      }

      var acummuladorDeasks = 0;
      var asksDiff = [];
      for (let index = 0; index < asks.length; index++) {
        if(index !== asks.length && index +1  !== asks.length ) {
          var int0a = asks[index][0].split('.')[0]
         int0a = int0a.substring(0, int0a.length - 1);
         
          var int1a = asks[index + 1][0].split('.')[0]
          int1a = int1a.substring(0, int1a.length - 1);
          if( int0a === int1a) {
            acummuladorDeasks += parseFloat(asks[index][1])
        } else {
          asksDiff.push({
            name: (int0a * 10),
            asks: acummuladorDeasks,
          })
          
          acummuladorDeasks = 0;
        }
      }
      }



      var bidsInT = bids.map((elemnt) =>  [ parseFloat(elemnt[0]), parseFloat(elemnt[1])]);
      var asksInt =asks.map((elemnt) =>  [ parseFloat(elemnt[0]), parseFloat(elemnt[1])]); 
    
      var json = {}
      json.bids = bidsInT
      json.asks = asksInt
      json.bidsDiff1 = bidsIntValue
      json.asksDiff = asksDiff

      var dataBids = []
      var dataAsks = []

      for (let index = 0; index < bidsInT.length; index++) {
        dataBids.push(
          {
            name: bidsInT[index][0],
            bids: bidsInT[index][1],
          
          }
        );
        dataAsks.push(
          {
            name: asksInt[index][0],
            asks: asksInt[index][1],
            
          })
        
      }

      setBidsG(bidsDiff);
      setAsksG(asksDiff)
      return json;  

    } catch (error) {
      console.log(error);
    }
 
  }

  async function period(secs) {
    setInterval(async function() {
      await getCurrentPrice('BTCUSDT');
      await bidAsks('BTCUSDT', 1000)
    }, secs * 1000);
  }
  
// Use effect to get the orders
//
  useEffect(function() {
    period(5)
  }, []) 

  return (
    <Container fluid>
      <Row>
      
      <h2>
        BTCUSDT: {btcPrice} 
         </h2>
      </Row>
    <Row>
      
      
      <Col md={6}> 
      <BarChart
      width={windowSize.current[0] / 2}
      height={windowSize.current[1] -100 }
      data={bidsG}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5
      }}
      barSize={20}
    >
      <XAxis dataKey="name" scale="point" padding={{ left: 5, right: 5 }} />
      <YAxis />
      <Tooltip />
      <Legend />
      <CartesianGrid strokeDasharray="3 3" />
      <Bar dataKey="bids" fill="#66BB66" background={{ fill: "#eee" }} />
    </BarChart></Col>
    <Col md={6}> <BarChart
      width={windowSize.current[0] / 2}
      height={windowSize.current[1]- 100}
      data={asksG}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5
      }}
      barSize={20}
    >
      <XAxis dataKey="name" scale="point" padding={{ left: 5, right: 5 }} />
      <YAxis />
      <Tooltip />
      <Legend />
      <CartesianGrid strokeDasharray="3 3" />
      <Bar dataKey="asks" fill="#BB6666" background={{ fill: "#eee" }} />
    </BarChart></Col>
    </Row>
  </Container>
   
   
  );
}

export default App;
