import React from "react";
import { View } from "react-native";
import PlayerButton from "./PlayerButton";

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <PlayerButton />
    </View>
  );
}