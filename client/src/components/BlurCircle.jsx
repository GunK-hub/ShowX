const BlurCircle = ({ top = "auto", left = "auto", right = "auto", bottom = "auto" }) => {
  return (
    <div
      className="
        absolute
        z-0
        h-80 w-80
        rounded-full
        bg-purple-500/40
        blur-[120px]
        pointer-events-none
      "
      style={{ top, left, right, bottom }}
    />
  );
};

export default BlurCircle;
