import RegistrationFormSkeleton from "@/components/registration/registration-form-skeleton";

export default function Loading() {
  return (
    <RegistrationFormSkeleton
      stepCount={3}
      titleWidthClassName="w-56 max-w-full"
      descriptionWidthClassName="w-[30rem] max-w-full"
    />
  );
}
