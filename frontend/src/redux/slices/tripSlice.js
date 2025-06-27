import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  liveTrips: [],          // all currently running trips
  driverTrips: [],        // for logged-in driver
  selectedTrip: null,     // selected trip for detail view
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setLiveTrips(state, action) {
      state.liveTrips = action.payload;
    },
    addLiveTrip(state, action) {
      state.liveTrips.push(action.payload);
    },
    removeLiveTrip(state, action) {
      state.liveTrips = state.liveTrips.filter(trip => trip._id !== action.payload);
    },
    setDriverTrips(state, action) {
      state.driverTrips = action.payload;
    },
    setSelectedTrip(state, action) {
      state.selectedTrip = action.payload;
    },
    clearTripState(state) {
      state.liveTrips = [];
      state.driverTrips = [];
      state.selectedTrip = null;
    },
  },
});

export const {
  setLiveTrips,
  addLiveTrip,
  removeLiveTrip,
  setDriverTrips,
  setSelectedTrip,
  clearTripState,
} = tripSlice.actions;

export default tripSlice.reducer;
