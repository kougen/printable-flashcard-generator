import {redirect} from "next/navigation";
import {getSession} from "@/lib/auth";
import {prisma} from "@/lib/db";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }

  const user = session.user;
  const pdfs = await prisma.generatedPdf.findMany({where: {userId: user.id}});

  return <div>
    <h1>Generation History</h1>
    <ul
      className="list-disc pl-4"
    >
      {pdfs.map(pdf => (
        <li
          className="text-sm cursor-pointer hover:underline"
          key={pdf.id}>{pdf.path}</li>
      ))}
    </ul>
  </div>
}