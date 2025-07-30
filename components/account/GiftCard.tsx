import ToastStore from "@/store/toast";
import { useEffect, useState } from "react";
import { FaCopy, FaCreditCard } from "react-icons/fa";

interface CustomerGiftCards {
  _id: string;
  code: string;
  expiryDate: Date;
  isActive: boolean;
  usedBy?:
    | {
        firstName?: string | null | undefined;
        lastName?: string | null | undefined;
        email?: string | null | undefined;
      }
    | undefined
    | null;
  updatedAt: Date;
}

const GiftCard = () => {
  const [giftCards, setGiftCards] = useState<CustomerGiftCards[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [note, setNote] = useState("");
  const { setToastData } = ToastStore();

  useEffect(() => {
    const fetchAllCards = async () => {
      // const data = await sdk.fetchCustomerGiftCards();
      // if (data.fetchCustomerGiftCards) {
      //   setGiftCards(data.fetchCustomerGiftCards);
      // }
    };
    fetchAllCards();
  }, []);

  const handleCreateCard = async () => {
    const amount =
      selectedAmount !== null ? selectedAmount : Number(customAmount);
    if (amount > 0) {
      try {
        // const res = await sdk.createGiftCard({
        //   input: {
        //     amount: amount,
        //   },
        // });
        // if (res.createGiftCard) {
        //   setToastData({
        //     type: "success",
        //     message: "Gift card created successfully",
        //   });
        //   setActiveTab(1); // Switch to history tab
        //   // Reset form fields
        //   setSelectedAmount(null);
        //   setCustomAmount("");
        //   setFromName("");
        //   setFromEmail("");
        //   setNote("");
        //   // Fetch updated gift cards
        //   const data = await sdk.fetchCustomerGiftCards();
        //   if (data.fetchCustomerGiftCards) {
        //     setGiftCards(data.fetchCustomerGiftCards);
        //   }
        // }
      } catch (error) {
        console.error(error);
        setToastData({ type: "error", message: "Failed to create gift card" });
      }
    }
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastData({ type: "success", message: "Code copied to clipboard" });
  };

  const calculateTotal = () => {
    const subtotal =
      selectedAmount !== null ? selectedAmount : Number(customAmount) || 0;
    const processingFee = subtotal * 0.03; // Assuming 3% processing fee
    return (subtotal + processingFee).toFixed(2);
  };

  return (
    <div className="w-full mt-2 ml-10 rounded-lg px-6 py-8 bg-gray-100 min-h-screen">
      <div className="mx-auto">
        <div className="flex mb-8">
          <button
            onClick={() => setActiveTab(0)}
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === 0
                ? "bg-white text-primary font-semibold"
                : "bg-gray-200 text-gray-700"
            } rounded-tl-lg rounded-tr-lg`}
          >
            Create Gift Card
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === 1
                ? "bg-white text-primary font-semibold"
                : "bg-gray-200 text-gray-700"
            } rounded-tl-lg rounded-tr-lg`}
          >
            My Gift Cards
          </button>
        </div>

        {activeTab === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* <h2 className="text-2xl font-bold mb-6">Create New Gift Card</h2> */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gift Card Amount
                </label>
                <div className="flex flex-wrap gap-2">
                  {[10, 25, 50, 75, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className={`px-4 py-2 rounded-md ${
                        selectedAmount === amount
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="Custom Amount"
                    className="px-4 py-2 rounded-md border border-gray-400"
                  />
                </div>
              </div>
              <div>
                <p className="pb-2 font-semibold text-xl">From</p>
                <label
                  htmlFor="fromName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name
                </label>
                <input
                  id="fromName"
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-2 rounded-md border border-gray-400"
                />
              </div>
              <div>
                <label
                  htmlFor="fromEmail"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="fromEmail"
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="Your Email"
                  className="w-full px-4 py-2 rounded-md border border-gray-400"
                />
              </div>
              <div>
                <label
                  htmlFor="note"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Note
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note"
                  className="w-full px-4 py-2 rounded-md border border-gray-400 resize-none"
                  rows={3}
                />
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    $
                    {(selectedAmount !== null
                      ? selectedAmount
                      : Number(customAmount) || 0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Processing Fee</span>
                  <span>
                    $
                    {(
                      (selectedAmount !== null
                        ? selectedAmount
                        : Number(customAmount) || 0) * 0.03
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mt-2 font-bold">
                  <span>Total</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
              <button
                onClick={handleCreateCard}
                className="w-full bg-primary text-white py-2 px-4 rounded-md transition-colors"
              >
                Pay
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Used By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {giftCards.map((card) => (
                  <tr
                    key={card._id}
                    className={card.isActive ? "" : "opacity-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCreditCard className="text-2xl text-blue-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {card.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          card.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {card.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(card.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.usedBy ? `${card.usedBy.firstName}` : "Not used"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {card.isActive && (
                        <button
                          onClick={() => copyToClipboard(card.code)}
                          className="text-primary focus:outline-none focus:underline"
                        >
                          <FaCopy className="inline mr-1" /> Copy Code
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCard;
