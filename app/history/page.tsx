import {redirect} from "next/navigation";
import {getSession} from "@/lib/auth";
import {prisma} from "@/lib/db";
import Image from "next/image";
import {Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle} from "@/components/ui/item";

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

  return <div className="flex w-full max-w-md flex-col gap-6">
    <ItemGroup className="gap-4">
      {flashcardSets.map((flashcardSet) => (
        <Item key={flashcardSet.id} variant="outline" asChild role="listitem">
          <a href="#">
            <ItemMedia variant="image">
              <Image
                src={`https://avatar.vercel.sh/${flashcardSet.title}`}
                alt={flashcardSet.title}
                width={32}
                height={32}
                className="object-cover grayscale"
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-1">
                {flashcardSet.title} -{" "}
                <span className="text-muted-foreground">{flashcardSet.album}</span>
              </ItemTitle>
              <ItemDescription>{flashcardSet.artist}</ItemDescription>
            </ItemContent>
            <ItemContent className="flex-none text-center">
              <ItemDescription>{flashcardSet.duration}</ItemDescription>
            </ItemContent>
          </a>
        </Item>
      ))}
    </ItemGroup>
  </div>
}