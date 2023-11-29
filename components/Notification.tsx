"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSpring, animated, config, useTransition } from "react-spring";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Markdown from "react-markdown";
import { useMediaQuery } from "usehooks-ts";
import { usePathname } from "next/navigation";

type AirtableRow = {
  id: string;
  body: string;
  desc: string;
};

type NotificationType = {
  id: string;
  key: string;
};

const currentDateTime = new Date().getTime();

const Notification = () => {
  const [data, setData] = useState<Array<object> | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loadedMessages, setLoadedMessages] = useState<string[]>([]);
  const [circleStart, setCircleStart] = useState(false);
  const [currentURL, setCurrentURL] = useState<string | null>(null);
  const [pathname, setPathname] = useState<string | null>(null);
  const [sessionArray, setSessionArray] = useState<NotificationType[] | null>(
    null,
  );
  const [openNotif, setOpenNotif] = useState(false);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const currentPath = usePathname();

  function isoDateTimeToUnix(
    dateString: string,
    timeString: string,
  ): number | null {
    if (typeof dateString !== "string" || typeof timeString !== "string") {
      console.error("Invalid date or time type");
      return null;
    }

    const dateParts = dateString.split("-").map(Number);
    const timeParts = timeString.split(":").map(Number);

    if (dateParts.length !== 3 || timeParts.length !== 3) {
      console.error("Invalid date or time length");
      return null;
    }

    // Create a JavaScript Date object with the parsed date and time, and set it to the local time zone
    const localDate = new Date(
      dateParts[0],
      dateParts[1] - 1, // Month is 0-based in JavaScript
      dateParts[2],
      timeParts[0],
      timeParts[1],
      timeParts[2],
    );

    // Get the Unix timestamp (milliseconds since January 1, 1970)
    const unixTimestamp = localDate.getTime();

    return unixTimestamp;
  }

  useEffect(() => {
    setCurrentURL(window.location.href);
    setPathname(window.location.pathname);
    const storedArray = JSON.parse(
      window.sessionStorage.getItem("mySessionArray") || "[]",
    ) as NotificationType[];
    setSessionArray(storedArray);
  }, [currentPath]);

  const baseURL =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "development"
      ? `http://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  useEffect(() => {
    const fetchData = async () => {
      if (
        process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ||
        process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
      ) {
        try {
          const response = await fetch(baseURL + "/api/notifications", {
            method: "GET",
          });
          const result = await response.json();

          setData(result.records);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }
    };

    fetchData();
  }, []);

  function DateEnabled(startTime, startDate, endTime, endDate) {
    const startDateTime = isoDateTimeToUnix(startDate, startTime);
    const endDateTime = isoDateTimeToUnix(endDate, endTime);
    if (endDateTime && startDateTime) {
      if (currentDateTime < endDateTime && currentDateTime > startDateTime) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function urlEnabled(url) {
    let retValue = true;

    if (url !== "" && url[0] !== "all" && currentURL && pathname) {
      if (!(pathname === "/") && url[0] === "home") {
        if (!currentURL.includes(url[0])) {
          retValue = false;
        }
      } else if (!currentURL.includes(url[0]) && url[0] !== "home") {
        retValue = false;
      }
    }
    return retValue;
  }

  const addItemToArray = (newData: string) => {
    if (newData.trim() !== "") {
      const newItem: NotificationType = {
        id: "LoadedNotifications",
        key: newData,
      };

      setSessionArray((prevArray) => [...(prevArray || []), newItem]);
    }
  };

  const filteredData = useMemo(() => {
    const returnArray: AirtableRow[] = [];

    if (data && sessionArray) {
      Object.keys(data).forEach((item) => {
        let passingDate = DateEnabled(
          data[item]["fields"]["Start Time"],
          data[item]["fields"]["Start Date"],
          data[item]["fields"]["End Time"],
          data[item]["fields"]["End Date"],
        );
        let enabled = data[item]["fields"]["Status"] === "Enabled";
        let passingURL = urlEnabled(
          data[item]["fields"]["Display Page"]
            ? data[item]["fields"]["Display Page"]
            : "",
        );

        let prevLoaded = true;
        //defaults to true if we find a prevLoaded value we set false

        Object.keys(sessionArray).forEach((index) => {
          if (sessionArray[index].key === data[item].id) {
            prevLoaded = false;
          }
        });

        //Check if notification is enabled, available/current date range and selected url

        if (enabled && passingDate && passingURL && prevLoaded) {
          let newEntry: AirtableRow = {
            id: data[item]["id"],
            body: data[item]["fields"]["Body"],
            desc: data[item]["fields"]["Description"],
          };

          returnArray.push(newEntry);
        }
      });
    }

    return returnArray;
  }, [data, currentURL]);

  return (
    filteredData && (
      <>
        <div className="block w-full relative">
          <button
            className="flex items-center gap-x-[10px] overflow-hidden w-[600px] h-[28px] rounded-full border-[1px] dark:border-forest-50 border-black bg-white dark:bg-forest-900 px-[7px] relative z-10"
            onClick={() => {
              setOpenNotif(!openNotif);
            }}
          >
            <Image src="/FiBell.svg" width={16} height={16} alt="Bell image" />

            <p className="text-[12px] font-[500] ">Notification Center</p>
          </button>
          <div
            className={`absolute flex flex-col w-[600px] top-0 dark:bg-forest-900 bg-forest-50 rounded-b-xl rounded-t-xl z-1 overflow-hidden transition-max-height duration-700 ease-in-out`}
            style={{
              maxHeight: openNotif ? "1000px" : "0",
            }}
          >
            <div className="h-[28px]">
              {/*Top bar for height for consistency*/}
            </div>

            <div>
              {filteredData.map((item, index) => {
                return (
                  <div
                    className={`flex border-b-white border-dotted  w-full pt-[8px] hover:cursor-pointer ${
                      index < filteredData.length - 1
                        ? "border-b-[1px]"
                        : "border-b-[0px]"
                    }`}
                    key={item.id}
                  >
                    <div className="flex flex-col w-full pl-[35px] pb-[8px]">
                      <div className="h-[17px] font-bold text-[14px]">
                        {item.desc}
                      </div>
                      <Markdown className="h-auto text-[12px] ">
                        {item.body}
                      </Markdown>
                    </div>
                    <div className="w-[35px] pr-[20px] self-center">
                      <Icon icon="ci:chevron-right" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default Notification;
