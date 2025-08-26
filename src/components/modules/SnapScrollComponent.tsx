import React, { useRef, useState, useEffect, PropsWithChildren } from "react";

interface SnapScrollComponentProps {
  index: number;
  className?: string;
  debugMessage?: string;
  threshold?: number;
  onIntersecting?: (index: number) => void;
}

const SnapScrollComponent: React.FC<
  PropsWithChildren<SnapScrollComponentProps>
> = ({
  index,
  className,
  debugMessage,
  threshold = 0.9,
  onIntersecting,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isShown, setIsShown] = useState(false);
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        // console.log(entry);
        if (entry.isIntersecting) {
          onIntersecting?.(index);
        }
        if (debugMessage) {
          if (entry.isIntersecting) {
            // console.log("intersecting: ", debugMessage);
          } else {
            // console.log("disintersecting: ", debugMessage);
          }
        }
        setIsShown(entry.isIntersecting);
      },
      { threshold }
    );

    if (ref.current) {
      // if (debugMessage)
      //   console.log("observe:", debugMessage);
      intersectionObserver.observe(ref.current);
    }

    setObserver(intersectionObserver);

    return () => {
      // if (debugMessage)
      //   console.log("unmount:", debugMessage);
      intersectionObserver.disconnect();
    };
  }, [index, threshold, onIntersecting, debugMessage]);

  return (
    <div ref={ref} className={className}>
      {React.Children.map(
        children,
        (child) => React.isValidElement(child) && child
      )}
    </div>
  );
};

export default SnapScrollComponent;
