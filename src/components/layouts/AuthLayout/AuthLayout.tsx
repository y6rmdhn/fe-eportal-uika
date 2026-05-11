import PageHead from "@/common/PageHead";
import type { ReactNode } from "react";

interface PropsType {
  title?: string;
  children: ReactNode;
}

export default function AuthLayout({ title, children }: PropsType) {
  return (
    <>
      <PageHead title={title} />
      <section>{children}</section>
    </>
  );
}
