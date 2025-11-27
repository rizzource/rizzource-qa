import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Users, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import { format } from "date-fns";

const schedulingSchema = z.object({
  fullName: z.string().min(1, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  dateType: z.enum(["days", "specific"], {
    required_error: "Please select a date option",
  }),
  selectedDays: z.array(z.string()).optional(),
  selectedDates: z.array(z.date()).optional(),
  earliestTime: z.string().min(1, "Please select earliest time"),
  latestTime: z.string().min(1, "Please select latest time"),
  activities: z.array(z.string()).min(1, "Please select at least one activity"),
  mentorOptions: z.array(z.string()).optional(),
  userType: z.enum(["mentor", "mentee"], {
    required_error: "Please select user type",
  }),
});

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

const dayOptions = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const activityOptions = [
  "Networking",
  "Study Session",
  "Mock Interviews",
  "Project Collaboration",
  "Open Discussion",
];

const mentorActionOptions = [
  "Upload an outline",
  "Rate an outline",
  "Do both",
  "I'll just sit back and nod wisely 😏",
];

// helper to normalize "HH:MM" -> "HH:MM:SS"
const toTime = (t) => (t?.length === 5 ? `${t}:00` : (t || "00:00:00"));

const SchedulingForm = ({ onBack, initialUserType }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const form = useForm({
    resolver: zodResolver(schedulingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      dateType: "days",
      selectedDays: [],
      selectedDates: [],
      earliestTime: "09:00",
      latestTime: "17:00",
      activities: [],
      mentorOptions: [],
      userType: initialUserType || "mentee",
    },
  });

  const watchDateType = form.watch("dateType");
  const watchSelectedDays = form.watch("selectedDays");
  const watchSelectedDates = form.watch("selectedDates");
  const watchActivities = form.watch("activities");
  const watchMentorOptions = form.watch("mentorOptions");
  const watchUserType = form.watch("userType");

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Build safe payload: never send nulls to array columns; normalize times.
      const formattedData = {
        full_name: data.fullName,
        email: data.email,
        date_type: data.dateType, // 'days' | 'specific'
        selected_days: data.dateType === "days" ? (data.selectedDays ?? []) : [],
        selected_dates:
          data.dateType === "specific"
            ? (data.selectedDates ?? []).map((d) => format(d, "yyyy-MM-dd"))
            : [],
        earliest_time: toTime(data.earliestTime),
        latest_time: toTime(data.latestTime),
        activities: data.activities ?? [],
        user_type: data.userType, // 'mentor' | 'mentee'
        mentor_options: data.userType === "mentor" ? (data.mentorOptions ?? []) : [],
      };

      // Optional local check mirroring common DB CHECK constraints
      if (formattedData.earliest_time > formattedData.latest_time) {
        toast.error("Earliest time must be before or equal to latest time.");
        setLoading(false);
        return;
      }

      // Perform insert and surface the true DB error (no manual timeout).
      const { data: inserted, error, status } = await supabase
        .from("scheduling_responses")
        .insert([formattedData])
        .select();

      if (error) {
        console.error("Insert failed:", {
          status,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // Friendly messaging for common Postgres errors
        if (error.code === "23505") {
          toast.error("That email is already used. Try a different email.");
        } else if (error.code === "23502") {
          toast.error("A required field is missing.");
        } else if (error.code === "23514") {
          toast.error("Your time/date choices violated a rule.");
        } else {
          toast.error(error.message || "Failed to save your preferences.");
        }
        return;
      }

      toast.success("Your scheduling preferences have been saved.");

      // Navigate to availability scheduler instead of matchup page
      navigate("/availability", {
        state: {
          ...formattedData,
          fullName: data.fullName,
          dateType: data.dateType,
          selectedDays: data.selectedDays,
          selectedDates: data.selectedDates,
          earliestTime: data.earliestTime,
          latestTime: data.latestTime,
          activities: data.activities,
          userType: data.userType,
          mentorOptions: data.mentorOptions || []
        },
      });
    } catch (error) {
      console.error("Submission error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        stack: error.stack,
      });
      toast.error(error.message || "Failed to save your preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    const currentDays = watchSelectedDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    form.setValue("selectedDays", newDays);
  };

  const toggleActivity = (activity) => {
    const currentActivities = watchActivities || [];
    const newActivities = currentActivities.includes(activity)
      ? currentActivities.filter((a) => a !== activity)
      : [...currentActivities, activity];
    form.setValue("activities", newActivities);
  };

  const toggleMentorOption = (option) => {
    const currentOptions = watchMentorOptions || [];
    const newOptions = currentOptions.includes(option)
      ? currentOptions.filter((o) => o !== option)
      : [...currentOptions, option];
    form.setValue("mentorOptions", newOptions);
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1:
        return <Users className="h-8 w-8 text-accent" />;
      case 2:
        return <CalendarIcon className="h-8 w-8 text-accent" />;
      case 3:
        return <Clock className="h-8 w-8 text-accent" />;
      case 4:
        return <GraduationCap className="h-8 w-8 text-accent" />;
      default:
        return <Users className="h-8 w-8 text-accent" />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Personal Information";
      case 2:
        return "Available Dates";
      case 3:
        return "Time Preferences";
      case 4:
        return "Activities & Options";
      default:
        return "Schedule Your Meetup";
    }
  };

  const canProceedToStep2 = form.watch("fullName") && form.watch("email");
  const canProceedToStep3 =
    (watchDateType === "days" && watchSelectedDays?.length > 0) ||
    (watchDateType === "specific" && watchSelectedDates?.length > 0);
  const canProceedToStep4 = form.watch("earliestTime") && form.watch("latestTime");

  return (
    <section className="min-h-screen bg-background flex items-center py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-8 text-foreground hover:bg-muted flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Selection
          </Button>

          <Card className="bg-card backdrop-blur-sm border-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-accent/20 rounded-full w-fit">{getStepIcon()}</div>
              <CardTitle className="text-2xl text-foreground">{getStepTitle()}</CardTitle>
              <CardDescription className="text-muted-foreground">Step {currentStep} of 4</CardDescription>

              {/* Step indicator */}
              <div className="flex justify-center mt-4 space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full ${
                      step <= currentStep ? "bg-accent" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Full Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                              />
                            </FormControl>
                            <FormMessage className="text-accent" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Email Address</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                {...field}
                                className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                              />
                            </FormControl>
                            <FormMessage className="text-accent" />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          disabled={!canProceedToStep2}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Date Selection */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="dateType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">What dates might work?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                                <SelectItem value="days">Days of the Week</SelectItem>
                                <SelectItem value="specific">Specific Dates</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-accent" />
                          </FormItem>
                        )}
                      />

                      {watchDateType === "days" && (
                        <div>
                          <FormLabel className="text-foreground mb-3 block">
                            Select available days
                          </FormLabel>
                          <div className="grid grid-cols-7 gap-2">
                            {dayOptions.map((day) => (
                              <Button
                                key={day.value}
                                type="button"
                                variant={
                                  watchSelectedDays?.includes(day.value) ? "default" : "outline"
                                }
                                className="h-12 text-sm"
                                onClick={() => toggleDay(day.value)}
                              >
                                {day.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {watchDateType === "specific" && (
                        <Controller
                          name="selectedDates"
                          control={form.control}
                          render={({ field }) => (
                            <div>
                              <FormLabel className="text-foreground mb-3 block">
                                Select specific dates
                              </FormLabel>
                              <Calendar
                                mode="multiple"
                                selected={field.value}
                                onSelect={field.onChange}
                                className="rounded-md border border-input bg-card"
                                disabled={(date) => date < new Date()}
                              />
                            </div>
                          )}
                        />
                      )}

                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          disabled={!canProceedToStep3}
                          className="flex-1"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Time Preferences */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-foreground font-medium">What times might work?</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="earliestTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">No earlier than</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                                  {timeOptions.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-accent" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="latestTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">No later than</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                                  {timeOptions.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-accent" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(2)}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setCurrentStep(4)}
                          disabled={!canProceedToStep4}
                          className="flex-1"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Activities & Options */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <FormLabel className="text-foreground mb-3 block">
                          What kind of activity would you like?
                        </FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {activityOptions.map((activity) => (
                            <Button
                              key={activity}
                              type="button"
                              variant={watchActivities?.includes(activity) ? "default" : "outline"}
                              size="sm"
                              className="rounded-full px-4 py-2"
                              onClick={() => toggleActivity(activity)}
                            >
                              {activity}
                            </Button>
                          ))}
                        </div>
                        {form.formState.errors.activities && (
                          <p className="text-sm text-accent mt-2">
                            {form.formState.errors.activities.message}
                          </p>
                        )}
                      </div>

                      {watchUserType === "mentor" && (
                        <div>
                          <FormLabel className="text-foreground mb-3 block">
                            Please select one of the following options:
                          </FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {mentorActionOptions.map((option) => (
                              <Button
                                key={option}
                                type="button"
                                variant={
                                  watchMentorOptions?.includes(option) ? "default" : "outline"
                                }
                                size="sm"
                                className="rounded-full px-4 py-2"
                                onClick={() => toggleMentorOption(option)}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(3)}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading || watchActivities?.length === 0}
                          className="flex-1"
                        >
                          {loading ? "Creating Event..." : "Create Event"}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SchedulingForm;
