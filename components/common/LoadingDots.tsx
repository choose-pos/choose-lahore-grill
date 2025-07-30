const LoadingDots = () => {
  return (
    <div className="flex justify-center items-center space-x-2">
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

export default LoadingDots;
