"use server";

import { checkSession } from "@/app/_libs/checksession";
import prisma from "@/lib/prisma/prisma";
import z from "zod";

export const fetchData = async (params: {
  page: number;
  limit: number;
  search: string;
  category: string[];
}) => {
  await checkSession();

  const offset = (params.page - 1) * params.limit;

  const types = await prisma.it_service_order_types.findMany({
    select: {
      id: true,
      order_type: true,
      category_id: true,
    },
    where: {
      order_type: {
        contains: params.search,
      },
      ...(params.category.length && {
        category_id: {
          in: params.category.map((x) => Number(x)),
        },
      }),
    },
    skip: offset,
    take: params.limit,
  });

  const count = await prisma.it_service_order_types.count({
    where: {
      order_type: {
        contains: params.search,
      },
    },
  });

  const totalPages = Math.ceil(count / params.limit);
  const start = count == 0 ? 0 : offset + 1;
  const end = Math.min(params.page * params.limit, count);

  return {
    types: types,
    pagination: {
      totalPages: totalPages,
      start: start,
      end: end,
      total: count,
    },
  };
};

export const createTypes = async (params: {
  order_type: string;
  category_id: string;
}) => {
  await checkSession();

  const schema = z.object({
    order_type: z.string().min(1),
    category_id: z.preprocess(
      (v) => (typeof v === "string" ? Number(v) : v),
      z.number()
    ),
  });

  const validate = schema.safeParse(params);
  if (!validate.success)
    return {
      errors: validate.error.flatten().fieldErrors,
    };

  try {
    const now = new Date();

    await prisma.it_service_order_types.create({
      data: {
        order_type: validate.data.order_type,
        category_id: validate.data.category_id,
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

export const updateTypes = async (params: {
  id: string;
  order_type: string;
  category_id: string;
}) => {
  await checkSession();

  const schema = z.object({
    id: z.preprocess(
      (v) => (typeof v === "string" ? Number(v) : v),
      z.number()
    ),
    order_type: z.string().min(1),
    category_id: z.preprocess(
      (v) => (typeof v === "string" ? Number(v) : v),
      z.number()
    ),
  });

  const validate = schema.safeParse(params);
  if (!validate.success)
    return {
      errors: validate.error.flatten().fieldErrors,
    };

  try {
    const now = new Date();

    await prisma.it_service_order_types.update({
      where: {
        id: validate.data.id,
      },
      data: {
        order_type: validate.data.order_type,
        category_id: validate.data.category_id,
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
