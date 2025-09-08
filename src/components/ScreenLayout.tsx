import React, { ReactNode } from "react";
import { View, StyleSheet, Image, SafeAreaView } from "react-native";

type Props = {
  children: ReactNode;
};


export default function ScreenLayout({ children }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background logo (non-interactive) */}
      <View pointerEvents="none" style={styles.logoWrap}>
        <Image
          source={require("../assets/2cm-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Your screen content */}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  content: { flex: 1, padding: 16 },
  logoWrap: {
    position: "absolute",
    top: 96,
    left: 0,
    right: 0,
    alignItems: "center",
    opacity: 0.06,
  },
  logo: { width: 260, height: 260 },
});
