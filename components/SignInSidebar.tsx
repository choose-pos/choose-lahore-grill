import { Env } from "@/env";
import {
  AccountPreference,
  CustomerSignupInput,
  CustomerSignupVerificationInput,
} from "@/generated/graphql";
import meCustomerStore from "@/store/meCustomer";
import RestaurantStore from "@/store/restaurant";
import { useSidebarStore } from "@/store/sidebar";
import ToastStore from "@/store/toast";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { getOrCreateUserHash } from "@/utils/analytics";
import { getMeCustomer } from "@/utils/getMeCustomer";
import { sdk } from "@/utils/graphqlClient";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { getYear } from "date-fns";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IoArrowBack, IoClose } from "react-icons/io5";
import { DatePicker } from "./ui/date-picker";

interface SignInSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  openSignUp?: boolean;
}

const SignInSidebar: React.FC<SignInSidebarProps> = ({
  isOpen,
  onClose,
  restaurantName,
  openSignUp,
}) => {
  const { restaurantData } = RestaurantStore();
  // const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showOtpPage, setShowOtpPage] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [signInOtpId, setSignInOtpId] = useState<boolean | null>(null);
  const [signUpOtpId, setSignUpOtpId] = useState<boolean | null>(null);
  const [accountPreference, setAccountPrefrence] = useState<AccountPreference>({
    email: true,
    sms: true,
  });
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [isResendClicked, setIsResendClicked] = useState<boolean>(false);
  const [programName, setProgramName] = useState<string | null>(null);
  const { setToastData } = ToastStore();
  const { setMeCustomerData } = meCustomerStore();
  const { setIsSignUpOpen, isSignUpOpen } = useSidebarStore();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-y-hidden");
    } else {
      document.body.classList.remove("overflow-y-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-y-hidden");
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const res = await sdk.fetchLoyaltyCustomerRules(
          {},
          { Authorization: Env.NEXT_PUBLIC_RESTAURANT_ID }
        );
        if (res.fetchLoyaltyCustomerRules) {
          const rules = res.fetchLoyaltyCustomerRules;
          if (rules.onOrderRewardActive) {
            setProgramName(rules.programName);
          }
        }
      } catch (error) {
        console.error("Error fetching loyalty rules:", error);
      }
    };

    fetchPoints();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value.slice(0, 10));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setOtp(value.slice(0, 6));
  };

  // const validateDOB = (dateString: string): boolean => {
  //   const today = new Date();
  //   const birthDate = new Date(dateString);

  //   // Check if age is more than 100 years
  //   let age = today.getFullYear() - birthDate.getFullYear();
  //   const monthDiff = today.getMonth() - birthDate.getMonth();

  //   if (
  //     monthDiff < 0 ||
  //     (monthDiff === 0 && today.getDate() < birthDate.getDate())
  //   ) {
  //     age--;
  //   }

  //   // Check if age is more than 100
  //   if (age > 100) {
  //     setErrors({ dob: "Age cannot be more than 100 years" });
  //     return false;
  //   }

  //   // Check if age is at least 13
  //   if (age < 13) {
  //     setErrors({ dob: "You must be at least 13 years old to sign up." });
  //     return false;
  //   }

  //   return true;
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (dob.length === 0) {
      setErrors({ dob: "Please select your date of birth." });
      return;
    }

    try {
      if (isSignUpOpen) {
        const accountPreferences: AccountPreference = {
          email: true,
          sms: true,
        };
        setAccountPrefrence(accountPreferences);

        const input: CustomerSignupInput = {
          email,
          firstName,
          lastName,
          phone: phoneNumber,
          dob: dob,
          // dateOfBirth: new Date(dob).toISOString(),
          accountPreferences,
        };

        const data = await sdk.customerSignUp({ input });

        setSignUpOtpId(data.customerSignUp);
        setIsResendClicked(false); // Reset to email verification for new signup
        setResendTimer(0);
        if (data.customerSignUp) {
          setToastData({
            type: "success",
            message: "OTP has been sent!",
          });
        }
      }

      setShowOtpPage(true);
    } catch (error) {
      console.error("API call failed:", error);
      setErrors({ api: "An error occurred. Please try again." });
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    }
  };

  const resetInputs = () => {
    setPhoneNumber("");
    setEmail("");
    setFirstName("");
    setLastName("");
    setDob("");
    setOtp("");
    setSignInOtpId(null);
    setSignUpOtpId(null);
    setAccountPrefrence({ email: true, sms: true });
    setIsSignUpOpen(false);
    setShowOtpPage(false);
    setIsResendClicked(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const userHash = getOrCreateUserHash();

    try {
      if (signUpOtpId) {
        const input: CustomerSignupVerificationInput = {
          otp: otp,
          email,
          firstName,
          lastName,
          phone: phoneNumber,
          dob: new Date(dob).toISOString(),
          // dateOfBirth: new Date(dob).toISOString(),
          accountPreferences: accountPreference,
          visitorHash: userHash,
          sendSms: isResendClicked,
        };

        const data = await sdk.customerSignUpVerification({ input });
        setShowOtpPage(false);
        resetInputs();
        onClose();
        if (data.customerSignUpVerification) {
          setToastData({
            type: "success",
            message: "Signed up Successfully",
          });
          const res = await getMeCustomer();
          if (res) {
            setMeCustomerData(res);
          }
          // setTimeout(() => {
          //   location.reload();
          // }, 200);
        }
      } else if (signInOtpId) {
        const data = await sdk.customerLoginVerification({
          contact: phoneNumber,
          otp: otp,
        });
        setShowOtpPage(false);
        onClose();
        resetInputs();
        if (data.customerLoginVerification) {
          setToastData({
            type: "success",
            message: "Signed in Successfully",
          });
          setTimeout(() => {
            location.reload();
          }, 200);
        }
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setErrors({ otp: "Invalid OTP. Please try again." });
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    }
  };

  const handleBack = () => {
    setShowOtpPage(false);
    setOtp("");
    setIsResendClicked(false); // Reset resend state when going back
    setResendTimer(0);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsResendClicked(true);
    setResendTimer(30);
    try {
      if (isSignUpOpen && signUpOtpId) {
        const data = await sdk.customerSignUp({
          input: {
            email,
            firstName,
            lastName,
            phone: phoneNumber,
            dob: new Date(dob).toISOString(),
            accountPreferences: accountPreference,
            sendSms: true,
          },
        });
        setSignUpOtpId(data.customerSignUp);
        setToastData({
          type: "success",
          message: "OTP has been sent to your number",
        });
      } else if (!isSignUpOpen && signInOtpId) {
        const data = await sdk.customerLogin({
          input: phoneNumber,
        });
        setSignInOtpId(data.customerLogin);
        setToastData({
          type: "success",
          message: "OTP has been resent.",
        });
      }
    } catch (error) {
      console.error("Resend OTP failed:", error);
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    }
  };

  const renderSignUpForm = () => (
    <form onSubmit={handleSubmit} className="font-online-ordering">
      <h2 className="text-2xl font-bold mb-4 font-online-ordering">
        Sign up and start earning {programName}!
      </h2>
      <hr />
      <div className="space-y-4 mt-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              required
              type="text"
              id="firstName"
              className={`mt-1 block w-full border ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              } rounded-full shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Alex"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              required
              type="text"
              id="lastName"
              className={`mt-1 block w-full border ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              } rounded-full shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="D"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone
          </label>
          <input
            required
            minLength={10}
            type="tel"
            id="phone"
            className={`mt-1 block w-full border ${
              errors.phone ? "border-red-500" : "border-gray-300"
            } rounded-full shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary`}
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="800-555-0175"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            required
            type="email"
            id="email"
            className={`mt-1 block w-full border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-full shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="dob"
            className="block text-sm font-medium text-gray-700"
          >
            Date of Birth
          </label>
          <DatePicker
            selectedDate={dob.length === 0 ? null : new Date(dob)}
            setDateFn={(date) => setDob(date.toISOString())}
            endYear={getYear(new Date()) - 18}
          />
          {errors.dob && (
            <p className="mt-1 text-sm text-red-500">{errors.dob}</p>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {`By signing up, you agree to receive promotional and transactional emails and SMS from ${restaurantData?.name} and our technology partner Choose, and consent to our`}{" "}
          <Link
            href={"https://www.choosepos.com/terms-conditions"}
            passHref
            className="inline-block"
          >
            <span className="underline font-semibold">{`Platform Terms`}</span>
          </Link>{" "}
          {`and`}{" "}
          <Link
            href={"https://www.choosepos.com/privacy-policy"}
            passHref
            className="inline-block"
          >
            <span className="underline font-semibold">{`Privacy Policy`}</span>
          </Link>
          {`. You can opt out of promotional communications at any time from your profile.`}
        </p>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary "
          style={{
            color: isContrastOkay(
              Env.NEXT_PUBLIC_PRIMARY_COLOR,
              Env.NEXT_PUBLIC_BACKGROUND_COLOR
            )
              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
              : Env.NEXT_PUBLIC_TEXT_COLOR,
          }}
        >
          Sign Up
        </button>
        <p className="text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <button
            type="button"
            className="underline"
            onClick={() => {
              setIsSignUpOpen(false);
            }}
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const data = await sdk.customerLogin({ input: phoneNumber });
      setSignInOtpId(data.customerLogin);
      setShowOtpPage(true);
      if (data.customerLogin) {
        setToastData({
          type: "success",
          message: "OTP has been sent.",
        });
      }
    } catch (error) {
      console.error("API call failed:", error);
      setErrors({ api: "An error occurred. Please try again." });
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    }
  };

  const renderSignInForm = () => (
    <form onSubmit={handleSignInSubmit} className="font-online-ordering">
      <h2 className="text-2xl font-bold mb-4 font-online-ordering">
        Sign In to earn {programName}
      </h2>
      <hr />
      <div className="space-y-4 mt-5">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone
          </label>
          <input
            required
            minLength={10}
            type="tel"
            id="phone"
            className={`mt-1 block w-full border ${
              errors.phone ? "border-red-500" : "border-gray-300"
            } rounded-full shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary`}
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="Enter 10 digit number"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary  capitalize font-online-ordering"
          style={{
            color: isContrastOkay(
              Env.NEXT_PUBLIC_PRIMARY_COLOR,
              Env.NEXT_PUBLIC_BACKGROUND_COLOR
            )
              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
              : Env.NEXT_PUBLIC_TEXT_COLOR,
          }}
        >
          Sign In
        </button>
        <p className="text-sm text-gray-600 text-center">
          Don&apos;t have an account yet?{" "}
          <button
            type="button"
            className="underline"
            onClick={() => setIsSignUpOpen(true)}
          >
            Sign Up
          </button>
        </p>
      </div>
    </form>
  );

  const renderOtpForm = () => {
    const isShowingSmsVerification = isResendClicked || !signUpOtpId;

    return (
      <form onSubmit={handleOtpSubmit} className="font-online-ordering">
        <div className="flex items-center mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="text-gray-500 hover:text-gray-700 mr-2"
          >
            <IoArrowBack size={24} />
          </button>
          <h2 className="text-2xl font-bold font-online-ordering">
            {isShowingSmsVerification ? "Verify SMS OTP" : "Verfify Email OTP"}
          </h2>
        </div>
        <hr />
        <div className="space-y-4 mt-5">
          {!isShowingSmsVerification ? (
            <p className="flex items-start text-xs text-gray-400 SMS">
              {`Note: Please check your spam / trash folder if you don't find the verification code in your inbox.`}
            </p>
          ) : null}
          <div>
            <label
              htmlFor="otp"
              className="block text-base font-medium text-gray-700"
            >
              {isShowingSmsVerification
                ? " Enter the code we sent on your SMS"
                : " Enter the code we sent on your mail"}
            </label>
            <input
              type="text"
              id="otp"
              className={`mt-1 block w-full border ${
                errors.otp ? "border-red-500" : "border-gray-300"
              } rounded-full shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary`}
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6 digit OTP"
            />
            {errors.otp && (
              <p className="mt-1 text-sm text-red-500">{errors.otp}</p>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0}
              className={`text-sm transition-colors ${
                resendTimer > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:underline"
              }`}
            >
               {resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : isSignUpOpen
                ? "Not received? Resend on SMS"
                : "Didn't receive the OTP? Resend"}
            </button>
          </div>
          <div className="flex justify-between">
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-full font-online-ordering capitalize hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              style={{
                color: isContrastOkay(
                  Env.NEXT_PUBLIC_PRIMARY_COLOR,
                  Env.NEXT_PUBLIC_BACKGROUND_COLOR
                )
                  ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                  : Env.NEXT_PUBLIC_TEXT_COLOR,
              }}
            >
              Verify OTP
            </button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            resetInputs();
            setIsSignUpOpen(false);
            setShowOtpPage(false);
            setErrors({});
            onClose();
          }}
        ></div>
      )}
      <div
        className={`fixed inset-y-0 right-0 lg:w-1/3 md:w-[60%] w-full bg-white shadow-lg transform z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => {
                resetInputs();
                setShowOtpPage(false);
                setIsSignUpOpen(false);
                setErrors({});
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <IoClose size={24} />
            </button>
          </div>
          {showOtpPage
            ? renderOtpForm()
            : isSignUpOpen || openSignUp
              ? renderSignUpForm()
              : renderSignInForm()}
        </div>
      </div>
    </>
  );
};

export default SignInSidebar;
