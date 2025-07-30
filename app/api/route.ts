import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  revalidatePath("/", "page");
  revalidatePath("/blogs", "page");
  revalidatePath("/catering", "page");
  revalidatePath("/gallery", "page");
  revalidatePath("/our-story", "page");
  revalidatePath("/privacy-policy", "page");
  return new Response("OK", { status: 200 });
}
