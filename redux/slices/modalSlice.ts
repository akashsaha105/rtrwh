import { createSlice } from '@reduxjs/toolkit'

// Define the initial state using that type
const initialState = {
  loginModalIsOpen: false,
  signupModalIsOpen: false

}

const modalSlice = createSlice({
  name: 'modal',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    openLoginModal: (state) => {
        state.loginModalIsOpen = true
    },
    closeLoginModal: (state) => {
        state.loginModalIsOpen = false
    },
    openSignupModal: (state) => {
        state.signupModalIsOpen = true
    },
    closeSignupModal: (state) => {
        state.signupModalIsOpen = false
    }
  }
})

export const { openLoginModal, closeLoginModal, openSignupModal, closeSignupModal } = modalSlice.actions

export default modalSlice.reducer