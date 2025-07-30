import Image from "next/image";
import InActive from "../../assets/InActive.png";

const InActiveMenu = () => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 font-online-ordering">
      <div className="rounded-lg  p-8 text-center flex flex-col items-center justify-center">
        <div className="mb-6 max-w-28 max-h-28 flex items-center justify-center">
          <Image
            src={InActive}
            alt="inactive"
            className="h-full w-full object-cover"
          />
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
          We&apos;ll be right back!
        </h1>

        <div className="space-y-4 text-xl md:text-2xl">
          <div className="flex items-center justify-center space-x-3 text-primary">
            <span>
              Online ordering is temporarily paused. <br /> Please check back
              soon!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InActiveMenu;
