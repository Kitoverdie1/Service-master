"use server";

import { checkSession } from "@/app/_libs/checksession";
import prisma from "@/lib/prisma/prisma";
import z from "zod";

import Telegram from "@/app/_libs/telegram";
import { htmlToText } from "html-to-text";

export const fetchTypesUrgencys = async () => {
  await checkSession();

  const types = await prisma.it_service_order_types.findMany({
    select: {
      id: true,
      order_type: true,
    },
    where: {
      category_id: 2,
    },
  });

  const urgencys = await prisma.it_service_urgencys.findMany({
    select: {
      id: true,
      urgency: true,
    },
  });

  return {
    types: types,
    urgencys: urgencys,
  };
};

export const fetchAddWorkOrder = async (params: {
  order_type_id: string;
  urgency_id: string;
  description: string;
  contact: string;
}) => {
  const user = await checkSession();

  const schema = z.object({
    order_type_id: z.preprocess(
      (v) => (typeof v === "string" ? Number(v) : v),
      z.number().min(1),
    ),
    urgency_id: z.preprocess(
      (v) => (typeof v === "string" ? Number(v) : v),
      z.number().min(1),
    ),
    description: z.string().min(1),
    contact: z.string().min(1),
  });

  const validate = schema.safeParse({
    order_type_id: params.order_type_id,
    urgency_id: params.urgency_id,
    description: params.description,
    contact: params.contact,
  });

  if (!validate.success)
    return {
      errors: validate.error.flatten().fieldErrors,
    };

  try {
    const now = new Date();

    const lastId = await prisma.it_service_orders.findFirst({
      select: {
        order_id: true,
      },
      where: {
        order_id: {
          contains: "IT",
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    let id;
    if (lastId?.order_id) {
      id = Number(lastId.order_id.slice(-4)) + 1;
    } else {
      id = 1;
    }

    const year = String(new Date().getFullYear() + 543).slice(-2);
    const order_id = ("IT" + year + String(id).padStart(4, "0")).slice(-8);
    const userDep = await prisma.it_service_users.findFirst({
      select: {
        department: true,
      },
      where: {
        id: Number(user.id),
      },
    });

    await prisma.it_service_orders.create({
      data: {
        order_id: order_id,
        order_type_id: validate.data.order_type_id,
        department_id: Number(userDep?.department),
        urgency_id: validate.data.urgency_id,
        requester: user.id,
        description: validate.data.description,
        contact: validate.data.contact,
        status_id: 1,
        progressbar: 0,
        survey: false,
        created_at: new Date(now.getTime() + 7 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() + 7 * 60 * 60 * 1000),
      },
    });

    const descriptionText = htmlToText(validate.data.description, {
      wordwrap: false,
      selectors: [
        { selector: "a", options: { hideLinkHrefIfSameAsText: true } },
        {
          selector: "img",
          format: "skip",
        },
      ],
    });

    const msg =
      `🛠️ <b>แจ้งซ่อม/ขอรับบริการใหม่</b>\n` +
      `เลขที่แจ้งงาน: ${order_id}\n` +
      `ประเภทงาน: งานเทคโนโลยีสารสนเทศ\n` +
      `หน่วยงานที่แจ้ง: ${user.department}\n` +
      `โดย: ${user.first_name + " " + user.last_name || "-"}\n` +
      `วันที่: ${new Date().toLocaleDateString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })} - ${new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      })} \n` +
      `เบอร์ติดต่อกลับ: ${validate.data.contact || "-"}\n` +
      `รายละเอียด: ${descriptionText}\n` +
      `Link: ${process.env.NEXTAUTH_URL}/it-service/takeorder`;

    // await Telegram(msg, "it");
    return {
      status: true,
      messages: "ดำเนินการสำเร็จ บันทึกการแจ้งงานเรียบร้อย",
    };
  } catch (err) {
    return {
      status: false,
      messages: "ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง",
    };
  }
};
