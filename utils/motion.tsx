export const fadeIn = (
  direction: "left" | "right" | "up" | "down",
  type: string,
  delay: number,
  duration: number,
  rotate: number = 0
): { [key: string]: any } => ({
  hidden: {
    x: direction === "left" ? 200 : direction === "right" ? -200 : 0,
    y: direction === "up" ? 200 : direction === "down" ? -200 : 0,
    opacity: 0,
    rotate: rotate, // Apply rotation in hidden state

    transition: {
      type,
      delay,
      duration,
      ease: "easeOut",
    },
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,

    rotate: 0, // Reset rotation in the show state
    transition: {
      type,
      delay,
      duration,
      ease: "easeOut",
    },
  },
  exit: {
    x: 0,
    y: direction === "up" ? -100 : 0,
    opacity: 0,
    rotate: 0, // Reset rotation on exit
    transition: {
      type,
      delay,
      duration,
      ease: "easeOut",
    },
  },
});
