import SignInButton from "@/app/_components/SignInButton";
import SubmitForm from "@/app/_components/SubmitForm";

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <SignInButton/>
      <SubmitForm/>
    </main>
  );
}
