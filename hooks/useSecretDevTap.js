/**
 * useSecretDevTap.js
 * Custom hook to handle the hidden developer multi-tap gesture.
 * When the user taps the designated element 5 times within 500ms between taps,
 * triggers a success haptic notification and navigates to the Dev Menu.
 */

import { useRef, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { ROUTES } from "../navigation/AppNavigator";
import {
  DEV_MENU_TRIGGER_TAPS,
  DEV_MENU_TAP_TIMEOUT_MS,
} from "../constants/config";

export function useSecretDevTap(navigation) {
  const tapCount = useRef(0);
  const lastTapTime = useRef(0);

  const handleSecretDevTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTime.current < DEV_MENU_TAP_TIMEOUT_MS) {
      tapCount.current += 1;
    } else {
      tapCount.current = 1;
    }
    lastTapTime.current = now;

    if (tapCount.current >= DEV_MENU_TRIGGER_TAPS) {
      tapCount.current = 0;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate(ROUTES.DEV_MENU);
    }
  }, [navigation]);

  return handleSecretDevTap;
}

export default useSecretDevTap;
