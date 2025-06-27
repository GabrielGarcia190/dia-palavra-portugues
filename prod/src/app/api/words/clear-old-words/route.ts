import { IResponseData } from "@/interfaces/IResponceDate";
import prisma from "@/lib/prismacliente";
import { NextResponse } from "next/server";

export async function DELETE() {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);


        const result = await prisma.dailyWord.deleteMany({
            where: {
                date: {
                    not: today,
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                deletedCount: result.count,
                today: today.toISOString()
            },
            message: `Removidas ${result.count} palavras antigas (não de ${today.toISOString().split('T')[0]})`
        } as IResponseData<{ deletedCount: number; today: string }>);

    } catch (error) {
        return NextResponse.json({
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            message: 'Falha ao limpar palavras antigas'
        } as IResponseData<null>, { status: 500 });
    }
}