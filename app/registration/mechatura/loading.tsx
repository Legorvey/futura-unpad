import RegistrationFormSkeleton from "@/components/registration/registration-form-skeleton";

export default function Loading() {
  return (
    <RegistrationFormSkeleton
      stepCount={4}
      titleWidthClassName="w-[28rem] max-w-full"
      descriptionWidthClassName="w-[31rem] max-w-full"
    />
  );
}
