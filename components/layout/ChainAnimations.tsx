import { animated, useSpring } from "@react-spring/web";
import { Icon } from "@iconify/react";
import { AllChainsByKeys } from "@/lib/chains";
import { useTheme } from "next-themes";
import { useLocalStorage } from "usehooks-ts";
import { useMemo, useState, useEffect, useRef } from "react";

export default function ChainAnimations({
  chain,
  value,
  index,
  sortedValues,
  selectedValue,
  selectedMode,
  selectedChains,
  setSelectedChains,
}: {
  chain: string;
  value: number;
  index: number;
  sortedValues: Object;
  selectedValue: string;
  selectedMode: string;
  selectedChains: Object;
  setSelectedChains: (show: Object) => void;
}) {
  const { theme } = useTheme();
  const [showUsd, setShowUsd] = useLocalStorage("showUsd", true);

  const [width, setWidth] = useState(() => {
    if (sortedValues && value) {
      const largestValue = Math.max(
        ...Object.values(sortedValues).map(([, value]) => value),
      );
      let minWidth = 205;

      const relativeWidth = 205 + (sortedValues[index][1] / largestValue) * 150;

      const percentage = (value / largestValue) * 99;
      const newWidth = `max(${percentage}%, ${relativeWidth}px)`;
      return `max(${percentage}%, ${minWidth}px)`;
    } else {
      return "auto";
    }
  });

  useEffect(() => {
    if (sortedValues && value) {
      const largestValue = Math.max(
        ...Object.values(sortedValues).map(([, value]) => value),
      );
      let minWidth = 205;

      const relativeWidth = 205 + (sortedValues[index][1] / largestValue) * 150;

      const percentage = (value / largestValue) * 99;
      const newWidth = `max(${percentage}%, ${relativeWidth}px)`;

      // Set the width state using the setWidth function
      setWidth(newWidth);
    } else {
      setWidth("auto");
    }
  }, [value, sortedValues]);

  if (chain === "imx" && selectedMode === "gas_fees_") {
    return null;
  } else {
    return (
      <animated.div
        key={chain}
        className={`relative flex flex-row flex-grow h-full items-center rounded-full text-xs font-medium hover:cursor-pointer z-0 ${
          ["arbitrum", "imx", "gitcoin_pgn", "zkSync Era", "all_l2s"].includes(
            chain,
          )
            ? "text-white dark:text-black"
            : "text-white"
        } ${
          selectedChains[chain]
            ? AllChainsByKeys[chain].backgrounds[theme][1]
            : `${AllChainsByKeys[chain].backgrounds[theme][1]} `
        }`}
        style={{
          width: width,
          bottom: `${index * 45}px`,
        }}
        onClick={() => {
          if (
            Object.keys(selectedChains).filter(
              (sc) => selectedChains[sc] === true,
            ).length === 1 &&
            selectedChains[chain]
          )
            return;

          setSelectedChains((prevSelectedChains) => ({
            ...prevSelectedChains,
            [chain]: !prevSelectedChains[chain],
          }));
        }}
      >
        <div
          key={chain + " " + value}
          className="flex items-center h-[45px] pl-[20px] min-w-[155px] w-full "
        >
          <div
            key={chain + " " + index + value}
            className="flex w-[155px] items-center pr-2 "
          >
            <div
              key={chain + " " + index}
              className="flex items-center w-[30px]"
            >
              <Icon
                icon={`gtp:${chain.replace("_", "-")}-logo-monochrome`}
                className="w-[15px] h-[15px]"
              />
            </div>
            <div className="-mb-0.5">{AllChainsByKeys[chain].label}</div>
          </div>

          <div
            key={value + " " + index}
            className="flex justify-end flex-grow "
          >
            <div key={index} className="text-base flex">
              {selectedValue === "share" ? (
                <div>{Math.round(value * 100)}%</div>
              ) : (
                <div className="flex gap-x-1">
                  <div
                    className={`${showUsd ? "static" : "relative top-[1px]"}`}
                  >
                    {selectedMode === "gas_fees_" ? (showUsd ? `$` : `Ξ`) : ""}
                  </div>
                  <div>
                    {showUsd
                      ? (Math.round(value * 100) / 100).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          },
                        )
                      : (Math.round(value * 100) / 100).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          },
                        )}
                  </div>
                </div>
              )}
            </div>
            <div
              key={chain + "select"}
              className={`relative flex left-[10px] w-[24px] h-[24px] bg-forest-700 rounded-full self-center items-center justify-center z-10 ${
                !selectedChains[chain] ? "opacity-100" : ""
              }`}
            >
              <Icon
                icon="feather:check-circle"
                className={`w-[24px] h-[24px] opacity-100 text-white ${
                  !selectedChains[chain] ? "opacity-0" : ""
                }`}
              />
            </div>
          </div>
        </div>
      </animated.div>
    );
  }
}
