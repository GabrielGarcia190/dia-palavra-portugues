import { IResponseData } from "@/interfaces/IResponceDate";
import prisma from "@/lib/prismacliente";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const mode = searchParams.get('mode');

        const date = GetValidDate(dateParam, mode);

        date.setUTCHours(0, 0, 0, 0);

        const record = await prisma.dailyWord.findUnique({
            where: {
                date_mode: {
                    date: date,
                    mode: mode as string,
                },
            },
        });

        if (!record) {
            return NextResponse.json({
                success: true,
                data: "",
                message: "Nenhuma palavra encontrada para a data especificada",
            } as IResponseData<string>, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            data: record,
            message: "Palavra do dia encontrada com sucesso.",
        } as IResponseData<typeof record>, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            data: null,
            message: "Erro ao buscar palavra do dia.",
            error: error instanceof Error ? error.message : String(error),
        } as IResponseData<null>, { status: 500 });
    }


}
function GetValidDate(dateParam: string | null, mode: string | null) {

    if (!isValidParams(dateParam, mode))
        throw new Error("Parâmetros 'date' e 'mode' são obrigatórios.");

    const date = new Date(dateParam as string);
    if (isNaN(date.getTime())) {
        throw new Error("Formato de data inválido. Use o formato ISO (YYYY-MM-DD).");
    }

    return date;
}

function isValidParams(date: string | null, mode: string | null): boolean {
    return date !== null && mode !== null;
}