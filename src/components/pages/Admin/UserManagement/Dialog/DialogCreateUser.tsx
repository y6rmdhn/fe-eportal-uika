import useCreateUser from "@/hooks/UserManagement/useCreateUser";
import FormMenu from "./Form/FormUser";

export default function DialogCreateUser() {
  const { form, isPendingCreateUser, handleCreateUser } = useCreateUser();

  return (
    <FormMenu
      form={form}
      // @ts-ignore
      onSubmit={handleCreateUser}
      isLoading={isPendingCreateUser}
      type="Create"
    />
  );
}
