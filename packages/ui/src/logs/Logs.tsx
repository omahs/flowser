import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classes from "./Logs.module.scss";
import { CaretIcon } from "../common/icons/CaretIcon/CaretIcon";
import { useFilterData } from "../hooks/use-filter-data";
import { useMouseMove } from "../hooks/use-mouse-move";
import { toast } from "react-hot-toast";
import classNames from "classnames";
import { SimpleButton } from "../common/buttons/SimpleButton/SimpleButton";
import { Callout } from "../common/misc/Callout/Callout";
import { SearchInput } from "../common/inputs";
import { ManagedProcessOutput, ProcessOutputSource } from "@onflowser/api";
import AnsiHtmlConvert from "ansi-to-html";
import { FlowserIcon } from "../common/icons/FlowserIcon";
import { useGetOutputsByProcess } from "../api";

type LogsProps = {
  className?: string;
};

type LogDrawerSize = "tiny" | "small" | "big" | "custom";

export function Logs(props: LogsProps): ReactElement {
  const [trackMousePosition, setTrackMousePosition] = useState(false);
  const [logDrawerSize, setLogDrawerSize] = useState<LogDrawerSize>("tiny");
  const tinyLogRef = useRef<HTMLDivElement>(null);
  const nonTinyLogRef = useRef<HTMLDivElement>(null);
  const logWrapperRef = logDrawerSize === "tiny" ? tinyLogRef : nonTinyLogRef;
  const logWrapperElement = logWrapperRef.current;
  const scrollBottom =
    (logWrapperElement?.scrollTop ?? 0) +
    (logWrapperElement?.clientHeight ?? 0);
  const scrollHeight = logWrapperElement?.scrollHeight ?? 0;
  const scrollDistanceToBottom = Math.abs(scrollBottom - scrollHeight);
  const shouldScrollToBottom = scrollDistanceToBottom < 10;
  const [searchTerm, setSearchTerm] = useState("");
  const { logs, tailLogs } = useRelevantLogs({
    searchTerm,
    tailSize: 5,
  });
  const mouseEvent = useMouseMove(trackMousePosition);

  const getDrawerSizeClass = useCallback(() => {
    return logDrawerSize === "tiny"
      ? ""
      : logDrawerSize === "small"
      ? classes.opened
      : classes.expanded;
  }, [logDrawerSize]);

  const scrollToBottom = (smooth = true) => {
    if (!shouldScrollToBottom) {
      return;
    }
    if (logWrapperRef.current) {
      const options: ScrollToOptions = {
        top: logWrapperRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      };
      logWrapperRef.current.scrollTo(options);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [logDrawerSize, shouldScrollToBottom]);

  useEffect(() => {
    const hasErrorLogs = logs.some(
      (log) => log.source === ProcessOutputSource.OUTPUT_SOURCE_STDERR,
    );
    if (hasErrorLogs) {
      toast.error("Some process encountered errors", {
        duration: 4000,
      });
    }

    scrollToBottom();
  }, [logs]);

  const onCaretChange = useCallback((isExpanded: boolean) => {
    if (isExpanded) {
      changeLogDrawerSize("tiny");
    } else {
      changeLogDrawerSize("small");
    }
  }, []);

  const changeLogDrawerSize = useCallback((size: LogDrawerSize) => {
    setLogDrawerSize(size);
    setTimeout(() => {
      scrollToBottom(false);
    }, 100);
  }, []);

  useEffect(() => {
    // ignore collapse if user moves drawer upwards
    if (!mouseEvent || mouseEvent.movementY <= 0) return;
    const bottomPosition = window.innerHeight - mouseEvent.clientY;
    // collapse if user drags drawer downwards and reaches a certain threshold
    if (bottomPosition <= 130) {
      setLogDrawerSize("tiny");
      setTrackMousePosition(false);
    }
  }, [mouseEvent]);

  const startPositionDrag = useCallback(() => {
    setTrackMousePosition(true);
    setLogDrawerSize("custom");
  }, []);

  const endPositionDrag = useCallback(() => {
    setTrackMousePosition(false);
  }, []);

  return (
    <div
      className={classNames(
        classes.root,
        getDrawerSizeClass(),
        props.className,
      )}
      style={logDrawerSize === "custom" ? { top: mouseEvent?.clientY } : {}}
    >
      <VerticalDragLine
        isActive={trackMousePosition}
        startPositionDrag={startPositionDrag}
        endPositionDrag={endPositionDrag}
      />

      <div
        className={classNames(classes.header, {
          [classes.expanded]: logDrawerSize !== "tiny",
        })}
      >
        <SimpleButton className={classes.logsButton}>
          <FlowserIcon.Logs />
          <span>LOGS</span>
        </SimpleButton>

        {logDrawerSize === "tiny" && (
          <div className={classes.midContainer} ref={tinyLogRef}>
            {tailLogs.map((log) => (
              <LogLine key={log.id} log={log} />
            ))}
          </div>
        )}

        <div className={classes.rightContainer}>
          {logDrawerSize !== "tiny" && (
            <SearchInput
              className={classes.searchBox}
              placeholder="Search logs ...."
              searchTerm={searchTerm}
              onChangeSearchTerm={setSearchTerm}
            />
          )}
          <div>
            {["tiny", "small", "custom"].includes(logDrawerSize) && (
              <CaretIcon
                inverted={true}
                isOpen={logDrawerSize !== "tiny"}
                className={classes.control}
                onChange={onCaretChange}
              />
            )}
            {logDrawerSize === "small" && (
              <FlowserIcon.Expand
                className={classes.control}
                onClick={() => changeLogDrawerSize("big")}
              />
            )}
            {logDrawerSize === "big" && (
              <FlowserIcon.Shrink
                className={classes.control}
                onClick={() => changeLogDrawerSize("small")}
              />
            )}
          </div>
        </div>
      </div>

      {logDrawerSize !== "tiny" && (
        <div className={classes.bigLogsContainer} ref={nonTinyLogRef}>
          {logs.map((log) => (
            <LogLine key={log.id} log={log} />
          ))}
          {logs.length === 0 && <NoLogsHelpBanner />}
        </div>
      )}
    </div>
  );
}

function LogLine({ log }: { log: ManagedProcessOutput }) {
  return (
    <pre
      className={classes.line}
      style={
        // TODO(ui): use color from color pallet
        log.source === ProcessOutputSource.OUTPUT_SOURCE_STDERR
          ? { color: "#D02525" }
          : {}
      }
      dangerouslySetInnerHTML={{
        __html: formatProcessOutput(log),
      }}
    />
  );
}

function formatProcessOutput(log: ManagedProcessOutput): string {
  const convert = new AnsiHtmlConvert({
    // See default colors used:
    // https://github.com/rburns/ansi-to-html/blob/master/lib/ansi_to_html.js#L12
    colors: {
      4: "#9bdefa",
    },
  });
  // The msg field in logs can contain escaped ansi codes
  // We need to unescape them so that they can be parsed by ansi-to-html lib
  const unescaped = log.data.replace(/\\x1b/g, "\x1b");
  return convert.toHtml(unescaped);
}

function NoLogsHelpBanner() {
  return (
    <Callout
      icon="❓"
      title="No logs found"
      description={
        <div>
          <p>
            Flowser can only show logs, when emulator is run by Flowser itself.
            Make sure you aren't running the <code>flow emulator</code> command
            yourself.
          </p>
        </div>
      }
    />
  );
}

function useRelevantLogs(options: {
  searchTerm: string | undefined;
  tailSize: number;
}) {
  const { data: emulatorLogs } = useGetOutputsByProcess(emulatorProcessId);
  const { filteredData: logs } = useFilterData(
    emulatorLogs ?? [],
    options.searchTerm,
  );
  const tailLogs = useMemo(
    () => logs.slice(logs.length - options.tailSize, logs.length),
    [logs],
  );

  return {
    logs,
    tailLogs,
  };
}

type VerticalDragLineProps = {
  startPositionDrag: (e: React.MouseEvent) => void;
  endPositionDrag: (e: React.MouseEvent) => void;
  isActive?: boolean;
};

const VerticalDragLine = ({
  isActive,
  startPositionDrag,
  endPositionDrag,
}: VerticalDragLineProps) => {
  return (
    <div
      style={{
        height: 3,
        cursor: "ns-resize",
        left: 0,
        right: 0,
        top: -1.5,
        position: "absolute",
        background: isActive ? "#FFC016" : "transparent",
      }}
      onMouseDown={startPositionDrag}
      onMouseUp={endPositionDrag}
    />
  );
};

const emulatorProcessId = "emulator";