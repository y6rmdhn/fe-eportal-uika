import admin from "@/services/api/admin";
import { useQuery } from "@tanstack/react-query";

const useSuspiciousIps = () => {
  const { data: dataSuspiciousIps, isLoading: isLoadingSuspiciousIps } =
    useQuery({
      queryKey: ["suspicious-ips"],
      queryFn: async () => {
        const response = await admin.getSuspiciousIps();
        return response.data;
      },
      refetchInterval: 30000, // refresh tiap 30 detik
    });

  return { dataSuspiciousIps, isLoadingSuspiciousIps };
};

export default useSuspiciousIps;
