import user from "@/services/api/user";
import { useQuery } from "@tanstack/react-query";

const useProfile = () => {
  const { data: dataProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await user.getProfile();
      return response.data.data;
    },
  });

  return { dataProfile, isLoadingProfile };
};

export default useProfile;
