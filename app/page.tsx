import React from "react";
import FlashcardForm from "@/components/flashcard-form/FlashcardForm";
import {getSession} from "@/lib/auth";
import {prisma} from "@/lib/db";

export default async function Home() {
  const session = await getSession();

  const getFlashcardSets = async () => {
    if (!session?.user) {
      return undefined;
    }

    const sets = await prisma.flashcardSet.findMany({
      where: {userId: session.user.id},
      orderBy: {
        createdAt: "desc",
      },
    });

    return sets.map(set => ({id: set.id, name: set.name, createdAt: set.createdAt}))
  }

  return (
    <FlashcardForm flashcardSets={await getFlashcardSets()}/>
  );
}
