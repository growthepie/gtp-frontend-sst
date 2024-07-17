import Container from "@/components/layout/Container";
import Heading from "@/components/layout/Heading";
import Image from "next/image";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // <Container className="flex flex-col w-full pt-[65px] md:pt-[45px]" isPageRoot>

  // </Container>
  return (
    <>
      <Container className="flex items-center mb-[5px] pt-[65px] md:pt-[45px]">
        <Image
          src="/GTP-Metrics-Economics.svg"
          alt="GTP Chain"
          className="object-contain w-[32px] h-[32px] mr-[8px]"
          height={36}
          width={36}
        />
        <Heading className="text-[36px] leading-snug " as="h1">
          {"Economics"}
        </Heading>
      </Container>
      <div>{children}</div>
    </>
  );
}
