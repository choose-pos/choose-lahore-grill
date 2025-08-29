import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { DateTimePicker } from "../ui/form-date-picker";
import { getYear, isAfter, isBefore } from "date-fns";
import { isValidPhoneNumber } from "libphonenumber-js";

interface FormErrors {
  firstname?: string;
  lastname?: string;
  phonenumber?: string;
  email?: string;
  eventDate?: string;
  eventTime?: string;
  noofpeople?: string;
  occasion?: string;
  budgetPerPerson?: string;
}

const PartyForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const thankYouRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phonenumber: "",
    email: "",
    noofpeople: "",
    management_message: "",
    occasion: "",
    budgetPerPerson: "",
  });
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState<Date | undefined>(undefined);

  // Errors State
  const [errors, setErrors] = useState<FormErrors>({});

  // Occasion options
  const occasionOptions = [
    "Anniversary",
    "Baby Shower",
    "Bachelor Party",
    "Bachelorette Party",
    "Bar Mitzvah",
    "Birthday",
    "Bridal Shower",
    "Family Reunion",
    "Graduation",
    "Wedding",
    "Holiday Party",
    "Retirement",
    "Quinceañera",
    "Rehearsal Dinner",
    "Repast/Memorial Service Reception",
    "Business/Office/Corporate Function",
    "Other",
  ];

  // Scroll to thank you section
  useEffect(() => {
    if (isSubmitted && thankYouRef.current) {
      const navbarHeight = 180;
      const yOffset = -navbarHeight - 20;
      const y =
        thankYouRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [isSubmitted]);

  // Generic input change handler
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstname || formData.firstname.trim().length < 2) {
      newErrors.firstname = "First name must be at least 2 characters long";
    }

    // Last Name validation
    if (!formData.lastname || formData.lastname.trim().length < 2) {
      newErrors.lastname = "Last name must be at least 2 characters long";
    }

    // Phone Number validation
    if (
      !formData.phonenumber ||
      !isValidPhoneNumber(formData.phonenumber, "US")
    ) {
      newErrors.phonenumber = "Please enter a valid US phone number";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Event Date validation
    const selectedDate = eventDate ? new Date(eventDate) : null;
    if (!selectedDate || isBefore(selectedDate, new Date())) {
      newErrors.eventDate = "Event date must be in the future";
    }

    // Number of People validation
    const peopleCount = parseInt(formData.noofpeople, 10);
    if (isNaN(peopleCount)) {
      newErrors.noofpeople = "Number of people is required";
    }

    // Occasion validation
    if (!formData.occasion || formData.occasion.trim().length === 0) {
      newErrors.occasion = "Please select an occasion";
    }

    // Budget Per Person validation
    if (
      !formData.budgetPerPerson ||
      formData.budgetPerPerson.trim().length === 0
    ) {
      newErrors.budgetPerPerson = "of hours required";
    } else {
      const budget = parseFloat(formData.budgetPerPerson);
      if (isNaN(budget) || budget <= 0) {
        newErrors.budgetPerPerson = "Please enter a valid of hours";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      console.log(errors);
      return;
    }

    setIsLoading(true);
    try {
      const submissionData = {
        ...formData,
        eventdate: new Date(eventDate).toISOString().split("T")[0], // Extract just the date
        pickuptime: new Date(eventDate).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };

      const res = await fetch("/api/party-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        setIsSubmitted(true);
        toast.success(
          "Thank you for submitting your query, our catering specialist will get in touch with you shortly."
        );
      } else {
        toast.error("Something went wrong, please try again later!");
      }
    } catch (e) {
      toast.error("Something went wrong, please try again later!");
    } finally {
      setIsLoading(false);
    }
  };

  // Render form or thank you message
  return (
    <div className="px-6 sm:px-12 md:px-16 lg:px-24 py-10 lg:py-20 bg-bg2 rounded-[30px] lg:rounded-[60px]">
      {isSubmitted ? (
        <div ref={thankYouRef} className="text-center">
          <h2 className="font-secondary text-4xl lg:text-[60px] xl:text-[90px] mb-6 text-bg1">
            Thank You!
          </h2>
          <p className="text-xl font-primary text-bg1 mb-8 max-w-4xl mt-4 mx-auto">
            We&apos;ve received your party inquiry and appreciate your interest.
            Our team will review your request and get back to you shortly.
          </p>
          <p className="text-lg font-primary text-bg1">
            If you have any immediate questions, please don&apos;t hesitate to
            contact us directly.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-y-6 max-w-6xl mx-auto"
        >
          <p className="text-center font-secondary text-4xl lg:text-[60px] xl:text-[90px] mb-5 lg:mb-20 text-bg1">
            Banquet Hall Inquiry
          </p>

          {/* Name Fields */}
          <div className="flex flex-col sm:flex-row gap-x-4 gap-y-4">
            <div className="flex-1">
              <label className="block text-lg font-semibold mb-1 text-bg1 font-primary">
                First Name
              </label>
              <input
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-[10px] border-0 focus:ring-0 ${
                  errors.firstname ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.firstname && (
                <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-lg font-semibold mb-1 text-bg1 font-primary">
                Last Name
              </label>
              <input
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-[10px] border-0 focus:ring-0 ${
                  errors.lastname ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.lastname && (
                <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>
              )}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="flex flex-col sm:flex-row gap-x-4 gap-y-4">
            <div className="flex-1">
              <label className="block text-lg font-semibold mb-1 text-bg1 font-primary">
                Phone Number
              </label>
              <input
                name="phonenumber"
                maxLength={10}
                value={formData.phonenumber}
                className={`w-full p-3 rounded-[10px] border-0 focus:ring-0 ${
                  errors.phonenumber ? "border-2 border-red-500" : ""
                }`}
                onChange={handleInputChange}
              />
              {errors.phonenumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phonenumber}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-lg font-semibold mb-1 text-bg1 font-primary">
                Email ID
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-[10px] border-0 focus:ring-0 ${
                  errors.email ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-lg font-semibold mb-1 text-bg1 font-primary">
              Event Date
            </label>
            <DateTimePicker
              selectedDate={eventDate.length === 0 ? null : new Date(eventDate)}
              setDateFn={(date) => {
                setEventDate(date.toISOString());
                // Clear date error when a valid date is selected
                if (errors.eventDate) {
                  setErrors((prev) => ({ ...prev, eventDate: undefined }));
                }
              }}
            />

            {errors.eventDate && (
              <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>
            )}
          </div>

          {/* Occasion and Budget Fields */}
          <div className="flex flex-col sm:flex-row gap-x-4 gap-y-4">
            <div className="flex-1">
              <label className="block text-lg font-semibold mb-1 text-bg1 font-primary">
                Select Occasion
              </label>
              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-[10px] border-0 focus:ring-0 ${
                  errors.occasion ? "border-2 border-red-500" : ""
                }`}
              >
                <option value="">Please select an occasion</option>
                {occasionOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.occasion && (
                <p className="text-red-500 text-sm mt-1">{errors.occasion}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-lg font-semibold mb-1 text-bg1 font-primary">
                Duration (In hours)
              </label>
              <input
                name="budgetPerPerson"
                type="number"
                min="0"
                step="0.01"
                maxLength={10}
                value={formData.budgetPerPerson}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-[10px] border-0 focus:ring-0 ${
                  errors.budgetPerPerson ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.budgetPerPerson && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.budgetPerPerson}
                </p>
              )}
            </div>
          </div>

          {/* Event Time */}
          {/* <div>
            <label className="block text-lg font-semibold mb-1 text-bg1 font-primary">
              Pickup/Delivery Time
            </label>
            <TimePicker
              setDate={(date: Date | undefined) => {
                setEventTime(date);
                // Clear time error when a time is selected
                if (errors.eventTime) {
                  setErrors((prev) => ({ ...prev, eventTime: undefined }));
                }
              }}
              date={eventTime}
            />
            {errors.eventTime && (
              <p className="text-red-500 text-sm mt-1">{errors.eventTime}</p>
            )}
          </div> */}

          {/* Number of People */}
          <div>
            <label className="block text-lg font-semibold mb-1 text-bg1 font-primary">
              No. of People
            </label>
            <input
              name="noofpeople"
              type="number"
              value={formData.noofpeople}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-[10px] border-0 focus:ring-0 ${
                errors.noofpeople ? "border-2 border-red-500" : ""
              }`}
            />
            {errors.noofpeople && (
              <p className="text-red-500 text-sm mt-1">{errors.noofpeople}</p>
            )}
          </div>

          {/* Management Message */}
          <div>
            <label className="block text-lg font-semibold mb-1 text-bg1 font-primary">
              Message to Management
            </label>
            <textarea
              name="management_message"
              rows={4}
              value={formData.management_message}
              onChange={handleInputChange}
              className="w-full p-3 rounded-[10px] border-0 focus:ring-0"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primaryColor shadow-sm border-2 border-white uppercase xsm:w-[400px] w-[200px] font-primary text-xl sm:text-2xl text-bg3 py-2 px-2 rounded-[10px] mt-10 self-center disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

export default PartyForm;
