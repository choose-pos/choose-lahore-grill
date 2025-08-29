import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  revalidatePath("/", "page");
  revalidatePath("/catering", "page");
  revalidatePath("/our-story", "page");
  revalidatePath("/event", "page");
  revalidatePath("/parties", "page");
  revalidatePath("/contact", "page");
  revalidatePath("/promotion", "layout");
  return new Response("OK", { status: 200 });
}
