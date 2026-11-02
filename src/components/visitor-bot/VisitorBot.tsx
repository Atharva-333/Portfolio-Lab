import { useState, useEffect, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionValue,
} from "framer-motion";
import { X } from "lucide-react";
import { RobotModel } from "./RobotModel";
import { RobotBehaviour } from "./RobotBehaviour";

export default function VisitorBot() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState<string | null>(null);

  const mouseX = useMotionValue(
    typeof window !== "undefined" ? window.innerWidth - 150 : 0,
  );
  const mouseY = useMotionValue(
    typeof window !== "undefined" ? window.innerHeight - 150 : 0,
  );

  const springX = useSpring(mouseX, { stiffness: 60, damping: 15, mass: 0.8 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 15, mass: 0.8 });

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSectionRef = useRef<string>("");

  const behaviourRef = useRef<RobotBehaviour | null>(null);
  if (!behaviourRef.current) {
    behaviourRef.current = new RobotBehaviour((state, msg) => {
      if (msg) setBubbleMessage(msg);
      else setBubbleMessage(null);
    });
  }

  // 1. Clear message after 5 seconds
  useEffect(() => {
    if (!bubbleMessage) return;
    const timer = setTimeout(() => setBubbleMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [bubbleMessage]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // 2. Mouse tracking & 10s Inactivity
  useEffect(() => {
    if (isDismissed) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        idleTimerRef.current = setTimeout(() => {
          mouseX.set(window.innerWidth - 100);
          mouseY.set(window.innerHeight - 100);
          behaviourRef.current?.handleMouseMove(0, 0);
        }, 10000);

        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = -(e.clientY / window.innerHeight) * 2 + 1;
        behaviourRef.current?.handleMouseMove(nx, ny);

        const offsetX = e.clientX > window.innerWidth - 150 ? -80 : 60;
        const offsetY = e.clientY > window.innerHeight - 150 ? -80 : 60;

        mouseX.set(e.clientX - offsetX);
        mouseY.set(e.clientY - offsetY);
      });
    };

    const handleClick = () => behaviourRef.current?.handleClick();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleClick);

    idleTimerRef.current = setTimeout(() => {
      mouseX.set(window.innerWidth - 100);
      mouseY.set(window.innerHeight - 100);
    }, 10000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleClick);
      cancelAnimationFrame(rafId);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isDismissed, mouseX, mouseY]);

  // 3. SCROLL DETECTION (Replaces IntersectionObserver)
  useEffect(() => {
    if (isDismissed) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const checkActiveSection = () => {
      const sections = document.querySelectorAll("section[id]");
      let activeId = "home";
      let maxVisibleHeight = 0;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // Calculate how much of the section is visible in the viewport
        const visibleHeight = Math.max(
          0,
          Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
        );

        if (visibleHeight > maxVisibleHeight) {
          maxVisibleHeight = visibleHeight;
          activeId = section.id;
        }
      });

      // Only trigger if the active section has actually changed
      if (activeId && activeId !== lastSectionRef.current) {
        lastSectionRef.current = activeId;
        behaviourRef.current?.setSection(activeId);
      }
    };

    const handleScroll = () => {
      // Check immediately
      checkActiveSection();

      // Debounce slightly to prevent spamming
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkActiveSection, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check on load
    setTimeout(checkActiveSection, 500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isDismissed]);

  useEffect(() => {
    if (isDismissed) return;
    let frameId: number;
    const tick = () => {
      behaviourRef.current?.update(0, 0);
      frameId = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(frameId);
      behaviourRef.current?.destroy();
    };
  }, [isDismissed]);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (isDismissed || prefersReducedMotion || isMobile) return null;

  return (
    <motion.div
      className="fixed z-[100] pointer-events-none"
      style={{
        x: springX,
        y: springY,
        left: 0,
        top: 0,
        width: "1px",
        height: "1px",
      }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <AnimatePresence>
          {bubbleMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="mb-2 relative max-w-[150px] rounded-2xl rounded-br-sm bg-slate-800/90 p-2.5 text-xs text-center text-slate-200 shadow-xl backdrop-blur-md border border-white/10 pointer-events-auto"
            >
              {bubbleMessage}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 bg-slate-800/90 border-b border-r border-white/10" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative h-30 w-30 pointer-events-auto"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="absolute -right-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/80 text-slate-400 border border-white/10 backdrop-blur-md transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>

          {isVisible && (
            <Canvas
              camera={{ position: [0, 0, 6], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={0.6} />
              <directionalLight
                position={[2, 5, 2]}
                intensity={1.5}
                castShadow
              />
              <Suspense fallback={null}>
                <RobotModel behaviour={behaviourRef.current!} />
                <Environment preset="city" />
                <ContactShadows
                  position={[0, -0.95, 0]}
                  opacity={0.5}
                  scale={3}
                  blur={2}
                  far={4}
                />
              </Suspense>
            </Canvas>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
