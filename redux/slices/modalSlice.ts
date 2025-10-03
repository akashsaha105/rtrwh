import { createSlice } from "@reduxjs/toolkit";

// Define the initial state using that type
const initialState = {
  loginModalIsOpen: false,
  signupModalIsOpen: false,
  productModalIsOpen: false,
  basicModalIsOpen: false,
  proModalIsOpen: false,
};

const modalSlice = createSlice({
  name: "modal",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.loginModalIsOpen = true;
    },
    closeLoginModal: (state) => {
      state.loginModalIsOpen = false;
    },
    openSignupModal: (state) => {
      state.signupModalIsOpen = true;
    },
    closeSignupModal: (state) => {
      state.signupModalIsOpen = false;
    },
    openProductModal: (state) => {
      state.productModalIsOpen = true;
    },
    closeProductModal: (state) => {
      state.productModalIsOpen = false;
    },
    openBasicModal: (state) => {
      state.basicModalIsOpen = true;
    },
    closeBasicModal: (state) => {
      state.basicModalIsOpen = false;
    },
    openProModal: (state) => {
      state.proModalIsOpen = true;
    },
    closeProModal: (state) => {
      state.proModalIsOpen = false;
    },
  },
});

export const {
  openLoginModal,
  closeLoginModal,
  openSignupModal,
  closeSignupModal,

  openProductModal,
  closeProductModal,

  openBasicModal,
  closeBasicModal,

  openProModal, 
  closeProModal
} = modalSlice.actions;

export default modalSlice.reducer;
