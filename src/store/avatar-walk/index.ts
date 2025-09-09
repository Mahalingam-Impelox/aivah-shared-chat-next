import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AvatarState {
  position: [number, number, number]; // Assumindo que seja uma posição 3D
  isWalking: boolean;
}

const initialState: AvatarState = {
  position: [0, 0, 0], // Substitua pelo seu valor padrão
  isWalking: false
};

const avatarSlice = createSlice({
  name: 'avatar',
  initialState,
  reducers: {
    setAvatarPosition: (state, action: PayloadAction<[number, number, number]>) => {
      state.position = action.payload;
    },
    setWalking: (state, action: PayloadAction<boolean>) => {
      state.isWalking = action.payload;
    }
  }
});

export const { setAvatarPosition, setWalking } = avatarSlice.actions;
export default avatarSlice.reducer;