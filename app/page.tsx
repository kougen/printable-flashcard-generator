import SignInButton from "@/app/_components/SignInButton";
import SubmitForm from "@/app/_components/SubmitForm";

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col">
      <SignInButton/>
      <SubmitForm/>
    </main>
  );
}
