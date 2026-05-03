import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const plan = searchParams.get("plan")

  if (!plan) {
    return NextResponse.json(
      { error: "El parámetro 'plan' es requerido" },
      { status: 400 }
    )
  }

  return NextResponse.json({
    message: `Conectando con Stripe para el plan: ${plan}`,
  })
}
