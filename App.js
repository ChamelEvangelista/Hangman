import React from "react";
import { View } from "react-native";
import PlayerButton from "./PlayerButton";
import AdminDashboard from "./AdminDashboard";

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <PlayerButton />
      {/* You can comment this out if you only want to test one at a time */}
      {/* <AdminDashboard /> */}
    </View>
  );
}