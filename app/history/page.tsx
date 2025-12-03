import {redirect} from "next/navigation";
import {getSession} from "@/lib/auth";
import {prisma} from "@/lib/db";
import Image from "next/image";
import {Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle} from "@/components/ui/item";
import {Flashcard} from "@/prisma/generated/prisma/client";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";

const getFlashcardLink = (flashcard: Flashcard) => {
  const title = flashcard.type === "IMAGES" ? "Images" : "Words";

  return (
    <Link key={flashcard.id} href={`/api/pdfs/${flashcard.id}`} className={buttonVariants({variant: "link"})}>
      {title}
    </Link>
  )
}

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

  const getImageFlashcard = () => {
    return flashcardSets.flatMap(set => set.flashcards).find(card => card.type === "IMAGES");
  }

  return <div className="flex w-full max-w-md flex-col gap-6 p-4">
    <ItemGroup className="gap-4">
      {flashcardSets.map((flashcardSet) => (
        <Item variant="outline" key={flashcardSet.id} role="listitem">
          <ItemMedia variant="image">
            <Image src={`/api/pdfs/${getImageFlashcard()?.id}/thumbnail`} width={32} height={32} alt="PDF icon"
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="line-clamp-1">
              {flashcardSet.name} -{" "}
              <span className="text-muted-foreground">{flashcardSet.createdAt.toISOString()}</span>
            </ItemTitle>
            <ItemDescription>
              {flashcardSet.flashcards.map((flashcard) => getFlashcardLink(flashcard))}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  </div>
}