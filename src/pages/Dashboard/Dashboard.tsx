import ChartThree from '../../components/ChartThree.tsx';
import ChartOne from '../../components/ChartOne.tsx';
import { socket } from '../../features/socketio.ts';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface STATE {
  temperature:number[];
  density :number;
  dissolved_oxygen:number[];
  turbidity: number;
  ph_level: number[];
  dt:Date[];
}

interface FishState {
  number:0;
  behavior:String
}
const Dashboard = () => {
  const notifyPh = () => toast("Ph level Warning");
  const notifyTemp = () => toast("Temperature Warning");
  const notifyWater= () => toast("Water Quality Warning");
  const notifyOxy = () => toast("Dissolved Oxygen level Warning");
  const [fishState,setFishState] = useState<FishState>({
    number:0,
    behavior:''
  })
  const [data,setData] = useState<STATE>({
    temperature:[],
    density :0,
    dissolved_oxygen:[],
    turbidity: 0,
    ph_level: [],
    dt:[]
  })
  useEffect(() => {
    console.log(data)
  
   
  }, [data])
  
  useEffect(() => {
    function onConnect() {
      console.log("socket Connected")
    }

    function onDisconnect() {
      console.log("socket disconeccted")
    }

    function onFishState(message:any) {
      setFishState(JSON.parse(message));
    }

    function onData(message:any) {
      let temperature = JSON.parse(message).temperature
      if (temperature>1000)
      {
        temperature= temperature/100
      }
      if(JSON.parse(message).ph_level > 9 || JSON.parse(message).ph_level < 6 ) notifyPh();
      if(temperature > 34 || temperature < 25) notifyTemp();
      if(JSON.parse(message).turbidity > 100) notifyWater();
      if(JSON.parse(message).dissolved_oxygen > 4 ) notifyOxy();

      setData((oldData:STATE)=>{
        let arrayTurbi =  [...oldData.ph_level , JSON.parse(message).ph_level | 0 ]
        let arrayTemp =  [...oldData.temperature , temperature]
        let arrayOxy =  [...oldData.dissolved_oxygen , JSON.parse(message).dissolved_oxygen]
        if(arrayTurbi.length>=10)
        {
          arrayTurbi.shift();
          arrayOxy.shift();
          arrayTemp.shift();
        }
        const newData = {
          ...oldData,
          turbidity:JSON.parse(message).turbidity,
          density:JSON.parse(message).density,
          temperature:arrayTemp,
          ph_level: arrayTurbi,
          dissolved_oxygen:arrayOxy
        }
        return newData
      })
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('fish_data', onData);
    socket.on('fish', onFishState);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('fish', onFishState);
    };
  }, []);
  return (
    <>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
    
        <ChartOne  name="PH levels" data={data.ph_level}/>
        <ChartThree name='Current Water quality' value={data.turbidity}/>

        <ChartOne  name="DO levels" data={data.dissolved_oxygen}/>
        <ChartThree name='Water Density' value={data.density}/>
        <div className="col-span-12 xl:col-span-6">
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="flex justify-around text-black dark:text-white text-3xl">
                <p>Count : {fishState.number}</p>
                <p>Behavior : {fishState.behavior}</p>
          </div>
          <img className="w-[100%] h-[100%]" src="http://localhost:5000/video" />

        </div>
        </div>
        <ChartOne  name="Temperature Levels" data={data.temperature}/>
        <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        />
      </div>
    </>
  );
};

export default Dashboard;
