import { IResponseData } from "@/interfaces/IResponceDate";
import prisma from "@/lib/prismacliente";
import { SaveDailyWordSchema } from "@/schemas/save-daily-word-schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

  try {
    const body = await request.json();

    const filter = SaveDailyWordSchema.parse(body);
    console.log("Dados recebidos:", filter);
    const wordsString = filter.words.join(",");

    const response = await prisma.dailyWord.upsert({
      where: {
        date_mode: {
          date: filter.date,
          mode: filter.mode,
        },
      },
      update: {
        words: wordsString,
        word: filter.words[0],
      },
      create: {
        date: filter.date,
        mode: filter.mode,
        words: wordsString,
        word: filter.words[0],
      },
    });

    return NextResponse.json({
      success: true,
      data: response,
      message: "Palavras salvas com sucesso.",
      error: ""
    } as IResponseData<typeof response>, { status: 200 });

  } catch (error) {
    console.error("Erro no servidor:", error);
    return NextResponse.json({
      success: false,
      data: null,
      message: "Erro ao processar a requisição.",
      error: error instanceof Error ? error.message : String(error),
    } as IResponseData<null>, { status: 500 });
  }
}