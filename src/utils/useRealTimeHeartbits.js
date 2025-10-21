import { useQuery } from "@tanstack/react-query";
import { pointsSystemApi } from "../api/pointsSystemApi";
import { useStore } from "../store/authStore";

const useRealTimeHeartbits = () => {
  const user = useStore((state) => state.user);

  return useQuery({
    queryKey: ["points"],
    queryFn: pointsSystemApi.getPoints,
    staleTime: 10 * 1000,
    enabled: !!user?.id,
  });
};

export default useRealTimeHeartbits;
