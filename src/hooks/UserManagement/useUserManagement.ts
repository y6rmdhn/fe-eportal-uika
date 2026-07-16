import admin from "@/services/api/admin";
import { useQuery } from "@tanstack/react-query";

interface PropsType {
  currentSearch: string;
  currentLimit: number;
  currentPage: number;
  currentFilter?: string; // filter by role
  currentUnitFilter?: string | number; // filter by unit
}

const useUserManagement = ({
  currentLimit,
  currentPage,
  currentSearch,
  currentFilter,
  currentUnitFilter,
}: PropsType) => {
  const getUserManagement = async () => {
    const response = await admin.getAllUserManagement({
      currentLimit,
      currentPage,
      currentSearch,
      currentFilter,
      currentUnitFilter,
    });
    return response.data;
  };

  const {
    data: dataUserManagement,
    isLoading: isLoadingUserManagement,
    refetch,
  } = useQuery({
    queryKey: [
      "user-management",
      currentPage,
      currentLimit,
      currentSearch,
      currentFilter,
      currentUnitFilter,
    ],
    queryFn: getUserManagement,
  });

  return { dataUserManagement, isLoadingUserManagement, refetch };
};

export default useUserManagement;
