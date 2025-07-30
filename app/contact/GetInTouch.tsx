"use client";

import Button from "@/components/common/Button";
import ToastStore from "@/store/toast";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { sdk } from "@/utils/graphqlClient";
import { fadeIn } from "@/utils/motion";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
// import { fadeIn } from "../../../utils/motion";

interface FormData {
  name: string;
  email: string;
  phone: string;
  enquiryType: string;
  details: string;
}

interface IAddressSectionProps {
  name: string;
  city: string;
  state: string;
  addressLine1: string;
  coords: number[];
  hours: string[];
}

const GetInTouch: React.FC<IAddressSectionProps> = ({
  addressLine1,
  city,
  coords,
  hours,
  name,
  state,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    enquiryType: "",
    details: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const { setToastData } = ToastStore();

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (
      !formData.email.trim() ||
      !/^[\w-\.]+@[\w-\.]+\.[a-z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Valid email is required.";
    }
    if (!formData.phone.trim() || formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }
    if (!formData.enquiryType)
      newErrors.enquiryType = "Please select an enquiry type.";
    if (!formData.details.trim()) newErrors.details = "Details are required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      const response = await sdk.cmsContactUs({
        input: {
          details: formData.details,
          email: formData.email,
          enquiryType: formData.enquiryType,
          name: formData.name,
          phone: formData.phone,
        },
      });

      if (response.cmsContactUs) {
        toast.success(
          "Thank you for your inquiry! Our team will get back as soon as possible!"
        );
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        enquiryType: "",
        details: "",
      });
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      // Only update if length is 10 or less
      setFormData((prev) => ({ ...prev, phone: value }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "phone") return; // Skip phone handling here as it's handled separately
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="">
      <div className="bg-bg2 rounded-[30px] lg:rounded-[60px]">
        <div
          id="contact"
          className="relative w-full flex flex-col items-start justify-center px-6 py-16  overflow-hidden max-w-7xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-secondary text-bg1 text-start mb-8">
            Get in Touch
          </h2>
          <form
            className="w-full font-primary text-lg sm:text-xl md:text-2xl space-y-6"
            onSubmit={handleSubmit}
          >
            {/* Name and Email */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-lg font-semibold mb-1 text-bg1">
                  Name
                </label>
                <input
                  id="getInTouchName"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-3 text-sm rounded-[10px] border-0 focus:ring-0 ${
                    errors.name ? "border-2 border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-lg font-semibold mb-1 text-bg1">
                  Email Address
                </label>
                <input
                  id="getInTouchEmail"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-3 text-sm rounded-[10px] border-0 focus:ring-0 ${
                    errors.email ? "border-2 border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Phone and Enquiry Type */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-lg font-semibold mb-1 text-bg1">
                  Phone Number
                </label>
                <input
                  id="getInTouchPhone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  className={`w-full p-3 text-sm rounded-[10px] border-0 focus:ring-0 ${
                    errors.phone ? "border-2 border-red-500" : ""
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-lg font-semibold mb-1 text-bg1">
                  Enquiry Type
                </label>
                <select
                  id="getInTouchType"
                  name="enquiryType"
                  value={formData.enquiryType}
                  onChange={handleChange}
                  className={`w-full p-3 text-sm rounded-[10px] border-0 focus:ring-0 ${
                    errors.enquiryType ? "border-2 border-red-500" : ""
                  }`}
                >
                  <option value="" disabled>
                    Select Enquiry Type
                  </option>
                  <option value="general">General</option>
                  <option value="support">Support</option>
                  <option value="business">Business</option>
                </select>
                {errors.enquiryType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.enquiryType}
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="block text-lg font-semibold mb-1 text-bg1">
                Details
              </label>
              <textarea
                id="getInTouchDetails"
                name="details"
                value={formData.details}
                onChange={handleChange}
                minLength={10}
                maxLength={120}
                className={`w-full p-3 text-sm rounded-[10px] border-0 focus:ring-0 ${
                  errors.details ? "border-2 border-red-500" : ""
                } h-32 resize-none`}
              ></textarea>
              <p className="text-sm mt-1 text-right text-bg1">
                {formData.details.length}/120 characters
              </p>
              {errors.details && (
                <p className="text-red-500 text-sm mt-1">{errors.details}</p>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-primaryColor shadow-sm border-2 border-white uppercase xsm:w-[400px] w-[200px] font-primary text-xl sm:text-2xl text-bg3 py-2 px-2 rounded-[10px] mt-4 disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      <motion.div
        variants={fadeIn("right", "tween", 0.2, 1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        id="location"
        className="w-full flex flex-col items-center justify-center px-6 py-12 overflow-hidden max-w-7xl mx-auto"
      >
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-secondary text-bg1 text-center mb-8">
          Visit Us
        </h2>
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-8 lg:gap-12 pt-10">
          <div className="border rounded-lg border-t w-full lg:w-1/2 h-[300px] sm:h-[400px] lg:h-[430px]">
            <iframe
              title={name}
              src={`https://maps.google.com/maps?q=${coords[0]}, ${coords[1]}&z=15&output=embed`}
              className="w-full h-full rounded-lg"
            ></iframe>
          </div>
          <div className="flex flex-col items-start  justify-start space-y-8 w-full lg:w-1/2 lg:ml-10">
            <div className="flex flex-col items-start justify-between space-y-2">
              <p className="font-primary text-lg font-semibold text-bg1">
                {city}
              </p>
              <p className="font-primary text-base font-normal text-bg1 text-opacity-80">
                {state}
              </p>
            </div>
            <div className="flex flex-col items-start justify-between space-y-2">
              <p className="font-primary text-lg font-semibold text-bg1">
                Address
              </p>
              <p className="font-primary text-sm font-normal text-bg1 text-opacity-80">
                {addressLine1}
              </p>
            </div>
            <hr className="border-t border-primaryColor opacity-20 w-full" />
            <div className="flex flex-col items-start justify-between space-y-2">
              <p className="font-primary text-base font-semibold text-bg1">
                Hours
              </p>
              {hours.map((hrs, index) => (
                <p
                  key={index.toString()}
                  className="font-primary text-sm font-normal text-bg1 text-opacity-80"
                >
                  {hrs}
                </p>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GetInTouch;
