import RegistrationFormSkeleton from "@/components/registration/registration-form-skeleton";

export default function Loading() {
  return (
    <RegistrationFormSkeleton
      stepCount={3}
      titleWidthClassName="w-[34rem] max-w-full"
      descriptionWidthClassName="w-[32rem] max-w-full"
    />
  );
}
