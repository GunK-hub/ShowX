import React from "react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="h-14 w-14 rounded-full border-4 border-white/20 border-t-purple-600 animate-spin"></div>
    </div>
  );
};

export default Loading;
