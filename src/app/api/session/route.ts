import { getServerSession } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession();
  return new Response(JSON.stringify(session), {
    headers: { "Content-Type": "application/json" },
  });
}
