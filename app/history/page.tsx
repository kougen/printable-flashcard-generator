import {redirect} from "next/navigation";
import {getSession} from "@/lib/auth";
import {prisma} from "@/lib/db";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }

  const user = session.user;
  const flashcardSets = await prisma.flashcardSet.findMany({
    where: {userId: user.id},
    include: {
      flashcards: true,
    }
  });

  return <div>
    <h1>Generation History</h1>
    <ul
      className="list-disc pl-4"
    >
      {flashcardSets.map(flashcardSet => (
        <li
          className="mb-2 space-x-2"
          key={flashcardSet.id}>
          <strong>{flashcardSet.name}</strong> - {flashcardSet.flashcards.length} flashcards
          <div>
            {flashcardSet.flashcards.map(flashcard => (
              <a
                key={flashcard.id}
                className="text-blue-600 underline mr-2"
                href={`/api/pdfs/${flashcard.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download {flashcard.type} PDF
              </a>
            ))}
          </div>
        </li>
      ))}
    </ul>
  </div>
}