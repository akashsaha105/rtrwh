import { configureStore } from '@reduxjs/toolkit'
import modalslice from "./slices/modalSlice"
import userslice from "./slices/userSlice"
// ...

export const store = configureStore({
  reducer: {
    modals: modalslice,
    user: userslice
  }
})

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store