import { useState } from "react";

export function useEssayVerificationEditMode() {
  const [isEditing, setIsEditing] = useState(false);
  const [flashDoneButton, setFlashDoneButton] = useState(false);

  const requestBack = (onBack: () => void) => {
    if (!isEditing) {
      onBack();
      return;
    }

    setFlashDoneButton(true);
    window.setTimeout(() => setFlashDoneButton(false), 500);
  };

  return {
    flashDoneButton,
    isEditing,
    requestBack,
    setIsEditing,
  };
}
