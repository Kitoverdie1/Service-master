"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const checkSession = async () => {
  const session = await auth();

  if (!session?.user || !session?.user.id) {
    return redirect("/");
  }

  return session?.user;
};
