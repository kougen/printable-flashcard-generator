import FlashcardForm from "@/components/flashcard-form/FlashcardForm";
import ThemeChanger from "@/components/theme-changer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <FlashcardForm/>
      <ThemeChanger />
    </main>
  );
}
