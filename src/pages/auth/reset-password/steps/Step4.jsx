import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TwoCirclesLoader from "../../../../assets/loaders/TwoCirclesLoader";

const Step4 = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="flex flex-col gap-10 text-center">
      <div className="text-center">
        <p className="text-xl  text-white font-avenir-black">
          Password Reset Successful
        </p>
        <p className="text-white/60 text-sm">Redirecting you to login...</p>
      </div>
      <div className="flex justify-center">
        <div className="mx-auto w-fit">
          <TwoCirclesLoader
            bg={"transparent"}
            color1={"#bfd1a0"}
            color2={"white"}
            width={"300"}
            height={"50"}
          />
        </div>
      </div>
    </div>
  );
};

export default Step4;
