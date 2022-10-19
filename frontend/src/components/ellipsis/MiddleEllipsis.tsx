import React, { FunctionComponent, useEffect, useRef, useState } from "react";

export type EllipsisProps = {
  children: string;
  ellipsis?: string;
  className?: string;
  style?: React.CSSProperties;
};

const MiddleEllipsis: FunctionComponent<EllipsisProps> = ({
  children,
  ellipsis = "...",
  className,
  style,
}) => {
  const elRef = useRef<HTMLSpanElement>(null);
  const [show, setShow] = useState(false);
  const [state, setState] = useState(children);

  useEffect(() => {
    const resize = () => {
      setState(children);
      const offsetWidth = elRef.current ? elRef.current.offsetWidth : 0;
      const scrollWidth = elRef.current ? elRef.current.scrollWidth : 0;
      if (offsetWidth < scrollWidth) {
        const charWidth = Math.ceil(scrollWidth / children.length);
        const textHalf = Math.ceil(offsetWidth / charWidth / 2);
        const ellipsisHalf = Math.ceil(ellipsis.length / charWidth / 2);
        const half = textHalf - ellipsisHalf - 2; // safety 2 :)
        const ellipsisText =
          children.substr(0, half) +
          ellipsis +
          children.substring(children.length - half);
        setState(ellipsisText);
      }
      setShow(true);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <span
      ref={elRef}
      className={className}
      style={{ ...style, opacity: show ? 1 : 0, transition: "0.3s ease" }}
    >
      {state}
    </span>
  );
};

export default MiddleEllipsis;