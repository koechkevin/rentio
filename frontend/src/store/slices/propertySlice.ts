import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PropertyState {
  currentPropertyId: string | null;
}

const initialState: PropertyState = {
  currentPropertyId: localStorage.getItem('currentPropertyId'),
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setCurrentProperty: (state, action: PayloadAction<string>) => {
      state.currentPropertyId = action.payload;
      localStorage.setItem('currentPropertyId', action.payload);
    },
    clearCurrentProperty: (state) => {
      state.currentPropertyId = null;
      localStorage.removeItem('currentPropertyId');
    },
  },
});

export const { setCurrentProperty, clearCurrentProperty } = propertySlice.actions;
export default propertySlice.reducer;
