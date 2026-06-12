import admin from "@/services/api/admin";
import { useQuery } from "@tanstack/react-query";

interface PropsType {
  currentLimit: number;
  currentPage: number;
  currentFilter?: string;
  currentDevice?: string;
}

const useLoginLog = ({
  currentLimit,
  currentPage,
  currentFilter,
  currentDevice,
}: PropsType) => {
  const { data: dataLoginLog, isLoading: isLoadingLoginLog } = useQuery({
    queryKey: [
      "login-log",
      currentPage,
      currentLimit,
      currentFilter,
      currentDevice,
    ],
    queryFn: async () => {
      const response = await admin.getLoginLogs({
        currentLimit,
        currentPage,
        status: currentFilter || undefined,
        device_type: currentDevice || undefined,
      });
      return response.data;
    },
  });

  const { data: dataStats } = useQuery({
    queryKey: ["login-log-stats"],
    queryFn: async () => {
      const response = await admin.getLoginStats();
      return response.data.data;
    },
  });

  return { dataLoginLog, isLoadingLoginLog, dataStats };
};

export default useLoginLog;
