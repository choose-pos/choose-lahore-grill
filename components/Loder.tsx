const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50 z-[1000] h-screen w-screen space-x-2">
      <span className="sr-only">Loading...</span>
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full bg-primary animate-bounce-flash opacity-40`}
          style={{
            animationDelay: `${index * 0.3}s`,
            animationDuration: "1.2s",
          }}
        ></div>
      ))}
    </div>
  );
};

export default FullScreenLoader;
