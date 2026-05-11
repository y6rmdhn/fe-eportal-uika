import admin from "@/services/api/admin";
import { useQuery } from "@tanstack/react-query";

interface PropsType {
  currentSearch: string;
  currentLimit: number;
  currentPage: number;
}

const useUserManagement = ({
  currentLimit,
  currentPage,
  currentSearch,
}: PropsType) => {
  const getUserManagement = async () => {
    const response = await admin.getAllUserManagement({
      currentLimit,
      currentPage,
      currentSearch,
    });

    return response.data;
  };

  const {
    data: dataUserManagement,
    isLoading: isLoadingUserManagement,
    refetch,
  } = useQuery({
    queryKey: ["user-management", currentPage, currentLimit, currentSearch],
    queryFn: getUserManagement,
  });

  return {
    dataUserManagement,
    isLoadingUserManagement,
    refetch,
  };
};

export default useUserManagement;
