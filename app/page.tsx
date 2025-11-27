import FlashcardForm from "@/components/flashcard-form/FlashcardForm";
import ThemeChanger from "@/components/theme-changer";
import Header from "@/components/Header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header/>
      <FlashcardForm/>
      <ThemeChanger/>
    </main>
  );
}
