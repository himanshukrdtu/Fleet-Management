import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  liveTrips: [],
  driverTrips: [],
  selectedTrip: null,
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

    // ✅ For updating running trip path in driver's trip list
    updateLiveTripPath(state, action) {
      const { tripId, location } = action.payload;
      const trip = state.driverTrips.find(t => t._id === tripId && t.status === 'running');
      if (trip) {
        if (!trip.path) trip.path = [];
        trip.path.push(location);
      }
    },

    // ✅ For updating path inside liveTrips in manager's dashboard
    updateLiveTripPathInLiveTrips(state, action) {
      const { tripId, location } = action.payload;
      const trip = state.liveTrips.find(t => t._id === tripId && t.status === 'running');
      if (trip) {
        if (!trip.path) trip.path = [];
        trip.path.push(location);
      }
    },

    // ✅ NEW: For updating selectedTrip.path in any view (manager or driver)
    updateSelectedTripPath(state, action) {
      const { tripId, location } = action.payload;
      if (state.selectedTrip && state.selectedTrip._id === tripId) {
        if (!state.selectedTrip.path) state.selectedTrip.path = [];
        state.selectedTrip.path.push(location);
      }
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
  updateLiveTripPath,
  updateLiveTripPathInLiveTrips,
  updateSelectedTripPath, // ✅ Exported reducer for selectedTrip.path
} = tripSlice.actions;

export default tripSlice.reducer;
