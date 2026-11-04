import React, {
  useRef,
  useState,
  useEffect,
  PropsWithChildren,
  useCallback,
} from "react";
import { AiOutlineLoading } from "react-icons/ai";

type Props = {
  debugMessage?: string;
  threshold?: number;
  className?: string;
};

const LazyComponent: React.FC<PropsWithChildren<Props>> = ({
  debugMessage,
  threshold = 0.4,
  className,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          if (debugMessage) {
            // console.log(debugMessage);
          }
          setIsLoaded(true);
          observer.disconnect(); // ロード後は監視を解除
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [debugMessage, threshold, isLoaded]);

  const renderLoading = useCallback(() => {
    return (
      // 読み込み中のくるくるを、この枠の中に出す(高さ0・relative 無しだと、外側の <main> の中央に重なって出ていた。plan/59)
      <div className="relative h-10 w-full">
        <AiOutlineLoading className="absolute h-6 w-6 animate-spin top-0 bottom-0 left-0 right-0 m-auto" />
      </div>
    );
  }, []);

  return (
    <div ref={ref} className={className}>
      {!isLoaded
        ? renderLoading()
        : React.Children.map(
            children,
            (child) => React.isValidElement(child) && child
          )}
    </div>
  );
};

export default LazyComponent;
