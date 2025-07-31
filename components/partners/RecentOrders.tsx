import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useCartStore } from "@/store/cart";
import meCustomerStore from "@/store/meCustomer";
import ToastStore from "@/store/toast";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  qty: number;
  itemPrice: number;
  itemId: {
    name: string;
    desc: string;
  };
  modifierGroups: {
    selectedModifiers: {
      modifierName: string;
      modifierPrice: number;
      qty: number;
    }[];
  }[];
}

const RecentOrders = () => {
  // Stores
  const { setToastData } = ToastStore();
  const router = useRouter();
  const { meCustomerData } = meCustomerStore();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<Record<string, boolean>>(
    {}
  );
  const [modalLoading, setModalLoading] = useState(false);
  const [itemsPerSlide, setItemsPerSlide] = useState(1);
  const { setSpecialRemarks } = useCartStore();

  // Determine items per slide based on screen size
  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(window.innerWidth < 768 ? 1 : 3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Group orders into slides
  const slides = Array.from(
    { length: Math.ceil(recentOrders.length / itemsPerSlide) },
    (_, i) => recentOrders.slice(i * itemsPerSlide, (i + 1) * itemsPerSlide)
  );

  // Determine if nav dots should be visible
  const showNavDots = () => {
    if (itemsPerSlide === 3) {
      return recentOrders.length > 3;
    } else {
      return recentOrders.length > 1;
    }
  };

  // Track current slide
  useEffect(() => {
    if (!carouselApi) return;
    setCurrent(carouselApi.selectedScrollSnap());
    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Fetch recent orders
  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!meCustomerData) return;

      try {
        const response = await sdk.fetchCustomerOrders({
          lastThreeOrders: true,
        });
        setRecentOrders(response.fetchCustomerOrders || []);
      } catch (error) {
        console.error("Failed to fetch recent orders:", error);
      }
    };

    fetchRecentOrders();
  }, [meCustomerData]);

  const reOrder = async (orderId: string) => {
    try {
      setModalLoading(true);
      setLoadingOrders((prev) => ({ ...prev, [orderId]: true }));

      const res = await fetchWithAuth(() =>
        sdk.reorderItemsToCart({ orderId: orderId })
      );

      if (res.reorderItemsToCart?.success) {
        if (res.reorderItemsToCart?.specialMessage) {
          setSpecialRemarks(res.reorderItemsToCart.specialMessage);
        }
        setToastData({
          type: "success",
          message: "Successfully added items to cart",
        });
        router.push("/menu/cart");
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setModalLoading(false);
      setLoadingOrders((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getItemsPreview = (items: OrderItem[], maxItems: number = 3) => {
    const itemNames = items.slice(0, maxItems).map((item) => item.itemId.name);
    if (items.length > maxItems) {
      return `${itemNames.join(", ")} +${items.length - maxItems} more`;
    }
    return itemNames.join(", ");
  };

  if (!meCustomerData || recentOrders.length === 0) {
    return null;
  }

  return (
    <div className="font-online-ordering z-40">
      <h2 className="text-xl sm:text-3xl font-bold mb-4 font-online-ordering">
        Recent Orders
      </h2>
      <div className="my-2">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "start",
            loop: false,
            skipSnaps: false,
            dragFree: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {slides.map((slide, slideIndex) => (
              <CarouselItem key={slideIndex} className="pl-4 basis-full">
                <div className="flex gap-4 h-full">
                  {slide.map((order, index) => (
                    <div
                      key={order._id}
                      className={`w-full ${
                        itemsPerSlide === 3 ? "md:w-1/3" : ""
                      }`}
                    >
                      <div className="bg-white border transition-all duration-300 w-full min-h-44 shrink-0 rounded-[20px]">
                        <div className="p-3 md:p-4 h-full flex flex-col">
                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-600 font-online-ordering">
                                Order #{order.orderId}
                              </p>
                              <p className="text-sm text-gray-500 font-online-ordering">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>

                            <div className="mb-2">
                              <p className="text-lg font-bold text-gray-900 font-online-ordering">
                                ${order.totalAmount.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-600 capitalize font-online-ordering">
                                {order.orderType.toLowerCase()} •{" "}
                                {order.items.reduce(
                                  (total: any, item: any) => total + item.qty,
                                  0
                                )}{" "}
                                items
                              </p>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm text-gray-700 line-clamp-2 font-online-ordering">
                                {getItemsPreview(order.items)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end h-8">
                            {order.totalAmount > 0 && (
                              <button
                                onClick={() => reOrder(order._id)}
                                disabled={
                                  loadingOrders[order._id] || modalLoading
                                }
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors rounded-full bg-white text-primary border border-primary disabled:opacity-50 disabled:bg-gray-300"
                              >
                                {loadingOrders[order._id] ? (
                                  <div className="text-black flex items-center">
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    <p>Adding...</p>
                                  </div>
                                ) : (
                                  <p className="text-black">Reorder</p>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation dots */}
          {showNavDots() && (
            <div className="flex gap-4 mt-4 justify-center">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    carouselApi?.scrollTo(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    current === index ? "bg-primary w-4" : "bg-gray-400 w-2"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </Carousel>
      </div>
    </div>
  );
};

export default RecentOrders;
