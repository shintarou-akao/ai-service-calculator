"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { ServiceSelection } from "@/types";

type State = {
  selectedServices: ServiceSelection[];
};

type Action =
  | { type: "SET_SELECTED_SERVICES"; payload: ServiceSelection[] }
  | { type: "UPDATE_SERVICE"; payload: ServiceSelection }
  | { type: "ADD_SERVICE"; payload: ServiceSelection }
  | { type: "REMOVE_SERVICE"; payload: string };

const initialState: State = {
  selectedServices: [],
};

export const ServiceSelectionContext = createContext<
  { state: State; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

function serviceSelectionReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SELECTED_SERVICES":
      return { ...state, selectedServices: action.payload };
    case "UPDATE_SERVICE":
      return {
        ...state,
        selectedServices: state.selectedServices.map((service) =>
          service.service.id === action.payload.service.id
            ? action.payload
            : service
        ),
      };
    case "ADD_SERVICE":
      return {
        ...state,
        selectedServices: [...state.selectedServices, action.payload],
      };
    case "REMOVE_SERVICE":
      return {
        ...state,
        selectedServices: state.selectedServices.filter(
          (service) => service.service.id !== action.payload
        ),
      };
    default:
      return state;
  }
}

export function ServiceSelectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(serviceSelectionReducer, initialState);

  return (
    <ServiceSelectionContext.Provider value={{ state, dispatch }}>
      {children}
    </ServiceSelectionContext.Provider>
  );
}

export function useServiceSelection() {
  const context = useContext(ServiceSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useServiceSelection must be used within a ServiceSelectionProvider"
    );
  }
  return context;
}
