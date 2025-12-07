import {redirect} from "next/navigation";
import {getSession} from "@/lib/auth";
import {prisma} from "@/lib/db";
import Image from "next/image";
import {Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle} from "@/components/ui/item";
import {Flashcard} from "@/prisma/generated/prisma/client";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";

const getFlashcardLink = (flashcard: Flashcard) => {
  const title = flashcard.type === "IMAGES" ? "Images" : "Words";

  if (flashcard.type === "IMAGES") {
    return (
      <Link key={flashcard.id} href={`/api/pdfs/${flashcard.id}`} className={buttonVariants({variant: "link"})}>
        {title}
      </Link>
    )
  }

  return (
    <HoverCard key={flashcard.id} openDelay={100}>
      <HoverCardTrigger asChild>
        <Link href={`/api/pdfs/${flashcard.id}`} className={buttonVariants({variant: "link"})}>
          {title}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <Image src={`/api/pdfs/${flashcard.id}/thumbnail`} width={256} height={256} alt="PDF preview"/>
      </HoverCardContent>
    </HoverCard>
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

  const getImageFlashcard = (flashcardSet: {
    flashcards: Flashcard[];
  }) => {
    return flashcardSet.flashcards.find(card => card.type === "IMAGES");
  };

  return <div className="flex w-full max-w-md flex-col gap-6 p-4">
    <ItemGroup className="gap-4">
      {flashcardSets.map((flashcardSet) => {
        const imageFlashcard = getImageFlashcard(flashcardSet);

        return (
          <Item variant="outline" key={flashcardSet.id} role="listitem">
            {imageFlashcard ? (
              <HoverCard openDelay={100}>
                <HoverCardTrigger asChild>
                  <ItemMedia variant="image" className="rounded-none">
                    <Image
                      src={`/api/pdfs/${imageFlashcard.id}/thumbnail`}
                      width={32}
                      height={32}
                      alt="PDF icon"
                    />
                  </ItemMedia>
                </HoverCardTrigger>
                <HoverCardContent>
                  <Image
                    src={`/api/pdfs/${imageFlashcard.id}/thumbnail`}
                    width={256}
                    height={256}
                    alt="PDF preview"
                  />
                </HoverCardContent>
              </HoverCard>
            ) : (
              <div className="w-8 h-8 border rounded-sm flex items-center justify-center text-xs">
                N/A
              </div>
            )}
            <ItemContent>
              <ItemTitle className="line-clamp-1">
                {flashcardSet.name} -{" "}
                <span className="text-muted-foreground">
                  {flashcardSet.createdAt.toISOString()}
                </span>
              </ItemTitle>
              <ItemDescription>
                {flashcardSet.flashcards.map((flashcard) =>
                  getFlashcardLink(flashcard),
                )}
              </ItemDescription>
            </ItemContent>
          </Item>
        );
      })}
    </ItemGroup>
  </div>
}