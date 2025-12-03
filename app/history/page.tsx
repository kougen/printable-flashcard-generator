import {redirect} from "next/navigation";
import {getSession} from "@/lib/auth";
import {prisma} from "@/lib/db";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }

  const user = session.user;
  const pdfs = await prisma.generatedPdf.findMany({
    where: {userId: user.id, type: "WORDS"},
    include: {relatedPdfs: true}
  });

  return <div>
    <h1>Generation History</h1>
    <ul
      className="list-disc pl-4"
    >
      {pdfs.map(pdf => (
        <li
          className="mb-2 space-x-2"
          key={pdf.id}>
          <a
            className="text-primary hover:underline"
            href={`/api/pdfs/${pdf.id}`}>Words PDF ({pdf.id})</a>
          {pdf.relatedPdfs?.map(relatedPdf => (
            <a
              className="text-primary hover:underline"
              key={relatedPdf.id} href={`/api/pdfs/${relatedPdf.id}`}>
              Image PDF ({relatedPdf.id})
            </a>
          ))}
        </li>
      ))}
    </ul>
  </div>
}