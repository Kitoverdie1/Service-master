"use server";

import { checkSession } from "@/app/_libs/checksession";
import prisma from "@/lib/prisma/prisma";
import z from "zod";

export const fetchData = async (params: {
  page: number;
  limit: number;
  search: string;
}) => {
  const offset = (params.page - 1) * params.limit;

  const department = await prisma.it_service_departments.findMany({
    select: {
      id: true,
      department: true,
    },
    where: {
      department: {
        contains: params.search,
      },
    },
    skip: offset,
    take: params.limit,
  });

  const count = await prisma.it_service_departments.count({
    where: {
      department: {
        contains: params.search,
      },
    },
  });

  const totalPages = Math.ceil(count / params.limit);
  const start = count == 0 ? 0 : offset + 1;
  const end = Math.min(params.page * params.limit, count);

  return {
    department: department,
    pagination: {
      totalPages: totalPages,
      start: start,
      end: end,
      total: count,
    },
  };
};

export const updateDepartment = async (params: {
  id: string;
  department: string;
}) => {
  await checkSession();

  const schema = z.object({
    id: z.preprocess(
      (v) => (typeof v === "string" ? Number(v) : v),
      z.number().min(1)
    ),
    department: z.string().min(1),
  });

  const validate = schema.safeParse(params);

  if (!validate.success)
    return {
      errors: validate.error.flatten().fieldErrors,
    };

  try {
    const now = new Date();

    await prisma.it_service_departments.update({
      where: {
        id: validate.data.id,
      },
      data: {
        department: validate.data.department,
        updated_at: new Date(now.getTime() + 7 * 60 * 60 * 1000),
      },
    });

    return {
      status: true,
      messages: "ดำเนินการสำเร็จ บันทึกข้อมูลเรียบร้อย",
    };
  } catch (err) {
    return {
      status: false,
      messages: "ดำเนินการไม่สำเร็จ กรุณาลองใหม่อีกคครั้ง",
    };
  }
};

export const createDepartment = async (params: { department: string }) => {
  await checkSession();

  const schema = z.object({
    department: z.string().min(1),
  });

  const validate = schema.safeParse(params);

  if (!validate.success)
    return {
      errors: validate.error.flatten().fieldErrors,
    };

  try {
    const now = new Date();

    await prisma.it_service_departments.create({
      data: {
        department: validate.data.department,
        created_at: new Date(now.getTime() + 7 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() + 7 * 60 * 60 * 1000),
      },
    });

    return {
      status: true,
      messages: "ดำเนินการสำเร็จ บันทึกข้อมูลเรียบร้อย",
    };
  } catch (err) {
    return {
      status: false,
      messages: "ดำเนินการไม่สำเร็จ กรุณาลองใหม่อีกคครั้ง",
    };
  }
};
