import * as i from 'icepick';
// import { createReducer } from 'redux-act';
// import * as actions from 'actions/controller-actions';
// const defaultState = {loading: true};

export default function(state = {loading: true}, action) {
  // console.log('contoller action', action);
  switch(action.type) {

    case 'INITIAL_LOAD':
      return i.set(state, 'loading', true);
      // return {...state, loading: true};
    case 'INITIAL_LOAD_COMPLETED':
      return i.set(state, 'loading', false);
    case 'TOGGLE_ADD_TO_WAITLIST':
      return i.set(state, 'addToWaitList', !state.addToWaitList);
  }

  // console.log('contoller ignored');
  return state;

}

// export default createReducer({
//   [actions.intialLoad ]: (state)=> ({...state, loading: true}),
//   [actions.intialLoadCompleted ]: (state)=> {
//     console.log('inloadin completed')
//     return ({...state, loading: false});
//   },
// },
// defaultState); // <-- This is the default state
