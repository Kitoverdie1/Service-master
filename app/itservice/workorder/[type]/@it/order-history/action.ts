"use server";

import { checkSession } from "@/app/_libs/checksession";
import prisma from "@/lib/prisma/prisma";

export const fetchDataHistory = async ({
  page,
  filter,
}: {
  page: number;
  filter: string;
}) => {
  const user = await checkSession();

  const offset = (page - 1) * 10;

  const orders = await prisma.it_service_orders.findMany({
    select: {
      id: true,
      it_service_order_types: {
        select: {
          id: true,
          order_type: true,
        },
      },
      it_service_urgency: {
        select: {
          id: true,
          urgency: true,
        },
      },
      it_service_status: {
        select: {
          id: true,
          status: true,
        },
      },
      created_at: true,
    },
    where: {
      requester: user.id,
      ...{ filter && { }}
    },
    orderBy: {
      id: "desc",
    },
    skip: offset,
    take: 10,
  });

  const count = await prisma.it_service_orders.count({
    where: {
      requester: user.id,
    },
  });

  const totalPages = Math.ceil(count / 10);
  const start = count == 0 ? 0 : offset + 1;
  const end = Math.min(page * 10, count);

  return {
    orders: orders,
    pagination: {
      totalPages: totalPages,
      start: start,
      end: end,
      total: count,
    },
  };
};

export const fetchShowDetail = async ({ id }: { id: number }) => {
  await checkSession();

  const order = await prisma.it_service_orders.findUnique({
    select: {
      id: true,
      order_id: true,
      it_service_order_types: {
        select: {
          order_type: true,
        },
      },
      it_service_departments: {
        select: {
          department: true,
        },
      },
      it_service_urgency: {
        select: {
          urgency: true,
        },
      },
      requester: true,
      it_service_status: {
        select: {
          id: true,
          status: true,
        },
      },
      description: true,
      operator: true,
      comment: true,
      contact: true,
      created_at: true,
      updated_at: true,
    },
    where: {
      id: id,
    },
  });

  const requester = await prisma.it_service_users.findUnique({
    select: {
      first_name: true,
      last_name: true,
    },
    where: {
      id: Number(order?.requester),
    },
  });

  const operator = await prisma.it_service_users.findUnique({
    select: {
      id: true,
      first_name: true,
      last_name: true,
    },
    where: {
      id: Number(order?.operator),
    },
  });

  return {
    ...order,
    requester: requester?.first_name
      ? requester?.first_name + " " + requester?.last_name
      : null,
    operator: operator?.first_name
      ? operator?.first_name + " " + operator?.last_name
      : null,
  };
};
