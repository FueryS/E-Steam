/**
 * EmptyState.jsx
 * Centered illustration + message shown when a list has no data.
 *
 * Image placeholder rule:
 *   Images are NOT imported yet. The box below marks where the image goes.
 *   When ready, replace the placeholder View with:
 *     <Image source={require(UI_IMAGE_PATH + '/' + imageName)} style={styles.image} />
 *
 * Place: empty-habits.png
 */

import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import AppButton from "./AppButton";
import { theme } from "../constants/theme";

// Image assets path — update if folder moves
const UI_IMAGE_PATH = "../assets/uiImg";

export default function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
  imageName,
}) {
  return (
    <View style={styles.container}>
      {/*
        Image placeholder
        Place: {imageName}  (resolved at runtime via prop)
        Place: empty-habits.png  (static reference for the asset pipeline)

        When ready, replace this View with:*/}
      <Image
        source={require(UI_IMAGE_PATH + "/" + "placeholder.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* <View style={styles.imagePlaceholder}>
        <Text style={styles.placeholderLabel}>Image placeholder</Text>
        {imageName ? (
          <Text style={styles.placeholderSub}>{imageName}</Text>
        ) : null}
      </View> */}

      {/* Copy */}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {/* Optional action */}
      {actionLabel && onAction ? (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.md,
  },

  // Placeholder box — remove when real image is dropped in
  imagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  placeholderLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedText,
    fontWeight: theme.fontWeight.medium,
  },
  placeholderSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedText,
    opacity: 0.7,
  },

  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.mutedText,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: theme.spacing.sm,
    minWidth: 160,
  },
});
