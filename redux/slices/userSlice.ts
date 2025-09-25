import { createSlice } from '@reduxjs/toolkit'

// Define the initial state using that type
const initialState = {
  username: "",
  email: "",
  uid: ""

}

const modalSlice = createSlice({
  name: 'modal',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    loginUser: (state, action) => {
        state.username = action.payload.username
        state.email = action.payload.email
        state.uid = action.payload.uid
    },
    logoutUser: (state) => {
        state.username = ""
        state.email = ""
        state.uid = ""
    }
  }
})

export const { loginUser, logoutUser } = modalSlice.actions

export default modalSlice.reducer