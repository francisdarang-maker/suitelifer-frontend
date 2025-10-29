import React from "react";
import UnderConstruction from "../../assets/images/under-construction.png";

const ComingSoon = () => {
  return (
    <div className="grid place-content-center h-full">
      <div className="flex gap-4 flex-col items-center">
        <div className="w-[90vw] -mt-50 sm:w-[70vw] md:w-[50vw] lg:w-[40vw]">
          <img
            className=""
            src={UnderConstruction}
            alt="Fullsuite Events Page Coming Soon"
          />
        </div>
        <p className="text-lg md:text-xl lg:text-3xl font-avenir-black mb-5 lg:mb-0">
          Coming Soon!
        </p>
        <p className="text-gray-600 text-[13px] md:text-[20px] lg:text-base">
          Still working on this one. Hang in there — it’s coming together
          nicely.
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
