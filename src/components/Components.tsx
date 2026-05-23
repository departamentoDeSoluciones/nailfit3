import React, { useEffect } from "react";
import { TopBar } from "./ui/TopBar";
import { MainUI } from "./MainUI";
import { ResultsView, useMockMedidas } from "./ResultsView";
export const Components = () => {
  const { mockMedidas, testData } = useMockMedidas();

  useEffect(() => {
    testData();
  }, []);

  return (
    <div>
      <TopBar />
      <MainUI />
      <ResultsView medidas={mockMedidas} />
    </div>
  );
};
