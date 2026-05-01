"use server";

import prisma from "@/lib/prisma/prisma";
import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { checkSession } from "@/app/_libs/checksession";
import { z } from "zod";
type Employee = {
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
};

export const loginM365 = async () => {
  await signIn("microsoft-entra-id", { redirectTo: "/itservice" });
};

export const logOut = async () => {
  await signOut({ redirect: false }).then(() => {
    const SignOutUrl = `https://login.microsoftonline.com/${
      process.env.AUTH_MICROSOFT_ENTRA_ID_ID
    }/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(
      process.env.NEXTAUTH_URL + "/itservice",
    )}`;

    return redirect(SignOutUrl);
  });
};

export const getDataUser = async (params: {
  username: string;
  refId: string;
}) => {
  const data = await prisma.it_service_users.findFirst({
    where: {
      username: params.username,
    },
    select: {
      id: true,
      username: true,
      first_name: true,
      last_name: true,
      department: true,
      role: true,
    },
  });

  if (!data?.id) {
    const now = new Date();

    const user = {
      refId: params.refId,
      username: params.username,
      role: "User",
      department: null,
      first_name: null,
      last_name: null,
      cid: null,
      faculty: null,
      profile_img: null,
      created_at: new Date(now.getTime() + 7 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() + 7 * 60 * 60 * 1000),
    };

    const add = await prisma.it_service_users.create({
      data: user,
    });

    return {
      data: {
        id: add.id,
        first_name: null,
        last_name: null,
        department: null,
        role: add.role,
      },
    };
  }

  const department = await prisma.it_service_departments.findFirst({
    where: {
      id: Number(data?.department),
    },
    select: {
      department: true,
    },
  });

  return {
    id: data?.id,
    username: data?.username,
    first_name: data?.first_name,
    last_name: data?.last_name,
    department: department?.department,
    role: data?.role,
  };
};

export const fetchProfile = async (id: string) => {
  await checkSession();

  const employee: Employee | null = await prisma.it_service_users.findFirst({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      username: true,
      first_name: true,
      last_name: true,
      department: true,
    },
  });

  const department = await prisma.it_service_departments.findMany({
    select: {
      id: true,
      department: true,
    },
  });

  return {
    employee: employee,
    department: department,
  };
};

export const updateProfile = async (params: {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  department: string;
}) => {
  const schema = z.object({
    id: z.number(),
    username: z.string(),
    first_name: z.string().min(1, "กรุณากรอกชื่อ"),
    last_name: z.string().min(1, "กรุณากรอกนามสกุล"),
    department: z.string().min(1, "กรุณาทำการเลือกหน่วยงาน"),
  });

  const validate = schema.safeParse(params);

  if (!validate.success)
    return {
      errors: validate.error.flatten().fieldErrors,
    };

  try {
    const now = new Date();

    await prisma.it_service_users.update({
      where: {
        id: Number(validate.data.id),
      },
      data: {
        first_name: validate.data.first_name,
        last_name: validate.data.last_name,
        department: validate.data.department,
        updated_at: new Date(now.getTime() + 7 * 60 * 60 * 1000),
      },
    });

    return {
      status: true,
      messages: "ดำเนินการสำเร็จ แก้ไขข้อมูลเรียบร้อย",
    };
  } catch (err) {
    return {
      status: false,
      messages: "ดำเนินการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    };
  }
};
