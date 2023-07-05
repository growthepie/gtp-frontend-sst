"use client";
import Image from "next/image";
import { useMemo, useState, useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { Chains } from "@/types/api/ChainOverviewResponse";
import { AllChainsByKeys } from "@/lib/chains";
import { color } from "highcharts";
import { useHover } from "usehooks-ts";
import { Chart } from "../charts/chart";
import { capitalize } from "lodash";

export default function CategoryMetrics({
  data,
  showEthereumMainnet,
  setShowEthereumMainnet,
  selectedTimespan,
  setSelectedTimespan,
}: {
  data: Object;
  showEthereumMainnet: boolean;
  setShowEthereumMainnet: (show: boolean) => void;
  selectedTimespan: string;
  setSelectedTimespan: (timespan: string) => void;
}) {
  const [selectedScale, setSelectedScale] = useState("gas_fees_share");
  const [selectedCategory, setSelectedCategory] = useState("native_transfers");
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState(false);
  // Assuming `data` and `categories` objects are defined correctly

  const timespans = useMemo(() => {
    return {
      "7d": {
        label: "7 days",
        value: 7,
        xMin: Date.now() - 7 * 24 * 60 * 60 * 1000,
        xMax: Date.now(),
      },
      "30d": {
        label: "30 days",
        value: 30,
        xMin: Date.now() - 30 * 24 * 60 * 60 * 1000,
        xMax: Date.now(),
      },
      "90d": {
        label: "90 days",
        value: 90,
      },
      // "180d": {
      //   label: "180 days",
      //   value: 180,
      // },
      "365d": {
        label: "1 year",
        value: 365,
      },
      // max: {
      //   label: "Maximum",
      //   value: 0,
      // },
    };
  }, []);

  const categories = useMemo<{ [key: string]: string }>(() => {
    return {
      categories: "Categories",
      native_transfers: "Native Transfer",
      token_transfers: "Token Transfer",
      nft_fi: "NFT",
      defi: "DeFi",
      cefi: "CeFi",
      utility: "Utility",
      scaling: "Scaling",
      gaming: "Gaming",
    };
  }, []);

  const [isCategoryHovered, setIsCategoryHovered] = useState<{
    [key: string]: boolean;
  }>({
    native_transfers: false,
    token_transfers: false,
    nft_fi: false,
    defi: false,
    cefi: false,
    utility: false,
    scaling: false,
    gaming: false,
  });

  const [selectedSubcategories, setSelectedSubcategories] = useState<{
    [key: string]: any[];
  }>(() => {
    const initialSelectedSubcategories = {};
    Object.keys(categories).forEach((category) => {
      if (data[category]?.subcategories?.list) {
        initialSelectedSubcategories[category] = [
          ...data[category].subcategories.list,
        ];
      } else {
        initialSelectedSubcategories[category] = [];
      }
    });
    return initialSelectedSubcategories;
  });

  function formatSubcategories(str) {
    const title = str.replace(/_/g, " ");
    const words = title.split(" ");
    const formatted = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

    return formatted.join(" ");
  }

  function handleToggleSubcategory(category, subcategory) {
    setSelectedSubcategories((prevSelectedSubcategories) => {
      const categorySubcategories = prevSelectedSubcategories[category];
      const index = categorySubcategories.indexOf(subcategory);

      if (index !== -1) {
        // Value exists, remove it
        const updatedSubcategories = [...categorySubcategories];
        updatedSubcategories.splice(index, 1);
        return {
          ...prevSelectedSubcategories,
          [category]: updatedSubcategories,
        };
      } else {
        // Value doesn't exist, insert it
        return {
          ...prevSelectedSubcategories,
          [category]: [...categorySubcategories, subcategory],
        };
      }
    });
  }

  function checkSubcategory(category, subcategory) {
    return selectedSubcategories[category].includes(subcategory);
  }

  function handleDeselectAllSubcategories(category) {
    setSelectedSubcategories((prevSelectedSubcategories) => {
      return { ...prevSelectedSubcategories, [category]: [] };
    });
  }

  return (
    <>
      <div
        className={
          "flex w-full justify-between items-center text-xs rounded-full bg-forest-50 dark:bg-[#1F2726] p-0.5 z-10"
        }
      >
        <div className="hidden md:flex justify-center items-center ml-0.5">
          {/* <Icon icon="gtp:chain" className="w-7 h-7 lg:w-9 lg:h-9" /> */}

          <div className="flex justify-between md:justify-center items-center  space-x-[4px] md:space-x-1 mr-0 md:mr-2.5 w-full md:w-auto ">
            <button
              className={`rounded-full px-[16px] py-[8px] grow text-sm md:text-base lg:px-4 lg:py-3 xl:px-6 xl:py-4 font-medium   ${
                "gas_fees_share" === selectedScale
                  ? "bg-forest-500 dark:bg-forest-1000"
                  : "hover:bg-forest-500/10"
              }`}
              onClick={() => {
                setSelectedScale("gas_fees_share");
              }}
            >
              Gas Fees
            </button>
            <button
              className={`rounded-full px-[16px] py-[8px] grow text-sm md:text-base lg:px-4 lg:py-3 xl:px-6 xl:py-4 font-medium   ${
                "txcount_share" === selectedScale
                  ? "bg-forest-500 dark:bg-forest-1000"
                  : "hover:bg-forest-500/10"
              }`}
              onClick={() => {
                setSelectedScale("txcount_share");
              }}
            >
              Transaction Count
            </button>
          </div>
        </div>

        <div className="flex w-full md:w-auto justify-between md:justify-center items-stretch md:items-center space-x-[4px] md:space-x-1">
          {Object.keys(timespans).map((timespan) => (
            <button
              key={timespan}
              className={`rounded-full px-[16px] py-[8px] grow text-sm md:text-base lg:px-4 lg:py-3 xl:px-6 xl:py-4 font-medium ${
                selectedTimespan === timespan
                  ? "bg-forest-500 dark:bg-forest-1000"
                  : "hover:bg-forest-500/10"
              }`}
              onClick={() => {
                setSelectedTimespan(timespan);
                // setXAxis();
              }}
            >
              {timespans[timespan].label}
            </button>
          ))}
        </div>
      </div>

      {!openSub ? (
        <div
          className={
            "relative min-w-[820px] md:min-w-[850px] w-[97.5%] h-[67px] m-auto border-x-[1px] border-y-[1px] rounded-[15px] text-forest-50 dark:text-forest-50 border-forest-400 dark:border-forest-800 bg-forest-900 dark:bg-forest-1000 mt-8 overflow-hidden"
          }
        >
          <div className="flex w-full h-full text-[12px]">
            {Object.keys(categories).map((category, i) =>
              categories[category] !== "Categories" ? (
                <div
                  key={category}
                  className={`relative flex w-full h-full justify-center items-center ${
                    selectedCategory === category
                      ? "borden-hidden rounded-[0px]"
                      : "h-full"
                  }
                ${isCategoryHovered[category] ? "bg-white/5" : ""}
                `}
                  onMouseEnter={() => {
                    setIsCategoryHovered((prev) => ({
                      ...prev,
                      [category]: true,
                    }));
                  }}
                  onMouseLeave={() => {
                    setIsCategoryHovered((prev) => ({
                      ...prev,
                      [category]: false,
                    }));
                  }}
                  style={{
                    backgroundColor:
                      selectedCategory === category
                        ? "#5A6462"
                        : `rgba(0, 0, 0, ${
                            0.06 + (i / Object.keys(categories).length) * 0.94
                          })`,
                  }}
                >
                  <div
                    key={category}
                    className={`w-full h-full flex flex-col items-center first-letter justify-center hover:cursor-pointer ${
                      selectedCategory === category ? "" : "hover:bg-white/5"
                    }`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedChain(null);
                    }}
                  >
                    <div
                      className={` ${
                        selectedCategory === category
                          ? "text-sm font-bold"
                          : "text-xs font-medium"
                      }`}
                    >
                      {categories[category]}
                    </div>

                    <button
                      className="relative top-[8px] h-[24px] w-[24px] hover:bg-white/5"
                      onClick={() => {
                        setOpenSub(!openSub);
                      }}
                    >
                      <Icon
                        icon="icon-park-outline:down"
                        className="w-full h-full"
                      />
                    </button>
                  </div>
                </div>
              ) : (
                // Different response for "Chains" category
                <div
                  key={category}
                  className={
                    "relative flex flex-col w-full h-full justify-center pl-[16px]"
                  }
                >
                  <div className="text-sm font-bold pb-[10px]">
                    {categories[category]}
                  </div>
                  <div className="text-xs font-medium">Subcategories</div>
                </div>
              ),
            )}
          </div>
        </div>
      ) : (
        <div
          className={
            "relative min-w-[820px] md:min-w-[850px] w-[97.5%] h-[230px] m-auto border-x-[1px] border-y-[1px] rounded-[15px] text-forest-50 dark:text-forest-50 border-forest-400 dark:border-forest-800 bg-forest-900 dark:bg-forest-1000 mt-8 overflow-hidden"
          }
        >
          <div className="flex w-full h-full text-[12px]">
            {Object.keys(categories).map((category, i) =>
              categories[category] !== "Categories" ? (
                <div
                  key={category}
                  className={`relative flex w-full h-full ${
                    selectedCategory === category
                      ? "borden-hidden rounded-[0px]"
                      : "h-full"
                  }
                ${isCategoryHovered[category] ? "bg-white/5" : ""}
                `}
                  onMouseEnter={() => {
                    setIsCategoryHovered((prev) => ({
                      ...prev,
                      [category]: true,
                    }));
                  }}
                  onMouseLeave={() => {
                    setIsCategoryHovered((prev) => ({
                      ...prev,
                      [category]: false,
                    }));
                  }}
                  style={{
                    backgroundColor:
                      selectedCategory === category
                        ? "#5A6462"
                        : `rgba(0, 0, 0, ${
                            0.06 + (i / Object.keys(categories).length) * 0.94
                          })`,
                  }}
                >
                  <div
                    key={category}
                    className={`h-full flex flex-col items-center first-letter justify-between hover:cursor-pointer  ${
                      selectedCategory === category
                        ? "w-[220px]"
                        : "hover:bg-white/5 w-full"
                    }`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedChain(null);
                    }}
                  >
                    <div
                      className={`pt-2 ${
                        selectedCategory === category
                          ? "text-sm font-bold"
                          : "text-xs font-medium"
                      }`}
                    >
                      {categories[category]}
                    </div>

                    <div
                      className="flex flex-col gap-x-1 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-forest-900 scrollbar-track-forest-500/5 
                                    pl-1 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scroller"
                      style={
                        categories[category] === "Token Transfer"
                          ? { paddingRight: "20px" }
                          : { paddingRight: "4px" }
                      } // Add right padding for the scrollbar width
                    >
                      {selectedCategory === category ? (
                        <>
                          <div
                            className="flex border-forest-500 rounded-[15px] border-[1.5px] p-[5px] pl-[12px] my-1 items-center mx-auto w-[190px] hover:bg-white/5"
                            onClick={() => {
                              handleDeselectAllSubcategories(category);
                            }}
                          >
                            <div className="pr-[5px]">
                              Deselect All Subcategories
                            </div>
                            <div className="rounded-full bg-forest-50 dark:bg-forest-900">
                              <Icon
                                icon="feather:check-circle"
                                className="w-[14px] h-[14px]"
                              />
                            </div>
                          </div>

                          {data[category].subcategories.list.map(
                            (subcategory) =>
                              checkSubcategory(category, subcategory) ? (
                                <button
                                  key={subcategory}
                                  className="flex border-forest-500 rounded-[15px] border-[1.5px] p-[5px] pl-[12px] my-1 justify-between items-center mx-auto w-[130px] hover:bg-white/5"
                                  onClick={() => {
                                    handleToggleSubcategory(
                                      category,
                                      subcategory,
                                    );
                                  }}
                                >
                                  <div className="pr-[5px]">
                                    {formatSubcategories(subcategory)}
                                  </div>
                                  <div className="rounded-full bg-forest-50 dark:bg-forest-900">
                                    <Icon
                                      icon="feather:check-circle"
                                      className="w-[14px] h-[14px] opacity-100"
                                    />
                                  </div>
                                </button>
                              ) : (
                                <></>
                              ),
                          )}
                          {data[category].subcategories.list.map(
                            (subcategory) =>
                              !checkSubcategory(category, subcategory) ? (
                                <button
                                  key={subcategory}
                                  className="flex border-forest-200 rounded-[15px] border-[1.5px] p-[5px] pl-[12px] my-1 justify-between items-center mx-auto w-[130px] hover:bg-white/5 "
                                  onClick={() => {
                                    handleToggleSubcategory(
                                      category,
                                      subcategory,
                                    );
                                  }}
                                >
                                  <div className="pr-[5px] opacity-20">
                                    {formatSubcategories(subcategory)}
                                  </div>
                                  <div className="rounded-full bg-forest-50 dark:bg-forest-900">
                                    <Icon
                                      icon="feather:check-circle"
                                      className="w-[14px] h-[14px] opacity-0"
                                    />
                                  </div>
                                </button>
                              ) : (
                                <></>
                              ),
                          )}
                        </>
                      ) : (
                        <div></div>
                      )}
                    </div>

                    <button
                      className="relative bottom-[4px] h-[24px] w-[24px] hover:bg-white/5"
                      onClick={() => {
                        setOpenSub(!openSub);
                      }}
                    >
                      <Icon
                        icon="icon-park-outline:up"
                        className="w-full h-full"
                      />
                    </button>
                  </div>
                </div>
              ) : (
                // Different response for "Chains" category
                <div
                  key={category}
                  className={
                    "relative flex flex-col w-full h-full justify-start pl-[16px] pt-2"
                  }
                >
                  <div className="text-sm font-bold pb-[10px]">
                    {categories[category]}
                  </div>
                  <div className="text-xs font-medium">Subcategories</div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      <div className="flex w-[95%] m-auto mt-[30px]">
        <div className="w-1/2 ">
          <div className="flex flex-wrap items-center w-[87%] gap-y-2">
            <div className="font-bold text-sm pr-2 pl-2">
              {formatSubcategories(selectedCategory)}:{" "}
            </div>

            {selectedSubcategories[selectedCategory].map((subcategory) => (
              <div
                key={subcategory}
                className="bg-forest-50 border-forest-900 border-[1px] dark:bg-[#151A19] rounded-full text-xs px-[8px] py-[5px] mx-[5px]"
              >
                {formatSubcategories(subcategory)}
              </div>
            ))}
          </div>
          {/*Chains Here */}
        </div>
        <div>Chart{/*Chart Here */}</div>
      </div>
    </>
  );
}
