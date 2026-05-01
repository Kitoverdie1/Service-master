'use server'

import prisma from "../lib/prisma/prisma"

export const fetchData = async () => {
    const data = await prisma.app_meta.findMany()

    console.log(data)
   return data
}