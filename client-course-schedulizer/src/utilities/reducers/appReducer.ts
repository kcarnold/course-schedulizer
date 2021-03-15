import { voidFn } from "utilities";
import { AppAction, AppState, ColorBy, Term } from "utilities/interfaces";
import { getClasses, getMinAndMaxTimes, getProfs, getRooms } from "utilities/services";

const DEFAULT_PAGE = 0;

/*
  Provides a function to perform multiple setState updates
  at once that depend on each other.
  Can be initialized with a callback to be performed on
  any completed action.
*/
export const reducer = (actionCallback: (item: AppState) => void = voidFn) => {
  return (state: AppState, action: AppAction): AppState => {
    let newState: AppState;
    switch (action.type) {
      case "setScheduleData": {
        let { schedule } = action.payload;
        schedule = schedule || { courses: [] };
        const times = getMinAndMaxTimes(schedule);
        newState = {
          ...state,
          classes: getClasses(schedule),
          professors: getProfs(schedule),
          rooms: getRooms(schedule),
          schedule,
          slotMaxTime: times.maxTime,
          slotMinTime: times.minTime,
        };
        break;
      }
      case "setSelectedTerm": {
        let { selectedTerm } = action.payload;
        selectedTerm = selectedTerm || Term.Fall;
        newState = { ...state, selectedTerm };
        break;
      }
      case "setFileUrl": {
        let { fileUrl } = action.payload;
        fileUrl = fileUrl || "";
        newState = { ...state, fileUrl };
        break;
      }
      case "setColorBy": {
        let { colorBy } = action.payload;
        colorBy = colorBy || ColorBy.Level;
        newState = { ...state, colorBy };
        break;
      }
      case "setSchedulizerTab": {
        let { schedulizerTab } = action.payload;
        schedulizerTab = schedulizerTab || DEFAULT_PAGE;
        newState = { ...state, schedulizerTab };
        break;
      }
      default:
        return state;
    }
    actionCallback(newState);
    return newState;
  };
};
