import SocialLoginButton from "@/app/components/SocialLoginButton";

type Props = {};

export default function page({}: Props) {
  return (
    <div className="flex-1 w-full h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-semibold">Sign in to ChatMedi</h1>
      <div className="my-12">
        <SocialLoginButton platform="google" />
      </div>
    </div>
  );
}
