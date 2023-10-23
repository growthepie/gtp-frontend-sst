"use client";
import { ReactNode, useEffect, useState } from "react";
import SidebarMenuGroup from "./SidebarMenuGroup";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  navigationItems,
  contributorsItem,
  apiDocsItem,
} from "@/lib/navigation";
import { useUIContext } from "@/contexts/UIContext";
import { Icon } from "@iconify/react";
import EthUsdSwitch from "./EthUsdSwitch";
import DarkModeSwitch from "./DarkModeSwitch";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import Backgrounds from "./Backgrounds";

type SidebarProps = {
  className?: string;
  children?: ReactNode;
  isMobile?: boolean;
};

export default function Sidebar({ isMobile = false }: SidebarProps) {
  const { isSidebarOpen, isMobileSidebarOpen, toggleMobileSidebar } =
    useUIContext();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // detect if we are changing routes on mobile
  useEffect(() => {
    if (isMobile && isMobileSidebarOpen) {
      toggleMobileSidebar();
    }
  }, [isMobile, pathname, searchParams]);

  const [scrollHeight, setScrollHeight] = useState(0);

  // detect scroll position on mobile and add bg and shadow to menu button
  useEffect(() => {
    if (isMobile) {
      const handleScroll = () => {
        setScrollHeight(window.scrollY);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isMobile]);

  if (isMobile)
    return (
      <>
        <button
          className={`z-[40] transition-colors duration-500 ${
            isMobileSidebarOpen ? "hidden" : "block"
          } ${
            // if scroll position is 20px or more from top, add bg and shadow
            scrollHeight > 0
              ? "fixed bg-white dark:bg-forest-1000 shadow-md rounded-full border-2 border-forest-900 dark:border-forest-200 p-2 right-[6px] top-[18px]"
              : `fixed right-[16px] top-[28px] border-transparent`
          }`}
          // style={{
          //   top: scrollHeight >= 15 ? "20px" : `calc(28px - ${scrollHeight}px)`,
          // }}
          onClick={toggleMobileSidebar}
        >
          <Icon icon="feather:menu" className="h-8 w-8" />
        </button>
        {/* {isMobileSidebarOpen && ( */}
        <div
          suppressHydrationWarning
          className={`transition-all z-50 ${
            isMobileSidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <Backgrounds isMobileMenu />
          <div className="fixed inset-0 p-[20px] z-[60] flex flex-col justify-items-start select-none overflow-hidden">
            <div className="flex justify-between space-x-[20px] items-end w-full">
              <Link href="/" className="h-[36px] w-[34px] relative">
                <Image
                  src="/logo_pie_only.png"
                  alt="Forest"
                  className="antialiased"
                  fill={true}
                  quality={100}
                />
              </Link>
              <div className="flex space-x-[20px] items-end">
                <div className="z-10 flex items-center space-x-[16px] mb-0.5 w-full px-2">
                  <Link
                    href="https://twitter.com/growthepie_eth"
                    target="_blank"
                    rel="noopener"
                  >
                    <Icon icon="gtp:twitter" className="h-[19px] w-[19px]" />
                  </Link>
                  <Link
                    href="https://share.lens.xyz/u/growthepie.lens"
                    target="_blank"
                    rel="noopener"
                    className=" dark:text-forest-200 text-forest-900"
                  >
                    <Icon icon="gtp:lens" className="h-[19px] w-[24px]" />
                  </Link>

                  <Link
                    href="https://warpcast.com/growthepie"
                    target="_blank"
                    rel="noopener"
                    className=" dark:text-forest-200 text-forest-900"
                  >
                    <Icon icon="gtp:farcaster" className="h-[19px] w-[19px]" />
                  </Link>
                  <Link
                    href="https://discord.gg/fxjJFe7QyN"
                    target="_blank"
                    rel="noopener"
                  >
                    <Icon icon="cib:discord" className="h-[19px] w-[19px]" />
                  </Link>
                  <Link
                    href="https://www.github.com/growthepie"
                    target="_blank"
                    rel="noopener"
                  >
                    <Icon icon="cib:github" className="h-[19px] w-[19px]" />
                  </Link>
                </div>
                <button
                  className="!-mb-1  !-mr-1"
                  onClick={toggleMobileSidebar}
                >
                  <Icon icon="feather:x" className="h-8 w-8" />
                </button>
              </div>
            </div>
            <div className="z-20 mt-[30px] h-[calc(100vh-100px)] w-full flex flex-col justify-between overflow-hidden relative">
              <div className="flex-1 w-full overflow-x-hidden relative overflow-y-scroll scrollbar-thin scrollbar-thumb-forest-1000/50 scrollbar-track-forest-500/5 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scroller">
                {navigationItems.map((item) => (
                  <SidebarMenuGroup
                    key={item.name + "_item"}
                    item={item}
                    sidebarOpen={isMobileSidebarOpen}
                  />
                ))}
              </div>

              <div className="flex flex-col justify-end pt-3 pb-6 relative mb-[17px]">
                <SidebarMenuGroup
                  key={apiDocsItem.name + "_item"}
                  item={apiDocsItem}
                  sidebarOpen={isMobileSidebarOpen}
                />
                <SidebarMenuGroup
                  key={contributorsItem.name + "_item"}
                  item={contributorsItem}
                  sidebarOpen={isMobileSidebarOpen}
                />
                <div className="text-[0.7rem] flex justify-evenly w-full gap-x-12 text-inherit leading-[1] px-2  mb-[17px]">
                  <Link href="/privacy-policy">Privacy Policy</Link>
                  <Link href="/imprint">Imprint</Link>
                  <Link
                    rel="noopener"
                    target="_blank"
                    href="https://discord.com/channels/1070991734139531294/1095735245678067753"
                  >
                    Feedback
                  </Link>
                </div>
                <div className="items-end justify-center z-10 flex space-x-[15px] mt-[2px] mb-[17px]">
                  <DarkModeSwitch isMobile />
                  <EthUsdSwitch isMobile />
                </div>
              </div>
              <div className="mt-24 w-full text-center py-6 absolute bottom-0">
                <div className="text-[0.7rem] text-inherit leading-[2] z-20">
                  © 2023 growthepie 🥧
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* )} */}
      </>
    );

  return (
    <motion.div
      className={`flex-1 flex flex-col justify-items-start select-none overflow-y-hidden overflow-x-hidden  ${
        isSidebarOpen ? "w-[18rem]" : ""
      }`}
      animate={{
        width: isSidebarOpen ? "18rem" : "5.5rem",
      }}
      transition={{
        duration: 0.3,
      }}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-forest-800/30 scrollbar-track-forest-800/10">
        {navigationItems.map((item) => (
          <SidebarMenuGroup
            key={item.name + "_item"}
            item={item}
            sidebarOpen={isSidebarOpen}
          />
        ))}
      </div>
      <div className="flex flex-col justify-end py-6 relative">
        <SidebarMenuGroup
          key={contributorsItem.name + "_item"}
          item={contributorsItem}
          sidebarOpen={isSidebarOpen}
        />
        {isSidebarOpen ? (
          <div className="text-[0.7rem] flex justify-between w-48 text-inherit dark:text-forest-400 leading-[1] ml-8">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/imprint">Imprint</Link>
            <Link
              rel="noopener"
              target="_blank"
              href="https://discord.com/channels/1070991734139531294/1095735245678067753"
            >
              Feedback
            </Link>
          </div>
        ) : (
          <div className="text-[0.7rem] flex flex-col justify-between w-6 text-inherit dark:text-forest-400 leading-[2] ml-8 items-center">
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/imprint">Imprint</Link>
            <Link
              rel="noopener"
              target="_blank"
              href="https://discord.com/channels/1070991734139531294/1095735245678067753"
            >
              Feedback
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
