import { useEffect, useState } from "react";

export function ThiefAnimation() {
  const [pos, setPos] = useState(-40);

  useEffect(() => {
    let frame: number;
    let current = -40;
    const speed = 0.8;

    const animate = () => {
      current += speed;
      if (current > window.innerWidth + 40) {
        current = -40;
      }
      setPos(current);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-10"
      style={{ left: `${pos}px` }}
    >
      {/* Thief character */}
      <div className="relative thief-runner">
        {/* Money bag bouncing behind */}
        <span className="absolute -right-3 -top-1 text-sm thief-bag">💰</span>
        {/* Running thief */}
        <span className="text-xl">🏃‍♂️</span>
        {/* Footprint trail */}
        <span className="absolute -left-5 bottom-0 text-[10px] opacity-40 thief-trail">👣</span>
        <span className="absolute -left-10 bottom-0 text-[8px] opacity-20 thief-trail-2">👣</span>
      </div>
    </div>
  );
}
