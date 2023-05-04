"use client";

import HighchartsReact from "highcharts-react-official";
import Highcharts, {
  // AxisLabelsFormatterCallbackFunction,
  AxisLabelsFormatterContextObject,
  // chart,
  // Series,
  // TooltipFormatterCallbackFunction,
} from "highcharts";
import highchartsAnnotations from "highcharts/modules/annotations";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
// import { Card } from "@/components/Card";
import { useLocalStorage } from "usehooks-ts";
import fullScreen from "highcharts/modules/full-screen";
import { merge } from "lodash";
// import { zinc, red, blue, amber, purple } from "tailwindcss/colors";
import { theme as customTheme } from "tailwind.config";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
// import _ from "lodash";
import { Switch } from "../Switch";
import { AllChainsByKeys } from "@/lib/chains";
import d3 from "d3";

const COLORS = {
  GRID: "rgb(215, 223, 222)",
  PLOT_LINE: "rgb(215, 223, 222)",
  LABEL: "rgb(215, 223, 222)",
  LABEL_HOVER: "#6c7696",
  TOOLTIP_BG: "#1b2135", // mignight-express but lighter
  ANNOTATION_BG: "rgb(215, 223, 222)",
  // visx
  // SERIES: ["#0b7285", "#66d9e8", "#fcc419", "#ff8787", "#9c36b5", "#cc5de8", "#a61e4d"],
  // chart.js
  SERIES: ["#36a2eb", "#ff6384", "#8142ff", "#ff9f40", "#ffcd56", "#4bc0c0"],
};
const isArray = (obj: any) =>
  Object.prototype.toString.call(obj) === "[object Array]";
const splat = (obj: any) => (isArray(obj) ? obj : [obj]);

const baseOptions: Highcharts.Options = {
  accessibility: { enabled: false },
  exporting: { enabled: false },
  chart: {
    type: "line",
    animation: false,
    backgroundColor: "transparent",
    showAxes: false,
    zooming: {
      type: "x",
      resetButton: {
        position: {
          x: 0,
          y: 10,
        },
        theme: {
          fill: "transparent",
          style: {
            opacity: 1,
            fontSize: "12",
            fontFamily: "Inter",
            fontWeight: "300",
            color: "#fff",
            textTransform: "lowercase",
            border: "1px solid #fff",
          },
          borderRadius: 4,
          padding: 8,
          borderWidth: 2,
          r: 16,
          states: { hover: { fill: "#fff", style: { color: "#000" } } },
        },
      },
    },
  },

  title: undefined,
  yAxis: {
    title: { text: undefined },
    labels: {
      enabled: true,
    },
    gridLineWidth: 1,
    gridLineColor: COLORS.GRID,
  },
  xAxis: {
    type: "datetime",
    lineWidth: 0,
    crosshair: {
      width: 0.5,
      color: COLORS.PLOT_LINE,
    },

    labels: {
      style: { color: COLORS.LABEL },
      enabled: true,
      formatter: (item) => {
        const date = new Date(item.value);
        const isMonthStart = date.getDate() === 1;
        const isYearStart = isMonthStart && date.getMonth() === 0;
        if (isYearStart) {
          return `<span style="font-size:14px;">${date.getFullYear()}</span>`;
        } else {
          return `<span style="">${date.toLocaleDateString(undefined, {
            month: "short",
          })}</span>`;
        }
        // return `<span style="">${new Date(item.value).toLocaleDateString(
        //   undefined,
        //   { year: "numeric", month: "numeric", day: "numeric" }
        // )}</span>`;
      },
    },
    tickWidth: 4,
    tickLength: 4,
    minPadding: 0.04,
    maxPadding: 0.04,
    gridLineWidth: 0,
  },
  legend: {
    enabled: false,
    useHTML: false,
    symbolWidth: 0,
    // labelFormatter: function () {
    // 	const color = bgColors[this.name][0];

    // 	return `
    //     <div class="flex flex-row items-center gap-x-2">
    //         <div class="w-2 h-2 rounded-full ${color}"></div>
    //         <div class="font-roboto font-normal text-zincus-400 text-xs">
    //         ${this.name}
    //         </div>
    //     </div>`;
    // },
  },
  tooltip: {
    // backgroundColor: 'transparent',
    useHTML: true,
    shadow: false,
    shared: true,
  },
  plotOptions: {
    line: {
      lineWidth: 2,
    },
    spline: {
      lineWidth: 2,
    },
    series: {
      events: {
        legendItemClick: function () {
          return false;
        },
      },
      marker: {
        lineColor: "white",
        radius: 0,
        symbol: "circle",
      },
      animation: false,
    },
  },

  credits: {
    enabled: false,
  },
  navigation: {
    buttonOptions: {
      enabled: false,
    },
  },
};

const timespans = {
  // "30d": {
  //   label: "30 days",
  //   value: 30,
  //   xMin: Date.now() - 30 * 24 * 60 * 60 * 1000,
  //   xMax: Date.now(),
  // },
  "90d": {
    label: "90 days",
    value: 90,
    xMin: Date.now() - 90 * 24 * 60 * 60 * 1000,
    xMax: Date.now(),
  },
  "180d": {
    label: "180 days",
    value: 180,
    xMin: Date.now() - 180 * 24 * 60 * 60 * 1000,
    xMax: Date.now(),
  },
  "365d": {
    label: "1 year",
    value: 365,
    xMin: Date.now() - 365 * 24 * 60 * 60 * 1000,
    xMax: Date.now(),
  },
  max: {
    label: "Maximum",
    value: 0,
    xMin: Date.parse("2020-09-28"),
    xMax: Date.now(),
  },
};

type MainChartProps = {
  data: {
    name: string;
    data: any;
    types: any[];
  };
  dataKeys: string[];
};

export default function ComparisonChart({
  data,
  timeIntervals,
  onTimeIntervalChange,
  showTimeIntervals = true,
}: {
  data: any;
  timeIntervals: string[];
  onTimeIntervalChange: (interval: string) => void;
  showTimeIntervals: boolean;
}) {
  useEffect(() => {
    Highcharts.setOptions({
      lang: {
        numericSymbols: ["K", " M", "B", "T", "P", "E"],
      },
    });
    highchartsAnnotations(Highcharts);
    fullScreen(Highcharts);
  }, []);

  // const [darkMode, setDarkMode] = useLocalStorage("darkMode", true);
  const { theme } = useTheme();

  const [showUsd, setShowUsd] = useLocalStorage("showUsd", true);

  const [selectedTimespan, setSelectedTimespan] = useState("90d");

  const [selectedScale, setSelectedScale] = useState("absolute");

  const [selectedTimeInterval, setSelectedTimeInterval] = useState("daily");

  const [showEthereumMainnet, setShowEthereumMainnet] = useState(false);

  const [valuePrefix, setValuePrefix] = useState("");

  const getTickPositions = useCallback(
    (xMin: any, xMax: any): number[] => {
      const tickPositions: number[] = [];
      const xMinDate = new Date(xMin);
      const xMaxDate = new Date(xMax);
      const xMinMonth = xMinDate.getMonth();
      const xMaxMonth = xMaxDate.getMonth();

      const xMinYear = xMinDate.getFullYear();
      const xMaxYear = xMaxDate.getFullYear();

      if (selectedTimespan === "max") {
        for (let year = xMinYear; year <= xMaxYear; year++) {
          for (let month = 0; month < 12; month = month + 4) {
            if (year === xMinYear && month < xMinMonth) continue;
            if (year === xMaxYear && month > xMaxMonth) continue;
            tickPositions.push(new Date(year, month, 1).getTime());
          }
        }
        return tickPositions;
      }

      for (let year = xMinYear; year <= xMaxYear; year++) {
        for (let month = 0; month < 12; month++) {
          if (year === xMinYear && month < xMinMonth) continue;
          if (year === xMaxYear && month > xMaxMonth) continue;
          tickPositions.push(new Date(year, month, 1).getTime());
        }
      }

      return tickPositions;
    },
    [selectedTimespan]
  );

  const getSeriesType = useCallback(
    (name: string) => {
      if (selectedScale === "percentage") return "area";

      if (name === "ethereum") return "areaspline";

      return "line";
    },
    [selectedScale]
  );

  const getChartType = useCallback(() => {
    if (selectedScale === "percentage") return "area";

    return "line";
  }, [selectedScale]);

  const formatNumber = useCallback(
    (value: number | string, isAxis = false) => {
      const prefix = valuePrefix;
      return isAxis
        ? prefix + d3.format(".2s")(value).replace(/G/, "B")
        : d3.format(",.2~s")(value).replace(/G/, "B");
    },
    [valuePrefix]
  );

  const tooltipFormatter = useCallback(
    function (this: any) {
      const { x, points } = this;
      const date = new Date(x);
      const dateString = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const tooltip = `<div class="mt-3 mr-3 mb-3 w-80 text-xs font-raleway"><div class="w-full font-bold text-[1rem] ml-6 mb-2">${dateString}</div>`;
      const tooltipEnd = `</div>`;

      let pointsSum = 0;
      if (selectedScale !== "percentage")
        pointsSum = points.reduce((acc: number, point: any) => {
          acc += point.y;
          return pointsSum;
        }, 0);

      const tooltipPoints = points
        .sort((a: any, b: any) => b.y - a.y)
        .map((point: any) => {
          const { series, y, percentage } = point;
          const { name } = series;
          if (selectedScale === "percentage")
            return `
              <div class="flex w-full space-x-2 items-center font-medium mb-1">
                <div class="w-4 h-1.5 rounded-r-full" style="background-color: ${
                  AllChainsByKeys[name].colors[theme][0]
                }"></div>
                <div class="tooltip-point-name">${
                  AllChainsByKeys[name].label
                }</div>
                <div class="flex-1 text-right font-inter">${Highcharts.numberFormat(
                  percentage,
                  2
                )}%</div>
              </div>
              <!-- <div class="flex ml-6 w-[calc(100% - 24rem)] relative mb-1">
                <div class="h-[2px] w-full bg-gray-200 rounded-full absolute left-0 top-0" > </div>

                <div class="h-[2px] rounded-full absolute left-0 top-0" style="width: ${Highcharts.numberFormat(
                  percentage,
                  2
                )}%; background-color: ${
              AllChainsByKeys[name].colors[theme][0]
            };"> </div>
              </div> -->`;

          const value = formatNumber(y);
          return `
          <div class="flex w-full space-x-2 items-center font-medium mb-1">
            <div class="w-4 h-1.5 rounded-r-full" style="background-color: ${
              AllChainsByKeys[name].colors[theme][0]
            }"></div>
            <div class="tooltip-point-name text-md">${
              AllChainsByKeys[name].label
            }</div>
            <div class="flex-1 text-right justify-end font-inter">
              <div class="mr-1 inline-block"><span class="opacity-70 inline-block mr-[1px]">${valuePrefix}</span>${parseFloat(
            y
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</div>
          <!-- <div class="inline-block">≈</div>
              <div class="inline-block"><span class="opacity-70">${valuePrefix}</span>${value}</div>
              -->
            </div>
          </div>
          <!-- <div class="flex ml-4 w-[calc(100% - 1rem)] relative mb-1">
            <div class="h-[2px] w-full bg-gray-200 rounded-full absolute left-0 top-0" > </div>

            <div class="h-[2px] rounded-full absolute right-0 top-0" style="width: ${formatNumber(
              (y / pointsSum) * 100
            )}%; background-color: ${
            AllChainsByKeys[name].colors[theme][0]
          }33;"></div>
          </div> -->`;
        })
        .join("");
      return tooltip + tooltipPoints + tooltipEnd;
    },
    [formatNumber, selectedScale, theme, valuePrefix]
  );

  const filteredData = useMemo(() => {
    if (!data) return null;
    return showEthereumMainnet
      ? data
      : data.filter((d) => d.name !== "ethereum");
  }, [data, showEthereumMainnet]);

  const options = useMemo((): Highcharts.Options => {
    if (!filteredData) return {};

    if (filteredData[0].types.includes("usd")) {
      if (!showUsd) setValuePrefix("Ξ");
      else setValuePrefix("$");
    } else {
      setValuePrefix("");
    }

    const dynamicOptions: Highcharts.Options = {
      chart: {
        type: getChartType(),
      },
      plotOptions: {
        area: {
          stacking: selectedScale === "percentage" ? "percent" : undefined,
        },
      },
      legend: {
        enabled: false,
      },
      yAxis: {
        type: selectedScale === "log" ? "logarithmic" : "linear",
        labels: {
          style: {
            color: theme === "dark" ? "rgb(215, 223, 222)" : "rgb(41 51 50)",
          },
          formatter: (t: AxisLabelsFormatterContextObject) => {
            return formatNumber(t.value, true);
          },
          // format: filteredData[0].types.includes("usd")
          //   ? !showUsd
          //     ? "Ξ{value}"
          //     : "${value}"
          //   : "{value}",
        },
        gridLineColor:
          theme === "dark" ? "rgb(215, 223, 222)" : "rgb(41 51 50)",
      },
      xAxis: {
        min: timespans[selectedTimespan].xMin,
        max: timespans[selectedTimespan].xMax,
        // calculate tick positions based on the selected time interval so that the ticks are aligned to the first day of the month
        tickPositions: getTickPositions(
          timespans[selectedTimespan].xMin,
          timespans[selectedTimespan].xMax
        ),
        labels: {
          style: {
            color: theme === "dark" ? "rgb(215, 223, 222)" : "rgb(41 51 50)",
          },
        },
      },
      tooltip: {
        formatter: tooltipFormatter,
        backgroundColor:
          (customTheme?.extend?.colors
            ? theme === "dark"
              ? customTheme?.extend?.colors["forest"]["900"]
              : customTheme?.extend?.colors["forest"]["50"]
            : "#ffffff") + "EE",
        borderRadius: 17,
        borderWidth: 0,
        padding: 0,

        style: {
          color: theme === "dark" ? "rgb(215, 223, 222)" : "rgb(41 51 50)",
        },
      },
      series: filteredData.map((series: any) => ({
        name: series.name,
        data:
          !showUsd && series.types.includes("usd")
            ? series.data.map((d: any) => [d[0], d[2]])
            : series.data.map((d: any) => [d[0], d[1]]),

        type: getSeriesType(series.name),
        // fill if series name is ethereum
        fillOpacity: series.name === "ethereum" ? 1 : 0,
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, AllChainsByKeys[series.name].colors[theme][0] + "33"],
            [1, AllChainsByKeys[series.name].colors[theme][1] + "33"],
          ],
        },

        shadow: {
          color: AllChainsByKeys[series.name].colors[theme][1] + "33",
          width: 10,
        },
        color: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 1,
            y2: 0,
          },
          stops: [
            [0, AllChainsByKeys[series.name].colors[theme][0]],
            // [0.33, AllChainsByKeys[series.name].colors[1]],
            [1, AllChainsByKeys[series.name].colors[theme][1]],
          ],
        },
      })),
    };

    return merge({}, baseOptions, dynamicOptions);
  }, [
    filteredData,
    getChartType,
    selectedScale,
    theme,
    showUsd,
    selectedTimespan,
    getTickPositions,
    tooltipFormatter,
    formatNumber,
    getSeriesType,
  ]);

  const chartComponent = useRef<Highcharts.Chart | null | undefined>(null);

  useEffect(() => {
    if (chartComponent.current) {
      chartComponent.current.xAxis[0].setExtremes(
        timespans[selectedTimespan].xMin,
        timespans[selectedTimespan].xMax
      );
    }
  }, [selectedTimespan, chartComponent]);

  useEffect(() => {
    if (chartComponent.current) {
      switch (selectedScale) {
        case "absolute":
          chartComponent.current?.update({
            chart: {
              type: getChartType(),
            },
            plotOptions: {
              series: {
                stacking: undefined,
              },
            },
            yAxis: {
              type: "linear",
            },
            tooltip: {
              formatter: tooltipFormatter,
              // pointFormat:
              //   '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
            },
            series: filteredData.map((series: any) => ({
              type: getSeriesType(series.name),
            })),
          });
          break;
        case "log":
          chartComponent.current?.update({
            chart: {
              type: getChartType(),
            },
            plotOptions: {
              series: {
                stacking: "normal",
              },
            },
            yAxis: {
              type: "logarithmic",
            },
            tooltip: {
              formatter: tooltipFormatter,
              // pointFormat:
              //   '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
            },

            series: filteredData.map((series: any) => ({
              type: getSeriesType(series.name),
            })),
          });
          break;
        case "percentage":
          chartComponent.current?.update({
            chart: {
              type: getChartType(),
            },
            plotOptions: {
              area: {
                stacking: "percent",
                marker: {
                  enabled: false,
                },
              },
            },
            yAxis: {
              type: "linear",
            },
            tooltip: {
              formatter: tooltipFormatter,
              // pointFormat:
              //   '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
            },
            series: filteredData.map((series: any) => ({
              type: getSeriesType(series.name),
            })),
          });
          break;
        default:
          break;
      }
    }
  }, [
    selectedScale,
    chartComponent,
    filteredData,
    getChartType,
    getSeriesType,
    tooltipFormatter,
  ]);

  useEffect(() => {
    if (chartComponent.current) {
      chartComponent.current.reflow();
    }
  }, [chartComponent, filteredData]);

  const toggleFullScreen = () => {
    // @ts-ignore
    chartComponent.current?.chart?.fullScreen.toggle();
  };

  return (
    <div className="w-full my-12 relative">
      <div className="flex w-full justify-between items-center absolute -top-10 left-0 right-0 text-xs">
        <div className="flex justify-center items-center space-x-1 rounded-full bg-forest-50 p-0.5">
          {showTimeIntervals &&
            timeIntervals.map((timeInterval, i) => (
              <button
                key={timeInterval}
                className={`rounded-full px-2 py-1 font-medium capitalize ${
                  selectedTimeInterval === timeInterval
                    ? "bg-forest-900 text-forest-50 hover:bg-forest-700"
                    : "hover:bg-forest-100"
                }`}
                onClick={() => {
                  onTimeIntervalChange(timeInterval);
                  // chartComponent.current?.xAxis[0].setExtremes(
                  //   timespans[timespan].xMin,
                  //   timespans[timespan].xMax
                  // );
                }}
              >
                {timeInterval}
              </button>
            ))}
        </div>
        <div className="flex justify-center items-center space-x-1 rounded-full bg-forest-50 p-0.5">
          {Object.keys(timespans).map((timespan) => (
            <button
              key={timespan}
              className={`rounded-full px-2 py-1 font-medium ${
                selectedTimespan === timespan
                  ? "bg-forest-900 text-forest-50 hover:bg-forest-700"
                  : "hover:bg-forest-100"
              }`}
              onClick={() => {
                setSelectedTimespan(timespan);
                // chartComponent.current?.xAxis[0].setExtremes(
                //   timespans[timespan].xMin,
                //   timespans[timespan].xMax
                // );
              }}
            >
              {timespans[timespan].label}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full p-4 rounded-xl bg-forest-50/10 dark:bg-forest-900/10">
        <div className="w-full h-[26rem] relative rounded-xl">
          <div className="absolute w-full h-[24rem] top-4">
            <HighchartsReact
              highcharts={Highcharts}
              options={options}
              ref={(chart) => {
                chartComponent.current = chart?.chart;
              }}

              // immutable={true}
              // oneToOne={true}
              // callBack={(chart) => {
              // 	setChart(chart);
              // }}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center absolute -bottom-10 left-0 right-0 ">
        {/* <button onClick={toggleFullScreen}>Fullscreen</button> */}
        {/* <div className="flex justify-center items-center rounded-full bg-forest-50 p-0.5"> */}
        {/* toggle ETH */}
        <div>
          {data.filter((d) => d.name === "ethereum").length > 0 && (
            <Switch
              checked={showEthereumMainnet}
              onChange={() => setShowEthereumMainnet(!showEthereumMainnet)}
              rightLabel="Show Ethereum"
            />
          )}
        </div>

        {/* <button
            className={`rounded-full px-2 py-1 text-xs font-bold
            ${
              showEthereumMainnet
                ? "bg-forest-900 text-forest-50 hover:bg-forest-700"
                : "bg-transparent text-forest-800 hover:bg-forest-700"
            }`}
            onClick={() => setShowEthereumMainnet(!showEthereumMainnet)}
          >
            {showEthereumMainnet ? "Hide ETH Mainnet" : "Show ETH Mainnet"}
          </button> */}
        {/* </div> */}
        <div className="flex justify-center items-center space-x-1 rounded-full bg-forest-50 p-0.5">
          <button
            className={`rounded-full px-2 py-1 text-xs font-bold ${
              "absolute" === selectedScale
                ? "bg-forest-900 text-forest-50"
                : "hover:bg-forest-100"
            }`}
            onClick={() => {
              setSelectedScale("absolute");
            }}
          >
            <span className=" font-bold text-[0.6rem] font-mono mr-0.5">
              {"<>"}
            </span>
            Absolute
          </button>
          <button
            className={`rounded-full px-2 py-1 text-xs font-bold ${
              "log" === selectedScale
                ? "bg-forest-900 text-forest-50"
                : "hover:bg-forest-100"
            }`}
            onClick={() => {
              setSelectedScale("log");
            }}
          >
            <ArrowTrendingUpIcon className="w-3 h-3 font-bold inline-block mr-0.5" />
            Log
          </button>
          <button
            className={`rounded-full px-2 py-1 text-xs font-bold ${
              "percentage" === selectedScale
                ? "bg-forest-900 text-forest-50"
                : "hover:bg-forest-100"
            }`}
            onClick={() => {
              setSelectedScale("percentage");
            }}
          >
            <span className="font-bold text-[0.6rem]">%</span> Percentage
          </button>
        </div>
      </div>
    </div>
  );
}
