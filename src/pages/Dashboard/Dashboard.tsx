import ChartThree from '../../components/ChartThree.tsx';
import ChartOne from '../../components/ChartOne.tsx';
import Camera from '../../../public/camera.jpg'
import { socket } from '../../features/socketio.ts';
import { useEffect, useState } from 'react';


interface STATE {
  temperature:number[];
  density :number;
  dissolved_oxygen:number[];
  turbidity: number;
  ph_level: number[];
  dt:Date[];
}

const Dashboard = () => {
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

    function onData(message:any) {
      setData((oldData:STATE)=>{
        let arrayTurbi =  [...oldData.ph_level , JSON.parse(message).ph_level]
        let arrayTemp =  [...oldData.temperature , JSON.parse(message).temperature]
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

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('fish_data', onData);
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
          <img src={Camera} alt="Camera" />
        </div>
        </div>
        <ChartOne  name="Temperature Levels" data={data.temperature}/>
      </div>
    </>
  );
};

export default Dashboard;
