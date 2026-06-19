import admin from "@/services/api/admin";
import { useQuery } from "@tanstack/react-query";

const useAppModule = () => {
  const { data: dataAppModule, isLoading: isLoadingAppModule } = useQuery({
    queryKey: ["app-module"],
    queryFn: async () => {
      const response = await admin.getAppModules();
      return response.data;
    },
  });

  return { dataAppModule, isLoadingAppModule };
};

export default useAppModule;
