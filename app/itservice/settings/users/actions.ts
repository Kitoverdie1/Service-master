"use server";

import { checkSession } from "@/app/_libs/checksession";
import prisma from "@/lib/prisma/prisma";
import z from "zod";

export const fetchData = async (params: {
  page: number;
  limit: number;
  search: string;
}) => {
  await checkSession();

  const offset = (params.page - 1) * params.limit;

  const users = await prisma.it_service_users.findMany({
    select: {
      id: true,
      username: true,
      first_name: true,
      last_name: true,
      department: true,
      role: true,
    },
    where: {
      username: { not: "" },
      refId: { not: "" },
      OR: [
        { username: { contains: params.search } },
        { first_name: { contains: params.search } },
        { last_name: { contains: params.search } },
        { role: { contains: params.search } },
      ],
    },
    skip: offset,
    take: params.limit,
  });

  const count = await prisma.it_service_users.count({
    where: {
      username: { not: "" },
      refId: { not: "" },
      OR: [
        { username: { contains: params.search } },
        { first_name: { contains: params.search } },
        { last_name: { contains: params.search } },
        { role: { contains: params.search } },
      ],
    },
  });

  const totalPages = Math.ceil(count / params.limit);
  const start = count == 0 ? 0 : offset + 1;
  const end = Math.min(params.page * params.limit, count);

  return {
    users: users,
    pagination: {
      totalPages: totalPages,
      start: start,
      end: end,
      total: count,
    },
  };
};

export const fetchDepartment = async () => {
  const department = await prisma.it_service_departments.findMany({
    select: {
      id: true,
      department: true,
    },
  });

  return department;
};

export const updateUser = async (params: {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  department: string;
  role: string;
}) => {
  await checkSession();

  const schema = z.object({
    id: z.preprocess(
      (v) => (typeof v === "string" ? Number(v) : v),
      z.number()
    ),
    username: z.string().min(1),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    department: z.string().min(1),
    role: z.enum(["Admin", "Staff", "User"]),
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
        id: validate.data.id,
      },
      data: {
        username: validate.data.username,
        first_name: validate.data.first_name,
        last_name: validate.data.last_name,
        department: validate.data.department,
        role: validate.data.role,
      },
    });

    return {
      status: true,
      messages: "ดำเนินการสำเร็จ บันทึกข้อมูลเรียบร้อย",
    };
  } catch (err) {
    return {
      status: false,
      messages: "ดำเนินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    };
  }
};
