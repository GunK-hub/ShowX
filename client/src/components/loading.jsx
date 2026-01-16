import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Loading = () => {

   const {nextUrl} = useParams()
   const navigate = useNavigate()

   useEffect(()=>{
    if(nextUrl){
      setTimeout(() => {
        navigate('/' + nextUrl)
      }, 8000);
    }
   }, [])
  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="h-14 w-14 rounded-full border-4 border-white/20 border-t-purple-600 animate-spin"></div>
    </div>
  );
};

export default Loading;
